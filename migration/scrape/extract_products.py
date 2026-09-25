"""
Standard products: category landings, buy/rent listings and product-detail pages.

Usage:  python migration/scrape/extract_products.py <SCRAPE_DIR>

Sources
  - scrape pages: category_by_subcategory_*, product_category_{buy,rental,rentel}_*, product_detail_*
  - local MySQL mtandt_local (read-only, optional): per-product facet ids (brand, power type, primary type,
    condition, country, application, industry) that the live listing filters use but pages don't expose.
  - Payload REST on the running dev server (read-only, optional): products slug -> id, recorded as `dbId`.

Writes
  src/content/scraped/product-categories.json   taxonomy, listings, facet vocabularies, aliases
  src/content/scraped/products.json             one entry per product-detail page
  public/legacy/product-charts/*                base64 load charts decoded to files
"""
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.request
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
from extract import PAGES, asset, clean_html, link, load, page_meta, txt, write  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHARTS = os.path.join(ROOT, "public", "legacy", "product-charts")
SCRAPE = sys.argv[1] if len(sys.argv) > 1 else "scrape"

CATEGORY_KEYS = [
    "aerial-work-platform", "material-handling-equipment", "aluminium-scaffold", "mlit",
    "temporary-road-mats", "fall-protection-lifeline-systems", "web-systems-international", "tools-and-supplies",
]
# Old camelCase footer URLs -> where the live site redirects them.
ALIASES = {
    "aerial-work-platform": "aerial-work-platform",
    "aluminium-scaffold": "aluminium-scaffold",
    "web-systems-international": "web-systems-international",
    "tools-and-supplies": "tools-and-supplies",
    "mobile-elevating-work-platform": "material-handling-equipment",
    "tactical-safety-for-access-falls": "fall-protection-lifeline-systems",
    "material-handling-equipment": "material-handling-equipment",
    "fall-protection-lifeline-systems": "fall-protection-lifeline-systems",
    "mlit": "mlit",
    "temporary-road-mats": "temporary-road-mats",
}


def key(path):
    return re.sub(r"[^A-Za-z0-9]", "_", path.strip("/"))


def index():
    return json.load(open(os.path.join(SCRAPE, "index.json"), encoding="utf8"))


def tail(url, n=2):
    parts = [p for p in (link(url.strip()) or "").split("/") if p]
    return parts[-n:]


def num(v):
    m = re.search(r"-?\d+(?:\.\d+)?", str(v or "").replace(",", ""))
    return float(m.group()) if m else None


def norm(label):
    return re.sub(r"[^a-z]", "", re.sub(r"\(.*?\)", "", label.lower()))


# ---------------------------------------------------------------- external (read-only) sources
MYSQL_JS = r"""
import mysql from "mysql2/promise";
const c = await mysql.createConnection({ host: "127.0.0.1", user: "root", database: "mtandt_local" });
const [p] = await c.query(`select id, slug, catType, categoryId, subcategoryId, brand_manf, power_type, primary_type,
  new, used, applications, industries, location, availability_w, year_of_manufacturing, working_height,
  platform_height, machine_weight, stowed_dimensions, mhe_maxliftingcapacity, mhe_maxliftingheight, max_no_of_person
  from products where status = 0`);
const [cats] = await c.query("select id, name, slug, parentId from categories");
const [prim] = await c.query("select id, name, subCatId, parentId from primarytypes");
console.log(JSON.stringify({ products: p, categories: cats, primary: prim }));
await c.end();
"""


def mysql_data():
    try:
        out = subprocess.run(["node", "--input-type=module", "-e", MYSQL_JS], cwd=ROOT, capture_output=True,
                             text=True, encoding="utf8", timeout=60)
        if out.returncode:
            raise RuntimeError(out.stderr[:300])
        return json.loads(out.stdout)
    except Exception as e:  # MySQL is optional
        print("mysql unavailable:", e)
        return {"products": [], "categories": [], "primary": []}


def db_products():
    try:
        with urllib.request.urlopen("http://localhost:3000/api/products?limit=1000&depth=0", timeout=90) as r:
            return {d["slug"]: d["id"] for d in json.load(r)["docs"] if d.get("slug")}
    except Exception as e:
        print("payload api unavailable:", e)
        return {}


def ids(v):
    try:
        x = json.loads(v) if isinstance(v, str) else v
    except Exception:
        return []
    if isinstance(x, (int, str)):
        x = [x]
    return [str(i).strip() for i in (x or []) if str(i).strip() not in ("", "null", "0")]


# ---------------------------------------------------------------- categories
def extract_category(slug):
    s = load(f"category_by_subcategory_{key(slug)}")
    if not s:
        return None
    wrap = s.select_one(".container-fuild")
    h1 = s.select_one("h1.subcategoryhedding") or s.find("h1")
    intro = h1.find_next("p") if h1 else None
    tc = s.select_one(".tabing_category")
    names = [txt(a) for a in tc.select(".sub-category_header a")]
    subs = []
    for i, pane in enumerate(tc.select(".tab-content > .tab-pane")):
        gos = [re.search(r"'(.*?)'", d["onclick"]).group(1) for d in pane.select("[onclick^=gotootherpage]")]
        sub_slug = tail(gos[-1])[-1] if gos else f"tab-{i}"
        btn = pane.select_one(".category_btn")
        button = None
        if btn:
            a = btn.select_one("a[href]")
            if a:
                button = {"label": txt(a) or "View", "href": link(a["href"])}
            else:
                button = {"label": txt(btn) or "View Models", "choose": True}
        faqs = []
        acc = pane.select_one(".accordion")
        if acc:
            for it in acc.select(".accordion__item"):
                q = it.select_one(".accordion__caption")
                a = it.select_one(".accordion__content")
                faqs.append({"q": txt(q), "a": clean_html(a.decode_contents() if a else "")})
            acc.decompose()
        for x in pane.select(".row, .modal"):
            x.decompose()
        for d in pane.find_all("div", recursive=False):
            if txt(d):
                d.name = "p"
            else:
                d.decompose()
        html = clean_html(pane.decode_contents())
        html = re.sub(r"(<br/>\s*)+$", "", html)
        subs.append({
            "slug": sub_slug,
            "name": names[i] if i < len(names) else sub_slug,
            "html": html,
            "button": button,
            "faqs": faqs,
        })
    return {
        "slug": slug,
        "title": txt(h1),
        "intro": txt(intro),
        "crumb": txt(wrap.select("li")[-1]) if wrap and wrap.select("li") else txt(h1),
        "meta": {k: v for k, v in page_meta(f"category_by_subcategory_{key(slug)}").items() if k in ("title", "description", "keywords")},
        "subcategories": subs,
    }


# ---------------------------------------------------------------- listings
FACET_INPUTS = {
    "productTypeCondition": "condition",
    "contures": "country",
    "primarytypedata": "primaryType",
    "powerTypescheck": "powerType",
    "applicationtypes": "application",
    "industrietype": "industry",
    "productbrand": "brand",
}


def extract_listing(mode, cat, sub, vocab):
    for variant in ([mode] if mode == "buy" else ["rental", "rentel"]):
        k = f"product_category_{variant}_{key(cat)}_{key(sub)}"
        s = load(k)
        if s:
            break
    else:
        return None
    h1 = s.select_one("h1.buy_pro_name")
    desc = s.select_one(".buy_pro_namedis")
    cols = []
    rows = {}
    for r in s.select(".mtandt_product_listing"):
        a = r.select_one("h3 a[href]")
        cells = [[txt(td) for td in tr.select("td")] for tr in r.select("table tr")]
        cells = [c for c in cells if len(c) == 2]
        if a:
            rows[tail(a["href"], 1)[0]] = cells
        if len(cells) > len(cols):
            cols = [c[0] for c in cells]
    for w in s.select(".fliter_section .widget"):
        for i in w.select("input[name]"):
            group = FACET_INPUTS.get(i["name"])
            label = txt(i.parent)
            if group and i.get("value", "").strip() and label:
                vocab[group][i["value"].strip()] = label
    sorts = []
    for o in s.select("#sortby option"):
        if "d-none" in (o.get("class") or []):
            continue
        sorts.append({"label": re.sub(r"\s+", " ", txt(o)).strip().title().replace("(Desc)", "(DESC)").replace("(Asc)", "(ASC)"),
                      "field": o.get("value"), "dir": (o.get("data-orderby") or "DESC").lower()})
    meta = {kk: v for kk, v in page_meta(k).items() if kk in ("title", "description", "keywords")}
    return {"title": txt(h1), "description": txt(desc), "columns": cols, "sorts": sorts, "meta": meta, "_rows": rows}


# ---------------------------------------------------------------- products
def save_chart(src):
    m = re.match(r"data:image/(\w+);base64,(.+)", src or "", re.S)
    if not m:
        return asset(src) if src else None
    ext = "jpg" if m.group(1) in ("jpeg", "jpg") else m.group(1)
    data = base64.b64decode(m.group(2))
    name = hashlib.sha1(data).hexdigest()[:16] + "." + ext
    os.makedirs(CHARTS, exist_ok=True)
    out = os.path.join(CHARTS, name)
    if not os.path.exists(out):
        open(out, "wb").write(data)
    return f"/legacy/product-charts/{name}"


LEGACY_SRC = os.path.abspath(os.path.join(ROOT, "..", "website", "public"))
TIF_JS = r"""
import sharp from "sharp";
const [src, out] = process.argv.slice(1);
await sharp(src, { limitInputPixels: false, unlimited: true, failOn: "none" }).resize({ width: 1600, withoutEnlargement: true })
  .flatten({ background: "#ffffff" }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
"""


def web_image(url):
    """Browsers can't show TIFF: point at a .jpg sibling generated with sharp."""
    if not url or not re.search(r"\.tiff?$", url, re.I):
        return url
    rel = url[len("/legacy/"):]
    jpg_rel = re.sub(r"\.tiff?$", ".jpg", rel, flags=re.I)
    out = os.path.join(ROOT, "public", "legacy", jpg_rel)
    if not os.path.exists(out):
        src = os.path.join(LEGACY_SRC, rel)
        if not os.path.exists(src):
            print("tif source missing:", src)
            return None
        os.makedirs(os.path.dirname(out), exist_ok=True)
        r = subprocess.run(["node", "--input-type=module", "-e", TIF_JS, src, out], cwd=ROOT, capture_output=True, text=True)
        if r.returncode:
            print("tif convert failed:", r.stderr[:300])
            return None
    copied = os.path.join(ROOT, "public", "legacy", rel)
    if os.path.exists(copied):
        os.remove(copied)
    return "/legacy/" + jpg_rel


def pane_html(pg, pid):
    el = pg.select_one(f"#{pid}")
    if not el:
        return ""
    html = clean_html(el.decode_contents())
    return "" if re.sub(r"<[^>]+>", "", html).strip().upper() in ("", "NA", "N/A") else html


def extract_product(p):
    s = load(p["key"])
    if not s:
        return None
    crumbs = s.select(".container-fuild li")
    mode = "rent" if len(crumbs) > 1 and txt(crumbs[1]).lower().startswith("rent") else "buy"
    cat_a = crumbs[2].find("a") if len(crumbs) > 2 else None
    sub_a = crumbs[3].find("a") if len(crumbs) > 3 else None
    cat = tail(cat_a["href"], 1)[0] if cat_a and cat_a.get("href") else None
    sub = tail(sub_a["href"], 1)[0] if sub_a and sub_a.get("href") else None
    pg = s.select_one(".product-page")
    h1 = pg.select_one("h1")
    model_p = h1.find_next("p") if h1 else None
    model = re.sub(r"^Model No\s*:\s*", "", txt(model_p)) if model_p and "Model No" in txt(model_p) else ""
    main = pg.select_one(".xzoom-container img")
    main_src = web_image(asset(main.get("xoriginal") or main.get("src"))) if main else None
    thumbs = [web_image(asset(i.get("xpreview") or i.get("src"))) for i in pg.select(".slider-nav-vertical img")]
    gallery = list(dict.fromkeys(t for t in thumbs if t)) or ([main_src] if main_src else [])
    desc = pg.select_one(".mtandt_singleproduct")
    specs = []
    for tr in pg.select("#additionalInfo tr"):
        th, td = tr.find("th"), tr.find("td")
        if th and td and txt(th):
            specs.append([txt(th), txt(td)])
    apps = []
    for tr in pg.select("#description tr"):
        tds = tr.find_all("td")
        if len(tds) >= 2 and txt(tds[1]):
            apps.append(txt(tds[1]))
    dl = pg.select_one("a.detalis_tab[href$='.pdf'], a[download][href]")
    charts = [save_chart(i.get("src")) for i in pg.select("#Chart img") if i.get("src")]
    related = []
    for a in s.select("h3 a[href*='/product-detail/']"):
        r = tail(a["href"], 1)[0]
        if r not in related and r != p["path"].split("/")[-1]:
            related.append(r)
    enq = pg.select_one("#openEnquireForm")
    return {
        "slug": p["path"].split("/")[-1],
        "legacyId": int(enq["data-id"]) if enq and enq.get("data-id", "").isdigit() else None,
        "title": txt(h1),
        "model": model,
        "mode": mode,
        "category": cat,
        "subcategory": sub,
        "image": main_src,
        "gallery": gallery,
        "descriptionHtml": clean_html(desc.decode_contents()) if desc else "",
        "specs": specs,
        "featuresHtml": pane_html(pg, "review"),
        "optionsHtml": pane_html(pg, "Options"),
        "applications": apps,
        "download": asset(dl["href"]) if dl and dl.get("href", "").lower().endswith(".pdf") else None,
        "charts": [c for c in charts if c],
        "related": related,
        "meta": {k: v for k, v in page_meta(p["key"]).items() if k in ("title", "description", "keywords")},
    }


def spec_value(specs, label):
    n = norm(label)
    for k, v in specs:
        if norm(k) == n:
            return v
    for k, v in specs:
        if norm(k).startswith(n) or n.startswith(norm(k)):
            return v
    return ""


# ---------------------------------------------------------------- main
def main():
    idx = index()
    my = mysql_data()
    mrow = {r["slug"]: r for r in my["products"]}
    db = db_products()

    categories = [c for c in (extract_category(k) for k in CATEGORY_KEYS) if c]
    cat_names = {c["slug"]: c["title"] for c in categories}
    sub_names = {(c["slug"], sc["slug"]): sc["name"] for c in categories for sc in c["subcategories"]}

    products = []
    for p in idx:
        if p["path"].startswith("/product-detail/") and p.get("status") == 200:
            x = extract_product(p)
            if x and x["title"]:
                products.append(x)
    products.sort(key=lambda x: x["slug"])

    vocab = defaultdict(dict)
    listings = {}
    wanted = {(m, c["slug"], sc["slug"]) for c in categories for sc in c["subcategories"] for m in ("buy", "rental")}
    wanted |= {("buy" if x["mode"] == "buy" else "rental", x["category"], x["subcategory"]) for x in products if x["category"]}
    rows_by_slug = {}
    for mode, cat, sub in sorted(wanted):
        li = extract_listing(mode, cat, sub, vocab)
        members = [x for x in products if x["category"] == cat and x["subcategory"] == sub
                   and (x["mode"] == "buy") == (mode == "buy")]
        if not li and not members:
            continue
        li = li or {"title": sub_names.get((cat, sub), sub.replace("-", " ").title()), "description": "", "columns": [],
                    "sorts": [], "meta": {}, "_rows": {}}
        if not li["columns"]:
            li["columns"] = ["Model No", "Working Height", "Platform Height"]
        if not li["sorts"]:
            li["sorts"] = [{"label": "Working Height (DESC)", "field": "working_height", "dir": "desc"},
                           {"label": "Working Height (ASC)", "field": "working_height", "dir": "asc"}]
        for x in members:
            rows_by_slug.setdefault(x["slug"], li["_rows"].get(x["slug"]) or
                                    [[c, spec_value(x["specs"], c)] for c in li["columns"]])
        del li["_rows"]
        li["products"] = [x["slug"] for x in members]
        listings[f"{mode}/{cat}/{sub}"] = li

    # primary type names come from the listing sidebars; fall back to MySQL
    for r in my["primary"]:
        vocab["primaryType"].setdefault(str(r["id"]), r["name"])
    vocab["condition"] = {"new": "New", "used": "Used"}

    matched = 0
    for x in products:
        r = mrow.get(x["slug"])
        x["dbId"] = db.get(x["slug"])
        x["row"] = [[k, v] for k, v in rows_by_slug.get(x["slug"], []) if v]
        f = {}
        if r:
            matched += 1
            cond = [c for c, on in (("new", r.get("new")), ("used", r.get("used"))) if on]
            f = {
                "condition": cond,
                "country": ids(r.get("location")),
                "primaryType": ids(r.get("primary_type")),
                "powerType": ids(r.get("power_type")),
                "application": ids(r.get("applications")),
                "industry": ids(r.get("industries")),
                "brand": ids(r.get("brand_manf")),
            }
            f = {k: [i for i in v if k == "condition" or i in vocab.get(k, {})] for k, v in f.items()}
        if not f.get("powerType"):
            pt = spec_value(x["specs"], "Power Type").lower()
            f["powerType"] = [i for i, n in vocab["powerType"].items() if n.strip().lower() and n.strip().lower() in pt]
        x["facets"] = {k: v for k, v in f.items() if v}
        x["num"] = {
            "working_height": num(spec_value(x["specs"], "Working Height")) or num(r and r.get("working_height")),
            "machine_weight": num(spec_value(x["specs"], "Machine Weight")) or num(r and r.get("machine_weight")),
            "stowed_dimensions": num(spec_value(x["specs"], "Stowed Dimensions")) or num(r and r.get("stowed_dimensions")),
            "mhe_maxliftingcapacity": num(spec_value(x["specs"], "Max Lifting Capacity")) or num(r and r.get("mhe_maxliftingcapacity")),
            "mhe_maxliftingheight": num(spec_value(x["specs"], "Max Lifting Height")) or num(r and r.get("mhe_maxliftingheight")),
        }
        x["num"] = {k: v for k, v in x["num"].items() if v}
        x["categoryName"] = cat_names.get(x["category"], "")
        x["subcategoryName"] = sub_names.get((x["category"], x["subcategory"]), "")

    have = {x["slug"] for x in products}
    for x in products:
        x["related"] = [r for r in x["related"] if r in have][:12]

    write("product-categories", {
        "categories": categories,
        "aliases": ALIASES,
        "listings": listings,
        "facets": {k: dict(sorted(v.items(), key=lambda kv: int(kv[0]) if kv[0].isdigit() else 0)) for k, v in vocab.items()},
    })
    write("products", products)
    size = os.path.getsize(os.path.join(ROOT, "src", "content", "scraped", "products.json"))
    in_db = sum(1 for x in products if x["dbId"])
    print(f"products: {len(products)} scraped, {matched} matched in MySQL, {in_db} matched in Payload DB "
          f"(of {len(db)} DB products); {len(listings)} listings; products.json {size / 1e6:.2f} MB")
    unmatched_db = sorted(set(db) - have)
    print("DB slugs without a scraped product-detail page:", len(unmatched_db), unmatched_db[:40])


if __name__ == "__main__":
    main()

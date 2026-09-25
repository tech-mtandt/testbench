"""
Custom product landing pages, industries and case studies from the live-site crawl.

Usage:  python migration/scrape/extract_custom.py <SCRAPE_DIR>
Writes: src/content/scraped/custom-products.json, industries.json, case-studies.json
"""
import json
import os
import re
import sys

from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(__file__))
from extract import PAGES, SCRAPE, asset, clean_html, link, load, page_meta, txt, write  # noqa: E402

# Live 301s / aliases: category segment -> canonical category for the same product.
CATEGORY_ALIASES = {
    "tactical-safety-for-access-falls": "fall-protection-lifeline-systems",
    "ground-protection-mats": "temporary-road-mats",
}


def index():
    return json.load(open(os.path.join(SCRAPE, "index.json"), encoding="utf8"))


def style_map(key):
    """page_speed_* class -> inline css (the legacy optimiser hoists inline styles into classes)."""
    raw = open(os.path.join(PAGES, f"{key}.html"), encoding="utf8").read()
    return {m.group(1): m.group(2) for m in re.finditer(r"\.(page_speed_\d+)\s*\{([^}]*)\}", raw)}


def rich(el):
    """clean_html, but keep the paragraph breaks the legacy editor expresses as <div>s."""
    if el is None:
        return ""
    el = BeautifulSoup(str(el), "lxml")
    for d in el.find_all("div"):
        if not d.find(["div", "p", "ul", "ol", "table"]):
            d.name = "p"
    html = clean_html(el.body or el)
    html = re.sub(r"<p>\s*(<br/?>\s*)*</p>", "", html)
    return re.sub(r"(<br/?>\s*)+</p>", "</p>", html)


def class_bg(el, styles):
    for c in el.get("class") or []:
        m = re.search(r"url\(['\"]?([^'\")]+)", styles.get(c, ""))
        if m:
            return asset(m.group(1))
    return None


def valid_img(u):
    return bool(u) and not u.rstrip("/").endswith("/imageFile") and "unsplash.it" not in u


def uniq(xs):
    return list(dict.fromkeys(x for x in xs if x))


def breadcrumb_category(s):
    lis = s.select("div.container-fuild li")
    if len(lis) >= 4:
        a = lis[2].find("a")
        return txt(lis[2]) or None, (link(a["href"].strip()) if a and a.get("href") else None)
    return None, None


def clients(s):
    box = s.select_one("body > div.brands-content")
    if not box:
        return []
    imgs = box.select(".slick-slide:not(.slick-cloned) img") or box.select("img")
    return uniq(asset(i.get("src")) for i in imgs if valid_img(i.get("src")))


# ---------------------------------------------------------------- custom products
def product(key):
    s = load(key)
    meta = page_meta(key)
    tabs = s.select_one("section.custom_pages_tabs")
    hero = s.select_one("section.coustom_mtnt_images_fix img")

    specs = []
    for tr in tabs.select("#description1 tr"):
        cells = [txt(td) for td in tr.find_all(["td", "th"])]
        if any(cells):
            specs.append(cells[:2] if len(cells) > 1 else [cells[0], ""])
    dl = tabs.select_one("a.download_detalis_tab")

    wp = s.select_one("section.work_process")
    journey = []
    for box in wp.select(".categories_custom") if wp else []:
        a = box.find("a")
        num = box.find("span", recursive=False)
        title = txt(a)
        if a:
            a.decompose()
        if num:
            num.decompose()
        journey.append({"title": title, "html": rich(box)})
    btn = wp.select_one("#coustomeEnqueryForm") if wp else None

    gallery = None
    for sec in s.select("section.tabapplication"):
        if "d-none" in (sec.get("class") or []):
            continue
        filters = []
        for sp in sec.select("#filters span"):
            m = re.search(r"showGallery\('([^']*)'\)", sp.get("onclick", ""))
            fid = m.group(1) if m else txt(sp)
            if fid != "all" and txt(sp):
                filters.append({"id": fid, "label": txt(sp)})
        items = []
        for a in sec.select("#gallery .gallery-item"):
            img = a.find("img")
            if not img or not valid_img(img.get("src")):
                continue
            cats = [c[7:] for c in a.get("class", []) if c.startswith("gallery") and c not in ("gallery-item", "gallery-item-data")]
            items.append({"image": asset(img["src"]), "title": txt(a.find("h2")), "caption": txt(a.find("p")),
                          "filters": cats})
        used = {c for i in items for c in i["filters"]}
        gallery = {"filters": [f for f in filters if f["id"] in used], "items": items}

    related = []
    for sec in s.select("body > section[class*=page_speed_]"):
        if "Related" not in txt(sec.find("h2")):
            continue
        for art in sec.select("article"):
            img, a = art.find("img"), art.select_one("h3 a")
            if a:
                related.append({"title": txt(a), "href": link(a["href"]),
                                "image": asset(img.get("src")) if img else None})

    cat_label, cat_href = breadcrumb_category(s)
    return {
        "title": txt(tabs.find("h1")),
        "productId": btn.get("product-id") if btn else None,
        "meta": {k: meta.get(k) for k in ("title", "description", "keywords")},
        "crumb": {"label": cat_label, "href": cat_href},
        "hero": asset(hero.get("src")) if hero and valid_img(hero.get("src")) else None,
        "intro": rich(tabs.select_one(".custom_content")),
        "specs": specs,
        "features": rich(tabs.select_one("#additionalInfo")),
        "benefits": rich(tabs.select_one("#review")),
        "download": asset(dl["href"]) if dl and dl.get("href") else None,
        "journey": journey,
        "gallery": gallery if gallery and gallery["items"] else None,
        "related": related,
        "clients": clients(s),
    }


def extract_custom_products():
    out = {"buy": {}, "rental": {}}
    pages = []
    for p in index():
        m = re.match(r"^/custom-product-detail-(buy|rental)/([^/]+)/([^/]+)$", p["path"])
        if m and p["status"] == 200 and os.path.exists(os.path.join(PAGES, f"{p['key']}.html")):
            pages.append((m.group(2) in CATEGORY_ALIASES, m.groups(), p))
    # Canonical-category pages first; aliases only fill products never scraped canonically.
    for _, (kind, cat, slug), p in sorted(pages, key=lambda x: x[0]):
        cat = CATEGORY_ALIASES.get(cat, cat)
        if slug in out[kind]:
            continue
        item = product(p["key"])
        item["category"] = cat
        out[kind][slug] = item
    out["aliases"] = CATEGORY_ALIASES
    write("custom-products", out)


# ---------------------------------------------------------------- industries
ICONS = {"fa-subway": "train", "fa-parking": "parking", "fa-car": "car", "fa-lightbulb": "bulb",
         "fa-university": "building", "fa-landmark": "building", "fa-warehouse": "warehouse",
         "fa-calendar-check": "calendar", "fa-wheelchair": "wheelchair"}


def cards(sec):
    out = []
    for blk in sec.select(".service-block, .inner-box") if sec else []:
        a = blk.select_one("a[href*='/casestudy/']")
        if not a or blk.find_parent(class_="service-block") and "inner-box" in blk.get("class", []):
            continue
        img = blk.find("img")
        out.append({"title": txt(blk.find("h3")), "text": txt(blk.select_one(".text, p, span")),
                    "href": link(a["href"]), "image": asset(img.get("src")) if img else None})
    seen = set()
    return [c for c in out if not (c["href"] in seen or seen.add(c["href"]))]


def extract_industries():
    out = {"index": [], "items": {}}
    s = load("industries")
    if s:
        for a in s.select("section.Industries_mtandt a[href]"):
            i = a.select_one(".icon-wrapper i")
            icon = next((ICONS[c] for c in (i.get("class") or []) if c in ICONS), None) if i else None
            out["index"].append({"title": txt(a.find("h3")), "text": txt(a.find("p")),
                                 "href": link(a["href"]), "icon": icon,
                                 "iconClass": " ".join(i.get("class") or []) if i else None})
    for p in index():
        m = re.match(r"^/industries/([^/]+)$", p["path"])
        if not m or p["status"] != 200:
            continue
        s = load(p["key"])
        styles = style_map(p["key"])
        head = s.select_one("section.sub_header_title")
        body = s.select_one("section.section_all")
        h4 = body.find("h4")
        intro_box = h4.parent if h4 else None
        paras = "".join(str(x) for x in intro_box.find_all("p")) if intro_box else ""
        imgs = []
        for img in body.select("img"):
            if img.find_parent(class_="modal") or img.find_parent("ul") or img.find_parent(class_="brands-content"):
                continue
            if img.find_parent("a", href=re.compile("/casestudy/")):
                continue
            if valid_img(img.get("src")):
                imgs.append(asset(img["src"]))
        gallery = []
        for li in body.select("ul li"):
            img = li.find("img")
            if img and valid_img(img.get("src")):
                gallery.append({"image": asset(img["src"]), "title": txt(li.find("h2"))})
        studies = []
        for h3 in body.select("h3"):
            a = h3.find("a", href=re.compile("/casestudy/"))
            if not a:
                continue
            box = h3.parent
            while box and not box.find("img"):
                box = box.parent
            img = box.find("img") if box else None
            text_el = h3.find_next_sibling() or h3.find_next(["p", "span"])
            studies.append({"title": txt(a), "href": link(a["href"]), "text": txt(text_el),
                            "image": asset(img.get("src")) if img else None})
        out["items"][m.group(1)] = {
            "title": txt(head.find("h2")) if head else "",
            "banner": class_bg(head, styles) if head else None,
            "heading": txt(h4),
            "html": clean_html(paras),
            "images": uniq(imgs),
            "gallery": gallery,
            "caseStudies": studies,
            "clients": uniq(asset(i.get("src")) for i in body.select(".brands-content img, .client_logo img")
                            if valid_img(i.get("src"))),
        }
    write("industries", out)


# ---------------------------------------------------------------- case studies
def extract_case_studies():
    out = {}
    for p in index():
        m = re.match(r"^/casestudy/([^/]+)$", p["path"])
        if not m or p["status"] != 200:
            continue
        s = load(p["key"])
        styles = style_map(p["key"])
        head = s.select_one("section.sub_header_title")
        inner = s.select_one("section.casestudyinner")
        blocks = []
        for box in inner.select(".casestudyinner__info .casestudyinner__info-top"):
            h = box.find("h4")
            title = txt(h)
            h.decompose()
            blocks.append({"title": title, "html": clean_html(box)})
        details = [[txt(td).rstrip(":").strip() for td in tr.find_all("td")[:2]]
                   for tr in inner.select(".case_studey tr")]
        dl = inner.select_one(".casestudyinner__btn-area a[href]")
        gal = s.select_one("section.bg-light")
        gallery = uniq(asset(i.get("src")) for i in (gal.select("img") if gal else []) if valid_img(i.get("src")))
        related = []
        for blk in s.select("section.service-section .service-block"):
            a = blk.select_one(".studey_btn a[href], .image a[href]")
            img = blk.find("img")
            related.append({"title": txt(blk.find("h3")), "text": txt(blk.select_one(".text")),
                            "href": link(a["href"]) if a else None,
                            "image": asset(img.get("src")) if img and valid_img(img.get("src")) else None})
        out[m.group(1)] = {
            "title": txt(head.find("h2")) if head else "",
            "banner": class_bg(head, styles) if head else None,
            "blocks": blocks,
            "details": [d for d in details if d and d[0]],
            "download": asset(dl["href"]) if dl else None,
            "gallery": gallery,
            "related": related,
        }
    write("case-studies", out)


if __name__ == "__main__":
    extract_custom_products()
    extract_industries()
    extract_case_studies()

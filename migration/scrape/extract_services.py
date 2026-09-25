"""
Services, career, annual returns and legal pages -> src/content/scraped/*.json

Usage:  python migration/scrape/extract_services.py <SCRAPE_DIR>
"""
import os
import re
import shutil
import sys
import urllib.request
from urllib.parse import quote

from bs4 import BeautifulSoup, Tag

sys.path.insert(0, os.path.dirname(__file__))
from extract import load, txt, asset, link, clean_html, write, page_meta, PAGES, ORIGIN  # noqa: E402


def fix_asset(u):
    """asset() plus: the live site links some files under /public/... (404 there) and service
    brochures under /imageFile/ (404) while they really live in /service_brochure/."""
    a = asset(u)
    if not a:
        return a
    a = re.sub(r"^/legacy/public/", "/legacy/", a)
    m = re.match(r"^/legacy/imageFile/(\d+\.pdf)$", a)
    if m:
        a = "/legacy/service_brochure/" + m.group(1)
    # legacy uploads saved without the dot ("16831117711jpg") are served as octet-stream,
    # which browsers refuse to render; publish them under a proper extension.
    m = re.match(r"^/legacy/(.+/\d+)(jpe?g|png|webp|gif)$", a)
    if m:
        fixed = f"/legacy/{m.group(1)}.{m.group(2)}"
        materialise(fixed, a[len("/legacy/"):])
        a = fixed
    return a


def fix_html(html):
    html = re.sub(r'src="/legacy/public/', 'src="/legacy/', html)
    return html


def meta(key):
    m = page_meta(key)
    return {"title": (m.get("title") or "").replace("�", "-"), "description": (m.get("description") or "").replace("�", "-")}


def css_bg(s, el):
    """Background image set either inline or via a page_speed_* class rule in a <style> block."""
    if el is None:
        return None
    m = re.search(r"url\(['\"]?([^'\")]+)", el.get("style", ""))
    if m:
        return fix_asset(m.group(1))
    raw = open(os.path.join(PAGES, f"{s}.html"), encoding="utf8").read()
    for c in el.get("class") or []:
        if c.startswith("page_speed_"):
            m = re.search(re.escape(c) + r"\s*\{[^}]*url\(['\"]?([^'\")]+)", raw)
            if m:
                return fix_asset(m.group(1))
    return None


def crumbs(s):
    out = []
    for li in s.select(".breadcrumb li"):
        a = li.find("a")
        href = link(a["href"]) if a and a.get("href") else None
        out.append({"label": txt(li), "href": href if href and href not in ("#",) else None})
    return out[1:]  # drop Home (Breadcrumbs adds it)


def siblings_html(start):
    parts = []
    for n in start.next_siblings:
        parts.append(str(n))
    return "".join(parts)


# ---------------------------------------------------------------- services
def detail(key, s):
    sec = s.select_one("section.section_all")
    head = sec.select_one(".about_header_main")
    h3, h4 = head.find("h3"), head.find("h4")
    body = clean_html(BeautifulSoup(siblings_html(h4 or h3), "lxml"))
    img = sec.select_one(".img_about img")
    dl = sec.select_one("a.download_detalis_tab")
    feats = []
    for box in sec.select(".about_content_box_all"):
        i = box.select_one(".about_icon i")
        h5 = box.find("h5")
        rest = "".join(str(x) for x in h5.next_siblings) if h5 else ""
        feats.append({
            "icon": " ".join(i.get("class", [])) if i else None,
            "title": txt(h5),
            "html": clean_html(BeautifulSoup(rest, "lxml")) if rest.strip() else "",
        })
    cta = sec.select_one(".studey_btn")
    cta_d = None
    if cta and (txt(cta) or cta.find("a")):
        a = cta.find("a")
        cta_d = {"text": txt(cta.find("h6")), "label": txt(a), "href": link(a.get("href")) if a else None}
        if not cta_d["label"]:
            cta_d = None
    banner = s.select_one("section.sub_header_title")
    return {
        "kind": "detail",
        "meta": meta(key),
        "crumbs": crumbs(s),
        "bannerTitle": txt(banner.find("h1")) if banner else "",
        "banner": css_bg(key, banner),
        "heading": txt(h3),
        "subheading": txt(h4),
        "html": fix_html(body),
        "image": fix_asset(img.get("src")) if img else None,
        "brochure": fix_asset(dl.get("href")) if dl else None,
        "features": feats,
        "cta": cta_d,
    }


def hub(key, s):
    about = s.select_one("section.mtnadt_about")
    imgs = about.find_all("img")
    p = about.find("p")
    out = {
        "kind": "hub",
        "meta": meta(key),
        "logo": {"src": fix_asset(imgs[0].get("src")), "alt": imgs[0].get("alt", "")} if imgs else None,
        "tagline": txt(about.find("h2")),
        "aboutTitle": txt(about.find("h1")),
        "aboutHtml": clean_html(p),
        "aboutImage": {"src": fix_asset(imgs[-1].get("src")), "alt": imgs[-1].get("alt", "")} if len(imgs) > 1 else None,
    }
    sw = s.select_one("section.strategic-wrapper")
    intro = sw.find("h2").find_next_sibling()
    intro_t = txt(BeautifulSoup(txt(intro), "lxml")) if intro is not None and not intro.find("img") else ""
    items = []
    for h5 in sw.find_all("h5"):
        card = h5
        while card.parent and not card.parent.find("img"):
            card = card.parent
        card = card.parent
        img = card.find("img")
        a = card.find("a")
        p = h5.find_next("p")
        items.append({
            "title": txt(h5),
            "text": txt(p),
            "href": link(a.get("href")) if a else None,
            "image": fix_asset(img.get("src")) if img else None,
            "alt": img.get("alt", "") if img else "",
        })
    out["services"] = {"title": txt(sw.find("h2")), "intro": intro_t, "items": items}

    nav = s.select_one("section.service-navigator")
    h2 = nav.find("h2")
    ps = nav.find_all("p")
    h5s = nav.find_all("h5")
    if h5s:
        why_items = [{"title": txt(h), "text": txt(h.find_next("p"))} for h in h5s]
        why_intro = txt(ps[0]) if ps and ps[0] is not h5s[0].find_next("p") else ""
    else:
        why_items = [{"title": "", "text": txt(p)} for p in ps]
        why_intro = ""
    out["why"] = {"title": txt(h2), "intro": why_intro, "items": why_items}

    sup = s.select_one("section.heading")
    if sup:
        img = sup.find("img")
        out["supported"] = {
            "title": txt(sup.find("h2")),
            "intro": txt(sup.find("p")),
            "image": {"src": fix_asset(img.get("src")), "alt": img.get("alt", "")} if img else None,
            "html": clean_html(sup.find("ul")),
        }
    dl = s.select_one("a.download_detalis_tab")
    out["brochure"] = fix_asset(dl.get("href")) if dl else None
    return out


def extract_services():
    idx = load("services")
    items = []
    for it in idx.select(".fg_services_item"):
        a = it.find("a")
        items.append({
            "slug": link(a["href"]).split("/")[-1],
            "title": txt(it.find("h4")),
            "excerpt": txt(it.find("p")),
            "button": txt(a),
            "image": css_bg("services", it),
        })
    banner = idx.select_one("section.sub_header_title")
    write("services-index", {"meta": meta("services"), "banner": css_bg("services", banner), "items": items})

    pages = {}
    for f in sorted(os.listdir(PAGES)):
        if not (f.startswith("services_") and f.endswith(".html")):
            continue
        key = f[:-5]
        s = load(key)
        slug = key[9:].replace("_", "-")
        pages[slug] = hub(key, s) if s.select_one("section.mtnadt_about") else detail(key, s)
    write("services", pages)


# ---------------------------------------------------------------- career
def extract_career():
    s = load("career")
    why = s.select_one("section.why-mdant")
    h2 = why.find("h2")
    tagline = ""
    for n in h2.next_elements:
        if isinstance(n, str) and n.strip() and n.parent is not h2:
            tagline = txt(n)
            break
    paras = [clean_html(p) for p in why.find_all("p")]
    imgs = [fix_asset(i.get("src")) for i in why.find_all("img")]
    jobs = []
    for d in s.select("section.career_pages details"):
        body = d.find("div")
        for b in body.find_all("button"):
            b.decompose()
        jobs.append({"title": txt(d.find("summary")), "html": clean_html(body)})
    form = s.select_one("#survey-form")
    fa = [txt(o) for o in form.select("select[name=functional_area] option")]
    edu = [txt(l) for l in form.select("label.row-input")]
    write("career", {
        "meta": meta("career"),
        "banner": css_bg("career", s.select_one("section.sub_header_title")),
        "title": txt(s.select_one("section.sub_header_title h1")) or "Careers",
        "heading": txt(h2),
        "tagline": tagline,
        "html": "".join(paras),
        "images": imgs,
        "jobs": jobs,
        "form": {
            "title": txt(s.select_one("#survey-container h3")),
            "subtitle": txt(s.select_one("#subdescription2")),
            "functionalAreas": fa,
            "education": edu,
        },
    })


# ---------------------------------------------------------------- annual returns
def extract_annual():
    s = load("annual_returns")
    banner = s.select_one("section.sub_header_title")
    box = banner.find_next_sibling()
    labels = [txt(l) for l in box.find_all("label")]
    tabs = []
    containers = box.select(".tab__content")
    for i, c in enumerate(containers):
        groups = []
        for h5 in c.find_all("h5", recursive=False):
            ul = h5.find_next_sibling("ul")
            groups.append({
                "title": txt(h5),
                "docs": [{"label": txt(a), "href": fix_asset(a.get("href"))} for a in (ul.find_all("a") if ul else [])],
            })
        tabs.append({"label": labels[i] if i < len(labels) else f"Tab {i + 1}", "groups": groups})
    for t in tabs:
        for g in t["groups"]:
            for d in g["docs"]:
                materialise(d["href"])
                d["href"] = quote(d["href"])
    write("annual-returns", {"meta": meta("annual_returns"), "banner": css_bg("annual_returns", banner), "tabs": tabs})


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LEGACY = os.path.abspath(os.path.join(ROOT, "..", "website", "public"))
MAX_PDF = 15 * 1024 * 1024


def materialise(href, src_rel=None):
    """Copy an asset into public/legacy for cases copy-assets.mjs can't handle (spaces, renames)."""
    rel = href[len("/legacy/"):]
    out = os.path.join(ROOT, "public", "legacy", rel)
    if os.path.exists(out):
        return
    os.makedirs(os.path.dirname(out), exist_ok=True)
    rel = src_rel or rel
    src = os.path.join(LEGACY, rel)
    if os.path.exists(src):
        shutil.copyfile(src, out)
        return
    req = urllib.request.Request(ORIGIN + "/" + quote(rel), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        buf = r.read()
    if len(buf) > MAX_PDF:
        print("WARN > 15MB, not copied:", rel)
        return
    with open(out, "wb") as f:
        f.write(buf)


# ---------------------------------------------------------------- legal
def extract_legal():
    out = {}
    for slug, key in (("privacy-policy", "pages_privacy_policy"), ("term-conditions", "pages_term_conditions")):
        s = load(key)
        c = s.select_one("div.container.pt-1.pb-3")
        h1 = c.find("h1")
        title = txt(h1)
        h1.decompose()
        out[slug] = {"meta": meta(key), "title": title, "crumb": title, "html": clean_html(c)}
    write("legal", out)


if __name__ == "__main__":
    extract_services()
    extract_career()
    extract_annual()
    extract_legal()

"""
Turn the crawl output (migration/scrape/crawl.mjs -> <SCRAPE_DIR>/pages/*.html)
into JSON content files under src/content/scraped/.

Usage:  python migration/scrape/extract.py <SCRAPE_DIR>
Needs:  pip install beautifulsoup4 lxml

Asset URLs are rewritten from https://www.mtandt.com/<path> to /legacy/<path>;
run migration/scrape/copy-assets.mjs afterwards to materialise them in public/legacy.
"""
import json
import os
import re
import sys
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup, NavigableString, Tag

SCRAPE = sys.argv[1] if len(sys.argv) > 1 else "scrape"
PAGES = os.path.join(SCRAPE, "pages")
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "content", "scraped")
os.makedirs(OUT, exist_ok=True)
ORIGIN = "https://www.mtandt.com"


# ---------------------------------------------------------------- helpers
def load(key):
    p = os.path.join(PAGES, f"{key}.html")
    if not os.path.exists(p):
        return None
    s = BeautifulSoup(open(p, encoding="utf8"), "lxml")
    for t in s(["script", "style", "noscript"]):
        t.decompose()
    return s


def page_meta(key):
    p = os.path.join(PAGES, f"{key}.json")
    if not os.path.exists(p):
        return {}
    return json.load(open(p, encoding="utf8")).get("meta", {})


def txt(el):
    if el is None:
        return ""
    t = el.get_text(" ", strip=True) if isinstance(el, Tag) else str(el)
    t = t.replace("�", "®").replace("\xa0", " ")
    return re.sub(r"\s+", " ", t).strip()


def asset(u):
    """Absolute legacy asset URL -> /legacy/... ; keeps external URLs."""
    if not u:
        return None
    u = u.strip()
    if u.startswith("//"):
        u = "https:" + u
    if u.startswith("/") and not u.startswith("//"):
        u = ORIGIN + u
    pu = urlparse(u)
    if pu.hostname in ("www.mtandt.com", "mtandt.com"):
        return "/legacy" + unquote(pu.path)
    return u


def link(u):
    """Internal absolute link -> path; external kept."""
    if not u or u.startswith("#") or u.startswith("javascript"):
        return None
    pu = urlparse(u.strip())
    if pu.hostname in ("www.mtandt.com", "mtandt.com", None) and not u.startswith(("mailto:", "tel:")):
        path = unquote(pu.path).rstrip("/") or "/"
        return path + (f"#{pu.fragment}" if pu.fragment else "")
    return u.strip()


def bg(el):
    m = re.search(r"url\(['\"]?([^'\")]+)", el.get("style", "") if el else "")
    return asset(m.group(1)) if m else None


ALLOWED = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "b", "em", "i", "u", "a", "br",
           "table", "thead", "tbody", "tr", "td", "th", "img", "blockquote", "span", "sup", "sub", "hr", "iframe"}


def clean_html(el):
    """Sanitise a content fragment down to simple semantic HTML with rewritten URLs."""
    if el is None:
        return ""
    el = BeautifulSoup(str(el), "lxml")
    for t in el.find_all(True):
        if t.name not in ALLOWED:
            t.unwrap()
            continue
        keep = {}
        if t.name == "a" and t.get("href"):
            keep["href"] = link(t["href"]) or t["href"]
        if t.name in ("img", "iframe") and (t.get("src") or t.get("data-src")):
            keep["src"] = asset(t.get("src") or t.get("data-src"))
            if t.get("alt"):
                keep["alt"] = t["alt"]
        if t.name in ("td", "th"):
            for a in ("colspan", "rowspan"):
                if t.get(a):
                    keep[a] = t[a]
        t.attrs = keep
    for t in el.find_all("span"):
        t.unwrap()
    body = el.body or el
    html = "".join(str(c) for c in body.contents)
    html = html.replace("�", "®").replace("\xa0", " ")
    html = re.sub(r"<p>\s*</p>", "", html)
    html = re.sub(r"\s+", " ", html).strip()
    return html


def write(name, data):
    path = os.path.join(OUT, f"{name}.json")
    with open(path, "w", encoding="utf8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    n = len(data) if isinstance(data, (list, dict)) else 1
    print(f"wrote {name}.json ({n})")


# ---------------------------------------------------------------- home
def extract_home():
    s = load("home")
    if not s:
        return
    out = {"meta": page_meta("home")}

    slides = []
    for li in s.select("#rev_slider_1077_1_wrapper li"):
        img = li.find("img")
        texts = [txt(x) for x in li.find_all(string=True) if txt(x) and "Runtime Modification" not in x]
        h2 = li.find("h2")
        slides.append({
            "image": asset(img.get("src")) if img else bg(li.find(style=re.compile("url"))),
            "eyebrow": texts[0] if texts else "",
            "title": [txt(x) for x in h2.find_all(string=True) if txt(x)] if h2 else [],
        })
    out["slides"] = slides

    sec = s.select_one("section.tab_section")
    tabs = [txt(a) for a in sec.select("a[href^='#']")]
    panes = []
    for i, pane in enumerate(sec.select(".tab-pane")):
        items = []
        for h3 in pane.select("h3"):
            box = h3.find_parent(class_=lambda c: c and ("item" in c or "product" in c)) or h3.parent.parent
            img = box.find("img") if box else None
            a = box.find("a", href=True) if box else None
            items.append({"title": txt(h3), "image": asset(img.get("src")) if img else None,
                          "href": link(a["href"]) if a else None})
        panes.append({"label": tabs[i] if i < len(tabs) else pane.get("id"), "items": items})
    out["productTabs"] = panes

    sec = s.select_one("section.brands-section")
    brand_tabs = []
    labels = [txt(b) for b in sec.select("button")]
    for i, pane in enumerate(sec.select(".tab-pane")):
        cards = []
        for img in pane.select("img"):
            card = img.find_parent("a") or img.parent.parent
            h5 = card.find(["h5", "h4", "h6"]) if card else None
            p = card.find("p") if card else None
            cards.append({"logo": asset(img.get("src")), "alt": img.get("alt", "").strip(),
                          "title": txt(h5), "text": txt(p),
                          "href": link(card.get("href")) if card and card.name == "a" else None})
        brand_tabs.append({"label": labels[i] if i < len(labels) else pane.get("id"), "brands": cards})
    out["brandTabs"] = brand_tabs

    sec = s.select_one("section.services-section")
    services = []
    for a in sec.select("a[href*='/services/']"):
        card = a.parent
        while card and not card.find("h5"):
            card = card.parent
        h5 = card.find("h5") if card else None
        p = h5.find_next("p") if h5 else None
        icon = card.find("img") if card else None
        services.append({"title": txt(h5), "text": txt(p), "href": link(a["href"]),
                         "icon": asset(icon.get("src")) if icon else None})
    intro = sec.find("p")
    seen = set()
    services = [x for x in services if x["title"] and not (x["href"] in seen or seen.add(x["href"]))]
    out["serviceNavigator"] = {"intro": txt(intro), "items": services}

    sec = s.select_one("section.why_us")
    why = []
    for h in sec.select("h4, h5, h3"):
        if txt(h) == "Why Us":
            continue
        p = h.find_next("p")
        why.append({"title": txt(h), "text": txt(p)})
    out["whyUs"] = why

    sec = s.select_one("section.textmonial_section")
    testimonials = []
    for li in sec.select(".carousel-item"):
        p = li.select_one(".testimonial p") or li.find("p")
        img = li.find("img")
        b = li.select_one(".name b") or li.find("b")
        if p and b:
            testimonials.append({"quote": txt(p), "author": txt(b), "logo": asset(img.get("src")) if img else None})
    out["testimonials"] = testimonials

    news = []
    for a in s.select(".blog-home5 a[href*='/event/']"):
        date = a.find("h6")
        news.append({"href": link(a["href"]), "title": txt(a.find("p")) or txt(a), "date": txt(date) or None})
    seen = set()
    out["news"] = [n for n in news if not (n["href"] in seen or seen.add(n["href"]))]

    out["clients"] = list(dict.fromkeys(asset(i.get("src")) for i in s.select(".brands-content img")))
    write("home", out)


if __name__ == "__main__":
    only = sys.argv[2:] or None
    for name, fn in list(globals().items()):
        if name.startswith("extract_") and (not only or name[8:] in only):
            fn()

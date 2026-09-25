"""
Media section (press, events, gallery) from the crawl -> src/content/scraped/{press,events,gallery}.json.
Blogs come from Payload (DB), not from here.

Usage:  python migration/scrape/extract_media.py <SCRAPE_DIR>
"""
import glob
import json
import os
import re
from datetime import datetime

from extract import PAGES, asset, clean_html, link, load, page_meta, txt, write


def iso(s):
    s = re.sub(r"\s+", " ", (s or "").replace(",", ", ")).strip()
    for fmt in ("%B %d, %Y", "%d %B %Y", "%Y-%m-%d", "%b %d, %Y", "%d %b %Y"):
        try:
            return datetime.strptime(s, fmt).date().isoformat()
        except ValueError:
            pass
    return None


def body_html(el):
    # legacy editor inserted /public/imageFile/... URLs, which 404 on live; the files exist at /imageFile/...
    return clean_html(el).replace('src="/legacy/public/', 'src="/legacy/')


def keys(prefix):
    return sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(PAGES, f"{prefix}_*.html")))


def tags(scope):
    return [txt(a) for a in scope.select(".inner_blog_tagline .tags_line_inner1 a") if txt(a)]


def meta(key):
    m = page_meta(key)
    return {"title": m.get("title") or "", "description": m.get("description") or ""}


# Older event pages render no hero image on live; listing thumbnails come from the legacy
# `mediaevents.image` column (mtandt_local), copied here so the extractor stays self-contained.
LEGACY_EVENT_IMAGES = {
    "irata-international-rope-access-symposium-india-2025": "1737976604addEvent.jpg",
    "bauma-conexpo-india-2024": "1730788926addEvent.jpg",
    "gas-india-expo-2024": "1719918285addEvent.jpg",
    "scissor-lifts-aluminum-scaffolding-signage-solutions-advertising-industry": "1718883607addEvent.jpg",
    "fall-protection-solutions-osh-india-2024": "1712042762addEvent.jpg",
    "excon-2023": "1691152865.jpg",
    "fall-protection-solutions-osh-india": "1699350687addEvent.jpg",
    "rope-access-symposium-eat": "1699348605addEvent.jpg",
    "mtandt-at-acetech": "1695645356addEvent.jpg",
    "bauma-2023-mtandt": "1669401491.png",
    "defence-expo": "1669401341.png",
}


def slug_of(href):
    return (link(href) or "").rstrip("/").split("/")[-1]


# ---------------------------------------------------------------- press
def extract_press():
    listing = load("media_press")
    order, cards = [], {}
    if listing:
        for post in listing.select("#media_Press .post"):
            a = post.select_one("ul.post-meta a[href*='/press/']")
            if not a:
                continue
            slug = slug_of(a["href"])
            if slug in cards:
                continue
            items = post.select("ul.post-meta li")
            img = post.select_one("img")
            cards[slug] = {
                "cardTitle": txt(a),
                "date": iso(txt(items[-1])) if items else None,
                "image": asset(img.get("src")) if img else None,
            }
            order.append(slug)

    out = []
    for key in keys("press"):
        s = load(key)
        sec = s.select_one("section.blogcontent") if s else None
        if not sec:
            continue
        slug = key[len("press_"):]
        canon = page_meta(key).get("canonical") or ""
        if "/press/" in canon:
            slug = canon.rstrip("/").split("/")[-1]
        title = txt(sec.select_one("h1"))
        date = iso(txt(sec.select_one(".blogdateup")))
        img = sec.select_one("img.poster-image")
        img = asset(img.get("src")) if img else None
        t = tags(sec)
        body = sec
        for sel in ("header.blogheader", "img.poster-image", ".inner_blog_tagline", ".footer-social-infos"):
            for x in body.select(sel):
                x.decompose()
        for r in body.select(".row"):
            if not txt(r):
                r.decompose()
        html = body_html(body)
        html = re.sub(r"^(<br/>\s*)+|(\s*<br/>)+$", "", html).strip()
        card = cards.get(slug, {})
        out.append({
            "slug": slug,
            "title": title,
            "cardTitle": card.get("cardTitle") or title,
            "date": date or card.get("date"),
            "image": img or card.get("image"),
            "body": html,
            "tags": t,
            "meta": meta(key),
        })
    rank = {s: i for i, s in enumerate(order)}
    out.sort(key=lambda p: (rank.get(p["slug"], 999), "" if not p["date"] else "~" + p["date"]))
    write("press", out)


# ---------------------------------------------------------------- events
def extract_events():
    cards = {}
    listing = load("media_events")
    if listing:
        for a in listing.select("#events a[href*='/event/']"):
            slug = slug_of(a["href"])
            p = a.find("p")
            if slug and p and slug not in cards:
                cards[slug] = re.sub(r"\s*\.{3,}\s*$", "", txt(p)).strip()

    out = []
    for key in keys("event"):
        s = load(key)
        sec = s.select_one("section.event-section") if s else None
        if not sec:
            continue
        canon = page_meta(key).get("canonical") or ""
        slug = canon.rstrip("/").split("/")[-1] if "/event/" in canon else key[len("event_"):]
        wrap = sec.select_one(".event_wrapper")
        img = wrap.select_one("img") if wrap else None
        rows = [txt(x.find_all("div")[-1]) for x in wrap.select(".event_icone_center")] if wrap else []
        dates = re.findall(r"\d{4}-\d{2}-\d{2}", rows[0]) if rows else []
        content = sec.select_one(".event-content")
        body = body_html(content) if content else ""
        body = re.sub(r"^(<p>\s*<br/>\s*</p>\s*)+", "", body)
        gallery = list(dict.fromkeys(asset(i.get("src")) for i in sec.select(".event_gallery img.img-thumbnail") if i.get("src")))
        text = txt(content) if content else ""
        out.append({
            "slug": slug,
            "title": txt(sec.select_one(".event-title")),
            "image": asset(img.get("src")) if img else None,
            "thumb": asset(img.get("src")) if img else (
                f"/legacy/imageFile/{LEGACY_EVENT_IMAGES[slug]}" if slug in LEGACY_EVENT_IMAGES else None),
            "from": dates[0] if dates else None,
            "to": dates[1] if len(dates) > 1 else None,
            "location": rows[1] if len(rows) > 1 else "",
            "excerpt": cards.get(slug) or (text[:220].rsplit(" ", 1)[0] if text else ""),
            "body": body,
            "gallery": gallery,
            "tags": tags(sec),
            "meta": meta(key),
        })
    out.sort(key=lambda e: e["from"] or "", reverse=True)
    write("events", out)


# ---------------------------------------------------------------- gallery
def extract_gallery():
    s = load("media_gallery")
    if not s:
        return
    grid = s.select_one("#media_gallery")
    items = []
    lightbox = grid.select_one(".modal, #lightbox, .carousel")
    if lightbox:
        lightbox.extract()
    for el in grid.find_all(["iframe", "img"]):
        if el.name == "iframe":
            items.append({"type": "video", "src": el.get("src")})
        elif el.get("src"):
            items.append({"type": "image", "src": asset(el["src"])})
    write("gallery", items)


# ---------------------------------------------------------------- blogs (fallback only)
BLOG_FALLBACK = os.path.join(os.path.dirname(__file__), "..", "..", "src", "app", "(frontend)", "blogs", "[slug]", "scraped.json")


def extract_blogs():
    """Scraped copies of the crawled blog posts. Used only where the Payload doc is still seed/demo content."""
    cards = {}
    listing = load("media")
    raw = open(os.path.join(PAGES, "media.html"), encoding="utf8").read() if listing else ""
    styles = dict(re.findall(r"\.(page_speed_\d+)\{\s*background-image:url\(([^)]+)\)", raw))
    if listing:
        for a in listing.select("#media_Blogs a[href*='/blogs/']"):
            cls = next((c for c in a.get("class", []) if c in styles), None)
            cards[slug_of(a["href"])] = {
                "category": txt(a.select_one(".blog_header_hedding h6")),
                "image": asset(styles[cls]) if cls else None,
            }
    out = {}
    for key in keys("blogs"):
        s = load(key)
        root = s.select_one("section.bolg_inner_pages") if s else None
        sec = root.select_one("section.blogcontent") if root else None
        if not sec:
            continue
        slug = key[len("blogs_"):]
        canon = page_meta(key).get("canonical") or ""
        if "/blogs/" in canon:
            slug = canon.rstrip("/").split("/")[-1]
        img = sec.select_one("img.poster-image")
        img = asset(img.get("src")) if img else None
        date = iso(txt(sec.select_one(".blogdateup")))
        title = txt(sec.select_one("h1"))
        for x in sec.select("header.blogheader, img.poster-image"):
            x.decompose()
        out[slug] = {
            "title": title,
            "date": date,
            "hero": img or cards.get(slug, {}).get("image"),
            "card": cards.get(slug, {}).get("image") or img,
            "category": cards.get(slug, {}).get("category") or "",
            "body": body_html(sec),
            "tags": tags(root),
            "meta": meta(key),
        }
    with open(BLOG_FALLBACK, "w", encoding="utf8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"wrote blogs/[slug]/scraped.json ({len(out)})")


if __name__ == "__main__":
    extract_blogs()
    extract_press()
    extract_events()
    extract_gallery()

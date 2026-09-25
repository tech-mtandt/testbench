"""
Company pages (about-us, contact-us, catalogues, customers/dealer/vendors forms) -> src/content/scraped/*.json

Usage:  python migration/scrape/extract_company.py <SCRAPE_DIR>
"""
import re
import sys

sys.path.insert(0, __import__("os").path.dirname(__file__))
from extract import asset, clean_html, link, load, page_meta, txt, write  # noqa: E402

CSS_IMG = "/legacy/forntend/images"


def meta(key):
    m = page_meta(key)
    return {"title": m.get("title", ""), "description": m.get("description", "")}


def banner(s):
    """Sub-header banner image: `.sub_header_title.page_speed_N` -> background from inline <style>."""
    el = s.select_one(".sub_header_title")
    if not el:
        return None
    cls = [c for c in el.get("class", []) if c.startswith("page_speed_")]
    raw = open(PAGES_HTML[id(s)], encoding="utf8").read()
    for c in cls:
        m = re.search(r"\." + c + r"\{\s*background-image:url\(([^)]+)\)", raw)
        if m:
            return asset(m.group(1).strip("'\""))
    return None


PAGES_HTML = {}


def load_page(key):
    import os

    s = load(key)
    if s is not None:
        PAGES_HTML[id(s)] = os.path.join(sys.argv[1] if len(sys.argv) > 1 else "scrape", "pages", f"{key}.html")
    return s


def shrink_svg(svg):
    for t in svg.find_all(True):
        for a in ("class", "style"):
            t.attrs.pop(a, None)
    out = str(svg)
    out = re.sub(r"(\d+\.\d)\d+", r"\1", out)
    out = re.sub(r"\s+", " ", out).replace("> <", "><")
    return out


# ---------------------------------------------------------------- about-us
def about():
    s = load_page("about_us")
    if s is None:
        return
    top = s.select_one(".mtnadt_about")
    who_ps = [clean_html(p) for p in top.find_all("p")] if top else []
    iframe = top.find("iframe") if top else None

    principles = []
    for box in s.select("#groupprinciple .principle-box"):
        h5 = box.find("h5")
        pre = h5.find("span")
        pre_txt = txt(pre) if pre else ""
        if pre:
            pre.extract()
        icon = box.select_one(".text-right svg")
        art = box.select_one(".bottom-img svg")
        body = box.find_all(["p", "ul"])
        principles.append(
            {
                "prefix": pre_txt,
                "title": txt(h5),
                "html": "".join(clean_html(b) for b in body if txt(b)),
                "icon": shrink_svg(icon) if icon else None,
                "art": shrink_svg(art) if art else None,
            }
        )

    pp = s.select_one("#PoweringProgress")
    powering = {
        "title": txt(pp.find("h2")),
        "tagline": txt(pp.find("h2").find_next("p")),
        "cards": [],
    }
    for sp in pp.find_all("span"):
        p = sp.find_next("p")
        if sp.find_parent("section") is not pp or not txt(sp) or not p:
            continue
        powering["cards"].append({"label": txt(sp), "description": txt(p)})
        if len(powering["cards"]) >= 6:
            break

    companies = []
    for a in s.select("#bussiness-unit .mtandt-group .item a"):
        img = a.find("img")
        companies.append({"title": txt(a.find("h5")), "href": link(a.get("href")), "icon": asset(img.get("src")) if img else None})

    def people(section):
        seen, out = set(), []
        for it in section.select(".item"):
            h = it.find("h6")
            if not h or txt(h) in seen:
                continue
            seen.add(txt(h))
            img = it.find("img")
            out.append({"name": txt(h), "designation": txt(it.find("span")), "image": asset(img.get("src")) if img else None})
        return out

    investors = people(s.select_one("#team"))
    mgmt_h = s.find("h2", string=re.compile("Our Management"))
    management = people(mgmt_h.find_parent("section")) if mgmt_h else []

    why = s.select_one("#WhyMTandT")
    why_img = why.find("img")

    journey_sec = s.select_one("#OurJourney")
    journey = []
    for sl in s.select(".timeline_bottom .timeline_slide"):
        img = sl.find("img")
        journey.append(
            {
                "year": txt(sl.select_one(".timeline_date")),
                "title": txt(sl.select_one(".timeline_heading")),
                "text": txt(sl.select_one(".timeline_item_content")),
                "image": asset(img.get("src")) if img else None,
            }
        )

    acc = s.select_one("#accreditations")
    acc_col = acc.select_one(".col-lg-6")
    awards = s.select_one("#awards")

    write(
        "about",
        {
            "meta": meta("about_us"),
            "who": {"title": txt(top.find_all("h2")[1]) if top else "Who We Are", "html": "".join(who_ps), "video": iframe.get("src").strip() if iframe else None},
            "principlesTitle": txt(s.select_one("#groupprinciple h2")),
            "principles": principles,
            "powering": powering,
            "companiesTitle": txt(s.select_one("#bussiness-unit h2")),
            "companies": companies,
            "investors": investors,
            "management": management,
            "why": {
                "title": txt(why.find("h2")),
                "points": [txt(li) for li in why.select("ul li")],
                "image": asset(why_img.get("src")) if why_img else None,
                "bg": f"{CSS_IMG}/about-us/why-bg.png",
                "bullet": f"{CSS_IMG}/icons/arrow.svg",
            },
            "journey": {
                "title": txt(journey_sec.find("h2")),
                "intro": txt(journey_sec.find("p")),
                "bg": f"{CSS_IMG}/journey/be-sure-get-more.webp",
                "road": f"{CSS_IMG}/journey/Mtandt-timelineline.svg",
                "items": journey,
            },
            "accreditations": {
                "title": txt(acc_col.find("h2")),
                "text": txt(acc_col.find("p")),
                "logos": [asset(i.get("src")) for i in acc_col.find_all("img")],
                "bg": f"{CSS_IMG}/about-us/bg-white.png",
            },
            "awards": {
                "title": txt(awards.find("h2")),
                "text": txt(awards.find("p")),
                "images": [asset(i.get("src")) for i in awards.find_all("img")],
            },
        },
    )


# ---------------------------------------------------------------- contact-us
def contact():
    s = load_page("contact_us")
    if s is None:
        return
    info = s.select_one(".contact-info-area")
    regions = []
    for tab in s.select(".mtandt_contact_address .country_tabs"):
        panel = s.select_one(tab["href"])
        cities = []
        names = [txt(a) for a in panel.select(".sub_tubs a")]
        boxes = panel.select(".address-section > .contact-address-box")
        for name, box in zip(names, boxes):
            rows = box.select(".contact_space") or [box]
            offices = []
            for r in rows:
                head = r.select_one(".single-contact-address-box.text-center")
                fields = {}
                for li in r.select(".main-branch li"):
                    k = txt(li.find("h4")).rstrip(":").lower()
                    fields[k] = [txt(p) for p in li.select(".text p") if txt(p)]
                ifr = r.find("iframe")
                offices.append(
                    {
                        "company": txt(head.find("h3")),
                        "label": txt(head.find("h2")),
                        "address": " ".join(fields.get("address", [])),
                        "phones": fields.get("phone", []),
                        "emails": fields.get("email id", []),
                        "map": ifr.get("src").strip() if ifr else None,
                    }
                )
            cities.append({"name": name, "offices": offices})
        regions.append({"name": txt(tab), "cities": cities})

    fb = s.select_one("#feedbackModal form")
    feedback_fields = []
    for el in fb.select("input, select, textarea"):
        if el.get("type") == "hidden":
            continue
        lab = el.find_previous("label")
        f = {"name": el.get("name"), "label": txt(lab), "required": el.has_attr("required")}
        if el.name == "select":
            f["type"] = "select"
            f["options"] = [txt(o) for o in el.find_all("option") if o.get("value")]
        elif el.name == "textarea":
            f["type"] = "textarea"
        elif el.get("type") in ("email", "tel"):
            f["type"] = el["type"]
        feedback_fields.append(f)

    share = s.select_one(".share-thoughts-wrapper")
    write(
        "contact",
        {
            "meta": meta("contact_us"),
            "banner": banner(s),
            "heading": txt(info.find("h1")),
            "subheading": txt(info.find("h1").find_next("p")),
            "share": {
                "title": txt(share.find("h5")),
                "text": txt(share.find("p")),
                "button": txt(share.find("button")),
                "bg": asset("https://www.mtandt.com/forntend/images/banners/bgtet.jpg"),
                "formTitle": txt(fb.find("h2")),
                "fields": feedback_fields,
            },
            "regions": regions,
        },
    )


# ---------------------------------------------------------------- catalogues
# Legacy catalogues have catId/subcat_id/brandId = NULL (live filter returns nothing), so the
# taxonomy is assigned here by title keywords, using the live category + mega-nav sub-category names.
CAT_RULES = [
    (r"Mobile Elevated Work Platforms", "Aerial Work Platforms", None),
    (r"Spider Lift", "Aerial Work Platforms", "Spider Lift"),
    (r"Truck Mounted Boom", "Aerial Work Platforms", "Boom Lift"),
    (r"Ironlink Road Rail", "Aerial Work Platforms", "Boom Lift"),
    (r"Rope Suspended Platform", "Aerial Work Platforms", None),
    (r"Material Handling Equipment", "Material Handling Equipment", None),
    (r"Spider Crane", "Material Handling Equipment", None),
    (r"Tower Crane", "Material Handling Equipment", None),
    (r"Aluminium Scaffolding", "Aluminum Scaffolding", None),
    (r"Aluminium Ladders", "Aluminum Scaffolding", "Ladder Series"),
    (r"PortaDeck", "Temporary Road Mats", "PortaDeck"),
    (r"PortaMat", "Temporary Road Mats", "PortaMat"),
    (r"PortaPads", "Temporary Road Mats", "PortaPad"),
    (r"Fibreglass Mats", "Temporary Road Mats", None),
    (r"Mlit|MPower", "Mlit", None),
    (r"Fall Protection", "Fall Protection Lifeline Systems", None),
    (r"Under-Deck", "Under-Deck & Net Systems", None),
    (r"Tools and Supplies", "Tools and Supplies", None),
]
SUB_RULES = [
    (r"Mlit|Light Tower", "Mobile Light Tower"),
    (r"MPower|Battery", "Battery Power Stations"),
]


def catalogues():
    s = load_page("catalogues")
    if s is None:
        return
    cats = [txt(o) for o in s.select("#cat option") if o.get("value", "").strip()]
    items = []
    for i, card in enumerate(s.select("#catalists .Catalogues_inner")):
        title = card.get("data-name") or txt(card.find("h5"))
        img = card.find("img")
        a = card.select_one(".cataloge a")
        cat = sub = None
        for rx, c, sc in CAT_RULES:
            if re.search(rx, title, re.I):
                cat, sub = c, sc
                break
        if cat == "Mlit":
            sub = next((sc for rx, sc in SUB_RULES if re.search(rx, title, re.I)), None)
        m = re.search(r"\b(?:by|from)\s+(.+)$", title, re.I)
        items.append(
            {
                "order": i,
                "title": title,
                "category": cat,
                "subcategory": sub,
                "brand": m.group(1).strip() if m else None,
                "poster": asset(img.get("src")) if img else None,
                # keep absolute live URL for PDFs (not copied locally)
                "pdf": a.get("href") if a else None,
            }
        )
    write("catalogues", {"meta": meta("catalogues"), "banner": banner(s), "categories": cats, "items": items})


# ---------------------------------------------------------------- partner forms
def col_span(el):
    for p in el.parents:
        cls = " ".join(p.get("class") or [])
        if p.name == "form":
            break
        for bp in ("lg", "md", "sm"):
            m = re.search(rf"\bcol-{bp}-(\d+)\b", cls)
            if m and "col-" in cls:
                return int(m.group(1))
        if re.search(r"\bcol-(\d+)\b", cls):
            return int(re.search(r"\bcol-(\d+)\b", cls).group(1))
    return 12


def partner_form(key):
    s = load_page(key)
    if s is None:
        return None
    form = next(f for f in s.select("form") if not f.find_parent(class_="modal"))
    sec = form.find_parent("section")
    intro = sec.find_previous_sibling("section", class_="vendore_section")
    heading = intro.find("h1") if intro else None
    if heading:
        heading.find_parent("div").extract()

    sections = [{"title": None, "fields": []}]
    seen_radio = set()
    for el in form.find_all(["h3", "h5", "h6", "input", "select", "textarea"]):
        if el.name in ("h3", "h5", "h6"):
            level = {"h3": 1, "h5": 1, "h6": 2}[el.name]
            sections.append({"title": txt(el).replace("*", " *").replace("  ", " ").strip(), "level": level, "fields": []})
            continue
        typ = el.get("type") or el.name
        name = el.get("name")
        if typ in ("hidden", "checkbox") or not name or name in ("user_captcha",) or "captcha" in (el.get("placeholder") or "").lower():
            continue
        cur = sections[-1]["fields"]
        if typ == "radio":
            if name in seen_radio:
                continue
            seen_radio.add(name)
            opts = []
            for r in form.find_all("input", attrs={"type": "radio", "name": name}):
                lab = r.find_next("label")
                opts.append(txt(lab))
            cur.append({"name": name, "label": sections[-1]["title"].rstrip(" *"), "type": "radio", "required": el.has_attr("required"), "options": opts, "span": 12})
            sections[-1]["hideTitle"] = False
            continue
        group = el.find_parent(class_="form-group")
        lab = group.find("label") if group else None
        label = txt(lab).rstrip("*").strip() if lab else (el.get("placeholder") or name)
        f = {"name": name, "label": label, "required": el.has_attr("required"), "span": col_span(el)}
        if el.name == "select":
            f["type"] = "select"
            opts = []
            for o in el.find_all("option"):
                v = (o.get("value") or "").strip()
                t = txt(o)
                if not t or t.startswith("--"):
                    continue
                opts.append(t)
            f["options"] = opts
        elif el.name == "textarea":
            f["type"] = "textarea"
        elif typ in ("email", "file", "number", "tel", "date"):
            f["type"] = "tel" if typ == "number" and re.search(r"mobile|phone|landline", name, re.I) else typ
        if name == "Others-please-specify":
            f["label"] = "Please Specify"
            prev = next((x for x in reversed(cur) if x.get("type") == "select"), None)
            if prev:
                f["showIf"] = {"field": prev["name"], "value": prev["options"][-1]}
        if typ == "file":
            f["accept"] = ".png,.pdf,.jpg,.jpeg"
            f["hint"] = "( max. file size 500KB. File Type: Png. Pdf. Jpg. Jpeg...)"
        cur.append(f)
    sections = [x for x in sections if x["fields"] or x.get("title")]
    return {
        "meta": meta(key),
        "banner": banner(s),
        "heading": txt(heading) if heading else "",
        "intro": clean_html(intro.select_one(".mtandt_inner1")) if intro else "",
        "formTitle": txt(sec.select_one(".vendor_hedding")),
        "sections": sections,
    }


def partners():
    out = {}
    for key in ("customers", "dealer", "vendors"):
        f = partner_form(key)
        if f:
            out[key] = f
    write("partner-forms", out)


if __name__ == "__main__":
    about()
    contact()
    catalogues()
    partners()

"""
Scrapes the live www.sixsigma.co.uk site into structured JSON used by the new
Next.js front end (sixsigma-web/src/data). Raw HTML is cached in tools/.cache so
re-runs are cheap. Respects robots.txt (never touches /booking, /cart, /checkout).

Usage:  python -I tools/scrape_site.py [--refresh]
"""
import codecs
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

import requests
from bs4 import BeautifulSoup

BASE = "https://www.sixsigma.co.uk"
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, ".cache")
OUT = os.path.join(ROOT, "..", "sixsigma-web", "src", "data")
MEDIA = os.path.join(ROOT, "..", "sixsigma-web", "public", "media")
UA = "Mozilla/5.0 (compatible; SixSigmaRedesignMigration/1.0)"
REFRESH = "--refresh" in sys.argv
DISALLOWED = ("/booking", "/cart", "/checkout", "/cms", "/login", "/summary")

os.makedirs(CACHE, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
os.makedirs(MEDIA, exist_ok=True)


# Some legacy content mixes cp1252 bytes into UTF-8 pages; decode those bytes as cp1252.
def _cp1252_fallback(err):
    bad = err.object[err.start:err.end]
    return bad.decode("cp1252", errors="replace"), err.end


codecs.register_error("cp1252fallback", _cp1252_fallback)

session = requests.Session()
session.headers["User-Agent"] = UA


def fetch(path):
    """Return (final_path, status, html) for a site path, cached on disk."""
    assert not path.startswith(DISALLOWED), path
    key = hashlib.sha1(path.encode()).hexdigest()
    meta_f = os.path.join(CACHE, key + ".json")
    if not REFRESH and os.path.exists(meta_f):
        with open(meta_f, encoding="utf-8") as f:
            return tuple(json.load(f))
    for attempt in range(3):
        try:
            r = session.get(BASE + path, timeout=40)
            break
        except requests.RequestException:
            time.sleep(2 * (attempt + 1))
    else:
        return (path, 0, "")
    html = r.content.decode("utf-8", errors="cp1252fallback")
    u = urllib.parse.urlparse(r.url)
    final = (u.path or "/") + ("?" + u.query if u.query else "")
    res = (final, r.status_code, html)
    with open(meta_f, "w", encoding="utf-8") as f:
        json.dump(res, f)
    time.sleep(0.15)
    return res


def soup(html):
    return BeautifulSoup(html, "lxml")


def text(el):
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip() if el else ""


def rel(url):
    """Make site-absolute URLs relative; leave external URLs alone."""
    if not url:
        return url
    url = url.strip()
    for pre in ("https://www.sixsigma.co.uk", "http://www.sixsigma.co.uk", "https://sixsigma.co.uk"):
        if url.startswith(pre):
            url = url[len(pre):] or "/"
    return url


def slug_of(path):
    return path.split("?")[0].rstrip("/").split("/")[-1]


# ---------------------------------------------------------------- media
_media_cache = {}


def localise_image(src):
    """Download a sixsigma.co.uk image into public/media and return its public path."""
    if not src:
        return None
    src = src.strip()
    if src.startswith("/"):
        src = BASE + src
    if "sixsigma.co.uk" not in src:
        return src
    if src in _media_cache:
        return _media_cache[src]
    path = urllib.parse.unquote(urllib.parse.urlparse(src).path)
    name = re.sub(r"[^a-zA-Z0-9._-]", "-", path.strip("/").replace("/", "_"))[-120:]
    dest = os.path.join(MEDIA, name)
    if not os.path.exists(dest):
        try:
            r = session.get(urllib.parse.quote(src, safe=":/?=&%"), timeout=40)
            if r.status_code != 200 or not r.headers.get("content-type", "").startswith("image"):
                _media_cache[src] = None
                return None
            with open(dest, "wb") as f:
                f.write(r.content)
        except requests.RequestException:
            _media_cache[src] = None
            return None
    _media_cache[src] = "/media/" + name
    return _media_cache[src]


# ---------------------------------------------------------------- html cleaning
KEEP = {"p", "ul", "ol", "li", "h2", "h3", "h4", "h5", "strong", "b", "em", "i", "a", "table", "thead",
        "tbody", "tr", "td", "th", "img", "br", "blockquote", "span", "div"}


def clean_html(el, download_images=False, drop_first_heading=False):
    """Reduce legacy markup to minimal semantic HTML."""
    if el is None:
        return ""
    el = BeautifulSoup(str(el), "lxml")
    for bad in el(["script", "style", "noscript", "iframe", "form", "button", "svg", "input", "select"]):
        bad.decompose()
    for bad in el.select(".moreless, .showmorecontent, .buttons"):
        bad.decompose()
    # outline sub-items are "<div style='margin-left'>o item</div>" -> nested list items
    for d in el.find_all("div", style=re.compile("margin-left")):
        d.name = "li"
        d.attrs = {"data-sub": "1"}
        first = d.find(string=True)
        if first and re.match(r"^\s*[o•·-]\s+", first):
            first.replace_with(re.sub(r"^\s*[o•·-]\s+", "", first))
    for tag in el.find_all(True):
        if tag.name in ("html", "body"):
            continue
        if tag.name not in KEEP:
            tag.unwrap()
            continue
        attrs = {}
        if tag.name == "a" and tag.get("href"):
            href = rel(tag["href"])
            if href.startswith("/cdn-cgi/l/email-protection"):
                href = "mailto:info@sixsigma.co.uk"
            attrs["href"] = href
        if tag.name == "img":
            src = tag.get("src") or tag.get("data-src")
            if download_images:
                src = localise_image(src)
            if not src:
                tag.decompose()
                continue
            attrs["src"] = src
            attrs["alt"] = (tag.get("alt") or "").strip()
        if tag.name in ("td", "th"):
            for k in ("colspan", "rowspan"):
                if tag.get(k):
                    attrs[k] = tag[k]
        if tag.get("data-sub"):
            attrs["data-sub"] = "1"
        tag.attrs = attrs
    for tag in el.find_all(["span", "div"]):
        tag.unwrap()
    for b in el.find_all("b"):
        b.name = "strong"
    for i in el.find_all("i"):
        if not i.get_text(strip=True):
            i.decompose()
    # group consecutive sub-items into <ul class="sub"> attached to the previous list
    for li in list(el.find_all("li", attrs={"data-sub": "1"})):
        if li.parent is not None and li.parent.name == "ul" and li.parent.get("class") == ["sub"]:
            continue
        prev = li.find_previous_sibling()
        if prev is not None and prev.name == "ul" and prev.get("class") == ["sub"]:
            prev.append(li.extract())
        elif prev is not None and prev.name in ("ul", "ol") and prev.find_all("li", recursive=False):
            host = prev.find_all("li", recursive=False)[-1]
            sub = host.find("ul", class_="sub")
            if sub is None:
                sub = el.new_tag("ul", attrs={"class": "sub"})
                host.append(sub)
            sub.append(li.extract())
        else:
            ul = el.new_tag("ul", attrs={"class": "sub"})
            li.wrap(ul)
    for li in el.find_all("li"):
        li.attrs.pop("data-sub", None)
    for p in el.find_all(["p", "li", "h2", "h3", "h4", "strong", "em", "ul", "ol"]):
        if not p.get_text(strip=True) and not p.find("img"):
            p.decompose()
    if drop_first_heading:
        h = el.find(["h2", "h3"])
        if h:
            h.decompose()
    body = el.body or el
    html = "".join(str(c) for c in body.contents)
    html = html.replace("\xa0", " ")
    html = re.sub(r"\s*\n\s*", "\n", html)
    html = re.sub(r"(<br/?>\s*){2,}", "<br/>", html)
    return html.strip()


def meta(s):
    t = s.title.string.strip() if s.title and s.title.string else ""
    d = s.find("meta", attrs={"name": "description"})
    k = s.find("meta", attrs={"name": "keywords"})
    return {
        "title": re.sub(r"\s+", " ", t),
        "description": re.sub(r"\s+", " ", d["content"]).strip() if d and d.get("content") else "",
        "keywords": re.sub(r"\s+", " ", k["content"]).strip() if k and k.get("content") else "",
    }


MONTHS = {m: i for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}


def iso_date(d):
    iso = re.match(r"(\d{4}-\d{2}-\d{2})", d or "")
    if iso:
        return iso.group(1)
    m = re.match(r"(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})", d or "")
    if not m:
        return None
    return f"{m.group(3)}-{MONTHS.get(m.group(2)[:3].title(), 1):02d}-{int(m.group(1)):02d}"


def parse_schedule(block, method):
    out = []
    if not block:
        return out
    for card in block.select(".dates-prices"):
        enq = card.select_one("[data-price]")
        if not enq:
            continue
        book = card.select_one('a[href*="/booking/"]')
        loc_a = card.select_one(".location-name")
        dur = card.select_one(".duration span")
        out.append({
            "method": method,
            # course x location pages put a region path ("north-east/newcastle") in data-location
            "location": text(loc_a) if loc_a and method == "classroom" else (enq.get("data-location") or "").strip(),
            "locationSlug": slug_of(rel(loc_a["href"])) if loc_a and method == "classroom" else None,
            "date": iso_date(enq.get("data-date")),
            "price": float(enq["data-price"]) if enq.get("data-price") else None,
            "duration": text(dur) or None,
            "bookingUrl": rel(book["href"]) if book else None,
        })
    return out


# ---------------------------------------------------------------- catalogue
def scrape_catalogue():
    _, _, html = fetch("/courses")
    s = soup(html)
    cats, courses, seen = [], [], set()
    for a in s.find_all("a", href=True):
        p = rel(a["href"]).split("#")[0].strip()
        m = re.fullmatch(r"/courses/([a-z0-9-]+)/([a-z0-9-]+)", p)
        if m and p not in seen:
            seen.add(p)
            courses.append({"category": m.group(1), "slug": m.group(2), "path": p, "name": text(a)})
        m2 = re.fullmatch(r"/courses/([a-z0-9-]+)", p)
        if m2 and m2.group(1) not in [c["slug"] for c in cats]:
            cats.append({"slug": m2.group(1), "path": p, "name": text(a)})
    for c in cats:
        c["courseOrder"] = [x["slug"] for x in courses if x["category"] == c["slug"]]
    return cats, courses


def scrape_category(cat):
    final, status, html = fetch(cat["path"])
    s = soup(html)
    h1 = s.find("h1")
    intro = text(h1.find_next("p")) if h1 else ""
    sections = []
    for h2 in s.find_all("h2"):
        sec = h2.find_parent("section")
        cls = " ".join(sec.get("class") or []) if sec else ""
        if any(k in cls for k in ("modal-section", "fixed-enq", "calendar", "testimonial", "client", "location")):
            continue
        body = []
        for sib in h2.find_all_next():
            if sib.name == "h2" or (sec is not None and sib.find_parent("section") is not sec):
                break
            if sib.name in ("p", "li") and sib.find_parent(["p", "li"]) is None and not sib.find("a"):
                t = text(sib)
                if t and t not in body:
                    body.append(t)
        if body:
            sections.append({"heading": text(h2), "paragraphs": body[:14]})
    return {**cat, "status": status, "meta": meta(s), "h1": text(h1), "intro": intro, "sections": sections[:10]}


def scrape_course(c):
    final, status, html = fetch(c["path"])
    if final.rstrip("/") != c["path"].rstrip("/") or status != 200:
        return {**c, "status": status, "redirectsTo": final}
    s = soup(html)
    faqs = []
    for item in s.select("#Faqs .item"):
        q, a = item.select_one(".ques h3, .ques"), item.select_one(".ans")
        if q and a:
            faqs.append({"q": text(q), "a": clean_html(a)})
    included = []
    for inc in s.select("#Included .inc"):
        h, p = inc.select_one("h4"), inc.select_one("p")
        if h:
            included.append({"title": text(h), "text": text(p)})
    key = {}
    for p in s.select(".keypoints-section .points p"):
        st = p.find("strong")
        if st:
            k = text(st).rstrip(":").strip().lower()
            key[k] = text(p)[len(text(st)):].strip().rstrip("*").strip()
    methods, online_slug = [], None
    for a in s.select(".delivery-methods a"):
        label = text(a).lower()
        if label:
            methods.append(label)
        if "/online-course/" in (a.get("href") or ""):
            online_slug = slug_of(rel(a["href"]).split("#")[0])
    enq = s.select_one("[data-topic]")
    return {
        **c,
        "status": status,
        "meta": meta(s),
        "h1": text(s.find("h1")),
        "name": text(s.select_one(".courseinfo-section .heading h2")) or c["name"],
        "topicId": enq.get("data-topic") if enq else None,
        "bullets": [text(li) for li in s.select(".bulletpoints li")],
        "overviewHtml": clean_html(s.select_one("#moreoverview")),
        "outlineHtml": clean_html(s.select_one("#moreoutline"), drop_first_heading=True),
        "faqs": faqs,
        "included": included,
        "keyPoints": key,
        "deliveryMethods": methods,
        "onlineCourseSlug": online_slug,
        "classroom": parse_schedule(s.select_one("#classroom-block"), "classroom"),
        "virtual": parse_schedule(s.select_one("#virtual-block"), "virtual"),
        "related": [rel(a["href"]).split("#")[0].strip() for a in s.select(".related-courses a.courses-name")],
        "popularLocations": [slug_of(rel(a["href"]).strip()) for a in s.select(".location-section a.single-location")],
    }


def scrape_course_location(path):
    final, status, html = fetch(path)
    if final.rstrip("/") != path.rstrip("/") or status != 200:
        return {"path": path, "status": status, "redirectsTo": final}
    s = soup(html)
    return {"path": path, "status": status, "meta": meta(s), "h1": text(s.find("h1")),
            "classroom": parse_schedule(s.select_one("#classroom-block"), "classroom")}


# ---------------------------------------------------------------- online courses
def scrape_online_course(path):
    final, status, html = fetch(path)
    if final.rstrip("/") != path.rstrip("/") or status != 200:
        return {"path": path, "slug": slug_of(path), "status": status, "redirectsTo": final}
    s = soup(html)
    h1 = s.find("h1")
    intro = text(h1.find_next("p")) if h1 else ""
    faqs = []
    for item in s.select("#Faqs .item"):
        q, a = item.select_one(".ques h3, .ques"), item.select_one(".ans")
        if q and a:
            faqs.append({"q": text(q), "a": clean_html(a)})
    addons = []
    for inp in s.select('#online-block input[name="addon[]"]'):
        box = inp.find_parent(class_="online-feature")
        t = text(box.select_one(".feature-text")) if box else ""
        addons.append({"id": inp.get("value"), "label": re.sub(r"\s*-\s*\S*\d[\d,.]*\s*$", "", t).strip(),
                       "price": float(inp.get("data-price") or 0)})
    cal = s.select_one("#buy_now")
    base_price = None
    if cal:
        for el in cal.find_all(attrs={"data-price": True}):
            if el.name != "input":
                try:
                    base_price = float(el["data-price"])
                    break
                except ValueError:
                    pass
        if base_price is None:
            m = re.search(r"(?:Total|Price|Course fee)\D{0,20}([\d,]{3,}(?:\.\d+)?)", text(cal))
            if m:
                base_price = float(m.group(1).replace(",", ""))
    form = s.select_one("#onlineBookingForm")
    return {
        "path": path, "slug": slug_of(path), "status": status, "meta": meta(s),
        "h1": text(h1), "name": text(s.select_one(".courseinfo-section .heading h2")),
        "intro": intro,
        "overviewHtml": clean_html(s.select_one("#moreoverview")),
        "outlineHtml": clean_html(s.select_one("#moreoutline"), drop_first_heading=True),
        "faqs": faqs, "addons": addons, "basePrice": base_price,
        "calendarText": text(cal)[:800] if cal else "",
        "bookingAction": rel(form["action"]) if form and form.get("action") else None,
        "related": [rel(a["href"]).split("#")[0] for a in s.select(".related-courses a.courses-name")],
    }


def scrape_online_hub():
    final, status, html = fetch("/online-training/six-sigma")
    s = soup(html)
    cards = []
    for a in s.find_all("a", href=re.compile(r"/online-course/")):
        p = rel(a["href"]).split("#")[0]
        if p in [c["path"] for c in cards]:
            continue
        card = a
        for _ in range(6):
            if card.parent is None or "Learners" in text(card):
                break
            card = card.parent
        t = text(card)
        dur = re.search(r"Duration:\s*([^|]+?)\s+(?:More info|Book)", t)
        learners = re.search(r"Learners\s*([\d.]+K)", t)
        cards.append({"path": p, "duration": dur.group(1).strip() if dur else None,
                      "learners": learners.group(1) if learners else None})
    h1 = s.find("h1")
    return {"meta": meta(s), "h1": text(h1), "intro": text(h1.find_next("p")) if h1 else "", "cards": cards}


# ---------------------------------------------------------------- locations
def scrape_locations_index():
    final, status, html = fetch("/locations")
    s = soup(html)
    locs = []
    for a in s.find_all("a", href=re.compile(r"/locations/view/")):
        p = rel(a["href"]).strip()
        sl = slug_of(p)
        if sl not in [l["slug"] for l in locs]:
            locs.append({"slug": sl, "path": p})
    popular = []
    for a in s.select(".popular-locations a[href*='/locations/view/']"):
        sl = slug_of(rel(a["href"]))
        if sl not in popular:
            popular.append(sl)
    h1 = s.find("h1")
    return {"meta": meta(s), "h1": text(h1), "intro": text(h1.find_next("p")) if h1 else "",
            "index": locs, "popular": popular}


def scrape_location(slug):
    path = f"/locations/view/{slug}"
    final, status, html = fetch(path)
    if final.rstrip("/") != path or status != 200:
        return {"slug": slug, "path": path, "status": status, "redirectsTo": final}
    s = soup(html)
    banner = s.select_one(".location-banner")
    detail = s.select_one(".location-detail .left-content")
    venue = s.select_one(".location-detail .right-content")
    return {"slug": slug, "path": path, "status": status, "meta": meta(s), "name": text(s.find("h1")),
            "intro": text(banner.find("p")) if banner and banner.find("p") else "",
            "detailHtml": clean_html(detail, drop_first_heading=True),
            "venueText": text(venue)[:800] if venue else ""}


# ---------------------------------------------------------------- blog
def scrape_blog_index():
    posts = []
    _, _, html = fetch("/blog")
    pages = [int(x) for x in re.findall(r"blog\?page=(\d+)", html)]
    last = max(pages or [1])
    for n in range(1, last + 1):
        _, _, html = fetch("/blog" if n == 1 else f"/blog?page={n}")
        s = soup(html)
        for a in s.find_all("a", href=re.compile(r"/blog/[a-z0-9-]+/?$")):
            p = rel(a["href"]).strip().rstrip("/")
            if p in [x["path"] for x in posts] or p in ("/blog/view",):
                continue
            card = a
            for _ in range(5):
                if card.parent is None or len(text(card.parent)) > 400:
                    break
                card = card.parent
            img = card.find("img")
            date = re.search(r"Posted on (\d{4}-\d{2}-\d{2})", text(card))
            posts.append({"path": p, "slug": slug_of(p), "listPage": n,
                          "listImage": (img.get("src") or img.get("data-src")) if img else None,
                          "date": date.group(1) if date else None})
    return {"posts": posts, "pages": last}


def scrape_blog_post(p):
    final, status, html = fetch(p["path"])
    if final.rstrip("/") != p["path"] or status != 200:
        return {**p, "status": status, "redirectsTo": final}
    s = soup(html)
    det = s.select_one(".blog-detail")
    date, body = p.get("date"), None
    if det:
        m = re.search(r"(\d{4}-\d{2}-\d{2})", text(det))
        date = m.group(1) if m else date
        body = BeautifulSoup(str(det), "lxml")
        for x in body.select(".right-content, .right-section, .sidebar, .share, .social, .categories, .recent"):
            x.decompose()
        for st in body.find_all(string=re.compile(r"^\s*(\d{4}-\d{2}-\d{2}|N/A)\s*$")):
            par = st.parent
            if par is not None and len(par.get_text(strip=True)) < 30:
                par.decompose()
    img = p.get("listImage")
    hero = localise_image(img) if img else None
    body_html = clean_html(body, download_images=True) if body is not None else ""
    plain = BeautifulSoup(body_html, "lxml").get_text(" ", strip=True)
    return {**p, "status": status, "meta": meta(s), "title": text(s.find("h1")), "date": date,
            "image": hero, "bodyHtml": body_html,
            "excerpt": (plain[:230].rsplit(" ", 1)[0] + "…") if plain else "",
            "readingMinutes": max(1, round(len(plain.split()) / 220))}


def scrape_blog_category(path):
    """Legacy blog category listings, e.g. /blog/view/lean-six-sigma-training (paginated)."""
    final, status, html = fetch(path)
    s = soup(html)
    pages = max([int(x) for x in re.findall(re.escape(path) + r"\?page=(\d+)", html)] or [1])
    slugs = []
    for n in range(1, pages + 1):
        _, _, page_html = fetch(path if n == 1 else f"{path}?page={n}")
        for a in soup(page_html).find_all("a", href=re.compile(r"/blog/[a-z0-9-]+/?$")):
            p = rel(a["href"]).strip().rstrip("/")
            if not p.startswith("/blog/view") and slug_of(p) not in slugs:
                slugs.append(slug_of(p))
    return {"path": path, "slug": slug_of(path), "status": status, "meta": meta(s), "h1": text(s.find("h1")), "pages": pages, "posts": slugs}


# ---------------------------------------------------------------- static pages
STATIC = ["/", "/about-us", "/clients", "/testimonial", "/careers", "/onsite", "/resources", "/contact",
          "/terms", "/privacy-policy", "/cookies"]


def scrape_static(path):
    final, status, html = fetch(path)
    s = soup(html)
    secs = []
    for sec in s.find_all("section"):
        cls = " ".join(sec.get("class") or [])
        if any(k in cls for k in ("modal-section", "fixed-enq")):
            continue
        secs.append({"class": cls, "text": text(sec)[:8000], "html": clean_html(sec)})
    return {"path": path, "status": status, "meta": meta(s), "h1": text(s.find("h1")), "sections": secs}


# ---------------------------------------------------------------- inventory
def sitemap_inventory():
    r = session.get(BASE + "/sitemap.xml", timeout=60)
    out = []
    for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", r.text):
        p = urllib.parse.urlparse(u).path or "/"
        if p not in out:
            out.append(p)
    return out


def check(path):
    final, status, _ = fetch(path)
    return {"path": path, "status": status, "final": final.split("?")[0],
            "redirected": final.split("?")[0].rstrip("/") != path.rstrip("/")}


def dump(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    print("wrote", name, flush=True)


def main():
    pool = ThreadPoolExecutor(max_workers=5)
    inv = sitemap_inventory()
    cats, courses = scrape_catalogue()
    print(len(cats), "categories", len(courses), "courses", flush=True)
    dump("categories.json", list(pool.map(scrape_category, cats)))
    course_data = list(pool.map(scrape_course, courses))
    dump("courses.json", course_data)

    loc_index = scrape_locations_index()
    slugs = [l["slug"] for l in loc_index["index"]]
    slugs += [p.split("/")[-1] for p in inv if p.startswith("/locations/view/") and p.split("/")[-1] not in slugs]
    dump("locations.json", {**loc_index, "locations": list(pool.map(scrape_location, slugs))})

    hub = scrape_online_hub()
    online_paths = sorted(set([c["path"] for c in hub["cards"]]
                              + [f"/online-course/{c['onlineCourseSlug']}" for c in course_data if c.get("onlineCourseSlug")]
                              + [p for p in inv if p.startswith("/online-course/")]))
    dump("online.json", {"hub": hub, "courses": list(pool.map(scrape_online_course, online_paths))})

    blog_index = scrape_blog_index()
    known = {p["path"] for p in blog_index["posts"]}
    for p in inv:
        if re.fullmatch(r"/blog/[^/]+", p) and p not in known:
            blog_index["posts"].append({"path": p, "slug": slug_of(p), "listPage": None, "listImage": None, "date": None})
    dump("blog.json", {"pages": blog_index["pages"], "posts": list(pool.map(scrape_blog_post, blog_index["posts"]))})

    blog_cats = [p for p in inv if re.fullmatch(r"/blog/view/[^/]+", p)]
    dump("blog-categories.json", list(pool.map(scrape_blog_category, blog_cats)))

    dump("pages.json", list(pool.map(scrape_static, STATIC)))

    combos = [p for p in inv if re.fullmatch(r"/courses/[^/]+/[^/]+/[^/]+", p)]
    dump("course-locations.json", list(pool.map(scrape_course_location, combos)))

    dump("url-inventory.json", {"generated": time.strftime("%Y-%m-%d"),
                                "source": BASE + "/sitemap.xml", "urls": list(pool.map(check, inv))})


if __name__ == "__main__":
    main()

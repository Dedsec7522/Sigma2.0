"""
Checks every URL in the legacy inventory against a running build of the new site.

  200 URLs  -> must return 200 with one <h1>, a <title>, a meta description,
               a self-referencing canonical and parseable JSON-LD.
  redirects -> must answer with ONE permanent redirect to the same final URL the
               live site redirects to (no chains).

Usage:  python -I tools/verify_urls.py [base_url]     (default http://localhost:3000)
Writes tools/url-report.json and exits non-zero if anything fails.
"""
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000").rstrip("/")
ROOT = os.path.dirname(os.path.abspath(__file__))
INV = os.path.join(ROOT, "..", "sixsigma-web", "src", "data", "url-inventory.json")
SITE = "https://www.sixsigma.co.uk"

session = requests.Session()
session.headers["User-Agent"] = "sixsigma-url-verifier/1.0"


def check(u):
    path = u["path"]
    out = {"path": path, "problems": []}
    try:
        r = session.get(BASE + path, allow_redirects=False, timeout=60)
    except requests.RequestException as e:
        out["problems"].append(f"request failed: {e}")
        return out
    out["status"] = r.status_code
    if u["redirected"] or u["status"] != 200:
        expected = u["final"] if u["redirected"] else None
        if path == "/online-course/six-sigma-white-belt":
            expected = "/online-training/six-sigma"
        if r.status_code not in (301, 308):
            out["problems"].append(f"expected permanent redirect, got {r.status_code}")
            return out
        loc = r.headers.get("location", "").replace(BASE, "")
        if loc != expected:
            out["problems"].append(f"redirects to {loc}, expected {expected}")
            return out
        hop = session.get(BASE + loc, allow_redirects=False, timeout=60)
        if hop.status_code != 200:
            out["problems"].append(f"redirect target returned {hop.status_code} (chain or error)")
        return out

    if r.status_code != 200:
        out["problems"].append(f"expected 200, got {r.status_code}")
        return out
    html = r.text
    h1s = re.findall(r"<h1[\s>]", html)
    if len(h1s) != 1:
        out["problems"].append(f"{len(h1s)} <h1> elements")
    if not re.search(r"<title>[^<]{5,}</title>", html):
        out["problems"].append("missing <title>")
    if not re.search(r'<meta name="description" content="[^"]{20,}"', html):
        out["problems"].append("missing meta description")
    canon = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    expected_canon = SITE + ("" if path == "/" else path)
    if not canon:
        out["problems"].append("missing canonical")
    elif canon.group(1) != expected_canon:
        out["problems"].append(f"canonical {canon.group(1)} != {expected_canon}")
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if not blocks:
        out["problems"].append("no JSON-LD")
    for b in blocks:
        try:
            data = json.loads(b)
        except ValueError:
            out["problems"].append("invalid JSON-LD")
            continue
        for item in data if isinstance(data, list) else [data]:
            if item.get("@type") == "Organisation":
                out["problems"].append("invalid schema type Organisation")
    if "�" in html or "â€" in html:
        out["problems"].append("encoding artefacts in HTML")
    return out


def main():
    inv = json.load(open(INV, encoding="utf-8"))["urls"]
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(check, inv))
    failed = [r for r in results if r["problems"]]
    ok200 = sum(1 for r, u in zip(results, inv) if not r["problems"] and not u["redirected"] and u["status"] == 200)
    okredir = sum(1 for r, u in zip(results, inv) if not r["problems"] and (u["redirected"] or u["status"] != 200))
    summary = {"base": BASE, "checked": len(results), "pages_ok": ok200, "redirects_ok": okredir, "failed": len(failed)}
    with open(os.path.join(ROOT, "url-report.json"), "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "failures": failed}, f, indent=1)
    print(json.dumps(summary))
    for r in failed[:40]:
        print(r["path"], "|", "; ".join(r["problems"]))
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()

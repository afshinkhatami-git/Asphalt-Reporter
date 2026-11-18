#!/usr/bin/env python3
"""Build dist/Asphalt_Reporter.html from src/ (single-file, offline output).

Usage:
    python3 build.py                 # build dist/Asphalt_Reporter.html
    python3 build.py --check FILE    # build, then verify it is byte-identical to FILE

Parts are concatenated in the exact order listed in src/manifest.json.
Order matters: later CSS blocks override earlier ones, and JS blocks share
one global scope. Do NOT reorder entries unless you test the result.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "dist", "Asphalt_Reporter.html")


def read(rel):
    with open(os.path.join(SRC, rel), newline="", encoding="utf-8") as f:
        return f.read()


def build():
    with open(os.path.join(SRC, "manifest.json"), encoding="utf-8") as f:
        parts = json.load(f)["parts"]
    out = []
    for p in parts:
        kind = p["kind"]
        if kind == "text":
            out.append(p["value"])
        elif kind == "html":
            out.append(read(p["file"]))
        elif kind in ("style", "script"):
            out.append(p["open"] + read(p["file"]) + "</%s>" % kind)
        else:
            raise SystemExit("unknown part kind: %r" % kind)
    return "".join(out)


def main():
    html = build()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        f.write(html)
    print("built %s (%d bytes)" % (os.path.relpath(OUT, ROOT), len(html.encode("utf-8"))))

    if "--check" in sys.argv:
        ref = sys.argv[sys.argv.index("--check") + 1]
        with open(ref, "rb") as f:
            expected = f.read()
        with open(OUT, "rb") as f:
            actual = f.read()
        if expected == actual:
            print("CHECK OK: byte-identical to %s" % ref)
        else:
            print("CHECK FAILED: output differs from %s" % ref)
            sys.exit(1)


if __name__ == "__main__":
    main()

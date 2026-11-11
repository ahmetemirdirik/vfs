#!/usr/bin/env python3
"""Build the English (index.html) and Turkish (tr/index.html) pages from src/page.html.

src/page.html holds both languages: every translatable piece exists twice, once with
lang="en" and once with lang="tr". This script keeps only one language per page, fills in
the per-language head tags and writes the result.

Usage (from the repository root):  python3 scripts/build.py
"""
import os
import re

BASE = "https://ahmetemirdirik.github.io/vfs/"
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = {
    "en": {
        "out": "index.html",
        "ROOT": "",
        "URL": BASE,
        "TITLE": "Video Fidelity Score (VFS): Deepfake Visual Realism",
        "DESC": "Video Fidelity Score (VFS) rates how realistic each deepfake video looks, "
                "using image-quality scores and Cohen's d. Paper, code, figures and results.",
        "LOCALE": "en_US",
        "LOCALE_ALT": "tr_TR",
        # old ?lang=tr links keep working
        "REDIRECT": '<script>if (new URLSearchParams(location.search).get("lang") === "tr") location.replace("tr/");</script>',
        "TOGGLE": '<a href="tr/" hreflang="tr">TR</a><a href="./" aria-current="page">EN</a>',
    },
    "tr": {
        "out": "tr/index.html",
        "ROOT": "../",
        "URL": BASE + "tr/",
        "TITLE": "Video Fidelity Score (VFS): Deepfake Görsel Gerçekçiliği",
        "DESC": "Video Fidelity Score (VFS), her deepfake videonun ne kadar gerçekçi göründüğünü "
                "görüntü kalitesi skorları ve Cohen's d ile ölçer. Makale, kod, şekiller ve sonuçlar.",
        "LOCALE": "tr_TR",
        "LOCALE_ALT": "en_US",
        "REDIRECT": '<script>if (new URLSearchParams(location.search).get("lang") === "en") location.replace("../");</script>',
        "TOGGLE": '<a href="./" aria-current="page">TR</a><a href="../" hreflang="en">EN</a>',
    },
}

LANG_LINKS = (
    f'<link rel="alternate" hreflang="en" href="{BASE}">\n'
    f'<link rel="alternate" hreflang="tr" href="{BASE}tr/">\n'
    f'<link rel="alternate" hreflang="x-default" href="{BASE}">'
)

OPEN_RE = re.compile(r'<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\slang="(en|tr)"[^>]*>')


def drop_language(html, drop):
    """Remove every element (with its content) whose lang attribute equals `drop`."""
    out, pos = [], 0
    while True:
        m = OPEN_RE.search(html, pos)
        if not m:
            out.append(html[pos:])
            return "".join(out)
        tag, lang = m.group(1).lower(), m.group(2)
        if tag == "html" or lang != drop:
            out.append(html[pos:m.end()])
            pos = m.end()
            continue
        # find the matching close tag, counting nested tags of the same name
        depth, i = 1, m.end()
        tok = re.compile(rf'<(/?){tag}\b[^>]*>', re.I)
        while depth:
            t = tok.search(html, i)
            if t is None:
                raise ValueError(f"unclosed <{tag} lang={lang}> near offset {m.start()}")
            depth += -1 if t.group(1) else 1
            i = t.end()
        out.append(html[pos:m.start()])
        pos = i


def build():
    with open(os.path.join(ROOT_DIR, "src", "page.html"), encoding="utf-8") as f:
        src = f.read()
    for lang, cfg in PAGES.items():
        html = src
        for key, val in cfg.items():
            if key != "out":
                html = html.replace("{{" + key + "}}", val)
        html = html.replace("{{LANG}}", lang).replace("{{LANG_LINKS}}", LANG_LINKS)
        html = drop_language(html, "tr" if lang == "en" else "en")
        html = re.sub(r"\n[ \t]*\n(?=[ \t]*\S)", "\n", html)  # tidy lines left empty by removals
        left = re.findall(r"\{\{[A-Z_]+\}\}", html)
        if left:
            raise ValueError(f"unfilled placeholders in {lang}: {left}")
        out = os.path.join(ROOT_DIR, cfg["out"])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"wrote {cfg['out']} ({len(html)} chars)")


if __name__ == "__main__":
    build()

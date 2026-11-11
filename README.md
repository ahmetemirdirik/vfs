# VFS project page

Static project page for:

> Demir, A., Dirik, A. E., & Vatansever, S. (2026). *Assessing the visual realism of deepfake videos: an IQA-based approach.* PeerJ Computer Science. https://doi.org/10.7717/peerj-cs.3893

No build step: plain HTML, CSS and a little JavaScript. English at `/vfs/`, Turkish at `/vfs/tr/`; the TR/EN switch in the top bar links the two pages.

```
src/page.html       page source, both languages (edit this)
scripts/build.py    builds index.html (English) and tr/index.html (Turkish)
index.html          English page (generated)
tr/index.html       Turkish page (generated)
assets/style.css    styles
assets/main.js      language toggle and BibTeX copy
assets/img/         figures from github.com/aahmetdemir/VFS
.nojekyll           tells GitHub Pages to serve files as-is
```

## Publish on GitHub Pages

### Option A: a separate repository (address: `https://<user>.github.io/<repo>/`)

1. Create a new public repository on GitHub, e.g. `vfs`.
2. Upload the contents of this folder to the repository root (drag and drop on github.com, or use git):
   ```bash
   git init && git add . && git commit -m "VFS project page"
   git branch -M main
   git remote add origin https://github.com/<user>/vfs.git
   git push -u origin main
   ```
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, select `main` and `/ (root)`, then click **Save**.
4. After a minute or two the site is live at `https://<user>.github.io/vfs/`.

### Option B: inside the existing code repository (`aahmetdemir/VFS`)

Put these files in a `docs/` folder of that repository. Then in **Settings → Pages**, choose branch `main` and folder `/docs`. The address becomes `https://aahmetdemir.github.io/VFS/`.

## Editing

- Text: edit `src/page.html` (each paragraph has an English `lang="en"` and a Turkish `lang="tr"` version), then run `python3 scripts/build.py` to regenerate both pages.
- Figures: replace files in `assets/img/` (keep the same names).
- Colors and fonts: the `:root` block at the top of `assets/style.css`.

## Cache

GitHub Pages lets browsers cache CSS/JS for 10 minutes. After changing `assets/*.css` or `assets/*.js`, bump the `?v=` number on their links in `src/page.html` and rebuild so visitors get the new files at once.

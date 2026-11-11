# VFS project page

Static project page for:

> Demir, A., Dirik, A. E., & Vatansever, S. (2026). *Assessing the visual realism of deepfake videos: an IQA-based approach.* PeerJ Computer Science. https://doi.org/10.7717/peerj-cs.3893

No build step: plain HTML, CSS and JavaScript. Bilingual (TR / EN), with a toggle in the top bar. Add `?lang=tr` or `?lang=en` to a link to choose the language.

```
index.html          page content (both languages)
assets/style.css    styles
assets/main.js      data from the paper's tables, charts, demo
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

- Text: edit `index.html`. Each paragraph has an English (`lang="en"`) and a Turkish (`lang="tr"`) version.
- Numbers in the charts: the arrays at the top of `assets/main.js` (Tables 1–7 of the paper).
- Colors and fonts: the `:root` block at the top of `assets/style.css`.

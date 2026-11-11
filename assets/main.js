/* VFS project page: BibTeX copy and good/bad set switch. */
(function () {
  "use strict";
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);
  let lang = root.getAttribute("data-lang") || "en";
  const t = (en, tr) => (lang === "tr" ? tr : en);

  // the page language is fixed per page (index.html = en, tr/index.html = tr)
  $("#copyl").textContent = t("Copy BibTeX", "BibTeX'i kopyala");

  $("#copy").addEventListener("click", () => {
    const txt = $("#bib").textContent;
    const done = () => {
      $("#copyl").textContent = t("Copied", "Kopyalandı");
      setTimeout(() => { $("#copyl").textContent = t("Copy BibTeX", "BibTeX'i kopyala"); }, 1600);
    };
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents($("#bib"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    };
    try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (e) { fallback(); }
  });

  // good / bad human-evaluation set switch
  const segs = document.querySelectorAll(".seg button");
  segs.forEach((b) => b.addEventListener("click", () => {
    segs.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $("#set-img").src = b.dataset.img;
    $("#set-link").href = b.dataset.full;
  }));
  // warm the second image so switching is instant
  window.addEventListener("load", () => { const b = document.getElementById("set-bad"); if (b) { const i = new Image(); i.src = b.dataset.img; } });

})();

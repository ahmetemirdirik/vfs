/* VFS project page: language toggle and BibTeX copy. */
(function () {
  "use strict";
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);
  let lang = root.getAttribute("data-lang") || "en";
  const t = (en, tr) => (lang === "tr" ? tr : en);

  function setLang(l) {
    lang = l;
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.set === l)));
    $("#copyl").textContent = t("Copy BibTeX", "BibTeX'i kopyala");
    try { localStorage.setItem("vfs-lang", l); } catch (e) { /* ignore */ }
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.set)));

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
  window.addEventListener("load", () => { const i = new Image(); i.src = "assets/img/bad-set-sm.jpg"; });

  setLang(lang);
})();

/* Charts drawn as SVG at the container's real pixel size, so all chart text uses
   the page fonts at fixed sizes (12px ticks, 13px titles) at every screen width. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const FONT = "Inter, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
  const MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const C = { fg: "#111418", body: "#30353d", muted: "#4c535e", grid: "#eef0f3", axis: "#cfd3d9" };
  const GROUPS = [
    { k: "P", label: "P", color: "#1f6f5c" },
    { k: "DF", label: "DF", color: "#9b1d4a" },
    { k: "FS", label: "FS", color: "#c0702a" },
    { k: "NTX", label: "NTX", color: "#5a4a9c" },
    { k: "F2F", label: "F2F", color: "#2f6aa8" }
  ];
  const METRICS = [
    { m: "BRISQUE", lo: 26, hi: 46, ticks: [26, 31, 36, 41, 46], down: true, fmt: (v) => v.toFixed(0) },
    { m: "DBCNN", lo: 0.26, hi: 0.44, ticks: [0.26, 0.30, 0.34, 0.38, 0.42], fmt: (v) => v.toFixed(2) },
    { m: "MUSIQ", lo: 30, hi: 60, ticks: [30, 40, 50, 60], fmt: (v) => v.toFixed(0) },
    { m: "MANIQA", lo: 0.22, hi: 0.42, ticks: [0.22, 0.26, 0.30, 0.34, 0.38, 0.42], fmt: (v) => v.toFixed(2) },
    { m: "TReS", lo: 35, hi: 65, ticks: [35, 45, 55, 65], fmt: (v) => v.toFixed(0) },
    { m: "LIQE", lo: 1.0, hi: 2.4, ticks: [1.0, 1.4, 1.8, 2.2], fmt: (v) => v.toFixed(1) }
  ];

  function el(name, attrs, text) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- scatter (Figure 2) ---------- */
  function scatterPanel(cell, spec, data) {
    const W = Math.max(220, Math.floor(cell.clientWidth)), H = 236;
    const m = { l: 40, r: 6, t: 30, b: 28 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b, gw = pw / GROUPS.length;
    const y = (v) => m.t + (1 - (v - spec.lo) / (spec.hi - spec.lo)) * ph;
    const svg = el("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${spec.m} per-frame scores` });
    svg.appendChild(el("text", { x: m.l, y: 16, "font-family": FONT, "font-size": 13, "font-weight": 600, fill: C.fg }, spec.m + (spec.down ? " ↓" : " ↑")));
    spec.ticks.forEach((t) => {
      svg.appendChild(el("line", { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: C.grid }));
      svg.appendChild(el("text", { x: m.l - 6, y: y(t) + 4, "text-anchor": "end", "font-family": MONO, "font-size": 11, fill: C.muted }, spec.fmt(t)));
    });
    svg.appendChild(el("line", { x1: m.l, x2: W - m.r, y1: m.t + ph, y2: m.t + ph, stroke: C.axis }));
    GROUPS.forEach((g, gi) => {
      const x0 = m.l + gi * gw;
      if (gi > 0) svg.appendChild(el("line", { x1: x0, x2: x0, y1: m.t, y2: m.t + ph, stroke: C.axis, "stroke-dasharray": "3 3" }));
      svg.appendChild(el("text", { x: x0 + gw / 2, y: H - 8, "text-anchor": "middle", "font-family": FONT, "font-size": 12, "font-weight": 600, fill: g.color }, g.label));
      const seen = {};
      (data[g.k] || []).forEach(([px, v]) => {
        const key = px + "|" + v, k = (seen[key] = (seen[key] || 0) + 1) - 1;
        const fx = Math.min(1, Math.max(0, px)) * 0.84 + 0.08 + (k ? (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.05 : 0);
        svg.appendChild(el("circle", { cx: (x0 + fx * gw).toFixed(1), cy: y(Math.min(spec.hi, Math.max(spec.lo, v))).toFixed(1), r: 3.1, fill: g.color, "fill-opacity": 0.85 }));
      });
    });
    cell.replaceChildren(svg);
  }
  function drawScatter() {
    const grid = document.getElementById("scatter");
    if (!grid || !window.FIG2) return;
    if (!grid.children.length) METRICS.forEach(() => grid.appendChild(document.createElement("div")));
    METRICS.forEach((spec, i) => scatterPanel(grid.children[i], spec, window.FIG2[spec.m]));
  }

  /* ---------- AUC (Figure 5, Tables 6 and 7) ---------- */
  const AUC = [
    ["BRISQUE", 0.81, 0.44], ["DBCNN", 0.87, 0.47], ["MUSIQ", 0.83, 0.53],
    ["MANIQA", 0.85, 0.48], ["TReS", 0.80, 0.42], ["LIQE", 0.83, 0.58]
  ];
  function drawAUC() {
    const box = document.getElementById("auc");
    if (!box) return;
    const W = Math.max(280, Math.floor(box.clientWidth)), row = W < 520 ? 46 : 38;
    const m = { l: W < 520 ? 74 : 96, r: 46, t: 8, b: 34 };
    const H = m.t + AUC.length * row + m.b, pw = W - m.l - m.r;
    const lo = 0.3, hi = 1.0, x = (v) => m.l + ((v - lo) / (hi - lo)) * pw;
    const svg = el("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "AUC of VFS and raw NR-IQA scores for each metric" });
    const narrow = W < 520;
    (narrow ? [0.3, 0.5, 0.7, 0.9] : [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]).forEach((t) => {
      svg.appendChild(el("line", { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b, stroke: t === 0.5 ? C.muted : C.grid, "stroke-dasharray": t === 0.5 ? "4 4" : "" }));
      svg.appendChild(el("text", { x: x(t), y: H - m.b + 18, "text-anchor": "middle", "font-family": MONO, "font-size": 11, fill: C.muted }, t.toFixed(1)));
    });
    AUC.forEach(([name, v, r], i) => {
      const cy = m.t + i * row + row / 2;
      svg.appendChild(el("text", { x: m.l - 12, y: cy + 4, "text-anchor": "end", "font-family": FONT, "font-size": 13, "font-weight": 500, fill: C.fg }, name));
      svg.appendChild(el("line", { x1: x(r), x2: x(v), y1: cy, y2: cy, stroke: "#e7c9d4", "stroke-width": 3 }));
      svg.appendChild(el("circle", { cx: x(r), cy, r: 6.5, fill: "#fff", stroke: "#9aa1ac", "stroke-width": 2 }));
      svg.appendChild(narrow
        ? el("text", { x: x(r), y: cy - 10, "text-anchor": "middle", "font-family": MONO, "font-size": 11, fill: C.muted }, r.toFixed(2))
        : el("text", { x: x(r) - 12, y: cy + 4, "text-anchor": "end", "font-family": MONO, "font-size": 12, fill: C.muted }, r.toFixed(2)));
      svg.appendChild(el("circle", { cx: x(v), cy, r: 7, fill: "#9b1d4a" }));
      svg.appendChild(el("text", { x: x(v) + 12, y: cy + 4, "font-family": MONO, "font-size": 12, "font-weight": 600, fill: "#9b1d4a" }, v.toFixed(2)));
    });
    box.replaceChildren(svg);
  }

  function drawAll() { drawScatter(); drawAUC(); }
  let raf = 0, lastW = 0;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(drawAll);
  });
  const go = () => { lastW = window.innerWidth; drawAll(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  go();
})();

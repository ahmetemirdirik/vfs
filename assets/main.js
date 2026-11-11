/* VFS project page — charts and interactions. Data from Tables 1–7 of
   Demir, Dirik & Vatansever, PeerJ Computer Science (2026), doi:10.7717/peerj-cs.3893 */
(function () {
  "use strict";

  const M = ["BRISQUE", "DBCNN", "MUSIQ", "MANIQA", "TReS", "LIQE"];
  const DS = ["FF++ DeepFakes", "FF++ FaceSwap", "FaceShifter", "FF++ NeuralTextures", "FF++ Face2Face", "Celeb-DF"];
  const SHORT = ["DF", "FS", "FSh", "NT", "F2F", "CDF"];

  // Table 2: mean VFS (rows = datasets, cols = metrics), FID, PCC
  const T2 = [
    [2.81, 2.52, 2.22, 4.03, 3.52, 2.86],
    [2.12, 1.46, 1.13, 2.09, 1.75, 1.49],
    [1.73, 2.39, 1.91, 2.48, 3.36, 2.08],
    [1.23, 1.39, 0.98, 1.08, 2.09, 1.37],
    [0.50, 0.94, 0.45, 0.95, 1.11, 0.57],
    [0.47, 1.00, 0.84, 1.51, 1.39, 1.22]
  ];
  const FID = [16.27, 13.10, 12.33, 8.94, 8.77, 8.03];
  const PCC = [0.97, 0.85, 0.86, 0.93, 0.77, 0.87];
  // Table 4 (VFS) and Table 5 (raw NR-IQA): worst − best FID difference
  const T4 = [
    [7.1, 9.9, 11.2, 10.2, 11.5, 10.3],
    [3.8, 11.1, 8.0, 7.6, 11.6, 8.0],
    [5.5, 13.1, 12.8, 9.8, 14.1, 10.4],
    [1.4, 0.6, 0.3, 0.2, 1.0, -2.5],
    [1.0, 5.4, 1.9, 9.1, -3.6, -2.7],
    [6.1, 1.3, 4.8, 3.7, 4.5, 2.2]
  ];
  const T5 = [
    [-8.4, -0.7, -1.0, 2.4, -8.4, -3.9],
    [2.8, 5.1, 2.6, 3.5, -0.5, 0.2],
    [-12.8, -7.8, -7.3, -6.8, -7.9, -9.7],
    [0.1, -3.2, -1.9, -0.3, -4.4, -1.3],
    [-4.7, -2.2, -2.7, -2.4, -4.0, -2.8],
    [1.5, 0.3, -1.2, 0.9, 1.7, 0.0]
  ];
  const AVG4 = [4.2, 6.9, 6.5, 6.8, 6.5, 4.3];
  const AVG5 = [-3.6, -1.4, -1.9, -0.5, -3.9, -2.9];
  // Tables 6 and 7: human study
  const AUCv = [0.81, 0.87, 0.83, 0.85, 0.80, 0.83];
  const AUCr = [0.44, 0.47, 0.53, 0.48, 0.42, 0.58];
  const GOOD = [0.89, 0.90, 0.58, 1.03, 1.47, 0.87];
  const BAD = [2.42, 2.90, 2.35, 4.48, 3.81, 2.91];
  const PW = ["1.06×10⁻⁷", "1.84×10⁻¹⁰", "1.43×10⁻⁸", "2.46×10⁻⁹", "2.71×10⁻⁸", "2.60×10⁻⁶"];
  const PM = ["1.22×10⁻⁷", "1.69×10⁻¹⁰", "1.49×10⁻⁸", "2.13×10⁻⁹", "3.31×10⁻⁷", "1.08×10⁻⁸"];
  // Table 3: runtime
  const RT1 = ["7.17 s", "165.18 s", "148.54 s", "281.82 s", "240.44 s", "253.88 s"];
  const RT400 = ["0.80 h", "18.35 h", "16.50 h", "31.31 h", "26.72 h", "28.21 h"];
  // Table 1: MANIQA VFS for FF++ video #125
  const REF = [["Face2Face", "F2F", 0.60], ["NeuralTextures", "NT", 1.04], ["FaceSwap", "FS", 3.41], ["DeepFakes", "DF", 6.95]];

  const $ = (s) => document.querySelector(s);
  const f2 = (v) => v.toFixed(2);
  const f1 = (v) => (v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
  const root = document.documentElement;
  let lang = root.getAttribute("data-lang") || "en";
  const t = (en, tr) => (lang === "tr" ? tr : en);

  /* ---------- language ---------- */
  function setLang(l) {
    lang = l;
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.set === l)));
    $("#copyl").textContent = t("Copy BibTeX", "BibTeX'i kopyala");
    try { localStorage.setItem("vfs-lang", l); } catch (e) { /* ignore */ }
    renderTables();
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.set)));

  /* ---------- demo ---------- */
  const svg = $("#dist");
  const W = 600, H = 230, BASE = 182, X0 = -4, X1 = 11;
  const sx = (x) => ((x - X0) / (X1 - X0)) * W;
  const pdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  function curve(m, s, ymax) {
    let p = `M${sx(X0)},${BASE}`;
    for (let i = 0; i <= 240; i++) {
      const x = X0 + ((X1 - X0) * i) / 240;
      p += ` L${sx(x).toFixed(1)},${(BASE - (pdf(x, m, s) / ymax) * (BASE - 22)).toFixed(1)}`;
    }
    return p + ` L${sx(X1)},${BASE} Z`;
  }
  // fixed pseudo-random standard normal samples: 20 frames per video
  const Z = Array.from({ length: 20 }, (_, i) => {
    const a = Math.sin(i * 12.9898 + 4.1) * 43758.5453, u = a - Math.floor(a);
    const b = Math.sin((i + 7) * 78.233) * 12345.678, w = b - Math.floor(b);
    return Math.sqrt(-2 * Math.log(Math.max(u, 1e-6))) * Math.cos(2 * Math.PI * w);
  });
  function buildRuler() {
    const r = $("#ruler"), max = 8;
    r.innerHTML = '<div class="track"></div>' +
      REF.map(([n, s, v], i) => `<div class="tick ${i % 2 ? "down" : "up"}" style="left:${(v / max) * 100}%"><b></b><span><em class="full">${n}</em><em class="abbr">${s}</em> · ${f2(v)}</span></div>`).join("") +
      '<div class="you" id="you"></div>';
  }
  function drawDemo() {
    const d = +$("#shift").value, s = +$("#spread").value;
    const ymax = pdf(0, 0, Math.min(1, s)) * 1.03;
    const pooled = Math.sqrt((19 + 19 * s * s) / 38);
    const vfs = d / pooled;
    $("#shiftv").textContent = d.toFixed(2) + " σ";
    $("#spreadv").textContent = "× " + s.toFixed(2);
    $("#dval").textContent = f2(vfs);
    const grid = [-2, 0, 2, 4, 6, 8, 10].map((v) =>
      `<line x1="${sx(v)}" x2="${sx(v)}" y1="22" y2="${BASE}" stroke="#eef0f3"/>` +
      `<text x="${sx(v)}" y="12" text-anchor="middle" font-size="10" font-family="IBM Plex Mono, monospace" fill="#6a717d">${v}</text>`).join("");
    let dots = "";
    Z.forEach((z) => {
      dots += `<circle cx="${sx(z).toFixed(1)}" cy="${BASE + 18}" r="3.2" fill="#0e7c7b" fill-opacity=".8"/>`;
      dots += `<circle cx="${sx(d + z * s).toFixed(1)}" cy="${BASE + 34}" r="3.2" fill="#9b1d4a" fill-opacity=".8"/>`;
    });
    svg.innerHTML = grid +
      `<path d="${curve(0, 1, ymax)}" fill="#0e7c7b" fill-opacity=".12" stroke="#0e7c7b" stroke-width="1.6"/>` +
      `<path d="${curve(d, s, ymax)}" fill="#9b1d4a" fill-opacity=".1" stroke="#9b1d4a" stroke-width="1.6"/>` +
      `<line x1="0" x2="${W}" y1="${BASE}" y2="${BASE}" stroke="#cfd3da"/>` +
      `<line x1="${sx(0)}" x2="${sx(d)}" y1="30" y2="30" stroke="#111418" stroke-width="1"/>` +
      `<line x1="${sx(0)}" x2="${sx(0)}" y1="25" y2="${BASE}" stroke="#0e7c7b" stroke-dasharray="3 3"/>` +
      `<line x1="${sx(d)}" x2="${sx(d)}" y1="25" y2="${BASE}" stroke="#9b1d4a" stroke-dasharray="3 3"/>` +
      dots;
    $("#you").style.left = (Math.min(vfs, 8) / 8) * 100 + "%";
  }
  buildRuler();
  $("#shift").addEventListener("input", drawDemo);
  $("#spread").addEventListener("input", drawDemo);
  drawDemo();

  /* ---------- metric chips ---------- */
  function chips(el, sel, on) {
    el.innerHTML = M.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i === sel}">${m}</button>`).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      on(+b.dataset.i);
    });
    on(sel);
  }

  /* ---------- result 1: VFS vs FID ---------- */
  chips($("#m1"), 3, (mi) => {
    const vmax = 4.2, fmax = 17;
    let h = `<span></span><span class="hd">VFS · ${M[mi]} ↓</span><span class="hd fcol">FID ↓</span>`;
    DS.forEach((d, i) => {
      const v = T2[i][mi];
      h += `<span class="ds">${d}</span>` +
        `<div class="bar v"><i style="width:calc(${(v / vmax) * 100}% - 40px)"></i><span>${f2(v)}</span></div>` +
        `<div class="bar f fcol"><i style="width:calc(${(FID[i] / fmax) * 100}% - 48px)"></i><span>${f2(FID[i])}</span></div>`;
    });
    $("#bars1").innerHTML = h;
    $("#pcc1").textContent = "r = " + f2(PCC[mi]);
  });

  /* ---------- result 2: diverging bars ---------- */
  function diverge(el, labels, a, b, lo, hi) {
    const pos = (v) => ((v - lo) / (hi - lo)) * 100, z = pos(0);
    el.innerHTML = labels.map((l, i) => {
      const seg = (v, cls) => {
        const left = Math.min(pos(v), z), w = Math.max(Math.abs(pos(v) - z), 0.5);
        const lab = v >= 0
          ? `<span class="t ${cls}" style="left:calc(${pos(v)}% + 5px)">${f1(v)}</span>`
          : `<span class="t ${cls}" style="right:calc(${100 - pos(v)}% + 5px)">${f1(v)}</span>`;
        return `<div class="b ${cls}" style="left:${left}%;width:${w}%"></div>${lab}`;
      };
      return `<span class="lab">${l}</span><div class="drow"><div class="zero" style="left:${z}%"></div>${seg(a[i], "vfs")}${seg(b[i], "raw")}</div>`;
    }).join("");
  }
  diverge($("#div2"), M, AVG4, AVG5, -6, 9);
  chips($("#m2"), 1, (mi) => diverge($("#div3"), SHORT, T4.map((r) => r[mi]), T5.map((r) => r[mi]), -17, 19));

  /* ---------- result 3: AUC dumbbell ---------- */
  const lo = 0.3, hi = 1.0, px = (v) => ((v - lo) / (hi - lo)) * 100;
  $("#dumb").innerHTML = M.map((m, i) => {
    const a = AUCr[i], b = AUCv[i];
    return `<span class="lab">${m}</span><div class="drw">` +
      `<div class="chance" style="left:${px(0.5)}%"></div>` +
      `<div class="ln" style="left:${px(a)}%;width:${px(b) - px(a)}%"></div>` +
      `<div class="dot raw" style="left:${px(a)}%"></div><span class="val" style="right:calc(${100 - px(a)}% + 12px);color:#6a717d">${f2(a)}</span>` +
      `<div class="dot vfs" style="left:${px(b)}%"></div><span class="val" style="left:calc(${px(b)}% + 12px);color:var(--fake)">${f2(b)}</span>` +
      `</div>`;
  }).join("");
  $("#axis").innerHTML = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((v) => `<span style="left:${px(v)}%">${v.toFixed(1)}</span>`).join("");

  /* ---------- tables ---------- */
  function renderTables() {
    const head = (first) => `<thead><tr><th>${first}</th>${M.map((m) => `<th>${m}</th>`).join("")}</tr></thead>`;
    const row = (name, vals) => `<tr><td>${name}</td>${vals.map((v) => `<td>${v}</td>`).join("")}</tr>`;
    $("#t2").innerHTML =
      `<thead><tr><th>${t("Dataset", "Veri seti")}</th>${M.map((m) => `<th>VFS ${m}</th>`).join("")}<th>FID</th></tr></thead><tbody>` +
      DS.map((d, i) => row(d, T2[i].map(f2).concat(f2(FID[i])))).join("") +
      `<tr class="sum"><td>PCC (VFS, FID)</td>${PCC.map((v) => `<td>${f2(v)}</td>`).join("")}<td></td></tr></tbody>`;
    $("#t6").innerHTML = head("") + "<tbody>" +
      row("AUC", AUCv.map(f2)) +
      row(t("Mean VFS, good set", "Ort. VFS, iyi set"), GOOD.map(f2)) +
      row(t("Mean VFS, bad set", "Ort. VFS, kötü set"), BAD.map(f2)) +
      row(t("p, Welch’s t-test", "p, Welch t-testi"), PW) +
      row(t("p, Mann–Whitney U", "p, Mann–Whitney U"), PM) + "</tbody>";
    $("#t3").innerHTML = head("") + "<tbody>" +
      row(t("Single video pair", "Tek video çifti"), RT1) +
      row(t("400 video pairs", "400 video çifti"), RT400) + "</tbody>";
  }

  /* ---------- copy BibTeX ---------- */
  $("#copy").addEventListener("click", () => {
    const txt = $("#bib").textContent;
    const done = () => {
      $("#copyl").textContent = t("Copied", "Kopyalandı");
      setTimeout(() => { $("#copyl").textContent = t("Copy BibTeX", "BibTeX'i kopyala"); }, 1600);
    };
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents($("#bib"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      $("#copyl").textContent = t("Selected, press ⌘/Ctrl+C", "Seçildi, ⌘/Ctrl+C ile kopyalayın");
    };
    try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (e) { fallback(); }
  });

  setLang(lang);
})();

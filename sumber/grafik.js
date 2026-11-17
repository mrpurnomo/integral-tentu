/* Mesin grafik: bidang Kartesius SVG yang bisa dianimasikan + daerah di bawah dan antara kurva, serta katalog tujuh bagian materi. */
(function (root) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let idPola = 0;
  const S = (tag, attrs, ...anak) => { const e = document.createElementNS(NS, tag); for (const k in (attrs || {})) e.setAttribute(k, attrs[k]); anak.flat().forEach((a) => a != null && e.append(a.nodeType ? a : document.createTextNode(a))); return e; };
  const fmt = (n) => { const r = Math.round(n * 100) / 100; return String(r).replace('-', '−').replace('.', ','); };

  function sampel(f, a, b, n, lo, hi) {
    const out = []; let cur = [];
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = f(x); if (!isFinite(y) || y < lo || y > hi) { if (cur.length > 1) out.push(cur); cur = []; continue; } cur.push([x, y]); }
    if (cur.length > 1) out.push(cur); return out;
  }

  /* bidang Kartesius: sx/sy memetakan koordinat data ke piksel SVG */
  function bidang(o) {
    const W = o.W || 640, H = o.H || 440, m = { l: 54, r: 26, t: 26, b: 48 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const sx = (x) => m.l + (x - o.xmin) / (o.xmax - o.xmin) * pw, sy = (y) => m.t + ph - (y - o.ymin) / (o.ymax - o.ymin) * ph;
    const svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'bidang', role: 'img', 'aria-label': o.label || 'Grafik', style: 'width:100%;height:100%;display:block;overflow:visible;font-family:InstrumentSans,Segoe UI,sans-serif' });
    const lapis = {}; ['grid', 'isi', 'sumbu', 'label', 'putus', 'kurva', 'titik', 'atas'].forEach((n) => { lapis[n] = S('g', { class: 'l-' + n }); svg.append(lapis[n]); });
    /* arsiran gaya gambar teknik: garis diagonal emas (luas positif), merah (bagian negatif), navy (pembantu); id unik per grafik */
    const uid = 'ar' + (++idPola), POLA = [['#C9922F', '#E0AE4A'], ['#B3232D', '#C23A3F'], ['#13294B', '#2A5AA7']], defs = S('defs');
    POLA.forEach((c, i) => defs.append(S('pattern', { id: uid + i, width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, S('rect', { width: 9, height: 9, fill: c[1], 'fill-opacity': .16 }), S('line', { x1: 0, y1: 0, x2: 0, y2: 9, stroke: c[0], 'stroke-width': 3.6, 'stroke-opacity': .9 }))));
    svg.insertBefore(defs, svg.firstChild);
    svg.insertBefore(S('rect', { x: m.l, y: m.t, width: pw, height: ph, fill: '#fff', stroke: '#D8DEEA', rx: 6 }), lapis.grid);
    (o.xt || []).forEach((v) => { lapis.grid.append(S('line', { x1: sx(v), x2: sx(v), y1: m.t, y2: m.t + ph, stroke: '#E1E6F0' })); lapis.label.append(S('text', { x: sx(v), y: m.t + ph + 20, 'font-size': 15, 'text-anchor': 'middle', fill: '#2B3F58' }, fmt(v))); });
    (o.yt || []).forEach((v) => { lapis.grid.append(S('line', { x1: m.l, x2: m.l + pw, y1: sy(v), y2: sy(v), stroke: '#E1E6F0' })); lapis.label.append(S('text', { x: m.l - 9, y: sy(v) + 5, 'font-size': 15, 'text-anchor': 'end', fill: '#2B3F58' }, fmt(v))); });
    const ax = S('line', { class: 'sx', x1: m.l, x2: m.l + pw, y1: sy(Math.max(o.ymin, Math.min(o.ymax, 0))), y2: sy(Math.max(o.ymin, Math.min(o.ymax, 0))), stroke: '#12254A', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    const ay = S('line', { class: 'sy', x1: sx(Math.max(o.xmin, Math.min(o.xmax, 0))), x2: sx(Math.max(o.xmin, Math.min(o.xmax, 0))), y1: m.t, y2: m.t + ph, stroke: '#12254A', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    lapis.sumbu.append(ax, ay);
    const tx = S('text', { class: 'tx', x: m.l + pw - 2, y: m.t + ph + 40, 'font-size': 17, 'font-weight': 700, 'text-anchor': 'end', fill: '#12254A' }, o.labelX || 'x');
    const ty = S('text', { class: 'ty', x: m.l + 8, y: m.t + 14, 'font-size': 17, 'font-weight': 700, fill: '#12254A' }, o.labelY || 'y');
    if (!o.tanpaTick) lapis.label.append(tx, ty);
    const api = { svg, sx, sy, lapis, m, pw, ph, ax, ay, tx, ty, o, pola: (w) => 'url(#' + uid + (w || 0) + ')',
      titik(x, y, w) { w = w || {}; const g = S('g', { class: 'tt' }); const c = S('circle', { cx: sx(x), cy: sy(y), r: w.r || 8, fill: w.warna || '#13294B', stroke: '#fff', 'stroke-width': 3 }); g.append(c);
        if (w.teks !== false) { const t = S('text', { x: sx(x) + 12, y: sy(y) - 12, 'font-size': 17, 'font-weight': 700, fill: w.warnaTeks || '#2B3F58', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, '(' + fmt(x) + ', ' + fmt(y) + ')'); g.append(t); }
        g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; lapis.titik.append(g); return g; },
      putus(x, y, warna) { const v = S('line', { x1: sx(x), y1: sy(0 > o.ymax || 0 < o.ymin ? o.ymin : 0), x2: sx(x), y2: sy(0 > o.ymax || 0 < o.ymin ? o.ymin : 0), stroke: warna || '#C9922F', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round' });
        const h = S('line', { x1: sx(0 > o.xmax || 0 < o.xmin ? o.xmin : 0), y1: sy(y), x2: sx(0 > o.xmax || 0 < o.xmin ? o.xmin : 0), y2: sy(y), stroke: warna || '#C9922F', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round' }); lapis.putus.append(v, h); return { v, h, x, y }; },
      kurva(garis, w) { w = w || {}; const g = S('g'); (Array.isArray(garis[0][0]) ? garis : [garis]).forEach((seg) => { const d = seg.map((p, i) => (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1)).join(''); g.append(S('path', { d, fill: 'none', stroke: w.warna || '#13294B', 'stroke-width': w.tebal || 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': w.sembunyi ? 1 : null, 'stroke-dashoffset': w.sembunyi ? 1 : null })); }); lapis.kurva.append(g); return g; },
      tegak(x, warna) { const l = S('line', { x1: sx(x), x2: sx(x), y1: m.t, y2: m.t + ph, stroke: warna || '#2A5AA7', 'stroke-width': 2.4, 'stroke-dasharray': '8 6' }); lapis.kurva.append(l); return l; } };
    return api;
  }
  /* tumbuhkan garis putus dari titik awal ke akhir (rAF) */
  function tumbuh(line, x1, y1, x2, y2, ms, batal) {
    return new Promise((res, rej) => { ms = ms / (root.UI.instan ? 1e6 : root.UI.speed); const t0 = performance.now(); line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      const f = (t) => { if (batal && batal.batal) return rej(new root.UI.Batal()); const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); line.setAttribute('x2', x1 + (x2 - x1) * e); line.setAttribute('y2', y1 + (y2 - y1) * e); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  }
  const gambarKurva = (grp, ms, batal) => { const ps = [...grp.querySelectorAll('path')]; return Promise.all(ps.map((p) => root.UI.anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: ms, easing: 'cubic-bezier(.4,.1,.2,1)' }))).then(() => { if (batal) batal.cek(); }); };


  /* ================================================================== daerah di bawah / antara kurva
     spec = { tipe: 'x' | 'y', k: [polinom…], z: [{ u, l, a, b, w }] }
       tipe 'x': kurva y = p(x); daerah z di antara kurva atas k[u] dan kurva bawah k[l] untuk x dari a ke b (indeks −1 = sumbu-x)
       tipe 'y': kurva x = p(y); daerah z di antara kurva kanan k[u] dan kiri k[l] untuk y dari a ke b (indeks −1 = sumbu-y)
       w = 0 (hijau-tosca, luas positif) | 1 (merah muda, bagian negatif) */
  const pv = (p, x) => p.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
  const poli = (spec, i) => (i < 0 ? [0] : spec.k[i]);
  const WARNA_KURVA = ['#13294B', '#B3232D', '#2A5AA7', '#8C5A1E'];
  const langkahTick = (lo, hi) => { const raw = (hi - lo) / 14; let st = 1; for (const k of [1, 2, 5, 10, 20, 50, 100]) { st = k; if (k >= raw) break; } const o = []; for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) o.push(Math.round(v * 1e6) / 1e6); return o; };
  function lihat(spec) {
    if (spec.v) return Object.assign({ xt: langkahTick(spec.v.xmin, spec.v.xmax), yt: langkahTick(spec.v.ymin, spec.v.ymax) }, spec.v);
    const tipe = spec.tipe || 'x', d0 = Math.min.apply(null, spec.z.map((q) => q.a)), d1 = Math.max.apply(null, spec.z.map((q) => q.b)), pad = Math.max(1, (d1 - d0) * .28);
    let lo = Math.floor(d0 - pad), hi = Math.ceil(d1 + pad), vlo = 0, vhi = 0;
    spec.k.forEach((p) => { for (let i = 0; i <= 60; i++) { const v = pv(p, d0 + (d1 - d0) * i / 60); vlo = Math.min(vlo, v); vhi = Math.max(vhi, v); } });
    const vp = Math.max(1, (vhi - vlo) * .18); vlo = Math.floor(vlo - vp); vhi = Math.ceil(vhi + vp);
    return tipe === 'x' ? { xmin: lo, xmax: hi, ymin: vlo, ymax: vhi, xt: langkahTick(lo, hi), yt: langkahTick(vlo, vhi) } : { xmin: vlo, xmax: vhi, ymin: lo, ymax: hi, xt: langkahTick(vlo, vhi), yt: langkahTick(lo, hi) };
  }
  /* titik sampel kurva; swap=true → kurva x = p(y) */
  function sampelP(fn, a, b, n, lo, hi, swap) {
    const out = []; let cur = [];
    for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n, v = fn(t); if (!isFinite(v) || v < lo || v > hi) { if (cur.length > 1) out.push(cur); cur = []; continue; } cur.push(swap ? [v, t] : [t, v]); }
    if (cur.length > 1) out.push(cur); return out.length ? out : [[[0, 0], [0, 0]]];
  }
  const tumbuhIsi = (e, ms, tk) => new Promise((res, rej) => { const UI = root.UI; ms = ms / (UI.instan ? 1e6 : UI.speed); const t0 = performance.now(); const f = (t) => { if (tk && tk.batal) return rej(new UI.Batal()); const k = Math.min(1, (t - t0) / ms); e.bangun(1 - Math.pow(1 - k, 2)); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  function lukis(spec, o) {
    o = o || {}; const tipe = spec.tipe || 'x', v = lihat(spec), b = bidang(Object.assign({ W: o.W || 640, H: o.H || 440, label: o.label || 'Daerah yang dibatasi kurva' }, v, o.tanpaTick ? { xt: [], yt: [], tanpaTick: true } : {}));
    const kurva = spec.k.map((p, i) => b.kurva(tipe === 'x' ? sampelP((t) => pv(p, t), v.xmin, v.xmax, 260, v.ymin, v.ymax, false) : sampelP((t) => pv(p, t), v.ymin, v.ymax, 260, v.xmin, v.xmax, true), { warna: (o.warnaKurva || WARNA_KURVA)[i % 4], tebal: o.tebal || 4.8, sembunyi: !!o.animasi }));
    const isi = spec.z.map((z) => {
      const path = S('path', { fill: b.pola(z.w), stroke: 'none' }); b.lapis.isi.append(path); const U = poli(spec, z.u), L = poli(spec, z.l);
      const bangun = (t) => {
        if (t <= 0.001) { path.setAttribute('d', ''); return; } const e = z.a + (z.b - z.a) * t, N = 70, atas = [], bawah = [];
        for (let i = 0; i <= N; i++) { const s = z.a + (e - z.a) * i / N; atas.push(tipe === 'x' ? [s, pv(U, s)] : [pv(U, s), s]); bawah.push(tipe === 'x' ? [s, pv(L, s)] : [pv(L, s), s]); }
        const pts = atas.concat(bawah.reverse()); path.setAttribute('d', pts.map((p, i) => (i ? 'L' : 'M') + b.sx(p[0]).toFixed(1) + ' ' + b.sy(p[1]).toFixed(1)).join('') + 'Z');
      };
      bangun(o.animasi ? 0 : 1); return { path, bangun, z };
    });
    const titik = []; const sudah = new Set();
    if (o.titik !== false) spec.z.forEach((z) => [z.a, z.b].forEach((s) => { const idx = z.u >= 0 ? z.u : z.l, y = pv(poli(spec, idx), s), P = tipe === 'x' ? [s, y] : [y, s], kk = P.join(','); if (sudah.has(kk)) return; sudah.add(kk); const g = b.titik(P[0], P[1], { teks: o.labelTitik !== false, r: 7, warna: '#12254A' }); if (o.animasi) g.setAttribute('opacity', 0); titik.push(g); }));
    async function jalan(ms, tk) {
      const UI = root.UI; ms = ms || 1400;
      await Promise.all(kurva.map((g) => gambarKurva(g, ms, tk))); if (tk) tk.cek();
      titik.forEach((g) => g.setAttribute('opacity', 1));
      for (const e of isi) await tumbuhIsi(e, ms * .8, tk);
    }
    return { b, svg: b.svg, kurva, isi, titik, jalan, spec, selesai() { kurva.forEach((g) => g.querySelectorAll('path').forEach((p) => { p.removeAttribute('stroke-dasharray'); p.removeAttribute('stroke-dashoffset'); })); isi.forEach((e) => e.bangun(1)); titik.forEach((g) => g.setAttribute('opacity', 1)); } };
  }
  /* titik data tabel (butir tebak/cocok) pada bidang yang sama: dua deret titik, tanpa kurva */
  function dataSVG(item) {
    const sp = item.spec, tipe = sp.tipe || 'x', v = lihat(sp), b = bidang(Object.assign({ W: 460, H: 330, label: 'Titik-titik data ' + item.judul }, v)), ab = item.rows;
    item.pakai.forEach((ci, j) => ab.forEach((t) => { const val = pv(poli(sp, ci), t), P = tipe === 'x' ? [t, val] : [val, t]; b.lapis.titik.append(S('circle', { cx: b.sx(P[0]), cy: b.sy(P[1]), r: 7.5, fill: WARNA_KURVA[ci % 4], stroke: '#fff', 'stroke-width': 2.5 })); }));
    return b.svg;
  }

  /* ================================================================== katalog tujuh bagian materi */
  const K = {}, VR = (s) => '<i>' + s + '</i>';
  const vF = (nama, rumus, spec) => ({ nama, rumus, spec });
  const IGL = '∫<sub>a</sub><sup>b</sup>';
  K.bawah = { alias: ['Kurva di bawah sumbu-x', 'Luas dari nilai negatif'], ciri: ['Semua nilai f(x) negatif pada [a, b]: kurva berada di bawah sumbu-x.', 'Hasil integralnya negatif. Luas selalu positif, jadi luas = −∫ f(x) dx.'], konteks: ['Kedalaman parit atau dasar sungai diukur dari permukaan tanah.', 'Lengkung di bawah lantai jembatan kayu di kawasan mangrove.'],
    umum: 'L = −' + IGL + ' ' + VR('f') + '(' + VR('x') + ') ' + VR('dx') + ' = ' + IGL + ' (0 − ' + VR('f') + '(' + VR('x') + ')) ' + VR('dx') + ',&emsp;' + VR('f') + '(' + VR('x') + ') ≤ 0',
    varian: [vF('Parit · y = x² − 4x', VR('y') + ' = ' + VR('x') + '<sup>2</sup> − 4' + VR('x') + ',&emsp;1 ≤ ' + VR('x') + ' ≤ 3', { tipe: 'x', k: [[0, -4, 1]], z: [{ u: -1, l: 0, a: 1, b: 3, w: 1 }] }), vF('Bak · y = x² − 4', VR('y') + ' = ' + VR('x') + '<sup>2</sup> − 4,&emsp;−2 ≤ ' + VR('x') + ' ≤ 2', { tipe: 'x', k: [[-4, 0, 1]], z: [{ u: -1, l: 0, a: -2, b: 2, w: 1 }] })] };
  K.potong = { alias: ['Kurva memotong sumbu-x', 'Pecah interval di titik potong'], ciri: ['Kurva berada di atas dan di bawah sumbu-x pada [a, b].', 'Cari titik potong sumbu (f(x) = 0), pecah integral di sana, lalu ambil nilai mutlak tiap bagian.'], konteks: ['Profil pesisir: lembah di bawah muka air, lalu tanggul di atasnya.', 'Neraca bulanan: bulan rugi dan bulan untung.'],
    umum: 'L = |' + IGL.replace('<sup>b</sup>', '<sup>c</sup>') + ' ' + VR('f') + ' ' + VR('dx') + '| + |∫<sub>c</sub><sup>b</sup> ' + VR('f') + ' ' + VR('dx') + '|,&emsp;' + VR('f') + '(' + VR('c') + ') = 0',
    varian: [vF('Pesisir · y = x² − 2x − 3', VR('y') + ' = ' + VR('x') + '<sup>2</sup> − 2' + VR('x') + ' − 3,&emsp;0 ≤ ' + VR('x') + ' ≤ 4', { tipe: 'x', k: [[-3, -2, 1]], z: [{ u: -1, l: 0, a: 0, b: 3, w: 1 }, { u: 0, l: -1, a: 3, b: 4, w: 0 }] }), vF('Tanggul · y = x² − 4', VR('y') + ' = ' + VR('x') + '<sup>2</sup> − 4,&emsp;1 ≤ ' + VR('x') + ' ≤ 3', { tipe: 'x', k: [[-4, 0, 1]], z: [{ u: -1, l: 0, a: 1, b: 2, w: 1 }, { u: 0, l: -1, a: 2, b: 3, w: 0 }] })] };
  K.garis = { alias: ['Atas dikurangi bawah', 'Titik potong parabola dan garis'], ciri: ['Satu tepi lurus dan satu tepi melengkung membatasi daerah tertutup.', 'Batas a dan b adalah titik potong (samakan kedua persamaan). Uji satu titik di antaranya untuk tahu kurva mana yang di atas.'], konteks: ['Taman atau kolam yang satu sisinya lurus, sisi lainnya melengkung.', 'Selisih penerimaan dan biaya.'],
    umum: 'L = ' + IGL + ' (' + VR('y') + '<sub>atas</sub> − ' + VR('y') + '<sub>bawah</sub>) ' + VR('dx'),
    varian: [vF('Garis di atas · y = x − 1', VR('y') + ' = ' + VR('x') + '<sup>2</sup> − 4' + VR('x') + ' + 3&emsp;dan&emsp;' + VR('y') + ' = ' + VR('x') + ' − 1', { tipe: 'x', k: [[3, -4, 1], [-1, 1]], z: [{ u: 1, l: 0, a: 1, b: 4, w: 0 }] }), vF('Parabola di atas · y = 4x − x²', VR('y') + ' = 4' + VR('x') + ' − ' + VR('x') + '<sup>2</sup>&emsp;dan&emsp;' + VR('y') + ' = ' + VR('x'), { tipe: 'x', k: [[0, 4, -1], [0, 1]], z: [{ u: 0, l: 1, a: 0, b: 3, w: 0 }] })] };
  K.parab = { alias: ['Dua kurva melengkung', 'Daerah berbentuk lensa'], ciri: ['Dua parabola: yang membuka ke bawah berada di atas, yang membuka ke atas berada di bawah.', 'Daerah lensa tertutup di antara dua titik potong; satu integral cukup.'], konteks: ['Kolam berbentuk lensa.', 'Lubang air di bawah jembatan lengkung.'],
    umum: 'L = ' + IGL + ' (' + VR('f') + '(' + VR('x') + ') − ' + VR('g') + '(' + VR('x') + ')) ' + VR('dx') + ',&emsp;' + VR('f') + ' ≥ ' + VR('g'),
    varian: [vF('Lensa · 4x − x² dan x² − 2x', VR('y') + ' = 4' + VR('x') + ' − ' + VR('x') + '<sup>2</sup>&emsp;dan&emsp;' + VR('y') + ' = ' + VR('x') + '<sup>2</sup> − 2' + VR('x'), { tipe: 'x', k: [[0, 4, -1], [0, -2, 1]], z: [{ u: 0, l: 1, a: 0, b: 3, w: 0 }] }), vF('Kebun · 6 − x² dan x² − 2', VR('y') + ' = 6 − ' + VR('x') + '<sup>2</sup>&emsp;dan&emsp;' + VR('y') + ' = ' + VR('x') + '<sup>2</sup> − 2', { tipe: 'x', k: [[6, 0, -1], [-2, 0, 1]], z: [{ u: 0, l: 1, a: -2, b: 2, w: 0 }] })] };
  K.silang = { alias: ['Atas dan bawah bertukar', 'Dua daerah (dua lobus)'], ciri: ['Dua kurva berpotongan di tiga titik: posisi atas dan bawah bertukar di titik tengah.', 'Integral dipecah di titik potong tengah. Tiap bagian: kurva atas dikurangi kurva bawah.'], konteks: ['Dua jalur kabel yang bersilangan.', 'Dua grafik biaya yang saling menyalip.'],
    umum: 'L = ' + IGL.replace('<sup>b</sup>', '<sup>c</sup>') + ' (' + VR('f') + ' − ' + VR('g') + ') ' + VR('dx') + ' + ∫<sub>c</sub><sup>b</sup> (' + VR('g') + ' − ' + VR('f') + ') ' + VR('dx'),
    varian: [vF('Kubik dan garis · x³ − 3x dan x', VR('y') + ' = ' + VR('x') + '<sup>3</sup> − 3' + VR('x') + '&emsp;dan&emsp;' + VR('y') + ' = ' + VR('x'), { tipe: 'x', k: [[0, -3, 0, 1], [0, 1]], z: [{ u: 0, l: 1, a: -2, b: 0, w: 0 }, { u: 1, l: 0, a: 0, b: 2, w: 1 }] }), vF('Kubik dan garis · x³ dan x', VR('y') + ' = ' + VR('x') + '<sup>3</sup>&emsp;dan&emsp;' + VR('y') + ' = ' + VR('x'), { tipe: 'x', k: [[0, 0, 0, 1], [0, 1]], z: [{ u: 0, l: 1, a: -1, b: 0, w: 0 }, { u: 1, l: 0, a: 0, b: 1, w: 1 }] })] };
  K.sumbuy = { alias: ['Irisan datar (dy)', 'Daerah terhadap sumbu-y'], ciri: ['Kurva ditulis x = g(y); batasnya sumbu-y (x = 0) dan garis y = c, y = d.', 'Iris daerah secara datar: lebar tiap irisan adalah x (di kanan sumbu-y) atau −x (di kiri sumbu-y).'], konteks: ['Petak mangrove di tepi jalan lurus.', 'Lahan di samping sungai yang lurus.'],
    umum: 'L = ∫<sub>c</sub><sup>d</sup> ' + VR('x') + ' ' + VR('dy') + '&emsp;(' + VR('x') + ' ≥ 0, di kanan sumbu-' + VR('y') + ')',
    varian: [vF('Petak · x = 4 − y²', VR('x') + ' = 4 − ' + VR('y') + '<sup>2</sup>,&emsp;−2 ≤ ' + VR('y') + ' ≤ 2', { tipe: 'y', k: [[4, 0, -1]], z: [{ u: 0, l: -1, a: -2, b: 2, w: 0 }] }), vF('Lahan · x = y², 0 ≤ y ≤ 3', VR('x') + ' = ' + VR('y') + '<sup>2</sup>,&emsp;0 ≤ ' + VR('y') + ' ≤ 3', { tipe: 'y', k: [[0, 0, 1]], z: [{ u: 0, l: -1, a: 0, b: 3, w: 0 }] })] };
  K.kanan = { alias: ['Kanan − kiri', 'Dua kurva terhadap sumbu-y'], ciri: ['Kedua kurva ditulis x = …, jadi titik potong dicari terhadap y.', 'Irisan datar: x kanan dikurangi x kiri, dari y = c sampai y = d. Cukup satu integral, tanpa memecah.'], konteks: ['Dua kanal dengan petak sawah di antaranya.', 'Dua tepi sawah pasang surut.'],
    umum: 'L = ∫<sub>c</sub><sup>d</sup> (' + VR('x') + '<sub>kanan</sub> − ' + VR('x') + '<sub>kiri</sub>) ' + VR('dy'),
    varian: [vF('Kanal · x = y² − 2 dan x = y', VR('x') + ' = ' + VR('y') + '<sup>2</sup> − 2&emsp;dan&emsp;' + VR('x') + ' = ' + VR('y'), { tipe: 'y', k: [[-2, 0, 1], [0, 1]], z: [{ u: 1, l: 0, a: -1, b: 2, w: 0 }] }), vF('Sawah · x = y² dan x = y + 2', VR('x') + ' = ' + VR('y') + '<sup>2</sup>&emsp;dan&emsp;' + VR('x') + ' = ' + VR('y') + ' + 2', { tipe: 'y', k: [[0, 0, 1], [2, 1]], z: [{ u: 1, l: 0, a: -1, b: 2, w: 0 }] })] };
  Object.keys(K).forEach((f) => K[f].varian.forEach((x) => { x.panjang = x.rumus.replace(/<[^>]+>/g, '').length > 24; }));
  /* gambar satu varian ke dalam bidang baru; animasi opsional (kurva digambar, lalu daerah terisi) */
  const gambarVarian = (v, o) => lukis(v.spec, Object.assign({ animasi: true }, o));
  const statis = (v, o) => lukis(v.spec, Object.assign({ animasi: false, tebal: 4.6 }, o));
  /* grafik statis untuk soal (tes awal): kembalikan elemen SVG atau string HTML */
  const soalSVG = (q) => lukis(q.grafik.spec, { W: q.grafik.W || 420, H: q.grafik.H || 300, label: 'Grafik soal' }).svg;
  const soalHTML = (q) => (q.grafik ? '<div class="gambar-soal">' + soalSVG(q).outerHTML + '</div>' : '');
  root.GF = { soalSVG, soalHTML, S, fmt, sampel, bidang, tumbuh, gambarKurva, K, lukis, lihat, dataSVG, gambarVarian, statis, pv, tumbuhIsi };
})(window);

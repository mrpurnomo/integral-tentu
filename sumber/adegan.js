/* ADEGAN — mesin animasi bergaya Manim untuk pengantar, pelajaran kelompok, dan pembahasan soal.
   Setiap LANGKAH adalah satu KEADAAN lengkap (grafik + papan hitung). Perpindahan antar keadaan (maju maupun mundur) adalah morf dari keadaan yang
   sedang tampak ke keadaan tujuan: kurva menggambar/menghapus diri, arsiran menyapu, zoom bergeser, angka dan suku terbang ke posisi barunya.
   Karena tujuannya selalu keadaan, tombol Mundur memutar animasi yang sama secara terbalik (bukan potong dari awal), dan menekan tombol
   saat animasi berjalan melanjutkan dari posisi yang sedang tampak. */
(function (root) {
  'use strict';
  const { el, ik } = UI, { S } = GF;
  const spd = () => (UI.instan ? 1e6 : (UI.speed || 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const mn = (n) => String(n).replace('-', '−');
  const salin = (o) => JSON.parse(JSON.stringify(o));
  const PAL = {
    gelap: { emas: '#FFC94A', merah: '#FF6B70', biru: '#62C6FF', putih: '#F4F7FF', redup: '#6F7FA3', hijau: '#5EE6A8', sumbu: '#F4F7FF', grid: 'rgba(160,185,255,.11)', label: '#9FB0D4', bg: '#0A1428', kotak: 'rgba(255,255,255,.03)' },
    terang: { emas: '#C98A0B', merah: '#C23A3F', biru: '#2A6FC4', putih: '#12254A', redup: '#9AA5BD', hijau: '#1F9D6B', sumbu: '#12254A', grid: 'rgba(18,37,74,.10)', label: '#44567A', bg: '#FFFFFF', kotak: '#FFFFFF' }
  };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixWarna = (a, b, k) => { if (a === b || k >= 1) return b; if (k <= 0) return a; const A = hex(a), B = hex(b); return '#' + [0, 1, 2].map((i) => Math.round(lerp(A[i], B[i], k)).toString(16).padStart(2, '0')).join(''); };
  let idKv = 0;

  /* ===================================================================== model grafik: pencampuran dua keadaan */
  const ARR = ['p', 'U', 'L'], NUM = ['op', 'g', 'tb', 'a', 'b', 'x', 'y', 's', 'dx', 'dy', 'gx', 'gy', 'at'];
  function masuk(B) {   // bentuk "belum muncul" suatu butir
    const A = salin(B);
    if (A.t === 'k') A.g = 0; else { if ('op' in A) A.op = 0; if ('g' in A) A.g = 0; if ('s' in A) A.s = 0; if ('gx' in A) A.gx = 0; if ('gy' in A) A.gy = 0; }
    return A;
  }
  function campurButir(A, B, k, pal) {
    const o = salin(B);
    NUM.forEach((n) => { if (typeof A[n] === 'number' && typeof B[n] === 'number') o[n] = lerp(A[n], B[n], k); });
    ARR.forEach((n) => { if (Array.isArray(A[n]) && Array.isArray(B[n])) { const m = Math.max(A[n].length, B[n].length); o[n] = Array.from({ length: m }, (_, i) => lerp(A[n][i] || 0, B[n][i] || 0, k)); } });
    if (A.c && B.c) o.c = mixWarna(pal[A.c] || pal.putih, pal[B.c] || pal.putih, k), o.cn = B.c; else if (B.c) o.cn = B.c;
    if (A.tex !== B.tex) { o.tex = k < .5 ? A.tex : B.tex; o.lap = Math.abs(k - .5) * 2; }
    return o;
  }
  function campurG(A, B, k, mundur) {   // A, B = model grafik (atau null)
    if (!A && !B) return null;
    const pal = PAL.gelap; const G = {};
    const kosong = (v) => ({ v: salin(v), ax: 0, grid: 0, items: {}, angka: true });
    const a = A || kosong(B.v), b = B || kosong(A.v);
    G.angka = b.angka; G.v = {}; const va = a.v, vb = b.v;
    const cx0 = (va.x0 + va.x1) / 2, cx1 = (vb.x0 + vb.x1) / 2, cy0 = (va.y0 + va.y1) / 2, cy1 = (vb.y0 + vb.y1) / 2, wx0 = (va.x1 - va.x0) / 2, wx1 = (vb.x1 - vb.x0) / 2, wy0 = (va.y1 - va.y0) / 2, wy1 = (vb.y1 - vb.y0) / 2;
    const e = ease(k), cx = lerp(cx0, cx1, e), cy = lerp(cy0, cy1, e), wx = wx0 * Math.pow(wx1 / wx0, e), wy = wy0 * Math.pow(wy1 / wy0, e);
    G.v = { x0: cx - wx, x1: cx + wx, y0: cy - wy, y1: cy + wy }; G.ax = lerp(a.ax, b.ax, ease(k)); G.grid = lerp(a.grid, b.grid, ease(k)); G.items = {};
    const ids = []; Object.keys(a.items).forEach((i) => ids.push(i)); Object.keys(b.items).forEach((i) => { if (!(i in a.items)) ids.push(i); });
    ids.forEach((id) => {
      const IA = a.items[id], IB = b.items[id], ref = mundur ? (IA || IB) : (IB || IA), d = clamp(ref.d || 0, 0, .85);
      const kk = mundur ? clamp(k / (1 - d), 0, 1) : clamp((k - d) / (1 - d), 0, 1), e2 = ease(kk);
      let A2 = IA, B2 = IB; if (!A2) A2 = masuk(B2); if (!B2) B2 = masuk(A2);
      G.items[id] = campurButir(A2, B2, e2, pal);
    });
    return G;
  }

  /* ===================================================================== KANVAS: bidang Kartesius */
  const polyV = (p, x) => { let s = 0; for (let i = p.length - 1; i >= 0; i--) s = s * x + p[i]; return s; };
  class Kanvas {
    constructor(host, o) {
      o = o || {}; this.tema = o.tema || 'gelap'; this.pal = PAL[this.tema]; this.W = o.W || 820; this.H = o.H || 740; this.m = o.m || { l: 54, r: 40, t: 28, b: 50 }; this.pw = this.W - this.m.l - this.m.r; this.ph = this.H - this.m.t - this.m.b; this.pool = new Map(); this.G = null;
      const id = this.id = 'kv' + (++idKv), svg = this.svg = S('svg', { viewBox: '0 0 ' + this.W + ' ' + this.H, class: 'kv kv-' + this.tema, role: 'img', 'aria-label': o.label || 'Grafik pada bidang koordinat' });
      const defs = S('defs'); defs.append(S('clipPath', { id: id + 'c' }, S('rect', { x: this.m.l, y: this.m.t, width: this.pw, height: this.ph })));
      ['emas', 'merah', 'biru', 'hijau'].forEach((n) => { const c = this.pal[n]; defs.append(S('pattern', { id: id + n, width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, S('rect', { width: 10, height: 10, fill: c, 'fill-opacity': this.tema === 'gelap' ? .2 : .16 }), S('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: c, 'stroke-width': 3.4, 'stroke-opacity': .9 }))); });
      svg.append(defs); this.L = {}; ['kotak', 'grid', 'sumbu', 'isi', 'guide', 'kurva', 'titik', 'teks'].forEach((n) => { const g = S('g', { class: 'kv-' + n }); if (['isi', 'guide', 'kurva'].includes(n)) g.setAttribute('clip-path', 'url(#' + id + 'c)'); svg.append(g); this.L[n] = g; });
      this.L.kotak.append(S('rect', { x: this.m.l, y: this.m.t, width: this.pw, height: this.ph, rx: 6, fill: this.pal.kotak, stroke: this.pal.grid }));
      host.append(svg);
    }
    sx(x) { return this.m.l + (x - this.G.v.x0) / (this.G.v.x1 - this.G.v.x0) * this.pw; }
    sy(y) { return this.m.t + this.ph - (y - this.G.v.y0) / (this.G.v.y1 - this.G.v.y0) * this.ph; }
    langkah(span, px, jarak) { for (const s of [1, 2, 5, 10, 20, 50, 100, 200]) if (s * px / span >= jarak) return s; return 500; }
    ambil(id, buat) { let o = this.pool.get(id); if (!o) { o = buat(); o.pakai = true; this.pool.set(id, o); } o.pakai = true; return o; }
    render(G) {
      this.G = G; const { m, pw, ph } = this, pal = this.pal;
      if (!G) return; const sx = (x) => this.sx(x), sy = (y) => this.sy(y), V = G.v;
      this.pool.forEach((o) => { o.pakai = false; });
      /* grid, sumbu, angka (interval 1 selama ruangnya cukup) */
      const sxn = this.langkah(V.x1 - V.x0, pw, 34), syn = this.langkah(V.y1 - V.y0, ph, 28), yA = clamp(0, V.y0, V.y1), xA = clamp(0, V.x0, V.x1), pyA = sy(yA), pxA = sx(xA), a = G.grid, ax = G.ax; let g = '', s = '';
      for (let x = Math.ceil(V.x0 / sxn - 1e-9) * sxn; x <= V.x1 + 1e-9; x += sxn) { if (x === 0) continue; g += '<line class="kg" x1="' + sx(x).toFixed(1) + '" x2="' + sx(x).toFixed(1) + '" y1="' + m.t + '" y2="' + (m.t + ph) + '" opacity="' + a + '"/>'; }
      for (let y = Math.ceil(V.y0 / syn - 1e-9) * syn; y <= V.y1 + 1e-9; y += syn) { if (y === 0) continue; g += '<line class="kg" y1="' + sy(y).toFixed(1) + '" y2="' + sy(y).toFixed(1) + '" x1="' + m.l + '" x2="' + (m.l + pw) + '" opacity="' + a + '"/>'; }
      this.L.grid.innerHTML = g;
      const xe = m.l + pw * ax, ye = m.t + ph - ph * ax;
      s += '<line class="ka" x1="' + m.l + '" x2="' + xe.toFixed(1) + '" y1="' + pyA.toFixed(1) + '" y2="' + pyA.toFixed(1) + '"/><line class="ka" x1="' + pxA.toFixed(1) + '" x2="' + pxA.toFixed(1) + '" y1="' + (m.t + ph) + '" y2="' + ye.toFixed(1) + '"/>';
      if (ax > .96) s += '<path class="kp" d="M' + (m.l + pw + 9) + ' ' + pyA.toFixed(1) + 'l-15 -7v14z"/><path class="kp" d="M' + pxA.toFixed(1) + ' ' + (m.t - 9) + 'l-7 15h14z"/><text class="kn" x="' + (m.l + pw - 4) + '" y="' + (pyA - 14).toFixed(1) + '" text-anchor="end">x</text><text class="kn" x="' + (pxA + 16).toFixed(1) + '" y="' + (m.t + 16) + '">y</text>';
      if (G.angka !== false) {
        for (let x = Math.ceil(V.x0 / sxn - 1e-9) * sxn; x <= V.x1 + 1e-9; x += sxn) { if (x === 0) continue; const px = sx(x); s += '<line class="kt" x1="' + px.toFixed(1) + '" x2="' + px.toFixed(1) + '" y1="' + (pyA - 6).toFixed(1) + '" y2="' + (pyA + 6).toFixed(1) + '" opacity="' + a + '"/><text class="kl" x="' + px.toFixed(1) + '" y="' + Math.min(m.t + ph - 5, pyA + 27).toFixed(1) + '" text-anchor="middle" opacity="' + a + '">' + mn(Math.round(x * 100) / 100) + '</text>'; }
        for (let y = Math.ceil(V.y0 / syn - 1e-9) * syn; y <= V.y1 + 1e-9; y += syn) { if (y === 0) continue; const py = sy(y); s += '<line class="kt" y1="' + py.toFixed(1) + '" y2="' + py.toFixed(1) + '" x1="' + (pxA - 6).toFixed(1) + '" x2="' + (pxA + 6).toFixed(1) + '" opacity="' + a + '"/><text class="kl" x="' + Math.max(m.l + 4, pxA - 13).toFixed(1) + '" y="' + (py + 6).toFixed(1) + '" text-anchor="end" opacity="' + a + '">' + mn(Math.round(y * 100) / 100) + '</text>'; }
        if (V.x0 <= 0 && V.x1 >= 0 && V.y0 <= 0 && V.y1 >= 0) s += '<text class="kl" x="' + (pxA - 13).toFixed(1) + '" y="' + (pyA + 27).toFixed(1) + '" text-anchor="end" opacity="' + a + '">0</text>';
      }
      this.L.sumbu.innerHTML = s;
      const kv = (id) => G.items[id];
      Object.keys(G.items).forEach((id) => {
        const it = G.items[id], col = pal[it.c] || it.c || pal.putih;
        if (it.t === 'k') {
          const o = this.ambil(id, () => { const e = S('path', { class: 'kc', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); this.L.kurva.append(e); return { e }; });
          if (it.g <= .001 || it.op <= .001) { o.e.setAttribute('d', ''); return; }
          const sw = !!it.sw, lo = sw ? V.y0 : V.x0, hi = sw ? V.y1 : V.x1, e1 = lo + (hi - lo) * it.g, N = 240; let d = ''; const lim = 1e4;
          for (let i = 0; i <= N; i++) { const t = lo + (e1 - lo) * i / N, f = clamp(polyV(it.p, t), -lim, lim); d += (i ? 'L' : 'M') + (sw ? sx(f) : sx(t)).toFixed(1) + ' ' + (sw ? sy(t) : sy(f)).toFixed(1); }
          o.e.setAttribute('d', d); o.e.setAttribute('stroke', col); o.e.setAttribute('stroke-width', (5.2 * (it.tb || 1)).toFixed(2)); o.e.setAttribute('opacity', it.op.toFixed(3)); o.e.style.color = col;
        } else if (it.t === 'a') {
          const o = this.ambil(id, () => { const e = S('path', { stroke: 'none' }); this.L.isi.append(e); return { e }; });
          if (it.g <= .001 || it.op <= .001) { o.e.setAttribute('d', ''); return; }
          const sw = !!it.sw, e1 = it.a + (it.b - it.a) * it.g, N = 90, at = [], bw = [];
          for (let i = 0; i <= N; i++) { const t = it.a + (e1 - it.a) * i / N, u = polyV(it.U, t), l = polyV(it.L, t); at.push(sw ? [u, t] : [t, u]); bw.push(sw ? [l, t] : [t, l]); }
          o.e.setAttribute('d', at.concat(bw.reverse()).map((q, i) => (i ? 'L' : 'M') + sx(q[0]).toFixed(1) + ' ' + sy(q[1]).toFixed(1)).join('') + 'Z'); o.e.setAttribute('fill', 'url(#' + this.id + (it.cn || (pal[it.c] ? it.c : 'emas')) + ')'); o.e.setAttribute('opacity', it.op.toFixed(3));
        } else if (it.t === 'g') {
          const o = this.ambil(id, () => { const v1 = S('line', { class: 'kv-put' }), h1 = S('line', { class: 'kv-put' }), tx = S('text', { class: 'kv-ft', 'text-anchor': 'middle' }), ty = S('text', { class: 'kv-ft', 'text-anchor': 'end' }); this.L.guide.append(v1, h1, tx, ty); return { v1, h1, tx, ty }; });
          const px = sx(it.x), py = sy(it.y), p0x = sx(xA), p0y = sy(yA), vis = it.op > .001;
          o.v1.setAttribute('x1', px); o.v1.setAttribute('x2', px); o.v1.setAttribute('y1', p0y); o.v1.setAttribute('y2', p0y + (py - p0y) * (it.gx == null ? 1 : it.gx));
          o.h1.setAttribute('y1', py); o.h1.setAttribute('y2', py); o.h1.setAttribute('x1', p0x); o.h1.setAttribute('x2', p0x + (px - p0x) * (it.gy == null ? 1 : it.gy));
          [o.v1, o.h1].forEach((l) => { l.setAttribute('stroke', col); l.setAttribute('opacity', vis ? it.op : 0); l.setAttribute('stroke-width', 3.4); l.setAttribute('stroke-dasharray', '9 8'); l.setAttribute('stroke-linecap', 'round'); });
          const lab = G.angka !== false && it.lab !== false;
          o.tx.textContent = mn(Math.round(it.x * 100) / 100); o.tx.setAttribute('x', px); o.tx.setAttribute('y', clamp(p0y + (it.y >= 0 ? 29 : -12), m.t + 18, m.t + ph - 4)); o.tx.setAttribute('fill', col); o.tx.setAttribute('opacity', lab && vis ? clamp((it.gx || 0) * 1.4 - .2, 0, 1) * it.op : 0);
          o.ty.textContent = mn(Math.round(it.y * 100) / 100); o.ty.setAttribute('x', p0x - 14); o.ty.setAttribute('y', py + 7); o.ty.setAttribute('fill', col); o.ty.setAttribute('opacity', lab && vis ? clamp((it.gy || 0) * 1.4 - .2, 0, 1) * it.op : 0);
        } else if (it.t === 'p') {
          const o = this.ambil(id, () => { const h = S('circle', { class: 'kv-halo' }), c = S('circle', { class: 'kv-pt' }), t = S('text', { class: 'kv-lab' }); this.L.titik.append(h, c, t); return { h, c, t }; });
          const px = sx(it.x), py = sy(it.y), sc = it.s == null ? 1 : it.s, r = 9 * sc;
          o.c.setAttribute('cx', px); o.c.setAttribute('cy', py); o.c.setAttribute('r', Math.max(0, r)); o.c.setAttribute('fill', col); o.c.setAttribute('stroke', pal.bg); o.c.setAttribute('opacity', it.op);
          o.h.setAttribute('cx', px); o.h.setAttribute('cy', py); o.h.setAttribute('r', Math.max(0, r + 8)); o.h.setAttribute('fill', col); o.h.setAttribute('opacity', .26 * sc * it.op);
          o.t.textContent = G.angka === false ? '' : (it.lab || ''); o.t.setAttribute('x', px + (it.dx == null ? 14 : it.dx)); o.t.setAttribute('y', py + (it.dy == null ? -14 : it.dy)); o.t.setAttribute('fill', pal.putih); o.t.setAttribute('opacity', it.op * clamp(sc * 1.5 - .3, 0, 1)); o.t.setAttribute('text-anchor', it.an || 'start');
        } else if (it.t === 't') {
          const o = this.ambil(id, () => { const fo = S('foreignObject', { width: 2, height: 2, class: 'kv-fo' }), dv = el('div', { kelas: 'kv-fd' }); fo.append(dv); this.L.teks.append(fo); return { fo, dv, tex: null }; });
          let x = it.x, y = it.y; if (it.on) { const c = kv(it.on); if (c) { x = it.at; y = polyV(c.p, it.at); if (c.sw) { const tmp = x; x = y; y = tmp; } } }
          if (o.tex !== it.tex) { o.dv.innerHTML = Mat.tex(it.tex); o.tex = it.tex; }
          o.fo.setAttribute('x', sx(x) + (it.dx || 0)); o.fo.setAttribute('y', sy(y) + (it.dy || 0)); o.dv.style.color = col; o.dv.style.opacity = (it.op * (it.lap == null ? 1 : it.lap)).toFixed(3); o.dv.style.transform = 'translate(' + (it.an === 'r' ? '-100%' : (it.an === 'c' ? '-50%' : '0')) + ',-50%)';
        }
      });
      this.pool.forEach((o, id) => { if (!o.pakai) { Object.keys(o).forEach((k) => { if (o[k] && o[k].remove) o[k].remove(); }); this.pool.delete(id); } });
    }
  }

  /* ===================================================================== PAPAN: baris hitungan besar, token (KaTeX) bergerak */
  const TKN = (id, tex, c, o) => Object.assign({ id, tex, c: c || 'putih' }, o || {});
  class Papan {
    constructor(host) { this.root = el('div', { kelas: 'bd' }); host.append(this.root); this.model = null; this.fi = 0; }
    ukur(lebar) {
      const rootW = (lebar || this.root.clientWidth || 600) - 40;
      this.root.querySelectorAll('.bd-l').forEach((ln) => { const e = ln.querySelector('.bd-e'); if (!e) return; ln.style.setProperty('--esk', 1); const w = e.scrollWidth, avail = rootW * .94; if (w > avail) ln.style.setProperty('--esk', (avail / w).toFixed(3)); });
    }
    bangun(m, lebar) {
      const r = this.root; r.innerHTML = ''; r.style.setProperty('--fs', (m.fs || 2.7) + 'rem'); r.className = 'bd' + (m.rata === 'kiri' ? ' rata-kiri' : '');
      (m.lines || []).forEach((L) => {
        const ln = el('div', { kelas: 'bd-l sz-' + (L.sz || 'b') + (L.kls ? ' ' + L.kls : ''), 'data-id': L.id, 'data-op': L.op == null ? 1 : L.op }); ln.style.opacity = L.op == null ? 1 : L.op;
        if (L.ket) ln.append(el('span', { kelas: 'bd-k bd-t', 'data-id': 'k:' + L.id, html: Mat.h(L.ket) }));
        const e = el('div', { kelas: 'bd-e' }); (L.tok || []).forEach((t) => { const s = el('span', { kelas: 'bd-t c-' + (t.c || 'putih') + (t.txt ? ' txt' : '') + (t.kls ? ' ' + t.kls : ''), 'data-id': t.id, 'data-c': t.c || 'putih', 'data-sig': (t.txt ? 'T:' : 'K:') + (t.tex || t.txt) }); if (t.hl) s.dataset.hl = 1; s.innerHTML = t.txt ? Mat.h(t.txt) : Mat.tex(t.tex); e.append(s); }); ln.append(e); r.append(ln);
      });
      this.ukur(lebar);
    }
    /* ganti papan dengan morf: token ber-id sama terbang ke tempat barunya (dan berubah warna/isi), yang baru muncul, yang hilang memudar */
    async tampil(m, o) {
      o = o || {}; const r = this.root, lama = new Map(), lamaLn = new Map();
      r.querySelectorAll('[data-id]').forEach((e) => { const rc = e.getBoundingClientRect(); if (e.classList.contains('bd-l')) lamaLn.set(e.dataset.id, { op: parseFloat(getComputedStyle(e).opacity) }); else lama.set(e.dataset.id, { r: rc, c: getComputedStyle(e).color, html: e.innerHTML, sig: e.dataset.sig, cls: e.className }); });
      const hant = r.querySelectorAll('.bd-hantu'); hant.forEach((h) => h.remove()); r.getAnimations && r.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      this.bangun(m, o.lebar); this.model = m;
      if (o.instan || !lama.size && !m.lines.length) return;
      const rr = r.getBoundingClientRect(), ms = (o.ms || 1100) / spd(), dur = Math.max(300, ms * .9), job = [], sdh = new Set(); let n = 0;
      const A = (e, kf, opt) => { try { return e.animate(kf, Object.assign({ fill: 'backwards', easing: 'cubic-bezier(.65,0,.35,1)' }, opt)).finished.catch(() => {}); } catch (x) { return Promise.resolve(); } };
      r.querySelectorAll('.bd-l').forEach((ln) => { const l0 = lamaLn.get(ln.dataset.id), op = parseFloat(ln.dataset.op); if (l0 && Math.abs(l0.op - op) > .01) job.push(A(ln, [{ opacity: l0.op }, { opacity: op }], { duration: dur })); });
      r.querySelectorAll('.bd-t[data-id]').forEach((e) => {
        const id = e.dataset.id, w = lama.get(id), rc = e.getBoundingClientRect(), warna = getComputedStyle(e).color; sdh.add(id);
        if (w) {
          const dx = w.r.left - rc.left, dy = w.r.top - rc.top, beda = w.sig !== e.dataset.sig;
          if (beda) {
            const g = el('span', { kelas: w.cls + ' bd-hantu', html: w.html, gaya: 'position:absolute;left:' + (w.r.left - rr.left) + 'px;top:' + (w.r.top - rr.top) + 'px;margin:0;pointer-events:none;white-space:nowrap;color:' + w.c }); r.append(g);
            job.push(A(g, [{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (-dx) + 'px,' + (-dy) + 'px)', opacity: 0, offset: .6 }, { transform: 'translate(' + (-dx) + 'px,' + (-dy) + 'px)', opacity: 0 }], { duration: dur, fill: 'both' }).then(() => g.remove()));
            job.push(A(e, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: 0, color: w.c }, { opacity: 0, offset: .35 }, { transform: 'none', opacity: 1, color: warna }], { duration: dur }));
          } else if (Math.abs(dx) > .5 || Math.abs(dy) > .5 || w.c !== warna) job.push(A(e, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)', color: w.c }, { transform: 'none', color: warna }], { duration: dur }));
        } else job.push(A(e, [{ opacity: 0, transform: 'translateY(.55rem) scale(.86)' }, { opacity: 1, transform: 'none' }], { duration: dur * .75, delay: Math.min(520, (n++) * 90) / spd(), easing: 'cubic-bezier(.2,.8,.2,1)' }));
        if (e.dataset.hl && !o.mundur) job.push(A(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.16)', offset: .4 }, { transform: 'scale(1)' }], { duration: 700 / spd(), delay: dur * .85, fill: 'none', easing: 'ease-in-out' }));
      });
      lama.forEach((w, id) => { if (sdh.has(id)) return; const g = el('span', { kelas: w.cls + ' bd-hantu', html: w.html, gaya: 'position:absolute;left:' + (w.r.left - rr.left) + 'px;top:' + (w.r.top - rr.top) + 'px;margin:0;pointer-events:none;white-space:nowrap;color:' + w.c }); r.append(g); job.push(A(g, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-.5rem) scale(.9)' }], { duration: dur * .6, fill: 'both' }).then(() => g.remove())); });
      await Promise.all(job);
    }
  }

  /* ===================================================================== PENGENDALI: satu adegan, banyak bab dan langkah */
  /* skenario: pembangun keadaan berurutan. Setiap langkah = salinan keadaan sebelumnya yang diubah. */
  class Sken {
    constructor() { this.cur = { mode: 'papan', g: null, b: { lines: [], fs: 2.7 }, ket: '' }; this.langkah = []; }
    mode(m) { this.cur.mode = m; return this; }
    graf(v, o) { o = o || {}; this.cur.g = { v: Object.assign({}, v), ax: 1, grid: 1, items: {}, angka: o.angka !== false }; return this; }
    tanpaGraf() { this.cur.g = null; this.cur.mode = 'papan'; return this; }
    view(v) { Object.assign(this.cur.g.v, v); return this; }
    angka(b) { this.cur.g.angka = b; return this; }
    k(id, p, o) { this.cur.g.items[id] = Object.assign({ t: 'k', p, c: 'emas', op: 1, g: 1, tb: 1, sw: false }, o); return this; }
    area(id, U, L, a, b, o) { this.cur.g.items[id] = Object.assign({ t: 'a', U, L, a, b, c: 'emas', op: 1, g: 1, sw: false }, o); return this; }
    pt(id, x, y, o) { this.cur.g.items[id] = Object.assign({ t: 'p', x, y, c: 'putih', op: 1, s: 1, lab: '(' + mn(x) + ', ' + mn(y) + ')' }, o); return this; }
    guide(id, x, y, o) { this.cur.g.items[id] = Object.assign({ t: 'g', x, y, c: 'emas', op: 1, gx: 1, gy: 1 }, o); return this; }
    tex(id, tex, o) { this.cur.g.items[id] = Object.assign({ t: 't', tex, x: 0, y: 0, c: 'putih', op: 1, an: 'l' }, o); return this; }
    set(id, o) { Object.assign(this.cur.g.items[id], o); return this; }
    redup(ids, v) { [].concat(ids).forEach((i) => { if (this.cur.g.items[i]) this.cur.g.items[i].op = v; }); return this; }
    hapus() { [].slice.call(arguments).forEach((i) => { delete this.cur.g.items[i]; }); return this; }
    /* papan: baris-baris { id, ket, tok:[{id,tex|txt,c,hl}], sz:'b'|'m'|'k'|'j', op } */
    baris(L, o) { this.cur.b = Object.assign({ fs: this.cur.b.fs || 2.7 }, o, { lines: L.map((x) => Object.assign({ sz: 'b' }, x)) }); return this; }
    ketLangkah(t) { this.cur.ket = t; return this; }
    langkahBaru(o) { const m = salin(this.cur); if (o) Object.assign(m, o); this.langkah.push(m); return this; }
    /* langkah awal tanpa animasi masuk (mis. kosong) */
  }
  const T = (id, tex, c, o) => TKN(id, tex, c, o);
  const TX = (id, txt, c, o) => TKN(id, null, c, Object.assign({ txt }, o));

  /* mount: kerangka + kendali. bab = [{judul, langkah:[model…]}] */
  function pasang(host, o) {
    o = o || {}; const guru = !!o.guru, BAB = o.bab; host.innerHTML = '';
    const ad = el('div', { kelas: 'ad' + (o.kelas ? ' ' + o.kelas : '') }), kepala = el('div', { kelas: 'ad-kepala' }), stage = el('div', { kelas: 'ad-stage m-papan' }), gr = el('div', { kelas: 'ad-gr' }), bdH = el('div', { kelas: 'ad-bd' }), kendali = el('div', { kelas: 'ad-kendali' });
    stage.append(gr, bdH); const judul = el('h2'), no = el('span', { kelas: 'chip' }), info = el('span', { kelas: 'ad-info' }); kepala.append(judul, no, el('span', { gaya: 'flex:1' }), info);
    ad.append(kepala, stage, kendali); host.append(ad);
    const kv = new Kanvas(gr, { tema: 'gelap' }), pp = new Papan(bdH); const tanyaEl = el('div', { kelas: 'ad-ket' }); gr.append(tanyaEl);
    let c = 0, b = 1, sibuk = false, terkunci = false, pollId = null, posKirim = '', Gnow = null, raf = 0, jalanId = 0; const played = new Set(o.played || []);
    const sembunyi = !!o.tanpaKendali; if (sembunyi) kendali.hidden = true;
    const jml = (i) => BAB[i].langkah.length, model = (i, j) => BAB[i].langkah[clamp(j, 1, jml(i)) - 1];
    const kosong = { mode: 'papan', g: null, b: { lines: [], fs: 2.7 }, ket: '' };
    const bBack = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Mundur', onclick: () => mundur() });
    const bNext = el('button', { kelas: 'btn sorot besar', type: 'button', onclick: () => lanjut() });
    const bUlang = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Ulangi langkah', onclick: () => ulang() });
    const kec = el('div', { kelas: 'kecepatan', role: 'group', 'aria-label': 'Kecepatan animasi' }, el('span', { kelas: 'muted kecil' }, 'Kecepatan'), [1, 2, 3].map((n) => el('button', { type: 'button', kelas: UI.speed === n ? 'aktif' : '', onclick: (e) => { UI.speed = n; try { localStorage.setItem('ac_speed', n); } catch (x) { /* abaikan */ } [...kec.querySelectorAll('button')].forEach((x) => x.classList.toggle('aktif', x === e.currentTarget)); } }, n + '×')));
    const titik = el('div', { kelas: 'ad-titik' }); BAB.forEach((bb, i) => titik.append(el('i', { 'aria-label': 'Bagian ' + (i + 1), title: bb.judul, onclick: () => { if (!terkunci && (guru || played.has(i) || i <= c)) ke(i, 1); } })));
    kendali.append(bBack, titik, kec, bUlang, bNext);
    function ui() {
      judul.textContent = BAB[c].judul; no.textContent = (c + 1) + ' / ' + BAB.length; [...titik.children].forEach((d, i) => { d.className = i === c ? 'aktif' : (i < c || played.has(i) ? 'sudah' : ''); });
      const n = jml(c), akhir = c === BAB.length - 1 && b >= n; info.textContent = 'Langkah ' + b + ' dari ' + n;
      bBack.disabled = (c === 0 && b <= 1) || terkunci; bUlang.disabled = terkunci;
      bNext.innerHTML = akhir ? (o.labelAkhir || 'Selesai') + ik('centang') : (b >= n ? 'Bagian berikutnya' + ik('panah') : 'Lanjut' + ik('panah'));
      if (terkunci && !akhir) bNext.innerHTML = 'Mengikuti guru' + ik('jam'); bNext.className = 'btn sorot besar' + ((terkunci && !akhir) ? ' mati' : ' denyut') + (akhir ? ' hijau' : '');
      ad.classList.toggle('ikut', terkunci);
    }
    /* putar transisi dari keadaan yang sedang tampak ke keadaan tujuan */
    async function ke_(m, opt) {
      opt = opt || {}; const id = ++jalanId; cancelAnimationFrame(raf); const dari = Gnow, ke = m.g || (dari ? { v: dari.v, ax: 0, grid: 0, items: {}, angka: dari.angka } : null);
      const ms = (opt.ms || m.ms || 1300), instan = !!opt.instan;
      stage.className = 'ad-stage m-' + (m.g ? (m.mode || 'split') : 'papan'); tanyaEl.innerHTML = m.ket ? Mat.h(m.ket) : '';
      const sw = stage.clientWidth, lebar = m.g ? (m.mode === 'gambar' ? 0 : sw * 1.1 / 2.1) : sw; const pr = pp.tampil(m.b, { ms, instan, mundur: opt.mundur, lebar });
      if (instan || !dari && !ke) { Gnow = ke ? salin(ke) : null; kv.render(Gnow); await pr; return; }
      const t0 = performance.now(), dur = ms / spd(); sibuk = true;
      await new Promise((res) => { const f = (t) => { if (id !== jalanId) return res(); const k = clamp((t - t0) / dur, 0, 1); Gnow = campurG(dari, ke, k, !!opt.mundur); if (k >= 1) Gnow = salin(ke); kv.render(Gnow); if (k < 1) raf = requestAnimationFrame(f); else res(); }; raf = requestAnimationFrame(f); });
      if (id === jalanId) { sibuk = false; await pr; }
    }
    /* campurG memakai kemajuan k yang belum diperhalus supaya jeda per butir (d) bekerja; zoom diperhalus di dalamnya */
    const kePos = async (cc, bb, opt) => { opt = opt || {}; c = cc; b = clamp(bb, 1, jml(cc)); const m = model(c, b); ui(); await ke_(m, opt); sibuk = false; if (b >= jml(c)) { played.add(c); if (o.saatMain) o.saatMain([...played]); } if (o.saatLangkah) o.saatLangkah(c); kirimPos(); ui(); };
    async function lanjut(paksa) { if (terkunci && !paksa && !(c === BAB.length - 1 && b >= jml(c))) return; if (b < jml(c)) return kePos(c, b + 1); if (c < BAB.length - 1) return kePos(c + 1, 1); if (o.saatSelesai) o.saatSelesai(); }
    async function mundur() { if (terkunci) return; if (b > 1) return kePos(c, b - 1, { mundur: true }); if (c > 0) return kePos(c - 1, jml(c - 1), { mundur: true }); }
    async function ulang() { if (terkunci) return; const cc = c, bb = b; if (bb > 1) await kePos(cc, bb - 1, { instan: true }); else if (cc > 0) await kePos(cc - 1, jml(cc - 1), { instan: true }); else await ke_(kosong, { instan: true }); await kePos(cc, bb); }
    async function ke(i, j, opt) { if (i < 0 || i >= BAB.length) return; await kePos(i, j || 1, opt); }
    function kirimPos() { if (!guru || !o.saatPosisi) return; const k = c + ':' + b; if (k === posKirim) return; posKirim = k; o.saatPosisi(c, b); }
    async function ikutGuru() { if (guru || !o.ambilPosisi) return; let p; try { p = await o.ambilPosisi(); } catch (e) { return; } if (p === undefined) return; if (!p) { if (terkunci) { terkunci = false; ui(); } return; } if (!terkunci) { terkunci = true; ui(); } p.c = clamp(p.c, 0, BAB.length - 1); p.b = clamp(p.b || 1, 1, jml(p.c)); if (p.c === c && p.b === b) return; const maju = (p.c === c && p.b === b + 1) || (p.c === c + 1 && p.b === 1 && b >= jml(c)), mnd = (p.c === c && p.b === b - 1) || (p.c === c - 1 && p.b === jml(c - 1) && b === 1); await kePos(p.c, p.b, { mundur: mnd && !maju }); }
    if (!guru && o.ambilPosisi) pollId = setInterval(ikutGuru, 2500);
    const tombol = (e) => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (document.querySelector('.tirai') && !o.dalamDialog) return; if (terkunci) return; if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); lanjut(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); mundur(); } };
    document.addEventListener('keydown', tombol);
    const mulaiC = clamp(o.mulai || 0, 0, BAB.length - 1), mulaiB = clamp(o.mulaiB || 1, 1, jml(mulaiC));
    ui(); ke_(kosong, { instan: true }).then(() => kePos(mulaiC, mulaiB, { instan: !!o.mulai || !!o.langsung }));
    return { ke, lanjut, mundur, ulang, jumlah: BAB.length, pos: () => ({ c, b }), stop() { clearInterval(pollId); cancelAnimationFrame(raf); jalanId++; document.removeEventListener('keydown', tombol); } };
  }

  /* ===================================================================== grafik statis dari spec (soal, catatan) */
  const LIHAT = (spec) => { const v = GF.lihat(spec); return { x0: v.xmin, x1: v.xmax, y0: v.ymin, y1: v.ymax }; };
  /* model grafik dari spec {tipe,k,z}: kurva, arsiran, titik batas. o: { label, angka, titik, bagian, nama } */
  function modelSpec(spec, o) {
    o = o || {}; const tipe = spec.tipe || 'x', sw = tipe === 'y', s = new Sken(), W = ['emas', 'merah', 'biru'];
    s.graf(spec.v || LIHAT(spec), { angka: o.angka !== false });
    spec.k.forEach((p, i) => s.k('k' + i, p, { c: W[i % 3], sw }));
    if (o.arsir !== false) spec.z.forEach((z, i) => s.area('z' + i, z.u < 0 ? [0] : spec.k[z.u], z.l < 0 ? [0] : spec.k[z.l], z.a, z.b, { c: z.w ? 'merah' : 'emas', sw }));
    if (o.titik !== false && o.angka !== false) { const seen = new Set(); spec.z.forEach((z, i) => [z.a, z.b].forEach((t) => { const idx = z.u >= 0 ? z.u : z.l, y = polyV(spec.k[idx], t), P = sw ? [y, t] : [t, y], key = P.join(','); if (seen.has(key)) return; seen.add(key); s.pt('p' + i + '_' + t, P[0], P[1], { c: 'putih', lab: '(' + mn(P[0]) + ', ' + mn(P[1]) + ')' }); })); }
    if (o.label) { const V = s.cur.g.v, pos = [.82, .2, .58, .7]; const pakai = []; spec.k.forEach((p, i) => { const lo = sw ? V.y0 : V.x0, hi = sw ? V.y1 : V.x1; let pilih = null; for (const f of pos) { const t = lo + (hi - lo) * f, val = polyV(p, t), cx = sw ? val : t, cy = sw ? t : val; if (cx < V.x0 + (V.x1 - V.x0) * .05 || cx > V.x1 - (V.x1 - V.x0) * .12 || cy < V.y0 + (V.y1 - V.y0) * .06 || cy > V.y1 - (V.y1 - V.y0) * .08) continue; if (pakai.some((q) => Math.hypot(q[0] - cx, q[1] - cy) < Math.max(V.x1 - V.x0, V.y1 - V.y0) * .35)) continue; pilih = [t, cx, cy]; break; } if (!pilih) pilih = [lo + (hi - lo) * .5, 0, 0]; pakai.push([pilih[1], pilih[2]]); s.tex('n' + i, (spec.nama && spec.nama[i] ? spec.nama[i].replace(/^\$|\$$/g, '') : ((sw ? 'x=' : 'y=') + BS.tPoly(p, sw ? 'y' : 'x'))), { on: 'k' + i, at: pilih[0], c: W[i % 3], dx: 12, dy: -20, an: 'l' }); }); }
    s.langkahBaru(); return s.langkah[0].g;
  }
  function statis(host, spec, o) {
    o = o || {}; const kv = new Kanvas(host, { tema: o.tema || 'terang', W: o.W || 760, H: o.H || 540, label: o.aria || 'Grafik soal' }); kv.render(modelSpec(spec, o)); return kv;
  }

  /* dialog layar penuh bergaya panggung (pelajaran kelompok, pembahasan animasi) */
  function layarPenuh(o) {
    const tirai = el('div', { kelas: 'ad-layar' }), isi = el('div', { kelas: 'ad-isi' }), tutupB = el('button', { kelas: 'btn sekunder kecil ad-tutup', type: 'button', html: ik('silang', 'kecil') + (o.tutup || 'Tutup'), onclick: () => selesai() });
    tirai.append(isi, tutupB); document.body.append(tirai); let pl = null;
    const selesai = () => { if (pl) pl.stop(); tirai.classList.add('tutup'); setTimeout(() => tirai.remove(), 220); if (o.saatTutup) o.saatTutup(); };
    pl = pasang(isi, Object.assign({ dalamDialog: true, langsung: true }, o)); return { selesai, pl, tirai };
  }

  root.Adegan = { Kanvas, Papan, Sken, T, TX, pasang, statis, modelSpec, layarPenuh, PAL, salin, polyV };
})(window);

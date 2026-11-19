/* ADEGAN — mesin animasi bergaya Manim untuk pengantar, pelajaran kelompok, dan pembahasan soal.
   Setiap LANGKAH adalah satu KEADAAN lengkap (grafik + papan hitung). Papan hitung berpindah dengan jalur animasi tetap (geser, pudar, muncul; tanpa morf
   dan tanpa mengubah ukuran); maju memutar jalur itu, mundur memutar jalur yang SAMA dari belakang. Grafik: kurva menggambar/menghapus diri, arsiran
   menyapu, zoom bergeser (simetris maju-mundur). Menekan tombol saat animasi berjalan menyelesaikan papan lebih dulu, lalu lanjut ke langkah berikutnya. */
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
      const id = this.id = 'kv' + (++idKv), svg = this.svg = S('svg', { viewBox: '0 0 ' + this.W + ' ' + this.H, class: 'kv kv-' + this.tema, role: 'img', 'aria-label': o.label || 'Grafik pada bidang koordinat', style: '--fl:' + Math.round(this.W * .04) + 'px' });
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
      if (!G) return; this.L.kotak.setAttribute('opacity', clamp(G.ax * 1.2, 0, 1).toFixed(3)); const sx = (x) => this.sx(x), sy = (y) => this.sy(y), V = G.v;
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
        for (let x = Math.ceil(V.x0 / sxn - 1e-9) * sxn; x <= V.x1 + 1e-9; x += sxn) { if (x === 0) continue; const px = sx(x); s += '<line class="kt" x1="' + px.toFixed(1) + '" x2="' + px.toFixed(1) + '" y1="' + (pyA - 6).toFixed(1) + '" y2="' + (pyA + 6).toFixed(1) + '" opacity="' + a + '"/><text class="kl" x="' + px.toFixed(1) + '" y="' + Math.min(this.H - 12, pyA + 27).toFixed(1) + '" text-anchor="middle" opacity="' + a + '">' + mn(Math.round(x * 100) / 100) + '</text>'; }
        for (let y = Math.ceil(V.y0 / syn - 1e-9) * syn; y <= V.y1 + 1e-9; y += syn) { if (y === 0) continue; const py = sy(y); s += '<line class="kt" y1="' + py.toFixed(1) + '" y2="' + py.toFixed(1) + '" x1="' + (pxA - 6).toFixed(1) + '" x2="' + (pxA + 6).toFixed(1) + '" opacity="' + a + '"/><text class="kl" x="' + Math.max(40, pxA - 13).toFixed(1) + '" y="' + (py + 6).toFixed(1) + '" text-anchor="end" opacity="' + a + '">' + mn(Math.round(y * 100) / 100) + '</text>'; }
        if (V.x0 <= 0 && V.x1 >= 0 && V.y0 <= 0 && V.y1 >= 0) s += '<text class="kl" x="' + (pxA - 13).toFixed(1) + '" y="' + Math.min(this.H - 12, pyA + 27).toFixed(1) + '" text-anchor="end" opacity="' + a + '">0</text>';
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
          o.t.textContent = G.angka === false ? '' : (it.lab || ''); const lw = String(it.lab || '').length * 13 + 12, balik = it.an == null && px + 14 + lw > m.l + pw; o.t.setAttribute('x', px + (balik ? -14 : (it.dx == null ? 14 : it.dx))); o.t.setAttribute('y', py + (it.dy == null ? -14 : it.dy)); o.t.setAttribute('fill', pal.putih); o.t.setAttribute('opacity', it.op * clamp(sc * 1.5 - .3, 0, 1)); o.t.setAttribute('text-anchor', balik ? 'end' : (it.an || 'start'));
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
    constructor(host) { this.root = el('div', { kelas: 'bd' }); host.append(this.root); this.host = host; this.model = null; this.animId = 0; this.ov = null; }
    ukur(lebar) {
      const rootW = (lebar || this.root.clientWidth || 600) - 40;
      this.root.querySelectorAll('.bd-l').forEach((ln) => { const e = ln.querySelector('.bd-e'); if (!e) return; ln.style.setProperty('--esk', 1); const w = e.scrollWidth, avail = rootW * .94; if (w > avail) ln.style.setProperty('--esk', (avail / w).toFixed(3)); });
    }
    /* satu token: teks KaTeX, teks biasa, HTML mentah, pangkat kecil (sup), atau pecahan bertumpuk (kolom) */
    buatToken(t) {
      if (t.kolom) {
        const w = el('span', { kelas: 'bd-frac' }), a = el('span', { kelas: 'fa' }), b2 = el('span', { kelas: 'fb' }); (t.kolom.atas || []).forEach((x) => a.append(this.buatToken(x))); (t.kolom.bawah || []).forEach((x) => b2.append(this.buatToken(x)));
        const bar = el('span', { kelas: 'bd-t fbar c-' + (t.c || 'putih'), 'data-id': t.id + ':bar', 'data-sig': 'B', 'data-c': t.c || 'putih' }); w.append(a, bar, b2); return w;
      }
      const sg = (t.raw ? 'R:' : (t.txt ? 'T:' : 'K:')) + (t.raw || t.tex || t.txt || ''), s = el('span', { kelas: 'bd-t c-' + (t.c || 'putih') + (t.txt ? ' txt' : '') + (t.kls ? ' ' + t.kls : ''), 'data-id': t.id, 'data-c': t.c || 'putih', 'data-sig': sg });
      if (t.dari) s.dataset.dari = t.dari; if (t.hl) s.dataset.hl = 1;
      s.innerHTML = t.raw ? t.raw : (t.txt ? Mat.h(t.txt) : (t.tex === '' ? '' : Mat.tex(t.tex))); return s;
    }
    bangun(m, lebar) {
      const r = this.root; r.innerHTML = ''; r.style.setProperty('--fs', (m.fs || 2.7) + 'rem'); r.className = 'bd' + (m.rata === 'kiri' ? ' rata-kiri' : '');
      (m.lines || []).forEach((L) => {
        const ln = el('div', { kelas: 'bd-l sz-' + (L.sz || 'b') + (L.kls ? ' ' + L.kls : ''), 'data-id': L.id, 'data-op': L.op == null ? 1 : L.op }); ln.style.opacity = L.op == null ? 1 : L.op;
        if (L.ket) ln.append(el('span', { kelas: 'bd-k bd-t', 'data-id': 'k:' + L.id, 'data-sig': 'T:' + L.ket, html: Mat.h(L.ket) }));
        const e = el('div', { kelas: 'bd-e' }); (L.tok || []).forEach((t) => { e.append(this.buatToken(t)); }); ln.append(e); r.append(ln);
      });
      this.ukur(lebar);
    }
    /* ---- PERPINDAHAN PAPAN: tanpa morf. Dua papan tiruan (keadaan lama dan keadaan baru) ditumpuk di atas panggung. Setiap token punya SATU jalur
       animasi dari keadaan awal (lo) ke keadaan akhir (hi): hilang = memudar; baru = muncul; ada di keduanya = bergeser lurus (tanpa mengubah ukuran);
       isi berganti = isi lama bergeser sambil memudar dan isi baru bergeser sambil muncul. Maju memutar jalur itu; mundur memutar jalur YANG SAMA dari
       belakang (playbackRate -1). Jadi mundur selalu cermin tepat dari maju: tidak ada token yang hilang atau mengecil tiba-tiba. ---- */
    selesaiAnim() { this.animId++; if (this.ov) { this.ov.remove(); this.ov = null; } this.root.style.visibility = ''; }
    /* posisi (relatif panggung), ukuran huruf, warna, isi, dan kepekatan tiap token pada papan yang tampil sekarang */
    petaToken(sr) {
      const m = new Map();
      this.root.querySelectorAll('.bd-t[data-id]').forEach((e) => { const rc = e.getBoundingClientRect(), ln = e.closest('.bd-l'), cs = getComputedStyle(e);
        m.set(e.dataset.id, { x: rc.left - sr.left, y: rc.top - sr.top, fs: parseFloat(cs.fontSize) || 1, c: cs.color, sig: e.dataset.sig, dari: e.dataset.dari || '', op: ln && ln.dataset.op != null ? parseFloat(ln.dataset.op) : 1 }); });
      return m;
    }
    async tampil(m, o) {
      o = o || {}; const r = this.root, stage = this.host.parentElement, sebelum = o.sebelumBangun || (() => {});
      this.selesaiAnim();
      if (o.instan || !this.model) { sebelum(); this.bangun(m, o.lebar); this.model = m; return; }
      const sr = stage.getBoundingClientRect(), pA = this.petaToken(sr), rA = r.getBoundingClientRect(), cA = r.cloneNode(true);
      sebelum(); this.bangun(m, o.lebar); this.model = m;
      const rB = r.getBoundingClientRect(), pB = this.petaToken(sr), cB = r.cloneNode(true);
      if (!pA.size && !pB.size) return;
      const mundur = !!o.mundur, lo = mundur ? pB : pA, hi = mundur ? pA : pB, cLo = mundur ? cB : cA, cHi = mundur ? cA : cB;
      const T = Math.max(380, (o.ms || 1100) / spd()), EASE = 'cubic-bezier(.45,0,.25,1)', anims = [];
      const ov = el('div', { kelas: 'bd-ov' }); ov.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:4;overflow:visible';
      const taruh = (c, rc) => { c.style.cssText += ';position:absolute;left:' + (rc.left - sr.left) + 'px;top:' + (rc.top - sr.top) + 'px;width:' + rc.width + 'px;height:' + rc.height + 'px;margin:0;flex:none;visibility:visible'; ov.append(c); };
      taruh(cA, rA); taruh(cB, rB);
      const peta = (c) => { const mm = new Map(); c.querySelectorAll('.bd-t[data-id]').forEach((e) => mm.set(e.dataset.id, e)); c.querySelectorAll('.bd-l').forEach((ln) => { ln.style.opacity = 1; }); return mm; };
      const eLo = peta(cLo), eHi = peta(cHi);
      /* kepekatan tiap token = kepekatan barisnya; baris tiruan dibuat penuh agar kepekatan bisa dianimasikan langsung pada token */
      eLo.forEach((e, id) => { e.style.opacity = lo.get(id).op; }); eHi.forEach((e, id) => { e.style.opacity = hi.get(id).op; });
      const A_ = (e, prop, v0, v1, s0, t0) => {   /* satu properti, dari v0 ke v1 pada jendela waktu [s0, t0] dalam jalur 0..1 */
        const kf = [{ offset: 0, [prop]: v0, easing: s0 > 0 ? 'linear' : EASE }]; if (s0 > 0) kf.push({ offset: s0, [prop]: v0, easing: EASE });
        kf.push({ offset: t0, [prop]: v1, easing: 'linear' }); if (t0 < 1) kf.push({ offset: 1, [prop]: v1 });
        let a; try { a = e.animate(kf, { duration: T, fill: 'both', easing: 'linear' }); } catch (x) { return null; } a.pause(); anims.push(a); return a;
      };
      const tr = (dx, dy) => 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px)', NOL = 'translate(0px,0px)';
      const KELUAR = [0, .38], GESER = [.16, .8], MASUK = [.52, 1]; let n = 0;
      new Set([...lo.keys(), ...hi.keys()]).forEach((id) => {
        const L = lo.get(id), H = hi.get(id), a = eLo.get(id), b = eHi.get(id);
        if (L && !H) { A_(a, 'opacity', L.op, 0, KELUAR[0], KELUAR[1]); return; }
        if (!L && H) {
          const src = H.dari && lo.get(H.dari);
          if (src) { A_(b, 'transform', tr(src.x - H.x, src.y - H.y), NOL, .1, .84); A_(b, 'opacity', 0, H.op, .1, .38); }   /* salinan terbang dari token sumbernya */
          else { const k = Math.min(.16, n++ * .05), s0 = MASUK[0] + k * .5; A_(b, 'opacity', 0, H.op, s0, MASUK[1]); A_(b, 'transform', 'translateY(.45rem)', 'translateY(0rem)', s0, MASUK[1]); }
          return;
        }
        const dx = L.x - H.x, dy = L.y - H.y, mirip = Math.abs(L.fs / H.fs - 1) < .06;
        if (!mirip) { A_(a, 'opacity', L.op, 0, KELUAR[0], KELUAR[1]); A_(b, 'opacity', 0, H.op, MASUK[0], MASUK[1]); return; }   /* ukuran berbeda: bertukar di tempat, tanpa mengecil atau membesar */
        if (L.sig === H.sig) {
          a.style.opacity = 0;
          if (Math.abs(dx) > .5 || Math.abs(dy) > .5) A_(b, 'transform', tr(dx, dy), NOL, GESER[0], GESER[1]);
          if (L.c !== H.c) A_(b, 'color', L.c, H.c, GESER[0], GESER[1]);
          if (Math.abs(L.op - H.op) > .01) A_(b, 'opacity', L.op, H.op, GESER[0], GESER[1]);
        } else {   /* isi berganti: isi lama bergeser ke tempat baru sambil memudar, isi baru bergeser dari tempat lama sambil muncul */
          if (Math.abs(dx) > .5 || Math.abs(dy) > .5) { A_(a, 'transform', NOL, tr(-dx, -dy), GESER[0], GESER[1]); A_(b, 'transform', tr(dx, dy), NOL, GESER[0], GESER[1]); }
          A_(a, 'opacity', L.op, 0, .3, .56); A_(b, 'opacity', 0, H.op, .4, .66);
        }
      });
      const id = ++this.animId; this.ov = ov; r.style.visibility = 'hidden'; stage.append(ov);
      anims.forEach((a) => { a.currentTime = mundur ? T : 0; a.playbackRate = mundur ? -1 : 1; a.play(); });
      await Promise.all(anims.map((a) => a.finished.catch(() => {})));
      if (id !== this.animId || this.ov !== ov) return;
      ov.remove(); this.ov = null; r.style.visibility = '';
      if (!mundur) r.querySelectorAll('.bd-t[data-hl]').forEach((e) => { try { e.animate([{ filter: 'drop-shadow(0 0 0 rgba(255,201,74,0))' }, { filter: 'drop-shadow(0 0 .32em rgba(255,201,74,.95))', offset: .4 }, { filter: 'drop-shadow(0 0 0 rgba(255,201,74,0))' }], { duration: 800 / spd(), easing: 'ease-in-out' }); } catch (x) { /* abaikan */ } });
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
    let c = 0, b = 1, sibuk = false, terkunci = false, guruPos = null, pollId = null, posKirim = '', Gnow = null, raf = 0, jalanId = 0; const played = new Set(o.played || []);
    const sembunyi = !!o.tanpaKendali; if (sembunyi) kendali.hidden = true;
    const jml = (i) => BAB[i].langkah.length, model = (i, j) => BAB[i].langkah[clamp(j, 1, jml(i)) - 1];
    const kosong = { mode: 'papan', g: null, b: { lines: [], fs: 2.7 }, ket: '' };
    const bBack = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Mundur', onclick: () => mundur() });
    const bNext = el('button', { kelas: 'btn sorot besar', type: 'button', onclick: () => lanjut() });
    const bUlang = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Ulangi langkah', onclick: () => ulang() });
    const kec = el('div', { kelas: 'kecepatan', role: 'group', 'aria-label': 'Kecepatan animasi' }, el('span', { kelas: 'muted kecil' }, 'Kecepatan'), [1, 2, 3].map((n) => el('button', { type: 'button', kelas: UI.speed === n ? 'aktif' : '', onclick: (e) => { UI.speed = n; try { localStorage.setItem('ac_speed', n); } catch (x) { /* abaikan */ } [...kec.querySelectorAll('button')].forEach((x) => x.classList.toggle('aktif', x === e.currentTarget)); } }, n + '×')));
    const titik = el('div', { kelas: 'ad-titik' }); BAB.forEach((bb, i) => titik.append(el('i', { 'aria-label': 'Bagian ' + (i + 1), title: bb.judul, onclick: () => { if (guru || played.has(i) || i <= c) ke(i, 1); } })));
        const urut = (p) => p.c * 1000 + p.b, bIkut = el('button', { kelas: 'btn kecil sorot ad-ikut', type: 'button', hidden: true, onclick: () => { if (guruPos) kePos(guruPos.c, guruPos.b, { mundur: urut(guruPos) < urut({ c, b }) }); } });
    kendali.append(bBack, titik, kec, bUlang, bIkut, bNext);
    const lst = el('div', { kelas: 'ad-lst', hidden: true }); bdH.insertBefore(lst, pp.root); let lstBab = -1;
    function daftarUi() {
      const d = BAB[c].daftar; lst.hidden = !d; bdH.classList.toggle('ada-daftar', !!d); if (!d) { lstBab = -1; return; }
      if (lstBab !== c) { lstBab = c; lst.innerHTML = ''; d.forEach((x, i) => lst.append(el('button', { type: 'button', kelas: 'ad-li', onclick: () => kePos(c, i + 1), html: '<span class="no">' + (i + 1) + '</span><span class="tt">' + Mat.h(x) + '</span>' }))); }
      [...lst.children].forEach((e, i) => e.classList.toggle('aktif', i === b - 1));
    }
    function ui() {
      daftarUi(); judul.textContent = BAB[c].judul; no.textContent = (c + 1) + ' / ' + BAB.length; [...titik.children].forEach((d, i) => { d.className = i === c ? 'aktif' : (i < c || played.has(i) ? 'sudah' : ''); });
      const n = jml(c), akhir = c === BAB.length - 1 && b >= n; info.textContent = 'Langkah ' + b + ' dari ' + n;
      const murid = !guru && !!o.ambilPosisi, sejajar = guruPos && guruPos.c === c && guruPos.b === b, tunggu = murid && guruPos && urut({ c, b }) >= urut(guruPos) && !(akhir && urut(guruPos) >= urut({ c, b }));
      bBack.disabled = (c === 0 && b <= 1); bIkut.hidden = !(murid && guruPos && !sejajar); if (guruPos) bIkut.innerHTML = ik('jam', 'kecil') + 'Ikuti guru';
      bNext.innerHTML = tunggu ? 'Menunggu guru' + ik('jam') : (akhir ? (o.labelAkhir || 'Selesai') + ik('centang') : (b >= n ? 'Bagian berikutnya' + ik('panah') : 'Lanjut' + ik('panah')));
      bNext.className = 'btn sorot besar' + (tunggu ? ' mati' : ' denyut') + (akhir && !tunggu ? ' hijau' : ''); bNext.disabled = !!tunggu;
    }
    /* putar transisi dari keadaan yang sedang tampak ke keadaan tujuan */
    async function ke_(m, opt) {
      opt = opt || {}; const id = ++jalanId; cancelAnimationFrame(raf); const dari = Gnow, ke = m.g || (dari ? { v: dari.v, ax: 0, grid: 0, items: {}, angka: dari.angka } : null);
      const ms = (opt.ms || m.ms || 1300), instan = !!opt.instan;
      const pr = pp.tampil(m.b, { ms, instan, mundur: opt.mundur, sebelumBangun: () => { stage.className = 'ad-stage m-' + (m.g ? (m.mode || 'split') : 'papan'); tanyaEl.innerHTML = m.ket ? Mat.h(m.ket) : ''; } });
      if (instan || !dari && !ke) { Gnow = ke ? salin(ke) : null; kv.render(Gnow); await pr; return; }
      const t0 = performance.now(), dur = ms / spd(); sibuk = true;
      await new Promise((res) => { const f = (t) => { if (id !== jalanId) return res(); const k = clamp((t - t0) / dur, 0, 1); Gnow = campurG(dari, ke, k, !!opt.mundur); if (k >= 1) Gnow = salin(ke); kv.render(Gnow); if (k < 1) raf = requestAnimationFrame(f); else res(); }; raf = requestAnimationFrame(f); });
      if (id === jalanId) { sibuk = false; await pr; }
    }
    /* campurG memakai kemajuan k yang belum diperhalus supaya jeda per butir (d) bekerja; zoom diperhalus di dalamnya */
    const kePos = async (cc, bb, opt) => { opt = Object.assign({}, opt || {}); const asal = { c, b }; if (BAB[cc].potong || BAB[asal.c].potong) opt.instan = true; opt.mundur = urut({ c: cc, b: clamp(bb, 1, jml(cc)) }) < urut(asal); if (opt.mundur) opt.ms = (model(asal.c, asal.b) || {}).ms; c = cc; b = clamp(bb, 1, jml(cc)); const m = model(c, b); ui(); await ke_(m, opt); sibuk = false; if (b >= jml(c)) { played.add(c); if (o.saatMain) o.saatMain([...played]); } if (o.saatLangkah) o.saatLangkah(c); kirimPos(); ui(); };
    async function lanjut() { if (!guru && o.ambilPosisi && guruPos && urut({ c, b }) >= urut(guruPos) && !(c === BAB.length - 1 && b >= jml(c) && urut(guruPos) >= urut({ c, b }))) return; if (b < jml(c)) return kePos(c, b + 1); if (c < BAB.length - 1) return kePos(c + 1, 1); if (o.saatSelesai) o.saatSelesai(); }
    async function mundur() { if (b > 1) return kePos(c, b - 1, { mundur: true }); if (c > 0) return kePos(c - 1, jml(c - 1), { mundur: true }); }
    async function ulang() { const cc = c, bb = b; if (bb > 1) await kePos(cc, bb - 1, { instan: true }); else if (cc > 0) await kePos(cc - 1, jml(cc - 1), { instan: true }); else await ke_(kosong, { instan: true }); await kePos(cc, bb); }
    async function ke(i, j, opt) { if (i < 0 || i >= BAB.length) return; await kePos(i, j || 1, opt); }
    function kirimPos() { if (!guru || !o.saatPosisi) return; const k = c + ':' + b; if (k === posKirim) return; posKirim = k; o.saatPosisi(c, b); }
    async function ikutGuru() {
      if (guru || !o.ambilPosisi) return; let p; try { p = await o.ambilPosisi(); } catch (e) { return; } if (p === undefined) return;
      const lama = guruPos; if (!p) { guruPos = null; ui(); return; }
      p.c = clamp(p.c, 0, BAB.length - 1); p.b = clamp(p.b || 1, 1, jml(p.c)); guruPos = p;
      /* ikut otomatis hanya bila murid sedang sejajar dengan posisi guru sebelumnya; selain itu tombol "Ikuti guru" yang menyala */
      if (lama && (lama.c !== p.c || lama.b !== p.b) && lama.c === c && lama.b === b) { await kePos(p.c, p.b, { mundur: urut(p) < urut(lama) }); return; }
      ui();
    }
    if (!guru && o.ambilPosisi) { pollId = setInterval(ikutGuru, 2500); ikutGuru(); }
    const tombol = (e) => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (document.querySelector('.tirai') && !o.dalamDialog) return; if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); lanjut(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); mundur(); } };
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
    if (o.label) {
      const Wd = o.W || 760, Hd = o.H || 540, mg = { l: 54, r: 40, t: 28, b: 50 }, pw = Wd - mg.l - mg.r, ph = Hd - mg.t - mg.b, V = s.cur.g.v, FL = Math.round(Wd * .04), tepi = 6;
      const px = (x) => mg.l + (x - V.x0) / (V.x1 - V.x0) * pw, py = (y) => mg.t + ph - (y - V.y0) / (V.y1 - V.y0) * ph, kena = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
      const larang = []; Object.keys(s.cur.g.items).forEach((id) => { const it = s.cur.g.items[id]; if (it.t !== 'p') return; const X = px(it.x), Y = py(it.y), w = String(it.lab || '').length * 13 + 12; larang.push([X - 14, Y - 14, X + 14, Y + 14]); if (o.angka !== false) larang.push(X + 14 + w > mg.l + pw ? [X - 14 - w, Y - 36, X - 6, Y - 6] : [X + 6, Y - 36, X + 14 + w, Y - 6]); });
      const ya = py(clamp(0, V.y0, V.y1)), xa = px(clamp(0, V.x0, V.x1)); larang.push([mg.l + pw - 46, ya - 54, mg.l + pw, ya - 6]); larang.push([xa + 4, mg.t, xa + 44, mg.t + 40]); if (o.angka !== false) { larang.push([mg.l, ya - 8, mg.l + pw, ya + 34]); larang.push([xa - 52, mg.t, xa + 10, mg.t + ph]); } else { larang.push([mg.l, ya - 10, mg.l + pw, ya + 10]); larang.push([xa - 10, mg.t, xa + 10, mg.t + ph]); }
      const fr = [.9, .8, .7, .6, .5, .4, .3, .2, .1], tp = [{ an: 'l', dx: 14, dy: -22 }, { an: 'r', dx: -14, dy: -22 }, { an: 'l', dx: 14, dy: 24 }, { an: 'r', dx: -14, dy: 24 }];
      spec.k.forEach((p, i) => {
        const teks = (spec.nama && spec.nama[i] ? spec.nama[i].replace(/^\$|\$$/g, '') : ((sw ? 'x=' : 'y=') + BS.tPoly(p, sw ? 'y' : 'x'))), w = teks.replace(/\\[a-zA-Z]+|[{}^_]/g, '').length * FL * .72 + 26, h = FL * 1.4, lo = sw ? V.y0 : V.x0, hi = sw ? V.y1 : V.x1; let terbaik = null, skor = 1e9;
        for (const f of fr) { const t = lo + (hi - lo) * f, val = polyV(p, t), cx = sw ? val : t, cy = sw ? t : val; if (cx < V.x0 || cx > V.x1 || cy < V.y0 || cy > V.y1) continue; const X = px(cx), Y = py(cy);
          for (const q of tp) { const kiri = q.an === 'l' ? X + q.dx : X + q.dx - w, kotak = [kiri, Y + q.dy - h / 2, kiri + w, Y + q.dy + h / 2], keluar = kotak[0] < mg.l + tepi || kotak[2] > mg.l + pw - tepi || kotak[1] < mg.t + tepi || kotak[3] > mg.t + ph - tepi; let n = keluar ? 50 : 0; larang.forEach((z) => { if (kena(kotak, z)) n++; }); if (n < skor) { skor = n; terbaik = { t, q, kotak }; } if (n === 0) break; }
          if (skor === 0) break; }
        if (skor > 0) {   /* tidak ada tempat dekat kurva yang bebas: pakai sudut bidang yang kosong, tetap berwarna sama dengan kurvanya */
          const t0 = lo + (hi - lo) * .5, v0 = polyV(p, t0), X0 = px(sw ? v0 : t0), Y0 = py(sw ? t0 : v0), sudut = [[mg.l + 10, mg.t + 10], [mg.l + pw - w - 10, mg.t + 10], [mg.l + 10, mg.t + ph - h - 10], [mg.l + pw - w - 10, mg.t + ph - h - 10]];
          for (const [kx, ky] of sudut) { const kotak = [kx, ky, kx + w, ky + h]; if (!larang.some((z) => kena(kotak, z))) { terbaik = { t: t0, q: { an: 'l', dx: kx - X0, dy: ky + h / 2 - Y0 }, kotak }; skor = 0; break; } }
        }
        if (!terbaik) terbaik = { t: lo + (hi - lo) * .5, q: tp[0], kotak: null }; if (terbaik.kotak) larang.push(terbaik.kotak);
        s.tex('n' + i, teks, { on: 'k' + i, at: terbaik.t, c: W[i % 3], dx: terbaik.q.dx, dy: terbaik.q.dy, an: terbaik.q.an });
      });
    }
    s.langkahBaru(); return s.langkah[0].g;
  }
  function statis(host, spec, o) {
    o = o || {}; const kv = new Kanvas(host, { tema: o.tema || 'terang', W: o.W || 760, H: o.H || 540, label: o.aria || 'Grafik soal' }); kv.render(modelSpec(spec, o)); return kv;
  }

  /* dialog layar penuh bergaya panggung (pelajaran kelompok, pembahasan animasi) */
  function layarPenuh(o) {
    const tirai = el('div', { kelas: 'ad-layar' }), isi = el('div', { kelas: 'ad-isi' }), grup = el('div', { kelas: 'ad-tutup' });
    const tutupB = el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('silang', 'kecil') + (o.tutup || 'Tutup'), onclick: () => selesai(false) });
    if (o.kembaliSoal) grup.append(el('button', { kelas: 'btn kecil sorot', type: 'button', html: ik('kembali', 'kecil') + 'Kembali ke soal', onclick: () => selesai(true) }));
    grup.append(tutupB); tirai.append(isi, grup); document.body.append(tirai); let pl = null, ditutup = false;
    const selesai = (kembali) => { if (ditutup) return; ditutup = true; if (pl) pl.stop(); tirai.classList.add('tutup'); setTimeout(() => tirai.remove(), 220); if (kembali) { if (o.kembaliSoal) o.kembaliSoal(); } else if (o.saatTutup) o.saatTutup(); };
    pl = pasang(isi, Object.assign({ dalamDialog: true, langsung: true }, o)); return { selesai, pl, tirai };
  }

  root.Adegan = { Kanvas, Papan, Sken, T, TX, pasang, statis, modelSpec, layarPenuh, PAL, salin, polyV };
})(window);

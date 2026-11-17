/* PANGGUNG — pengantar kelas dua kurva sebagai SATU adegan bersambung bergaya Manim.
   Guru menekan Lanjut untuk memutar SATU langkah (tidak ada yang berjalan sendiri sampai akhir).
   Grafik (Kanvas) dan papan hitungan (Papan) bertahan di antara bab sehingga perpindahan berupa morf, bukan potong.
   Mundur/ulang = membangun ulang adegan sampai langkah itu secara instan, lalu memutar langkahnya. Memakai Intro.h dari intro.js. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, { S } = GF, B = BS, H = Intro.h;
  const GOLD = '#FFC94A', RED = '#FF6B70', SKY = '#62C6FF', PUTIH = '#F4F7FF', REDUP = '#93A3C6';
  let FF = false;                                     // true = jalankan langkah tanpa animasi (membangun ulang adegan)
  const spd = () => UI.speed || 1;
  const A = (e, kf, o) => { o = Object.assign({ duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }, o); if (FF) { o.duration = 1; o.delay = 0; } else { o.duration /= spd(); if (o.delay) o.delay /= spd(); } try { return e.animate(kf, o).finished.catch(() => {}); } catch (x) { return Promise.resolve(); } };
  const ease = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), easeOut = (k) => 1 - Math.pow(1 - k, 3);
  const tw = (T, ms, fn, ez) => new Promise((res, rej) => { if (FF || ms <= 0) { fn(1); return res(); } ms /= spd(); const t0 = performance.now(); const f = (t) => { if (T.batal) return rej(new UI.Batal()); const k = Math.min(1, (t - t0) / ms); fn((ez || ease)(k)); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  const jeda = (T, ms) => (FF ? Promise.resolve() : T.tidur(ms));
  const poly = (p, x) => GF.pv(p, x);
  const mn = (n) => String(n).replace('-', '−');
  let idKlip = 0;

  /* ======================================================================== KANVAS: bidang Kartesius yang bisa di-zoom */
  class Kanvas {
    constructor(host, T, v) {
      this.T = T; this.W = 900; this.H = 640; this.m = { l: 50, r: 36, t: 30, b: 46 }; this.pw = this.W - this.m.l - this.m.r; this.ph = this.H - this.m.t - this.m.b;
      this.v = Object.assign({}, v); this.home = Object.assign({}, v); this.ax = 0; this.gr = 0; this.cur = []; this.fil = []; this.gv = []; this.pt = []; this.tx = []; this.ekstra = [];
      const id = 'kv' + (++idKlip); this.id = id;
      const svg = this.svg = S('svg', { viewBox: '0 0 ' + this.W + ' ' + this.H, class: 'kv', role: 'img', 'aria-label': 'Grafik di bidang Kartesius' });
      const defs = S('defs', null, S('clipPath', { id: id + 'c' }, S('rect', { x: this.m.l, y: this.m.t, width: this.pw, height: this.ph })));
      [['#FFC94A', 0], ['#FF6B70', 1], ['#62C6FF', 2]].forEach(([c, i]) => defs.append(S('pattern', { id: id + 'h' + i, width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, S('rect', { width: 10, height: 10, fill: c, 'fill-opacity': .2 }), S('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: c, 'stroke-width': 3.4, 'stroke-opacity': .9 }))));
      svg.append(defs); this.L = {}; ['grid', 'isi', 'gv', 'kv', 'pt', 'tx'].forEach((n) => { const g = S('g', { class: 'kv-' + n }); if (n === 'isi' || n === 'kv' || n === 'gv') g.setAttribute('clip-path', 'url(#' + id + 'c)'); svg.append(g); this.L[n] = g; });
      this.L.grid.innerHTML = ''; host.append(svg); this.render();
    }
    sx(x) { return this.m.l + (x - this.v.x0) / (this.v.x1 - this.v.x0) * this.pw; }
    sy(y) { return this.m.t + this.ph - (y - this.v.y0) / (this.v.y1 - this.v.y0) * this.ph; }
    render() {
      const { v, m, pw, ph } = this, sx = (x) => this.sx(x), sy = (y) => this.sy(y);
      const yA = Math.max(v.y0, Math.min(v.y1, 0)), xA = Math.max(v.x0, Math.min(v.x1, 0)), pyA = sy(yA), pxA = sx(xA);
      let g = '', a = this.gr;
      for (let x = Math.ceil(v.x0 - 1e-9); x <= Math.floor(v.x1 + 1e-9); x++) { if (x === 0) continue; g += '<line class="kg" x1="' + sx(x).toFixed(1) + '" x2="' + sx(x).toFixed(1) + '" y1="' + m.t + '" y2="' + (m.t + ph) + '" opacity="' + a + '"/>'; }
      for (let y = Math.ceil(v.y0 - 1e-9); y <= Math.floor(v.y1 + 1e-9); y++) { if (y === 0) continue; g += '<line class="kg" y1="' + sy(y).toFixed(1) + '" y2="' + sy(y).toFixed(1) + '" x1="' + m.l + '" x2="' + (m.l + pw) + '" opacity="' + a + '"/>'; }
      const ax = this.ax; const xe = m.l + pw * ax, ye = m.t + ph - ph * ax;
      g += '<line class="ka" x1="' + m.l + '" x2="' + xe.toFixed(1) + '" y1="' + pyA.toFixed(1) + '" y2="' + pyA.toFixed(1) + '"/><line class="ka" x1="' + pxA.toFixed(1) + '" x2="' + pxA.toFixed(1) + '" y1="' + (m.t + ph) + '" y2="' + ye.toFixed(1) + '"/>';
      if (ax > .97) g += '<path class="kp" d="M' + (m.l + pw + 8) + ' ' + pyA.toFixed(1) + 'l-14 -6v12z"/><path class="kp" d="M' + pxA.toFixed(1) + ' ' + (m.t - 8) + 'l-6 14h12z"/><text class="kn" x="' + (m.l + pw - 4) + '" y="' + (pyA - 14).toFixed(1) + '" text-anchor="end">x</text><text class="kn" x="' + (pxA + 16).toFixed(1) + '" y="' + (m.t + 14) + '">y</text>';
      for (let x = Math.ceil(v.x0 - 1e-9); x <= Math.floor(v.x1 + 1e-9); x++) { if (x === 0) continue; const px = sx(x); g += '<line class="kt" x1="' + px.toFixed(1) + '" x2="' + px.toFixed(1) + '" y1="' + (pyA - 6).toFixed(1) + '" y2="' + (pyA + 6).toFixed(1) + '" opacity="' + a + '"/><text class="kl" x="' + px.toFixed(1) + '" y="' + Math.min(m.t + ph - 4, pyA + 26).toFixed(1) + '" text-anchor="middle" opacity="' + a + '">' + mn(x) + '</text>'; }
      for (let y = Math.ceil(v.y0 - 1e-9); y <= Math.floor(v.y1 + 1e-9); y++) { if (y === 0) continue; const py = sy(y); g += '<line class="kt" y1="' + py.toFixed(1) + '" y2="' + py.toFixed(1) + '" x1="' + (pxA - 6).toFixed(1) + '" x2="' + (pxA + 6).toFixed(1) + '" opacity="' + a + '"/><text class="kl" x="' + Math.max(m.l + 2, pxA - 12).toFixed(1) + '" y="' + (py + 5).toFixed(1) + '" text-anchor="end" opacity="' + a + '">' + mn(y) + '</text>'; }
      if (v.x0 <= 0 && v.x1 >= 0 && v.y0 <= 0 && v.y1 >= 0) g += '<text class="kl" x="' + (pxA - 12).toFixed(1) + '" y="' + (pyA + 24).toFixed(1) + '" text-anchor="end" opacity="' + a + '">0</text>';
      this.L.grid.innerHTML = g;
      this.cur.forEach((c) => { if (!c.el) return; if (c.prog <= 0.001) { c.el.setAttribute('d', ''); return; } const N = 240, xe2 = v.x0 + (v.x1 - v.x0) * c.prog; let d = ''; for (let i = 0; i <= N; i++) { const x = v.x0 + (xe2 - v.x0) * i / N, y = poly(c.p, x); d += (i ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(Math.max(-1e3, Math.min(1e3, y))).toFixed(1); } c.el.setAttribute('d', d); c.el.setAttribute('opacity', c.op); c.el.setAttribute('stroke-width', c.tebal * (c.sorot || 1)); });
      this.fil.forEach((f) => { if (f.t <= .001) { f.el.setAttribute('d', ''); return; } const e = f.a + (f.b - f.a) * f.t, M = 90, at = [], bw = []; for (let i = 0; i <= M; i++) { const s = f.a + (e - f.a) * i / M; at.push([s, poly(f.U, s)]); bw.push([s, poly(f.L, s)]); } f.el.setAttribute('d', at.concat(bw.reverse()).map((q, i) => (i ? 'L' : 'M') + sx(q[0]).toFixed(1) + ' ' + sy(q[1]).toFixed(1)).join('') + 'Z'); f.el.setAttribute('opacity', f.op); });
      this.gv.forEach((l) => { const y2 = l.ya + (l.yb - l.ya) * l.t; l.el.setAttribute('x1', sx(l.x)); l.el.setAttribute('x2', sx(l.x)); l.el.setAttribute('y1', sy(l.ya)); l.el.setAttribute('y2', sy(y2)); l.el.setAttribute('opacity', l.t > 0 ? l.op : 0); });
      this.pt.forEach((p) => { p.c.setAttribute('cx', sx(p.x)); p.c.setAttribute('cy', sy(p.y)); p.c.setAttribute('r', 8 * p.s); p.h.setAttribute('cx', sx(p.x)); p.h.setAttribute('cy', sy(p.y)); p.h.setAttribute('r', 8 * p.s + 7); p.h.setAttribute('opacity', p.s > 0 ? .28 * p.s : 0); p.t.setAttribute('x', sx(p.x) + p.dx); p.t.setAttribute('y', sy(p.y) + p.dy); p.t.setAttribute('opacity', p.lop); });
      this.ekstra.forEach((u) => u());
      this.tx.forEach((t) => { t.el.setAttribute('x', sx(t.x) + t.dx); t.el.setAttribute('y', sy(t.y) + t.dy); t.el.setAttribute('opacity', t.op); });
    }
    lengkung(p, warna, tebal) { const e = S('path', { class: 'kc', fill: 'none', stroke: warna, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: 'color:' + warna }); this.L.kv.append(e); const c = { el: e, p, warna, tebal: tebal || 4.6, prog: 0, op: 1 }; this.cur.push(c); return c; }
    isi(U, L, a, b, w) { const e = S('path', { fill: 'url(#' + this.id + 'h' + (w || 0) + ')', stroke: 'none' }); this.L.isi.append(e); const f = { el: e, U, L, a, b, t: 0, op: 1 }; this.fil.push(f); return f; }
    garisV(x, ya, yb, warna, o) { o = o || {}; const e = S('line', { class: o.padat ? 'kv-pita' : 'kv-put', stroke: warna, 'stroke-width': o.tebal || 3, 'stroke-linecap': 'round' }); this.L.gv.append(e); const l = { el: e, x, ya, yb, t: 0, op: 1 }; this.gv.push(l); return l; }
    titik(x, y, warna, lab, o) { o = o || {}; const h = S('circle', { fill: warna, r: 0, opacity: 0 }), c = S('circle', { fill: warna, stroke: BG, 'stroke-width': 3, r: 0 }), t = S('text', { class: 'kv-lab', fill: PUTIH, opacity: 0 }); t.textContent = lab || ''; this.L.pt.append(h, c, t); const p = { x, y, s: 0, lop: 0, c, h, t, dx: o.dx == null ? 14 : o.dx, dy: o.dy == null ? -14 : o.dy }; this.pt.push(p); return p; }
    teks(x, y, html, warna, o) { o = o || {}; const e = S('text', { class: 'kv-teks', opacity: 0, fill: warna || PUTIH, 'text-anchor': o.anchor || 'start', 'font-size': o.ukuran || 26 }); e.innerHTML = html; this.L.tx.append(e); const t = { el: e, x, y, op: 0, dx: o.dx || 0, dy: o.dy || 0 }; this.tx.push(t); return t; }
    lepas(o) { [this.cur, this.fil, this.gv, this.pt, this.tx].forEach((arr) => { const i = arr.indexOf(o); if (i >= 0) { arr.splice(i, 1); (o.el || [o.c, o.h, o.t]).constructor === Array ? [o.c, o.h, o.t].forEach((n) => n.remove()) : o.el.remove(); } }); }
    async zoom(v, ms) { const v0 = Object.assign({}, this.v); await tw(this.T, ms, (k) => { ['x0', 'x1', 'y0', 'y1'].forEach((n) => { this.v[n] = v0[n] + (v[n] - v0[n]) * k; }); this.render(); }); }
    /* tombol zoom milik guru/murid: tidak terikat token langkah */
    zoomManual(f, pusat) { if (this.zm) cancelAnimationFrame(this.zm); const v = this.v, cx = pusat ? pusat[0] : (v.x0 + v.x1) / 2, cy = pusat ? pusat[1] : (v.y0 + v.y1) / 2, tgt = { x0: cx + (v.x0 - cx) * f, x1: cx + (v.x1 - cx) * f, y0: cy + (v.y0 - cy) * f, y1: cy + (v.y1 - cy) * f }; this._pindah(tgt); }
    _pindah(tgt) { const v0 = Object.assign({}, this.v), t0 = performance.now(), ms = 420 / spd(); const f = (t) => { const k = Math.min(1, (t - t0) / ms), e = ease(k); ['x0', 'x1', 'y0', 'y1'].forEach((n) => { this.v[n] = v0[n] + (tgt[n] - v0[n]) * e; }); this.render(); if (k < 1) this.zm = requestAnimationFrame(f); }; this.zm = requestAnimationFrame(f); }
    pulangkan() { this._pindah(this.home); }
  }
  const BG = '#0A1428';

  /* ======================================================================== PAPAN: baris hitungan besar, token bergerak dan berubah warna */
  const tk = (id, html, kls, dari) => ({ id, html, kls: kls || '', dari: dari || '' });
  const fr = (n, d) => '<span class="frak"><span class="at">' + n + '</span><span class="bw">' + d + '</span></span>';
  const V = (s) => '<i>' + s + '</i>';
  const lim = (b, a, kb, ka) => '<span class="ig-l"><span class="bd-t' + (kb ? ' ' + kb : '') + '" data-id="lb">' + mn(b) + '</span><span class="bd-t' + (ka ? ' ' + ka : '') + '" data-id="la">' + mn(a) + '</span></span>';
  const IGT = (a, b, kb, ka) => '<span class="ig"><span class="ig-t">∫</span>' + lim(b, a, kb, ka) + '</span>';
  const EVL = (a, b) => '<span class="ev-l"><span class="bd-t" data-id="lb">' + mn(b) + '</span><span class="bd-t" data-id="la">' + mn(a) + '</span></span>';

  class Papan {
    constructor(host, T) { this.T = T; this.el = el('div', { kelas: 'bd' }); this.judulEl = el('div', { kelas: 'bd-judul' }); this.isi = el('div', { kelas: 'bd-isi' }); this.el.append(this.judulEl, this.isi); host.append(this.el); this.baris = []; }
    async judul(txt) { this.judulEl.textContent = txt; await A(this.judulEl, [{ opacity: 0, transform: 'translateY(-.5rem)' }, { opacity: 1, transform: 'none' }], { duration: 500 }); }
    _buat(spec) {
      const b = el('div', { kelas: 'bd-baris' + (spec.kelas ? ' ' + spec.kelas : '') }), eq = el('div', { kelas: 'bd-eq' }); eq.style.fontSize = (spec.ukuran || 2.6) + 'rem';
      if (spec.cap) b.append(el('div', { kelas: 'bd-cap', html: spec.cap })); b.append(eq);
      spec.tok.forEach((t) => { const s = el('span', { kelas: 'bd-t' + (t.kls ? ' ' + t.kls : ''), 'data-id': t.id, html: t.html }); if (t.dari) s.dataset.dari = t.dari; eq.append(s); });
      return { el: b, eq, spec };
    }
    _tok(b) { const m = {}; b.eq.querySelectorAll(':scope > .bd-t').forEach((e) => { m[e.dataset.id] = e; }); return m; }
    async tambah(spec) {
      const T = this.T, prev = this.baris[this.baris.length - 1], lama = this.baris.map((x) => x.el.getBoundingClientRect().top), b = this._buat(spec);
      const refs = {}; if (prev) { Object.assign(refs, this._tok(prev)); }
      const jaga = this.baris.length >= 3 ? this.baris[0] : null; if (jaga) { this.baris.shift(); lama.shift(); A(jaga.el, [{ opacity: parseFloat(getComputedStyle(jaga.el).opacity) || .4 }, { opacity: 0 }], { duration: 400 }).then(() => jaga.el.remove()); }
      const rBefore = refs; const warnaLama = {}; Object.keys(rBefore).forEach((k) => { warnaLama[k] = { r: rBefore[k].getBoundingClientRect(), c: getComputedStyle(rBefore[k]).color }; });
      this.isi.append(b.el); this.baris.push(b);
      this.baris.slice(0, -1).forEach((x, i) => { const d = lama[i] - x.el.getBoundingClientRect().top; if (d) A(x.el, [{ transform: 'translateY(' + d + 'px)' }, { transform: 'none' }], { duration: 800, easing: 'cubic-bezier(.65,0,.35,1)' }); x.el.classList.add('lama'); });
      const cap = b.el.querySelector('.bd-cap'); if (cap) A(cap, [{ opacity: 0, transform: 'translateY(.4rem)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
      const job = []; let n = 0;
      b.eq.querySelectorAll(':scope > .bd-t').forEach((t) => { const r = t.getBoundingClientRect(), w = warnaLama[t.dataset.dari || t.dataset.id], toC = getComputedStyle(t).color;
        if (w) job.push(A(t, [{ transform: 'translate(' + (w.r.left - r.left) + 'px,' + (w.r.top - r.top) + 'px)', color: w.c }, { transform: 'none', color: toC }], { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' }));
        else job.push(A(t, [{ opacity: 0, transform: 'translateY(.8rem) scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: 380 + (n++) * 90, fill: 'backwards' })); });
      await Promise.all(job); T.cek(); return b;
    }
    /* ubah baris di tempat: token yang sama bergerak, yang lain memudar */
    async ubah(b, tok, o) {
      o = o || {}; const T = this.T, lama = {}; b.eq.querySelectorAll(':scope > .bd-t').forEach((e) => { lama[e.dataset.id] = { e, r: e.getBoundingClientRect(), c: getComputedStyle(e).color }; });
      const be = this.isi.getBoundingClientRect(), hantu = []; const pakai = new Set(tok.map((t) => t.dari || t.id)); Object.keys(lama).forEach((k) => { if (!pakai.has(k)) { const g = lama[k].e.cloneNode(true); g.style.cssText = 'position:absolute;left:' + (lama[k].r.left - be.left) + 'px;top:' + (lama[k].r.top - be.top) + 'px;margin:0;pointer-events:none'; hantu.push(g); } });
      b.eq.innerHTML = ''; tok.forEach((t) => { const s = el('span', { kelas: 'bd-t' + (t.kls ? ' ' + t.kls : ''), 'data-id': t.id, html: t.html }); if (t.dari) s.dataset.dari = t.dari; b.eq.append(s); }); if (o.ukuran) b.eq.style.fontSize = o.ukuran + 'rem';
      hantu.forEach((g) => { this.isi.append(g); A(g, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-.6rem)' }], { duration: 450 }).then(() => g.remove()); });
      const job = []; let n = 0; b.eq.querySelectorAll(':scope > .bd-t').forEach((t) => { const r = t.getBoundingClientRect(), w = lama[t.dataset.dari || t.dataset.id], toC = getComputedStyle(t).color;
        if (w) job.push(A(t, [{ transform: 'translate(' + (w.r.left - r.left) + 'px,' + (w.r.top - r.top) + 'px)', color: w.c }, { transform: 'none', color: toC }], { duration: 950, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' }));
        else job.push(A(t, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 300 + (n++) * 80, fill: 'backwards' })); });
      await Promise.all(job); T.cek();
    }
    /* ubah warna token (animasi warna + denyut) */
    async warna(b, ids, kls) { const job = []; ids.forEach((id) => { const e = b.el.querySelector('.bd-t[data-id="' + id + '"]'); if (!e) return; const dari = getComputedStyle(e).color; e.classList.remove('c1', 'c2', 'c3', 'cw'); if (kls) e.classList.add(kls); const ke = getComputedStyle(e).color; job.push(A(e, [{ color: dari, transform: 'scale(1)' }, { color: ke, transform: 'scale(1.16)', offset: .45 }, { color: ke, transform: 'scale(1)' }], { duration: 750, fill: 'backwards' })); }); await Promise.all(job); }
    async limpas() { const lst = this.baris.splice(0); await Promise.all(lst.map((b) => A(b.el, [{ opacity: parseFloat(getComputedStyle(b.el).opacity) || 1 }, { opacity: 0, transform: 'translateY(-1rem)' }], { duration: 450 }))); lst.forEach((b) => b.el.remove()); }
    ukuran(b, rem) { b.eq.style.fontSize = rem + 'rem'; }
  }

  /* ======================================================================== PANGGUNG: kerangka, kendali langkah, bab */
  const V1 = { x0: -0.5, x1: 5.5, y0: -1, y1: 7 }, V2 = { x0: -3, x1: 4, y0: -1.5, y1: 7.5 };
  const P1 = [5, -4, 1], PF = [0, 0, 1], PG = [2, 1, 0];   // f(x) = x² − 4x + 5 ; y = x² ; y = x + 2

  function mount(host, o) {
    o = o || {}; const guru = !!o.guru; try { UI.speed = [1, 2, 3].includes(+localStorage.getItem('ac_speed')) ? +localStorage.getItem('ac_speed') : 1; } catch (e) { UI.speed = 1; }
    host.innerHTML = '';
    const pg = el('div', { kelas: 'pg' }), kepala = el('div', { kelas: 'pg-kepala' }), adegan = el('div', { kelas: 'pg-adegan' }), kendali = el('div', { kelas: 'pg-kendali' });
    const stage = el('div', { kelas: 'pg-stage m-papan' }), gr = el('div', { kelas: 'pg-gr' }), bdHost = el('div', { kelas: 'pg-bd' }), hal = el('div', { kelas: 'pg-hal' }); stage.append(gr, bdHost); adegan.append(stage, hal); hal.hidden = true;
    const judul = el('h2'), no = el('span', { kelas: 'chip' }), langkahInfo = el('span', { kelas: 'pg-langkah' });
    kepala.append(judul, no, el('span', { gaya: 'flex:1' }), langkahInfo, el('span', { id: 'infoGaleri', kelas: 'chip abu', hidden: true }));
    pg.append(kepala, adegan, kendali); host.append(pg);
    let T = UI.token(), K = null, Bd = null, ci = 0, bi = 0, sibuk = false, siapHal = false, ctxS = {}, terkunci = false, pollId = null, posKirim = ''; const played = new Set(o.played || []);
    const zoomBox = el('div', { kelas: 'pg-zoom' }, [['+', 'Perbesar', () => K && K.zoomManual(.7)], ['−', 'Perkecil', () => K && K.zoomManual(1 / .7)], ['⌂', 'Tampilan awal', () => K && K.pulangkan()]].map(([t, a, f]) => el('button', { type: 'button', 'aria-label': a, title: a, onclick: f }, t))); gr.append(zoomBox);
    const tanyaEl = el('div', { kelas: 'pg-tanya' }); gr.append(tanyaEl);

    /* ---------- util adegan ---------- */
    const mode = async (m) => { stage.className = 'pg-stage m-' + m; await jeda(T, 950); T.cek(); };
    const tanya = async (html) => { if (tanyaEl.innerHTML) await A(tanyaEl, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-1rem)' }], { duration: 350 }); if (!html) { tanyaEl.innerHTML = ''; return; } tanyaEl.innerHTML = html; await A(tanyaEl, [{ opacity: 0, transform: 'translateY(1.2rem)' }, { opacity: 1, transform: 'none' }], { duration: 650 }); };
    const muncul = (t, ms) => tw(T, ms || 500, (k) => { t.op = k; K.render(); }, easeOut);
    const hilang = (t, ms) => { const o0 = t.op; return tw(T, ms || 400, (k) => { t.op = o0 * (1 - k); K.render(); }); };
    const gambar = (c, ms) => tw(T, ms || 1500, (k) => { c.prog = k; K.render(); }, ease);
    const tarik = (c, ms) => { const p0 = c.prog; return tw(T, ms || 900, (k) => { c.prog = p0 * (1 - k); K.render(); }); };
    const pop = (p, lab) => tw(T, 600, (k) => { p.s = k; p.lop = lab ? k : 0; K.render(); }, (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); });
    const tumbuh = (l, ms) => tw(T, ms || 900, (k) => { l.t = k; K.render(); }, ease);
    const isiTumbuh = (f, ms) => tw(T, ms || 1900, (k) => { f.t = k; K.render(); }, easeOut);
    const redup = (l, ms) => { const t0 = l.t; return tw(T, ms || 500, (k) => { l.t = t0 * (1 - k); K.render(); }); };
    const kedip = (f) => tw(T, 1200, (k) => { f.op = 1 - .55 * Math.sin(k * Math.PI * 2) * (k < 1 ? 1 : 0); K.render(); }, (k) => k);
    const denyutCincin = (x, y, warna) => { const r = S('circle', { fill: 'none', stroke: warna, 'stroke-width': 3, r: 10 }); K.L.pt.append(r); const upd = () => { r.setAttribute('cx', K.sx(x)); r.setAttribute('cy', K.sy(y)); }; upd(); K.ekstra.push(upd); const a = r.animate([{ opacity: .95, r: 10 }, { opacity: 0, r: 34 }], { duration: 1500 / spd(), iterations: Infinity }); return { r, upd, a }; };
    const pesta = (x, y) => { if (!FF) H.pesta(x, y); };

    /* ---------- bab ---------- */
    const BAB = [];
    const stageBab = (judul, beats, mulai) => BAB.push({ judul, tipe: 'stage', beats, mulai });
    const halBab = (judul, beats, mulai, tipe) => BAB.push({ judul, tipe: tipe || 'hal', beats, mulai });
    const keStage = () => { hal.hidden = true; stage.hidden = false; }, keHal = () => { stage.hidden = true; hal.hidden = false; hal.innerHTML = ''; hal.className = 'pg-hal'; };
    const dasar = () => { if (!K) { K = new Kanvas(gr, T, V1); K.svg.style.opacity = 1; Bd = new Papan(bdHost, T); } };
    const SOAL = [tk('lbl', 'Hitunglah&ensp;'), tk('int', IGT(1, 3)), tk('pp', '('), tk('p1', V('x') + '<sup>2</sup>'), tk('pm', ' − '), tk('p2', '4' + V('x')), tk('pn', ' + 5'), tk('pq', ')'), tk('dx', V('dx'))];

    /* ===== bab 0: judul ===== */
    halBab('Luas daerah di antara dua kurva', [
      async () => { const w = hal.querySelector('.js'); const kata = [...w.querySelectorAll('.kata')]; for (const k of kata) { A(k, [{ opacity: 0, transform: 'translateY(1.4rem)', filter: 'blur(.5rem)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 750 }); await jeda(T, 220); } await jeda(T, 700); },
      async () => { const w = hal.querySelector('.js'); A(w.querySelector('.js-sub'), [{ opacity: 0, transform: 'translateY(1rem)' }, { opacity: 1, transform: 'none' }], { duration: 700 }); await jeda(T, 400); for (const c of w.querySelectorAll('.js-chip span')) { A(c, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' }); await jeda(T, 170); } const seni = w.querySelector('.js-seni'); seni.innerHTML = UI.heroSVG(); A(seni, [{ opacity: 0 }, { opacity: 1 }], { duration: 800 }); await jeda(T, 800); }
    ], () => { keHal(); hal.innerHTML = '<div class="js"><div class="js-isi"><div class="js-eyebrow"><i></i>Matematika Tingkat Lanjut · ' + esc(B.cfg(B.kelasAktif()).nama) + '</div><h1 class="js-judul"><span class="kata">Luas</span> <span class="kata">Daerah</span><br><span class="kata kecil">di</span> <span class="kata">Antara</span> <span class="kata em">Dua&nbsp;Kurva</span></h1><p class="js-sub" style="opacity:0">Integral tentu untuk menghitung luas daerah yang dibatasi dua kurva, beserta semua variasinya.</p><div class="js-chip"><span style="opacity:0">Integral tentu</span><span style="opacity:0">Titik potong</span><span style="opacity:0">Atas − bawah</span><span style="opacity:0">Kanan − kiri</span></div></div><div class="js-seni" aria-hidden="true" style="opacity:0"></div></div>'; hal.querySelectorAll('.kata').forEach((k) => { k.style.opacity = 0; }); });

    /* ===== bab 1: yuk, ingat kembali ===== */
    let BS1 = null;   // baris soal
    stageBab('Yuk, ingat kembali', [
      async () => { dasar(); BS1 = await Bd.tambah({ cap: 'Yuk, ingat kembali', tok: SOAL, ukuran: 4.6 }); await jeda(T, 400); },
      async () => { await mode('split'); Bd.ukuran(BS1, 2.7); await K.zoom(V1, 0); await tw(T, 1300, (k) => { K.ax = k; K.gr = k; K.render(); }); },
      async () => { const c = ctxS.f = K.lengkung(P1, GOLD, 5); const lab = ctxS.fl = K.teks(0.7, 6.3, 'f(x) = x<tspan class="sup" dy="-9">2</tspan><tspan dy="9"> − 4x + 5</tspan>', GOLD, { ukuran: 26 }); await Promise.all([gambar(c, 1900), Bd.warna(BS1, ['pp', 'p1', 'pm', 'p2', 'pn', 'pq'], 'c1')]); await muncul(lab, 500); },
      async () => { const l1 = ctxS.l1 = K.garisV(1, 0, 2, RED), l3 = ctxS.l3 = K.garisV(3, 0, 2, RED), p1 = K.titik(1, 2, RED, '(1, 2)', { dx: -50, dy: -16 }), p3 = K.titik(3, 2, RED, '(3, 2)', { dx: 14, dy: -16 }); const x1 = K.teks(1, 0, 'x = 1', RED, { ukuran: 22, dy: 52, anchor: 'middle' }), x3 = K.teks(3, 0, 'x = 3', RED, { ukuran: 22, dy: 52, anchor: 'middle' }); await Promise.all([tumbuh(l1, 900), tumbuh(l3, 900), Bd.warna(BS1, ['la', 'lb'], 'c2')]); await pop(p1, true); await pop(p3, true); await Promise.all([muncul(x1, 400), muncul(x3, 400)]); },
      async () => { const f = ctxS.fi = K.isi(P1, [0], 1, 3, 0); await Promise.all([isiTumbuh(f, 2000), Bd.warna(BS1, ['int'], 'c1')]); await kedip(f); },
      async () => { await Bd.tambah({ cap: 'Antiturunan', tok: [tk('F', V('F') + '(' + V('x') + ') = '), tk('a1', fr(V('x') + '<sup>3</sup>', 3), 'c1', 'p1'), tk('pm', ' − ', 'c1'), tk('a2', '2' + V('x') + '<sup>2</sup>', 'c1', 'p2'), tk('pn', ' + 5' + V('x'), 'c1')], ukuran: 2.95 }); },
      async () => { await Bd.tambah({ cap: 'Substitusi batas atas dikurangi batas bawah', tok: [tk('k1', '['), tk('a1', fr(V('x') + '<sup>3</sup>', 3), 'c1'), tk('pm', ' − ', 'c1'), tk('a2', '2' + V('x') + '<sup>2</sup>', 'c1'), tk('pn', ' + 5' + V('x'), 'c1'), tk('k2', ']'), tk('ev', EVL(1, 3), 'c2')], ukuran: 2.83 }); },
      async () => { const b = await Bd.tambah({ cap: 'Ganti ' + 'x' + ' dengan batas', tok: [tk('e', '= ('), tk('a1', fr('3<sup>3</sup>', 3), 'c1', 'a1'), tk('pm', ' − ', 'c1'), tk('a2', '2 · 3<sup>2</sup>', 'c1', 'a2'), tk('pn', ' + 5 · 3', 'c1', 'pn'), tk('e2', ') − ('), tk('b1', fr('1<sup>3</sup>', 3), 'c1', 'a1'), tk('pm2', ' − ', 'c1'), tk('b2', '2 · 1<sup>2</sup>', 'c1'), tk('b3', ' + 5 · 1', 'c1'), tk('e3', ')')], ukuran: 2.07 }); ctxS.b = b; },
      async () => { await Bd.tambah({ cap: 'Hitung', tok: [tk('e', '= ('), tk('a1', '9', 'c1', 'a1'), tk('pm', ' − '), tk('a2', '18', 'c1', 'a2'), tk('pn', ' + 15', 'c1', 'pn'), tk('e2', ') − ('), tk('b1', fr(1, 3), 'c1', 'b1'), tk('pm2', ' − '), tk('b2', '2', 'c1', 'b2'), tk('b3', ' + 5', 'c1', 'b3'), tk('e3', ')')], ukuran: 2.6 }); },
      async () => { await Bd.tambah({ cap: 'Selisih', tok: [tk('e', '= 6 − '), tk('r', fr(10, 3), 'c1', 'b1')], ukuran: 3.3 }); },
      async () => { const b = await Bd.tambah({ cap: 'Hasil', tok: [tk('e', '= '), tk('r', fr(8, 3), 'c1 hasil', 'r'), tk('s', '&ensp;satuan luas', 'redup')], ukuran: 4.01, kelas: 'akhir' }); const lh = K.teks(2, 0.9, 'L = 8/3', GOLD, { ukuran: 30, anchor: 'middle' }); await muncul(lh, 500); await kedip(ctxS.fi); pesta(innerWidth * .72, innerHeight * .45); void b; }
    ], () => { keStage(); dasar(); });

    /* ===== bab 2: bagaimana jika ada 2 fungsi? ===== */
    stageBab('Bagaimana jika ada 2 fungsi?', [
      async () => { await Bd.limpas(); await Promise.all([mode('gambar'), (async () => { const f = ctxS.fi; await Promise.all([redup(f, 700), hilang(ctxS.fl, 500), ...K.gv.map((l) => redup(l, 600)), ...K.pt.map((p) => tw(T, 500, (k) => { p.s = 1 - k; p.lop = 1 - k; K.render(); })), ...K.tx.filter((t) => t !== ctxS.fl).map((t) => hilang(t, 400))]); K.fil.slice().forEach((q) => K.lepas(q)); K.gv.slice().forEach((q) => K.lepas(q)); K.pt.slice().forEach((q) => K.lepas(q)); K.tx.slice().forEach((q) => K.lepas(q)); })()]);
        await Promise.all([K.zoom(V2, 1600), tw(T, 1600, (k) => { const c = ctxS.f; c.p = [5 + (0 - 5) * k, -4 + (0 + 4) * k, 1]; K.render(); })]); K.home = Object.assign({}, V2); ctxS.f.p = PF; ctxS.fl = K.teks(-2.45, 5.6, 'f(x)', GOLD, { ukuran: 32, anchor: 'end' }); await muncul(ctxS.fl, 500); await tanya('Bagaimana jika ada <em>2 fungsi</em>?'); },
      async () => { const g = ctxS.g = K.lengkung(PF.slice(), RED, 5); g.prog = 1; g.op = 0; K.render(); await tw(T, 500, (k) => { g.op = k; K.render(); }); await tw(T, 900, (k) => { g.p = [0 + 2 * k, 0 + 1 * k, 1 - 1 * k]; K.render(); }); g.p = PG; ctxS.gl = K.teks(3.25, 6.0, 'g(x)', RED, { ukuran: 32, anchor: 'middle' }); await muncul(ctxS.gl, 500); },
      async () => { await tanya('Bagaimana menghitung <em>luas di antara 2 kurva</em>?'); const f = ctxS.f2 = K.isi(PG, PF, -1, 2, 0); const q = ctxS.q = K.teks(0.5, 1.15, '?', GOLD, { ukuran: 76, anchor: 'middle' }); await isiTumbuh(f, 2000); await tw(T, 600, (k) => { q.op = k; K.render(); }); await kedip(f); }
    ], () => { keStage(); });

    /* ===== bab 3: contoh dua kurva ===== */
    stageBab('Contoh: dua kurva', [
      async () => { await tanya(''); await Promise.all([hilang(ctxS.q, 400), redup(ctxS.f2, 800), hilang(ctxS.fl, 500), hilang(ctxS.gl, 500)]); K.lepas(ctxS.f2); K.lepas(ctxS.q); await Promise.all([tarik(ctxS.f, 1100), tarik(ctxS.g, 1100), mode('split')]); await Bd.judul('Contoh'); await Bd.tambah({ cap: 'Dua kurva di bidang Kartesius', tok: [tk('t', 'Gambar dua kurva, cari luas di antaranya', 'redup')], ukuran: 1.77 }); },
      async () => { await gambar(ctxS.f, 1700); ctxS.f1l = K.teks(-0.6, 6.4, 'y = x<tspan class="sup" dy="-9">2</tspan>', GOLD, { ukuran: 28 }); await Promise.all([muncul(ctxS.f1l, 500), Bd.tambah({ cap: 'Kurva pertama', tok: [tk('y1', V('y') + ' = ' + V('x') + '<sup>2</sup>', 'c1')], ukuran: 3.78 })]); },
      async () => { await gambar(ctxS.g, 1700); ctxS.g1l = K.teks(2.6, 4.3, 'y = x + 2', RED, { ukuran: 28 }); await Promise.all([muncul(ctxS.g1l, 500), Bd.tambah({ cap: 'Kurva kedua', tok: [tk('y2', V('y') + ' = ' + V('x') + ' + 2', 'c2')], ukuran: 3.78 })]); },
      async () => { ctxS.c1 = denyutCincin(-1, 1, GOLD); ctxS.c2 = denyutCincin(2, 4, GOLD); await Bd.tambah({ cap: 'Pertanyaan', tok: [tk('q', 'Di mana kedua kurva <b>berpotongan</b>?')], ukuran: 2.48 }); ctxS.q1 = K.teks(-1, 1, '?', GOLD, { ukuran: 40, dx: -36, dy: -10 }); ctxS.q2 = K.teks(2, 4, '?', GOLD, { ukuran: 40, dx: 16, dy: 40 }); await Promise.all([muncul(ctxS.q1, 500), muncul(ctxS.q2, 500)]); await jeda(T, 600); }
    ], () => { keStage(); });

    /* ===== bab 4: mencari titik potong ===== */
    let BL = null;
    stageBab('Mencari titik potong', [
      async () => { await Bd.limpas(); await Bd.judul('Mencari titik potong'); await Promise.all([hilang(ctxS.q1, 300), hilang(ctxS.q2, 300)]); BL = await Bd.tambah({ cap: 'Di titik potong, nilai y kedua kurva sama', tok: [tk('A', V('x') + '<sup>2</sup>', 'c1'), tk('E', '='), tk('P', V('x'), 'c2'), tk('Q', '+ 2', 'c2')], ukuran: 4.25 }); },
      async () => { BL = await Bd.tambah({ cap: 'Pindahkan semua suku ke ruas kiri', tok: [tk('A', V('x') + '<sup>2</sup>', 'c1'), tk('P', '− ' + V('x'), 'c2'), tk('Q', '− 2', 'c2'), tk('E', '='), tk('Z', '0')], ukuran: 4.25 }); },
      async () => { BL = await Bd.tambah({ cap: 'Faktorkan', tok: [tk('F1', '(' + V('x') + ' + 1)', '', 'P'), tk('F2', '(' + V('x') + ' − 2)', '', 'Q'), tk('E', '='), tk('Z', '0')], ukuran: 4.25 }); },
      async () => { await Bd.tambah({ cap: 'Salah satu faktor harus nol', tok: [tk('X1', V('x') + ' = −1', 'c2', 'F1'), tk('O', '&ensp;atau&ensp;', 'redup'), tk('X2', V('x') + ' = 2', 'c2', 'F2')], ukuran: 4.01 }); const a = K.garisV(-1, 0, 1, RED), b2 = K.garisV(2, 0, 4, RED), ta = K.teks(-1, 0, 'x = −1', RED, { ukuran: 22, dy: 56, anchor: 'middle' }), tb = K.teks(2, 0, 'x = 2', RED, { ukuran: 22, dy: 56, anchor: 'middle' }); ctxS.vls = [a, b2]; await Promise.all([tumbuh(a, 900), tumbuh(b2, 900)]); await Promise.all([muncul(ta, 400), muncul(tb, 400)]); },
      async () => { await Bd.tambah({ cap: 'Cari y: substitusi x = −1 ke y = x²', tok: [tk('s1', V('x') + ' = −1 → ' + V('y') + ' = (−1)<sup>2</sup> = ', 'redup'), tk('s2', '1', 'c1')], ukuran: 2.83 }); ctxS.pA = K.titik(-1, 1, GOLD, '(−1, 1)', { dx: -150, dy: -22 }); await K.zoom({ x0: -2.4, x1: 0.4, y0: -0.3, y1: 2.6 }, 1500); await pop(ctxS.pA, true); await jeda(T, 500); },
      async () => { await Bd.tambah({ cap: 'Substitusi x = 2 ke y = x²', tok: [tk('s1', V('x') + ' = 2 → ' + V('y') + ' = 2<sup>2</sup> = ', 'redup'), tk('s2', '4', 'c1')], ukuran: 2.83 }); ctxS.pB = K.titik(2, 4, GOLD, '(2, 4)', { dx: 16, dy: 40 }); await K.zoom({ x0: 0.8, x1: 3.2, y0: 2.8, y1: 5.2 }, 1600); await pop(ctxS.pB, true); await jeda(T, 500); },
      async () => { await K.zoom(V2, 1500); await Bd.tambah({ cap: 'Titik potong kedua kurva', tok: [tk('t1', '(−1, 1)', 'c1 hasil'), tk('o', '&ensp;dan&ensp;', 'redup'), tk('t2', '(2, 4)', 'c1 hasil')], ukuran: 4.01, kelas: 'akhir' }); }
    ], () => { keStage(); });

    /* ===== bab 5: menghitung luas ===== */
    let BI = null;
    stageBab('Menghitung luas daerah', [
      async () => { await Bd.limpas(); await Bd.judul('Menghitung luas'); const ps = [...K.pt]; await Promise.all([...ps.map((p) => tw(T, 400, (k) => { p.lop = 1 - k; K.render(); })), ...K.tx.map((t) => hilang(t, 400))]); K.pt.slice().forEach((q) => K.lepas(q)); K.tx.slice().forEach((q) => K.lepas(q)); ctxS.c1 && ctxS.c1.a.cancel(); ctxS.c2 && ctxS.c2.a.cancel(); ctxS.c1 && ctxS.c1.r.remove(); ctxS.c2 && ctxS.c2.r.remove(); K.ekstra.length = 0;
        const pita = ctxS.pita = K.garisV(0.5, 0.25, 2.5, GOLD, { padat: true, tebal: 10 }); const ta = K.teks(0.5, 2.5, 'atas: y = x + 2', RED, { ukuran: 24, dx: 18, dy: -12 }), tb = K.teks(0.5, 0.9, 'bawah: y = x<tspan class="sup" dy="-8">2</tspan>', GOLD, { ukuran: 24, dx: -20, dy: 0, anchor: 'end' }); await tumbuh(pita, 900); await Promise.all([muncul(ta, 500), muncul(tb, 500)]); ctxS.pl = [ta, tb];
        await Bd.tambah({ cap: 'Pada −1 ≤ x ≤ 2', tok: [tk('la1', 'kurva atas&ensp;'), tk('ya0', V('y') + '<sub>atas</sub> = ' + V('x') + ' + 2', 'c2')], ukuran: 2.6 }); await Bd.tambah({ cap: '', tok: [tk('lb1', 'kurva bawah&ensp;'), tk('yb0', V('y') + '<sub>bawah</sub> = ' + V('x') + '<sup>2</sup>', 'c1')], ukuran: 2.6 }); },
      async () => { BI = await Bd.tambah({ cap: 'Luas = integral dari atas − bawah', tok: [tk('L', V('L') + ' = '), tk('int', IGT(-1, 2)), tk('pp', '('), tk('ya', V('y') + '<sub>atas</sub>', 'c2', 'ya0'), tk('pm', ' − '), tk('yb', V('y') + '<sub>bawah</sub>', 'c1', 'yb0'), tk('pq', ')'), tk('dx', V('dx'))], ukuran: 3.3 });
        const f = ctxS.f2 = K.isi(PG, PF, -1, 2, 0), pita = ctxS.pita; await tw(T, 3200, (k) => { const x = -1 + 3 * k; pita.x = x; pita.ya = poly(PF, x); pita.yb = poly(PG, x); pita.t = 1; f.t = k; K.render(); }, ease); await kedip(f); pita.t = 0; K.render(); ctxS.pl.forEach((t) => hilang(t, 400)); },
      async () => { BI = await Bd.tambah({ cap: 'Tulis kedua fungsinya', tok: [tk('L', V('L') + ' = '), tk('int', IGT(-1, 2)), tk('pp', '(('), tk('ya', V('x') + ' + 2', 'c2', 'ya'), tk('p3', ')'), tk('pm', ' − '), tk('yb', V('x') + '<sup>2</sup>', 'c1', 'yb'), tk('pq', ')'), tk('dx', V('dx'))], ukuran: 3.3 }); },
      async () => { BI = await Bd.tambah({ cap: 'Sederhanakan', tok: [tk('L', V('L') + ' = '), tk('int', IGT(-1, 2)), tk('pp', '('), tk('yb', '−' + V('x') + '<sup>2</sup>', 'c1', 'yb'), tk('ya1', ' + ' + V('x'), 'c2', 'ya'), tk('ya2', ' + 2', 'c2', 'ya'), tk('pq', ')'), tk('dx', V('dx'))], ukuran: 3.3 }); },
      async () => { await Bd.tambah({ cap: 'Antiturunan', tok: [tk('F', V('F') + '(' + V('x') + ') = '), tk('yb', '−' + fr(V('x') + '<sup>3</sup>', 3), 'c1', 'yb'), tk('ya1', ' + ' + fr(V('x') + '<sup>2</sup>', 2), 'c2', 'ya1'), tk('ya2', ' + 2' + V('x'), 'c2', 'ya2')], ukuran: 3.19 }); },
      async () => { await Bd.tambah({ cap: 'Substitusi batas atas dikurangi batas bawah', tok: [tk('L', V('L') + ' = '), tk('k1', '['), tk('yb', '−' + fr(V('x') + '<sup>3</sup>', 3), 'c1'), tk('ya1', ' + ' + fr(V('x') + '<sup>2</sup>', 2), 'c2'), tk('ya2', ' + 2' + V('x'), 'c2'), tk('k2', ']'), tk('ev', EVL(-1, 2), 'c2', 'int')], ukuran: 2.83 }); },
      async () => { const b = await Bd.tambah({ cap: 'Batas atas: x = 2', tok: [tk('F2', V('F') + '(2) = '), tk('yb', '−' + fr('2<sup>3</sup>', 3), 'c1', 'yb'), tk('ya1', ' + ' + fr('2<sup>2</sup>', 2), 'c2', 'ya1'), tk('ya2', ' + 2 · 2', 'c2', 'ya2')], ukuran: 2.83 }); await jeda(T, 900); await Bd.ubah(b, [tk('F2', V('F') + '(2) = '), tk('yb', '−' + fr(8, 3), 'c1', 'yb'), tk('ya1', ' + 2', 'c2', 'ya1'), tk('ya2', ' + 4', 'c2', 'ya2')], { ukuran: 3.07 }); await jeda(T, 900); await Bd.ubah(b, [tk('F2', V('F') + '(2) = '), tk('r', fr(10, 3), 'c1 hasil', 'yb')], { ukuran: 3 }); },
      async () => { const b = await Bd.tambah({ cap: 'Batas bawah: x = −1', tok: [tk('F1', V('F') + '(−1) = '), tk('yb', '−' + fr('(−1)<sup>3</sup>', 3), 'c1', 'yb'), tk('ya1', ' + ' + fr('(−1)<sup>2</sup>', 2), 'c2', 'ya1'), tk('ya2', ' + 2 · (−1)', 'c2', 'ya2')], ukuran: 2.6 }); await jeda(T, 900); await Bd.ubah(b, [tk('F1', V('F') + '(−1) = '), tk('yb', fr(1, 3), 'c1', 'yb'), tk('ya1', ' + ' + fr(1, 2), 'c2', 'ya1'), tk('ya2', ' − 2', 'c2', 'ya2')], { ukuran: 3.07 }); await jeda(T, 900); await Bd.ubah(b, [tk('F1', V('F') + '(−1) = '), tk('r', '−' + fr(7, 6), 'c1 hasil', 'yb')], { ukuran: 3 }); },
      async () => { const b = await Bd.tambah({ cap: 'Luas = F(2) − F(−1)', tok: [tk('L', V('L') + ' = '), tk('r1', fr(10, 3), 'c1', 'r'), tk('mn', ' − (−'), tk('r2', fr(7, 6), 'c1', 'r'), tk('p', ')')], ukuran: 3.3 }); await jeda(T, 900); await Bd.ubah(b, [tk('L', V('L') + ' = '), tk('r1', fr(20, 6), 'c1', 'r1'), tk('mn', ' + '), tk('r2', fr(7, 6), 'c1', 'r2')], { ukuran: 3.3 }); await jeda(T, 900); await Bd.ubah(b, [tk('L', V('L') + ' = '), tk('r1', fr(27, 6), 'c1', 'r1'), tk('e', ' = '), tk('r2', fr(9, 2), 'c1 hasil', 'r2'), tk('s', '&ensp;= 4,5 satuan luas', 'redup')], { ukuran: 3.78 }); const lh = K.teks(0.5, 1.2, 'L = 9/2', GOLD, { ukuran: 32, anchor: 'middle' }); await muncul(lh, 500); await kedip(ctxS.f2); pesta(innerWidth * .72, innerHeight * .45); }
    ], () => { keStage(); });

    /* ===== bab 6: tujuh sub-materi (galeri interaktif) ===== */
    halBab('Sub-materi yang akan dipelajari', [], () => { keHal(); hal.classList.add('terang'); const h = el('div', { gaya: 'position:absolute;inset:.8rem 1rem;display:flex' }); hal.append(h); siapHal = false; return H.adGaleri({ a: h, t: T, guru, instan: false, siap: () => { siapHal = true; ui(); } }); }, 'interaktif');

    /* ===== bab 7: tujuan ===== */
    const TUJUAN = ['Menentukan <b>titik potong</b> dua kurva dan memakainya sebagai batas integral.', 'Menyusun integral luas daerah di antara dua kurva: <b>atas − bawah</b> (irisan tegak, dx) atau <b>kanan − kiri</b> (irisan datar, dy).', 'Menangani kurva yang <b>bertukar posisi</b> dan daerah yang memotong sumbu-x dengan memecah daerahnya.', 'Menghitung luas dengan benar (tidak pernah negatif), lalu <b>menjelaskan caranya</b> kepada temanmu.'];
    halBab('Tujuan pembelajaran', TUJUAN.map((_, i) => async () => { const r = hal.querySelectorAll('.tj')[i]; await A(r, [{ opacity: 0, transform: 'translateX(2.5rem)' }, { opacity: 1, transform: 'none' }], { duration: 650 }); }), () => { keHal(); hal.innerHTML = '<div class="tujuan-wrap"><div class="js-eyebrow"><i></i>Tujuan pembelajaran hari ini</div><h2 class="tj-judul">Setelah pelajaran ini, kamu bisa …</h2>' + TUJUAN.map((s, i) => '<div class="tj" style="opacity:0"><span class="tj-no">' + (i + 1) + '</span><span>' + s + '</span></div>').join('') + '</div>'; });

    /* ===== bab 8: bersiap tes ===== */
    halBab('Bersiap tes diagnostik', [
      async () => { const w = hal.querySelector('.bs'); const dur = Math.round(B.cfg(B.kelasAktif()).durasi / 60); const ks = [...w.querySelectorAll('.bs-kartu')]; for (const k of ks) { A(k, [{ opacity: 0, transform: 'translateY(1.2rem) scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.34,1.56,.64,1)' }); await jeda(T, 300); } void dur; },
      async () => { const w = hal.querySelector('.bs'), jarum = w.querySelector('.bs-jarum'), arc = w.querySelector('.bs-arc'); A(jarum, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 2600, easing: 'cubic-bezier(.4,0,.2,1)' }); await A(arc, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 2600, easing: 'cubic-bezier(.4,0,.2,1)' }); }
    ], () => { keHal(); let tanda = ''; for (let i = 0; i < 12; i++) { const ang = i * 30 * Math.PI / 180; tanda += '<line x1="' + (100 + 74 * Math.sin(ang)).toFixed(1) + '" y1="' + (100 - 74 * Math.cos(ang)).toFixed(1) + '" x2="' + (100 + 82 * Math.sin(ang)).toFixed(1) + '" y2="' + (100 - 82 * Math.cos(ang)).toFixed(1) + '" class="bs-garis"/>'; } const dur = Math.round(B.cfg(B.kelasAktif()).durasi / 60); hal.innerHTML = '<div class="bs"><div class="bs-jam"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" class="bs-cincin"/><circle cx="100" cy="100" r="86" class="bs-arc" pathLength="1"/>' + tanda + '<line x1="100" y1="100" x2="100" y2="38" class="bs-jarum" style="transform-origin:100px 100px"/><circle cx="100" cy="100" r="7" class="bs-pusat"/></svg></div><div class="bs-isi"><div class="js-eyebrow"><i></i>Tahap berikutnya</div><h1 class="bs-judul">Bersiap untuk<br><span class="em">tes diagnostik awal</span></h1><div class="bs-info"><div class="bs-kartu" style="opacity:0"><b>5</b><span>soal</span></div><div class="bs-kartu" style="opacity:0"><b>PG</b><span>pilihan ganda</span></div><div class="bs-kartu" style="opacity:0"><b>' + dur + '</b><span>menit</span></div><div class="bs-kartu" style="opacity:0"><b>≠</b><span>soal tiap siswa berbeda</span></div></div><p class="bs-catatan">Ini bukan nilai rapor. Tujuannya mengetahui titik awalmu supaya kelompok belajar bisa seimbang.</p></div></div>'; });

    /* ---------- kendali ---------- */
    const bBack = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Mundur', onclick: () => mundur() });
    const kec = el('div', { kelas: 'kecepatan', role: 'group', 'aria-label': 'Kecepatan animasi' }, el('span', { kelas: 'muted kecil' }, 'Kecepatan'), [1, 2, 3].map((n) => el('button', { type: 'button', kelas: UI.speed === n ? 'aktif' : '', onclick: (e) => { UI.speed = n; try { localStorage.setItem('ac_speed', n); } catch (x) { /* abaikan */ } [...kec.querySelectorAll('button')].forEach((b) => b.classList.toggle('aktif', b === e.currentTarget)); } }, n + '×')));
    const bUlang = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Ulangi langkah', onclick: () => ulang() });
    const bNext = el('button', { kelas: 'btn sorot besar', type: 'button', onclick: () => lanjut() });
    const titik = el('div', { kelas: 'pg-titik' }); BAB.forEach((b, i) => titik.append(el('i', { 'aria-label': 'Bab ' + (i + 1), title: b.judul, onclick: () => { if (!terkunci && (guru || played.has(i) || i <= ci)) ke(i); } })));
    kendali.append(bBack, titik, kec, bUlang, bNext);
    const panjang = (i) => BAB[i].beats.length;
    function ui() {
      judul.textContent = BAB[ci].judul; no.textContent = (ci + 1) + ' / ' + BAB.length; [...titik.children].forEach((d, i) => { d.className = i === ci ? 'aktif' : (i < ci || played.has(i) ? 'sudah' : ''); });
      const n = panjang(ci), interaktif = BAB[ci].tipe === 'interaktif', tunggu = interaktif && !(siapHal || guru), terakhir = ci === BAB.length - 1 && bi >= n;
      langkahInfo.textContent = n ? 'Langkah ' + Math.min(bi, n) + ' dari ' + n : ''; langkahInfo.hidden = !n; bBack.disabled = ci === 0 && bi <= 1;
      const ig = document.getElementById('infoGaleri'); if (ig) ig.hidden = !interaktif;
      bNext.innerHTML = terakhir ? (o.labelAkhir || 'Selesai') + ik('centang') : (bi >= n ? 'Bab berikutnya' + ik('panah') : 'Lanjut' + ik('panah'));
      const kunci = terkunci && !terakhir; if (kunci) bNext.innerHTML = 'Mengikuti guru' + ik('jam');
      bNext.className = 'btn sorot besar' + ((sibuk || tunggu || kunci) ? ' mati' : ' denyut') + (terakhir ? ' hijau' : ''); bBack.disabled = bBack.disabled || terkunci; bUlang.disabled = terkunci; pg.classList.toggle('ikut', terkunci);
    }
    async function mulaiBab(i) { const b = BAB[i]; const r = b.mulai && b.mulai(); if (r && r.then) await r; if (b.tipe === 'stage') { keStage(); } }
    async function jalankanBeat(i, j) { await BAB[i].beats[j](); }
    async function bangun(c, b) {
      T.stop(); T = UI.token(); FF = true; sibuk = true; K = null; Bd = null; ctxS = {}; gr.querySelectorAll('svg').forEach((s) => s.remove()); bdHost.innerHTML = ''; tanyaEl.innerHTML = ''; stage.className = 'pg-stage m-papan'; siapHal = false;
      try { for (let i = 0; i <= c; i++) { await mulaiBab(i); const n = i < c ? panjang(i) : Math.min(b, panjang(i)); for (let j = 0; j < n; j++) await jalankanBeat(i, j); } } catch (e) { if (!(e instanceof UI.Batal)) console.error(e); }
      FF = false; ci = c; bi = b; sibuk = false; kirimPos(); if (BAB[ci].tipe === 'stage' && K) K.home = Object.assign({}, K.v); ui(); if (o.saatLangkah) o.saatLangkah(ci);
    }
    async function lanjut(paksa) {
      if (sibuk) return; const n = panjang(ci); const t = T;
      if (terkunci && !paksa && !(ci === BAB.length - 1 && bi >= n)) return;
      if (BAB[ci].tipe === 'interaktif' && !(siapHal || guru || paksa)) return;
      if (bi < n) { sibuk = true; ui(); try { await jalankanBeat(ci, bi); bi++; } catch (e) { if (!(e instanceof UI.Batal)) console.error(e); } if (T !== t) return; sibuk = false; kirimPos(); if (bi >= n) { played.add(ci); if (o.saatMain) o.saatMain([...played]); } ui(); return; }
      if (ci < BAB.length - 1) { sibuk = true; ci++; bi = 0; if (o.saatLangkah) o.saatLangkah(ci); ui(); try { await mulaiBab(ci); if (panjang(ci)) { await jalankanBeat(ci, 0); bi = 1; } } catch (e) { if (!(e instanceof UI.Batal)) console.error(e); } if (T !== t) return; sibuk = false; kirimPos(); if (panjang(ci) <= bi) { played.add(ci); if (o.saatMain) o.saatMain([...played]); } ui(); return; }
      if (o.saatSelesai) o.saatSelesai();
    }
    async function mundur() { if (terkunci) return; if (sibuk) { T.stop(); } if (bi > 1) return bangun(ci, bi - 1); if (ci > 0) return bangun(ci - 1, panjang(ci - 1)); return bangun(0, 0); }
    async function ulang() { if (terkunci) return; const tgt = Math.max(0, bi - 1); if (BAB[ci].tipe === 'interaktif') return bangun(ci, 0); await bangun(ci, tgt); await lanjut(); }
    async function ke(i, paksa) { if (i < 0 || i >= BAB.length || (terkunci && !paksa)) return; await bangun(i, Math.min(1, panjang(i))); }
    function kirimPos() { if (!guru || !o.saatPosisi) return; const k = ci + ':' + bi; if (k === posKirim) return; posKirim = k; o.saatPosisi(ci, bi); }
    async function ikutGuru() { if (guru || !o.ambilPosisi || sibuk) return; let p; try { p = await o.ambilPosisi(); } catch (e) { return; } if (p === undefined) return; if (!p) { if (terkunci) { terkunci = false; ui(); } return; } if (!terkunci) { terkunci = true; ui(); } if (sibuk || (p.c === ci && p.b === bi)) return; p.c = Math.max(0, Math.min(BAB.length - 1, p.c)); const n = panjang(ci), maju = (p.c === ci && p.b === bi + 1 && bi < n) || (p.c === ci + 1 && p.b === Math.min(1, panjang(p.c)) && bi >= n); if (maju) await lanjut(true); else await bangun(p.c, Math.min(p.b, panjang(p.c))); ui(); }
    if (!guru && o.ambilPosisi) pollId = setInterval(ikutGuru, 2500);
    const tombol = (e) => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (document.querySelector('.tirai')) return; if (terkunci) return; if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); lanjut(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); mundur(); } };
    document.addEventListener('keydown', tombol);
    bangun(Math.max(0, Math.min(o.mulai || 0, BAB.length - 1)), o.mulai ? Math.min(1, panjang(Math.min(o.mulai, BAB.length - 1))) : 0).then(() => { if (!o.mulai) lanjut(); });
    return { ke, jumlah: BAB.length, stop() { clearInterval(pollId); T.stop(); document.removeEventListener('keydown', tombol); }, idx: () => ci };
  }
  root.Panggung = { mount };
})(window);

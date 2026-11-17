/* Pengantar kelas XII-A/B/C (materi: luas daerah di antara dua kurva). Sembilan slide bergaya motion graphic:
   judul → ingat kembali (integral tentu sederhana: soal → grafik → arsiran → hitung) → "bagaimana jika ada 2 fungsi?" →
   contoh dua kurva → mencari titik potong (persamaan "bergeser" antarbaris) → luas dan hitungannya → tujuh sub-materi → tujuan → bersiap tes.
   Dipakai sama persis oleh tablet murid dan layar guru. Memakai helper Intro.h dari intro.js. */
(function (root) {
  'use strict';
  const { el, ik, anim, esc } = UI, { S } = GF, B = BS, H = Intro.h, { muncul, pop, gerak } = H;
  const VR = (s) => '<i>' + s + '</i>', IG = B.igH, EV = B.evH;
  const fr = (n, d) => '<span class="frak"><span class="at">' + n + '</span><span class="bw">' + d + '</span></span>';
  const NAVY = '#13294B', MERAH = '#B3232D', EMAS = '#C9922F', BIRU = '#2A5AA7';
  const ease = (k) => k * k * (3 - 2 * k);
  let idKlip = 0;

  /* ---------------------------------------------------------------- papan: bidang Kartesius yang bisa digambar bertahap */
  function papan(host, v, o) {
    o = o || {}; const b = GF.bidang(Object.assign({ W: o.W || 720, H: o.H || 470, label: o.label || 'Grafik' }, v)); host.append(b.svg);
    const id = 'kl' + (++idKlip), defs = S('defs', null, S('clipPath', { id }, S('rect', { x: b.m.l, y: b.m.t, width: b.pw, height: b.ph })));
    b.svg.insertBefore(defs, b.svg.firstChild); ['isi', 'kurva', 'putus'].forEach((n) => b.lapis[n].setAttribute('clip-path', 'url(#' + id + ')'));
    const N = 260, pv = GF.pv;
    const d = (p, x0, x1) => { let s = '', on = false; for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N, y = pv(p, x); if (!isFinite(y) || y < v.ymin - .6 || y > v.ymax + .6) { on = false; continue; } s += (on ? 'L' : 'M') + b.sx(x).toFixed(1) + ' ' + b.sy(y).toFixed(1); on = true; } return s; };
    const P = {
      b, svg: b.svg, d,
      /* kondisi awal: sumbu dan kisi disembunyikan lalu "digambar" oleh sumbu() */
      sembunyiSumbu() { b.lapis.grid.style.opacity = 0; b.lapis.label.style.opacity = 0; const ax = b.ax, ay = b.ay; P._ax = ['x1', 'y1', 'x2', 'y2'].map((k) => +ax.getAttribute(k)); P._ay = ['x1', 'y1', 'x2', 'y2'].map((k) => +ay.getAttribute(k)); ax.setAttribute('x2', P._ax[0]); ay.setAttribute('y2', P._ay[3]); ay.setAttribute('y1', P._ay[3]); },
      async sumbu(t, ms) { const a = P._ax, c = P._ay; await Promise.all([GF.tumbuh(b.ax, a[0], a[1], a[2], a[3], ms || 900, t), GF.tumbuh(b.ay, c[0], c[3], c[2], c[1], ms || 900, t), anim(b.lapis.grid, [{ opacity: 0 }, { opacity: 1 }], { duration: ms || 900 }), anim(b.lapis.label, [{ opacity: 0 }, { opacity: 1 }], { duration: ms || 900, delay: 250 })]); t.cek(); },
      kurva(p, warna, tebal) { const e = S('path', { d: d(p, v.xmin, v.xmax), fill: 'none', stroke: warna, 'stroke-width': tebal || 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }); b.lapis.kurva.append(e); e._p = p; return e; },
      async gambar(e, ms, t) { await anim(e, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: ms || 1400, easing: 'cubic-bezier(.45,.05,.25,1)' }); t && t.cek(); },
      selesaiKurva(e) { e.style.strokeDashoffset = 0; e.setAttribute('stroke-dashoffset', 0); },
      /* morf: koefisien polinom berubah mulus dari p0 ke p1 (kurva "berubah wujud") */
      async morf(e, p1, ms, t) { const p0 = e._p, n = Math.max(p0.length, p1.length); await gerak(ms, (k) => { const q = []; for (let i = 0; i < n; i++) q[i] = (p0[i] || 0) + ((p1[i] || 0) - (p0[i] || 0)) * ease(k); e.setAttribute('d', d(q, v.xmin, v.xmax)); }, t); e._p = p1; },
      isi(U, L, a, bb, w) { const p = S('path', { fill: b.pola(w || 0), stroke: 'none' }); b.lapis.isi.append(p); const bangun = (tt) => { if (tt <= .001) { p.setAttribute('d', ''); return; } const e = a + (bb - a) * tt, M = 80, at = [], bw = []; for (let i = 0; i <= M; i++) { const s = a + (e - a) * i / M; at.push([s, pv(U, s)]); bw.push([s, pv(L, s)]); } p.setAttribute('d', at.concat(bw.reverse()).map((q, i) => (i ? 'L' : 'M') + b.sx(q[0]).toFixed(1) + ' ' + b.sy(q[1]).toFixed(1)).join('') + 'Z'); }; bangun(0); return { p, bangun }; },
      teks(x, y, txt, w) { w = w || {}; const t = S('text', { x: b.sx(x) + (w.dx || 0), y: b.sy(y) + (w.dy || 0), 'font-size': w.ukuran || 19, 'font-weight': 800, fill: w.warna || NAVY, 'text-anchor': w.anchor || 'start', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 5, opacity: 0 }, txt); b.lapis.atas.append(t); return t; },
      tegak(x, y1, y2, warna, t) { const l = S('line', { x1: b.sx(x), x2: b.sx(x), y1: b.sy(y1), y2: b.sy(y1), stroke: warna || MERAH, 'stroke-width': 3.2, 'stroke-dasharray': '8 6', 'stroke-linecap': 'round' }); b.lapis.putus.append(l); return GF.tumbuh(l, b.sx(x), b.sy(y1), b.sx(x), b.sy(y2), 800, t); },
      titik(x, y, o2) { const g = b.titik(x, y, Object.assign({ r: 8, warna: NAVY }, o2 || {})); g.setAttribute('opacity', 0); return g; },
      async nyala(g) { g.setAttribute('opacity', 1); await pop(g); },
      cincin(x, y, warna) { const c = S('circle', { cx: b.sx(x), cy: b.sy(y), r: 10, fill: 'none', stroke: warna || EMAS, 'stroke-width': 3 }); c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; b.lapis.atas.append(c); c.animate([{ opacity: .95, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(3)' }], { duration: 1300, iterations: Infinity }); return c; }
    };
    return P;
  }
  const lihatSatu = { xmin: -1, xmax: 3, ymin: -1, ymax: 5, xt: [-1, 0, 1, 2, 3], yt: [0, 1, 2, 3, 4, 5] };
  const lihatDua = { xmin: -2.5, xmax: 3.5, ymin: -1, ymax: 6.5, xt: [-2, -1, 0, 1, 2, 3], yt: [0, 1, 2, 3, 4, 5, 6] };
  const F1 = [0, 0, 1], F2 = [2, 1, 0];   // y = x²  dan  y = x + 2  (titik potong x = −1 dan x = 2; luas 9/2)

  /* ---------------------------------------------------------------- tata letak dan baris penjelasan */
  const tata = (c) => { const w = el('div', { kelas: 'alur' }), kiri = el('div', { kelas: 'kartu alur-grafik' }), kanan = el('div', { kelas: 'alur-teks gulir' }); w.append(kiri, kanan); c.a.append(w); return { w, kiri, kanan }; };
  const baris = (kanan, cap, rumus, kls) => { const r = el('div', { kelas: 'alur-baris' + (kls ? ' ' + kls : '') }); r.innerHTML = '<div class="cap">' + cap + '</div>' + (rumus ? '<div class="rumus-blok">' + rumus + '</div>' : ''); kanan.append(r); return r; };
  const turun = (kanan) => { kanan.scrollTo({ top: kanan.scrollHeight, behavior: 'smooth' }); };
  const kedip = (e, n) => anim(e, [{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: 800, iterations: n || 2 });
  const sorotBaris = (r) => anim(r, [{ boxShadow: '0 0 0 0 rgba(224,174,74,0)' }, { boxShadow: '0 0 0 .5rem rgba(224,174,74,.55)', offset: .4 }, { boxShadow: '0 0 0 0 rgba(224,174,74,0)' }], { duration: 1100 });
  const kolomKiriMasuk = (kiri) => anim(kiri, [{ opacity: 0, transform: 'translateX(-2rem)' }, { opacity: 1, transform: 'none' }], { duration: 600 });

  /* ---------------------------------------------------------------- 1. judul materi */
  async function adJudul(c) {
    const { a, t } = c, prog = B.cfg(B.kelasAktif()).program, w = el('div', { kelas: 'judul-slide' }); a.append(w);
    w.innerHTML = '<div class="js-bg"></div><div class="js-isi"><div class="js-eyebrow"><i></i>Matematika Tingkat Lanjut · ' + esc(B.cfg(B.kelasAktif()).nama) + '</div><h1 class="js-judul"><span class="kata">Luas</span> <span class="kata">Daerah</span><br><span class="kata kecil">di</span> <span class="kata">Antara</span> <span class="kata em">Dua&nbsp;Kurva</span></h1><p class="js-sub">Integral tentu untuk menghitung luas daerah yang dibatasi dua kurva, beserta semua variasinya.</p><div class="js-chip"><span>Integral tentu</span><span>Titik potong</span><span>Atas − bawah</span><span>Kanan − kiri</span></div></div><div class="js-seni" aria-hidden="true">' + UI.heroSVG() + '</div>';
    void prog; const kata = [...w.querySelectorAll('.kata')]; kata.forEach((k) => { k.style.opacity = 0; });
    await muncul(w, 500); t.cek();
    for (const k of kata) { anim(k, [{ opacity: 0, transform: 'translateY(1.2rem)', filter: 'blur(.4rem)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 650 }); await t.tidur(190); }
    await t.tidur(900); const kp = [...w.querySelectorAll('.js-chip span')]; for (const k of kp) { anim(k, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' }); await t.tidur(160); }
    await t.tidur(800); c.siap();
  }

  /* ---------------------------------------------------------------- 2. yuk, ingat kembali: soal → grafik → arsiran → hitung */
  async function adIngat(c) {
    const { a, t } = c, { w, kiri, kanan } = tata(c); w.style.opacity = 0;
    const soal = el('div', { kelas: 'soal-besar kartu' }); soal.innerHTML = '<div class="eyebrow">Yuk, ingat kembali</div><div class="sb-teks">Hitunglah&ensp;' + IG(0, 2) + ' (4 − ' + VR('x') + '<sup>2</sup>) ' + VR('dx') + '</div><div class="muted sb-ket">Satu soal integral tentu yang sederhana.</div>'; a.append(soal);
    await muncul(soal, 700); await t.tidur(1500);
    /* tahap 2: soal "menyusut" ke kolom kanan, grafik muncul di kiri */
    const r1 = baris(kanan, 'Soal', IG(0, 2) + ' (4 − ' + VR('x') + '<sup>2</sup>) ' + VR('dx')); r1.style.opacity = 0; w.style.opacity = 1; await t.tidur(60);
    const A = soal.getBoundingClientRect(), Bx = r1.getBoundingClientRect();
    const geser = anim(soal, [{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (Bx.left - A.left + (Bx.width - A.width) / 2) + 'px,' + (Bx.top - A.top + (Bx.height - A.height) / 2) + 'px) scale(' + Math.min(1, Bx.width / A.width) + ',' + Math.min(1, Bx.height / A.height) + ')', opacity: .0 }], { duration: 900, easing: 'cubic-bezier(.6,0,.2,1)' });
    anim(r1, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 500 }); await geser; soal.remove(); t.cek();
    const p = papan(kiri, lihatSatu, { label: 'Grafik y = 4 − x²' }); p.sembunyiSumbu(); await kolomKiriMasuk(kiri); await p.sumbu(t, 1000);
    const r2 = baris(kanan, 'Gambar grafik fungsi <i>f</i>(<i>x</i>) = 4 − <i>x</i><sup>2</sup>'); await muncul(r2, 400); const k = p.kurva([4, 0, -1], NAVY, 5.5); await p.gambar(k, 1600, t);
    const lab = p.teks(0.45, 4.35, 'y = 4 − x²', { warna: NAVY }); await anim(lab, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }); await t.tidur(500); turun(kanan);
    const r3 = baris(kanan, 'Batas integral: <i>x</i> = 0 sampai <i>x</i> = 2'); await muncul(r3, 400);
    await p.tegak(0, 0, 4, MERAH, t); const tg1 = p.titik(0, 4, { teks: true }), tg2 = p.titik(2, 0, { teks: true }); await p.nyala(tg1); await p.nyala(tg2);
    const l0 = p.teks(0, 0, 'x = 0', { dx: 8, dy: 26, warna: '#7E1820' }), l2 = p.teks(2, 0, 'x = 2', { dx: 8, dy: 26, warna: '#7E1820' }); await Promise.all([anim(l0, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }), anim(l2, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 })]); await t.tidur(500); turun(kanan);
    const r4 = baris(kanan, 'Daerah yang <b>diarsir</b> di bawah kurva dan di atas sumbu-<i>x</i> itulah yang kita ukur: nilai integral tentu = luas daerah.'); await muncul(r4, 400);
    const isi = p.isi(k._p, [0], 0, 2, 0); await GF.tumbuhIsi(isi, 1800, t); await kedip(isi.p, 2); await sorotBaris(r4); await t.tidur(500); turun(kanan);
    const r5 = baris(kanan, 'Cari antiturunan, lalu substitusi batas:', 'F(' + VR('x') + ') = 4' + VR('x') + ' − ' + fr(VR('x') + '<sup>3</sup>', 3) + '<br>' + EV('4' + VR('x') + ' − ' + fr(VR('x') + '<sup>3</sup>', 3), 0, 2) + ' = (8 − ' + fr(8, 3) + ') − 0'); await muncul(r5, 500); await t.tidur(1400); turun(kanan);
    const r6 = baris(kanan, 'Hasilnya', '= ' + fr(16, 3) + ' &nbsp;satuan luas', 'hasil'); await pop(r6); const lh = p.teks(0.4, 1.5, 'L = 16/3', { warna: '#7A5A1A', ukuran: 24 }); await anim(lh, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }); pesta(r6); await t.tidur(900); c.siap();
  }
  function pesta(e) { const r = e.getBoundingClientRect(); H.pesta(r.left + r.width / 2, r.top); }

  /* ---------------------------------------------------------------- 3. bagaimana jika ada 2 fungsi? */
  async function adDuaFungsi(c) {
    const { a, t } = c, w = el('div', { kelas: 'dua-fungsi' }); a.append(w);
    const q = el('div', { kelas: 'tanya-besar' }), kartu = el('div', { kelas: 'kartu df-grafik' }); w.append(q, kartu);
    const setQ = async (txt, em) => { const kata = txt.split(' '); q.innerHTML = kata.map((k, i) => '<span class="kata' + (em && em.includes(i) ? ' em' : '') + '" style="opacity:0">' + k + '</span>').join(' '); for (const s of q.querySelectorAll('.kata')) { anim(s, [{ opacity: 0, transform: 'translateY(.9rem)' }, { opacity: 1, transform: 'none' }], { duration: 520 }); await t.tidur(120); } };
    await muncul(w, 400); await setQ('Bagaimana jika ada 2 fungsi?', [4, 5]); await t.tidur(500);
    const p = papan(kartu, lihatDua, { W: 900, H: 400, label: 'Dua kurva' }); p.sembunyiSumbu(); await anim(kartu, [{ opacity: 0, transform: 'translateY(1.5rem)' }, { opacity: 1, transform: 'none' }], { duration: 600 }); await p.sumbu(t, 900);
    const k1 = p.kurva(F1, NAVY, 5.5); await p.gambar(k1, 1500, t); const l1 = p.teks(2.5, 6.15, 'f(x)', { warna: NAVY, ukuran: 22 }); await anim(l1, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }); await t.tidur(400);
    /* kurva kedua "lahir" dari kurva pertama lalu berubah wujud (morf) */
    const k2 = p.kurva(F1, MERAH, 5.5); k2.style.strokeDashoffset = 0; k2.setAttribute('stroke-dashoffset', 0); await anim(k2, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }); await p.morf(k2, [0, 0, -.5], 700, t); await p.morf(k2, F2, 1700, t);
    const l2 = p.teks(2.5, 3.95, 'g(x)', { warna: MERAH, ukuran: 22 }); await anim(l2, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }); await t.tidur(900);
    await Promise.all([...q.querySelectorAll('.kata')].map((s) => anim(s, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-.9rem)' }], { duration: 420 }))); await setQ('Bagaimana menghitung luas di antara 2 kurva?', [4, 5, 6, 7]);
    const isi = p.isi(F2, F1, -1, 2, 0); await GF.tumbuhIsi(isi, 1900, t); const tanda = p.teks(0.5, 1.2, '?', { warna: '#7A5A1A', ukuran: 54, anchor: 'middle' }); await anim(tanda, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)' }); await kedip(isi.p, 2); await t.tidur(700); c.siap();
  }

  /* ---------------------------------------------------------------- 4. contoh: dua kurva di bidang Kartesius */
  async function adKartesius(c) {
    const { t } = c, { kiri, kanan } = tata(c); const p = papan(kiri, lihatDua, { label: 'Kurva y = x² dan y = x + 2' }); p.sembunyiSumbu(); await kolomKiriMasuk(kiri); await p.sumbu(t, 1100);
    const r0 = baris(kanan, 'Perhatikan bidang Kartesius ini. Kita akan menggambar dua kurva.'); await muncul(r0, 450); await t.tidur(500);
    const r1 = baris(kanan, '<b>Kurva pertama</b>', '<span class="sw" style="background:' + NAVY + '"></span>' + VR('y') + ' = ' + VR('x') + '<sup>2</sup>&ensp;<span class="muted kecil">(parabola)</span>'); await muncul(r1, 450); const k1 = p.kurva(F1, NAVY, 5.5); await p.gambar(k1, 1700, t); const l1 = p.teks(2.5, 6.15, 'y = x²', { warna: NAVY, ukuran: 21 }); await anim(l1, [{ opacity: 0 }, { opacity: 1 }], { duration: 450 }); await t.tidur(600); turun(kanan);
    const r2 = baris(kanan, '<b>Kurva kedua</b>', '<span class="sw" style="background:' + MERAH + '"></span>' + VR('y') + ' = ' + VR('x') + ' + 2&ensp;<span class="muted kecil">(garis lurus)</span>'); await muncul(r2, 450); const k2 = p.kurva(F2, MERAH, 5.5); await p.gambar(k2, 1700, t); const l2 = p.teks(2.4, 3.95, 'y = x + 2', { warna: MERAH, ukuran: 21 }); await anim(l2, [{ opacity: 0 }, { opacity: 1 }], { duration: 450 }); await t.tidur(700); turun(kanan);
    const r3 = baris(kanan, 'Kedua kurva <b>berpotongan</b>. Di mana titik pertemuannya? Titik itu akan menjadi <b>batas integral</b>.'); await muncul(r3, 450);
    const c1 = p.cincin(-1, 1, EMAS), c2 = p.cincin(2, 4, EMAS); const q1 = p.teks(-1, 1, '?', { warna: '#7A5A1A', ukuran: 34, dx: -30, dy: -10 }), q2 = p.teks(2, 4, '?', { warna: '#7A5A1A', ukuran: 34, dx: 14, dy: 36 }); await Promise.all([anim(q1, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }), anim(q2, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 })]); await sorotBaris(r3); await t.tidur(1400); void c1; void c2; c.siap();
  }

  /* ---------------------------------------------------------------- persamaan "bergeser" antarbaris (magic move) */
  const tokenBaris = (tokens) => { const d = el('div', { kelas: 'mm-baris' }); tokens.forEach(([id, h]) => d.append(el('span', { kelas: 'mm-t', 'data-id': id, html: h }))); return d; };
  async function geserDari(prev, next, t) {
    const lama = {}; if (prev) prev.querySelectorAll('.mm-t').forEach((e) => { lama[e.dataset.id] = e.getBoundingClientRect(); }); const jobs = [];
    next.querySelectorAll('.mm-t').forEach((e, i) => { const r = e.getBoundingClientRect(), o = lama[e.dataset.id]; if (o) jobs.push(anim(e, [{ transform: 'translate(' + (o.left - r.left) + 'px,' + (o.top - r.top) + 'px)', color: EMAS }, { transform: 'none', color: 'inherit' }], { duration: 1000, easing: 'cubic-bezier(.6,0,.2,1)' })); else jobs.push(anim(e, [{ opacity: 0, transform: 'translateY(.7rem)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 450 + i * 90 })); });
    await Promise.all(jobs); t.cek();
  }

  /* ---------------------------------------------------------------- 5. mencari titik potong */
  async function adTitikPotong(c) {
    const { t } = c, { kiri, kanan } = tata(c); const p = papan(kiri, lihatDua, { label: 'Mencari titik potong' }); const k1 = p.kurva(F1, NAVY, 5.5), k2 = p.kurva(F2, MERAH, 5.5); p.selesaiKurva(k1); p.selesaiKurva(k2);
    const l1 = p.teks(2.5, 6.15, 'y = x²', { warna: NAVY, ukuran: 21 }), l2 = p.teks(2.4, 3.95, 'y = x + 2', { warna: MERAH, ukuran: 21 }); l1.setAttribute('opacity', 1); l2.setAttribute('opacity', 1); await kolomKiriMasuk(kiri);
    const mulaiBaris = async (cap, tokens) => { const r = baris(kanan, cap, ''), q = tokenBaris(tokens); r.querySelector('.rumus-blok') || r.append(el('div', { kelas: 'rumus-blok' })); r.querySelector('.rumus-blok').append(q); r.style.opacity = 0; turun(kanan); await anim(r, [{ opacity: 0 }, { opacity: 1 }], { duration: 350 }); return { r, q }; };
    let b1 = await mulaiBaris('Di titik potong, kedua kurva punya nilai <i>y</i> yang sama. Samakan kedua fungsinya:', [['A', VR('x') + '<sup>2</sup>'], ['E', '='], ['P', VR('x')], ['Q', '+ 2']]);
    const c1 = p.cincin(-1, 1, EMAS), c2 = p.cincin(2, 4, EMAS); await t.tidur(1500);
    const b2 = await mulaiBaris('Pindahkan semua suku ke ruas kiri (tanda berubah):', [['A', VR('x') + '<sup>2</sup>'], ['P', '− ' + VR('x')], ['Q', '− 2'], ['E', '='], ['Z', '0']]); await geserDari(b1.q, b2.q, t); await t.tidur(900);
    const b3 = await mulaiBaris('Faktorkan:', [['F1', '(' + VR('x') + ' + 1)'], ['F2', '(' + VR('x') + ' − 2)'], ['E', '='], ['Z', '0']]); await geserDari(b2.q, b3.q, t); await t.tidur(900);
    const b4 = await mulaiBaris('Salah satu faktor harus nol:', [['X1', VR('x') + ' = −1'], ['O', '&ensp;atau&ensp;'], ['X2', VR('x') + ' = 2']]); await geserDari(b3.q, b4.q, t); await t.tidur(500);
    await Promise.all([p.tegak(-1, 0, 1, MERAH, t), p.tegak(2, 0, 4, MERAH, t)]); const lx1 = p.teks(-1, 0, 'x = −1', { dx: -4, dy: 28, warna: '#7E1820', anchor: 'middle' }), lx2 = p.teks(2, 0, 'x = 2', { dx: 6, dy: 28, warna: '#7E1820', anchor: 'middle' }); await Promise.all([anim(lx1, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }), anim(lx2, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 })]); await t.tidur(700);
    const r5 = baris(kanan, 'Cari nilai <i>y</i>: substitusikan ke <i>y</i> = <i>x</i><sup>2</sup>', VR('x') + ' = −1 → ' + VR('y') + ' = (−1)<sup>2</sup> = 1<br>' + VR('x') + ' = 2 → ' + VR('y') + ' = 2<sup>2</sup> = 4'); await muncul(r5, 450); turun(kanan);
    const g1 = p.titik(-1, 1, { teks: true }), g2 = p.titik(2, 4, { teks: true }); await p.nyala(g1); await t.tidur(300); await p.nyala(g2); c1.remove(); c2.remove();
    const r6 = baris(kanan, 'Jadi kedua kurva berpotongan di <b>(−1, 1)</b> dan <b>(2, 4)</b>.', '', 'hasil'); await pop(r6); turun(kanan); await t.tidur(900); c.siap();
  }

  /* ---------------------------------------------------------------- 6. menghitung luas */
  async function adLuas(c) {
    const { t } = c, { kiri, kanan } = tata(c); const p = papan(kiri, lihatDua, { label: 'Luas daerah di antara y = x + 2 dan y = x²' }); const k1 = p.kurva(F1, NAVY, 5.5), k2 = p.kurva(F2, MERAH, 5.5); p.selesaiKurva(k1); p.selesaiKurva(k2);
    [p.teks(2.5, 6.15, 'y = x²', { warna: NAVY, ukuran: 21 }), p.teks(2.4, 3.95, 'y = x + 2', { warna: MERAH, ukuran: 21 })].forEach((x) => x.setAttribute('opacity', 1));
    [[-1, 1], [2, 4]].forEach(([x, y]) => { const g = p.titik(x, y, { teks: true }); g.setAttribute('opacity', 1); });
    [-1, 2].forEach((x, i) => { const l = S('line', { x1: p.b.sx(x), x2: p.b.sx(x), y1: p.b.sy(0), y2: p.b.sy(i ? 4 : 1), stroke: MERAH, 'stroke-width': 3.2, 'stroke-dasharray': '8 6' }); p.b.lapis.putus.append(l); });
    await kolomKiriMasuk(kiri);
    const r1 = baris(kanan, 'Pada −1 ≤ <i>x</i> ≤ 2, kurva mana yang <b>di atas</b>? Garis <i>y</i> = <i>x</i> + 2. Yang <b>di bawah</b>: parabola <i>y</i> = <i>x</i><sup>2</sup>.'); await muncul(r1, 450);
    /* pita tipis: tinggi = atas − bawah */
    const x0 = 0.5, up = p.b.sy(x0 + 2), lo = p.b.sy(x0 * x0), px = p.b.sx(x0), gar = S('line', { x1: px, x2: px, y1: lo, y2: lo, stroke: EMAS, 'stroke-width': 9, 'stroke-linecap': 'round' }); p.b.lapis.atas.append(gar);
    await gerak(1100, (k) => { gar.setAttribute('y2', lo + (up - lo) * ease(k)); }, t); const lab = p.teks(x0, 2.9, 'atas − bawah', { warna: '#7A5A1A', ukuran: 20, dx: 14, dy: 4 }); await anim(lab, [{ opacity: 0 }, { opacity: 1 }], { duration: 450 }); await t.tidur(800); lab.remove(); gar.remove();
    const r2 = baris(kanan, 'Luas = integral dari <b>(atas − bawah)</b> dengan batas titik potong:', 'L = ' + IG(-1, 2) + ' ((' + VR('x') + ' + 2) − ' + VR('x') + '<sup>2</sup>) ' + VR('dx') + '<br>&ensp;= ' + IG(-1, 2) + ' (−' + VR('x') + '<sup>2</sup> + ' + VR('x') + ' + 2) ' + VR('dx')); await muncul(r2, 450); turun(kanan);
    const isi = p.isi(F2, F1, -1, 2, 0); await GF.tumbuhIsi(isi, 2000, t); await kedip(isi.p, 2); await t.tidur(500);
    const r3 = baris(kanan, 'Antiturunan lalu substitusi batas:', 'F(' + VR('x') + ') = −' + fr(VR('x') + '<sup>3</sup>', 3) + ' + ' + fr(VR('x') + '<sup>2</sup>', 2) + ' + 2' + VR('x') + '<br>F(2) = −' + fr(8, 3) + ' + 2 + 4 = ' + fr(10, 3) + '<br>F(−1) = ' + fr(1, 3) + ' + ' + fr(1, 2) + ' − 2 = −' + fr(7, 6)); await muncul(r3, 500); turun(kanan); await t.tidur(1800);
    const r4 = baris(kanan, 'Luas daerah', 'L = F(2) − F(−1) = ' + fr(10, 3) + ' + ' + fr(7, 6) + ' = ' + fr(27, 6) + ' = ' + fr(9, 2) + ' = 4,5 &nbsp;satuan luas', 'hasil'); await pop(r4); turun(kanan); const lh = p.teks(0.5, 1.7, 'L = 9/2', { warna: '#7A5A1A', ukuran: 24, anchor: 'middle' }); await anim(lh, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }); pesta(r4); await t.tidur(800); c.siap();
  }

  /* ---------------------------------------------------------------- 9. bersiap tes diagnostik */
  async function adBersiap(c) {
    const { a, t } = c, w = el('div', { kelas: 'bersiap' }); a.append(w);
    w.innerHTML = '<div class="bs-jam"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" class="bs-cincin"/><circle cx="100" cy="100" r="86" class="bs-arc" pathLength="1"/><g class="bs-tanda"></g><line x1="100" y1="100" x2="100" y2="38" class="bs-jarum"/><circle cx="100" cy="100" r="7" class="bs-pusat"/></svg></div><div class="bs-isi"><div class="js-eyebrow"><i></i>Tahap berikutnya</div><h1 class="bs-judul">Bersiap untuk<br><span class="em">tes diagnostik awal</span></h1><div class="bs-info"></div><p class="bs-catatan">Ini bukan nilai rapor. Tujuannya mengetahui titik awalmu supaya kelompok belajar bisa seimbang.</p></div>';
    const tanda = w.querySelector('.bs-tanda'); for (let i = 0; i < 12; i++) { const ang = i * 30 * Math.PI / 180; tanda.append(S('line', { x1: 100 + 74 * Math.sin(ang), y1: 100 - 74 * Math.cos(ang), x2: 100 + 82 * Math.sin(ang), y2: 100 - 82 * Math.cos(ang), class: 'bs-garis' })); }
    const info = w.querySelector('.bs-info'), sel = [['5', 'soal'], ['PG', 'pilihan ganda'], [String(Math.round(B.cfg(B.kelasAktif()).durasi / 60)), 'menit'], ['≠', 'soal tiap siswa berbeda']];
    sel.forEach(([b, k]) => info.append(el('div', { kelas: 'bs-kartu', gaya: 'opacity:0', html: '<b>' + b + '</b><span>' + k + '</span>' })));
    await muncul(w, 500); t.cek(); const jarum = w.querySelector('.bs-jarum'), arc = w.querySelector('.bs-arc'); jarum.style.transformOrigin = '100px 100px';
    for (const k of info.children) { anim(k, [{ opacity: 0, transform: 'translateY(1rem) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.34,1.56,.64,1)' }); await t.tidur(320); }
    anim(jarum, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 2600, easing: 'cubic-bezier(.4,0,.2,1)' }); await anim(arc, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 2600, easing: 'cubic-bezier(.4,0,.2,1)' }); await t.tidur(500); c.siap();
  }

  /* ---------------------------------------------------------------- daftar slide (galeri tujuh sub-materi memakai milik Intro) */
  const adTujuan = (c) => H.adDaftar(c, { eyebrow: 'Tujuan pembelajaran hari ini', judul: 'Setelah pelajaran ini, kalian bisa …', isi: ['Menentukan <b>titik potong</b> dua kurva dan memakainya sebagai batas integral.', 'Menyusun integral luas daerah di antara dua kurva: <b>atas − bawah</b> (irisan tegak, dx) atau <b>kanan − kiri</b> (irisan datar, dy).', 'Menangani kurva yang <b>bertukar posisi</b> dan daerah yang memotong sumbu-x dengan memecah daerahnya.', 'Menghitung luas dengan benar (tidak pernah negatif), lalu <b>menjelaskan caranya</b> kepada temanmu.'] });
  Intro.k2 = () => [
    { judul: 'Luas daerah di antara dua kurva', f: adJudul },
    { judul: 'Yuk, ingat kembali', f: adIngat },
    { judul: 'Bagaimana jika ada 2 fungsi?', f: adDuaFungsi },
    { judul: 'Contoh: dua kurva', f: adKartesius },
    { judul: 'Mencari titik potong', f: adTitikPotong },
    { judul: 'Menghitung luas daerah', f: adLuas },
    { judul: 'Sub-materi yang akan dipelajari', f: H.adGaleri },
    { judul: 'Tujuan pembelajaran', f: adTujuan },
    { judul: 'Bersiap tes diagnostik', f: adBersiap }
  ];
})(window);

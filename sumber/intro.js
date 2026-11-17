/* Pengantar bergaya motion graphic: pertanyaan pemantik, luas bertanda, pecah di titik potong, irisan tegak (dx) dan datar (dy),
   mesin integral interaktif, prosedur empat langkah, galeri tujuh bagian, aturan jigsaw, tujuan.
   Dipakai sama persis oleh tablet siswa dan layar guru. */
(function (root) {
  'use strict';
  const { el, ik, tidur, anim, esc } = UI, { S, fmt, K } = GF, B = BS;
  const m = (n) => String(n).replace('-', '−');
  const NAMA = UI.NAMA, VR = (s) => '<i>' + s + '</i>';
  const pesta = (x, y) => { if (UI.instan) return; for (let i = 0; i < 26; i++) { const c = el('div', { kelas: 'konfeti', gaya: 'left:' + x + 'px;top:' + y + 'px;background:' + ['#F3A64B', '#0F766E', '#2FA36B', '#BE3455', '#3B6FD6', '#E08A1E'][i % 6] }); document.body.append(c); const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 140; anim(c, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 90) + 'px) rotate(' + (Math.random() * 540) + 'deg)', opacity: 0 }], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).then(() => c.remove()); } };
  const pop = (e) => anim(e, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 1, offset: .6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 520, easing: 'ease-out' });
  const muncul = (e, d) => anim(e, [{ opacity: 0, transform: 'translateY(.9rem)' }, { opacity: 1, transform: 'none' }], { duration: d || 480 });
  const gerak = (ms, fn, tk) => new Promise((res, rej) => { ms = ms / (UI.instan ? 1e6 : UI.speed); const t0 = performance.now(); const f = (t) => { if (tk && tk.batal) return rej(new UI.Batal()); const k = Math.min(1, (t - t0) / ms); fn(k); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  const kur = (spec, i) => (i < 0 ? [0] : spec.k[i]);
  const IG = B.igH, FX = B.fx, EV = B.evH;

  /* ======================================================== adegan: judul (pertanyaan pemantik) */
  async function adJudul(c) {
    const { a, t } = c; const wadah = el('div', { kelas: 'hero kartu' }); a.append(wadah);
    wadah.innerHTML = '<div class="eyebrow">Matematika Tingkat Lanjut · ' + esc(B.cfg(B.kelasAktif()).nama) + '</div><h1>Luas daerah dengan <span class="hl">integral tentu</span></h1><p>Mengapa hasil ' + IG(VR('a'), VR('b')) + ' ' + VR('f') + '(' + VR('x') + ') ' + VR('dx') + ' bisa <b>negatif</b> atau <b>nol</b>, padahal luas suatu daerah <b>tidak pernah negatif</b>? Hari ini kita menghitung luas dengan benar: di bawah kurva dan di antara dua kurva.</p><div id="mini" style="width:24rem;height:12.5rem;margin:.2rem auto 0"></div>';
    await muncul(wadah, 600); t.cek();
    const g = GF.lukis(K.potong.varian[0].spec, { W: 440, H: 230, animasi: true, titik: false, tanpaTick: true }); wadah.querySelector('#mini').append(g.svg);
    await g.jalan(1800, t); c.siap();
  }

  /* ======================================================== kerangka alur: grafik di kiri, penjelasan bertahap di kanan */
  async function adAlur(c, cfg) {
    const { a, t } = c, w = el('div', { kelas: 'alur' }); a.append(w);
    const kiri = el('div', { kelas: 'kartu alur-grafik' }), kanan = el('div', { kelas: 'alur-teks gulir' }); w.append(kiri, kanan);
    if (cfg.judul) kanan.append(el('div', { kelas: 'eyebrow' }, cfg.judul));
    const g = GF.lukis(cfg.spec, { animasi: true, W: 640, H: 440, titik: cfg.titik !== false }); kiri.append(g.svg);
    const ov = S('g', { class: 'ov' }); g.svg.append(ov); const X = { g, ov, t, b: g.b, spec: cfg.spec, kanan, kiri };
    await muncul(w, 350); t.cek();
    for (const L of cfg.langkah) {
      const baris = el('div', { kelas: 'alur-baris' }); baris.innerHTML = '<div class="cap">' + L.cap + '</div>' + (L.rumus ? '<div class="rumus-blok">' + L.rumus + '</div>' : ''); kanan.append(baris); await muncul(baris, 420);
      if (L.aksi) await L.aksi(X, baris); await t.tidur(L.jeda || 700); kanan.scrollTop = kanan.scrollHeight;
    }
    c.siap();
  }
  const A = {
    kurva: async (X) => { await Promise.all(X.g.kurva.map((k) => GF.gambarKurva(k, 1300, X.t))); X.t.cek(); },
    titik: async (X) => { for (const p of X.g.titik) { p.setAttribute('opacity', 1); await pop(p); await X.t.tidur(160); } },
    isi: (...ix) => async (X) => { for (const i of ix) await GF.tumbuhIsi(X.g.isi[i], 1300, X.t); },
    /* satu pita pada posisi pos: tinggi/lebar ditandai dengan dua titik dan label */
    pita: (zi, pos, lab1, lab2) => async (X) => {
      const z = X.spec.z[zi], tipe = X.spec.tipe || 'x', U = kur(X.spec, z.u), L = kur(X.spec, z.l), b = X.b, up = GF.pv(U, pos), lo = GF.pv(L, pos), g = S('g', { class: 'pita-1' });
      const P = (s, v) => (tipe === 'x' ? [b.sx(s), b.sy(v)] : [b.sx(v), b.sy(s)]), p1 = P(pos, up), p2 = P(pos, lo);
      const garis = S('line', { x1: p2[0], y1: p2[1], x2: p2[0], y2: p2[1], stroke: '#E08A1E', 'stroke-width': 7, 'stroke-linecap': 'round' }); g.append(garis); X.ov.append(g);
      const d1 = S('circle', { cx: p1[0], cy: p1[1], r: 8, fill: '#12263F', stroke: '#fff', 'stroke-width': 2.5 }), d2 = S('circle', { cx: p2[0], cy: p2[1], r: 8, fill: '#12263F', stroke: '#fff', 'stroke-width': 2.5 }); g.append(d2);
      const lt = (p, txt, dx, dy) => S('text', { x: p[0] + dx, y: p[1] + dy, 'font-size': 17, 'font-weight': 700, fill: '#12263F', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, txt);
      await gerak(900, (k) => { garis.setAttribute('x2', p2[0] + (p1[0] - p2[0]) * k); garis.setAttribute('y2', p2[1] + (p1[1] - p2[1]) * k); }, X.t); g.append(d1);
      if (lab1) g.append(lt(p1, lab1, tipe === 'x' ? 10 : 8, tipe === 'x' ? -12 : -12)); if (lab2) g.append(lt(p2, lab2, tipe === 'x' ? 10 : -4, tipe === 'x' ? 22 : 24)); await X.t.tidur(500);
    },
    /* banyak pita tipis ditumpuk satu per satu (jumlah Riemann), lalu diganti isian halus */
    irisan: (zi, n) => async (X) => {
      const z = X.spec.z[zi], tipe = X.spec.tipe || 'x', U = kur(X.spec, z.u), L = kur(X.spec, z.l), b = X.b, lebar = (z.b - z.a) / n, tmp = [];
      for (let i = 0; i < n; i++) {
        const s0 = z.a + i * lebar, s1 = s0 + lebar, mid = (s0 + s1) / 2, up = GF.pv(U, mid), lo = GF.pv(L, mid); let x, y, ww, hh;
        if (tipe === 'x') { x = b.sx(s0); ww = b.sx(s1) - b.sx(s0); y = b.sy(Math.max(up, lo)); hh = Math.abs(b.sy(up) - b.sy(lo)); } else { y = b.sy(s1); hh = b.sy(s0) - b.sy(s1); x = b.sx(Math.min(up, lo)); ww = Math.abs(b.sx(up) - b.sx(lo)); }
        const r = S('rect', { x, y, width: ww, height: hh, fill: '#E08A1E', 'fill-opacity': .6, stroke: '#fff', 'stroke-width': 1.4 }); X.ov.append(r); tmp.push(r); await X.t.anim(r, [{ opacity: 0 }, { opacity: 1 }], { duration: 1300 / n });
      }
      await GF.tumbuhIsi(X.g.isi[zi], 700, X.t); await X.t.anim(X.ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }); X.ov.getAnimations().forEach((q) => q.cancel()); X.ov.innerHTML = ''; X.ov.style.opacity = 1;
    },
    garisPutus: (nilai, tipe, label) => async (X) => { const b = X.b, tg = tipe === 'x', l = S('line', { x1: tg ? b.sx(nilai) : b.m.l, y1: tg ? b.m.t : b.sy(nilai), x2: tg ? b.sx(nilai) : b.m.l, y2: tg ? b.m.t : b.sy(nilai), stroke: '#BE3455', 'stroke-width': 3.4, 'stroke-dasharray': '8 6' }); X.ov.append(l); await GF.tumbuh(l, +l.getAttribute('x1'), +l.getAttribute('y1'), tg ? b.sx(nilai) : b.m.l + b.pw, tg ? b.m.t + b.ph : b.sy(nilai), 800, X.t); if (label) { const tx = S('text', { x: tg ? b.sx(nilai) + 8 : b.m.l + 8, y: tg ? b.m.t + 22 : b.sy(nilai) - 8, 'font-size': 16, 'font-weight': 700, fill: '#8E1F3B', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, label); X.ov.append(tx); } }
  };

  /* ======================================================== adegan: luas bertanda → luas (pencerminan) */
  const SP_BAWAH = K.bawah.varian[0].spec;
  const adBawah = (c) => adAlur(c, { judul: 'Kurva di bawah sumbu-x', spec: SP_BAWAH, langkah: [
    { cap: 'Pada [1, 3] kurva <b>y = x² − 4x</b> berada <b>di bawah sumbu-x</b>: nilainya negatif.', aksi: async (X) => { await A.kurva(X); await A.titik(X); await A.isi(0)(X); } },
    { cap: 'Integral tentu menghitung <b>luas bertanda</b>: daerah di bawah sumbu-x ikut bernilai negatif.', rumus: IG(1, 3) + ' (' + FX([0, -4, 1]) + ') ' + VR('dx') + ' = ' + EV('<span class="frak"><span class="at">1</span><span class="bw">3</span></span>' + VR('x') + '<sup>3</sup> − 2' + VR('x') + '<sup>2</sup>', 1, 3) + ' = <b style="color:var(--koral-800)">−' + '<span class="frak"><span class="at">22</span><span class="bw">3</span></span></b>' },
    { cap: 'Luas tidak boleh negatif. <b>Cerminkan</b> daerah ke atas sumbu-x: beri tanda minus di depan integral.', aksi: async (X) => { const b = X.b, f = (x) => GF.pv([0, -4, 1], x), pts = []; for (let i = 0; i <= 60; i++) { const x = 1 + 2 * i / 60; pts.push([x, 0]); } const atas = []; for (let i = 0; i <= 60; i++) { const x = 1 + 2 * i / 60; atas.push([x, -f(x)]); }
      const p = S('path', { d: atas.map((q, i) => (i ? 'L' : 'M') + b.sx(q[0]).toFixed(1) + ' ' + b.sy(q[1]).toFixed(1)).join('') + 'L' + b.sx(3) + ' ' + b.sy(0) + 'L' + b.sx(1) + ' ' + b.sy(0) + 'Z', fill: '#1B9C8F', 'fill-opacity': .38 }); X.ov.append(p); await X.t.anim(p, [{ opacity: 0, transform: 'translateY(' + (b.sy(-4) - b.sy(0)) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 1100 }); } },
    { cap: 'Jadi untuk daerah di bawah sumbu-x:', rumus: 'L = −' + IG(1, 3) + ' (' + FX([0, -4, 1]) + ') ' + VR('dx') + ' = <b style="color:var(--mint-800)"><span class="frak"><span class="at">22</span><span class="bw">3</span></span></b> satuan luas', jeda: 900 }
  ] });

  /* ======================================================== adegan: kurva memotong sumbu → pecah */
  const SP_POTONG = K.potong.varian[0].spec;
  const adPotong = (c) => adAlur(c, { judul: 'Kurva memotong sumbu-x', spec: SP_POTONG, langkah: [
    { cap: 'Kurva <b>y = x² − 2x − 3</b> pada [0, 4] memotong sumbu-x di <b>x = 3</b>. Sebagian daerah di bawah, sebagian di atas.', aksi: async (X) => { await A.kurva(X); await A.titik(X); await A.isi(0, 1)(X); } },
    { cap: 'Kalau dihitung sekaligus, bagian negatif dan bagian positif <b>saling meniadakan</b>:', rumus: IG(0, 4) + ' (' + FX([-3, -2, 1]) + ') ' + VR('dx') + ' = −9 + <span class="frak"><span class="at">7</span><span class="bw">3</span></span> = −<span class="frak"><span class="at">20</span><span class="bw">3</span></span>&emsp;<span style="color:var(--koral-800)">(bukan luas!)</span>' },
    { cap: '<b>Pecah di titik potong</b> x = 3. Bagian di bawah sumbu dinegatifkan.', aksi: A.garisPutus(3, 'x', 'x = 3'), rumus: 'L = −' + IG(0, 3) + ' ' + VR('f') + ' ' + VR('dx') + ' + ' + IG(3, 4) + ' ' + VR('f') + ' ' + VR('dx') },
    { cap: 'Hitung tiap bagian, lalu jumlahkan.', rumus: 'L = −(−9) + <span class="frak"><span class="at">7</span><span class="bw">3</span></span> = <b style="color:var(--mint-800)"><span class="frak"><span class="at">34</span><span class="bw">3</span></span></b> satuan luas', jeda: 900 }
  ] });

  /* ======================================================== adegan: antara dua kurva, irisan tegak (dx) */
  const SP_DX = K.garis.varian[0].spec;
  const adDx = (c) => adAlur(c, { judul: 'Antara dua kurva · irisan tegak (dx)', spec: SP_DX, langkah: [
    { cap: 'Dua kurva berpotongan di (1, 0) dan (4, 3). Itulah <b>batas</b> a = 1 dan b = 4.', rumus: FX([3, -4, 1]) + ' = ' + FX([-1, 1]) + ' → ' + B.fx([4, -5, 1]) + ' = 0 → (' + VR('x') + ' − 1)(' + VR('x') + ' − 4) = 0', aksi: async (X) => { await A.kurva(X); await A.titik(X); } },
    { cap: 'Iris daerah menjadi <b>pita tegak</b> setebal Δx. <b>Tinggi pita = y atas − y bawah.</b>', aksi: A.pita(0, 2.5, 'y atas (garis)', 'y bawah (parabola)') },
    { cap: 'Tumpuk pita dari x = 1 sampai x = 4, lalu jumlahkan: itulah integral.', aksi: A.irisan(0, 14), rumus: 'L = ' + IG(1, 4) + ' (' + VR('y') + '<sub>atas</sub> − ' + VR('y') + '<sub>bawah</sub>) ' + VR('dx') },
    { cap: 'Garis ada di atas parabola (uji x = 2: garis 1, parabola −1). Maka:', rumus: 'L = ' + IG(1, 4) + ' (−' + VR('x') + '<sup>2</sup> + 5' + VR('x') + ' − 4) ' + VR('dx') + ' = <b style="color:var(--mint-800)"><span class="frak"><span class="at">9</span><span class="bw">2</span></span></b> satuan luas', jeda: 900 }
  ] });

  /* ======================================================== adegan: irisan datar (dy) */
  const SP_DY = K.kanan.varian[0].spec;
  const adDy = (c) => adAlur(c, { judul: 'Antara dua kurva · irisan datar (dy)', spec: SP_DY, langkah: [
    { cap: 'Kurva ditulis <b>x = …</b>: <b>x = y² − 2</b> dan <b>x = y</b>. Samakan nilai x, cari y.', rumus: VR('y') + '<sup>2</sup> − 2 = ' + VR('y') + ' → (' + VR('y') + ' − 2)(' + VR('y') + ' + 1) = 0 → ' + VR('y') + ' = −1 dan ' + VR('y') + ' = 2', aksi: async (X) => { await A.kurva(X); await A.titik(X); } },
    { cap: 'Kali ini iris <b>mendatar</b>, setebal Δy. <b>Lebar pita = x kanan − x kiri.</b>', aksi: A.pita(0, 0.5, 'x kanan (garis)', 'x kiri (parabola)') },
    { cap: 'Tumpuk pita dari y = −1 sampai y = 2, lalu jumlahkan.', aksi: A.irisan(0, 14), rumus: 'L = ' + IG(VR('c'), VR('d')) + ' (' + VR('x') + '<sub>kanan</sub> − ' + VR('x') + '<sub>kiri</sub>) ' + VR('dy') },
    { cap: 'Garis ada di kanan parabola (uji y = 0: garis 0, parabola −2). Maka:', rumus: 'L = ' + IG(-1, 2) + ' (−' + VR('y') + '<sup>2</sup> + ' + VR('y') + ' + 2) ' + VR('dy') + ' = <b style="color:var(--mint-800)"><span class="frak"><span class="at">9</span><span class="bw">2</span></span></b> satuan luas', jeda: 900 }
  ] });

  /* ======================================================== adegan: dx atau dy? */
  const adPilih = (c) => adAlur(c, { judul: 'Irisan tegak atau datar?', spec: SP_DY, titik: false, langkah: [
    { cap: 'Daerah yang sama, kali ini diiris <b>tegak</b>. Perhatikan batas bawah pita.', aksi: async (X) => { await A.kurva(X); await A.isi(0)(X);
      const b = X.b, tegak = (xv, y1, y2, w) => { const l = S('line', { x1: b.sx(xv), y1: b.sy(y1), x2: b.sx(xv), y2: b.sy(y1), stroke: w, 'stroke-width': 8, 'stroke-linecap': 'round' }); X.ov.append(l); return gerak(800, (k) => l.setAttribute('y2', b.sy(y1 + (y2 - y1) * k)), X.t); };
      await tegak(-1.5, -Math.sqrt(0.5), Math.sqrt(0.5), '#E08A1E'); await tegak(0.5, 0.5, Math.sqrt(2.5), '#3B6FD6'); await A.garisPutus(-1, 'x', 'x = −1')(X); } },
    { cap: 'Di kiri x = −1 pita dibatasi dua cabang parabola, di kanan x = −1 dibatasi garis dan parabola. <b>Batas bawah berganti di tengah</b>: integral harus dipecah dua.', rumus: 'L = ∫<sub>−2</sub><sup>−1</sup> (…) ' + VR('dx') + ' + ∫<sub>−1</sub><sup>2</sup> (…) ' + VR('dx') },
    { cap: 'Kalau diiris <b>datar</b>, batas kiri (parabola) dan batas kanan (garis) tidak pernah berganti: <b>satu integral cukup</b>.', aksi: async (X) => { X.ov.getAnimations().forEach((q) => q.cancel()); X.ov.innerHTML = ''; await A.pita(0, 0.5, 'x kanan', 'x kiri')(X); } },
    { cap: 'Pilih irisan yang <b>batas atas–bawah (atau kanan–kiri)</b> nya tidak berganti sepanjang daerah.', rumus: 'dx → y atas − y bawah&emsp;|&emsp;dy → x kanan − x kiri', jeda: 900 }
  ] });

  /* ======================================================== adegan: prosedur empat langkah (daftar bertahap) */
  async function adDaftar(c, cfg) {
    const { a, t } = c; const w = el('div', { kelas: 'tujuan-daftar' }); a.append(w);
    w.append(el('div', { kelas: 'tengah' }, el('div', { kelas: 'eyebrow' }, cfg.eyebrow), el('h2', null, cfg.judul)));
    const baris = cfg.isi.map((s, i) => { const r = el('div', { kelas: 'tujuan' }, el('span', { kelas: 'no' }, i + 1), el('span', { html: s })); w.append(r); return r; });
    for (const r of baris) { await t.tidur(500); await anim(r, [{ opacity: 0, transform: 'translateX(2rem)' }, { opacity: 1, transform: 'none' }], { duration: 560 }); }
    c.siap();
  }
  const adProsedur = (c) => adDaftar(c, { eyebrow: 'Prosedur baku', judul: 'Empat langkah untuk semua pos', isi: ['<b>Sketsa.</b> Gambar kurvanya dan pilih irisan: tegak (dx) bila y = …, datar (dy) bila x = ….', '<b>Batas.</b> Cari titik potong dengan sumbu atau antarkurva (samakan kedua persamaan).', '<b>Susun integral.</b> Atas − bawah (dx) atau kanan − kiri (dy). Pecah bila kurva memotong sumbu atau posisinya bertukar.', '<b>Hitung.</b> Cari antiturunan, masukkan batas atas dikurangi batas bawah. Luas harus positif.'] });
  const adTujuan = (c) => adDaftar(c, { eyebrow: 'Tujuan hari ini', judul: 'Setelah pelajaran ini, kalian bisa …', isi: ['Membedakan <b>nilai integral tentu</b> (bertanda) dan <b>luas daerah</b> (tidak pernah negatif).', 'Menghitung luas daerah di bawah satu kurva, termasuk yang memotong sumbu-x.', 'Menghitung luas daerah antara dua kurva dengan irisan tegak (dx) dan datar (dy).', 'Memilih dx atau dy yang paling tepat, lalu menjelaskannya kepada temanmu.'] });

  /* ======================================================== adegan: mesin integral (luas bertanda dan luas) */
  const RODA = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="5.5 5.5"/><circle cx="20" cy="20" r="11" fill="#fff"/><circle cx="20" cy="20" r="4" fill="#0F766E"/></svg>';
  async function adMesinLuas(c, cfg) {
    const { a, t } = c; let sibuk = false, selesai = 0; const sp0 = cfg.spec, U = cfg.u, L = cfg.l; const gc = (p, q) => { p = Math.abs(p); q = Math.abs(q); while (q) { const r = p % q; p = q; q = r; } return p || 1; }, jum = (p, q) => { const n = p.n * q.d + q.n * p.d, d = p.d * q.d, g = gc(n, d); return { n: n / g, d: d / g }; }; const selisih = sp0.k.length ? (() => { const p = kur(sp0, U), q = kur(sp0, L), n = Math.max(p.length, q.length), o = []; for (let i = 0; i < n; i++) o[i] = (p[i] || 0) - (q[i] || 0); return o; })() : [0];
    const w = el('div', { gaya: 'flex:1;display:flex;flex-direction:column;min-height:0' }); a.append(w);
    w.innerHTML = '<div class="sorotan tengah" id="ins" style="align-self:center;margin-bottom:.5rem">' + cfg.petunjuk + '</div><div class="mesin-adegan iv"><div class="baki" id="bm"><h4>Pilih batas [a, b]</h4></div><div class="mesin" id="ms"><div class="judul-mesin">' + cfg.rumus + '</div><div class="lubang" id="lb">Letakkan batas di sini</div><div class="roda-baris"><div class="roda">' + RODA + '</div><div class="roda">' + RODA + '</div><div class="roda">' + RODA + '</div></div><div class="layar-hitung" id="lh">siap</div><div class="corong" id="cr"></div></div><div class="baki plotbaki" id="bk"><h4>Daerah dan hasil</h4><div class="plot" id="pl"></div><div class="hasil-baris" id="hb"></div></div></div>';
    const bm = w.querySelector('#bm'), ms = w.querySelector('#ms'), lb = w.querySelector('#lb'), lh = w.querySelector('#lh'), cr = w.querySelector('#cr'), pl = w.querySelector('#pl'), hb = w.querySelector('#hb'), ins = w.querySelector('#ins');
    const lihat = GF.lihat(Object.assign({}, sp0, { z: [{ u: U, l: L, a: cfg.lihat[0], b: cfg.lihat[1] }] })), segmen = (aa, bb) => { const pts = [aa].concat((cfg.akar || []).filter((r) => r > aa && r < bb), [bb]), out = []; for (let i = 0; i + 1 < pts.length; i++) { const v = B.hit(selisih, pts[i], pts[i + 1]).nilai; out.push(v.n >= 0 ? { u: U, l: L, a: pts[i], b: pts[i + 1], w: 0, v } : { u: L, l: U, a: pts[i], b: pts[i + 1], w: 1, v }); } return out; };
    const gambarPlot = (aa, bb) => { pl.innerHTML = ''; const z = aa == null ? [{ u: U, l: L, a: cfg.lihat[0], b: cfg.lihat[1], w: 0 }] : segmen(aa, bb); const g = GF.lukis({ tipe: 'x', k: sp0.k, z, v: lihat }, { W: 470, H: 300, titik: false, tebal: 4 }); if (aa == null) g.isi.forEach((e) => e.path.setAttribute('fill-opacity', 0)); pl.append(g.svg); }; gambarPlot();
    const fit = () => { lh.style.fontSize = ''; let s = 1.4; while (lh.scrollWidth > lh.clientWidth + 1 && s > .75) { s -= .08; lh.style.fontSize = s + 'rem'; } };
    const dalam = (cx, cy) => { const r = ms.getBoundingClientRect(); return cx > r.left - 30 && cx < r.right + 30 && cy > r.top - 30 && cy < r.bottom + 30; };
    async function proses(chip, iv) {
      if (sibuk || chip.classList.contains('pakai')) return; sibuk = true; chip.classList.add('pakai'); lb.classList.add('sambut');
      const r1 = chip.getBoundingClientRect(), r2 = lb.getBoundingClientRect(), teks = '[' + m(iv[0]) + ', ' + m(iv[1]) + ']';
      const f = el('div', { kelas: 'terbang', gaya: 'left:' + r1.left + 'px;top:' + r1.top + 'px', html: teks }); document.body.append(f);
      await anim(f, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + (r2.left + r2.width / 2 - r1.left - 40) + 'px,' + (r2.top + r2.height / 2 - r1.top - 14) + 'px) scale(.4)', opacity: .1 }], { duration: 550, easing: 'cubic-bezier(.5,0,.8,.5)' }).catch(() => {}); f.remove(); t.cek();
      lb.classList.remove('sambut'); ms.classList.add('jalan'); const seg = segmen(iv[0], iv[1]), tot = B.hit(selisih, iv[0], iv[1]).nilai, mut = seg.map((z) => ({ n: Math.abs(z.v.n), d: z.v.d })), luasV = mut.reduce((s, z) => jum(s, z), { n: 0, d: 1 }), luasStr = mut.map(B.rT).join(' + ');
      lh.innerHTML = '∫ ' + teks + ' …'; fit(); await t.tidur(c.instan ? 100 : 900); lh.innerHTML = '∫ = <b style="color:#F3A64B">' + m(B.rT(tot)) + '</b>'; fit(); await t.tidur(c.instan ? 100 : 700); ms.classList.remove('jalan'); t.cek();
      gambarPlot(iv[0], iv[1]); const g = pl.querySelector('svg'); anim(g, [{ opacity: .3 }, { opacity: 1 }], { duration: 500 });
      const hasilNeg = tot.n < 0; const cp = el('div', { kelas: 'hasil-chip' }, el('b', null, teks), el('span', { kelas: hasilNeg ? 'neg' : 'pos', html: '∫ = ' + m(B.rT(tot)) }), el('span', { kelas: 'luas', html: 'luas = ' + (seg.length > 1 ? luasStr + ' = ' : '') + B.rT(luasV) })); hb.append(cp); await pop(cp); lh.textContent = 'siap'; selesai++; sibuk = false;
      if (selesai >= cfg.masukan.length) { ins.innerHTML = cfg.akhir; ins.style.background = 'var(--mint-100)'; ins.style.color = 'var(--mint-800)'; pop(ins); c.siap(); }
    }
    cfg.masukan.forEach((iv) => { const chip = el('div', { kelas: 'chip-angka iv' + (c.guru ? '' : ' ketuk'), html: '[' + m(iv[0]) + ', ' + m(iv[1]) + ']' }); bm.append(chip);
      (c.guru ? (e0, o0) => UI.seret(e0, o0) : (e0, o0) => e0.addEventListener('click', () => { if (!sibuk) o0.saatKetuk(); }))(chip, { aktif: () => !sibuk, jatuh: dalam, saatJatuh: () => proses(chip, iv).catch((e) => { if (!(e instanceof UI.Batal)) throw e; }), saatKetuk: () => proses(chip, iv).catch((e) => { if (!(e instanceof UI.Batal)) throw e; }) }); c.chips = (c.chips || []).concat([[chip, iv]]); });
    await muncul(w, 400);
    if (c.instan) { for (const [chip, iv] of c.chips) await proses(chip, iv); }
  }
  const SP_M1 = { tipe: 'x', k: [[-4, 0, 1]], z: [] }, SP_M2 = { tipe: 'x', k: [[0, 4, -1], [0, 1]], z: [] };
  const adMesin1 = (c) => adMesinLuas(c, { spec: SP_M1, u: 0, l: -1, akar: [2], lihat: [-1, 4], rumus: VR('f') + '(' + VR('x') + ') = ' + VR('x') + '<sup>2</sup> − 4', masukan: [[0, 2], [2, 3], [0, 3]], petunjuk: (c.guru ? 'Seret batas ke mesin (tahan lalu geser), atau klik batasnya.' : 'Ketuk batas untuk memasukkannya ke mesin.') + ' Ada 3 batas untuk dicoba.', akhir: 'Perhatikan [0, 3]: nilai integral <b>−3</b>, tetapi luas daerahnya <b>23/3</b>. Nilai integral dan luas tidak sama!' });
  const adMesin2 = (c) => adMesinLuas(c, { spec: SP_M2, u: 0, l: 1, akar: [], lihat: [-0.5, 4.5], rumus: VR('y') + '<sub>atas</sub> − ' + VR('y') + '<sub>bawah</sub> = ' + VR('x') + '(3 − ' + VR('x') + ')', masukan: [[0, 3], [0, 1], [1, 3], [3, 4]], petunjuk: (c.guru ? 'Seret batas ke mesin, atau klik batasnya.' : 'Ketuk batas untuk memasukkannya ke mesin.') + ' Kurva atas: y = 4x − x², kurva bawah: y = x.', akhir: 'Di [0, 3] hasilnya 9/2: itulah daerah yang dikurung kedua kurva. Di [3, 4] posisi atas dan bawah <b>bertukar</b> sehingga integralnya negatif.' });

  /* ======================================================== adegan: galeri tujuh bagian */
  async function adGaleri(c) {
    const { a, t, guru } = c; const lihat = new Set(); let idx = 0; const N = UI.URUT.length;
    const g = el('div', { kelas: 'galeri' }); a.append(g); const daftar = el('div', { kelas: 'daftar gulir' }), isi = el('div', { gaya: 'min-height:0;display:flex;flex-direction:column;gap:.4rem' }); g.append(daftar, isi);
    const tabs = UI.URUT.map((id, i) => { const b = el('button', { kelas: 'tab fx-' + id, type: 'button', html: UI.ubin(id) + '<span>Pos ' + (i + 1) + ' · ' + NAMA[id] + '</span>' + ik('centang', 'kecil').replace('class="ik kecil"', 'class="ik kecil centang"'), onclick: () => tampil(i) }); daftar.append(b); return b; });
    let tt;
    function tampil(i) {
      idx = i; lihat.add(i); const id = UI.URUT[i], d = K[id]; tabs.forEach((b, k) => { b.classList.toggle('aktif', k === i); b.classList.toggle('lihat', lihat.has(k)); });
      isi.innerHTML = ''; const baris = el('div', { kelas: 'isi fx-' + id, gaya: 'flex:1' }); isi.append(baris); if (tt) tt.stop(); tt = UI.token();
      const kiri = el('div', { kelas: 'kotak-grafik' }), wad = el('div', { kelas: 'wadah' }); kiri.append(wad); const kanan = el('div', { kelas: 'info gulir' }); baris.append(kiri, kanan);
      const nama = el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(id) }).firstChild, el('h3', { gaya: 'margin:0;font-size:1.5rem;color:var(--td)' }, 'Pos ' + (i + 1) + ' · ' + NAMA[id])); const rk = el('div', { kelas: 'rumus-kartu' }); const sv = el('div', { kelas: 'seg-varian' });
      kanan.append(nama, el('div', { kelas: 'baris', gaya: 'flex-wrap:wrap;gap:.35rem' }, el('span', { kelas: 'muted kecil' }, 'Juga disebut:'), d.alias.map((x) => el('span', { kelas: 'chip abu' }, x))), rk); if (d.varian.length > 1) kanan.append(sv);
      kanan.append(el('div', null, el('div', { kelas: 'eyebrow' }, 'Ciri'), el('ul', null, d.ciri.map((x) => el('li', null, x)))), el('div', null, el('div', { kelas: 'eyebrow' }, 'Contoh dalam kehidupan'), el('ul', null, d.konteks.map((x) => el('li', null, x)))));
      const gb = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-top:auto' }, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Sebelumnya', disabled: i === 0, onclick: () => tampil(i - 1) }), el('button', { kelas: 'btn kecil', type: 'button', html: 'Berikutnya' + ik('panah', 'kecil'), disabled: i === N - 1, onclick: () => tampil(i + 1) })); kanan.append(gb);
      const gambar = (v) => { const cur = tt; wad.innerHTML = ''; const r = GF.gambarVarian(d.varian[v]); wad.append(r.svg); rk.innerHTML = '<div class="eyebrow" style="margin:0">Contoh · ' + esc(d.varian[v].nama) + '</div><div class="mat" style="font-size:' + (d.varian[v].panjang ? '1.15rem' : '1.5rem') + '">' + d.varian[v].rumus + '</div><div class="umum"><span>Rumus luas</span>' + d.umum + '</div>';
        (async () => { try { await r.jalan(1300, cur); } catch (e) { if (!(e instanceof UI.Batal)) throw e; } })(); };
      if (d.varian.length > 1) d.varian.forEach((v, k) => sv.append(el('button', { type: 'button', kelas: k === 0 ? 'aktif' : '', onclick: (e) => { [...sv.children].forEach((x) => x.classList.remove('aktif')); e.currentTarget.classList.add('aktif'); gambar(k); } }, v.nama.split('·')[0].trim())));
      gambar(0); if (lihat.size >= N || guru) c.siap(true);
      const info = document.getElementById('infoGaleri'); if (info) info.textContent = 'Dilihat ' + lihat.size + ' dari ' + N;
    }
    tampil(0);
  }

  /* ======================================================== adegan: cara kerja jigsaw (rute putaran) */
  async function adJigsaw(c) {
    const { a, t } = c, N = B.NPOS, w = el('div', { kelas: 'jig' }); a.append(w);
    const kiri = el('div', { kelas: 'kartu jig-kiri' }), kanan = el('div', { kelas: 'jig-kanan' }); w.append(kiri, kanan);
    kanan.innerHTML = '<div class="eyebrow">Cara kerja kelompok hari ini</div><div class="jig-peran" id="pr"><div class="jp host"><b>Host</b><span>Menetap di meja kelompok asal, menjelaskan pos kelompoknya dan memutar animasi untuk tamu.</span></div><div class="jp a"><b>Penjelajah A</b><span>Berkeliling ke 3 pos berbeda, 10 menit per pos.</span></div><div class="jp b"><b>Penjelajah B</b><span>Berkeliling ke 3 pos lain yang belum dikunjungi A.</span></div></div><div class="sorotan" id="cp" style="margin-top:.5rem;font-size:1.1rem">Contoh rute untuk Kelompok 1</div>';
    const R = 150, cx = 200, cy = 190, svg = S('svg', { viewBox: '0 -45 400 430', style: 'width:100%;height:100%;display:block;font-family:Jakarta,sans-serif' }); kiri.append(svg);
    const pos = (i) => { const ang = -Math.PI / 2 + (2 * Math.PI * i) / N; return [cx + R * Math.cos(ang), cy + R * Math.sin(ang)]; };
    const noda = []; UI.URUT.forEach((id, i) => { const [x, y] = pos(i), g = S('g'); g.append(S('circle', { cx: x, cy: y, r: 31, fill: 'var(--f-' + id + '-t)', stroke: 'var(--f-' + id + ')', 'stroke-width': i === 0 ? 6 : 3 }), S('text', { x, y: y + 7, 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: 'var(--f-' + id + '-d)' }, String(i + 1))); svg.append(g); noda.push(g); });
    svg.append(S('text', { x: cx, y: cy - 4, 'font-size': 15, 'text-anchor': 'middle', fill: '#55657A', 'font-weight': 700 }, 'Pos 1–7'), S('text', { x: cx, y: cy + 16, 'font-size': 13, 'text-anchor': 'middle', fill: '#55657A' }, 'satu pos tiap kelompok'));
    const tokA = S('g'), tokB = S('g'); tokA.append(S('circle', { r: 17, fill: '#3B6FD6', stroke: '#fff', 'stroke-width': 3 }), S('text', { y: 6, 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: '#fff' }, 'A')); tokB.append(S('circle', { r: 17, fill: '#E08A1E', stroke: '#fff', 'stroke-width': 3 }), S('text', { y: 6, 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: '#fff' }, 'B'));
    const taruh = (tok, i, off) => { const [x, y] = pos(i); tok.setAttribute('transform', 'translate(' + (x + off) + ' ' + (y - 40) + ')'); };
    taruh(tokA, 0, -14); taruh(tokB, 0, 16); svg.append(tokA, tokB); await muncul(w, 420); t.cek();
    const cp = kanan.querySelector('#cp'); const gerakTok = async (tok, dari, ke, off) => { const [x1, y1] = pos(dari), [x2, y2] = pos(ke); await gerak(900, (k) => { tok.setAttribute('transform', 'translate(' + (x1 + (x2 - x1) * k + off) + ' ' + (y1 + (y2 - y1) * k - 40) + ')'); }, t); };
    let a0 = 0, b0 = 0; await pop(noda[0]); await t.tidur(600);
    for (let r = 1; r <= 3; r++) { const na = B.ruteKelana(1, 'A', r) - 1, nb = B.ruteKelana(1, 'B', r) - 1; cp.innerHTML = '<b>Putaran ' + r + '</b> (10 menit): A ke Pos ' + (na + 1) + ', B ke Pos ' + (nb + 1) + '. Host Kelompok 1 tetap di Pos 1.'; await Promise.all([gerakTok(tokA, a0, na, -14), gerakTok(tokB, b0, nb, 16)]); a0 = na; b0 = nb; await t.tidur(1500); }
    cp.innerHTML = '<b>Transfer ilmu</b>: kembali ke meja asal. A mengajarkan 3 pos yang ia kunjungi kepada Host dan B; lalu B mengajar A dan Host. Akhirnya <b>semua</b> menguasai ketujuh pos.'; await Promise.all([gerakTok(tokA, a0, 0, -14), gerakTok(tokB, b0, 0, 16)]); await pop(cp); c.siap();
  }

  /* ======================================================== daftar adegan */
  const ADEGAN = [
    { judul: 'Selamat datang', f: adJudul },
    { judul: 'Mesin integral: luas bertanda', f: adMesin1 },
    { judul: 'Di bawah sumbu-x', f: adBawah },
    { judul: 'Memotong sumbu-x', f: adPotong },
    { judul: 'Antara dua kurva · dx', f: adDx },
    { judul: 'Antara dua kurva · dy', f: adDy },
    { judul: 'dx atau dy?', f: adPilih },
    { judul: 'Empat langkah baku', f: adProsedur },
    { judul: 'Mesin integral: dua kurva', f: adMesin2 },
    { judul: 'Tujuh pos materi', f: adGaleri },
    { judul: 'Cara kerja jigsaw', f: adJigsaw },
    { judul: 'Tujuan pembelajaran', f: adTujuan }
  ];

  /* ======================================================== pemutar */
  function mount(host, o) {
    o = o || {}; const guru = !!o.guru; let idx = o.mulai || 0, tok = null, siap = false; const played = new Set(o.played || []); try { UI.speed = [1, 2, 3].includes(+localStorage.getItem('ac_speed')) ? +localStorage.getItem('ac_speed') : 1; } catch (e) { UI.speed = 1; }
    host.innerHTML = '';
    const root0 = el('div', { kelas: 'intro' }), kepala = el('div', { kelas: 'kepala-intro' }), adegan = el('div', { kelas: 'adegan' }), kendali = el('div', { kelas: 'kendali' });
    const judul = el('h2'), no = el('span', { kelas: 'chip' }); kepala.append(judul, no, el('div', { gaya: 'flex:1' }), el('span', { id: 'infoGaleri', kelas: 'chip abu', hidden: true }));
    const titik = el('div', { kelas: 'titik-langkah' }); ADEGAN.forEach((x, i) => titik.append(el('i', { 'aria-label': 'Langkah ' + (i + 1) })));
    const bMundur = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali', onclick: () => ke(idx - 1) });
    const kec = el('div', { kelas: 'kecepatan', role: 'group', 'aria-label': 'Kecepatan animasi' }, el('span', { kelas: 'muted kecil' }, 'Kecepatan'), [1, 2, 3].map((n) => el('button', { type: 'button', kelas: UI.speed === n ? 'aktif' : '', onclick: (e) => { UI.speed = n; try { localStorage.setItem('ac_speed', n); } catch (x) { /* abaikan */ } [...kec.querySelectorAll('button')].forEach((b) => b.classList.toggle('aktif', b === e.currentTarget)); } }, n + '×')));
    const bUlang = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Ulangi animasi', onclick: () => ke(idx, true) });
    const bMaju = el('button', { kelas: 'btn', type: 'button', onclick: () => { if (idx === ADEGAN.length - 1) { if (o.saatSelesai) o.saatSelesai(); } else ke(idx + 1); } });
    kendali.append(bMundur, titik, kec, bUlang, bMaju); root0.append(kepala, adegan, kendali); host.append(root0);
    function perbarui() {
      judul.textContent = ADEGAN[idx].judul; no.textContent = (idx + 1) + ' / ' + ADEGAN.length; [...titik.children].forEach((d, i) => { d.className = i === idx ? 'aktif' : (i < idx ? 'sudah' : ''); });
      bMundur.disabled = idx === 0; const akhir = idx === ADEGAN.length - 1;
      bMaju.innerHTML = (akhir ? (o.labelAkhir || 'Selesai') : 'Lanjut') + ik(akhir ? 'centang' : 'panah'); bMaju.className = 'btn' + (akhir ? ' hijau' : '') + ((siap || guru) ? ' denyut' : ' mati');
      document.getElementById('infoGaleri') && (document.getElementById('infoGaleri').hidden = ADEGAN[idx].f !== adGaleri);
    }
    async function ke(i, ulang) {
      if (i < 0 || i >= ADEGAN.length) return; if (tok) tok.stop(); tok = UI.token(); idx = i; siap = false; adegan.innerHTML = ''; perbarui(); if (o.saatLangkah) o.saatLangkah(i);
      const t = tok, instan = played.has(i) && !ulang; UI.instan = instan; const ctx = { a: adegan, t, guru, instan, siap: () => { if (t.batal) return; siap = true; perbarui(); } };
      try { await ADEGAN[i].f(ctx); } catch (e) { if (!(e instanceof UI.Batal)) console.error(e); } finally { if (tok === t) { UI.instan = false; if (!played.has(i)) { played.add(i); if (o.saatMain) o.saatMain([...played]); } } }
    }
    const tombol = (e) => { if (!guru && !o.papan) return; if (e.key === 'ArrowRight') { if (idx < ADEGAN.length - 1) ke(idx + 1); } else if (e.key === 'ArrowLeft') ke(idx - 1); };
    document.addEventListener('keydown', tombol);
    ke(idx);
    return { ke, jumlah: ADEGAN.length, stop() { if (tok) tok.stop(); document.removeEventListener('keydown', tombol); }, idx: () => idx };
  }
  root.Intro = { mount, JUMLAH: ADEGAN.length };
})(window);

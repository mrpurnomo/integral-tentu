/* PELAJARAN — penjelasan animasi tiap materi (kartu belajar kelompok, modul mengajar, salinan materi) dan pembahasan soal beranimasi.
   Memakai mesin Adegan: tiap langkah adalah satu keadaan, bisa maju/mundur dengan mulus. */
(function (root) {
  'use strict';
  const { Sken, T, TX } = Adegan, B = BS, M = B.M;
  const RED = '\\color{#FF6B70}';
  const pile = (rows, keep) => {
    keep = keep || 3; const n = rows.length, dari = Math.max(0, n - keep);
    return rows.slice(dari).map((r, i) => { const idx = dari + i, akt = idx === n - 1; return { id: akt ? 'akt' : 'h' + idx, ket: r.ket, sz: r.sz || 'b', op: akt ? 1 : (n - 1 - idx === 1 ? .4 : .2), tok: r.tok.map((t) => (akt ? t : Object.assign({}, t, { id: 'h' + idx + ':' + t.id, c: 'redup', hl: false }))) }; });
  };
  const L = (id, tok, o) => Object.assign({ id, tok }, o);
  const LIHAT = (spec) => { const v = GF.lihat(spec); return { x0: v.xmin, x1: v.xmax, y0: v.ymin, y1: v.ymax }; };
  const WNA = ['emas', 'merah', 'biru'];

  /* keadaan awal grafik dari spec: kurva dan label bernama, arsiran belum tampak */
  function grafAwal(s, P, o) {
    o = o || {}; const sw = P.tipe === 'y', G = Adegan.modelSpec(P, { label: true, titik: false, arsir: true, angka: true });
    s.cur.g = G; s.cur.mode = 'split'; Object.keys(G.items).forEach((id) => { const it = G.items[id]; if (it.t === 'a') { it.g = 0; it.op = 1; } });
    if (o.tanpaLabel) Object.keys(G.items).forEach((id) => { if (G.items[id].t === 't') delete G.items[id]; });
    return s;
  }
  const dv = (P) => (P.tipe === 'x' ? 'x' : 'y');
  const exprTex = (P, q) => { const U = B.kk(P, q.u), Lo = B.kk(P, q.l), v = dv(P); if (q.l < 0) return B.tPoly(U, v); if (q.u < 0) return B.tPoly(Lo, v); return '\\left(' + B.tPoly(U, v) + '\\right)-\\left(' + B.tPoly(Lo, v) + '\\right)'; };

  /* ======================================================================== PEMBAHASAN SOAL (generik, dari objek soal P) */
  function bagianHitung(s, P, q, idx, banyak, o) {
    const v = dv(P), D = B.selisihZ(P, q), H = B.tHit(D, q.a, q.b, v), neg = H.nilai.n < 0, sat = B.tAbs(H.nilai), nm = banyak > 1 ? 'L_{' + (idx + 1) + '}=' : 'L=', limit = '\\int_{' + RED + q.a + '}^{' + RED + q.b + '}', d = '\\,d' + v;
    const pre = [T('lh', nm, 'putih')], ex1 = exprTex(P, q), simpel = B.tPoly(D, v), nomor = banyak > 1 ? 'Bagian ' + (idx + 1) + ' · ' : '';
    const R = []; const push = (ket, tok, ms, ganti) => { const row = { ket, tok }; if (ganti && R.length) R[R.length - 1] = row; else R.push(row); s.baris(pile(R), { fs: 2.6 }).langkahBaru({ ms: ms || 1500 }); };
    const ketAwal = nomor + (P.fam === 'bawah' ? 'Kurva di bawah sumbu: luas = −integral' : (q.u < 0 ? 'Bagian di bawah sumbu: luas = −integral' : (q.l < 0 ? 'Rumus luas' : (P.tipe === 'y' ? 'Kanan − kiri' : 'Atas − bawah'))));
    const A = { v, D, a: q.a, b: q.b, pre, neg };
    const dibawah = q.u < 0;   /* kurva di bawah sumbu: L = −∫ f dx, lalu tanda minus dimasukkan ke dalam kurung (−f) */
    if (ex1 !== simpel || dibawah) { push(ketAwal, pre.concat(neg || dibawah ? [T('mn', '-', 'merah')] : [], [T('ig', limit, 'putih'), T('fx', '\\left(' + ex1 + '\\right)', 'emas', { hl: true }), T('dx', d, 'putih')]), 1700); push(nomor + (dibawah ? 'Masukkan tanda minus ke dalam kurung' : 'Sederhanakan'), Alj.tokIntegral(A), 1500); }
    else push(ketAwal, Alj.tokIntegral(A), 1700);
    Alj.langkahHitung(Object.assign({ nomor }, A)).forEach((rw) => push(rw.ket, rw.tok, rw.ms, rw.ganti));
    return sat;
  }
  function solusiBab(P, o) {
    o = o || {}; const s = new Sken(), v = dv(P); grafAwal(s, P);
    s.baris([L('q', [TX('q', B.tanyaP(P), 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Soal' })], { fs: 2.6 }).langkahBaru({ ms: 1900 });
    if (P.cari) {
      const sam = B.pa(P.k[0], P.k[1], -1), a0 = B.tPoly(P.k[0], v), a1 = B.tPoly(P.k[1], v);
      Alj.samakan({ v, f: P.k[0], g: P.k[1] }).forEach((r, i) => s.baris([L('akt', r.tok, { ket: r.ket })], { fs: 2.6 }).langkahBaru({ ms: i === 1 ? 2300 : 1600 }));
            const aks = P.akar.map((r, i) => T('r' + i, v + '=' + r, WNA[i % 2], { hl: true })), gab = []; aks.forEach((t, i) => { if (i) gab.push(T('at' + i, '\\text{atau}', 'redup')); gab.push(t); });
      s.baris([L('akt', gab, { ket: 'Selesaikan: akar-akarnya adalah batas integral' })], { fs: 2.6 }).langkahBaru({ ms: 1500 });
      P.titik.forEach((t, i) => { s.guide('g' + i, t.x, t.y, { c: 'biru', d: i * .12 }).pt('p' + i, t.x, t.y, { c: 'putih', d: .3 + i * .12, dx: i % 2 ? 14 : -90, dy: i % 2 ? 26 : -16 }); });
      s.baris([L('akt', P.titik.map((t, i) => T('r' + i, '(' + t.x + ',\\,' + t.y + ')', WNA[i % 2], { hl: true })), { ket: 'Substitusi akar ke salah satu fungsi: titik potong' })], { fs: 2.6 }).langkahBaru({ ms: 2200 });
    } else if (P.fam === 'bawah' || P.fam === 'potong') {
      P.z.forEach((q, i) => { if (!(i === 0 && P.z.length > 1)) return; });
      const ujung = [P.z[0].a, P.z[P.z.length - 1].b]; ujung.forEach((t, i) => { const f = B.pv(P.k[0], t); s.guide('g' + i, P.tipe === 'x' ? t : f, P.tipe === 'x' ? f : t, { c: 'biru', d: i * .15 }); });
      s.baris([L('q', [TX('q', 'Batas: ' + M((P.tipe === 'x' ? 'x' : 'y') + '=' + ujung[0]) + ' dan ' + M((P.tipe === 'x' ? 'x' : 'y') + '=' + ujung[1]), 'putih')], { sz: 'm', ket: 'Batas integral' })], { fs: 2.6 }).langkahBaru({ ms: 1500 });
    }
    P.z.forEach((q, i) => s.set('z' + i, { g: 0 }));
    s.baris([L('q', [TX('q', 'Daerah yang dicari luasnya', 'biru')], { sz: 'm', ket: 'Daerah' })], { fs: 2.6 });
    P.z.forEach((q, i) => s.set('z' + i, { g: 1, d: i * .4 })); s.langkahBaru({ ms: 1900 });
    const hasil = P.z.map((q, i) => bagianHitung(s, P, q, i, P.z.length));
    if (P.z.length > 1) { const jum = P.z.map((q, i) => hasil[i]).join('+'), R = [{ ket: 'Luas total = jumlah bagian', tok: [T('lh', 'L=', 'putih'), T('u', P.z.map((q, i) => 'L_{' + (i + 1) + '}').join('+'), 'emas'), T('eq', '=', 'putih'), T('w', jum, 'biru'), T('eq2', '=', 'putih'), T('z', String(P.L), 'emas', { hl: true }), TX('sat', 'satuan luas', 'putih')] }]; s.baris(pile(R), { fs: 2.6 }).langkahBaru({ ms: 1700 }); }
    s.baris([L('akt', [T('lh', 'L=', 'putih'), T('u', String(P.L), 'emas', { hl: true }), TX('sat', 'satuan luas', 'putih')], { ket: 'Jawaban' })], { fs: 3.4 }).langkahBaru({ ms: 1500 });
    return [{ judul: o.judul || 'Pembahasan', langkah: s.langkah }];
  }
  function bukaPembahasan(P, judul, opsi) { return Adegan.layarPenuh(Object.assign({ bab: solusiBab(P, { judul: judul || 'Pembahasan' }), labelAkhir: 'Selesai', saatSelesai: () => { const b = document.querySelector('.ad-tutup .btn:last-child'); if (b) b.click(); } }, opsi || {})); }

  /* ======================================================================== PELAJARAN TUJUH MATERI */
  const LES = {
    bawah: { j: 'Di bawah sumbu-$x$', ciri: 'Kurva berada <b>di bawah</b> sumbu-$x$, jadi $f(x)\\le 0$ pada seluruh daerah.', rumus: 'L=-\\int_{a}^{b}f(x)\\,dx',
      t: ['Setiap irisan tipis punya tinggi $f(x)$ yang <b>negatif</b>.', 'Integral menjumlahkan irisan-irisan itu, jadi hasil integralnya <b>negatif</b>.', 'Luas tidak pernah negatif. Maka luas = <b>minus</b> hasil integral.'] },
    potong: { j: 'Memotong sumbu-$x$', ciri: 'Kurva berada di atas <b>dan</b> di bawah sumbu-$x$ pada interval yang sama.', rumus: 'L=\\left|\\int_{a}^{c}f\\,dx\\right|+\\left|\\int_{c}^{b}f\\,dx\\right|',
      t: ['Cari titik potong sumbu-$x$ ($f(x)=0$), namai $c$, lalu <b>pecah</b> integralnya di $c$.', 'Satu integral dari $a$ ke $b$ membuat bagian negatif dan positif <b>saling meniadakan</b>.', 'Hitung tiap bagian, ambil nilai mutlaknya, lalu jumlahkan.'] },
    garis: { j: 'Parabola dan garis', ciri: 'Satu tepi lurus dan satu tepi melengkung membatasi daerah tertutup.', rumus: 'L=\\int_{a}^{b}\\left(y_{\\text{atas}}-y_{\\text{bawah}}\\right)dx',
      t: ['Batas $a$ dan $b$ adalah <b>titik potong</b>: samakan kedua fungsi.', 'Tinggi irisan tegak = kurva <b>atas</b> dikurangi kurva <b>bawah</b>.', 'Uji satu titik di antara $a$ dan $b$ untuk tahu kurva mana yang di atas.'] },
    parab: { j: 'Dua parabola', ciri: 'Dua parabola membentuk daerah seperti lensa di antara dua titik potong.', rumus: 'L=\\int_{a}^{b}\\left(f(x)-g(x)\\right)dx',
      t: ['Samakan $f(x)=g(x)$ untuk mendapat batas $a$ dan $b$.', 'Parabola yang membuka ke <b>bawah</b> berada di atas.', 'Satu integral cukup: tinggi irisan = atas − bawah.'] },
    silang: { j: 'Dua kurva bersilangan', ciri: 'Dua kurva berpotongan di tiga titik; posisi atas dan bawah <b>bertukar</b> di titik tengah.', rumus: 'L=\\int_{a}^{c}(f-g)\\,dx+\\int_{c}^{b}(g-f)\\,dx',
      t: ['Cari ketiga titik potongnya: $a<c<b$.', 'Di $[a,c]$ satu kurva di atas, di $[c,b]$ kurva lainnya di atas.', 'Hitung dua integral dengan urutan atas − bawah yang tepat, lalu jumlahkan.'] },
    sumbuy: { j: 'Terhadap sumbu-$y$', ciri: 'Kurva ditulis $x=g(y)$ dan salah satu batasnya sumbu-$y$.', rumus: 'L=\\int_{c}^{d}x\\,dy',
      t: ['Iris daerah secara <b>datar</b> (irisan $dy$), bukan tegak.', 'Panjang tiap irisan adalah $x$ (di kanan sumbu-$y$) atau $-x$ (di kiri).', 'Batasnya nilai $y$: dari $y=c$ sampai $y=d$.'] },
    kanan: { j: 'Kanan dikurangi kiri', ciri: 'Kedua kurva ditulis $x=\\ldots$, jadi titik potong dicari terhadap $y$.', rumus: 'L=\\int_{c}^{d}\\left(x_{\\text{kanan}}-x_{\\text{kiri}}\\right)dy',
      t: ['Samakan kedua $x$ untuk mendapat batas $y$.', 'Irisan datar: panjang irisan = $x$ <b>kanan</b> − $x$ <b>kiri</b>.', 'Cukup satu integral, tanpa memecah.'] }
  };
  const contohP = (fam) => B.buat(fam, { bawah: 4, potong: 6, garis: 5, parab: 9, silang: 7, sumbuy: 3, kanan: 5 }[fam] || 5);
  function konsepBab(fam) {
    const D = LES[fam], P = contohP(fam), s = new Sken(), v = dv(P), sw = P.tipe === 'y'; grafAwal(s, P);
    const kep = (extra) => [L('h', [TX('h', D.j, 'emas')], { sz: 'j' }), L('c', [TX('c', D.ciri, 'redup', { kls: 'bungkus' })], { sz: 'm' })].concat(extra || []);
    s.baris(kep(), { fs: 2.6 }).langkahBaru({ ms: 1900 });
    P.z.forEach((q, i) => s.set('z' + i, { g: 1, d: i * .35 }));
    s.baris(kep(), { fs: 2.6 }).langkahBaru({ ms: 1800 });
    /* irisan tipis yang bergeser (daerah sempit berwarna biru) */
    const q0 = P.z[0], lebar = Math.max(.12, (q0.b - q0.a) * .06), idx = { u: q0.u, l: q0.l };
    const sl = (x) => s.cur.g.items.sl ? s.set('sl', { a: x, b: x + lebar }) : s.area('sl', P.k[idx.u] || [0], P.k[idx.l] || [0], x, x + lebar, { c: 'biru', sw, op: 1, g: 1 });
    if (fam === 'bawah') {
      const f = P.k[0]; sl(q0.a + (q0.b - q0.a) * .25); s.baris([L('a', [TX('a', D.t[0], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Irisan tipis' }), L('b', [T('b', 'f(x)\\le 0', 'merah', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1500 });
      sl(q0.a + (q0.b - q0.a) * .7); s.baris([L('a', [TX('a', D.t[1], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Integral menjumlahkan irisan' }), L('b', [T('b', B.tInt(q0.a, q0.b, B.tPoly(f), 'x') + '=-' + B.tAbs(B.tHit(f, q0.a, q0.b).nilai), 'merah', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1600 });
      s.hapus('sl'); P.z.forEach((q, i) => s.set('z' + i, { c: 'emas' })); s.baris([L('a', [TX('a', D.t[2], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Luas harus positif' }), L('b', [T('b', D.rumus, 'emas', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1700 });
    } else if (fam === 'potong') {
      const f = P.k[0], c = P.c, h1 = B.tHit(f, P.z[0].a, c).nilai, h2 = B.tHit(f, c, P.z[P.z.length - 1].b).nilai, naive = B.tHit(f, P.z[0].a, P.z[P.z.length - 1].b).nilai;
      s.pt('pc', c, 0, { c: 'putih', lab: '(' + c + ', 0)', dx: 12, dy: 28 }).guide('gc', c, 0, { c: 'biru', lab: true });
      s.baris([L('a', [TX('a', D.t[0], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Titik pemecah' }), L('b', [T('b', 'f(' + c + ')=0', 'biru', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1800 });
      s.baris([L('a', [TX('a', D.t[1], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Jika tidak dipecah' }), L('b', [T('b', B.tInt(P.z[0].a, P.z[P.z.length - 1].b, B.tPoly(f)) + '=' + B.tR(naive), 'merah', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1500 });
      s.baris([L('a', [TX('a', D.t[2], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Dipecah di titik potong' }), L('b', [T('b', 'L=\\left|' + B.tR(h1) + '\\right|+\\left|' + B.tR(h2) + '\\right|=' + B.tR({ n: Math.abs(h1.n) * h2.d + Math.abs(h2.n) * h1.d, d: h1.d * h2.d }) .replace(/^(\d+)$/, '$1'), 'emas', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1700 });
    } else {
      const geser = (frac) => sl(q0.a + (q0.b - q0.a - lebar) * frac), isl = sw ? 'x_{\\text{kanan}}-x_{\\text{kiri}}' : 'y_{\\text{atas}}-y_{\\text{bawah}}';
      geser(.12); s.baris([L('a', [TX('a', D.t[0], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Batas integral' }), L('b', [T('b', (P.akar || [q0.a, q0.b]).map((r) => v + '=' + r).join('\\;\\text{dan}\\;'), 'biru', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1600 });
      geser(.4); s.baris([L('a', [TX('a', D.t[1], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Irisan ' + (sw ? 'datar' : 'tegak') + ' bergeser' }), L('b', [T('b', 'dL=\\left(' + isl + '\\right)d' + v, 'emas', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1800 });
      geser(.78); s.baris([L('a', [TX('a', D.t[2], 'putih', { kls: 'bungkus' })], { sz: 'm', ket: 'Jumlahkan semua irisan' }), L('b', [T('b', D.rumus, 'emas', { hl: true })], {})], { fs: 2.6 }).langkahBaru({ ms: 1800 });
      s.hapus('sl'); s.baris(kep([L('r', [T('r', D.rumus, 'emas', { hl: true })], { sz: 'm' })]), { fs: 2.6 }).langkahBaru({ ms: 1300 });
    }
    return { judul: 'Konsep: ' + D.j.replace(/\$/g, ''), langkah: s.langkah };
  }
  function pelajaranBab(fam) { const P = contohP(fam); return [konsepBab(fam)].concat(solusiBab(P, { judul: 'Contoh dihitung: ' + B.NAMA_FAM[fam] })); }
  function bukaPelajaran(fam, opsi) { return Adegan.layarPenuh(Object.assign({ bab: pelajaranBab(fam), labelAkhir: 'Selesai belajar', saatSelesai: () => { const b = document.querySelector('.ad-tutup .btn:last-child'); if (b) b.click(); } }, opsi || {})); }
  /* modul mengajar (Host): pelajaran + soal latihan beranimasi dari kartu belajar kelompok */
  root.Pel = { solusiBab, bukaPembahasan, pelajaranBab, bukaPelajaran, LES, contohP, konsepBab };
})(window);

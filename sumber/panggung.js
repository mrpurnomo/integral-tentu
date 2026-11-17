/* PANGGUNG — pengantar kelas dua kurva (9 bagian) memakai mesin Adegan (adegan.js).
   Tiap langkah = satu keadaan lengkap; guru memutar SATU langkah dengan tombol Lanjut / panah kanan, Mundur / panah kiri memutar animasinya terbalik. */
(function (root) {
  'use strict';
  const { Sken, T, TX, pasang } = Adegan, B = BS;
  const RED = '\\color{#FF6B70}', GOLD = '\\color{#FFC94A}', SKY = '\\color{#62C6FF}';
  const V1 = { x0: -0.6, x1: 5.6, y0: -1.6, y1: 7.6 }, V2 = { x0: -3.6, x1: 4.6, y0: -1.8, y1: 7.8 };
  const P1 = [5, -4, 1], PF = [0, 0, 1], PG = [2, 1];
  const L = (id, tok, o) => Object.assign({ id, tok }, o);
  /* tumpukan baris hitungan: baris terakhir = aktif (id token tetap, terbang ke baris berikutnya), baris sebelumnya = salinan redup */
  const pile = (rows, keep) => {
    keep = keep || 3; const n = rows.length, dari = Math.max(0, n - keep);
    return rows.slice(dari).map((r, i) => { const idx = dari + i, akt = idx === n - 1; return { id: akt ? 'akt' : 'h' + idx, ket: r.ket, sz: r.sz || 'b', op: akt ? 1 : (n - 1 - idx === 1 ? .4 : .2), tok: r.tok.map((t) => (akt ? t : Object.assign({}, t, { id: 'h' + idx + ':' + t.id, c: 'redup', hl: false }))) }; });
  };

  /* ---------------------------------------------------------------- 1. judul */
  function bab1() {
    const s = new Sken();
    const j = [L('j1', [TX('t1', 'Luas Daerah', 'putih')], { sz: 'j' }), L('j2', [TX('t2', 'dengan Integral Tentu', 'emas')], { sz: 'j' })];
    s.baris(j, { fs: 2.7 }).langkahBaru({ ms: 1400 });
    s.baris(j.concat([L('j3', [TX('t3', 'Matematika Tingkat Lanjut · Kelas XII', 'redup')], { sz: 'm' })])).langkahBaru({ ms: 1000 });
    s.graf(V1).k('k', P1, { c: 'emas' }).area('z', P1, [0], 1, 3, { c: 'emas', d: .45 }).mode('split').baris([L('j1', [TX('t1', 'Luas Daerah', 'putih')], { sz: 'j' }), L('j2', [TX('t2', 'dengan Integral Tentu', 'emas')], { sz: 'j' }), L('j3', [TX('t3', 'Matematika Tingkat Lanjut · Kelas XII', 'redup')], { sz: 'm' })], { fs: 2.8 }).langkahBaru({ ms: 2000 });
    return { judul: 'Luas daerah dengan integral tentu', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 2. yuk, ingat kembali */
  function bab2() {
    const s = new Sken(), ig = (c) => T('ig', '\\int_{' + RED + '1}^{' + RED + '3}', c || 'putih'), fx = (t) => T('fx', t || '\\left(x^{2}-4x+5\\right)', 'emas'), dx = T('dx', '\\,dx', 'putih');
    const soal = L('akt', [ig(), fx(), dx], { ket: 'Yuk, ingat kembali' });
    s.baris([soal, L('q', [TX('q1', 'Berapa luas daerah yang dibatasi kurva, sumbu-$x$, $x=1$, dan $x=3$?', 'redup')], { sz: 'm' })], { fs: 3.4 }).langkahBaru({ ms: 1300 });
    s.graf(V1).k('k', P1, { c: 'emas' }).tex('nk', 'f(x)=x^{2}-4x+5', { on: 'k', at: 4.2, dx: -14, dy: -16, an: 'r', c: 'emas' }).mode('split').baris(pile([{ ket: 'Fungsi', tok: [T('f0', 'f(x)=x^{2}-4x+5', 'emas')] }]), { fs: 2.8 }).langkahBaru({ ms: 1900 });
    s.guide('g1', 1, 2, { c: 'merah', gy: 0 }).guide('g3', 3, 2, { c: 'merah', gy: 0 }).pt('p1', 1, 2, { c: 'merah', lab: '(1, 2)', dx: -62, dy: -16, d: .5 }).pt('p3', 3, 2, { c: 'merah', lab: '(3, 2)', dx: 12, dy: -16, d: .5 });
    s.baris(pile([{ ket: 'Batas integral', tok: [T('ig', '\\int_{' + RED + '1}^{' + RED + '3}', 'putih', { hl: true }), T('fx', '\\left(x^{2}-4x+5\\right)', 'emas'), T('dx', '\\,dx', 'putih')] }]), { fs: 2.8 }).langkahBaru({ ms: 1700 });
    s.area('z', P1, [0], 1, 3, { c: 'emas' }).tex('nl', 'L', { x: 2, y: 0.55, c: 'emas', an: 'c', dx: 0, dy: 0, d: .6 }).baris(pile([{ ket: 'Daerah yang diarsir = integral tentu', tok: [T('ig', '\\int_{' + RED + '1}^{' + RED + '3}', 'putih'), T('fx', '\\left(x^{2}-4x+5\\right)', 'emas'), T('dx', '\\,dx', 'putih')] }])).langkahBaru({ ms: 1700 });
    const r = [{ ket: 'Luas daerah', tok: [T('ig', '\\int_{' + RED + '1}^{' + RED + '3}', 'putih'), T('fx', '\\left(x^{2}-4x+5\\right)', 'emas'), T('dx', '\\,dx', 'putih')] }];
    r.push({ ket: 'Langkah 1 · antiturunan', tok: [T('lh', 'F(x)=', 'putih'), T('fa', '\\frac{1}{3}x^{3}-2x^{2}+5x', 'emas', { hl: true })] }); s.baris(pile(r)).langkahBaru({ ms: 1300 });
    r.push({ ket: 'Langkah 2 · tulis batasnya', tok: [T('lh', 'L=', 'putih'), T('fa', '\\left[\\frac{1}{3}x^{3}-2x^{2}+5x\\right]_{1}^{3}', 'emas')] }); s.baris(pile(r)).langkahBaru({ ms: 1300 });
    r.push({ ket: 'Langkah 3 · substitusi batas atas dan bawah', tok: [T('lh', 'L=', 'putih'), T('u', '\\left(9-18+15\\right)', 'emas', { hl: true }), T('m', '-', 'putih'), T('l', '\\left(\\frac{1}{3}-2+5\\right)', 'biru', { hl: true })] }); s.baris(pile(r)).langkahBaru({ ms: 1500 });
    r.push({ ket: 'Langkah 4 · hitung masing-masing', tok: [T('lh', 'L=', 'putih'), T('u', '6', 'emas'), T('m', '-', 'putih'), T('l', '\\frac{10}{3}', 'biru')] }); s.baris(pile(r)).langkahBaru({ ms: 1300 });
    r.push({ ket: 'Hasil', tok: [T('lh', 'L=', 'putih'), T('u', '\\frac{8}{3}', 'emas', { hl: true }), TX('sat', 'satuan luas', 'putih')] }); s.set('nl', { tex: 'L=\\frac{8}{3}', y: 0.9 }); s.baris(pile(r)).langkahBaru({ ms: 1500 });
    return { judul: 'Yuk, ingat kembali', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 3. bagaimana jika ada 2 fungsi? */
  function bab3() {
    const s = new Sken(), q = L('q', [TX('q', 'Bagaimana jika ada ', 'putih'), TX('q2', '2 fungsi', 'emas'), TX('q3', '?', 'putih')], { sz: 'j' });
    s.baris([q], { fs: 2.8 }).langkahBaru({ ms: 1300 });
    s.graf(V2).k('k1', PF, { c: 'emas', g: 1 }).tex('n1', 'y=x^{2}', { on: 'k1', at: -2.2, dx: -12, dy: -4, an: 'r', c: 'emas', d: .5 }).k('k2', PG, { c: 'merah', d: .35 }).tex('n2', 'y=x+2', { on: 'k2', at: 4.2, dx: 0, dy: -30, an: 'r', c: 'merah', d: .7 }).mode('split').baris([q], { fs: 2.6 }).langkahBaru({ ms: 2300 });
    return { judul: 'Bagaimana jika ada 2 fungsi?', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 4. luas di antara 2 kurva? */
  function bab4() {
    const s = new Sken(), q = L('q', [TX('q', 'Bagaimana menghitung ', 'putih'), TX('q2', 'luas di antara', 'emas'), TX('q3', ' dua kurva?', 'putih')], { sz: 'j' });
    s.graf(V2).k('k1', PF, { c: 'emas' }).tex('n1', 'y=x^{2}', { on: 'k1', at: -2.2, dx: -12, dy: -4, an: 'r', c: 'emas' }).k('k2', PG, { c: 'merah' }).tex('n2', 'y=x+2', { on: 'k2', at: 4.2, dx: 0, dy: -30, an: 'r', c: 'merah' }).mode('split').baris([q], { fs: 2.6 }).langkahBaru({ ms: 1200 });
    s.area('z', PG, PF, -1, 2, { c: 'biru' }).baris([q, L('h', [TX('h1', 'Daerah di antara kedua kurva', 'biru')], { sz: 'm' })], { fs: 2.6 }).langkahBaru({ ms: 1900 });
    return { judul: 'Luas di antara dua kurva?', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 5. mencari titik potong */
  function bab5() {
    const s = new Sken(), O = { ms: 1400 };
    s.graf(V2).k('k1', PF, { c: 'emas' }).tex('n1', 'y=x^{2}', { on: 'k1', at: -2.2, dx: -12, dy: -4, an: 'r', c: 'emas' }).k('k2', PG, { c: 'merah' }).tex('n2', 'y=x+2', { on: 'k2', at: 4.2, dx: 0, dy: -30, an: 'r', c: 'merah' }).mode('split');
    const dua = [L('a', [T('ya', 'y=', 'putih'), T('r1', 'x^{2}', 'emas')], { ket: 'Fungsi pertama' }), L('b', [T('yb', 'y=', 'putih'), T('rx', 'x', 'merah'), T('rc', '+2', 'merah')], { ket: 'Fungsi kedua' })];
    s.baris(dua, { fs: 2.7 }).langkahBaru({ ms: 1500 });
    const sat = (a, b, c, d, e, ket) => L('akt', [a, b, c, d, e].filter(Boolean), { ket });
    s.baris([sat(T('r1', 'x^{2}', 'emas'), T('eq', '=', 'putih'), T('rx', 'x', 'merah'), T('rc', '+2', 'merah'), null, 'Di titik potong, nilai y kedua kurva sama')], { fs: 3 }).langkahBaru({ ms: 1700 });
    s.baris([sat(T('r1', 'x^{2}', 'emas'), T('rx', '-x', 'merah', { hl: true }), T('rc', '-2', 'merah', { hl: true }), T('eq', '=', 'putih'), T('z', '0', 'putih'), 'Pindahkan ke ruas kiri: tanda berubah')], { fs: 3 }).langkahBaru({ ms: 1900 });
    s.baris([sat(T('f1', '(x+1)', 'emas'), T('f2', '(x-2)', 'merah'), T('eq', '=', 'putih'), T('z', '0', 'putih'), null, 'Faktorkan')], { fs: 3 }).langkahBaru({ ms: 1500 });
    s.baris([sat(T('f1', 'x+1=0', 'emas'), T('at', '\\text{atau}', 'redup'), T('f2', 'x-2=0', 'merah'), null, null, 'Salah satu faktor harus nol')], { fs: 3 }).langkahBaru({ ms: 1500 });
    s.baris([sat(T('f1', 'x=-1', 'emas', { hl: true }), T('at', '\\text{atau}', 'redup'), T('f2', 'x=2', 'merah', { hl: true }), null, null, 'Absis kedua titik potong')], { fs: 3 }).langkahBaru({ ms: 1300 });
    /* titik kiri x = -1 */
    const ZL = { x0: -2.4, x1: 0.6, y0: -0.5, y1: 1.85 }, ZR = { x0: 0.4, x1: 3.4, y0: 2.75, y1: 5.1 };
    s.view(ZL).guide('gA', -1, 1, { c: 'biru', gy: 0 }).baris([L('x', [T('f1', 'x=-1', 'emas'), T('at', '\\text{atau}', 'redup'), T('f2', 'x=2', 'redup')], { ket: 'Titik pertama: x = −1' })], { fs: 2.7 }).langkahBaru({ ms: 2400 });
    s.baris([L('x', [T('f1', 'x=-1', 'emas'), T('at', '\\text{atau}', 'redup'), T('f2', 'x=2', 'redup')], { ket: 'Titik pertama: x = −1', op: 1 }), L('i', [TX('i1', 'Substitusikan ke <b>salah satu</b> fungsi. Boleh yang mana saja, hasil $y$-nya sama.', 'redup')], { sz: 'm', kls: 'info' })], { fs: 2.7 }).langkahBaru({ ms: 1100 });
    s.baris([L('x', [T('f1', 'x=-1', 'emas'), T('at', '\\text{atau}', 'redup'), T('f2', 'x=2', 'redup')], { ket: 'Titik pertama: x = −1', op: .45 }), L('a', [T('s1', 'y=x+2=(-1)+2=1', 'merah', { hl: true })], { ket: 'Substitusi ke y = x + 2' }), L('b', [T('s2', 'y=x^{2}=(-1)^{2}=1', 'emas', { hl: true })], { ket: 'Dicek ke y = x²: hasilnya sama' })], { fs: 2.7 }).set('gA', { gy: 1 }).pt('pA', -1, 1, { c: 'putih', lab: '(−1, 1)', dx: 14, dy: -18, d: .55 }).langkahBaru({ ms: 2300 });
    /* geser ke titik kanan x = 2 */
    s.view(ZR).baris([L('x', [T('f1', 'x=-1', 'redup'), T('at', '\\text{atau}', 'redup'), T('f2', 'x=2', 'emas')], { ket: 'Titik kedua: x = 2' })], { fs: 2.7 }).guide('gB', 2, 4, { c: 'biru', gy: 0 }).langkahBaru({ ms: 2600 });
    s.baris([L('x', [T('f1', 'x=-1', 'redup'), T('at', '\\text{atau}', 'redup'), T('f2', 'x=2', 'emas')], { ket: 'Titik kedua: x = 2', op: .45 }), L('a', [T('s1', 'y=x+2=2+2=4', 'merah', { hl: true })], { ket: 'Substitusi ke y = x + 2' }), L('b', [T('s2', 'y=x^{2}=2^{2}=4', 'emas', { hl: true })], { ket: 'Dicek ke y = x²: hasilnya sama' })], { fs: 2.7 }).set('gB', { gy: 1 }).pt('pB', 2, 4, { c: 'putih', lab: '(2, 4)', dx: 14, dy: 26, d: .55 }).langkahBaru({ ms: 2300 });
    /* zoom out */
    s.view(V2).baris([L('t', [T('ta', '(-1,\\,1)', 'emas', { hl: true }), TX('tb', 'dan', 'redup'), T('tc', '(2,\\,4)', 'merah', { hl: true })], { ket: 'Kedua titik potong' })], { fs: 3.1 }).langkahBaru({ ms: 2400 });
    return { judul: 'Mencari titik potong', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 6. menghitung luas daerah */
  function bab6() {
    const s = new Sken();
    s.graf(V2).k('k1', PF, { c: 'emas' }).tex('n1', 'y=x^{2}', { on: 'k1', at: -2.2, dx: -12, dy: -4, an: 'r', c: 'emas' }).k('k2', PG, { c: 'merah' }).tex('n2', 'y=x+2', { on: 'k2', at: 4.2, dx: 0, dy: -30, an: 'r', c: 'merah' }).mode('split')
      .guide('gA', -1, 1, { c: 'biru' }).guide('gB', 2, 4, { c: 'biru' }).pt('pA', -1, 1, { lab: '(−1, 1)', dx: -88, dy: -12 }).pt('pB', 2, 4, { lab: '(2, 4)', dx: 14, dy: 26 });
    const tanya = L('q', [TX('q', 'Pada $-1\\le x\\le 2$, kurva mana yang berada di <b>atas</b>?', 'putih')], { sz: 'm', ket: 'Titik potong menjadi batas integral' });
    s.baris([tanya], { fs: 2.7 }).langkahBaru({ ms: 1500 });
    s.redup(['k1', 'n1'], .14).baris([L('a', [T('ya', 'y_{\\text{atas}}=', 'putih'), T('fa', 'x+2', 'merah', { hl: true })], { ket: 'Kurva atas' })], { fs: 3 }).langkahBaru({ ms: 1700 });
    s.redup(['k1', 'n1'], 1).redup(['k2', 'n2'], .14).baris([L('a', [T('ya', 'y_{\\text{atas}}=', 'redup'), T('fa', 'x+2', 'redup')], { ket: 'Kurva atas', op: .4 }), L('b', [T('yb', 'y_{\\text{bawah}}=', 'putih'), T('fb', 'x^{2}', 'emas', { hl: true })], { ket: 'Kurva bawah' })], { fs: 3 }).langkahBaru({ ms: 1700 });
    s.redup(['k2', 'n2'], 1).area('z', PG, PF, -1, 2, { c: 'biru' });
    const R = [{ ket: 'Luas = ∫ (atas − bawah)', tok: [T('lh', 'L=', 'putih'), T('ig', '\\int_{' + RED + '-1}^{' + RED + '2}', 'putih'), T('e1', '\\left(', 'putih'), T('fa', 'x+2', 'merah'), T('mm', '-', 'putih'), T('fb', 'x^{2}', 'emas'), T('e2', '\\right)', 'putih'), T('dx', '\\,dx', 'putih')] }];
    s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 2100 });
    R.push({ ket: 'Sederhanakan', tok: [T('lh', 'L=', 'putih'), T('ig', '\\int_{' + RED + '-1}^{' + RED + '2}', 'putih'), T('fa', '\\left(-x^{2}+x+2\\right)', 'emas', { hl: true }), T('dx', '\\,dx', 'putih')] }); s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 1400 });
    R.push({ ket: 'Antiturunan', tok: [T('lh', 'L=', 'putih'), T('fa', '\\left[-\\frac{1}{3}x^{3}+\\frac{1}{2}x^{2}+2x\\right]_{-1}^{2}', 'emas', { hl: true })] }); s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 1400 });
    R.push({ ket: 'Substitusi batas atas dan bawah', tok: [T('lh', 'L=', 'putih'), T('u', '\\left(-\\frac{8}{3}+2+4\\right)', 'emas', { hl: true }), T('m', '-', 'putih'), T('l', '\\left(\\frac{1}{3}+\\frac{1}{2}-2\\right)', 'biru', { hl: true })] }); s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 1600 });
    R.push({ ket: 'Hitung masing-masing', tok: [T('lh', 'L=', 'putih'), T('u', '\\frac{10}{3}', 'emas'), T('m', '-', 'putih'), T('l', '\\left(-\\frac{7}{6}\\right)', 'biru')] }); s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 1400 });
    R.push({ ket: 'Samakan penyebut', tok: [T('lh', 'L=', 'putih'), T('u', '\\frac{20}{6}', 'emas'), T('m', '+', 'putih'), T('l', '\\frac{7}{6}', 'biru')] }); s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 1300 });
    R.push({ ket: 'Jumlahkan', tok: [T('lh', 'L=', 'putih'), T('u', '\\frac{27}{6}', 'emas')] }); s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 1300 });
    R.push({ ket: 'Hasil', tok: [T('lh', 'L=', 'putih'), T('u', '\\frac{9}{2}', 'emas', { hl: true }), TX('sat', 'satuan luas', 'putih')] }); s.tex('nl', 'L=\\frac{9}{2}', { x: 0.5, y: 1.6, c: 'biru', an: 'c' }); s.baris(pile(R), { fs: 2.7 }).langkahBaru({ ms: 1700 });
    return { judul: 'Menghitung luas daerah', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 7. tujuh materi sekilas */
  const RUMUS = {
    bawah: ['Di bawah sumbu-$x$', 'L=-\\int_{a}^{b}f(x)\\,dx'], potong: ['Memotong sumbu-$x$', 'L=\\left|\\int_{a}^{c}f\\right|+\\left|\\int_{c}^{b}f\\right|'], garis: ['Parabola dan garis', 'L=\\int_{a}^{b}\\left(y_{\\text{atas}}-y_{\\text{bawah}}\\right)dx'],
    parab: ['Dua parabola', 'L=\\int_{a}^{b}\\left(f(x)-g(x)\\right)dx'], silang: ['Dua kurva bersilangan', 'L=\\int_{a}^{c}(f-g)\\,dx+\\int_{c}^{b}(g-f)\\,dx'], sumbuy: ['Terhadap sumbu-$y$', 'L=\\int_{c}^{d}x\\,dy'], kanan: ['Kanan dikurangi kiri', 'L=\\int_{c}^{d}\\left(x_{\\text{kanan}}-x_{\\text{kiri}}\\right)dy']
  };
  function bab7() {
    const s = new Sken(); let pertama = true; let sebelum = null;
    B.URUT.forEach((fam, i) => {
      const sp = GF.K[fam].varian[0].spec, sw = sp.tipe === 'y', W = ['emas', 'merah'], v = GF.lihat(sp), V = { x0: v.xmin, x1: v.xmax, y0: v.ymin, y1: v.ymax };
      if (pertama) { s.graf(V).mode('split'); pertama = false; } else s.view(V);
      Object.keys(s.cur.g.items).forEach((id) => { if (!id.startsWith(sw ? 'y' : 'x')) s.hapus(id); });
      const pre = sw ? 'y' : 'x';
      sp.k.forEach((p, j) => s.k(pre + 'k' + j, p, { c: W[j % 2], sw }));
      for (let j = sp.k.length; j < 2; j++) s.hapus(pre + 'k' + j);
      sp.z.forEach((z, j) => s.area(pre + 'z' + j, z.u < 0 ? [0] : sp.k[z.u], z.l < 0 ? [0] : sp.k[z.l], z.a, z.b, { c: z.w ? 'merah' : 'emas', sw }));
      for (let j = sp.z.length; j < 2; j++) s.hapus(pre + 'z' + j);
      s.baris([L('n', [TX('n1', (i + 1) + '. ' + RUMUS[fam][0], 'emas')], { sz: 'j' }), L('r', [T('r1', RUMUS[fam][1], 'putih')], { sz: 'm' })], { fs: 2.4 }).langkahBaru({ ms: 1900 });
    });
    return { judul: 'Tujuh materi yang akan dipelajari', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 8. tujuan pembelajaran */
  function bab8() {
    const s = new Sken(), tj = ['Menghitung luas daerah di bawah kurva dan di antara dua kurva dengan integral tentu.', 'Menentukan titik potong dua kurva sebagai <b>batas</b> integral.', 'Memilih kurva <b>atas dan bawah</b> (atau kanan dan kiri) serta irisan $dx$ atau $dy$.', 'Menjelaskan satu materi kepada teman dan belajar dari teman.'];
    const baris = (n) => [L('h', [TX('h1', 'Tujuan pembelajaran hari ini', 'emas')], { sz: 'm' })].concat(tj.slice(0, n).map((t, i) => L('t' + i, [TX('tj' + i, (i + 1) + '. ' + t, 'putih')], { kls: 'daftar', sz: 'm' })));
    for (let n = 0; n <= tj.length; n++) s.baris(baris(n), { fs: 3.1, rata: 'kiri' }).langkahBaru({ ms: 1100 });
    return { judul: 'Tujuan pembelajaran', langkah: s.langkah };
  }

  /* ---------------------------------------------------------------- 9. bersiap tes */
  function bab9() {
    const s = new Sken();
    s.baris([L('a', [TX('a1', 'Bersiap untuk', 'putih')], { sz: 'j' }), L('b', [TX('b1', 'tes diagnostik awal', 'emas')], { sz: 'j' })], { fs: 2.8 }).langkahBaru({ ms: 1400 });
    s.baris([L('a', [TX('a1', 'Bersiap untuk', 'putih')], { sz: 'j' }), L('b', [TX('b1', 'tes diagnostik awal', 'emas')], { sz: 'j' }), L('c', [TX('c1', '5 soal pilihan ganda · 10 menit · kerjakan sendiri', 'redup')], { sz: 'm' })], { fs: 2.8 }).langkahBaru({ ms: 1000 });
    return { judul: 'Bersiap tes awal', langkah: s.langkah };
  }

  const BAB = () => [bab1(), bab2(), bab3(), bab4(), bab5(), bab6(), bab7(), bab8(), bab9()];
  function mount(host, o) { o = o || {}; try { UI.speed = [1, 2, 3].includes(+localStorage.getItem('ac_speed')) ? +localStorage.getItem('ac_speed') : 1; } catch (e) { UI.speed = 1; } return pasang(host, Object.assign({}, o, { bab: BAB(), mulaiB: o.mulaiB || 1 })); }
  root.Panggung = { mount, BAB };
})(window);

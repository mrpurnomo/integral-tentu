/* ALJABAR — pembangun langkah hitungan yang BENAR secara matematis dan SERAGAM di semua animasi (pengantar, pelajaran tujuh materi, pembahasan soal).
   Polanya satu, dipakai di mana-mana:
   1. Integral tentu  ∫ₐᵇ (f) dx  →  tanda ∫ dan dx HILANG, diganti kurung siku berbatas  [ … ]ₐᵇ  (batas terbang dari ∫ ke kurung siku)
      dan SAAT ITU JUGA pangkat tiap suku naik 1.
   2. Tiap suku dibagi pangkat yang baru (pangkat baru "turun" ke bawah sebagai salinan).
   3. Pangkat baru dihitung, lalu pecahan disederhanakan: antiturunan F(x) selesai.
   4. Substitusi batas atas dikurangi batas bawah, hitung masing-masing, hasil.
   Pindah ruas: suku terbang melintasi tanda "=" dan tandanya berubah. Tiap suku punya id sendiri supaya bergeraknya sendiri-sendiri. */
(function (root) {
  'use strict';
  const { T, TX } = Adegan, B = BS;
  const RED = '\\color{#FF6B70}';
  const SUP = (id, tex, c, o) => T(id, tex, c, Object.assign({ kls: 'sup' }, o));
  const FR = (id, atas, bawah, c) => ({ id, kolom: { atas, bawah }, c: c || 'putih' });
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  /* suku-suku polinom (koefisien naik) dari pangkat tertinggi, tanpa suku nol */
  const suku = (D) => { const o = []; for (let p = D.length - 1; p >= 0; p--) if (D[p]) o.push({ p, c: D[p] }); return o; };

  /* token satu suku pada tahap st. pf = awalan id; pertama = suku pertama dalam ungkapan (tanpa tanda + di depannya) */
  function tokSuku(st, i, t, v, pf, pertama) {
    pf = pf || ''; const { p, c } = t, a = Math.abs(c), q = p + 1, out = [], kf = a !== 1 || p === 0;
    if (!pertama || c < 0) out.push(T(pf + 's' + i, c < 0 ? '-' : '+', 'putih'));
    const K = (txt) => T(pf + 'k' + i, txt, 'emas'), X = (col, hl) => T(pf + 'x' + i, v, col || 'emas', hl ? { hl: true } : null);
    if (st === 'asli') { if (kf) out.push(K(String(a))); if (p >= 1) out.push(X()); if (p >= 2) out.push(SUP(pf + 'e' + i, String(p), 'emas')); return out; }
    if (st === 'naik') { if (kf) out.push(K(String(a))); out.push(X(p === 0 ? 'merah' : 'emas', p === 0)); out.push(SUP(pf + 'e' + i, p + '+1', 'merah', { hl: true })); return out; }
    const atas = []; if (st === 'bagi') { if (kf) atas.push(K(String(a))); atas.push(X()); atas.push(SUP(pf + 'e' + i, p + '+1', 'merah')); out.push(FR(pf + 'fr' + i, atas, [T(pf + 'd' + i, p + '+1', 'merah', { dari: pf + 'e' + i })])); return out; }
    if (st === 'hitung') { if (kf) atas.push(K(String(a))); atas.push(X()); if (q >= 2) atas.push(SUP(pf + 'e' + i, String(q), 'emas')); out.push(FR(pf + 'fr' + i, atas, [T(pf + 'd' + i, String(q), 'emas')])); return out; }
    /* sederhana: a / q disederhanakan */
    const g = gcd(a, q), n = a / g, d = q / g;
    if (d === 1) { if (n !== 1) atas.push(K(String(n))); atas.push(X()); if (q >= 2) atas.push(SUP(pf + 'e' + i, String(q), 'emas')); return out.concat(atas); }
    if (n !== 1) atas.push(K(String(n))); atas.push(X()); if (q >= 2) atas.push(SUP(pf + 'e' + i, String(q), 'emas'));
    out.push(FR(pf + 'fr' + i, atas, [T(pf + 'd' + i, String(d), 'emas')])); return out;
  }
  const badan = (st, D, v, pf) => { const o = []; suku(D).forEach((t, i) => o.push(...tokSuku(st, i, t, v, pf, i === 0))); return o; };

  /* baris ∫ₐᵇ (polinom) dx dengan suku-suku bertoken */
  function tokIntegral(o) {
    const v = o.v, ts = suku(o.D), par = ts.length > 1, out = (o.pre || []).slice();
    if (o.neg) out.push(T('mn', '-', 'merah'));
    out.push(T('ig', '\\int_{' + RED + o.a + '}^{' + RED + o.b + '}', 'putih'));
    if (par) out.push(T('lp', '\\Bigl(', 'putih'));
    out.push(...badan('asli', o.D, v)); if (par) out.push(T('rp', '\\Bigr)', 'putih')); out.push(T('dx', '\\,d' + v, 'putih')); return out;
  }

  /* langkah-langkah setelah baris ∫ : kurung siku → bagi → hitung → sederhanakan → substitusi → hitung → hasil.
     o: { v, D, a, b, pre, neg, nomor, nm }.  Setiap baris: { ket, tok, ms, ganti, tag }. ganti=true: menggantikan baris aktif (bukan menumpuk). */
  function langkahHitung(o) {
    const v = o.v, D = o.D, a = o.a, b = o.b, pre = o.pre || [], neg = !!o.neg, nomor = o.nomor || '', H = B.tHit(D, a, b, v), mn = neg ? [T('mn', '-', 'merah')] : [];
    const kurung = (st) => pre.concat(mn, [T('bl', '\\Bigl[', 'putih')], badan(st, D, v), [T('br', '\\Bigr]_{' + RED + a + '}^{' + RED + b + '}', 'putih', { dari: 'ig' })]);
    const rows = [
      { ket: nomor + 'Langkah 1 · tanda ∫ dan dx hilang, ganti kurung siku berbatas; pangkat tiap suku naik 1', tok: kurung('naik'), ms: 2000 },
      { ket: nomor + 'Langkah 2 · bagi tiap suku dengan pangkat yang baru', tok: kurung('bagi'), ms: 1900, ganti: true },
      { ket: nomor + 'Langkah 3 · hitung pangkat yang baru', tok: kurung('hitung'), ms: 1600, ganti: true },
      { ket: nomor + 'Langkah 4 · sederhanakan: antiturunan selesai', tok: kurung('sederhana'), ms: 1700, ganti: true }
    ];
    const par = (r) => (r.n < 0 || r.d > 1 ? '\\left(' + B.tR(r) + '\\right)' : B.tR(r));
    const bungkus = (isi) => (neg ? [T('pl', '\\Bigl(', 'putih')].concat(isi, [T('pr', '\\Bigr)', 'putih')]) : isi);
    rows.push({ ket: nomor + 'Langkah 5 · substitusi batas atas dikurangi batas bawah', tok: pre.concat(mn, bungkus([T('u', '\\left(' + B.tSubst(D, b) + '\\right)', 'emas', { hl: true }), T('m', '-', 'putih'), T('l', '\\left(' + B.tSubst(D, a) + '\\right)', 'biru', { hl: true })])), ms: 1800 });
    rows.push({ ket: nomor + 'Langkah 6 · hitung masing-masing', tok: pre.concat(mn, bungkus([T('u', par(H.Fb), 'emas'), T('m', '-', 'putih'), T('l', par(H.Fa), 'biru')])), ms: 1500 });
    const sat = B.tAbs(H.nilai), neg2 = H.nilai.n < 0;
    rows.push({ ket: nomor + 'Hasil' + (neg ? ' (minus di depan membuat luas positif)' : ''), tok: pre.concat([T('u', sat, 'emas', { hl: true }), TX('sat', 'satuan luas', 'putih')]), ms: 1500, tag: 'hasil', nilai: sat, negatif: neg2 });
    return rows;
  }

  /* mencari titik potong: f = g, suku ruas kanan terbang ke kiri dan tandanya berubah, lalu (bila perlu) gabungkan suku sejenis */
  function samakan(o) {
    const v = o.v, f = o.f, g = o.g, tf = suku(f), tg = suku(g), eq = () => T('eq', '=', 'putih'), L = (tok, ket) => ({ ket, tok });
    const sisi = (ts, pf, balik, pertama0) => { const out = []; ts.forEach((t, i) => out.push(...tokSuku('asli', i, balik ? { p: t.p, c: -t.c } : t, v, pf, pertama0 && i === 0))); return out; };
    const A = sisi(tf, 'f', false, true).concat([eq()], sisi(tg, 'g', false, true)), Bk = sisi(tf, 'f', false, true).concat(sisi(tg, 'g', true, false), [eq(), T('z', '0', 'putih')]);
    const rows = [L(A, 'Titik potong: samakan kedua fungsi'), L(Bk, 'Pindahkan suku ruas kanan ke ruas kiri: tandanya berubah')];
    const ps = tf.map((t) => t.p).concat(tg.map((t) => t.p)), urut = ps.every((p, i) => !i || p < ps[i - 1]);
    if (!urut) { const sam = B.pa(f, g, -1); rows.push(L(badan('asli', sam, v, 'c').concat([eq(), T('z', '0', 'putih')]), 'Gabungkan suku-suku yang sejenis')); }
    return rows;
  }

  root.Alj = { suku, badan, tokIntegral, langkahHitung, samakan, SUP, FR };
})(window);

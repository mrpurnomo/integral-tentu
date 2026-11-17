/* Kode bersama (peramban + server): konfigurasi kelas, tujuh bagian materi (pos), rute jigsaw, soal tes awal acak per murid,
   generator soal cerita (jawaban bilangan bulat), bank "tebak" dan "cocokkan", kode hasil 5 karakter, pembentukan kelompok, poin.
   Materi: LUAS DAERAH DI BAWAH KURVA DAN ANTARA DUA KURVA (integral tentu, partisi dx dan dy). */
(function (root) {
  'use strict';
  const DAFTAR_ALL = (typeof module !== 'undefined' && module.exports) ? require('./daftar.js') : root.DAFTAR_KELAS;
  const judulKata = (s) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  const DUMMY = 49;                    // akun uji coba guru (tidak masuk kelompok dan statistik); harus > jumlah murid kelas mana pun (maks 49 murid per kelas)
  /* PIN guru ada di api/_lib/rahasia.js (hanya server). Di sini hanya hash-nya, untuk masuk guru saat mode mandiri (tanpa server). */
  const PIN_SHA = 'd264270217b2b99d824dc863f4d2bc35be934afb4d9cf63ac80434f791a01f63';
  function sha256(m) {
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const b = []; for (let i = 0; i < m.length; i++) b.push(m.charCodeAt(i) & 255);
    const bit = b.length * 8; b.push(0x80); while (b.length % 64 !== 56) b.push(0); b.push(0, 0, 0, 0, (bit >>> 24) & 255, (bit >>> 16) & 255, (bit >>> 8) & 255, bit & 255);
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], R = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < b.length; o += 64) {
      const w = []; for (let i = 0; i < 16; i++) w[i] = (b[o + 4 * i] << 24) | (b[o + 4 * i + 1] << 16) | (b[o + 4 * i + 2] << 8) | b[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) { const s0 = R(w[i - 15], 7) ^ R(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = R(w[i - 2], 17) ^ R(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
      let [A, Bb, C, D, E, F, G, Hh] = H;
      for (let i = 0; i < 64; i++) { const t1 = (Hh + (R(E, 6) ^ R(E, 11) ^ R(E, 25)) + ((E & F) ^ (~E & G)) + K[i] + w[i]) | 0, t2 = ((R(A, 2) ^ R(A, 13) ^ R(A, 22)) + ((A & Bb) ^ (A & C) ^ (Bb & C))) | 0; Hh = G; G = F; F = E; E = (D + t1) | 0; D = C; C = Bb; Bb = A; A = (t1 + t2) | 0; }
      [A, Bb, C, D, E, F, G, Hh].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map((v) => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const cekPinLokal = (pin) => sha256('area-calculus:' + String(pin)) === PIN_SHA;
  /* pengaturan per kelas.
     manual:false  = kelompok dibentuk otomatis dari skor tes awal (heterogen, pola ular).
     manual:true   = kelompok disusun guru; murid baru boleh masuk setelah guru membuka kelas.
     jigsaw:true   = satu materi per kelompok + sesi berkeliling (Host dan Penjelajah); langkah = 6.
     tampil:false  = tidak muncul di pilihan kelas (kelas cadangan). */
  const KJ = (kode, nama, program, o) => Object.assign({ kode, nama, program, daftar: DAFTAR_ALL[kode], durasi: 600, manual: false, jigsaw: true, langkah: 6, jmlKelompok: 7, tampil: true, materi: 'kurva2', siap: true }, o || {});
  const KELAS_CFG = {
    xiia: KJ('xiia', 'XII-A Teknik', 'Teknik'),
    xiib: KJ('xiib', 'XII-B Teknik', 'Teknik'),
    xiic: KJ('xiic', 'XII-C Kesehatan', 'Kesehatan'),
    /* XII-D: dasar integral tentu (dua pertemuan) — materi disiapkan kemudian; kelas sudah terdaftar untuk guru */
    xiid: KJ('xiid', 'XII-D Soshum', 'Soshum', { materi: 'dasar', siap: false }),
    /* kelas uji tersembunyi: kelompok disusun guru (menguji mode manual) */
    ujim: KJ('ujim', 'Kelas uji (manual)', 'Uji', { manual: true, tampil: false })
  };
  Object.keys(KELAS_CFG).forEach((k) => { const c = KELAS_CFG[k]; c.maks = Math.max(3, Math.ceil(c.daftar.length / c.jmlKelompok)); });
  const KELAS_ID = Object.keys(KELAS_CFG), KELAS_TAMPIL = KELAS_ID.filter((k) => KELAS_CFG[k].tampil);
  let AKTIF = KELAS_TAMPIL[0];
  const cfg = (k) => KELAS_CFG[k || AKTIF] || KELAS_CFG[KELAS_TAMPIL[0]];
  const setKelas = (k) => { if (KELAS_CFG[k]) AKTIF = k; return cfg(); };
  const nama = (i, k) => (i === DUMMY ? 'Siswa Uji Coba (Guru)' : judulKata(cfg(k).daftar[i]));
  const durasi = (k) => cfg(k).durasi;
  const JUMLAH_SOAL = 5;

  /* ---------- acak berbenih ---------- */
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rint = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const acak = (r, arr) => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const pil = (r, a) => a[rint(r, 0, a.length - 1)];
  const mn = (n) => String(n).replace('-', '−');
  const rb = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const cari = (fn, n) => { for (let i = 0; i < (n || 400); i++) { const v = fn(); if (v) return v; } return null; };


  /* ---------- polinom (larik koefisien [c0, c1, c2, …]) dan pecahan eksak ---------- */
  const pv = (p, x) => p.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
  const pm = (p, q) => { const o = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { o[i + j] += a * b; })); return o; };
  const pa = (p, q, k) => { const n = Math.max(p.length, q.length), o = []; for (let i = 0; i < n; i++) o[i] = (p[i] || 0) + (k == null ? 1 : k) * (q[i] || 0); return o; };
  const ps = (p, k) => p.map((c) => c * k);
  const i12 = (p, a, b) => p.reduce((s, c, n) => s + c * (12 / (n + 1)) * (Math.pow(b, n + 1) - Math.pow(a, n + 1)), 0);   // 12 × ∫ₐᵇ p
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const rt = (n, d) => { if (d == null) d = 1; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const rA = (x, y) => rt(x.n * y.d + y.n * x.d, x.d * y.d), rS = (x, y) => rt(x.n * y.d - y.n * x.d, x.d * y.d);
  const Fv = (p, v) => p.reduce((s, c, n) => rA(s, rt(c * Math.pow(v, n + 1), n + 1)), rt(0, 1));   // antiturunan di v (tanpa konstanta)
  const luas12 = (p, titik) => { let s = 0; for (let i = 0; i + 1 < titik.length; i++) s += Math.abs(i12(p, titik[i], titik[i + 1])); return s; };

  /* ---------- LaTeX: semua rumus dirender KaTeX di peramban. Teks campuran memakai penanda $…$ ---------- */
  const M = (s) => '$' + s + '$';
  const tFr = (n, d) => (d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}');
  const tR = (x) => tFr(x.n, x.d);
  const tAbs = (x) => (x.d === 1 ? String(Math.abs(x.n)) : '\\frac{' + Math.abs(x.n) + '}{' + x.d + '}');
  const tVar = (v, n) => (n === 0 ? '' : v + (n > 1 ? '^{' + n + '}' : ''));
  function tPoly(p, v) { v = v || 'x'; let s = ''; for (let n = p.length - 1; n >= 0; n--) { const c = p[n]; if (!c) continue; const a = Math.abs(c), kf = (a === 1 && n > 0) ? '' : String(a), t = kf + tVar(v, n); s += s ? (c < 0 ? '-' : '+') + t : (c < 0 ? '-' : '') + t; } return s || '0'; }
  function tAnti(p, v) { v = v || 'x'; let s = ''; for (let n = p.length - 1; n >= 0; n--) { const c = p[n]; if (!c) continue; const q = rt(c, n + 1), neg = q.n < 0, a = rt(Math.abs(q.n), q.d), kf = (a.n === 1 && a.d === 1) ? '' : tAbs(a), t = kf + tVar(v, n + 1); s += s ? (neg ? '-' : '+') + t : (neg ? '-' : '') + t; } return s || '0'; }
  /* nilai tiap suku antiturunan di v, dijumlahkan: mis. "9-18+15" */
  function tSubst(p, v) { let s = ''; for (let n = p.length - 1; n >= 0; n--) { const c = p[n]; if (!c) continue; const q = rt(c * Math.pow(v, n + 1), n + 1); if (q.n === 0) continue; s += s ? (q.n < 0 ? '-' : '+') + tAbs(q) : (q.n < 0 ? '-' : '') + tAbs(q); } return s || '0'; }
  const tPar = (s) => '\\left(' + s + '\\right)';
  const perluKurung = (s) => /[+-]/.test(s.slice(1));
  const tInt = (a, b, expr, v) => '\\int_{' + a + '}^{' + b + '}' + (perluKurung(expr) || expr[0] === '-' ? tPar(expr) : expr) + '\\,d' + (v || 'x');
  const tEv = (inner, a, b) => '\\left[' + inner + '\\right]_{' + a + '}^{' + b + '}';
  const tNum = (n) => (n < 0 ? '(' + n + ')' : String(n));
  /* rangkaian langkah menghitung ∫ₐᵇ p dv: antiturunan, substitusi, nilai, hasil */
  function tHit(p, a, b, v) {
    v = v || 'x'; const Fa = Fv(p, a), Fb = Fv(p, b), sel = rS(Fb, Fa), A = tAnti(p, v);
    return { anti: A, ev: tEv(A, a, b), sub: tPar(tSubst(p, b)) + '-' + tPar(tSubst(p, a)), val: tPar(tR(Fb)) + '-' + tPar(tR(Fa)), res: tR(sel), nilai: sel, Fa, Fb };
  }
  const urutAcak = (r, n) => acak(r, Array.from({ length: n }, (_, i) => i));

  /* ---------- tujuh bagian materi ---------- */
  const URUT = ['bawah', 'potong', 'garis', 'parab', 'silang', 'sumbuy', 'kanan'];
  const NAMA_FAM = { bawah: 'Di bawah sumbu-x', potong: 'Memotong sumbu-x', garis: 'Parabola dan garis', parab: 'Dua parabola', silang: 'Dua kurva bersilangan', sumbuy: 'Terhadap sumbu-y', kanan: 'Kanan dikurangi kiri' };
  const NPOS = URUT.length;
  const bagianKelompok = (k) => URUT[((k % NPOS) + NPOS) % NPOS];   // k = indeks kelompok 0-based → materi kelompok itu
  /* peran dipilih sendiri oleh murid di kelompoknya: Host (pengajar) menetap; Penjelajah A dan B berkeliling */
  const PERAN = [{ kode: 'host', sub: null, nama: 'Host', panjang: 'Host (pengajar)' }, { kode: 'kelana', sub: 'A', nama: 'Penjelajah A', panjang: 'Penjelajah A' }, { kode: 'kelana', sub: 'B', nama: 'Penjelajah B', panjang: 'Penjelajah B' }];
  const peranDariPos = (pos) => PERAN[Math.max(0, Math.min(2, pos | 0))];
  /* kapasitas tiap peran dalam satu kelompok: 1 Host; sisanya dibagi dua Penjelajah */
  const kapasitasPeran = (maks) => [1, Math.max(1, Math.ceil((maks - 1) / 2)), Math.max(1, Math.floor((maks - 1) / 2))];
  /* kelompok (nomor 1-based) yang wajib dikunjungi Penjelajah sub 'A' | 'B' dari kelompok g: tiga kelompok lain, tidak bertabrakan */
  const rute3 = (g, sub) => [1, 2, 3].map((r) => ((g + r - 1 + (sub === 'B' ? 3 : 0)) % NPOS) + 1);
  /* tamu di meja Host kelompok h: enam kelompok lain (tiap kelompok mengirim satu Penjelajah) */
  const tamuHost = (h) => [1, 2, 3, 4, 5, 6, 7].filter((g) => g !== h).map((g) => ({ g, sub: rute3(g, 'A').includes(h) ? 'A' : 'B' }));
  /* kelompok yang dikunjungi seorang Penjelajah: bila rekan A/B tidak ada, ia mengambil seluruh enam kelompok */
  const daftarKunjungan = (g, sub, adaRekan) => (adaRekan === false ? rute3(g, 'A').concat(rute3(g, 'B')) : rute3(g, sub));

  /* =====================================================================================
     TES AWAL: lima butir; tipe dan tingkat kesulitan SAMA untuk semua murid, angka berbeda tiap murid.
     Ruang kombinasi angka dikocok dengan benih tetap lalu dipilih menurut nomor murid, sehingga tidak ada dua murid
     (dalam satu kelas) yang mendapat angka yang sama selama ruang kombinasinya cukup besar.
     ===================================================================================== */
  const RUANG = {};
  const pilihRuang = (nm, idx, gen) => { if (!RUANG[nm]) { const L = gen(); RUANG[nm] = acak(mulberry(1117 + nm.length * 31 + nm.charCodeAt(0) * 7), L); } const L = RUANG[nm]; return L[idx % L.length]; };
  function ambilOpsi(kunci, kandidat, fmt) {
    const set = []; [kunci].concat(kandidat).forEach((v) => { if (!set.some((x) => String(x) === String(v))) set.push(v); });
    let k = 1; while (set.length < 5) { const v = typeof kunci === 'number' ? kunci + (k % 2 ? k : -k) * 2 : kunci + k; if (!set.some((x) => String(x) === String(v))) set.push(v); k++; }
    return set.slice(0, 5).map(fmt || String);
  }
  const opsiStr = (kunci, kand) => { const s = [kunci]; kand.forEach((v) => { if (!s.includes(v)) s.push(v); }); return s.slice(0, 5); };
  const mt = (n) => M(String(n));                                  // angka dalam KaTeX (tanda minus rapi)
  const FX = 'f(x)';
  const IGF = (a, b) => '\\int_{' + a + '}^{' + b + '}f(x)\\,dx';
  function soalSiswa(idx) {
    const S = [];
    /* 1. integral tentu dasar (antiturunan polinom) */
    { const q = pilihRuang('s1', idx, () => { const L = []; [3, 6, 9].forEach((p) => [-6, -4, -2, 2, 4, 6].forEach((qq) => [-3, -2, -1, 1, 2, 3, 4].forEach((c) => [1, 2].forEach((a) => [1, 2].forEach((w) => { const F = (x) => (p / 3) * x * x * x + (qq / 2) * x * x + c * x; if (Math.abs(F(a + w) - F(a)) >= 5) L.push({ p, q: qq, c, a, b: a + w }); }))))); return L; });
      const f = [q.c, q.q, q.p], F = (x) => (q.p / 3) * x * x * x + (q.q / 2) * x * x + q.c * x, kunci = F(q.b) - F(q.a), H = tHit(f, q.a, q.b);
      const o = ambilOpsi(kunci, [F(q.b), F(q.a) - F(q.b), pv(f, q.b) - pv(f, q.a), kunci + 2 * q.c, F(q.b) + F(q.a)], mt);
      S.push({ tanya: 'Hitunglah ' + M(tInt(q.a, q.b, tPoly(f))) + '.', opsi: o, kunci: mt(kunci), jelas: 'Antiturunan dari ' + M(tPoly(f)) + ' adalah ' + M('F(x)=' + H.anti) + '. Maka ' + M(H.ev + '=' + H.sub + '=' + H.val + '=' + tR(H.nilai)) + '. Ingat: hasilnya ' + M('F(b)-F(a)') + ', bukan ' + M('F(b)') + ' saja.', det: { j: 1, a: q.a, b: q.b, f, kunci } }); }
    /* 2. batas ditukar + sifat linear: diketahui ∫ₐᵇ f = k, hitung ∫ᵇₐ (c·f − d) */
    { const q = pilihRuang('s2', idx, () => { const L = []; [1, 2, 3].forEach((a) => [2, 3, 4].forEach((w) => [3, 4, 5, 6, 7, 8, 9, 12].forEach((k) => [2, 3, 4].forEach((c) => [1, 2, 3].forEach((d) => L.push({ a, b: a + w, k, c, d })))))); return L; });
      const L = q.b - q.a, kunci = q.d * L - q.c * q.k;
      const o = ambilOpsi(kunci, [q.c * q.k - q.d * L, q.c * q.k + q.d * L, -q.c * q.k - q.d * L, -q.c * q.k, q.d * L + q.c * q.k], mt);
      S.push({ tanya: 'Diketahui ' + M(IGF(q.a, q.b) + '=' + q.k) + '. Hitunglah ' + M('\\int_{' + q.b + '}^{' + q.a + '}\\left(' + q.c + 'f(x)-' + q.d + '\\right)dx') + '.', opsi: o, kunci: mt(kunci),
        jelas: 'Tukar batas: ' + M('\\int_{' + q.b + '}^{' + q.a + '}\\left(' + q.c + 'f(x)-' + q.d + '\\right)dx=-\\int_{' + q.a + '}^{' + q.b + '}\\left(' + q.c + 'f(x)-' + q.d + '\\right)dx') + '. Di dalamnya: ' + M('\\int_{' + q.a + '}^{' + q.b + '}\\left(' + q.c + 'f(x)-' + q.d + '\\right)dx=' + q.c + '\\cdot' + q.k + '-' + q.d + '(' + q.b + '-' + q.a + ')=' + (q.c * q.k - q.d * L)) + '. Jadi hasilnya ' + M('-(' + (q.c * q.k - q.d * L) + ')=' + kunci) + '.', det: { j: 2, a: q.a, b: q.b, k: q.k, c: q.c, d: q.d, kunci } }); }
    /* 3. batas dipartisi: diketahui ∫ₐᶜ f = P dan ∫ᵇᶜ f = q, hitung ∫ₐᵇ f */
    { const q = pilihRuang('s3', idx, () => { const L = []; [0, 1, 2].forEach((a) => [2, 3].forEach((w1) => [2, 3, 4].forEach((w2) => [3, 4, 5, 6, 7, 9].forEach((p) => [2, 3, 4, 5, 8].forEach((qq) => L.push({ a, b: a + w1, c: a + w1 + w2, p, q: qq })))))); return L; });
      const P = q.p + q.q, kunci = q.p, o = ambilOpsi(kunci, [P + q.q, q.q - P, P, q.q, -q.p], mt);
      S.push({ tanya: 'Diketahui ' + M(IGF(q.a, q.c) + '=' + P) + ' dan ' + M(IGF(q.b, q.c) + '=' + q.q) + '. Hitunglah ' + M(IGF(q.a, q.b)) + '.', opsi: o, kunci: mt(kunci),
        jelas: 'Batas boleh dipartisi di titik tengah: ' + M(IGF(q.a, q.c) + '=' + IGF(q.a, q.b) + '+' + IGF(q.b, q.c)) + '. Maka ' + M(IGF(q.a, q.b) + '=' + P + '-' + q.q + '=' + kunci) + '.', det: { j: 3, a: q.a, b: q.b, c: q.c, p: q.p, q: q.q, kunci } }); }
    /* 4. dari grafik satu kurva y = m x² + c: pilih penulisan integral tentu untuk daerah yang diarsir */
    { const q = pilihRuang('s4', idx, () => { const L = []; [1, 2].forEach((m) => [1, 2, 3, 4].forEach((c) => [1, 2, 3, 4].forEach((a) => [2, 3].forEach((w) => L.push({ m, c, a, b: a + w }))))); return L; });
      const f = [q.c, 0, q.m], fs = tPoly(f), fm = tPoly([0, 0, q.m]), I = (a, b, e, d) => '\\int_{' + a + '}^{' + b + '}\\left(' + e + '\\right)\\,' + (d || 'dx'), benar = M(I(q.a, q.b, fs));
      const o = [benar, M(I(q.b, q.a, fs)), M(I(0, q.b, fs)), M('\\int_{' + q.a + '}^{' + q.b + '}' + fm + '\\,dx'), M(I(q.a, q.b, fs, 'dy'))];
      S.push({ det: { j: 4, f, a: q.a, b: q.b }, grafik: { spec: { tipe: 'x', k: [f], z: [{ u: 0, l: -1, a: q.a, b: q.b, w: 0 }], nama: [M('y=' + fs)] }, W: 420, H: 300 }, tanya: 'Perhatikan grafik fungsi ' + M('y=f(x)=' + fs) + '. Penulisan integral tentu yang <b>tepat</b> untuk luas daerah yang diarsir adalah …', opsi: o, kunci: benar,
        jelas: 'Daerah diarsir dibatasi kurva ' + M('y=' + fs) + ' di atas dan sumbu-' + M('x') + ' di bawah, mulai ' + M('x=' + q.a) + ' sampai ' + M('x=' + q.b) + ' (lihat batas pada sumbu-' + M('x') + '). Karena kurva di atas sumbu-' + M('x') + ', luasnya ' + benar + '. Batas bawah harus ' + M(q.a) + ' (bukan 0), fungsinya lengkap, dan variabelnya ' + M('dx') + ' karena irisan tegak.' }); }
    /* 5. dari grafik f(x) di atas sumbu-x: hitung luas (siswa merangkai integralnya sendiri) */
    { const q = pilihRuang('s5', idx, () => { const L = []; [3, 4, 5, 6].forEach((s) => [1, 2, 3].forEach((k) => { for (let a = 0; a <= s - 2; a++) for (let b = a + 1; b <= s; b++) L.push({ s, k, a, b }); })); return L; });
      const p = [0, q.k * q.s, -q.k], H = tHit(p, q.a, q.b), L = H.nilai, kunci = tR(L);
      const o = opsiStr(kunci, [tR(rt(L.n, L.d * 2)), tR(rt(L.n * 2, L.d)), tR(rt(L.n + L.d, L.d)), tR(rt(Math.abs(H.Fb.n), H.Fb.d)), tR(rt(L.n - L.d, L.d))]);
      for (let j = 1; o.length < 5; j++) { const v2 = tR(rt(L.n + j * L.d, L.d)); if (!o.includes(v2)) o.push(v2); }
      S.push({ det: { j: 5, p, a: q.a, b: q.b }, grafik: { spec: { tipe: 'x', k: [p], z: [{ u: 0, l: -1, a: q.a, b: q.b, w: 0 }], nama: [M('y=' + tPoly(p))] }, W: 420, H: 300 }, tanya: 'Perhatikan grafik kurva ' + M('y=f(x)') + ' dengan ' + M('f(x)=' + tPoly(p)) + '. Daerah yang diarsir dibatasi kurva, sumbu-' + M('x') + ', garis ' + M('x=' + q.a) + ', dan garis ' + M('x=' + q.b) + '. Berapa satuan luas daerah yang diarsir?', opsi: o.map(M), kunci: M(kunci),
        jelas: 'Kurva berada di atas sumbu-' + M('x') + ' pada ' + M('[' + q.a + ',' + q.b + ']') + ', jadi luas ' + M('=' + tInt(q.a, q.b, tPoly(p))) + '. ' + M(H.ev + '=' + H.sub + '=' + H.val + '=' + H.res) + '.' }); }
    return S.map((s, i) => { const rr = mulberry(31 + idx * 101 + i * 17), urut = acak(rr, s.opsi.map((_, k) => k)), opsi = urut.map((k) => s.opsi[k]); const q = { no: i + 1, tanya: s.tanya, opsi, kunci: opsi.indexOf(s.kunci), jelas: s.jelas, html: true }; if (s.grafik) q.grafik = s.grafik; if (s.det) q.det = s.det; return q; });
  }
  function nilai(idx, jawab) { const so = soalSiswa(idx), hasil = so.map((s, i) => ({ no: i + 1, pilih: jawab[i] == null || jawab[i] === 5 ? null : jawab[i], benar: jawab[i] === s.kunci })); return { benar: hasil.filter((h) => h.benar).length, salah: hasil.filter((h) => !h.benar).length, hasil }; }

  /* ---------- kode hasil 5 karakter (4 data + 1 cek), alfabet tanpa 0 O 1 I ---------- */
  const ALFA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  function buatKode(idx, jawab) { let a = 0, kali = 1; for (let i = 0; i < 5; i++) { const v = jawab[i] == null ? 5 : jawab[i]; a += v * kali; kali *= 6; } let n = idx + 50 * a, s = ''; for (let i = 0; i < 4; i++) { s = ALFA[n % 32] + s; n = Math.floor(n / 32); } let c = 0; for (let i = 0; i < 4; i++) c += (ALFA.indexOf(s[i]) + 1) * (2 * i + 3); return s + ALFA[c % 32]; }
  function bacaKode(kode) {
    const k = String(kode || '').toUpperCase().replace(/[^A-Z2-9]/g, ''); if (k.length !== 5) return { error: 'Kode harus 5 karakter' };
    let c = 0, n = 0; for (let i = 0; i < 4; i++) { const p = ALFA.indexOf(k[i]); if (p < 0) return { error: 'Karakter kode tidak dikenali' }; c += (p + 1) * (2 * i + 3); n = n * 32 + p; }
    if (ALFA[c % 32] !== k[4]) return { error: 'Kode salah ketik (karakter terakhir tidak cocok)' };
    const idx = n % 50; let a = Math.floor(n / 50); if (a >= 7776) return { error: 'Kode tidak valid' };
    const jawab = []; for (let i = 0; i < 5; i++) { const v = a % 6; jawab.push(v === 5 ? null : v); a = Math.floor(a / 6); }
    return { idx, jawab, kode: k };
  }

  /* ---------- kelompok heterogen (pola ular), jumlah kelompok dan anggota maksimum dari konfigurasi kelas ---------- */
  function bentukKelompok(selesai, kl) {
    const c = cfg(kl), J = c.jmlKelompok, urut = selesai.slice().sort((a, b) => (b.skor - a.skor) || (a.idx - b.idx)), kel = Array.from({ length: J }, () => []), pola = [];
    for (let p = 0; p < Math.ceil(c.daftar.length / J) + 1; p++) for (let i = 0; i < J; i++) pola.push(p % 2 ? J - 1 - i : i);
    urut.forEach((s, i) => { if (pola[i] != null) kel[pola[i]].push({ idx: s.idx, skor: s.skor }); }); return kel;
  }
  function tambahKelompok(kel, s, kl) {
    const MAKS = cfg(kl).maks, rata = (g) => (g.length ? g.reduce((a, b) => a + b.skor, 0) / g.length : 0), semua = kel.flat(), rataAll = semua.length ? semua.reduce((a, b) => a + b.skor, 0) / semua.length : s.skor;
    const buka = kel.map((g, i) => ({ g, i })).filter((x) => x.g.length < MAKS); if (!buka.length) return -1;
    const min = Math.min(...buka.map((x) => x.g.length)), kand = buka.filter((x) => x.g.length === min);
    kand.sort((a, b) => (s.skor >= rataAll ? rata(a.g) - rata(b.g) : rata(b.g) - rata(a.g))); const pilih = kand[0].i; kel[pilih].push({ idx: s.idx, skor: s.skor }); return pilih;
  }

  /* =====================================================================================
     SOAL LUAS DAERAH (tujuh materi): satu objek soal P memuat grafik (spec), titik potong, dan kunci (bilangan bulat).
     spec: { tipe:'x'|'y', k:[polinom…], z:[{u,l,a,b,w}] } u,l = indeks kurva atas/bawah (kanan/kiri), −1 = sumbu; w=1 bagian negatif.
     ===================================================================================== */
  const NA = 'satuan luas';
  const kk = (P, i) => (i < 0 ? [0] : P.k[i]);
  const selisihZ = (P, q) => pa(kk(P, q.u), kk(P, q.l), -1);
  function mk(fam, tipe, k, z, ex) {
    if (k.some((p) => p.some((c) => Math.abs(c) > 16))) return null;
    const P = { fam, tipe, k, z }; let v12 = 0; z.forEach((q) => { v12 += Math.abs(i12(selisihZ(P, q), q.a, q.b)); });
    if (v12 % 12 || v12 === 0 || v12 / 12 > 400) return null; P.L = v12 / 12; P.cari = ['garis', 'parab', 'silang', 'kanan'].includes(fam); return Object.assign(P, ex || {});
  }
  const titikDari = (P, akar) => akar.map((s) => { const y = pv(P.k[0], s); return P.tipe === 'x' ? { x: s, y } : { x: y, y: s }; });
  /* selisih K(x − x1)(x − x2): luas = K d³ / 6 */
  function kuad(r, mode) {
    return cari(() => {
      const d = pil(r, [2, 3, 4, 5, 6]), x1 = rint(r, -3, 2), x2 = x1 + d;
      if (mode === 'parab') {
        const a2 = pil(r, [1, 2]), a1 = pil(r, [1, 2]), K = a1 + a2; if ((K * d * d * d) % 6) return null;
        const bw = [rint(r, -4, 4), rint(r, -6, 6), a2], at = pa(bw, [x1 * x2, -(x1 + x2), 1], -K);
        if (at.some((c) => Math.abs(c) > 14) || bw.some((c) => Math.abs(c) > 14)) return null; return { x1, x2, atas: at, bawah: bw, K };
      }
      const K = pil(r, [1, 2, 3, 6]); if ((K * d * d * d) % 6) return null; const tanda = r() < .5 ? 1 : -1, a = tanda * K, gr = [rint(r, -3, 5), rint(r, -3, 3)];
      const par = pa(gr, ps([x1 * x2, -(x1 + x2), 1], a), 1);
      if (par.some((c) => Math.abs(c) > 14) || (par[2] !== a)) return null; return { x1, x2, par, gr, tanda, atas: tanda > 0 ? gr : par, bawah: tanda > 0 ? par : gr, K };
    });
  }
  const GEN = {
    bawah(r) { return cari(() => { const s = pil(r, [4, 6, 8]), k = pil(r, [1, 2, 3]), a = rint(r, 0, s - 1), b = rint(r, a + 1, s); return mk('bawah', 'x', [[0, -k * s, k]], [{ u: -1, l: 0, a, b, w: 1 }]); }); },
    potong(r) {
      return cari(() => {
        const k = pil(r, [1, 2, 3]), r1 = rint(r, -2, 1), r2 = r1 + rint(r, 2, 4), c = pil(r, [r1, r2]), lain = c === r1 ? r2 : r1, a = c - rint(r, 1, 3), b = c + rint(r, 1, 3); if (lain > a && lain < b) return null;
        const p = [k * r1 * r2, -k * (r1 + r2), k], z = [[a, c], [c, b]].map(([s, e]) => { const pos = i12(p, s, e) > 0; return { u: pos ? 0 : -1, l: pos ? -1 : 0, a: s, b: e, w: pos ? 0 : 1 }; });
        if (!i12(p, a, c) || !i12(p, c, b)) return null; return mk('potong', 'x', [p], z, { c });
      });
    },
    garis(r) { return cari(() => { const h = kuad(r, 'garis'); return h && mk('garis', 'x', [h.par, h.gr], [{ u: h.tanda > 0 ? 1 : 0, l: h.tanda > 0 ? 0 : 1, a: h.x1, b: h.x2, w: 0 }], { titik: titikDari({ tipe: 'x', k: [h.par] }, [h.x1, h.x2]), akar: [h.x1, h.x2], K: h.K }); }); },
    parab(r) { return cari(() => { const h = kuad(r, 'parab'); return h && mk('parab', 'x', [h.atas, h.bawah], [{ u: 0, l: 1, a: h.x1, b: h.x2, w: 0 }], { titik: titikDari({ tipe: 'x', k: [h.atas] }, [h.x1, h.x2]), akar: [h.x1, h.x2], K: h.K }); }); },
    silang(r) {
      return cari(() => {
        const k = pil(r, [1, 2, 3, 4]), r1 = rint(r, -4, -1), r2 = r1 + rint(r, 1, 4), r3 = r2 + rint(r, 1, 4); if (r3 > 4) return null;
        const D = ps(pm(pm([-r1, 1], [-r2, 1]), [-r3, 1]), k), gr = [rint(r, -2, 2), rint(r, -2, 2)], f = pa(D, gr, 1); if (Math.abs(f[2]) > 9 || Math.abs(f[1]) > 16 || Math.abs(f[0]) > 20) return null;
        return mk('silang', 'x', [f, gr], [{ u: 0, l: 1, a: r1, b: r2, w: 0 }, { u: 1, l: 0, a: r2, b: r3, w: 0 }], { titik: titikDari({ tipe: 'x', k: [f] }, [r1, r2, r3]), akar: [r1, r2, r3], K: k });
      });
    },
    sumbuy(r) {
      return cari(() => {
        const f = rint(r, 0, 2), k = pil(r, [1, 2]); let Q, a, b, z;
        if (f === 0) { Q = [9 * k, 0, -k]; [a, b] = pil(r, [[-3, 3], [0, 3], [-3, 0]]); z = [{ u: 0, l: -1, a, b, w: 0 }]; }
        else if (f === 1) { Q = [0, 0, k]; a = 0; b = pil(r, [3, 6]); z = [{ u: 0, l: -1, a, b, w: 0 }]; }
        else { Q = [-9 * k, 0, k]; [a, b] = pil(r, [[-3, 3], [0, 3], [-3, 0]]); z = [{ u: -1, l: 0, a, b, w: 1 }]; }
        return mk('sumbuy', 'y', [Q], z, { kiri: f === 2 });
      });
    },
    kanan(r) { return cari(() => { const h = kuad(r, 'garis'); return h && mk('kanan', 'y', [h.par, h.gr], [{ u: h.tanda < 0 ? 0 : 1, l: h.tanda < 0 ? 1 : 0, a: h.x1, b: h.x2, w: 0 }], { titik: titikDari({ tipe: 'y', k: [h.par] }, [h.x1, h.x2]), akar: [h.x1, h.x2], K: h.K }); }); }
  };
  const buat = (fam, seed) => GEN[fam](mulberry((seed | 0) + 17));
  const wv = (P) => (P.tipe === 'x' ? 'y' : 'x'), vv = (P) => (P.tipe === 'x' ? 'x' : 'y');
  const eqP = (P, i) => wv(P) + '=' + tPoly(P.k[i], vv(P));
  const rentang = (P) => P.z[0].a + ',' + P.z[P.z.length - 1].b;
  /* kalimat soal luas daerah. o.titik = beri tahu titik potong; o.pendek = tanpa kalimat perintah */
  function tanyaP(P, o) {
    o = o || {}; const a = P.z[0].a, b = P.z[P.z.length - 1].b, v = vv(P), perintah = o.pendek ? '' : 'Hitunglah luas daerah yang dibatasi ';
    let s;
    if (P.fam === 'bawah' || P.fam === 'potong') s = perintah + 'kurva ' + M(eqP(P, 0)) + ', sumbu-' + M('x') + ', garis ' + M('x=' + a) + ', dan garis ' + M('x=' + b) + '.';
    else if (P.fam === 'sumbuy') s = perintah + 'kurva ' + M(eqP(P, 0)) + ', sumbu-' + M('y') + ', garis ' + M('y=' + a) + ', dan garis ' + M('y=' + b) + '.';
    else s = perintah + 'kedua kurva ' + M(eqP(P, 0)) + ' dan ' + M(eqP(P, 1)) + '.';
    if (o.titik && P.akar) s += ' Kedua kurva berpotongan di ' + M(v + '=' + P.akar.join(',\\;' + v + '=')) + '.';
    return s;
  }
  /* pembahasan langkah demi langkah (KaTeX) */
  function jelasP(P) {
    const v = vv(P), w = wv(P), h = []; const sam = P.cari ? pa(P.k[0], P.k[1], -1) : null;
    if (P.cari) h.push('<b>Titik potong.</b> Samakan kedua fungsi: ' + M(tPoly(P.k[0], v) + '=' + tPoly(P.k[1], v)) + ' ⇒ ' + M(tPoly(sam, v) + '=0') + ' ⇒ ' + M(P.akar.map((s) => v + '=' + s).join(',\\;')) + '.');
    P.z.forEach((q, i) => {
      const D = selisihZ(P, q), H = tHit(D, q.a, q.b, v), neg = H.nilai.n < 0;
      const nm = P.fam === 'bawah' ? 'Kurva di bawah sumbu-' + M(v) + ': hasil integral negatif, luas = −integral' : (P.fam === 'potong' ? 'Bagian ' + (i + 1) + (neg ? ' (di bawah sumbu, tanda minus)' : ' (di atas sumbu)') : (P.fam === 'silang' ? 'Bagian ' + (i + 1) + ' (' + (i ? 'garis' : 'kurva pertama') + ' di atas)' : (P.fam === 'kanan' || P.fam === 'sumbuy' ? 'Irisan datar: kanan − kiri' : 'Atas − bawah')));
      h.push('<b>' + nm + '.</b> ' + M('L' + (P.z.length > 1 ? '_{' + (i + 1) + '}' : '') + '=' + (neg ? '-' : '') + tInt(q.a, q.b, tPoly(D, v), v) + '=' + (neg ? '-' : '') + H.ev + '=' + (neg ? '-' : '') + tPar(H.val) + '=' + tAbs(H.nilai)));
    });
    h.push('<b>Luas</b> ' + (P.z.length > 1 ? M('=' + P.z.map((q) => tAbs(tHit(selisihZ(P, q), q.a, q.b, v).nilai)).join('+') + '=' + P.L) : M('=' + P.L)) + ' ' + NA + '.');
    return h.join('<br>');
  }

  /* =====================================================================================
     KARTU 3 · TITIK POTONG: dua kurva tanpa angka di sumbu, murid mencari titik potong dengan aljabar.
     Sama untuk satu kelompok (benih kelompok), berbeda antarkelompok.
     ===================================================================================== */
  const ptStr = (t) => '(' + t.x + ',' + t.y + ')';
  const daftarPt = (L) => L.map(ptStr).join('\\text{ dan }');
  function titikPotongSet(seed) {
    const out = [];
    ['garis', 'parab', 'silang'].forEach((fam, i) => {
      const r = mulberry((seed | 0) * 31 + i * 977 + 5), P = GEN[fam](r), t = P.titik, benar = daftarPt(t), cand = [];
      cand.push(daftarPt(t.map((p) => ({ x: -p.x, y: p.y }))));                                 // tanda x terbalik
      cand.push(daftarPt(t.map((p) => ({ x: p.y, y: p.x }))));                                  // x dan y tertukar
      cand.push(daftarPt(t.map((p, j) => (j === 0 ? { x: p.x + 1, y: pv(P.k[0], p.x + 1) } : p))));   // satu akar bergeser
      cand.push(daftarPt(t.map((p, j) => (j === t.length - 1 ? { x: p.x - 1, y: pv(P.k[0], p.x - 1) } : p))));
      cand.push(daftarPt(t.map((p) => ({ x: p.x, y: -p.y }))));
      cand.push(daftarPt(t.map((p) => ({ x: p.x + 1, y: pv(P.k[0], p.x + 1) }))));
      const o = opsiStr(benar, cand.filter((c) => c !== benar)); for (let j = 1; o.length < 5; j++) { const v = daftarPt(t.map((p) => ({ x: p.x + j + 1, y: pv(P.k[0], p.x + j + 1) }))); if (!o.includes(v)) o.push(v); }
      const urut = acak(r, o.map((_, k) => k)), opsi = urut.map((k) => M(o[k]));
      out.push({ no: i + 1, fam, P, tanya: 'Dua kurva ' + M(eqP(P, 0)) + ' dan ' + M(eqP(P, 1)) + ' digambar pada bidang koordinat (angka pada sumbu sengaja dihilangkan). Tentukan <b>semua titik potong</b> kedua kurva.', opsi, kunci: urut.indexOf(0),
        jelas: 'Di titik potong nilai ' + M('y') + ' kedua kurva sama, jadi samakan: ' + M(tPoly(P.k[0]) + '=' + tPoly(P.k[1])) + ' ⇒ ' + M(tPoly(pa(P.k[0], P.k[1], -1)) + '=0') + ' ⇒ ' + M(P.akar.map((s) => 'x=' + s).join(',\\;')) + '. Substitusikan ke salah satu fungsi (hasilnya sama): ' + P.titik.map((p) => M('y=' + p.y + '\\text{ untuk }x=' + p.x)).join(', ') + '. Titik potong: ' + M(benar) + '.' });
    });
    return out;
  }

  /* =====================================================================================
     KARTU 4 · BENTUK INTEGRAL: grafik lengkap dengan arsiran, pilih bentuk integral. Tujuh soal = tujuh materi.
     ===================================================================================== */
  const tI2 = (a, b, P, i, v) => tInt(a, b, tPoly(i, v || vv(P)), v || vv(P));
  function opsiBentuk(P) {
    const v = vv(P), z = P.z, z0 = z[0], D0 = selisihZ(P, z0), f = P.k[0], mn1 = (s) => '-' + s;
    let benar, salah = [];
    if (P.fam === 'bawah') {
      benar = mn1(tInt(z0.a, z0.b, tPoly(f))); salah = [tInt(z0.a, z0.b, tPoly(f)), mn1(tInt(z0.a, z0.b + 1, tPoly(f))), mn1(tInt(z0.a - 1, z0.b, tPoly(f))), mn1(tInt(z0.a, z0.b, tPoly(f), 'y'))];
    } else if (P.fam === 'potong') {
      const c = z0.b, s0 = z0.w ? '-' : '', s1 = z[1].w ? '-' : '', I = (a, b, d) => tInt(a, b, tPoly(f), d), flip = (s) => (s ? '' : '-');
      benar = s0 + I(z0.a, c) + (s1 ? '-' : '+') + I(c, z[1].b);
      salah = [I(z0.a, z[1].b), flip(s0) + I(z0.a, c) + (s1 ? '+' : '-') + I(c, z[1].b), I(z0.a, c) + '+' + I(c, z[1].b), s0 + I(z0.a, c + 1) + (s1 ? '-' : '+') + I(c + 1, z[1].b), s0 + I(z0.a, c, 'y') + (s1 ? '-' : '+') + I(c, z[1].b, 'y')];
    } else if (P.fam === 'silang') {
      const D1 = selisihZ(P, z[1]), I = (a, b, d) => tInt(a, b, tPoly(d)), a = z0.a, c = z0.b, b = z[1].b;
      benar = I(a, c, D0) + '+' + I(c, b, D1);
      salah = [I(a, b, D0), I(a, c, ps(D0, -1)) + '+' + I(c, b, ps(D1, -1)), I(a, c, D0) + '+' + I(c, b, D0), I(a, c + 1, D0) + '+' + I(c + 1, b, D1), I(a, c, D0) + '+' + I(c, b, D1).replace(/\\,dx$/, '\\,dy')];
    } else if (P.fam === 'sumbuy') {
      const neg = P.kiri, I = (a, b, e, d) => tInt(a, b, tPoly(e, 'y'), d || 'y');
      benar = (neg ? '-' : '') + I(z0.a, z0.b, f);
      salah = [(neg ? '' : '-') + I(z0.a, z0.b, f), (neg ? '-' : '') + tInt(z0.a, z0.b, tPoly(f, 'y'), 'x'), (neg ? '-' : '') + I(z0.a - 1, z0.b, f), (neg ? '-' : '') + I(z0.a, z0.b + 1, f), '2' + (neg ? '-' : '') + I(0, z0.b, f)];
    } else {   // garis, parab, kanan
      const I = (a, b, d, dv) => tInt(a, b, tPoly(d, v), dv || v);
      benar = I(z0.a, z0.b, D0);
      salah = [I(z0.a, z0.b, ps(D0, -1)), I(z0.a - 1, z0.b, D0), I(z0.a, z0.b, pa(kk(P, z0.u), kk(P, z0.l), 1)), I(z0.a, z0.b, D0, v === 'x' ? 'y' : 'x'), I(z0.a, z0.b + 1, D0)];
    }
    const uniq = [benar]; salah.forEach((s) => { if (!uniq.includes(s)) uniq.push(s); });
    return { benar, opsi: uniq.slice(0, 5) };
  }
  function bentukSet(seed) {
    return URUT.map((fam, i) => {
      const r = mulberry((seed | 0) * 53 + i * 1013 + 9), P = GEN[fam](r), { benar, opsi } = opsiBentuk(P), urut = acak(r, opsi.map((_, k) => k));
      return { no: i + 1, fam, P, tanya: 'Perhatikan grafik di samping. Penulisan integral tentu yang <b>tepat</b> untuk luas daerah yang diarsir adalah …', opsi: urut.map((k) => M(opsi[k])), kunci: urut.indexOf(0), jelas: jelasP(P) };
    });
  }

  /* =====================================================================================
     KARTU 5 · HITUNG LUAS: tiga soal dari materi yang sudah dipelajari kelompok (jawaban bilangan bulat).
     KARTU 6 · TIKET KELUAR: tiga soal bertingkat (mudah, sedang, sulit).
     ===================================================================================== */
  function luasSet(seed, fams) {
    const ada = (fams && fams.length ? fams : ['garis']).filter((f) => URUT.includes(f)), r = mulberry((seed | 0) * 71 + 3), urut = acak(r, ada), out = [];
    for (let i = 0; i < 3; i++) { const fam = urut[i % urut.length], P = buat(fam, (seed | 0) * 97 + i * 211 + Math.floor(i / urut.length) * 5003); out.push({ no: i + 1, fam, P, tanya: tanyaP(P), kunci: P.L, jelas: jelasP(P) }); }
    return out;
  }
  function tiketSet(seed) {
    const r = mulberry((seed | 0) * 41 + 11), q = pilihRuangSeed(r);
    const mudah = { tingkat: 'Mudah', tanya: 'Hitunglah ' + M(tInt(q.a, q.b, tPoly([q.c, q.q, q.p]))) + '.', kunci: Math.round((q.p / 3) * (Math.pow(q.b, 3) - Math.pow(q.a, 3)) + (q.q / 2) * (q.b * q.b - q.a * q.a) + q.c * (q.b - q.a)), jelas: '' };
    { const H = tHit([q.c, q.q, q.p], q.a, q.b); mudah.jelas = M(tInt(q.a, q.b, tPoly([q.c, q.q, q.p])) + '=' + H.ev + '=' + H.sub + '=' + H.val + '=' + H.res); }
    const Ps = buat('garis', (seed | 0) * 13 + 1), Pu = buat(pil(r, ['parab', 'silang', 'kanan']), (seed | 0) * 13 + 2);
    return [mudah, { tingkat: 'Sedang', P: Ps, tanya: tanyaP(Ps, { titik: true }), kunci: Ps.L, jelas: jelasP(Ps) }, { tingkat: 'Sulit', P: Pu, tanya: tanyaP(Pu), kunci: Pu.L, jelas: jelasP(Pu) }].map((x, i) => Object.assign({ no: i + 1 }, x));
  }
  function pilihRuangSeed(r) { return { p: pil(r, [3, 6]), q: pil(r, [-4, -2, 2, 4]), c: pil(r, [-2, -1, 1, 2, 3]), a: pil(r, [0, 1]), b: 2 + pil(r, [0, 1]) }; }
  /* benih per kelompok dan kartu (sama untuk seluruh anggota kelompok, berbeda antarkelompok) */
  function seedKelompok(kelas, g, kartu) { let h = 2166136261; const s = String(kelas) + ':' + g + ':' + kartu; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 1000003; }

  /* =====================================================================================
     LATIHAN KARTU BELAJAR KELOMPOK (satu materi, soal selalu baru): graf + soal + pembahasan
     ===================================================================================== */
  function latihan(fam, benih) { const P = buat(fam, benih); return { fam, P, tanya: tanyaP(P), kunci: P.L, jelas: jelasP(P) }; }

  /* =====================================================================================
     RAPOR: capaian kemajuan dan nilai kinerja (bukan skor permainan)
     ===================================================================================== */
  const BOBOT = { k3: 3, k4: 7, k5: 3, k6: 3 };
  function rapor(t2, tes) {
    t2 = t2 || {}; const g = (k) => (t2[k] && t2[k].benar) || 0, sel = (k) => !!(t2[k] && t2[k].selesai), kartu = [!!(t2.k1 && t2.k1.selesai), !!(t2.k2 && t2.k2.selesai), sel('k3'), sel('k4'), sel('k5'), sel('k6')];
    const bnr = g('k3') + g('k4') + g('k5') + g('k6'), tot = BOBOT.k3 + BOBOT.k4 + BOBOT.k5 + BOBOT.k6, nilai = Math.round(100 * bnr / tot), capaian = Math.round(100 * kartu.filter(Boolean).length / 6), awal = tes != null ? Math.round(100 * tes / JUMLAH_SOAL) : null;
    const predikat = nilai >= 85 ? 'Sangat baik' : (nilai >= 70 ? 'Baik' : (nilai >= 55 ? 'Cukup' : 'Perlu bimbingan'));
    return { kartu, capaian, nilai, predikat, benar: bnr, total: tot, awal, naik: awal == null ? null : nilai - awal, komponen: [['Titik potong', g('k3'), BOBOT.k3], ['Bentuk integral', g('k4'), BOBOT.k4], ['Hitung luas', g('k5'), BOBOT.k5], ['Tiket keluar', g('k6'), BOBOT.k6]] };
  }

  const api = { KELAS_CFG, KELAS_ID, KELAS_TAMPIL, cfg, setKelas, durasi, kelasAktif: () => AKTIF, URUT, NAMA_FAM, NPOS, bagianKelompok, PERAN, peranDariPos, kapasitasPeran, rute3, tamuHost, daftarKunjungan, DAFTAR: DAFTAR_ALL, DUMMY, PIN_SHA, cekPinLokal, nama, judulKata, JUMLAH_SOAL, soalSiswa, nilai, buatKode, bacaKode, bentukKelompok, tambahKelompok, ALFA,
    buat, tanyaP, jelasP, titikPotongSet, bentukSet, luasSet, tiketSet, latihan, seedKelompok, rapor, GEN, i12, pv, pa, ps, luas12, mulberry, acak, rint, pil, M, tPoly, tAnti, tInt, tEv, tHit, tR, tPar, tAbs, tSubst, selisihZ, eqP, kk, NA, BOBOT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BS = api;
})(typeof window !== 'undefined' ? window : globalThis);

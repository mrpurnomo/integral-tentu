/* Kode bersama (peramban + server): konfigurasi kelas, tujuh bagian materi (pos), rute jigsaw, soal tes awal acak per murid,
   generator soal cerita (jawaban bilangan bulat), bank "tebak" dan "cocokkan", kode hasil 5 karakter, pembentukan kelompok, poin.
   Materi: LUAS DAERAH DI BAWAH KURVA DAN ANTARA DUA KURVA (integral tentu, partisi dx dan dy). */
(function (root) {
  'use strict';
  const DAFTAR_ALL = (typeof module !== 'undefined' && module.exports) ? require('./daftar.js') : root.DAFTAR_KELAS;
  const judulKata = (s) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  const DUMMY = 30;                    // akun uji coba guru (tidak masuk kelompok dan statistik); harus > jumlah murid kelas mana pun
  /* PIN guru ada di api/_lib/rahasia.js (hanya server). Di sini hanya hash-nya, untuk masuk guru saat mode mandiri (tanpa server). */
  const PIN_SHA = 'd961f50b7e925eefbba1a3702b034dce926fd126f9f0ffe594fc1ffb7820f3e0';
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
     jigsaw:true   = satu bagian (pos) per kelompok + Pameran pakar dengan rute putaran; langkah = 6.
     tampil:false  = tidak muncul di pilihan kelas (kelas cadangan). */
  const KELAS_CFG = {
    xiia: { kode: 'xiia', nama: 'XII Matematika Lanjut', daftar: DAFTAR_ALL.xiia, durasi: 480, manual: false, jigsaw: true, langkah: 6, jmlKelompok: 7, maks: 3, tampil: true },
    xiib: { kode: 'xiib', nama: 'Kelas cadangan', daftar: DAFTAR_ALL.xiib, durasi: 480, manual: true, jigsaw: true, langkah: 6, jmlKelompok: 7, maks: 3, tampil: false }
  };
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

  /* ---------- polinom (larik koefisien [c0, c1, c2, …]), pecahan eksak, dan pemformat HTML ---------- */
  const pv = (p, x) => p.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
  const pm = (p, q) => { const o = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { o[i + j] += a * b; })); return o; };
  const pa = (p, q, k) => { const n = Math.max(p.length, q.length), o = []; for (let i = 0; i < n; i++) o[i] = (p[i] || 0) + (k == null ? 1 : k) * (q[i] || 0); return o; };
  const ps = (p, k) => p.map((c) => c * k);
  const i12 = (p, a, b) => p.reduce((s, c, n) => s + c * (12 / (n + 1)) * (Math.pow(b, n + 1) - Math.pow(a, n + 1)), 0);   // 12 × ∫ₐᵇ p (derajat ≤ 3, hasil bulat)
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const rt = (n, d) => { if (d == null) d = 1; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const rA = (x, y) => rt(x.n * y.d + y.n * x.d, x.d * y.d), rS = (x, y) => rt(x.n * y.d - y.n * x.d, x.d * y.d), rK = (x, k) => rt(x.n * k, x.d);
  const VAR = (v) => '<i>' + v + '</i>';
  const frak = (n, d) => '<span class="frak"><span class="at">' + n + '</span><span class="bw">' + d + '</span></span>';
  const rH = (x) => (x.d === 1 ? mn(x.n) : (x.n < 0 ? '−' : '') + frak(Math.abs(x.n), x.d));
  const rT = (x) => (x.d === 1 ? mn(x.n) : mn(x.n) + '/' + x.d);
  function fx(p, v) { v = v || 'x'; let s = ''; for (let n = p.length - 1; n >= 0; n--) { const c = p[n]; if (!c) continue; const a = Math.abs(c), kf = (a === 1 && n > 0) ? '' : String(a), vp = n === 0 ? '' : VAR(v) + (n > 1 ? '<sup>' + n + '</sup>' : ''), t = kf + vp; s += s ? (c < 0 ? ' − ' : ' + ') + t : (c < 0 ? '−' : '') + t; } return s || '0'; }
  const Fv = (p, v) => p.reduce((s, c, n) => rA(s, rt(c * Math.pow(v, n + 1), n + 1)), rt(0, 1));   // antiturunan di v (tanpa konstanta)
  function antiH(p, v) { v = v || 'x'; let s = ''; for (let n = p.length - 1; n >= 0; n--) { const c = p[n]; if (!c) continue; const q = rt(c, n + 1), neg = q.n < 0, a = rt(Math.abs(q.n), q.d), kf = (a.n === 1 && a.d === 1) ? '' : (a.d === 1 ? String(a.n) : frak(a.n, a.d)), t = kf + VAR(v) + (n + 1 > 1 ? '<sup>' + (n + 1) + '</sup>' : ''); s += s ? (neg ? ' − ' : ' + ') + t : (neg ? '−' : '') + t; } return s || '0'; }
  const evH = (inner, a, b) => '<span class="ev"><span class="ev-k">[</span>' + inner + '<span class="ev-k">]</span><span class="ev-l"><span>' + mn(b) + '</span><span>' + mn(a) + '</span></span></span>';
  const igH = (a, b) => '<span class="ig"><span class="ig-t">∫</span><span class="ig-l"><span>' + mn(b) + '</span><span>' + mn(a) + '</span></span></span>';
  const fak = (x0, v) => '(' + VAR(v || 'x') + (x0 < 0 ? ' + ' + (-x0) : (x0 === 0 ? '' : ' − ' + x0)) + ')';
  function hit(p, a, b, v) { const Fa = Fv(p, a), Fb = Fv(p, b), sel = rS(Fb, Fa); return { html: evH(antiH(p, v), a, b) + ' = (' + rH(Fb) + ') − (' + rH(Fa) + ') = ' + rH(sel), nilai: sel }; }
  const luas12 = (p, titik) => { let s = 0; for (let i = 0; i + 1 < titik.length; i++) s += Math.abs(i12(p, titik[i], titik[i + 1])); return s; };

  /* ---------- tujuh bagian materi = tujuh pos ---------- */
  const URUT = ['bawah', 'potong', 'garis', 'parab', 'silang', 'sumbuy', 'kanan'];
  const NAMA_FAM = { bawah: 'Di bawah sumbu-x', potong: 'Memotong sumbu-x', garis: 'Parabola dan garis', parab: 'Dua parabola', silang: 'Dua kurva bersilangan', sumbuy: 'Terhadap sumbu-y', kanan: 'Kanan dikurangi kiri' };
  const NPOS = URUT.length;
  const bagianKelompok = (k) => URUT[((k % NPOS) + NPOS) % NPOS];   // k = indeks kelompok 0-based → bagian (pos) kelompok itu
  /* peran menurut urutan anggota di kelompok (urutan 1 = peringkat tes tertinggi): Host (penjaga meja), Penjelajah A, Penjelajah B */
  const PERAN = [{ kode: 'jaga', sub: null, nama: 'Host', panjang: 'Host (penjaga meja)' }, { kode: 'kelana', sub: 'A', nama: 'Penjelajah A', panjang: 'Penjelajah A' }, { kode: 'kelana', sub: 'B', nama: 'Penjelajah B', panjang: 'Penjelajah B' }];
  const peranDariPos = (pos) => PERAN[Math.max(0, Math.min(2, pos | 0))];
  /* rute rotasi anti-tabrakan: kelompok g (1-based), penjelajah sub 'A'|'B', putaran r (1..3) → nomor pos yang dikunjungi */
  const ruteKelana = (g, sub, r) => ((g + r - 1 + (sub === 'B' ? 3 : 0)) % NPOS) + 1;
  const rute3 = (g, sub) => [1, 2, 3].map((r) => ruteKelana(g, sub, r));
  /* tamu di meja Host kelompok h pada putaran r: nomor kelompok Penjelajah A dan B yang datang */
  const tamuMeja = (h, r) => ({ A: ((((h - r - 1) % NPOS) + NPOS) % NPOS) + 1, B: ((((h - r - 4) % NPOS) + NPOS) % NPOS) + 1 });
  /* pos yang diajarkan Penjelajah sub kepada rekannya pada Transfer Ilmu (pos yang ia kunjungi) */
  const posAjar = (g, sub) => rute3(g, sub);
  /* pos yang dipelajari Penjelajah sub dari rekannya pada Transfer Ilmu: yang dikunjungi rekannya (A belajar dari B, B belajar dari A) */
  const posTerima = (g, sub) => rute3(g, sub === 'A' ? 'B' : 'A');

  /* ---------- tes awal: lima butir, tingkat kesulitan sama, angka berbeda per murid ---------- */
  function ambilOpsi(kunci, kandidat, fmt) {
    const set = []; [kunci].concat(kandidat).forEach((v) => { if (!set.some((x) => String(x) === String(v))) set.push(v); });
    let k = 1; while (set.length < 5) { const v = typeof kunci === 'number' ? kunci + (k % 2 ? k : -k) * 2 : kunci + k; if (!set.some((x) => String(x) === String(v))) set.push(v); k++; }
    return set.slice(0, 5).map(fmt || String);
  }
  const opsiStr = (kunci, kand) => { const s = [kunci]; kand.forEach((v) => { if (!s.includes(v)) s.push(v); }); return s.slice(0, 5); };
  const PT = (x, y) => '(' + mn(x) + ', ' + mn(y) + ')';
  function soalSiswa(idx) {
    const r = mulberry(7000 + idx * 7919), S = [];
    // 1. integral tentu dasar (antiturunan polinom)
    { const p = pil(r, [3, 6, 9]), q = pil(r, [-6, -4, -2, 2, 4, 6]), c = pil(r, [-3, -2, -1, 1, 2, 3, 4]), a = pil(r, [1, 2]), b = a + pil(r, [1, 2]);
      const f = [c, q, p], F = (x) => (p / 3) * x * x * x + (q / 2) * x * x + c * x, kunci = F(b) - F(a);
      const o = ambilOpsi(kunci, [F(b), F(a) - F(b), pv(f, b) - pv(f, a), p * b * b * b + q * b * b + c * b - (p * a * a * a + q * a * a + c * a), F(b) + F(a)], mn);
      S.push({ tanya: 'Hitunglah ' + igH(a, b) + ' (' + fx(f) + ') <i>dx</i>.', opsi: o, kunci: mn(kunci), jelas: 'Antiturunannya F(x) = ' + antiH(f) + '. Maka ' + hit(f, a, b).html + '. Ingat: hasilnya F(b) − F(a), bukan F(b) saja.' }); }
    // 2. nilai integral bisa negatif
    { const c = pil(r, [2, 3, 4, 5, 6]), v = rt(-2 * c * c * c, 3), pen = (z) => rT(z), kunci = pen(v);
      const o = opsiStr(kunci, [pen(rt(2 * c * c * c, 3)), pen(rt(c * c * c, 3)), pen(rt(-c * c * c, 1)), pen(rt(4 * c * c * c, 3)), pen(rt(-c * c * c, 3))]);
      S.push({ tanya: 'Hitunglah ' + igH(0, c) + ' (<i>x</i><sup>2</sup> − ' + (c * c) + ') <i>dx</i>.', opsi: o, kunci, jelas: 'Antiturunan ' + fx([-c * c, 0, 1]) + ' adalah ' + antiH([-c * c, 0, 1]) + '. ' + hit([-c * c, 0, 1], 0, c).html + '. Nilai integral boleh negatif: kurva berada di bawah sumbu-x.' }); }
    // 3. titik potong parabola dan garis (terhadap x)
    { const s = pil(r, [2, 3]), r1 = pil(r, [-2, -1]), r2 = s + 1 - r1, t = -r1 * r2, kunci = PT(r1, r1 + t) + ' dan ' + PT(r2, r2 + t);
      const o = opsiStr(kunci, [PT(r1 + t, r1) + ' dan ' + PT(r2 + t, r2), PT(-r1, -r1 + t) + ' dan ' + PT(-r2, -r2 + t), PT(r1, 0) + ' dan ' + PT(r2, 0), PT(r1, t) + ' dan ' + PT(r2, t)]);
      S.push({ tanya: 'Tentukan titik potong parabola <i>y</i> = ' + fx([0, -s, 1]) + ' dan garis <i>y</i> = ' + fx([t, 1]) + '.', opsi: o, kunci, jelas: 'Samakan: ' + fx([0, -s, 1]) + ' = ' + fx([t, 1]) + ' → ' + fx([-t, -(s + 1), 1]) + ' = 0 → ' + fak(r1) + fak(r2) + ' = 0, jadi x = ' + mn(r1) + ' atau x = ' + r2 + '. Masukkan x ke garis: y = ' + mn(r1 + t) + ' dan y = ' + (r2 + t) + '.' }); }
    // 4. titik potong parabola mendatar dan garis (terhadap y)
    { const k = pil(r, [1, 2]), d = pil(r, [1, 2, 3]), c = d + k * (k + 1), y1 = k, y2 = -(k + 1), kunci = PT(y1 + d, y1) + ' dan ' + PT(y2 + d, y2);
      const o = opsiStr(kunci, [PT(y1, y1 + d) + ' dan ' + PT(y2, y2 + d), PT(-y1 + d, -y1) + ' dan ' + PT(-y2 + d, -y2), PT(y1 + d, 0) + ' dan ' + PT(y2 + d, 0), PT(c, y1) + ' dan ' + PT(c, y2)]);
      S.push({ tanya: 'Tentukan titik potong parabola mendatar <i>x</i> = ' + c + ' − <i>y</i><sup>2</sup> dan garis <i>x</i> = ' + fx([d, 1], 'y') + '. (Tulis titik sebagai (x, y).)', opsi: o, kunci, jelas: 'Samakan x: ' + c + ' − y² = y + ' + d + ' → y² + y − ' + (c - d) + ' = 0 → ' + fak(y1, 'y') + fak(y2, 'y') + ' = 0. Jadi y = ' + y1 + ' atau y = ' + mn(y2) + '. Masukkan ke x = y + ' + d + ': titiknya ' + kunci + '.' }); }
    // 5. nilai integral ≠ luas daerah
    { const A = rint(r, 4, 9), Bn = rint(r, 2, 5), kunci = A + Bn;
      const o = ambilOpsi(kunci, [A - Bn, Bn - A, A, Bn, -(A + Bn)], mn);
      S.push({ tanya: 'Kurva <i>y</i> = <i>f</i>(<i>x</i>) di atas sumbu-x pada [0, 2] dengan ' + igH(0, 2) + ' <i>f</i>(<i>x</i>) <i>dx</i> = ' + A + ', dan di bawah sumbu-x pada [2, 4] dengan ' + igH(2, 4) + ' <i>f</i>(<i>x</i>) <i>dx</i> = ' + mn(-Bn) + '. Berapa satuan luas total daerah antara kurva dan sumbu-x pada [0, 4]?', opsi: o, kunci: mn(kunci), jelas: 'Luas tidak boleh negatif. Bagian di bawah sumbu-x dihitung dengan nilai mutlaknya: L = ' + A + ' + |' + mn(-Bn) + '| = ' + A + ' + ' + Bn + ' = ' + kunci + '. Kalau dijumlahkan begitu saja, hasilnya ' + (A - Bn) + ' (luas bertanda), bukan luas.' }); }
    return S.map((s, i) => { const rr = mulberry(31 + idx * 101 + i * 17), urut = acak(rr, s.opsi.map((_, k) => k)), opsi = urut.map((k) => s.opsi[k]); return { no: i + 1, tanya: s.tanya, opsi, kunci: opsi.indexOf(s.kunci), jelas: s.jelas }; });
  }
  function nilai(idx, jawab) { const so = soalSiswa(idx), hasil = so.map((s, i) => ({ no: i + 1, pilih: jawab[i] == null || jawab[i] === 5 ? null : jawab[i], benar: jawab[i] === s.kunci })); return { benar: hasil.filter((h) => h.benar).length, salah: hasil.filter((h) => !h.benar).length, hasil }; }

  /* ---------- kode hasil 5 karakter (4 data + 1 cek), alfabet tanpa 0 O 1 I ---------- */
  const ALFA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  function buatKode(idx, jawab) { let a = 0, kali = 1; for (let i = 0; i < 5; i++) { const v = jawab[i] == null ? 5 : jawab[i]; a += v * kali; kali *= 6; } let n = idx + 31 * a, s = ''; for (let i = 0; i < 4; i++) { s = ALFA[n % 32] + s; n = Math.floor(n / 32); } let c = 0; for (let i = 0; i < 4; i++) c += (ALFA.indexOf(s[i]) + 1) * (2 * i + 3); return s + ALFA[c % 32]; }
  function bacaKode(kode) {
    const k = String(kode || '').toUpperCase().replace(/[^A-Z2-9]/g, ''); if (k.length !== 5) return { error: 'Kode harus 5 karakter' };
    let c = 0, n = 0; for (let i = 0; i < 4; i++) { const p = ALFA.indexOf(k[i]); if (p < 0) return { error: 'Karakter kode tidak dikenali' }; c += (p + 1) * (2 * i + 3); n = n * 32 + p; }
    if (ALFA[c % 32] !== k[4]) return { error: 'Kode salah ketik (karakter terakhir tidak cocok)' };
    const idx = n % 31; let a = Math.floor(n / 31); if (a >= 7776) return { error: 'Kode tidak valid' };
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
     SOAL CERITA (kartu pakar dan pameran): jawaban = luas daerah, selalu BILANGAN BULAT.
     Parameter dicari dengan rejection sampling dan diperiksa eksak (pecahan) sehingga luas bulat.
     ===================================================================================== */
  const NA = 'satuan luas';
  const dx = VAR('dx'), dy = VAR('dy');
  const sebut = (p, v) => VAR(v || 'y') + ' = ' + fx(p, v === 'y' || v == null ? 'x' : v);
  const kurvaX = (p) => VAR('y') + ' = ' + fx(p, 'x'), kurvaY = (p) => VAR('x') + ' = ' + fx(p, 'y');
  const cerita = (r, a, b) => (rint(r, 0, 1) ? b : a);

  function gBawah(r) {
    const h = cari(() => { const s = pil(r, [4, 6, 8]), k = pil(r, [1, 2, 3]), a = rint(r, 0, s - 1), b = rint(r, a + 1, s), p = [0, -k * s, k], v = i12(p, a, b); return v < 0 && (-v) % 12 === 0 && -v / 12 <= 400 ? { a, b, p, L: -v / 12 } : null; });
    const { a, b, p, L } = h, t = rint(r, 0, 1), H = hit(p, a, b);
    const tanya = (t ? 'Lengkung bawah jembatan kayu di kawasan mangrove: tinggi lengkung dari lantai jembatan (meter) adalah ' + kurvaX(p) + '. Nilai negatif karena lengkung berada di bawah lantai. ' : 'Dasar sebuah parit di tambak diukur dari permukaan tanah (meter): ' + kurvaX(p) + '. Nilai negatif berarti di bawah permukaan tanah. ') + 'Berapa luas daerah (m²) yang dibatasi kurva, sumbu-<i>x</i>, garis <i>x</i> = ' + a + ', dan <i>x</i> = ' + b + '?';
    return { det: { f: p, g: [0], a, b }, kunci: L, tanya, jelas: 'Pada [' + a + ', ' + b + '] nilai ' + fx(p) + ' ≤ 0, jadi kurva berada di bawah sumbu-x. Luas = −' + igH(a, b) + ' (' + fx(p) + ') ' + dx + '.<br>' + H.html + '.<br>Luas = −(' + rH(H.nilai) + ') = <b>' + L + '</b> ' + NA + '. Tanda minus di depan integral membuat luasnya positif.' };
  }
  function gPotong(r) {
    const h = cari(() => {
      const k = pil(r, [1, 2, 3]), r1 = rint(r, -2, 1), r2 = r1 + rint(r, 2, 4), c = pil(r, [r1, r2]), lain = c === r1 ? r2 : r1, a = c - rint(r, 1, 3), b = c + rint(r, 1, 3);
      if (lain > a && lain < b) return null; const p = [k * r1 * r2, -k * (r1 + r2), k], v = luas12(p, [a, c, b]);
      return v % 12 === 0 && v / 12 <= 300 && i12(p, a, c) !== 0 && i12(p, c, b) !== 0 ? { p, a, b, c, L: v / 12 } : null;
    });
    const { p, a, b, c, L } = h, H1 = hit(p, a, c), H2 = hit(p, c, b), t = rint(r, 0, 1);
    const tanya = (t ? 'Tinggi tanggul pesisir terhadap permukaan air laut (meter) dirumuskan ' : 'Tinggi permukaan tanah di pesisir terhadap permukaan air (meter) dirumuskan ') + kurvaX(p) + '. Nilai negatif berarti di bawah permukaan air, nilai positif di atasnya. Berapa luas daerah (m²) yang dibatasi kurva, sumbu-<i>x</i>, <i>x</i> = ' + a + ', dan <i>x</i> = ' + b + '? (Jumlahkan bagian di bawah dan di atas sumbu.)';
    const s1 = H1.nilai.n < 0 ? '−' : '', s2 = H2.nilai.n < 0 ? '−' : '';
    return { det: { f: p, g: [0], a, b }, kunci: L, tanya, jelas: 'Kurva memotong sumbu-x di x = ' + c + ' (di dalam [' + a + ', ' + b + ']), jadi integral dipecah di x = ' + c + '.<br>Bagian 1: ' + igH(a, c) + ' (' + fx(p) + ') ' + dx + ' = ' + H1.html + (H1.nilai.n < 0 ? ' (negatif → luasnya ' + rH(rt(-H1.nilai.n, H1.nilai.d)) + ')' : '') + '.<br>Bagian 2: ' + igH(c, b) + ' (' + fx(p) + ') ' + dx + ' = ' + H2.html + (H2.nilai.n < 0 ? ' (negatif → luasnya ' + rH(rt(-H2.nilai.n, H2.nilai.d)) + ')' : '') + '.<br>Luas = ' + rH(rt(Math.abs(H1.nilai.n), H1.nilai.d)) + ' + ' + rH(rt(Math.abs(H2.nilai.n), H2.nilai.d)) + ' = <b>' + L + '</b> ' + NA + '. (Tanpa dipecah, bagian negatif dan positif saling mengurangi.)' };
  }
  /* parabola dan garis / dua parabola / kanan − kiri: selisih = K(x − x1)(x − x2), luas = K d³ / 6 */
  function kuad(r, mode) {
    const v = mode === 'kanan' ? 'y' : 'x';
    return cari(() => {
      const d = pil(r, [2, 3, 4, 5, 6]), x1 = rint(r, -3, 2), x2 = x1 + d;
      if (mode === 'parab') {
        const a2 = pil(r, [1, 2]), a1 = pil(r, [1, 2]), K = a1 + a2; if ((K * d * d * d) % 6) return null;
        const bw = [rint(r, -4, 4), rint(r, -6, 6), a2], at = pa(bw, [x1 * x2, -(x1 + x2), 1], -K);   // atas = bawah − K(x − x1)(x − x2)
        if (at.some((c) => Math.abs(c) > 14) || bw.some((c) => Math.abs(c) > 14)) return null; return { v, x1, x2, atas: at, bawah: bw, L: K * d * d * d / 6, K };
      }
      const K = pil(r, [1, 2, 3, 6]); if ((K * d * d * d) % 6) return null; const tanda = r() < .5 ? 1 : -1, a = tanda * K, gr = [rint(r, -3, 5), rint(r, -3, 3)];
      const par = pa(gr, ps([x1 * x2, -(x1 + x2), 1], a), 1);                  // parabola = garis + a(x − x1)(x − x2)
      if (par.some((c) => Math.abs(c) > 14) || (par[2] !== a)) return null;
      return { v, x1, x2, par, gr, tanda, atas: tanda > 0 ? gr : par, bawah: tanda > 0 ? par : gr, L: K * d * d * d / 6, K };
    });
  }
  function gGaris(r) {
    const h = kuad(r, 'garis'), { x1, x2, par, gr, atas, bawah, L } = h, D = pa(atas, bawah, -1), H = hit(D, x1, x2), t = rint(r, 0, 1), samakan = pa(par, gr, -1);
    const tanya = (t ? 'Sebuah kolam dibatasi dinding lengkung ' : 'Sebuah taman dibatasi tepi lengkung ') + kurvaX(par) + ' dan jalan lurus ' + kurvaX(gr) + ' (satuan meter). Berapa luas daerah (m²) yang dibatasi kedua kurva itu?';
    return { det: { f: atas, g: bawah, a: x1, b: x2 }, kunci: L, tanya, jelas: 'Titik potong: samakan ' + fx(par) + ' = ' + fx(gr) + ' → ' + fx(samakan) + ' = 0 → ' + (Math.abs(samakan[2]) > 1 ? Math.abs(samakan[2]) : '') + fak(x1) + fak(x2) + ' = 0, jadi x = ' + mn(x1) + ' dan x = ' + x2 + '.<br>Uji x = ' + (x1 + 1) + ': garis = ' + mn(pv(gr, x1 + 1)) + ', parabola = ' + mn(pv(par, x1 + 1)) + ' → ' + (h.tanda > 0 ? 'garis di atas' : 'parabola di atas') + '.<br>L = ' + igH(x1, x2) + ' (atas − bawah) ' + dx + ' = ' + igH(x1, x2) + ' (' + fx(D) + ') ' + dx + '<br>' + H.html + ' = <b>' + L + '</b> ' + NA + '.' };
  }
  function gParab(r) {
    const h = kuad(r, 'parab'), { x1, x2, atas, bawah, L } = h, D = pa(atas, bawah, -1), H = hit(D, x1, x2), t = rint(r, 0, 1), samakan = pa(atas, bawah, -1);
    const tanya = (t ? 'Dua lengkungan jembatan bertemu membentuk lubang air: ' : 'Sebuah tambak berbentuk lensa dibatasi dua tepi lengkung: ') + kurvaX(atas) + ' (atas) dan ' + kurvaX(bawah) + ' (bawah), satuan meter. Berapa luas daerah (m²) yang dibatasi kedua kurva itu?';
    return { det: { f: atas, g: bawah, a: x1, b: x2 }, kunci: L, tanya, jelas: 'Titik potong: samakan ' + fx(atas) + ' = ' + fx(bawah) + ' → ' + fx(samakan) + ' = 0 → ' + (Math.abs(samakan[2]) > 1 ? Math.abs(samakan[2]) : '') + fak(x1) + fak(x2) + ' = 0, jadi x = ' + mn(x1) + ' dan x = ' + x2 + '.<br>Parabola yang membuka ke bawah berada di atas. L = ' + igH(x1, x2) + ' (atas − bawah) ' + dx + ' = ' + igH(x1, x2) + ' (' + fx(D) + ') ' + dx + '<br>' + H.html + ' = <b>' + L + '</b> ' + NA + '.' };
  }
  function gSilang(r) {
    const h = cari(() => {
      const k = pil(r, [1, 2, 3, 4]), r1 = rint(r, -4, -1), r2 = r1 + rint(r, 1, 4), r3 = r2 + rint(r, 1, 4); if (r3 > 4) return null;
      const D = ps(pm(pm([-r1, 1], [-r2, 1]), [-r3, 1]), k), gr = [rint(r, -2, 2), rint(r, -2, 2)], f = pa(D, gr, 1);
      if (Math.abs(f[2]) > 9 || Math.abs(f[1]) > 16 || Math.abs(f[0]) > 20) return null;
      const v = Math.abs(i12(D, r1, r2)) + Math.abs(i12(D, r2, r3)); return v % 12 === 0 && v / 12 <= 300 && v > 0 ? { r1, r2, r3, D, gr, f, L: v / 12, k } : null;
    });
    const { r1, r2, r3, D, gr, f, L, k } = h, H1 = hit(D, r1, r2), H2 = hit(D, r2, r3), samakan = D;
    const tanya = 'Sebuah tanggul berbentuk ' + kurvaX(f) + ' dan jalan lurus ' + kurvaX(gr) + ' (satuan meter) saling bersilangan. Berapa luas total daerah tertutup (m²) yang dibatasi kedua kurva itu?';
    return { det: { f, g: gr, a: r1, b: r3 }, kunci: L, tanya, jelas: 'Titik potong: samakan kedua persamaan → ' + fx(samakan) + ' = 0 → ' + (k > 1 ? k : '') + fak(r1) + fak(r2) + fak(r3) + ' = 0, jadi x = ' + mn(r1) + ', ' + mn(r2) + ', dan ' + r3 + '.<br>Posisi atas–bawah bertukar di x = ' + r2 + ': pada [' + mn(r1) + ', ' + r2 + '] kurva pertama di atas garis, pada [' + r2 + ', ' + r3 + '] garis di atas.<br>L = ' + igH(r1, r2) + ' (' + fx(D) + ') ' + dx + ' + ' + igH(r2, r3) + ' (' + fx(ps(D, -1)) + ') ' + dx + ' = ' + rH(H1.nilai) + ' + ' + rH(rt(-H2.nilai.n, H2.nilai.d)) + ' = <b>' + L + '</b> ' + NA + '.' };
  }
  function gSumbuY(r) {
    const h = cari(() => {
      const f = rint(r, 0, 2), k = pil(r, [1, 2]); let Q, a, b, kata;
      if (f === 0) { Q = [9 * k, 0, -k]; [a, b] = pil(r, [[-3, 3], [0, 3], [-3, 0]]); kata = a === -3 && b === 3 ? 'penuh' : 'bagian'; }
      else if (f === 1) { Q = [0, 0, k]; a = 0; b = pil(r, [3, 6]); kata = 'bagian'; }
      else { Q = [-9 * k, 0, k]; [a, b] = pil(r, [[-3, 3], [0, 3], [-3, 0]]); kata = a === -3 && b === 3 ? 'penuh' : 'bagian'; }
      const v = luas12(Q, (f === 1 ? [a, b] : (a === -3 && b === 3 ? [-3, 0, 3] : [a, b])));
      return v % 12 === 0 && v / 12 <= 400 && v > 0 ? { Q, a, b, f, k, kata, L: v / 12 } : null;
    });
    const { Q, a, b, f, kata, L } = h, kanan = f !== 2, t = rint(r, 0, 1);
    const batas = (kata === 'penuh') ? ' dan sumbu-<i>y</i>' : ', sumbu-<i>y</i>, garis <i>y</i> = ' + a + ', dan <i>y</i> = ' + b;
    const tanya = (t ? 'Sebuah petak mangrove di tepi jalan (sumbu-<i>y</i> = tepi jalan) dibatasi lengkung ' : 'Sebuah petak tambak di samping sungai lurus (sumbu-<i>y</i> = tepi sungai) dibatasi lengkung ') + kurvaY(Q) + ' (satuan meter). Berapa luas petak (m²) yang dibatasi kurva' + batas + '?';
    const titik = (kata === 'penuh') ? [a, 0, b] : [a, b];
    const bagian = titik.slice(0, -1).map((u, i) => hit(Q, u, titik[i + 1], 'y')), pot = (kata === 'penuh');
    let isi = 'Irisan datar (Δy), sebab batasnya sumbu-y. ' + (kanan ? 'Pada daerah ini x ≥ 0 (kurva di kanan sumbu-y), jadi L = ' + igH(a, b) + ' (' + fx(Q, 'y') + ') ' + dy + '.' : 'Pada daerah ini x ≤ 0 (kurva di kiri sumbu-y), jadi L = −' + igH(a, b) + ' (' + fx(Q, 'y') + ') ' + dy + '.');
    if (pot) { const H = hit(Q, 0, b, 'y'); isi += '<br>Daerahnya simetris terhadap sumbu-x, jadi L = 2 × ' + (kanan ? '' : '−') + igH(0, b) + ' (' + fx(Q, 'y') + ') ' + dy + '<br>' + H.html + '<br>L = 2 × ' + rH(kanan ? H.nilai : rt(-H.nilai.n, H.nilai.d)) + ' = <b>' + L + '</b> ' + NA + '.'; }
    else { const H = bagian[0]; isi += '<br>' + H.html + (kanan ? '' : '<br>L = −(' + rH(H.nilai) + ')') + ' = <b>' + L + '</b> ' + NA + '.'; }
    return { det: { f: Q, g: [0], a, b }, kunci: L, tanya, jelas: isi };
  }
  function gKanan(r) {
    const h = kuad(r, 'kanan'), { x1: y1, x2: y2, par, gr, tanda, L } = h, kn = tanda < 0 ? par : gr, kr = tanda < 0 ? gr : par, D = pa(kn, kr, -1), H = hit(D, y1, y2, 'y'), samakan = pa(par, gr, -1), t = rint(r, 0, 1);
    const tanya = (t ? 'Dua kanal di tambak digambar pada bidang koordinat (satuan meter): ' : 'Sebuah petak mangrove dibatasi dua tepi (satuan meter): ') + kurvaY(par) + ' dan ' + kurvaY(gr) + '. Berapa luas daerah (m²) yang dibatasi kedua kurva itu?';
    return { det: { f: kn, g: kr, a: y1, b: y2 }, kunci: L, tanya, jelas: 'Kedua persamaan berbentuk x = …, jadi irisannya datar (Δy). Titik potong: samakan x → ' + fx(samakan, 'y') + ' = 0 → ' + (Math.abs(samakan[2]) > 1 ? Math.abs(samakan[2]) : '') + fak(y1, 'y') + fak(y2, 'y') + ' = 0, jadi y = ' + mn(y1) + ' dan y = ' + y2 + '.<br>Uji y = ' + (y1 + 1) + ': kurva ' + (tanda < 0 ? 'parabola' : 'garis') + ' lebih ke kanan.<br>L = ' + igH(y1, y2) + ' (x<sub>kanan</sub> − x<sub>kiri</sub>) ' + dy + ' = ' + igH(y1, y2) + ' (' + fx(D, 'y') + ') ' + dy + '<br>' + H.html + ' = <b>' + L + '</b> ' + NA + '.' };
  }
  const GEN = { bawah: gBawah, potong: gPotong, garis: gGaris, parab: gParab, silang: gSilang, sumbuy: gSumbuY, kanan: gKanan };
  function tantanganAcak(fam, seed) { const r = mulberry(seed | 0); return GEN[fam](r); }

  /* =====================================================================================
     BANK "TEBAK" (diskusi kelompok) DAN "COCOKKAN": cerita + tabel nilai dua tepi daerah, tanpa gambar jawaban.
     Tabel dibuat dari polinom sehingga selalu konsisten dengan gambar yang muncul lewat tombol "Lihat gambarnya".
     spec: { tipe:'x'|'y', k:[polinom…], z:[{u,l,a,b,w}] } u,l = indeks kurva atas/bawah (kanan/kiri), -1 = sumbu; w: 0 positif, 1 negatif.
     ===================================================================================== */
  function butir(o) {
    const sp = o.spec, nilaiKol = (ci, v) => (ci < 0 ? 0 : pv(sp.k[ci], v));
    return Object.assign({}, o, { baris: o.rows.map((v) => [mn(v)].concat(o.pakai.map((ci) => mn(nilaiKol(ci, v))))), alasan: o.alasan });
  }
  const X1 = (p, a, b) => ({ tipe: 'x', k: p, z: [{ u: 0, l: 1, a, b, w: 0 }] });
  const SITUASI = [
    butir({ fam: 'bawah', judul: 'Parit di tambak', teks: 'Dasar sebuah parit diukur dari permukaan tanah. Tanda minus berarti di bawah permukaan tanah. Berapa luas penampang parit antara x = 1 dan x = 3?', kol: ['x (m)', 'kedalaman (m)'], pakai: [0], rows: [0, 1, 2, 3, 4], spec: { tipe: 'x', k: [[0, -4, 1]], z: [{ u: -1, l: 0, a: 1, b: 3, w: 1 }] }, alasan: 'Semua nilai kedalaman negatif (−3, −4, −3): kurva berada di bawah sumbu-x. Luas = −∫ f(x) dx, atau ∫ (0 − f(x)) dx, supaya hasilnya positif.' }),
    butir({ fam: 'potong', judul: 'Profil tanah di pesisir', teks: 'Tinggi tanah terhadap permukaan air laut. Dari lembah di bawah air naik menjadi tanggul di atas air. Berapa luas penampang antara x = 0 dan x = 4?', kol: ['x (m)', 'tinggi (m)'], pakai: [0], rows: [0, 1, 2, 3, 4], spec: { tipe: 'x', k: [[-3, -2, 1]], z: [{ u: -1, l: 0, a: 0, b: 3, w: 1 }, { u: 0, l: -1, a: 3, b: 4, w: 0 }] }, alasan: 'Nilainya berganti dari negatif (−3, −4, −3) ke nol di x = 3, lalu positif (5). Kurva memotong sumbu-x, jadi integral harus dipecah di x = 3 agar bagian negatif dan positif tidak saling meniadakan.' }),
    butir({ fam: 'garis', judul: 'Taman dengan jalan lurus', teks: 'Sebuah taman dibatasi jalan lurus di bagian atas dan tepi lengkung di bagian bawah. Kedua tepi bertemu di dua titik.', kol: ['x (m)', 'tepi atas (m)', 'tepi bawah (m)'], pakai: [1, 0], rows: [1, 2, 3, 4], spec: { tipe: 'x', k: [[3, -4, 1], [-1, 1]], z: [{ u: 1, l: 0, a: 1, b: 4, w: 0 }] }, alasan: 'Tepi atas naik rata (0, 1, 2, 3) sedangkan tepi bawah melengkung (0, −1, 0, 3). Keduanya sama di x = 1 dan x = 4: itu batas integral. Satu tepi lurus dan satu melengkung: parabola dan garis. Luas = ∫ (atas − bawah) dx.' }),
    butir({ fam: 'parab', judul: 'Kolam berbentuk lensa', teks: 'Dua tepi lengkung membentuk kolam seperti lensa. Tepi atas membuka ke bawah, tepi bawah membuka ke atas.', kol: ['x (m)', 'tepi atas (m)', 'tepi bawah (m)'], pakai: [0, 1], rows: [0, 1, 2, 3], spec: { tipe: 'x', k: [[0, 4, -1], [0, -2, 1]], z: [{ u: 0, l: 1, a: 0, b: 3, w: 0 }] }, alasan: 'Kedua tepi melengkung (atas: 0, 3, 4, 3; bawah: 0, −1, 0, 3) dan sama di x = 0 dan x = 3. Dua parabola: luas = ∫ (parabola atas − parabola bawah) dx dari 0 sampai 3.' }),
    butir({ fam: 'silang', judul: 'Dua jalur yang bersilangan', teks: 'Jalur A dan jalur B saling memotong di tiga tempat. Di antara titik-titik itu, jalur mana yang lebih tinggi bergantian.', kol: ['x (m)', 'jalur A (m)', 'jalur B (m)'], pakai: [0, 1], rows: [-2, -1, 0, 1, 2], spec: { tipe: 'x', k: [[0, -3, 0, 1], [0, 1]], z: [{ u: 0, l: 1, a: -2, b: 0, w: 0 }, { u: 1, l: 0, a: 0, b: 2, w: 1 }] }, alasan: 'Di x = −1 jalur A lebih tinggi (2 > −1), di x = 1 jalur B lebih tinggi (1 > −2). Sama di x = −2, 0, dan 2. Atas dan bawah bertukar di x = 0, jadi integral dipecah dua: ∫ dari −2 sampai 0 (A − B) ditambah ∫ dari 0 sampai 2 (B − A).' }),
    butir({ fam: 'sumbuy', judul: 'Petak mangrove di tepi jalan', teks: 'Jalan lurus membentang ke atas (sumbu-y). Jarak tepi petak mangrove dari jalan diukur untuk beberapa ketinggian y. Bagian pinggirnya berupa lengkung, sedangkan tepi satunya adalah jalan itu sendiri.', kol: ['y (m)', 'jarak dari jalan x (m)'], pakai: [0], rows: [-2, -1, 0, 1, 2], spec: { tipe: 'y', k: [[4, 0, -1]], z: [{ u: 0, l: -1, a: -2, b: 2, w: 0 }] }, alasan: 'Tepi petak dinyatakan x sebagai fungsi y (0, 3, 4, 3, 0), dan salah satu batasnya jalan (sumbu-y, x = 0). Irisan datar (Δy) lebih mudah: L = ∫ x dy dari y = −2 sampai y = 2.' }),
    butir({ fam: 'kanan', judul: 'Dua kanal berdampingan', teks: 'Dua kanal digambar pada bidang koordinat. Posisi kanal dicatat sebagai x untuk tiap ketinggian y. Daerah di antara kedua kanal akan ditanami.', kol: ['y (m)', 'kanal kanan (m)', 'kanal kiri (m)'], pakai: [1, 0], rows: [-1, 0, 1, 2], spec: { tipe: 'y', k: [[-2, 0, 1], [0, 1]], z: [{ u: 1, l: 0, a: -1, b: 2, w: 0 }] }, alasan: 'Kedua tepi dicatat sebagai x untuk tiap y, dan di setiap y kanal kanan selalu di kanan kanal kiri (−1 ≥ −1, 0 ≥ −2, 1 ≥ −1, 2 ≥ 2). Irisan datar: L = ∫ (x kanan − x kiri) dy dari y = −1 sampai y = 2.' }),
    butir({ fam: 'kanan', judul: 'Dua tepi sawah pasang surut', teks: 'Dua tepi sawah dicatat sebagai x untuk tiap ketinggian y. Tepi pertama melengkung ke kiri, tepi kedua lurus miring.', kol: ['y (m)', 'tepi kanan (m)', 'tepi kiri (m)'], pakai: [0, 1], rows: [-2, -1, 0, 1], spec: { tipe: 'y', k: [[3, 0, -1], [1, 1]], z: [{ u: 0, l: 1, a: -2, b: 1, w: 0 }] }, alasan: 'Kedua tepi dicatat x untuk tiap y (kanan: −1, 2, 3, 2; kiri: −1, 0, 1, 2) dan sama di y = −2 dan y = 1. Karena x bergantung pada y, irisan datar (Δy) dipakai: L = ∫ (x kanan − x kiri) dy.' }),
    butir({ fam: 'bawah', judul: 'Dasar bak penampung', teks: 'Dasar sebuah bak penampung air diukur dari bibir bak. Tanda minus berarti di bawah bibir bak.', kol: ['x (m)', 'kedalaman (m)'], pakai: [0], rows: [-2, -1, 0, 1, 2], spec: { tipe: 'x', k: [[-4, 0, 1]], z: [{ u: -1, l: 0, a: -2, b: 2, w: 1 }] }, alasan: 'Semua kedalaman negatif atau nol (0, −3, −4, −3, 0): kurva di bawah sumbu-x. Luas = −∫ f(x) dx supaya positif.' })
  ];
  const DISKUSI = [
    butir({ fam: 'bawah', judul: 'Dasar sungai kecil', konteks: 'Dasar sebuah sungai kecil diukur dari permukaan air. Angka negatif artinya di bawah permukaan air.', kol: ['x (m)', 'kedalaman (m)'], pakai: [0], rows: [1, 2, 3, 4, 5], spec: { tipe: 'x', k: [[0, -6, 1]], z: [{ u: -1, l: 0, a: 1, b: 5, w: 1 }] }, alasan: 'Semua kedalaman negatif (−5, −8, −9, −8, −5): kurva berada di bawah sumbu-x. Luas daerah = −∫ f(x) dx.' }),
    butir({ fam: 'potong', judul: 'Tanggul dan lembah', konteks: 'Tinggi tanah di sepanjang sebuah jalur diukur dari muka air. Di awal jalur tanah lebih rendah dari muka air, lalu naik.', kol: ['x (m)', 'tinggi (m)'], pakai: [0], rows: [0, 1, 2, 3], spec: { tipe: 'x', k: [[-2, -1, 1]], z: [{ u: -1, l: 0, a: 0, b: 2, w: 1 }, { u: 0, l: -1, a: 2, b: 3, w: 0 }] }, alasan: 'Nilainya negatif dulu (−2, −2), nol di x = 2, lalu positif (4). Kurva memotong sumbu-x, sehingga integral dipecah di x = 2.' }),
    butir({ fam: 'garis', judul: 'Kolam dengan pematang lurus', konteks: 'Sebuah kolam dibatasi pematang lurus di atas dan dinding lengkung di bawah.', kol: ['x (m)', 'pematang (m)', 'dinding (m)'], pakai: [1, 0], rows: [-1, 0, 1, 2], spec: { tipe: 'x', k: [[-1, 0, 1], [1, 1]], z: [{ u: 1, l: 0, a: -1, b: 2, w: 0 }] }, alasan: 'Pematang naik rata (0, 1, 2, 3), dinding melengkung (0, −1, 0, 3), dan keduanya sama di x = −1 dan x = 2. Satu garis lurus dan satu parabola: luas = ∫ (garis − parabola) dx.' }),
    butir({ fam: 'parab', judul: 'Kebun di antara dua pagar lengkung', konteks: 'Dua pagar lengkung mengapit sebuah kebun. Pagar atas membuka ke bawah, pagar bawah membuka ke atas.', kol: ['x (m)', 'pagar atas (m)', 'pagar bawah (m)'], pakai: [0, 1], rows: [-2, -1, 0, 1, 2], spec: { tipe: 'x', k: [[6, 0, -1], [-2, 0, 1]], z: [{ u: 0, l: 1, a: -2, b: 2, w: 0 }] }, alasan: 'Kedua pagar melengkung (atas: 2, 5, 6, 5, 2; bawah: 2, −1, −2, −1, 2) dan bertemu di x = −2 dan x = 2. Dua parabola: luas = ∫ (parabola atas − parabola bawah) dx.' }),
    butir({ fam: 'silang', judul: 'Jalur kabel yang bersilangan', konteks: 'Dua kabel melintang bersilangan di tiga tempat. Kabel yang lebih tinggi bergantian.', kol: ['x (m)', 'kabel P (m)', 'kabel Q (m)'], pakai: [0, 1], rows: [-2, -1, 0, 1, 2], spec: { tipe: 'x', k: [[0, 0, 0, 1], [0, 4]], z: [{ u: 0, l: 1, a: -2, b: 0, w: 0 }, { u: 1, l: 0, a: 0, b: 2, w: 1 }] }, alasan: 'Kedua kabel sama di x = −2, 0, dan 2. Di x = −1, kabel P lebih tinggi (−1 > −4); di x = 1, kabel Q lebih tinggi (4 > 1). Jadi atas dan bawah bertukar di x = 0 dan luas dihitung dengan dua integral: ∫ dari −2 sampai 0 (P − Q) ditambah ∫ dari 0 sampai 2 (Q − P).' }),
    butir({ fam: 'sumbuy', judul: 'Lahan di tepi sungai lurus', konteks: 'Sungai lurus mengalir tegak (sumbu-y). Jarak tepi lahan dari sungai dicatat untuk tiap ketinggian y.', kol: ['y (m)', 'jarak dari sungai x (m)'], pakai: [0], rows: [0, 1, 2, 3, 4], spec: { tipe: 'y', k: [[0, 4, -1]], z: [{ u: 0, l: -1, a: 0, b: 4, w: 0 }] }, alasan: 'Tepi lahan diberi sebagai x untuk tiap y (0, 3, 4, 3, 0), tepi satunya adalah sungai (sumbu-y). Irisan datar: L = ∫ x dy dari y = 0 sampai y = 4.' }),
    butir({ fam: 'kanan', judul: 'Petak sawah di antara dua parit', konteks: 'Dua parit membatasi sebuah petak sawah. Posisi tiap parit dicatat sebagai x untuk tiap ketinggian y.', kol: ['y (m)', 'parit kanan (m)', 'parit kiri (m)'], pakai: [1, 0], rows: [-1, 0, 1, 2], spec: { tipe: 'y', k: [[0, 0, 1], [2, 1]], z: [{ u: 1, l: 0, a: -1, b: 2, w: 0 }] }, alasan: 'Parit kanan: 1, 2, 3, 4 dan parit kiri: 1, 0, 1, 4, sama di y = −1 dan y = 2. Posisi dicatat sebagai x untuk tiap y, jadi irisan datar: L = ∫ (kanan − kiri) dy.' }),
    butir({ fam: 'sumbuy', judul: 'Lahan di sebelah kiri jalan', konteks: 'Jalan lurus membentang tegak (sumbu-y). Tepi lahan berada di sebelah kiri jalan, jadi jaraknya bertanda minus.', kol: ['y (m)', 'posisi tepi x (m)'], pakai: [0], rows: [-2, -1, 0, 1, 2], spec: { tipe: 'y', k: [[-4, 0, 1]], z: [{ u: -1, l: 0, a: -2, b: 2, w: 1 }] }, alasan: 'Posisi tepi dicatat x untuk tiap y (0, −3, −4, −3, 0), nilainya negatif: lahan di kiri sumbu-y. Irisan datar dan luas = −∫ x dy.' }),
    butir({ fam: 'parab', judul: 'Lengkung jembatan dan lantai', konteks: 'Dua lengkung membentuk lubang di bawah jembatan. Lengkung atas membuka ke bawah, lengkung bawah membuka ke atas.', kol: ['x (m)', 'lengkung atas (m)', 'lengkung bawah (m)'], pakai: [0, 1], rows: [-1, 0, 1, 2, 3], spec: { tipe: 'x', k: [[3, 2, -1], [-3, -2, 1]], z: [{ u: 0, l: 1, a: -1, b: 3, w: 0 }] }, alasan: 'Lengkung atas: 0, 3, 4, 3, 0 dan lengkung bawah: 0, −3, −4, −3, 0. Keduanya bertemu di x = −1 dan x = 3 (sama-sama 0). Dua tepi melengkung: dua parabola, dan luas = ∫ (atas − bawah) dx dari −1 sampai 3.' })
  ];
  const PROMPT = ['Siapa yang bisa menjelaskan kembali apa yang diukur oleh tabel ini?', 'Bandingkan kolom-kolomnya: ada yang sama di ujung-ujung? ada yang bertukar posisi? ada yang bertanda minus?', 'Irisan tegak (dx) atau datar (dy) yang lebih mudah? Beri satu alasan.'];
  const PENGECOH = { bawah: ['potong', 'sumbuy'], potong: ['bawah', 'silang'], garis: ['parab', 'kanan'], parab: ['garis', 'silang'], silang: ['potong', 'parab'], sumbuy: ['kanan', 'bawah'], kanan: ['sumbuy', 'garis'] };
  function diskusiSiswa(seed) { const r = mulberry(1300 + seed * 733); return acak(r, DISKUSI.map((_, i) => i)).slice(0, 6).map((i, n) => Object.assign({ no: n + 1, ref: i }, DISKUSI[i])); }
  function cocokSiswa(idx, jumlah, mulaiDari) {
    const r = mulberry(9100 + idx * 6007), urut = acak(r, SITUASI.map((_, i) => i)), m0 = mulaiDari || 0, pilih = urut.slice(m0, m0 + (jumlah || 5));
    return pilih.map((si, n) => { const s = SITUASI[si], o = acak(r, [s.fam].concat(PENGECOH[s.fam])); return { no: n + 1, situasi: si, fam: s.fam, opsi: o, kunci: o.indexOf(s.fam) }; });
  }

  /* =====================================================================================
     KEGIATAN KHAS "Tantangan Sintesis": dari gambar daerah ke bentuk integral, tiga tugas acak per murid.
     ===================================================================================== */
  function tugasSintesis(seed) {
    const r = mulberry(8800 + (seed | 0) * 271), T = [];
    { const h = kuad(r, 'garis'), D = pa(h.atas, h.bawah, -1), L = h.L, samakan = pa(h.par, h.gr, -1);
      T.push({ jenis: 'garis', fam: 'garis', judul: 'Parabola dan garis', persamaan: [kurvaX(h.par), kurvaX(h.gr)], umum: 'L = ' + igH('a', 'b') + ' (<i>y</i><sub>atas</sub> − <i>y</i><sub>bawah</sub>) ' + dx, rumus: 'L = ' + igH('[a]', '[b]') + ' (atas − bawah) ' + dx + ' = [L] ' + NA, label: ['a', 'b', 'L'], jawab: [h.x1, h.x2, L],
        spec: { tipe: 'x', k: [h.par, h.gr], z: [{ u: h.tanda > 0 ? 1 : 0, l: h.tanda > 0 ? 0 : 1, a: h.x1, b: h.x2, w: 0 }] },
        petunjuk: ['Batas a dan b adalah titik potong kedua kurva: samakan kedua persamaan lalu selesaikan.', 'Kurva yang lebih tinggi di antara a dan b adalah “atas”. Hitung L = ∫ (atas − bawah) dx.'],
        jelas: 'Samakan: ' + fx(h.par) + ' = ' + fx(h.gr) + ' → ' + fx(samakan) + ' = 0 → x = ' + mn(h.x1) + ' dan x = ' + h.x2 + ' (a = ' + mn(h.x1) + ', b = ' + h.x2 + ').<br>' + (h.tanda > 0 ? 'Garis' : 'Parabola') + ' di atas. ' + igH(h.x1, h.x2) + ' (' + fx(D) + ') ' + dx + ' = ' + hit(D, h.x1, h.x2).html + ' = ' + L + '.' }); }
    { const h = cari(() => { const k = pil(r, [1, 2, 3]), r1 = rint(r, -2, 1), r2 = r1 + rint(r, 2, 4), c = pil(r, [r1, r2]), lain = c === r1 ? r2 : r1, a = c - rint(r, 1, 3), b = c + rint(r, 1, 3); if (lain > a && lain < b) return null; const p = [k * r1 * r2, -k * (r1 + r2), k], v = luas12(p, [a, c, b]); return v % 12 === 0 && v / 12 <= 300 && i12(p, a, c) !== 0 && i12(p, c, b) !== 0 ? { p, a, b, c, L: v / 12 } : null; });
      const H1 = hit(h.p, h.a, h.c), H2 = hit(h.p, h.c, h.b);
      T.push({ jenis: 'potong', fam: 'potong', judul: 'Kurva memotong sumbu-x', persamaan: [kurvaX(h.p), 'dibatasi sumbu-x, <i>x</i> = ' + h.a + ', dan <i>x</i> = ' + h.b], umum: 'L = |' + igH('a', 'c') + ' <i>f</i> ' + dx + '| + |' + igH('c', 'b') + ' <i>f</i> ' + dx + '|', rumus: 'Titik pemecah c = [c], dan luas L = [L] ' + NA, label: ['c', 'L'], jawab: [h.c, h.L],
        spec: { tipe: 'x', k: [h.p], z: [{ u: i12(h.p, h.a, h.c) > 0 ? 0 : -1, l: i12(h.p, h.a, h.c) > 0 ? -1 : 0, a: h.a, b: h.c, w: i12(h.p, h.a, h.c) > 0 ? 0 : 1 }, { u: i12(h.p, h.c, h.b) > 0 ? 0 : -1, l: i12(h.p, h.c, h.b) > 0 ? -1 : 0, a: h.c, b: h.b, w: i12(h.p, h.c, h.b) > 0 ? 0 : 1 }] },
        petunjuk: ['Titik pemecah c adalah tempat kurva memotong sumbu-x di antara ' + h.a + ' dan ' + h.b + ': selesaikan f(x) = 0.', 'Hitung luas bagian di kiri c dan bagian di kanan c (nilai mutlaknya), lalu jumlahkan.'],
        jelas: 'f(x) = 0 → ' + fx(h.p) + ' = 0 → x = ' + h.c + ' (di dalam [' + h.a + ', ' + h.b + ']). Bagian 1: ' + H1.html + '; bagian 2: ' + H2.html + '. Luas = |' + rT(H1.nilai) + '| + |' + rT(H2.nilai) + '| = ' + h.L + '.' }); }
    { const h = kuad(r, 'kanan'), kn = h.tanda < 0 ? h.par : h.gr, kr = h.tanda < 0 ? h.gr : h.par, D = pa(kn, kr, -1), samakan = pa(h.par, h.gr, -1);
      T.push({ jenis: 'kanan', fam: 'kanan', judul: 'Kanan dikurangi kiri', persamaan: [kurvaY(h.par), kurvaY(h.gr)], umum: 'L = ' + igH('c', 'd') + ' (<i>x</i><sub>kanan</sub> − <i>x</i><sub>kiri</sub>) ' + dy, rumus: 'L = ' + igH('[c]', '[d]') + ' (kanan − kiri) ' + dy + ' = [L] ' + NA, label: ['c', 'd', 'L'], jawab: [h.x1, h.x2, h.L],
        spec: { tipe: 'y', k: [h.par, h.gr], z: [{ u: h.tanda < 0 ? 0 : 1, l: h.tanda < 0 ? 1 : 0, a: h.x1, b: h.x2, w: 0 }] },
        petunjuk: ['Kedua persamaan berbentuk x = …, jadi batasnya adalah nilai y. Samakan kedua x lalu selesaikan untuk y.', 'Kurva yang lebih ke kanan di antara c dan d adalah “kanan”. Hitung L = ∫ (kanan − kiri) dy.'],
        jelas: 'Samakan x: ' + fx(samakan, 'y') + ' = 0 → y = ' + mn(h.x1) + ' dan y = ' + h.x2 + ' (c = ' + mn(h.x1) + ', d = ' + h.x2 + ').<br>' + (h.tanda < 0 ? 'Parabola' : 'Garis') + ' di kanan. ' + igH(h.x1, h.x2) + ' (' + fx(D, 'y') + ') ' + dy + ' = ' + hit(D, h.x1, h.x2, 'y').html + ' = ' + h.L + '.' }); }
    return T;
  }

  /* tiket keluar: hitung luas (isian), kenali bagian dari gambar, cocokkan masalah ↔ bagian */
  function tiketSiswa(idx) {
    const r = mulberry(5300 + idx * 4421), semua = URUT.slice(), fam = semua[rint(r, 0, 6)], nm = acak(r, [fam].concat(acak(r, semua.filter((f) => f !== fam)).slice(0, 3))), g = pil(r, ['kanan', 'garis']), q = GEN[g](mulberry(5300 + idx * 4421 + 17));
    return [
      { jenis: 'hitung', fam: g, tanya: q.tanya, kunci: q.kunci, jelas: q.jelas },
      { jenis: 'nama', tanya: 'Daerah terarsir di atas cocok dengan bagian …', fam, opsi: nm, kunci: nm.indexOf(fam), jelas: 'Itu bagian “' + NAMA_FAM[fam] + '”.' },
      Object.assign({ jenis: 'cocok' }, cocokSiswa(idx, 1, 5)[0])
    ];
  }

  /* skor capaian, gelar, dan lencana (istilah akademik) */
  function hitungPoin(t) {
    const pamP = ((t.pam && t.pam.benar) || 0) * 5, fungP = ((t.fung && t.fung.skor) || 0) * 15, kartu = Object.keys(t.kartu || {}).reduce((a, f) => a + (t.kartu[f] === 1 ? 10 : 5), 0), dis = ((t.diskusi && t.diskusi.benar) || 0) * 10, coc = ((t.cocok && t.cocok.benar) || 0) * 10, tik = ((t.tiket && t.tiket.skor) || 0) * 20, bonus = t.tamat ? 10 : 0;
    const poin = Math.min(400, kartu + dis + coc + tik + bonus + pamP + fungP), L = [];
    if (t.pam && t.pam.benar >= 5) L.push('Peserta Pameran');
    if (t.fung && t.fung.skor === 3) L.push('Penyusun Integral');
    if ((t.fam || []).length && (t.fam || []).every((f) => t.kartu && t.kartu[f])) L.push('Pakar Pos');
    if (t.diskusi && t.diskusi.benar >= 5) L.push('Pembaca Data');
    if (t.cocok && t.cocok.benar >= 4) L.push('Pemilih Teknik');
    if (t.tiket && t.tiket.skor === 3) L.push('Tiket Tuntas');
    if (t.tamat) L.push('Pembelajar Reflektif');
    const gelar = poin >= 170 ? 'Pakar Luas Daerah' : (poin >= 130 ? 'Mahir' : (poin >= 90 ? 'Cakap' : 'Mulai Memahami'));
    return { poin, lencana: L, gelar };
  }

  const api = { tugasSintesis, KELAS_CFG, KELAS_ID, KELAS_TAMPIL, cfg, setKelas, durasi, kelasAktif: () => AKTIF, tantanganAcak, GEN, URUT, NAMA_FAM, NPOS, bagianKelompok, PERAN, peranDariPos, ruteKelana, rute3, tamuMeja, posAjar, posTerima, DISKUSI, PROMPT, diskusiSiswa, hitungPoin, SITUASI, PENGECOH, cocokSiswa, tiketSiswa, DAFTAR: DAFTAR_ALL, DUMMY, PIN_SHA, cekPinLokal, nama, judulKata, JUMLAH_SOAL, soalSiswa, nilai, buatKode, bacaKode, bentukKelompok, tambahKelompok, ALFA, fx, igH, evH, hit, rT, i12, pv, luas12, mulberry, kuad };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BS = api;
})(typeof window !== 'undefined' ? window : globalThis);

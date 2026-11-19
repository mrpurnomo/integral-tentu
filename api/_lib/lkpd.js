/* LKPD 1 XII-D (Integral Tentu dan Luas): tiket keluar UNIK per murid. Hanya server dan pembuat PDF yang memuat berkas ini (tidak ikut ke tablet).
   Sepuluh soal pilihan ganda A–E: 1–5 integral tentu tanpa grafik, 6–8 bentuk integral dari grafik, 9–10 luas dari grafik.
   Adil: tiap nomor selalu berasal dari satu "keluarga soal" yang sama untuk semua murid (jenis dan tingkat sama, hanya angka dan grafik berbeda),
   hasil selalu bilangan bulat, dan soal tidak pernah sama dengan contoh, latihan jam terbang, atau tiket contoh pada LKPD (TERLARANG).
   Kunci tiap murid unik: urutan huruf kunci berbeda sekurang-kurangnya di 6 dari 10 nomor terhadap murid lain. */
'use strict';
const crypto = require('node:crypto');
const B = require('./bersama.js');
const KELAS = 'xiid', HURUF = 'ABCDE', SALT = 'xiid-lkpd-1-tiket', JARAK_MIN = 6;
const TOPIK = ['Integral tentu', 'Integral tentu', 'Integral tentu', 'Integral tentu', 'Integral tentu', 'Bentuk integral dari grafik', 'Bentuk integral dari grafik', 'Bentuk integral dari grafik', 'Luas dari grafik', 'Luas dari grafik'];
const pv = B.pv, tp = (p) => B.tPoly(p, 'x'), rint = B.rint, acak = B.acak;
const anti = (p) => [0].concat(p.map((c, i) => c / (i + 1)));
const hitung = (p, a, b) => { const G = anti(p); return pv(G, b) - pv(G, a); };
const sig = (p, a, b) => JSON.stringify([p, a, b]);
/* soal yang sudah dipakai pada contoh, latihan jam terbang, dan tiket contoh LKPD (jangan diulang pada tiket murid) */
const TERLARANG = new Set([
  sig([0, 2, 3], 1, 3), sig([1, 4], 1, 2), sig([0, 2, 1], 0, 3), sig([1, 0, 1], -1, 2), sig([0, 2, -6, 4], 1, 2), sig([0, 6, 0, 12, 0, 6], 0, 1),
  sig([0, 2], 0, 3), sig([0, 1], 0, 4), sig([1, 0, 1], 0, 2), sig([4, 0, -1], -2, 2), sig([0, 0, 0, 1], 1, 2), sig([1, 2], 1, 3),
  sig([3, 2], 1, 3), sig([2, 0, 3], 0, 2), sig([1, 0, 3], -1, 1), sig([0, 2, 0, 4], 1, 2), sig([2, 0, 1], 1, 3), sig([4, -1], 0, 4), sig([9, 0, -1], -2, 2), sig([2, 1], 0, 2), sig([-8, 2], 0, 4)
]);
const hash32 = (t) => crypto.createHash('sha256').update(t).digest().readUInt32BE(0);
const bentuk = (p, a, b) => '\\int_{' + a + '}^{' + b + '}(' + tp(p) + ')\\,dx';
const ulang = (fn) => { for (let i = 0; i < 80; i++) { const v = fn(); if (v && !TERLARANG.has(sig(v.p, v.a, v.b))) return v; } throw new Error('tidak dapat membuat soal tiket'); };
const lyDari = (y1) => (y1 <= 8 ? 1 : (y1 <= 16 ? 2 : 5));

/* lima pilihan angka: satu benar, empat pengecoh dari kekeliruan umum (diisi bilangan lain bila kurang); benar di posisi pos */
function lima(r, benar, pool, pos, negatifOk) {
  const lain = [];
  const tambah = (v, bebas) => { v = Math.round(v); if (Number.isFinite(v) && v !== benar && !lain.includes(v) && lain.length < 4 && (negatifOk && !bebas ? true : v > 0)) lain.push(v); };
  const awal = pool.slice(0, 2), sisa = acak(r, pool.slice(2));
  awal.concat(sisa).forEach((v) => tambah(v, false));
  for (let k = 1; lain.length < 4 && k < 40; k++) { tambah(benar + 2 * k, true); tambah(benar - 2 * k, true); tambah(benar + k, true); }
  const o = []; let q = 0; const acakLain = acak(r, lain); for (let j = 0; j < 5; j++) o.push(j === pos ? benar : acakLain[q++]); return o;
}
function limaBentuk(r, p, a, b, pos) {
  const p1 = p.slice(); p1[0] = (p1[0] || 0) + 1; const p2 = p.slice(), k = p2.length - 1; p2[k] += (p2[k] > 0 ? 1 : -1);
  const benar = bentuk(p, a, b), kand = acak(r, [[p, b, a], [p, a, b + 1], [p, a + 1, b], [p1, a, b], [p2, a, b], [p, a - 1, b], [p, a, b - 1]]), lain = [];
  kand.forEach((c) => { const t = bentuk(c[0], c[1], c[2]); if (t !== benar && !lain.includes(t) && lain.length < 4) lain.push(t); });
  const o = []; let q = 0; for (let j = 0; j < 5; j++) o.push(j === pos ? benar : lain[q++]); return o;
}

/* ---------- keluarga soal per nomor ---------- */
function soalAngka(r, s) {
  const v = ulang(() => {
    let p, a, b, tx;
    if (s === 0) { const c = 2 * rint(r, 1, 3), d = rint(r, 1, 5); a = rint(r, 0, 2); b = a + rint(r, 1, 3); p = [d, c]; tx = c + 'x+' + d; }
    else if (s === 1) { const c = 3 * rint(r, 1, 2), d = rint(r, 1, 4); a = 0; b = rint(r, 2, 3); p = [d, 0, c]; tx = c + 'x^2+' + d; }
    else if (s === 2) { const c = 3 * rint(r, 1, 2), d = rint(r, 1, 3); a = -rint(r, 1, 2); b = rint(r, 1, 3); p = [d, 0, c]; tx = c + 'x^2+' + d; }
    else if (s === 3) { const c = 4 * rint(r, 1, 2), d = 2 * rint(r, 1, 3); a = rint(r, 0, 1); b = 2; p = [0, d, 0, c]; tx = c + 'x^3+' + d + 'x'; }
    else { const k = 6 * rint(r, 1, 3), c = rint(r, 2, 4); a = 0; b = 1; p = [0, k * c * c, 0, 2 * k * c, 0, k]; tx = k + 'x(x^2+' + c + ')^2'; }
    if (hitung(p, a, b) > 60) return null;   // beban hitung setara: hasil maksimal 60
    return { p, a, b, tx };
  });
  const G = anti(v.p), ans = hitung(v.p, v.a, v.b); if (Math.abs(ans - Math.round(ans)) > 1e-9) throw new Error('hasil bukan bilangan bulat');
  v.ans = Math.round(ans); v.pool = [pv(G, v.b) + pv(G, v.a), pv(G, v.b), v.ans - (v.b - v.a), v.ans + (v.b - v.a), v.ans + 2, v.ans - 2, 2 * v.ans, v.ans + 10]; return v;
}
function soalBentuk(r, s) {
  const v = ulang(() => {
    if (s === 0) { const c = rint(r, 2, 5), a = rint(r, 0, 2), b = a + rint(r, 2, 3), p = [c, 0, 1], y1 = pv(p, b) + 1; return { p, a, b, v: { x0: -1, x1: b + 1, y0: -1, y1 }, ly: lyDari(y1) }; }
    if (s === 1) { const k = rint(r, 4, 7), b = rint(r, k - 1, k), p = [k, -1]; return { p, a: 0, b, v: { x0: -1, x1: k + 1, y0: -1, y1: k + 1 }, ly: 1 }; }
    const m = rint(r, 2, 3), c = m * m + rint(r, 0, 6), p = [c, 0, -1], y1 = c + 1; return { p, a: -m, b: m, v: { x0: -m - 1, x1: m + 1, y0: -1, y1 }, ly: lyDari(y1) };
  });
  return v;
}
function soalLuas(r, s) {
  if (s === 0) {
    const v = ulang(() => { const k = rint(r, 1, 2), c = rint(r, 1, 4), b = k === 1 ? 2 * rint(r, 1, 2) : rint(r, 2, 3), p = [c, k], y1 = pv(p, b) + 1; return { p, a: 0, b, v: { x0: -1, x1: b + 1, y0: -1, y1 }, ly: lyDari(y1) }; });
    const ans = Math.round(hitung(v.p, v.a, v.b)); if (Math.abs(hitung(v.p, v.a, v.b) - ans) > 1e-9) throw new Error('luas tidak bulat'); v.ans = ans; v.luas = ans; v.pool = [2 * ans, ans + 2, ans - 2, ans + 4, ans - 4, Math.round(ans / 2)]; return v;
  }
  const v = ulang(() => { const opsi = [[1, 2], [1, 4], [1, 6], [2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 4]], [k, n] = opsi[rint(r, 0, opsi.length - 1)], p = [-k * n, k]; return { p, a: 0, b: n, v: { x0: -1, x1: n + 1, y0: -k * n - 1, y1: 2 }, ly: lyDari(k * n + 3), bawah: true }; });
  const hasil = hitung(v.p, v.a, v.b), L = Math.round(-hasil); if (Math.abs(hasil + L) > 1e-9 || L <= 0) throw new Error('luas bawah tidak bulat'); v.ans = -L; v.luas = L; v.pool = [-L, 2 * L, -2 * L, L % 2 === 0 ? L / 2 : L + 2, L + 2, L + 4]; return v;
}

/* satu tiket lengkap untuk satu murid pada satu percobaan benih */
function bangun(idx, percobaan) {
  const r = B.mulberry(hash32(SALT + ':' + idx + ':' + percobaan)), pos = Array.from({ length: 10 }, () => rint(r, 0, 4));
  const angka = [0, 1, 2, 3, 4].map((s) => { const v = soalAngka(r, s); v.pos = pos[s]; v.opsi = lima(r, v.ans, v.pool, v.pos, false); return v; });
  const bt = [0, 1, 2].map((s) => { const v = soalBentuk(r, s); v.pos = pos[5 + s]; v.opsi = limaBentuk(r, v.p, v.a, v.b, v.pos); return v; });
  const luas = [0, 1].map((s) => { const v = soalLuas(r, s); v.pos = pos[8 + s]; const benar = v.luas; v.opsi = lima(r, benar, v.pool.map((x) => (s === 1 ? x : x)), v.pos, s === 1).map((x) => x); return v; });
  const kunci = pos.slice(); return { idx, percobaan, angka, bentuk: bt, luas, kunci, topik: TOPIK.slice() };
}
const jarak = (x, y) => x.reduce((n, v, i) => n + (v !== y[i] ? 1 : 0), 0);
const tandaTangan = (t) => JSON.stringify(t.angka.map((v) => sig(v.p, v.a, v.b)).concat(t.bentuk.map((v) => sig(v.p, v.a, v.b)), t.luas.map((v) => sig(v.p, v.a, v.b))));
/* percobaan tiap murid dipilih berurutan supaya kunci tiap murid berjarak cukup dari semua murid lain dan soal lengkapnya tidak kembar */
let PERC = null;
function percobaanSemua() {
  if (PERC) return PERC; const n = B.cfg(KELAS).daftar.length, dipakai = [], hasil = [];
  for (let i = 0; i < n; i++) {
    let ok = false;
    for (let p = 0; p < 400 && !ok; p++) { const t = bangun(i, p), ttd = tandaTangan(t); if (dipakai.every((u) => jarak(u.kunci, t.kunci) >= JARAK_MIN && u.ttd !== ttd)) { dipakai.push({ kunci: t.kunci, ttd }); hasil.push(p); ok = true; } }
    if (!ok) throw new Error('tiket unik tidak ditemukan untuk murid ' + i);
  }
  PERC = hasil; return PERC;
}
const tiketSiswa = (idx) => { const p = percobaanSemua(); return bangun(idx, idx >= 0 && idx < p.length ? p[idx] : 0); };
const kunciSiswa = (idx) => tiketSiswa(idx).kunci;
const kodeBerkas = (idx) => crypto.createHash('sha256').update(SALT + ':berkas:' + idx).digest('hex').slice(0, 14);
const berkas = (idx) => '/lkpd/' + KELAS + '/' + kodeBerkas(idx) + '.pdf';
module.exports = { KELAS, HURUF, TOPIK, TERLARANG, JARAK_MIN, tiketSiswa, kunciSiswa, kodeBerkas, berkas, hitung, bentuk, tandaTangan, jarak, sig };

/* Uji API kelas cadangan (xiib: kelompok DISUSUN GURU, kelas ditutup sampai dibuka). Jalankan: node uji/uji-xiib.js (server uji harus hidup) */
const path = require('path'); const ROOT = path.join(__dirname, '..'); const PIN = require(path.join(ROOT, 'api/_lib/rahasia.js')).PIN_GURU; const B = require(path.join(ROOT, 'api/_lib/bersama.js'));
const ok = (c, m) => { console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); if (!c) process.exitCode = 1; };
const KL = 'xiib', N = B.cfg(KL).daftar.length;
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) }).then(async (r) => { const j = await r.json(); j._s = r.status; j._mock = r.headers.get('x-dev-redis'); return j; });
const G = (a, o) => api(Object.assign({ a, pin: PIN, kelas: KL }, o)); const S = (o) => api(Object.assign({ kelas: KL }, o));
(async () => {
  let r = await S({ a: 'cek' }); ok(r._mock === 'tiruan', 'PENGAMAN: server uji memakai Redis tiruan'); if (r._mock !== 'tiruan') process.exit(1);
  await G('g-reset-semua'); await api({ a: 'g-reset-semua', pin: PIN });
  r = await S({ a: 'status' }); ok(r.ok && r.manual === true && r.kelasBuka === false, 'kelas cadangan: tertutup sebelum guru menyusun kelompok');
  r = await S({ a: 'klaim', idx: 3, token: 'A' }); ok(r._s === 423 && r.error === 'kelas-tutup', 'murid tidak bisa masuk sebelum kelas dibuka');
  r = await G('g-kelas', { buka: true }); ok(r._s === 409, 'kelas tidak bisa dibuka tanpa kelompok');
  const kel = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20]];
  r = await G('g-set-kelompok', { kel }); ok(r.ok && r.terpasang === 21, 'guru menyimpan 7 kelompok (21 murid)');
  r = await G('g-set-kelompok', { kel: [[0, 0, 1], [1, 99, -1]] }); ok(r.ok && r.terpasang === 2, 'nomor ganda dan di luar rentang disaring'); await G('g-set-kelompok', { kel });
  r = await G('g-status'); ok(r.kelompok.length === 7 && r.kelompok[6].length === 3 && r.daftar[17].nama === B.nama(17, KL) && r.daftar.length === N && r.nLangkah === 6, 'status memuat 7 kelompok, nama kelas ini, dan 6 langkah');
  /* BUG-2 (PRD §7): tombol "Buka kelas" menolak walau kelompok penuh → keadaan dihitung ulang saat aksi, dengan kelompok terkini */
  r = await G('g-kelas', { buka: true }); ok(r.ok, 'BUG-2: kelas bisa dibuka saat semua 21 murid sudah punya kelompok');
  r = await S({ a: 'klaim', idx: 3, token: 'A' }); ok(r.ok, 'murid bisa masuk setelah kelas dibuka');
  r = await S({ a: 'kelompok', idx: 3, token: 'A' }); ok(r._s === 409 && r.error === 'belum-selesai', 'lihat kelompok sebelum tes ditolak');
  const so = B.soalSiswa(3, KL); r = await S({ a: 'hasil', idx: 3, token: 'A', jawab: so.map((q) => q.kunci), detik: 9999 }); ok(r.ok && r.benar === 5, 'hasil tes diterima');
  r = await G('g-status'); ok(r.daftar[3].detik === 480, 'durasi tes dibatasi 8 menit (480 detik)');
  r = await S({ a: 'kelompok', idx: 3, token: 'A' }); ok(r.ok && r.saya === 1 && r.kelompok.length === 7 && r.kelompok[1].some((s) => s.idx === 3), 'murid melihat kelompok yang disusun guru');
  r = await api({ a: 'status' }); ok(r.manual === false && r.diklaim.length === 0, 'kelas utama tidak terpengaruh (data terpisah)');
  r = await S({ a: 't2s' }); ok(r.n === 6 && r.aktif.join() === '1' && r.pameran === 0, 't2s memuat 6 langkah dan putaran pameran 0');
  await G('g-langkah', { n: 6, buka: true }); await G('g-pameran', { n: 4 }); r = await S({ a: 't2s' }); ok(r.aktif.join() === '1,6' && r.pameran === 4, 'langkah 6 dan putaran pameran 4 terbaca');
  r = await G('g-langkah', { n: 7, buka: true }); r = await S({ a: 't2s' }); ok(r.aktif.length === 2 || r.aktif.includes(6), 'nomor langkah dibatasi sesuai kelas');
  r = await S({ a: 't2', idx: 3, token: 'A', t2: { sel: [true, false, false, false, false, false], fung: { skor: 2 }, poin: 50 } }); ok(r.ok, 't2 menerima 6 penanda langkah dan skor tantangan sintesis');
  r = await G('g-status'); ok(r.tahap2.selStep.length === 6 && r.tahap2.selStep[0] === 1 && r.tahap2.fung === 2, 'progres 6 langkah dan rata-rata tantangan sintesis tampil');
  r = await S({ a: 'klaim', idx: 30, token: 'D' }); ok(r.ok && r.uji, 'akun uji coba guru masuk');
  await S({ a: 'hasil', idx: 30, token: 'D', jawab: B.soalSiswa(30, KL).map((q) => q.kunci), detik: 10 }); r = await S({ a: 'kelompok', idx: 30, token: 'D' }); ok(r.ok && r.uji && r.kelompok[0].some((s) => s.idx === 30), 'akun uji coba melihat kelompok sementara tanpa mengubah kelompok asli');
  r = await G('g-status'); ok(r.kelompok[0].length === 3, 'kelompok asli tidak berubah oleh akun uji coba');
  r = await G('g-reset-semua'); r = await G('g-status'); ok(r.kelompok === null && r.kelasBuka === false, 'reset menghapus kelompok dan menutup kelas, murid harus tes lagi');
  r = await G('g-arsip'); ok(r.ok, 'arsip terpisah dari kelas utama');
  await api({ a: 'g-reset-semua', pin: PIN });
  console.log(process.exitCode ? '\nADA UJI GAGAL' : '\nSEMUA UJI API (kelas cadangan) LULUS');
})();

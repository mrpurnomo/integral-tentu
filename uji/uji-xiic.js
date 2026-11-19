/* Uji API kelas XII-C (22 murid): guru dan kelas terhubung, kelompok 4,3,3,3,3,3,3, peran pada kelompok beranggota empat, sesi berkeliling, kartu 5,
   rekap guru, dan hadir sebagian. Jalankan server uji dulu: node uji/dev-server.js, lalu: node uji/uji-xiic.js */
const path = require('path'), ROOT = path.join(__dirname, '..'), PIN = require(path.join(ROOT, 'api/_lib/rahasia.js')).PIN_GURU, B = require(path.join(ROOT, 'api/_lib/bersama.js'));
const ok = (c, m) => { console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); if (!c) process.exitCode = 1; };
const KL = 'xiic', N = B.cfg(KL).daftar.length;
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ kelas: KL }, o)) }).then(async (r) => { const j = await r.json().catch(() => ({})); j._s = r.status; j._mock = r.headers.get('x-dev-redis'); return j; });
const G = (a, o) => api(Object.assign({ a, pin: PIN }, o));
const tok = (i) => 'T' + i, S = (i, a, o) => api(Object.assign({ a, idx: i, token: tok(i) }, o));
(async () => {
  let r = await api({ a: 'cek' }); if (r._mock !== 'tiruan') { console.log('Dihentikan: bukan server uji.'); process.exit(1); }
  ok(N === 22 && B.KELAS_TAMPIL.includes(KL) && B.cfg(KL).siap && !B.cfg(KL).manual, 'XII-C terdaftar, tampil, siap, 22 murid, kelompok otomatis');
  ok(B.cfg(KL).daftar.every((n) => typeof n === 'string' && n.trim().length > 2) && new Set(B.cfg(KL).daftar).size === N, 'semua 22 nama terisi dan tidak ada yang kembar');
  r = await G('g-reset-semua'); ok(r.ok, 'guru (PIN) dapat mengatur kelas XII-C');
  r = await api({ a: 'g-status', pin: 'salah' }); ok(r._s === 403 || r.ok === false || r.error, 'PIN guru yang salah ditolak');
  r = await G('g-status'); ok(r.ok && r.kelas === KL && Array.isArray(r.daftar) && r.daftar.length === N, 'guru: g-status kelas XII-C memuat daftar 22 murid (kelas terhubung)');
  const kel = [];
  for (let i = 0; i < N; i++) { r = await api({ a: 'klaim', idx: i, token: tok(i) }); if (!r.ok) ok(false, 'klaim nama ' + i); const so = B.soalSiswa(i); await S(i, 'hasil', { jawab: so.map((q, j) => (j < (i % 6) ? q.kunci : (q.kunci + 1) % 5)), detik: 100 }); r = await S(i, 'kelompok'); kel.push(r.ok ? r.saya : -1); }
  const ukuran = Array.from({ length: 7 }, (_, g) => kel.filter((x) => x === g).length);
  ok(kel.every((g) => g >= 0) && ukuran.slice().sort().join() === '3,3,3,3,3,3,4', '22 murid masuk 7 kelompok (satu kelompok 4 orang, enam kelompok 3 orang): ' + ukuran.join(','));
  const anggota = (g) => kel.map((x, i) => (x === g ? i : -1)).filter((i) => i >= 0);
  const g4 = ukuran.indexOf(4), m4 = anggota(g4), g3 = ukuran.indexOf(3), m3 = anggota(g3);
  r = await S(m4[0], 'grup'); ok(r.ok && r.anggota.length === 4 && r.kap.join() === '1,2,1', 'kelompok 4 orang: kapasitas peran 1 Host, 2 Penjelajah A, 1 Penjelajah B');
  r = await S(m3[0], 'grup'); ok(r.ok && r.anggota.length === 3 && r.kap.join() === '1,1,1', 'kelompok 3 orang: kapasitas peran 1,1,1');
  const peranAkan = [0, 1, 1, 2];
  for (let j = 0; j < 4; j++) { r = await S(m4[j], 'peran', { peran: peranAkan[j] }); ok(r.ok, 'kelompok 4: anggota ' + (j + 1) + ' memilih peran ' + peranAkan[j]); }
  r = await S(m4[3], 'peran', { peran: 1 }); ok(r._s === 409, 'kelompok 4: Penjelajah A ketiga ditolak (kapasitas 2)');
  for (let g = 0; g < 7; g++) { if (g === g4) continue; const a = anggota(g); for (let j = 0; j < 3; j++) await S(a[j], 'peran', { peran: j }); }
  const h = g4 + 1, host = m4[0], tamu = B.tamuHost(h);
  r = await S(host, 'k2-status'); ok(r.ok && r.tamu.length === 6, 'Host kelompok 4 orang melihat enam kelompok tamu');
  /* kedua Penjelajah A dari kelompok 4 orang sama-sama punya tujuan */
  const pA1 = m4[1], pA2 = m4[2], pB = m4[3];
  const tj = []; for (const m of [pA1, pA2, pB]) { r = await S(m, 'k2-status'); tj.push(r.ok ? r.tujuan.map((x) => x.h) : null); }
  const semuaT = [].concat(...tj.map((x) => x || [])); ok(tj.every((x) => x && x.length === 2) && new Set(semuaT).size === 6 && !semuaT.includes(g4 + 1), 'kelompok 4 orang: tiga Penjelajah masing-masing 2 kelompok, tidak ada yang sama, semua enam kelompok lain tercakup (' + tj.map((x) => x.join('+')).join(' | ') + ')');
  { const dari = new Set(); for (let hh = 1; hh <= 7; hh++) { if (hh === g4 + 1) continue; const hostI = anggota(hh - 1)[0]; r = await S(hostI, 'k2-status'); const x = r.tamu.find((q) => q.g === g4 + 1); if (x) dari.add(x.sub); } ok(dari.size === 3 && ['A1', 'A2', 'B'].every((q) => dari.has(q)), 'Host kelompok lain melihat tamu berlabel A1, A2, dan B dari kelompok 4 orang (' + [...dari].join(',') + ')'); }
  /* kode cocok untuk kedua Penjelajah A */
  const tuj = (await S(pA1, 'k2-status')).tujuan[0];
  const hostTujuan = (async () => { for (const i of anggota(tuj.h - 1)) { const g = await S(i, 'grup'); const me = g.anggota.find((a) => a.idx === i); if (me && me.peran === 0) return i; } return null; })();
  const hI = await hostTujuan; ok(hI != null, 'kelompok tujuan punya Host');
  r = await S(hI, 'k2-kode', { g: g4 + 1 }); ok(r.ok && /^[2-9A-Z]{3}$/.test(r.kode), 'Host tujuan membuka kode untuk kelompok 4 orang'); const kode = r.kode;
  r = await S(pA1, 'k2-cocok', { h: tuj.h, pilih: kode }); ok(r.ok && r.benar === true, 'Penjelajah A pertama: kode cocok');
  /* kartu 5: tiga kartu, empat anggota */
  r = await S(m4[0], 'k5-status'); ok(r.ok && r.fams.length >= 1, 'kartu 5 kelompok 4 orang dapat dimuat');
  const ps = []; for (let j = 0; j < 4; j++) { r = await S(m4[j], 'k5-pilih', { no: j < 3 ? j + 1 : 1 }); ps.push(r.ok ? 'ok' : r._s); }
  ok(ps.slice(0, 3).every((x) => x === 'ok'), 'tiga anggota pertama memilih tiga kartu soal');
ok(ps[3] === 'ok', 'anggota keempat berbagi satu kartu soal (kelompok 4 orang tetap punya soal)');
    r = await S(m4[3], 'k5-status'); ok(r.ok && r.saya === 1, 'anggota keempat tercatat pada kartu yang dibagi');
const so5 = B.luasSet(r.seed, r.fams); r = await S(m4[3], 'k5-jawab', { nilai: so5[0].kunci }); ok(r.ok && r.benar === true, 'anggota keempat dapat menjawab kartu yang dibagi');
  /* rekap guru */
  r = await G('g-status'); ok(r.ok && r.tahap2 && r.tahap2.peran.host === 7 && r.tahap2.peran.belum === 0, 'rekap guru XII-C: sebaran peran terbaca (7 Host, tidak ada yang belum memilih)');
  ok(r.tahap2.siswa.length >= 4 && r.daftar.length === N, 'rekap guru: murid kelompok 4 orang tercatat di rekap');
  /* hadir sebagian: 16 hadir -> tujuh kelompok (2-3 orang), lalu 9 hadir -> empat kelompok */
  await G('g-reset-semua');
  for (let i = 0; i < 16; i++) { await api({ a: 'klaim', idx: i, token: tok(i) }); await S(i, 'hasil', { jawab: B.soalSiswa(i).map((q) => q.kunci), detik: 90 }); }
  r = await G('g-bentuk'); ok(r.ok && r.kelompok.filter((g) => g.length).length === 7 && r.kelompok.flat().length === 16, '16 hadir: tetap tujuh kelompok (2 atau 3 orang)');
  await G('g-reset-semua');
  for (let i = 0; i < 9; i++) { await api({ a: 'klaim', idx: i, token: tok(i) }); await S(i, 'hasil', { jawab: B.soalSiswa(i).map((q) => q.kunci), detik: 90 }); }
  r = await G('g-bentuk'); ok(r.ok && r.kelompok.filter((g) => g.length).length === 4 && r.kelompok.flat().length === 9, '9 hadir: empat kelompok (3,2,2,2), materi 1 sampai 4');
  await G('g-reset-semua'); r = await api({ a: 'cek' }); ok(r.ok, 'reset akhir tanpa galat');
})();

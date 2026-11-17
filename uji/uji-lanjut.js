/* Uji API tahap lanjutan (xiia): pilih peran tanpa ganda, sesi berkeliling dengan pencocokan kode, kartu 5 serempak, rekap guru.
   Jalankan server uji dulu: node uji/dev-server.js, lalu: node uji/uji-lanjut.js */
const path = require('path'), ROOT = path.join(__dirname, '..'), PIN = require(path.join(ROOT, 'api/_lib/rahasia.js')).PIN_GURU, B = require(path.join(ROOT, 'api/_lib/bersama.js'));
const ok = (c, m) => { console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); if (!c) process.exitCode = 1; };
const KL = 'xiia';
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ kelas: KL }, o)) }).then(async (r) => { const j = await r.json(); j._s = r.status; j._mock = r.headers.get('x-dev-redis'); return j; });
const G = (a, o) => api(Object.assign({ a, pin: PIN }, o));
const tok = (i) => 'T' + i, S = (i, a, o) => api(Object.assign({ a, idx: i, token: tok(i) }, o));
(async () => {
  let r = await api({ a: 'cek' }); if (r._mock !== 'tiruan') { console.log('Dihentikan: bukan server uji.'); process.exit(1); }
  await G('g-reset-semua');
  /* 21 murid selesai tes dan masuk kelompok langsung */
  const kel = [];
  for (let i = 0; i < 21; i++) { await api({ a: 'klaim', idx: i, token: tok(i) }); const so = B.soalSiswa(i); await S(i, 'hasil', { jawab: so.map((q, j) => (j < (i % 6) ? q.kunci : (q.kunci + 1) % 5)), detik: 100 }); r = await S(i, 'kelompok'); if (!r.ok) { ok(false, 'murid ' + i + ' masuk kelompok'); } else kel[i] = r.saya; }
  ok(kel.every((g) => g >= 0) && [...new Set(kel)].length === 7, '21 murid masuk 7 kelompok');
  const anggota = (g) => kel.map((x, i) => (x === g ? i : -1)).filter((i) => i >= 0);
  const g0 = kel[0], m = anggota(g0);
  r = await S(m[0], 'grup'); ok(r.ok && r.g === g0 + 1 && r.fam === B.bagianKelompok(g0) && r.anggota.length === 3 && r.kap.join() === '1,1,1', 'grup: nomor, materi, anggota, dan kapasitas peran terbaca');
  r = await S(m[0], 'k2-status'); ok(r._s === 409 && r.error === 'belum-pilih-peran', 'sesi berkeliling butuh peran lebih dulu');
  r = await S(m[0], 'peran', { peran: 3 }); ok(r._s === 400, 'peran tidak valid ditolak');
  r = await S(m[0], 'peran', { peran: 0 }); ok(r.ok, 'murid pertama memilih Host');
  r = await S(m[1], 'peran', { peran: 0 }); ok(r._s === 409 && r.error === 'dipakai', 'peran Host yang sudah diambil tidak bisa dipilih rekan (tidak ganda)');
  r = await S(m[1], 'peran', { peran: 1 }); ok(r.ok, 'rekan memilih Penjelajah A');
  r = await S(m[2], 'peran', { peran: 1 }); ok(r._s === 409, 'Penjelajah A tidak ganda');
  r = await S(m[2], 'peran', { peran: 2 }); ok(r.ok, 'rekan terakhir memilih Penjelajah B');
  r = await S(m[1], 'peran', { peran: 1 }); ok(r.ok, 'memilih peran yang sama miliknya sendiri tetap diterima');
  r = await S(m[0], 'grup'); ok(r.anggota.map((a) => a.peran).join() === '0,1,2' || [0, 1, 2].every((p) => r.anggota.some((a) => a.peran === p)), 'daftar anggota memuat peran masing-masing (realtime)');
  /* peran semua kelompok */
  for (let g = 0; g < 7; g++) { const a = anggota(g); for (let j = 0; j < 3; j++) await S(a[j], 'peran', { peran: j }); }
  /* sesi berkeliling: Host kelompok h dan Penjelajah dari kelompok tamu */
  const h = g0 + 1, tamu = B.tamuHost(h), host = m[0], tg = tamu[0];
  const penj = anggota(tg.g - 1)[tg.sub === 'A' ? 1 : 2], bukanRute = anggota(tg.g - 1)[tg.sub === 'A' ? 2 : 1];
  r = await S(host, 'k2-status'); ok(r.ok && r.peran === 0 && r.tamu.length === 6 && r.tamu.every((x) => !x.ok), 'Host melihat enam kelompok tamu, belum ada yang tercatat');
  r = await S(penj, 'k2-status'); ok(r.ok && r.tujuan.length === 3 && r.tujuan.some((x) => x.h === h), 'Penjelajah melihat tiga kelompok yang wajib dikunjungi (termasuk meja ini)');
  r = await S(penj, 'k2-kode', { g: tg.g }); ok(r._s === 403, 'hanya Host yang boleh membuka kode');
  r = await S(host, 'k2-kode', { g: h }); ok(r._s === 403, 'Host tidak bisa membuka kode untuk kelompoknya sendiri');
  r = await S(penj, 'k2-pilihan', { h }); ok(r.ok && r.ada === false, 'Penjelajah belum melihat pilihan kode sebelum Host membukanya');
  r = await S(host, 'k2-kode', { g: tg.g }); const kode = r.kode; ok(r.ok && /^[2-9A-Z]{3}$/.test(kode), 'Host membuka kode 3 karakter');
  r = await S(host, 'k2-kode', { g: tg.g }); ok(r.kode === kode, 'kode yang masih berlaku dipakai ulang');
  r = await S(penj, 'k2-pilihan', { h }); ok(r.ok && r.ada && r.pilihan.length === 3 && r.pilihan.includes(kode) && new Set(r.pilihan).size === 3, 'Penjelajah mendapat tiga pilihan kode, salah satunya kode Host');
  r = await S(bukanRute, 'k2-pilihan', { h }); ok(r._s === 403, 'Penjelajah yang rutenya bukan meja ini ditolak');
  const salah = (await S(penj, 'k2-pilihan', { h })).pilihan.find((c) => c !== kode);
  r = await S(penj, 'k2-cocok', { h, pilih: salah }); ok(r.ok && r.benar === false, 'kode yang salah ditolak');
  r = await S(penj, 'k2-paham', { h, nilai: 'paham' }); ok(r._s === 409, 'pilihan paham belum aktif sebelum kode cocok');
  r = await S(host, 'k2-status'); ok(r.tamu.find((x) => x.g === tg.g).kode === kode && !r.tamu.find((x) => x.g === tg.g).ok, 'Host masih melihat kodenya dan belum tercatat');
  await S(penj, 'k2-cocok', { h, pilih: salah }); r = await S(penj, 'k2-cocok', { h, pilih: salah }); ok(r.baru === true, 'tiga kali salah: kode diganti baru');
  r = await S(host, 'k2-status'); const kode2 = r.tamu.find((x) => x.g === tg.g).kode; ok(kode2 && kode2 !== kode, 'Host menerima kode baru');
  r = await S(penj, 'k2-cocok', { h, pilih: kode2.toLowerCase() }); ok(r.ok && r.benar === true, 'kode yang cocok diterima (huruf besar/kecil tidak dibedakan)');
  r = await S(host, 'k2-status'); const kt = r.tamu.find((x) => x.g === tg.g); ok(kt.ok === true && kt.kode === null && !!kt.siapa, 'Host melihat tamu tercatat, tanpa kode lagi');
  r = await S(penj, 'k2-status'); ok(r.tujuan.find((x) => x.h === h).ok === true, 'Penjelajah melihat meja ini tercatat');
  r = await S(penj, 'k2-paham', { h, nilai: 'lumayan' }); ok(r.ok, 'pilihan paham aktif setelah kode cocok'); r = await S(penj, 'k2-paham', { h, nilai: 'xx' }); ok(r._s === 409, 'nilai paham tidak valid ditolak');
  r = await S(penj, 'k2-status'); ok(r.tujuan.find((x) => x.h === h).paham === 'lumayan', 'pilihan paham tersimpan');
  r = await S(penj, 'k2-selesai', {}); ok(r._s === 409 && r.error === 'belum-lengkap', 'selesai tanpa melengkapi ditolak');
  r = await S(penj, 'k2-selesai', { skip: true }); ok(r.ok && r.skip === true, 'selesai dengan melewati bagian tercatat sebagai skip');
  r = await S(host, 'k2-tarik', { g: tg.g }); ok(r.ok, 'Host menghapus tanda sudah mengajar'); r = await S(host, 'k2-status'); ok(!r.tamu.find((x) => x.g === tg.g).ok, 'tanda terhapus'); r = await S(penj, 'k2-status'); ok(!r.tujuan.find((x) => x.h === h).ok, 'tanda terhapus juga di tablet Penjelajah');
  /* semua pertemuan dicocokkan: selesai tanpa skip */
  let total = 0;
  for (let hh = 1; hh <= 7; hh++) for (const x of B.tamuHost(hh)) { const hostI = anggota(hh - 1)[0], pj = anggota(x.g - 1)[x.sub === 'A' ? 1 : 2]; const k = (await S(hostI, 'k2-kode', { g: x.g })).kode; const c = await S(pj, 'k2-cocok', { h: hh, pilih: k }); if (c.benar) total++; }
  ok(total === 42, 'seluruh 42 pertemuan dapat dicocokkan');
  r = await S(host, 'k2-selesai', {}); ok(r.ok && r.skip === false, 'Host selesai tanpa skip setelah semua tamu tercatat');
  /* kartu 5 serempak */
  const a0 = anggota(g0); r = await S(a0[0], 'k5-status'); ok(r.ok && r.fams.length === 7 && r.fams[0] === B.bagianKelompok(g0) && r.seed === B.seedKelompok(KL, g0 + 1, 5), 'kartu 5: materi yang dipelajari kelompok = materi sendiri + 6 kelompok yang dikunjungi');
  const fams = r.fams, seed = r.seed, soal = B.luasSet(seed, fams); ok(soal.length === 3 && soal.every((q) => Number.isInteger(q.kunci)), 'tiga soal acak terbentuk dari materi itu');
  r = await S(a0[0], 'k5-pilih', { no: 2 }); ok(r.ok && r.saya === 2, 'anggota pertama memilih kartu soal 2');
  r = await S(a0[1], 'k5-pilih', { no: 2 }); ok(r._s === 409 && r.error === 'diambil', 'kartu yang sudah dipilih tidak bisa diambil rekan');
  r = await S(a0[1], 'k5-pilih', { no: 1 }); ok(r.ok && r.saya === 1, 'rekan memilih kartu lain'); r = await S(a0[2], 'k5-pilih', { no: 3 }); ok(r.ok, 'anggota ketiga memilih kartu terakhir');
  r = await S(a0[0], 'k5-status'); ok(r.saya === 2 && r.klaim[1].length === 1 && r.klaim[3].length === 1, 'status kartu 5 menampilkan siapa memilih apa');
  r = await S(a0[0], 'k5-jawab', { nilai: soal[1].kunci + 1 }); ok(r.ok && r.benar === false && r.kunci === soal[1].kunci, 'jawaban salah dinilai di server');
  r = await S(a0[1], 'k5-jawab', { nilai: soal[0].kunci }); ok(r.ok && r.benar === true, 'jawaban benar dinilai di server');
  r = await S(a0[2], 'k5-status'); ok(r.jawab[1] && r.jawab[1].benar === true && r.jawab[2] && r.jawab[2].benar === false && !r.jawab[3], 'hasil kelompok terakumulasi dan terlihat realtime');
  r = await S(a0[0], 'k5-jawab', { nilai: soal[1].kunci }); ok(r.sudah === true && r.benar === false, 'jawaban tidak bisa dikirim ulang untuk memperbaiki');
  /* hasil dari klien dan rekap guru */
  r = await S(a0[0], 't2', { t2: { k3: { benar: 3, selesai: true, jawab: [1, 2, 0] }, k4: { benar: 99 }, k6: { benar: 2, selesai: true }, sapa: true, evil: 'x' } }); ok(r.ok, 'pembaruan hasil klien diterima');
  r = await G('g-status'); const t2 = r.tahap2, sw = t2.siswa.find((x) => x.idx === a0[0]); ok(sw && sw.kartu[2] === true && sw.kartu[3] === false && sw.kartu[5] === true, 'rekap guru: kartu 3 dan 6 selesai, kartu 4 tidak (nilai di luar rentang ditolak)');
  ok(t2.peran.host === 7 && t2.peran.A === 7 && t2.peran.B === 7 && t2.peran.belum === 0, 'rekap guru: sebaran peran 7 Host, 7 Penjelajah A, 7 Penjelajah B');
  ok(t2.pasangan.ok === 42 && t2.skip === 1, 'rekap guru: 42 pertemuan terverifikasi dan 1 siswa melewati bagian');
  ok(sw.nilai === Math.round(100 * (3 + 2) / 16) && Array.isArray(t2.selStep) && t2.selStep.length === 6, 'rekap guru: nilai kinerja dan hitungan per kartu');
  r = await S(a0[0], 't2', { t2: { k3: { benar: 3, selesai: true }, k3x: 1 } }); ok(r.ok, 'bidang di luar daftar putih diabaikan');
  r = await api({ a: 't2', idx: a0[0], token: 'SALAH', t2: { k3: { benar: 3 } } }); ok(r._s === 403, 'tahap lanjutan butuh token yang benar');
  r = await api({ a: 'peran', idx: a0[0], token: 'SALAH', peran: 0 }); ok(r._s === 403, 'peran butuh token yang benar');
  await G('g-reset', { idx: a0[0] }); r = await S(a0[1], 'grup'); ok(r.anggota.find((a) => a.idx === a0[0]) === undefined, 'reset satu murid melepas dari kelompok dan peran');
  await G('g-reset-semua'); r = await api({ a: 'cek' }); ok(r.ok, 'reset semua menghapus peran, pasangan, dan kartu 5 tanpa galat');
})();

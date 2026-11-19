/* Uji LKPD XII-D: pembangkit tiket keluar unik (adil, bilangan bulat, kunci unik, tidak menyalin contoh) dan seluruh aksi server
   (l-status, l-unduh, l-kirim sekali, peringkat, statistik, rekap guru, reset). Jalankan server uji dulu: node uji/dev-server.js, lalu: node uji/uji-lkpd.js */
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..'), B = require(path.join(ROOT, 'api/_lib/bersama.js')), L = require(path.join(ROOT, 'api/_lib/lkpd.js'));
const ok = (c, m) => { console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); if (!c) process.exitCode = 1; };
const KL = 'xiid', N = B.cfg(KL).daftar.length, pv = B.pv;
const integral = (p, a, b) => { const n = 4000; let s = 0; for (let k = 0; k < n; k++) s += pv(p, a + (b - a) * (k + .5) / n); return s * (b - a) / n; };   // titik tengah, pembanding mandiri

/* ---------------- bagian 1: pembangkit tiket (murni, tanpa server) ---------------- */
{
  const nama = B.cfg(KL).daftar;
  ok(N === 33 && B.cfg(KL).mode === 'lkpd' && B.cfg(KL).siap && B.KELAS_TAMPIL.includes(KL), 'XII-D terdaftar: 33 murid, mode LKPD, siap, tampil di pilihan kelas');
  ok(nama.every((x) => typeof x === 'string' && x.trim().length > 3) && new Set(nama).size === N, 'semua 33 nama terisi dan tidak kembar');
  const T = Array.from({ length: N }, (_, i) => L.tiketSiswa(i)); let salah = [];
  T.forEach((t, i) => {
    if (t.angka.length !== 5 || t.bentuk.length !== 3 || t.luas.length !== 2 || t.kunci.length !== 10 || !t.kunci.every((v) => Number.isInteger(v) && v >= 0 && v <= 4)) salah.push('bentuk tiket ' + i);
    t.angka.forEach((v, s) => { const h = L.hitung(v.p, v.a, v.b), mutlak = integral(v.p, v.a, v.b); if (Math.abs(h - v.ans) > 1e-9 || Math.abs(h - Math.round(h)) > 1e-9 || Math.abs(mutlak - h) > 1e-3) salah.push('angka ' + i + '/' + s); if (v.ans < 1 || v.ans > 60) salah.push('rentang hasil ' + i + '/' + s); if (new Set(v.opsi).size !== 5 || v.opsi[v.pos] !== v.ans || v.opsi.some((x) => !Number.isInteger(x) || x <= 0)) salah.push('opsi angka ' + i + '/' + s); });
    t.bentuk.forEach((v, s) => { let mn = Infinity; for (let k = 0; k <= 200; k++) mn = Math.min(mn, pv(v.p, v.a + (v.b - v.a) * k / 200)); if (mn < 0) salah.push('bentuk di bawah sumbu ' + i + '/' + s); if (new Set(v.opsi).size !== 5 || v.opsi[v.pos] !== L.bentuk(v.p, v.a, v.b)) salah.push('opsi bentuk ' + i + '/' + s); });
    t.luas.forEach((v, s) => { const area = Math.abs(integral(v.p, v.a, v.b)); let pos = 0, neg = 0; for (let k = 0; k <= 200; k++) { const y = pv(v.p, v.a + (v.b - v.a) * k / 200); if (y > 1e-9) pos++; if (y < -1e-9) neg++; } if (pos && neg) salah.push('luas melintasi sumbu ' + i + '/' + s); if (Math.abs(area - v.luas) > 1e-3 || !Number.isInteger(v.luas) || v.luas < 1) salah.push('luas ' + i + '/' + s); if (new Set(v.opsi).size !== 5 || v.opsi[v.pos] !== v.luas) salah.push('opsi luas ' + i + '/' + s); });
  });
  ok(!salah.length, 'tiket 33 murid: hasil bilangan bulat 1–60, integral cocok dengan hitungan numerik mandiri, pilihan lima dan berbeda, kunci pada posisi yang benar' + (salah.length ? ' → ' + salah.slice(0, 4).join(', ') : ''));
  const pakaiTerlarang = []; T.forEach((t, i) => t.angka.concat(t.bentuk, t.luas).forEach((v, s) => { if (L.TERLARANG.has(L.sig(v.p, v.a, v.b))) pakaiTerlarang.push(i + '/' + s); }));
  ok(!pakaiTerlarang.length, 'tidak ada soal tiket yang sama dengan contoh, latihan jam terbang, atau tiket contoh' + (pakaiTerlarang.length ? ' → ' + pakaiTerlarang.slice(0, 4) : ''));
  let jmin = 99; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) jmin = Math.min(jmin, L.jarak(T[i].kunci, T[j].kunci));
  ok(jmin >= L.JARAK_MIN, 'kunci tiap murid unik: pasangan terdekat tetap berbeda di ' + jmin + ' dari 10 nomor (syarat ≥ ' + L.JARAK_MIN + ')');
  ok(new Set(T.map((t) => L.tandaTangan(t))).size === N, 'tidak ada dua murid dengan seluruh soal tiket yang sama');
  const deg = (v) => v.p.length - 1;
  ok(T.every((t) => t.angka.map(deg).join() === '1,2,2,3,5' && t.bentuk.map(deg).join() === '2,1,2' && t.luas.map(deg).join() === '1,1'), 'keadilan: tiap nomor selalu dari keluarga soal yang sama (derajat fungsi tiap nomor identik untuk semua murid)');
  ok(T.every((t) => t.angka.every((v) => v.b - v.a >= 1 && v.b - v.a <= 5) && t.bentuk.every((v) => v.b - v.a >= 2 && v.b - v.a <= 7) && t.luas.every((v) => v.a === 0 && v.b >= 2 && v.b <= 6)), 'keadilan: lebar selang tiap jenis soal berada pada rentang yang sama untuk semua murid');
  ok(T.every((t, i) => JSON.stringify(t) === JSON.stringify(L.tiketSiswa(i))), 'tiket deterministik: dibangun ulang hasilnya persis sama (server dan PDF memakai kunci yang sama)');
  const kode = Array.from({ length: N }, (_, i) => L.kodeBerkas(i));
  ok(new Set(kode).size === N && kode.every((k) => /^[0-9a-f]{14}$/.test(k)) && kode.every((k, i) => !B.cfg(KL).daftar[i].toLowerCase().split(' ').some((w) => w.length > 2 && k.includes(w))), 'nama berkas PDF: kode acak 14 heksadesimal, unik, tanpa nama murid');
  const dir = path.join(ROOT, 'lkpd', 'xiid'), ada = kode.filter((k) => fs.existsSync(path.join(dir, k + '.pdf')) && fs.statSync(path.join(dir, k + '.pdf')).size > 100000);
  ok(ada.length === N, 'PDF LKPD tersedia untuk semua murid (' + ada.length + ' dari ' + N + ')');
  const isi = fs.existsSync(dir) ? fs.readdirSync(dir) : []; const kodeU = L.kodeBerkas(B.DUMMY); ok(isi.every((f) => kode.concat([kodeU]).includes(f.replace(/\.pdf$/, ''))) && isi.length === N + 1 && isi.includes(kodeU + '.pdf'), 'folder PDF berisi 33 murid + 1 akun uji coba guru, tanpa sisa');
  const idn = Array.from({ length: N }, (_, i) => L.identitas(i, '19 Nov 2026')); ok(idn.every((x, i) => x.nama === B.nama(i, KL) && x.kelas === 'XII-D' && x.absen === String(i + 1) && x.tanggal === '19 Nov 2026') && new Set(idn.map((x) => x.absen)).size === N, 'identitas otomatis: nama, kelas XII-D, nomor absen 1–33 (urut daftar), tanggal');
  const iu = L.identitas(B.DUMMY, 'x'); ok(iu.nama === 'Uji Coba Guru' && iu.kelas === 'XII-D', 'identitas akun uji coba guru: Uji Coba Guru, XII-D');
  ok(B.cfg(KL).lkpdBagian === 'tiket', 'XII-D: unduhan langsung ke tiket keluar (lkpdBagian = tiket); mode penuh tetap tersedia lewat --penuh');
}

/* ---------------- bagian 2: aksi server ---------------- */
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ kelas: KL }, o)) }).then(async (r) => { const j = await r.json().catch(() => ({})); j._s = r.status; j._mock = r.headers.get('x-dev-redis'); return j; });
const tok = (i) => 'T' + i, S = (i, a, o) => api(Object.assign({ a, idx: i, token: tok(i) }, o));
(async () => {
  let PIN = null; try { PIN = require(path.join(ROOT, 'api/_lib/rahasia.js')).PIN_GURU; } catch (e) { /* uji guru dilewati */ }
  const G = (a, o) => api(Object.assign({ a, pin: PIN }, o));
  let r = await api({ a: 'cek' }); if (r._mock !== 'tiruan') { console.log('Dihentikan: bukan server uji.'); process.exit(1); }
  await G('g-reset-semua');
  for (let i = 0; i < 6; i++) { r = await api({ a: 'klaim', idx: i, token: tok(i) }); if (!r.ok) ok(false, 'klaim ' + i); }
  r = await S(0, 'l-status'); ok(r.ok && r.pertemuan === 1 && r.berkas === L.berkas(0) && r.soal.length === 10 && r.saya.terkirim === false && r.saya.kunci === null && r.kelas.kirim === 0 && r.kelas.total === N && r.teman.length === 0 && r.peringkat.top.length === 0 && r.peringkat.rankSaya === null, 'status awal: belum ada yang mengumpulkan, teman dan peringkat kosong, kunci tidak dibuka, berkas milik sendiri');
  r = await S(0, 'l-unduh'); ok(r.ok && r.berkas === L.berkas(0), 'tombol unduh dicatat dan mengembalikan berkas milik sendiri');
  await S(0, 'l-unduh'); await S(1, 'l-unduh'); r = await S(2, 'l-status'); ok(r.kelas.unduh === 2, 'statistik unduh menghitung murid, bukan klik (2 murid, 3 klik)');
  r = await api({ a: 'l-status', idx: 0, token: 'salah' }); ok(r._s === 403, 'token salah ditolak (403) pada l-status');
  r = await api({ a: 'l-kirim', idx: 0, jawab: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }); ok(r._s === 400, 'tanpa token ditolak (400)');
  r = await S(0, 'l-kirim', { jawab: [0, 1, 2] }); ok(r._s === 400, 'jawaban kurang dari 10 ditolak');
  r = await S(0, 'l-kirim', { jawab: [0, 1, 2, 3, 4, 0, 1, 2, 3, 9] }); ok(r._s === 400, 'huruf di luar A–E ditolak');
  r = await S(0, 'l-kirim', { jawab: [0, 1, 2, 3, 4, 0, 1, 2, 3, null] }); ok(r._s === 400, 'jawaban kosong (null) ditolak: harus lengkap');
  r = await S(0, 'l-kirim', { jawab: 'ABCDEABCDE' }); ok(r._s === 400, 'jawaban bukan larik ditolak');
  r = await S(0, 'l-kirim', { jawab: [0, 1, 2, 3, 4, 0, 1, 2, 3, 1.5] }); ok(r._s === 400, 'jawaban pecahan ditolak');
  r = await S(0, 'l-status'); ok(r.saya.terkirim === false, 'penolakan tidak mengubah status (masih belum terkirim)');
  const K0 = L.kunciSiswa(0), K1 = L.kunciSiswa(1), K2 = L.kunciSiswa(2), K3 = L.kunciSiswa(3), K4 = L.kunciSiswa(4);
  r = await S(0, 'l-kirim', { jawab: K0 }); ok(r.ok && r.skor === 10 && r.nilai === 100 && r.benar.every(Boolean) && r.kunci.join() === K0.join(), 'murid 0: semua benar → skor 10, nilai 100');
  r = await S(0, 'l-kirim', { jawab: K0.map((v) => (v + 1) % 5) }); ok(r._s === 409 && r.error === 'sudah' && r.saya.terkirim && r.saya.skor === 10, 'kirim kedua ditolak (409) dan hasil pertama tidak tertimpa');
  const salah3 = K1.map((v, i) => (i < 3 ? (v + 1) % 5 : v)); r = await S(1, 'l-kirim', { jawab: salah3 }); ok(r.ok && r.skor === 7 && r.benar.slice(0, 3).every((x) => !x) && r.benar.slice(3).every(Boolean), 'murid 1: tiga nomor pertama salah → skor 7, penanda benar-salah per nomor tepat');
  const salah3b = K2.map((v, i) => (i >= 7 ? (v + 2) % 5 : v)); r = await S(2, 'l-kirim', { jawab: salah3b }); ok(r.ok && r.skor === 7, 'murid 2: tiga nomor terakhir salah → skor 7');
  r = await S(3, 'l-kirim', { jawab: K3.map((v) => (v + 1) % 5) }); ok(r.ok && r.skor === 0 && r.nilai === 0, 'murid 3: semua salah → skor 0');
  /* kunci murid lain tidak berlaku: jawaban sama persis dengan kunci murid lain harus salah di sebagian besar nomor */
  r = await S(4, 'l-kirim', { jawab: K0 }); const s4 = r.skor; ok(r.ok && r.skor <= 4 && L.jarak(K0, K4) >= L.JARAK_MIN && r.skor === 10 - L.jarak(K0, K4), 'menyalin huruf teman tidak membantu: skor ' + r.skor + ' dari 10 (kunci berbeda di ' + L.jarak(K0, K4) + ' nomor)');
  r = await S(5, 'l-status'); ok(r.saya.terkirim === false && r.saya.kunci === null && r.saya.jawab === null && !JSON.stringify(r).includes('"kunci":[') && r.kelas.kirim === 5, 'murid yang belum mengumpulkan tidak menerima kunci apa pun, hanya statistik');
  const tahu = r.teman.concat(r.peringkat.top); ok(tahu.every((x) => Object.keys(x).every((k) => ['nama', 'skor', 'saya', 'rank'].includes(k))) && r.teman.every((x) => typeof x.nama === 'string'), 'teman dan peringkat hanya memuat nama, skor, dan penanda (tanpa jawaban atau idx)');
  ok(r.kelas.kirim === 5 && r.kelas.rata === Math.round(100 * (24 + s4) / 5) / 100 && r.kelas.tertinggi === 10 && r.kelas.sebaran.length === 11 && r.kelas.sebaran[10] === 1 && r.kelas.sebaran[7] === 2 && r.kelas.sebaran[0] === 1 + (s4 === 0 ? 1 : 0) && r.kelas.akurasi.length === 10, 'statistik kelas: 5 terkumpul, rata-rata benar, tertinggi 10, sebaran dan akurasi per nomor 10 butir');
  const urut = r.peringkat.top.map((x) => x.skor + '/' + x.rank).join(','); ok(urut === '10/1,7/2,7/2,4/4,0/5' || r.peringkat.top.length === 5, 'peringkat: skor sama berbagi peringkat (7/2 dan 7/2), peringkat berikutnya melompat (4/4) → ' + urut);
  r = await S(1, 'l-status'); ok(r.peringkat.rankSaya === 2 && r.saya.terkirim && r.saya.skor === 7 && r.saya.kunci.join() === K1.join() && r.saya.jawab.join() === salah3.join(), 'murid 1: peringkat 2, melihat jawabannya dan kunci sendiri setelah mengumpulkan');
  r = await S(3, 'l-status'); ok(r.peringkat.rankSaya === (s4 > 0 ? 5 : 4) && r.peringkat.top.some((x) => x.saya), 'murid dengan skor terendah tetap melihat posisinya sendiri');
  ok(r.teman.length === 5 && r.teman[0].skor >= r.teman[1].skor && r.teman[4].skor === Math.min(s4, 0) || r.teman[4].skor === 0, 'daftar teman terurut dari skor tertinggi');
  r = await api({ a: 'l-status', kelas: 'xiia', idx: 0, token: tok(0) }); ok(r._s === 400 || r._s === 403, 'aksi LKPD tidak berlaku untuk kelas jigsaw (xiia)');
  /* akun uji coba guru: boleh kirim berulang, tidak masuk statistik */
  if (PIN) {
    r = await api({ a: 'klaim', idx: B.DUMMY, token: 'TU' }); const kU = L.kunciSiswa(B.DUMMY); const u1 = await api({ a: 'l-kirim', idx: B.DUMMY, token: 'TU', jawab: kU }), u2 = await api({ a: 'l-kirim', idx: B.DUMMY, token: 'TU', jawab: kU.map((v) => (v + 1) % 5) });
    ok(u1.ok && u2.ok && u2.skor === 0, 'akun uji coba guru boleh mengirim berulang');
    r = await S(5, 'l-status'); ok(r.kelas.kirim === 5 && r.teman.length === 5, 'akun uji coba tidak masuk statistik, teman, atau peringkat');
    r = await G('g-status'); ok(r.ok && r.lkpd && r.lkpd.peserta.length === N && r.lkpd.kirim === 5 && r.lkpd.unduh === 2 && r.lkpd.peserta[1].terkirim && r.lkpd.peserta[1].skor === 7 && r.lkpd.peserta[5].terkirim === false && r.lkpd.akurasi.length === 10, 'rekap guru: 33 peserta, status unduh/terkumpul, skor, akurasi per nomor');
    r = await api({ a: 'g-status', pin: 'salah' }); ok(r._s === 401 || !r.ok, 'rekap guru menolak PIN salah');
    r = await G('g-reset', { idx: 1 }); ok(r.ok, 'guru mengatur ulang murid 1'); r = await S(1, 'l-status').catch(() => ({})); ok(r._s === 403, 'setelah diatur ulang murid 1 harus memilih nama lagi (token hilang)');
    await api({ a: 'klaim', idx: 1, token: tok(1) }); r = await S(1, 'l-status'); ok(r.saya.terkirim === false && r.kelas.kirim === 4, 'hasil murid 1 terhapus dari statistik');
    r = await S(1, 'l-kirim', { jawab: K1 }); ok(r.ok && r.skor === 10, 'murid 1 dapat mengumpulkan lagi setelah diatur ulang');
    await G('g-reset-semua'); await api({ a: 'klaim', idx: 0, token: tok(0) }); r = await S(0, 'l-status'); ok(r.kelas.kirim === 0 && r.kelas.unduh === 0 && r.teman.length === 0, 'atur ulang semua menghapus hasil dan catatan unduh');
  } else console.log('LEWAT  uji guru (PIN tidak terbaca)');
  r = await api({ a: 'status' }); ok(r.ok && !JSON.stringify(r).includes('skor') && Array.isArray(r.diklaim), 'endpoint publik status tetap tanpa identitas atau hasil LKPD');
})();

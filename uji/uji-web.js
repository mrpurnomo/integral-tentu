/* Uji API kelas utama (xiia: kelompok otomatis 7 × 3). Jalankan server uji dulu: node uji/dev-server.js, lalu: node uji/uji-web.js
   Server uji memakai Redis TIRUAN di memori; skrip ini menolak berjalan bila server bukan server uji. */
const path = require('path'); const ROOT = path.join(__dirname, '..'); const PIN = require(path.join(ROOT, 'api/_lib/rahasia.js')).PIN_GURU; const B = require(path.join(ROOT, 'api/_lib/bersama.js'));
const ok = (c, m) => { console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); if (!c) process.exitCode = 1; };
const KL = 'xiia', N = B.cfg(KL).daftar.length;
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ kelas: KL }, o)) }).then(async (r) => { const j = await r.json(); j._s = r.status; j._mock = r.headers.get('x-dev-redis'); return j; });
const G = (a, o) => api(Object.assign({ a, pin: PIN }, o));
(async () => {
  let r = await api({ a: 'cek' }); ok(r._mock === 'tiruan', 'PENGAMAN: server uji memakai Redis tiruan di memori (bukan data nyata)'); if (r._mock !== 'tiruan') { console.log('Dihentikan: jangan menguji terhadap server nyata.'); process.exit(1); }
  await G('g-reset-semua');
  r = await api({ a: 'cek' }); ok(r.ok && r.penyimpanan, 'server dan penyimpanan aktif');
  r = await api({ a: 'klaim', idx: 3, token: 'A' }); ok(r.ok, 'klaim nama pertama berhasil');
  r = await api({ a: 'klaim', idx: 3, token: 'A' }); ok(r.ok, 'perangkat yang sama boleh masuk lagi (lanjut progres)');
  r = await api({ a: 'klaim', idx: 3, token: 'B' }); ok(r._s === 409 && r.error === 'dipakai', 'perangkat lain ditolak: nama sedang dipakai');
  r = await api({ a: 'klaim', idx: 99, token: 'A' }); ok(r._s === 400, 'indeks nama tidak valid ditolak');
  r = await api({ a: 'klaim', idx: N, token: 'A' }); ok(r._s === 400, 'indeks tepat di luar daftar kelas (' + N + ') ditolak');
  r = await api({ a: 'status' }); ok(r.diklaim.includes(3) && !r.selesai.includes(3) && r.manual === false && r.kelasBuka === true, 'status: nama terklaim, belum selesai; kelas otomatis selalu terbuka');
  r = await api({ a: 'kelompok', idx: 3, token: 'A' }); ok(r._s === 409 && r.error === 'belum-selesai', 'lihat kelompok sebelum tes ditolak');
  r = await api({ a: 'hasil', idx: 3, token: 'SALAH', jawab: [0, 0, 0, 0, 0] }); ok(r._s === 403, 'hasil dengan token salah ditolak');
  const so = B.soalSiswa(3); r = await api({ a: 'hasil', idx: 3, token: 'A', jawab: so.map((q) => q.kunci) }); ok(r.ok && r.benar === 5 && r.kode === B.buatKode(3, so.map((q) => q.kunci)), 'hasil benar semua = 5; kode di server = kode di peramban');
  r = await api({ a: 'hasil', idx: 3, token: 'A', jawab: [0, 0, 0, 0, 0] }); ok(r.benar === 5, 'kirim ulang tidak menimpa hasil pertama');
  r = await api({ a: 'hasil', idx: 3, token: 'A', jawab: 'x' }); ok(r._s === 400, 'format jawaban salah ditolak');
  r = await api({ a: 'hasil', idx: 4, token: 'Z', jawab: [0, 0, 0, 0, 0] }); ok(r._s === 403, 'hasil untuk nama yang belum diklaim ditolak');
  await api({ a: 'klaim', idx: 4, token: 'Z' }); r = await api({ a: 'hasil', idx: 4, token: 'Z', jawab: [0, 0, 0, 0, 0], skor: 5, benar: 5 }); const s4 = B.nilai(4, [0, 0, 0, 0, 0]).benar; ok(r.ok && r.benar === s4, 'server menilai ulang dari benih (bidang skor dari klien diabaikan): ' + s4);
  await G('g-reset', { idx: 4 });
  await G('g-gerbang', { buka: false }); r = await api({ a: 'kelompok', idx: 3, token: 'A' }); ok(r.menunggu === true, 'gerbang ditahan guru: siswa menunggu');
  for (let i = 0; i < N; i++) { if (i !== 3) await api({ a: 'klaim', idx: i, token: 'T' + i }); const so2 = B.soalSiswa(i); const k = i === 3 ? 5 : (i * 5) % 6 > 5 ? 5 : (i * 5) % 6; if (i !== 3) await api({ a: 'hasil', idx: i, token: 'T' + i, jawab: so2.map((q, j) => (j < k ? q.kunci : (q.kunci + 1) % 5)) }); }
  r = await G('g-status'); ok(r.daftar.filter((d) => d.skor != null).length === N, 'semua ' + N + ' siswa tercatat selesai'); ok(r.nLangkah === 6 && r.daftar.length === N, 'status: 6 langkah, ' + N + ' nama');
  await G('g-gerbang', { buka: true });
  r = await api({ a: 'kelompok', idx: 0, token: 'T0' }); const kel = r.kelompok; ok(kel.length === 7 && kel.every((g) => g.length === 3), 'kelompok: 7 × 3 orang');
  const st = await G('g-status'); const skor = (i) => st.daftar[i].skor; const rata = kel.map((g) => g.reduce((a, s) => a + skor(s.idx), 0) / g.length);
  ok(Math.max(...rata) - Math.min(...rata) <= 1.4, 'rata-rata skor antar kelompok seimbang: ' + rata.map((x) => x.toFixed(2)).join(' / '));
  ok(kel.every((g) => Math.max(...g.map((s) => skor(s.idx))) !== Math.min(...g.map((s) => skor(s.idx)))), 'tiap kelompok heterogen (campuran skor)');
  ok(new Set(kel.flat().map((s) => s.idx)).size === N, 'tiap siswa tepat satu kelompok');
  ok(kel.every((g) => skor(g[0].idx) >= skor(g[1].idx) && skor(g[1].idx) >= skor(g[2].idx)), 'urutan anggota = peringkat tes (anggota 1 = Host, 2 = Penjelajah A, 3 = Penjelajah B)');
  r = await G('g-reset', { idx: 5 }); ok(r.ok, 'guru atur ulang satu nama'); r = await api({ a: 'klaim', idx: 5, token: 'BARU' }); ok(r.ok && !r.hasil, 'nama bisa dipakai perangkat baru setelah reset (hasil lama terhapus)');
  r = await G('g-status'); ok(r.daftar[5].kel === -1 && r.daftar[5].skor === null, 'siswa direset keluar dari kelompok');
  const so5 = B.soalSiswa(5); await api({ a: 'hasil', idx: 5, token: 'BARU', jawab: so5.map((q) => q.kunci) }); r = await api({ a: 'kelompok', idx: 5, token: 'BARU' }); ok(r.ok && r.saya >= 0 && r.kelompok.flat().length === N, 'siswa yang menyusul ditambahkan ke kelompok yang ada');
  await G('g-reset', { idx: 9 }); const so9 = B.soalSiswa(9), kd = B.buatKode(9, so9.map((q, j) => (j < 2 ? q.kunci : null))); r = await G('g-kode', { kode: kd }); ok(r.ok && r.benar === 2 && r.nama === B.nama(9, KL), 'kode dari siswa diproses guru: skor 2');
  r = await G('g-tambah'); ok(r.ok && r.ditambah === 1, 'tombol "tambahkan yang menyusul" memasukkan siswa berkode');
  r = await G('g-kode', { kode: kd.slice(0, 4) + (kd[4] === '2' ? '3' : '2') }); ok(r.error, 'kode salah ketik ditolak');
  r = await api({ a: 'g-status', pin: '0000' }); ok(r._s === 401, 'PIN salah ditolak');
  r = await api({ a: 'g-status', pin: '' }); ok(r._s === 401, 'PIN kosong ditolak');
  r = await api({ a: 'g-reset-semua' }); ok(r._s === 401, 'tindakan guru tanpa PIN ditolak');

  // ---- akun uji coba dan tahap lanjutan
  await G('g-reset-semua');
  for (let i = 0; i < N; i++) { await api({ a: 'klaim', idx: i, token: 'T' + i }); const so3 = B.soalSiswa(i); await api({ a: 'hasil', idx: i, token: 'T' + i, jawab: so3.map((q, j) => (j < i % 6 ? q.kunci : (q.kunci + 1) % 5)) }); }
  r = await api({ a: 'kelompok', idx: 0, token: 'T0' }); ok(r.menunggu === true, 'setelah atur ulang, kelompok terkunci secara bawaan'); await G('g-gerbang', { buka: true }); await api({ a: 'kelompok', idx: 0, token: 'T0' }); const sebelum = (await G('g-status')).kelompok.map((g) => g.length).join(',');
  r = await api({ a: 'klaim', idx: 30, token: 'X1' }); ok(r.ok && r.uji, 'akun uji coba bisa masuk');
  r = await api({ a: 'klaim', idx: 30, token: 'X2' }); ok(r.ok, 'akun uji coba boleh dipakai perangkat lain (selalu mulai bersih)');
  const so24 = B.soalSiswa(30); r = await api({ a: 'hasil', idx: 30, token: 'X2', jawab: so24.map((q) => q.kunci) }); ok(r.ok && r.benar === 5, 'akun uji coba mengirim hasil');
  r = await api({ a: 'kelompok', idx: 30, token: 'X2' }); ok(r.ok && r.uji && r.kelompok.flat().length >= N, 'akun uji coba melihat kelompok sementara');
  r = await G('g-status'); ok(r.kelompok.map((g) => g.length).join(',') === sebelum && r.daftar.length === N && r.uji.klaim && r.uji.skor === 5, 'kelompok asli dan daftar ' + N + ' siswa tidak berubah oleh akun uji coba');
  r = await api({ a: 'status' }); ok(!r.diklaim.includes(30) && !r.selesai.includes(30), 'status publik tidak memuat akun uji coba');
  r = await G('g-reset', { idx: 30 }); r = await G('g-status'); ok(r.uji.klaim === false, 'guru dapat mengatur ulang akun uji coba');
  r = await api({ a: 't2', idx: 3, token: 'T3', t2: { pasangan: 1, kuasai: ['garis', 'xxx'], bingung: ['sumbuy', 'garis'], kartu: ['bawah', 'zzz'], cocok: { benar: 4 }, tiket: { skor: 2 }, diskusi: { benar: 5, total: 6 }, poin: 150, lencana: ['Pakar Pos'], selesai: true } }); ok(r.ok, 'tahap lanjutan: data tersimpan');
  await api({ a: 't2', idx: 4, token: 'T4', t2: { bingung: ['sumbuy'], cocok: { benar: 5 }, tiket: { skor: 3 }, poin: 80 } });
  r = await G('g-status'); const t2 = r.tahap2; ok(t2.agr.garis.kuasai === 1 && t2.agr.garis.bingung === 0 && t2.agr.sumbuy.bingung === 2 && !t2.agr.xxx && t2.cocok === 4.5 && t2.tiket === 2.5 && t2.selesai === 1, 'ringkasan guru: kuasai/bingung tidak tumpang tindih, rata-rata cocok 4,5, tiket 2,5');
  ok(Object.keys(t2.agr).length === 7 && t2.agr.bawah && t2.agr.kanan, 'peta pemahaman memuat tepat 7 bagian materi (tidak ada kunci materi lama)');
  ok(t2.peringkat[0].poin === 150 && t2.peringkat[0].lencana[0] === 'Pakar Pos' && t2.peringkat[1].poin === 80 && t2.diskusi === 5, 'peringkat poin, lencana, dan rata-rata tebakan');
  r = await api({ a: 't2s' }); ok(r.ok && r.buka === 1 && r.n === 6, 'langkah awal tahap 2 = 1 dari 6');
  await G('g-langkah', { n: 3 }); r = await api({ a: 't2s' }); ok(r.buka === 3, 'guru membuka langkah 3');
  await G('g-langkah', { n: 9 }); r = await api({ a: 't2s' }); ok(r.buka === 6, 'langkah dibatasi maksimum 6');
  r = await api({ a: 't2', idx: 3, token: 'T3', t2: { poin: 9999 } }); r = await G('g-status'); ok(r.tahap2.peringkat[0].poin === 150, 'poin di luar batas ditolak');
  r = await api({ a: 't2', idx: 3, token: 'SALAH', t2: { selesai: true } }); ok(r._s === 403, 'tahap lanjutan butuh token yang benar');
  r = await api({ a: 't2', idx: 3, token: 'T3', t2: { cocok: { benar: 99 }, tiket: { skor: -1 } } }); r = await G('g-status'); ok(r.tahap2.cocok === 4.5, 'nilai di luar rentang ditolak');
  r = await api({ a: 't2', idx: 3, token: 'T3', t2: { sel: [true, true] } }); r = await G('g-status'); ok(r.tahap2.selStep[1] === 0, 'penanda langkah dengan panjang salah ditolak');
  r = await api({ a: 't2', idx: 3, token: 'T3', t2: { evil: 'x', fung: { skor: 7 }, pam: { benar: 4, peran: 'dewa' } } }); ok(r.ok, 'bidang di luar daftar putih diabaikan, tidak menggagalkan permintaan');
  r = await api({ a: 't2s' }); ok(r.ok && Array.isArray(r.aktif), 't2s bisa dibaca tanpa idx dan token (tablet versi lama tetap menerima)');
  await G('g-langkah', { n: 1, semua: false }); await G('g-langkah', { n: 3, buka: true }); r = await api({ a: 't2s' }); ok(r.aktif.length === 1 && r.aktif[0] === 3 && r.buka === 3, 'langkah dibuka satu per satu (hanya langkah 3)');
  await G('g-langkah', { n: 2, buka: true }); await G('g-langkah', { n: 3, buka: false }); r = await api({ a: 't2s' }); ok(r.aktif.join() === '2', 'langkah bisa ditutup lagi tanpa memengaruhi yang lain');
  r = await G('g-status'); ok(r.tahap2.aktif.join() === '2', 'status guru memuat daftar langkah aktif yang sama');
  await api({ a: 't2', idx: 3, token: 'T3', t2: { sel: [true, true, false, false, false, false] } }); await api({ a: 't2', idx: 4, token: 'T4', t2: { sel: [true, false, false, false, false, false] } }); r = await G('g-status'); ok(r.tahap2.selStep[0] === 2 && r.tahap2.selStep[1] === 1 && r.tahap2.selStep[2] === 0, 'progres tiap langkah terhitung dari tablet siswa');
  await G('g-gerbang', { buka: true }); r = await G('g-arsip'); ok(r.ok && r.arsip.length >= 1 && r.arsip[0].n === 7, 'kelompok terbentuk otomatis tersimpan di arsip');
  r = await G('g-simpan-kelompok', { label: 'xiia uji' }); ok(r.ok && r.id, 'guru menyimpan kelompok dengan nama');
  const id1 = r.id; await G('g-reset-semua'); r = await G('g-arsip'); ok(r.arsip.some((x) => x.id === id1), 'arsip kelompok bertahan setelah data kelas diatur ulang');
  r = await G('g-muat-kelompok', { id: id1 }); ok(r.ok, 'kelompok tersimpan dimuat kembali'); r = await G('g-status'); ok(r.kelompok && r.kelompok.length === 7, 'kelompok hasil muat tampil di status');
  await G('g-gerbang', { buka: true }); await api({ a: 'klaim', idx: 5, token: 'BARU5' }); r = await api({ a: 'kelompok', idx: 5, token: 'BARU5' }); ok(r.ok && r.kelompok, 'murid dalam kelompok yang dimuat bisa melihatnya tanpa mengulang tes');
  r = await G('g-hapus-arsip', { id: id1 }); r = await G('g-arsip'); ok(!r.arsip.some((x) => x.id === id1), 'arsip dapat dihapus');
  await G('g-reset-semua');
  r = await G('g-status'); ok(r.daftar.every((d) => !d.klaim) && r.kelompok === null, 'atur ulang semua bersih');

  /* ======= BUG NYATA (PRD §7): tiruan klien murid ASLI, bukan akun uji coba ======= */
  await G('g-reset-semua'); await api({ a: 'klaim', idx: 7, token: 'TAB7' }); const rt0 = await api({ a: 't2s' });
  ok(rt0.ok && rt0.aktif.join() === '1', 'BUG-1 murid asli: t2s publik (tanpa identitas) berhasil dan awalnya hanya langkah 1 terbuka (bukan semua seperti akun uji coba)');
  await G('g-langkah', { n: 2, buka: true }); const rt1 = await api({ a: 't2s' }); ok(rt1.ok && rt1.aktif.join() === '1,2' && rt1.buka === 2, 'BUG-1 murid asli: guru menekan buka langkah 2 → tablet murid melihat langkah 2 pada pemeriksaan berikutnya');
  r = await fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a: 't2s' }) }).then((x) => x.json()); ok(r.ok && r.aktif.join() === '1,2', 'BUG-1: t2s tanpa parameter kelas pun berhasil (kelas bawaan)');
  r = await api({ a: 'status' }); ok(r.ok && Array.isArray(r.diklaim), 'BUG-1: status publik tanpa identitas berhasil');
  await G('g-pameran', { n: 2 }); r = await api({ a: 't2s' }); ok(r.pameran === 2, 'pameran: putaran yang diumumkan guru terbaca tablet tanpa identitas'); await G('g-pameran', { n: 99 }); r = await api({ a: 't2s' }); ok(r.pameran <= 9, 'pameran: nilai dibatasi'); await G('g-pameran', { n: 0 });
  r = await api({ a: 't2', idx: 7, token: 'TAB7', t2: { fung: { skor: 2 }, pam: { benar: 3, peran: 'kelana' }, kartu: ['bawah'], paham: { bawah: 'ya', evil: 'ya' } } }); ok(r.ok, 'perubahan aditif: bidang lama (fung, pam, kartu, paham) tetap diterima');
  await G('g-reset-semua');
  console.log(process.exitCode ? '\nADA UJI GAGAL' : '\nSEMUA UJI API (kelas utama) LULUS');
})();

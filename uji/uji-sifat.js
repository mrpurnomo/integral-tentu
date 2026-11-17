/* Uji sifat materi (tanpa server): generator soal, bank tebak/cocok, tes awal, rute jigsaw, kode hasil, kelompok.
   Jalankan: node uji/uji-sifat.js */
const path = require('path'), B = require(path.join(__dirname, '..', 'api/_lib/bersama.js'));
let gagal = 0; const ok = (c, m) => { if (!c) gagal++; console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); };
const simpson = (f, a, b, n) => { n = n || 4000; const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };

/* 1. generator soal cerita: 7 bagian × 400 benih. Jawaban = luas sebenarnya (integrasi numerik |f − g|), bulat, ≤ 6 karakter */
for (const f of B.URUT) {
  let buruk = 0, salahLuas = 0, kosong = 0, min = 1e9, max = 0; const beda = new Set();
  for (let sd = 0; sd < 400; sd++) {
    const q = B.tantanganAcak(f, sd * 7919 + 13);
    if (!Number.isInteger(q.kunci) || q.kunci <= 0 || String(q.kunci).length > 6) buruk++;
    if (!q.tanya || !q.jelas || q.tanya.length < 40 || q.jelas.length < 40) kosong++;
    const num = simpson((t) => Math.abs(B.pv(q.det.f, t) - B.pv(q.det.g, t)), q.det.a, q.det.b);
    if (Math.abs(num - q.kunci) > 1e-6) salahLuas++;
    min = Math.min(min, q.kunci); max = Math.max(max, q.kunci); beda.add(q.tanya);
  }
  ok(buruk === 0 && kosong === 0 && salahLuas === 0, 'bagian ' + f + ': 400 benih, kunci bulat > 0, tanya/jelas terisi, kunci = luas numerik (rentang ' + min + '–' + max + ')');
  ok(beda.size >= 25, 'bagian ' + f + ': variasi soal cukup (' + beda.size + ' versi berbeda, minimal 25)');
}
/* 2. teks soal bersih */
{ let kotor = 0; for (const f of B.URUT) for (let sd = 0; sd < 200; sd++) { const q = B.tantanganAcak(f, sd * 31 + 5); if (/NaN|undefined|null|Infinity/.test(q.tanya + q.jelas)) kotor++; } ok(kotor === 0, 'tidak ada NaN/undefined di teks soal cerita'); }

/* 3. tes awal: 5 butir × 21 murid + akun uji coba; lima opsi unik; kunci dalam jangkauan */
{ let bad = 0, dup = 0; const versi = new Set(); for (const idx of [...Array(21).keys(), B.DUMMY]) { const s = B.soalSiswa(idx); if (s.length !== 5) bad++; s.forEach((q) => { if (q.opsi.length !== 5 || new Set(q.opsi).size !== 5) dup++; if (q.kunci < 0 || q.kunci > 4 || !q.jelas) bad++; }); versi.add(s.map((q) => q.tanya).join('|')); }
  ok(bad === 0 && dup === 0, 'tes awal: 5 butir, 5 opsi unik, kunci valid untuk semua murid'); ok(versi.size >= 20, 'tes awal berbeda per murid (' + versi.size + ' dari 22 versi)'); }
{ const A = B.soalSiswa(3), A2 = B.soalSiswa(3); ok(JSON.stringify(A) === JSON.stringify(A2), 'tes awal deterministik untuk murid yang sama (server menilai ulang dari benih)');
  const s = B.soalSiswa(5); const n = B.nilai(5, s.map((q) => q.kunci)); ok(n.benar === 5 && B.nilai(5, [null, null, null, null, null]).benar === 0, 'nilai(): semua benar = 5, kosong = 0'); }
/* kunci tes awal soal 1 diperiksa numerik: kunci = ∫ yang tertulis di tanya */
{ let salah = 0, cek = 0; for (let idx = 0; idx < 21; idx++) { const q = B.soalSiswa(idx)[0], teks = q.tanya.replace(/<[^>]+>/g, '').replace(/−/g, '-'); const m = teks.match(/Hitunglah\s*∫(-?\d+)(-?\d+)\s*\(([^)]*)\)\s*dx/); if (!m) { salah++; continue; } cek++; }
  ok(salah === 0 && cek === 21, 'tes awal soal 1 terbaca (21 murid)'); }

/* 4. rute jigsaw sesuai tabel rancangan (kelompok 1–7, Penjelajah A/B, putaran 1–3) */
{ const TABEL = { 1: { A: [2, 3, 4], B: [5, 6, 7] }, 2: { A: [3, 4, 5], B: [6, 7, 1] }, 3: { A: [4, 5, 6], B: [7, 1, 2] }, 4: { A: [5, 6, 7], B: [1, 2, 3] }, 5: { A: [6, 7, 1], B: [2, 3, 4] }, 6: { A: [7, 1, 2], B: [3, 4, 5] }, 7: { A: [1, 2, 3], B: [4, 5, 6] } };
  let sama = true; for (let g = 1; g <= 7; g++) for (const sub of ['A', 'B']) if (JSON.stringify(B.rute3(g, sub)) !== JSON.stringify(TABEL[g][sub])) sama = false; ok(sama, 'rute putaran sama persis dengan tabel rancangan (7 kelompok × A/B × 3 putaran)');
  let tabrakan = 0, tamuSalah = 0; for (let r = 1; r <= 3; r++) { const dA = new Set(), dB = new Set(); for (let g = 1; g <= 7; g++) { dA.add(B.ruteKelana(g, 'A', r)); dB.add(B.ruteKelana(g, 'B', r)); } if (dA.size !== 7 || dB.size !== 7) tabrakan++;
    for (let h = 1; h <= 7; h++) { const t = B.tamuMeja(h, r); if (B.ruteKelana(t.A, 'A', r) !== h || B.ruteKelana(t.B, 'B', r) !== h) tamuSalah++; } }
  ok(tabrakan === 0, 'tiap putaran: tiap pos dikunjungi tepat satu Penjelajah A dan satu Penjelajah B (tanpa tabrakan)'); ok(tamuSalah === 0, 'tamuMeja() adalah kebalikan dari ruteKelana() untuk semua meja dan putaran');
  let lengkap = true; for (let g = 1; g <= 7; g++) { const dari = new Set([...B.rute3(g, 'A'), ...B.rute3(g, 'B')]); if (dari.size !== 6 || dari.has(g)) lengkap = false; } ok(lengkap, 'A dan B berdua mengunjungi keenam pos lain (tanpa pos sendiri, tanpa dobel)');
  let terima = true; for (let g = 1; g <= 7; g++) { if (JSON.stringify(B.posTerima(g, 'A')) !== JSON.stringify(B.rute3(g, 'B')) || JSON.stringify(B.posTerima(g, 'B')) !== JSON.stringify(B.rute3(g, 'A'))) terima = false; } ok(terima, 'Transfer ilmu: A menerima pos yang dikunjungi B, dan sebaliknya'); }
/* 5. bagian kelompok 7 ↔ 7 kunci */
ok(B.URUT.length === 7 && new Set(B.URUT.map((_, k) => B.bagianKelompok(k))).size === 7 && B.bagianKelompok(7) === B.URUT[0], '7 kelompok ↔ 7 bagian (pos), berputar bila lebih');
ok(B.peranDariPos(0).kode === 'jaga' && B.peranDariPos(1).sub === 'A' && B.peranDariPos(2).sub === 'B', 'peran menurut urutan anggota: Host, Penjelajah A, Penjelajah B');

/* 6. bank tebak dan cocokkan: tabel konsisten, semua bagian terwakili */
{ const lengkap = (bank) => B.URUT.every((f) => bank.some((x) => x.fam === f)); ok(lengkap(B.SITUASI) && lengkap(B.DISKUSI), 'bank cocokkan dan tebak memuat ke-7 bagian'); ok(B.SITUASI.length >= 6 && B.DISKUSI.length >= 6, 'bank cukup untuk 5 + 1 butir cocok dan 6 butir tebak');
  let salah = 0; const kur = (sp, i) => (i < 0 ? [0] : sp.k[i]);
  for (const it of B.SITUASI.concat(B.DISKUSI)) { const sp = it.spec; if (!it.alasan || it.baris.length < 3 || it.baris.some((b) => b.length !== it.kol.length)) salah++;
    sp.z.forEach((z) => { for (let t = z.a; t <= z.b + 1e-9; t += (z.b - z.a) / 40) if (B.pv(kur(sp, z.u), t) < B.pv(kur(sp, z.l), t) - 1e-9) salah++; }); }
  ok(salah === 0, 'tabel butir konsisten: kolom sesuai label, atas ≥ bawah pada setiap segmen daerah'); }
/* 7. tugas sintesis (kegiatan khas) */
{ let bad = 0; for (let sd = 0; sd < 300; sd++) { const T = B.tugasSintesis(sd * 13 + 1); if (T.length !== 3) bad++; T.forEach((tg) => { if (tg.label.length !== tg.jawab.length || !tg.jawab.every(Number.isInteger) || tg.petunjuk.length !== 2 || !tg.jelas) bad++; const L = tg.jawab[tg.jawab.length - 1]; if (!(L > 0 && String(L).length <= 6)) bad++;
    const sp = tg.spec; sp.z.forEach((z) => { const kk = (i) => (i < 0 ? [0] : sp.k[i]); for (let t = z.a; t <= z.b + 1e-9; t += (z.b - z.a) / 20) if (B.pv(kk(z.u), t) < B.pv(kk(z.l), t) - 1e-9) bad++; });
    /* luas dari spesifikasi gambar = jawaban terakhir */ const tot = sp.z.reduce((s, z) => s + simpson((t) => B.pv(sp.k[z.u] || [0], t) - B.pv(sp.k[z.l] || [0], t), z.a, z.b, 400), 0); if (Math.abs(tot - L) > 1e-6) bad++; }); }
  ok(bad === 0, 'tugas sintesis: 3 tugas, isian bulat, 2 petunjuk, penjelasan, gambar daerah = jawaban (300 benih)'); }
/* 8. tiket */
{ let bad = 0; for (let idx = 0; idx < 21; idx++) { const t = B.tiketSiswa(idx); if (t.length !== 3 || !Number.isInteger(t[0].kunci) || t[1].opsi.length !== 4 || t[1].kunci < 0 || t[2].kunci < 0) bad++; } ok(bad === 0, 'tiket keluar: hitung (bulat), kenali (4 opsi), cocokkan'); }
/* 9. kode hasil: bolak-balik; salah ketik satu karakter pasti terdeteksi */
{ let bad = 0, lolos = 0, total = 0; for (let idx = 0; idx < 31; idx++) for (let k = 0; k < 30; k++) { const jw = Array.from({ length: 5 }, (_, i) => ((k * 7 + i * 3 + idx) % 6 === 5 ? null : (k + i + idx) % 5)), kode = B.buatKode(idx, jw), r = B.bacaKode(kode); if (r.idx !== idx || JSON.stringify(r.jawab) !== JSON.stringify(jw)) bad++;
    for (let p = 0; p < 5; p++) { const alt = B.ALFA[(B.ALFA.indexOf(kode[p]) + 1 + (k % 30)) % 32]; if (alt === kode[p]) continue; total++; const r2 = B.bacaKode(kode.slice(0, p) + alt + kode.slice(p + 1)); if (!r2.error) lolos++; } }
  ok(bad === 0, 'kode hasil: bolak-balik benar untuk semua idx 0–30'); ok(lolos === 0, 'kode hasil: salah ketik satu karakter selalu terdeteksi (' + total + ' percobaan)'); }
/* 10. kelompok: 21 murid → 7 × 3, heterogen, seimbang; susulan; penuh */
{ const skor = (i) => (i * 5) % 6, sel = Array.from({ length: 21 }, (_, i) => ({ idx: i, skor: skor(i) })), kel = B.bentukKelompok(sel, 'xiia');
  ok(kel.length === 7 && kel.every((g) => g.length === 3), 'kelompok: 7 kelompok × 3 orang'); ok(new Set(kel.flat().map((s) => s.idx)).size === 21, 'tiap murid tepat satu kelompok');
  const rata = kel.map((g) => g.reduce((a, s) => a + s.skor, 0) / 3); ok(Math.max(...rata) - Math.min(...rata) <= 1.4, 'rata-rata skor antar kelompok seimbang: ' + rata.map((x) => x.toFixed(2)).join(' / '));
  ok(kel.every((g) => g[0].skor !== g[2].skor), 'tiap kelompok heterogen (Host dan Penjelajah B berbeda skor)');
  const urut = sel.slice().sort((a, b) => b.skor - a.skor || a.idx - b.idx), host = new Set(kel.map((g) => g[0].idx)); ok(urut.slice(0, 7).every((s) => host.has(s.idx)), 'Host = tujuh peringkat tertinggi (anggota urutan 1 tiap kelompok)');
  const kecil = B.bentukKelompok(sel.slice(0, 20), 'xiia'); ok(kecil.flat().length === 20 && kecil.every((g) => g.length >= 2), '20 murid: tiap kelompok minimal 2 anggota');
  const k2 = B.bentukKelompok(sel.slice(0, 20), 'xiia'), g = B.tambahKelompok(k2, { idx: 20, skor: 3 }, 'xiia'); ok(g >= 0 && k2[g].length === 3, 'murid susulan masuk ke kelompok yang kurang anggota'); ok(B.tambahKelompok(k2, { idx: 21, skor: 1 }, 'xiia') === -1, 'semua kelompok penuh → −1'); }
/* 11. kelas dan nama */
ok(B.cfg('xiia').daftar.length === 21 && B.cfg('xiia').jmlKelompok === 7 && B.cfg('xiia').maks === 3 && B.cfg('xiia').nama === 'XII-A Teknik' && B.cfg('xiia').langkah === 6 && B.DUMMY > 21, 'konfigurasi kelas utama: 21 murid, 7 kelompok × 3, 6 langkah, DUMMY di luar rentang');
ok(B.KELAS_TAMPIL.join() === 'xiia,xiib,xiic,xiid' && B.cfg('xiid').siap === false && B.cfg('xiic').program === 'Kesehatan' && !B.KELAS_TAMPIL.includes('ujim'), 'empat kelas tampil (XII-A/B Teknik, XII-C Kesehatan, XII-D Soshum belum siap); kelas uji tersembunyi');
ok(B.nama(0, 'xiia') !== B.nama(0, 'xiib') && B.nama(B.DUMMY) === 'Siswa Uji Coba (Guru)', 'nama per kelas terpisah; akun uji coba bernama jelas');
/* 12. poin dan lencana bernama akademik */
{ const p = B.hitungPoin({ kartu: { bawah: 1 }, fam: ['bawah'], diskusi: { benar: 6 }, cocok: { benar: 5 }, tiket: { skor: 3 }, pam: { benar: 6 }, fung: { skor: 3 }, tamat: true }); ok(p.poin <= 400 && p.poin >= 170 && p.gelar === 'Pakar Luas Daerah' && p.lencana.length === 7 && p.lencana.every((x) => x.length <= 24), 'poin ≤ 400, gelar akademik, 7 lencana ≤ 24 huruf: ' + p.lencana.join(', ')); }
/* 13. PIN tidak ikut ke halaman murid */
{ const fs = require('fs'), pin = require(path.join(__dirname, '..', 'api/_lib/rahasia.js')).PIN_GURU, bers = fs.readFileSync(path.join(__dirname, '..', 'api/_lib/bersama.js'), 'utf8'); ok(!bers.includes(pin) && B.cekPinLokal(pin) && !B.cekPinLokal('00000'), 'PIN guru tidak tertulis di bersama.js (hanya hash); pemeriksaan lokal benar'); }
/* ---- tes diagnostik baru: kunci diverifikasi NUMERIK (Simpson), bukan dari rumus yang sama dengan pembangkitnya ---- */
{ const mid = (f, a, b, n) => { const h = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += f(a + (i + .5) * h); return s * h; }, simpson = (f, a, b, n) => { n = n || 400; const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  const num = (str) => { const t = str.replace(/<[^>]+>/g, '').replace(/−/g, '-'); const m = t.match(/^(-?\d+)\/(\d+)$/); return m ? +m[1] / +m[2] : +t; };
  let salah = 0, grafik = 0, total = 0, jenis = { 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() };
  for (let idx = 0; idx < 49; idx++) { const so = B.soalSiswa(idx); so.slice(1).forEach((q, k) => { total++; const d = q.det, kunci = num(q.opsi[q.kunci]); let tepat;
    if (d.j === 2) { const f = () => d.k / (d.b - d.a), g = d.jn === 0 ? (x) => f() : d.jn === 1 ? (x) => d.c * f() : d.jn === 2 ? (x) => f() + d.d : (x) => d.c * f() - d.d; tepat = Math.abs(simpson(g, d.b, d.a) - kunci) < 1e-6; jenis[2].add(d.jn); }
    else if (d.j === 3) { const L1 = d.b - d.a, L2 = d.c - d.b, v1 = (d.jn === 3 ? d.p + d.q : d.p) / L1, v2 = (d.jn === 3 ? -d.q : d.q) / L2, I = (u, w) => { /* integral fungsi sepotong-sepotong v1 di [a,b], v2 di [b,c] */ const f = (x) => (x < d.b ? v1 : v2); const s = u < w ? 1 : -1, lo = Math.min(u, w), hi = Math.max(u, w); return s * (mid(f, lo, Math.min(hi, d.b), 40) * (lo < d.b ? 1 : 0) + mid(f, Math.max(lo, d.b), hi, 40) * (hi > d.b ? 1 : 0)); };
      tepat = d.jn === 0 ? Math.abs(I(d.a, d.c) - kunci) < 1e-6 : d.jn === 1 ? Math.abs(I(d.a, d.b) - kunci) < 1e-6 : d.jn === 2 ? Math.abs(I(d.b, d.c) - kunci) < 1e-6 : Math.abs(I(d.a, d.c) - kunci) < 1e-6; jenis[3].add(d.jn); }
    else if (d.j === 4) { const { P, Ln, r1, r2 } = d, pv = (p, x) => p.reduce((s, c, i) => s + c * Math.pow(x, i), 0); tepat = Math.abs(pv(P, r1) - pv(Ln, r1)) < 1e-9 && Math.abs(pv(P, r2) - pv(Ln, r2)) < 1e-9 && simpson((x) => pv(Ln, x) - pv(P, x), r1, r2) > 0 && new Set(q.opsi).size === 5 && q.html === true; jenis[4].add(d.dy ? 'dy' : 'dx'); grafik++; }
    else { const pv = (p, x) => p.reduce((s, c, i) => s + c * Math.pow(x, i), 0); const luas = simpson((x) => Math.abs(pv(d.p, x)), d.a, d.b); const ok1 = d.sg > 0 ? simpson((x) => pv(d.p, x), d.a, d.b) > 0 : simpson((x) => pv(d.p, x), d.a, d.b) < 0; tepat = Math.abs(luas - kunci) < 1e-6 && ok1 && kunci > 0; jenis[5].add(d.sg); grafik++; }
    if (!tepat) { salah++; if (salah < 4) console.log('  SALAH idx', idx, 'soal', k + 2, JSON.stringify(d), q.opsi[q.kunci]); } }); }
  ok(salah === 0, 'tes diagnostik soal 2–5: kunci cocok dengan hitungan numerik (' + total + ' butir, ' + grafik + ' bergambar)');
  ok(jenis[2].size === 4 && jenis[3].size === 4 && jenis[4].size === 2 && jenis[5].size === 2, 'semua variasi muncul di kelas: tukar batas (4), partisi (4), grafik dx/dy (2), di atas/bawah sumbu (2)'); }
{ let bad = 0; for (let idx = 0; idx < 49; idx++) { const so = B.soalSiswa(idx); if (!(so[3].grafik && so[4].grafik && !so[0].grafik && !so[1].grafik && !so[2].grafik)) bad++; so.forEach((q) => { if (q.opsi.length !== 5 || new Set(q.opsi).size !== 5) bad++; }); } ok(bad === 0, 'soal 4 dan 5 bergambar, soal 1–3 tidak; lima opsi berbeda; semua pilihan ganda'); }
{ const so = B.soalSiswa(7); ok(!/integral|∫/.test(so[4].tanya.replace(/<[^>]*>/g, '')) , 'soal 5 tidak menampilkan integralnya (siswa merangkai sendiri)'); }

console.log(gagal ? '\n' + gagal + ' UJI GAGAL' : '\nSEMUA UJI SIFAT LULUS'); process.exitCode = gagal ? 1 : 0;

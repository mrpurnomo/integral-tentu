/* Uji sifat (tanpa server): tes awal (kunci diverifikasi numerik, angka berbeda tiap murid, tingkat sama), generator soal tujuh materi,
   titik potong, bentuk integral, hitung luas, tiket keluar, rute sesi berkeliling, kode hasil, kelompok, rapor. Jalankan: node uji/uji-sifat.js */
const path = require('path'), B = require(path.join(__dirname, '..', 'api/_lib/bersama.js'));
let gagal = 0; const ok = (c, m) => { if (!c) gagal++; console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); };
const simpson = (f, a, b, n = 2000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
const luasNum = (P) => P.z.reduce((s, q) => s + Math.abs(simpson((x) => B.pv(B.kk(P, q.u), x) - B.pv(B.kk(P, q.l), x), q.a, q.b)), 0);
const pecah = (s) => { const m = String(s).replace(/\$/g, '').match(/^(-?)\\frac\{(\d+)\}\{(\d+)\}$/); return m ? (m[1] ? -1 : 1) * (+m[2]) / (+m[3]) : Number(String(s).replace(/\$/g, '')); };

/* ---------- tes awal ---------- */
{
  const N = 49, semua = Array.from({ length: N }, (_, i) => B.soalSiswa(i)); let salahKunci = 0, opsiGanda = 0, adaDolar = 0;
  semua.forEach((so, i) => {
    so.forEach((q, j) => { if (new Set(q.opsi).size !== 5) opsiGanda++; if (!q.tanya.includes('$')) adaDolar++; });
    const d = so.map((q) => q.det), [s1, s2, s3, s4, s5] = so;
    const f1 = d[0].f, k1 = simpson((x) => B.pv(f1, x), d[0].a, d[0].b); if (Math.abs(pecah(s1.opsi[s1.kunci]) - k1) > 1e-6) salahKunci++;
    const e2 = d[1], v2 = -(e2.c * e2.k - e2.d * (e2.b - e2.a)); if (pecah(s2.opsi[s2.kunci]) !== v2) salahKunci++;
    const e3 = d[2]; if (pecah(s3.opsi[s3.kunci]) !== e3.p) salahKunci++;
    const e4 = d[3], teks4 = s4.opsi[s4.kunci]; if (!teks4.includes('\\int_{' + e4.a + '}^{' + e4.b + '}') || !teks4.includes('dx') || teks4.includes('dy')) salahKunci++;
    const e5 = d[4], k5 = simpson((x) => B.pv(e5.p, x), e5.a, e5.b); if (Math.abs(pecah(s5.opsi[s5.kunci]) - k5) > 1e-6) salahKunci++;
  });
  ok(salahKunci === 0, 'tes awal: kunci 5 butir × ' + N + ' murid cocok dengan perhitungan numerik independen');
  ok(opsiGanda === 0, 'tes awal: setiap butir punya lima pilihan berbeda');
  ok(adaDolar === 0, 'tes awal: semua butir memakai penanda rumus KaTeX');
  for (let j = 0; j < 5; j++) { const sig = new Set(semua.map((so) => JSON.stringify(so[j].det, (k, v) => (k === 'kunci' ? undefined : v)))); ok(sig.size === N, 'tes awal: butir ' + (j + 1) + ' — angka berbeda untuk ' + N + ' murid (' + sig.size + ' kombinasi)'); }
  const pola = (q) => q.tanya.replace(/[+-]/g, '±').replace(/±?\d+/g, '#').replace(/\s+/g, ' ');
  for (let j = 0; j < 5; j++) { const set = new Set(semua.map((so) => pola(so[j]))); ok(set.size <= 2, 'tes awal: butir ' + (j + 1) + ' bertipe sama untuk semua murid (' + set.size + ' pola kalimat)'); }
  const besar = semua.map((so) => Math.abs(pecah(so[0].opsi[so[0].kunci]))); ok(Math.max(...besar) / Math.min(...besar.filter((v) => v > 0)) < 400, 'tes awal: besaran jawaban butir 1 sebanding (' + Math.min(...besar) + '–' + Math.max(...besar) + ')');
  ok(semua.every((so) => so[3].grafik && so[4].grafik && !so[0].grafik), 'tes awal: butir 4 dan 5 bergambar, butir 1–3 tidak');
}

/* ---------- generator tujuh materi ---------- */
{
  let salahL = 0, salahAkar = 0, gambar = 0, n = 0;
  B.URUT.forEach((f) => { for (let s = 0; s < 300; s++) { const P = B.buat(f, s); n++; if (!P || !Number.isInteger(P.L) || P.L <= 0) { salahL++; continue; } if (Math.abs(luasNum(P) - P.L) > 1e-6) salahL++; if (P.akar) P.akar.forEach((r) => { if (Math.abs(B.pv(P.k[0], r) - B.pv(P.k[1], r)) > 1e-9) salahAkar++; }); if (P.tipe !== (f === 'sumbuy' || f === 'kanan' ? 'y' : 'x')) gambar++; const t = B.tanyaP(P) + B.jelasP(P); if (!t.includes('$')) gambar++; } });
  ok(salahL === 0, 'tujuh materi: ' + n + ' soal — luas bulat positif dan cocok dengan integrasi numerik');
  ok(salahAkar === 0 && gambar === 0, 'tujuh materi: titik potong memenuhi kedua fungsi; tipe irisan dan teks KaTeX benar');
  const A = B.URUT.map((f) => B.latihan(f, 123456)), A2 = B.URUT.map((f) => B.latihan(f, 654321)); ok(A.some((x, i) => x.tanya !== A2[i].tanya), 'latihan kartu 1: benih berbeda memberi soal berbeda');
}

/* ---------- kartu 3, 4, 5, 6 ---------- */
{
  let rusak = 0;
  for (let s = 0; s < 200; s++) {
    const T3 = B.titikPotongSet(s); if (T3.length !== 3) rusak++;
    T3.forEach((q) => { if (new Set(q.opsi).size !== 5 || q.kunci < 0 || q.kunci > 4) rusak++; const benar = q.P.titik.map((t) => '(' + t.x + ',' + t.y + ')').join('\\text{ dan }'); if (q.opsi[q.kunci] !== B.M(benar)) rusak++; q.P.titik.forEach((t) => { if (Math.abs(B.pv(q.P.k[0], t.x) - t.y) > 1e-9 || Math.abs(B.pv(q.P.k[1], t.x) - t.y) > 1e-9) rusak++; }); });
    const T4 = B.bentukSet(s); if (T4.length !== 7 || T4.map((q) => q.fam).join() !== B.URUT.join()) rusak++;
    T4.forEach((q) => { if (new Set(q.opsi).size !== q.opsi.length || q.opsi.length < 4 || q.kunci < 0 || q.opsi.filter((o, i) => i === q.kunci).length !== 1) rusak++; });
    const L5 = B.luasSet(s, ['garis', 'potong']); if (L5.length !== 3 || !L5.every((q) => Number.isInteger(q.kunci) && q.kunci > 0)) rusak++;
    const L5b = B.luasSet(s, B.URUT); if (new Set(L5b.map((q) => q.fam)).size !== 3) rusak++;
    const K6 = B.tiketSet(s); if (K6.length !== 3 || K6.map((q) => q.tingkat).join() !== 'Mudah,Sedang,Sulit' || !K6.every((q) => Number.isInteger(q.kunci))) rusak++;
    const q0 = K6[0]; if (!q0.jelas.includes('$')) rusak++;
  }
  ok(rusak === 0, 'kartu 3–6: 200 benih — titik potong, pilihan bentuk integral, soal luas, dan tiket keluar valid');
  const a = B.titikPotongSet(B.seedKelompok('xiia', 1, 3)), b = B.titikPotongSet(B.seedKelompok('xiia', 1, 3)), c = B.titikPotongSet(B.seedKelompok('xiia', 2, 3));
  ok(JSON.stringify(a) === JSON.stringify(b), 'soal sama untuk satu kelompok (benih kelompok)');
  ok(JSON.stringify(a) !== JSON.stringify(c), 'soal berbeda antarkelompok');
  const sk = new Set([1, 2, 3, 4, 5, 6, 7].map((g) => B.seedKelompok('xiia', g, 4))); ok(sk.size === 7, 'benih kelompok unik untuk 7 kelompok');
}

/* ---------- peran, rute, kode, kelompok, rapor ---------- */
{
  let rute = true; for (let g = 1; g <= 7; g++) { const A = B.rute3(g, 'A'), Bb = B.rute3(g, 'B'), semua = new Set(A.concat(Bb)); if (semua.size !== 6 || semua.has(g)) rute = false; }
  ok(rute, 'rute: Penjelajah A dan B tiap kelompok bersama-sama mengunjungi tepat enam kelompok lain');
  let tamu = true; for (let h = 1; h <= 7; h++) { const t = B.tamuHost(h); if (t.length !== 6 || new Set(t.map((x) => x.g)).size !== 6) tamu = false; t.forEach((x) => { if (!B.rute3(x.g, x.sub).includes(h)) tamu = false; }); }
  ok(tamu, 'rute: tiap Host menerima tepat satu tamu dari tiap kelompok lain, dan itu sesuai rute Penjelajah');
  const pasang = new Set(); for (let g = 1; g <= 7; g++) ['A', 'B'].forEach((s) => B.rute3(g, s).forEach((h) => pasang.add(g + ':' + h))); ok(pasang.size === 42, 'rute: 42 pertemuan unik (7 × 6)');
  ok(B.daftarKunjungan(3, 'A', false).length === 6 && B.daftarKunjungan(3, 'A', true).length === 3, 'Penjelajah tanpa rekan mengambil enam kelompok');
  /* pembagian tujuan Penjelajah: rata, lepas satu sama lain, tiap kelompok lain dikunjungi tepat satu Penjelajah dari kelompok asal */
  { let baik = true, pesan = '';
    for (let K = 2; K <= 7; K++) { const ada = Array.from({ length: K }, (_, i) => i + 1); for (let g = 1; g <= K; g++) for (let n = 1; n <= 5; n++) { const c = B.bagiTujuan(ada, g, n), semua = [].concat(...c), uk = c.map((x) => x.length); if (c.length !== n || semua.length !== K - 1 || new Set(semua).size !== K - 1 || semua.includes(g) || Math.max(...uk) - Math.min(...uk) > 1) { baik = false; pesan = 'K=' + K + ' g=' + g + ' n=' + n; } } }
    ok(baik, 'bagiTujuan: untuk 2–7 kelompok dan 1–5 Penjelajah, bagian lepas, rata (selisih ≤ 1), dan mencakup semua kelompok lain ' + pesan);
    let sama = true; for (let g = 1; g <= 7; g++) { const c = B.bagiTujuan([1, 2, 3, 4, 5, 6, 7], g, 2); if (c[0].join() !== B.rute3(g, 'A').join() || c[1].join() !== B.rute3(g, 'B').join()) sama = false; } ok(sama, 'bagiTujuan untuk 7 kelompok × 2 Penjelajah sama dengan rute lama (A lalu B)');
    const rc = B.rencanaStatis([4, 3, 3, 3, 3, 3, 3]), kunj = {}; rc.forEach((sl, gi) => sl.forEach((x) => x.h.forEach((h) => { const k = h + ':' + (gi + 1); kunj[k] = (kunj[k] || 0) + 1; }))); ok(Object.keys(kunj).length === 42 && Object.values(kunj).every((v) => v === 1) && rc[0].map((x) => x.sub).join() === 'A1,A2,B' && rc[0].every((x) => x.h.length === 2), 'rencana kelas XII-C (satu kelompok 4 orang): 42 pertemuan, masing-masing tepat sekali, kelompok 4 orang berlabel A1, A2, B dengan 2 tujuan'); }
  ok(B.kapasitasPeran(3).join() === '1,1,1' && B.kapasitasPeran(7).join() === '1,3,3', 'kapasitas peran per kelompok');
  /* rencana kelompok cerdas */
  let rcn = true; for (let n = 1; n <= 49; n++) { const r = B.rencanaKelompok(n), jml = r.ukuran.reduce((a, b) => a + b, 0), mx = Math.max(...r.ukuran), mn = Math.min(...r.ukuran); if (jml !== n || r.K > 7 || mx - mn > 1 || (n >= 14 && r.K !== 7) || (n >= 4 && mn < 2)) rcn = false; }
  ok(rcn, 'rencana kelompok: jumlah hadir 1–49 habis terbagi, selisih ukuran ≤ 1, tujuh kelompok bila ≥ 14, minimal 2 orang bila ≥ 4');
  { const sel = Array.from({ length: 18 }, (_, i) => ({ idx: i, skor: i % 6 })), k = B.bentukKelompok(sel, 'xiic', true), uk = k.map((g) => g.length).join(); ok(uk === '3,3,3,3,2,2,2' && k.flat().length === 18, 'susun ulang 18 hadir: 3,3,3,3,2,2,2 (' + uk + ')');
    const rata = k.filter((g) => g.length).map((g) => g.reduce((a, s) => a + s.skor, 0) / g.length); ok(Math.max(...rata) - Math.min(...rata) <= 2, 'susun ulang: rata-rata skor antarkelompok seimbang');
    const sedikit = Array.from({ length: 10 }, (_, i) => ({ idx: i, skor: i % 5 })), k2 = B.bentukKelompok(sedikit, 'xiic', true); ok(k2.slice(0, 5).every((g) => g.length === 2) && k2.slice(5).every((g) => !g.length), '10 hadir: lima kelompok berdua, dua kelompok terakhir kosong');
    const tk = B.tambahKelompok(k2, { idx: 20, skor: 3 }, 'xiic', 5); ok(tk >= 0 && tk < 5, 'siswa yang menyusul masuk ke kelompok aktif, bukan kelompok kosong'); }
  ok(B.kapasitasPeran(2).join() === '1,1,1' && B.kapasitasPeran(4).join() === '1,2,1' && B.kapasitasPeran(5).join() === '1,2,2', 'kapasitas peran menyesuaikan ukuran kelompok (2, 4, 5 orang)');
  const so = B.soalSiswa(5), jw = so.map((q) => q.kunci), kode = B.buatKode(5, jw), r = B.bacaKode(kode); ok(r.idx === 5 && r.jawab.join() === jw.join(), 'kode hasil: tulis dan baca kembali');
  const sel = Array.from({ length: 21 }, (_, i) => ({ idx: i, skor: (i * 7) % 6 })), kel = B.bentukKelompok(sel, 'xiia'); ok(kel.length === 7 && kel.every((g) => g.length === 3), 'kelompok: 7 × 3 dari 21 murid');
  const k2 = Array.from({ length: 7 }, () => []); const p = B.tambahKelompok(k2, { idx: 0, skor: 3 }, 'xiia'); ok(p >= 0 && k2[p].length === 1, 'kelompok langsung: murid ditambahkan ke kelompok yang kurang');
  const R = B.rapor({ k1: { selesai: true }, k2: { selesai: true }, k3: { benar: 3, selesai: true }, k4: { benar: 7, selesai: true }, k5: { benar: 3, selesai: true }, k6: { benar: 3, selesai: true } }, 4);
  ok(R.nilai === 100 && R.capaian === 100 && R.predikat === 'Sangat baik' && R.awal === 80 && R.naik === 20, 'rapor: nilai, capaian, predikat, dan selisih dengan tes awal');
  const R0 = B.rapor({}, null); ok(R0.nilai === 0 && R0.capaian === 0 && R0.awal === null, 'rapor kosong aman');
}
console.log(gagal ? '\nADA ' + gagal + ' UJI GAGAL' : '\nSEMUA UJI SIFAT LULUS'); process.exitCode = gagal ? 1 : 0;

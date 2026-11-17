# Peta Kode — generik vs khas materi

Salinan kode web "Grafik Fungsi" (nama murid disamarkan). Gunakan sebagai **basis**; jangan menulis ulang mesin.
Label: **[G]** generik (pakai apa adanya) · **[C]** campuran · **[M]** khas materi (ganti).

```
referensi-kode/
├─ api/
│  ├─ app.js                      [G]  satu fungsi serverless: semua aksi murid & guru, Redis REST, konteks per kelas
│  └─ _lib/bersama.js             [C]  dimuat klien + server
│       ├ KELAS_CFG, DAFTAR, DAFTAR_G, nama(), durasi(), cfg()          [G] (isi nama: ganti)
│       ├ mulberry/rint/acak/pil, ambilOpsi, buatKode/bacaKode          [G]
│       ├ bentukKelompok, tambahKelompok                                 [G]
│       ├ NAMA_FAM, SET, bagianPasangan                                  [G] struktur, [M] isi kunci
│       ├ soalSiswa, nilai                                               [M] 5 slot tes awal
│       ├ TANTANGAN/tantanganAcak                                        [M] generator soal cerita per bagian
│       ├ SITUASI, PENGECOH, ALASAN, cocokSiswa                          [M] bank "cocokkan"
│       ├ DISKUSI, PROMPT, diskusiSiswa                                  [M] bank "tebak"
│       ├ tiketSiswa                                                     [M]
│       ├ tugasFungsi                                                    [M] kegiatan khas
│       └ hitungPoin                                                     [G] struktur, [M] nama lencana
├─ sumber/
│  ├─ ui.js                       [G]  elemen, dialog, toast, papanKetik, keypadAngka, seret, animasi/token, ikon
│  ├─ grafik.js                   [M]  mesin gambar SVG + katalog K (bagian materi)
│  ├─ intro.js                    [C]  pemutar adegan [G]; ADEGAN & fungsi adegan [M]
│  ├─ siswa.js                    [G]  alur murid (teks [M])
│  ├─ tahap2.js                   [C]  hub, kartu pakar, pameran, diskusi, cocokkan, tiket, refleksi, penghargaan [G pola];
│  │                                   langkahXG/L teks, fungsiDemo/fungsiSoal [M]
│  ├─ guru.js                     [G]  pemilih kelas, pantau, papan kelompok, tahap 2, pewaktu, panggung kelas
│  ├─ catatan.js                  [C]  kerangka PDF [G]; isi halaman [M]
│  ├─ cetak.js                    [G]  PDF kelompok
│  ├─ tema.css / layar.css / intro.css / tahap2.css / guru.css          [G] (warna f-* dan ilustrasi [M])
│  ├─ halaman.html, bangun.js     [G]  kerangka dan perakit berkas tunggal
│  └─ fonts/                      lisensi OFL saja (berkas .ttf tidak disalin; unduh ulang dan sesuaikan bangun.js)
├─ uji/
│  ├─ dev-server.js               [G]  server lokal + Redis tiruan di memori
│  ├─ uji-web.js                  [C]  uji API kelas otomatis (56)
│  └─ uji-xig.js                  [C]  uji API kelas manual (23)
├─ vercel.json, package.json, README.md, .gitignore
```

## Cara menjalankan lokal
1. `node sumber/bangun.js` (butuh berkas `.ttf` di `sumber/fonts`; lihat berkas lisensi `*-OFL.txt` untuk sumber font).
2. Sesuaikan `ROOT` di `uji/dev-server.js`, lalu `node uji/dev-server.js` (port 3200, Redis tiruan 3201).
3. `node uji/uji-web.js` dan `node uji/uji-xig.js` — semua harus lulus.
4. Buka `http://localhost:3200/` (murid) dan `/guru.html` (guru). PIN bawaan ada di `bersama.js` (**ganti!**).

## Catatan penyalinan
- `bersama.js` di sini memakai nama samaran; ubah `DAFTAR`/`DAFTAR_G`.
- Berkas hasil build (`index.html`, `guru.html`, `cadangan/…`) tidak disertakan; buat ulang dengan `bangun.js`.
- Font tidak disalin; unduh Bricolage Grotesque, Instrument Sans, Lora (OFL) atau font pengganti, dan perbarui daftar di `bangun.js`.

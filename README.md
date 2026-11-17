# Area & Calculus

Pembelajaran **luas daerah dengan integral tentu** (di bawah kurva dan antara dua kurva; irisan dx dan dy) untuk kelas XII, SMA Vidatra Bontang. Tablet murid **mendatar (landscape)**, laptop guru. Satu pertemuan 3 JP dengan jigsaw 7 pos × 3 murid.

| Halaman | Alamat | Untuk |
|---|---|---|
| Murid | `/` | pengantar animasi (9 slide) → tes diagnostik 5 soal → kelompok langsung → 6 langkah → Kartu Penghargaan + catatan PDF |
| Guru | `/guru` (atau tombol **Guru** di layar sambutan) | penjelasan (pengantar yang sama), pantau, kelompok, tahap 2, kode hasil, pewaktu |

Empat kelas terdaftar: **XII-A Teknik**, **XII-B Teknik**, **XII-C Kesehatan** (materi: luas daerah di antara dua kurva dan semua variasinya; siap dipakai) dan **XII-D Soshum** (dasar integral tentu dalam dua pertemuan; materinya menyusul, kelasnya sudah terdaftar). Kelas uji tersembunyi `ujim` hanya untuk uji otomatis.

Keputusan materi: lihat [KEPUTUSAN-MATERI.md](KEPUTUSAN-MATERI.md).

## Memasang di Vercel (±10 menit)

1. Vercel → **Add New → Project** → impor repositori ini → **Deploy** (tanpa pengaturan build; berkas `index.html` dan `guru.html` hasil build sudah ada di repositori).
2. Database Redis: **Storage → Create Database → Upstash (Redis)** bila slot gratis masih ada. Bila tidak (batas 1 database), buat database di console.upstash.com (wilayah Singapura) lalu isi **Settings → Environment Variables** dengan `UPSTASH_REDIS_REST_URL` (alamat `https://…upstash.io`) dan `UPSTASH_REDIS_REST_TOKEN` (token biasa, bukan *Read-Only*) untuk Production, Preview, dan Development. Nama `KV_REST_API_URL/TOKEN` juga dikenali. Data tiap proyek tidak bertabrakan karena kunci berawalan `ac:`.
3. **Deployments → Redeploy** supaya variabel terbaca.
4. Buka `/`, pilih **Guru**, masukkan PIN. Chip **server aktif** (ikon wifi) berarti tersambung.

Tanpa langkah 2–3 aplikasi berjalan dalam **mode mandiri**: nama tidak dikunci, hasil diserahkan lewat kode 5 karakter yang diketik guru di tab *Kode*.

### PIN guru

PIN (5 angka) ada di `api/_lib/rahasia.js` — berkas **khusus server** yang **tidak ikut dibangun** ke halaman murid. Halaman murid hanya memuat *hash* PIN (untuk masuk guru saat mode mandiri). Ganti PIN: ubah `PIN_GURU` di `rahasia.js`, ubah `PIN_SHA` di `bersama.js` (hasilnya `sha256("area-calculus:" + PIN)`; lihat `cekPinLokal`), jalankan `node sumber/bangun.js`, lalu commit. Variabel `GURU_PIN` di Vercel (bila ada) ikut berlaku, jadi **hapus** variabel itu bila masih berisi PIN lama. **Jangan menulis PIN di dokumen atau repositori publik.**

## Mengisi nama murid

Satu-satunya tempat nama: `api/_lib/daftar.js` (urut tetap = nomor murid). Kunci kelas: `xiia`, `xiib`, `xiic`, `xiid`. Jumlah murid bebas (maksimum 49); selalu 7 kelompok dan anggota tiap kelompok menyesuaikan (jumlah murid ÷ 7, minimal 3). Cara cepat:

```bash
node tools/isi-nama.js xiia nama-kelas.txt   # satu nama per baris; huruf mirip dari alfabet lain diganti dan dilaporkan
node sumber/bangun.js
node uji/uji-sifat.js
```

Setelah itu commit dan **jadikan repositori privat** (daftar nama ikut di dalamnya). Nama kelas ada di `KELAS_CFG` pada `api/_lib/bersama.js` (`XII-A Teknik`, `XII-B Teknik`, `XII-C Kesehatan`, `XII-D Soshum`).

## Alur di kelas (3 JP)

1. **Guru** membuka `/guru` → PIN → pilih kelas → tab **Penjelasan** (pengantar 9 bab, satu adegan bersambung bergaya Manim). Guru memutar **satu langkah setiap menekan Lanjut** (atau tombol panah kanan / spasi); Mundur membangun ulang adegan ke langkah sebelumnya; Ulangi langkah memutar ulang langkah itu. Tablet murid **mengikuti langkah guru** (posisi dibaca tiap ±2,5 detik, tombol murid menjadi "Mengikuti guru"); bila server belum tersambung atau guru belum mulai, murid berjalan sendiri. Grafik punya tombol zoom + / − / ⌂ dan sumbu x dan y berangka kelipatan 1.
2. **Murid**: pilih kelas dan nama → konfirmasi → pengantar → tes diagnostik (10 menit, 5 soal pilihan ganda) → hasil dan pembahasan → *Lihat kelompok*.
3. **Kelompok langsung**: begitu seorang murid menekan *Lihat kelompok*, ia otomatis masuk ke kelompok yang kurang anggota (seimbang menurut skor) dan tablet murid lain ikut menampilkannya dalam ±4 detik tanpa memuat ulang. Murid yang sudah masuk tidak pernah berpindah. Guru tidak perlu membuka apa pun; tab **Kelompok** punya tombol *Kunci* bila perlu menahan.
4. **Pewaktu** (ikon jam di header) mengikuti rancangan: *Lanjut ke tahap berikutnya* membuka langkah yang sesuai dan mengumumkan Putaran 1–3 serta Transfer ilmu 1–2 ke tablet murid. Tombol-tombol yang sama ada di tab **Tahap 2** (buka/tutup tiap langkah, pengumuman putaran, tabel siapa-ke-mana).
5. Akhir: **Panggung Kelas** (guru), Kartu Penghargaan dan Catatan belajar (PDF) di tablet murid.

Mengatur ulang satu nama (tablet berganti): **Pantau** → ketuk nama → *Atur ulang nama ini*. Reset seluruh kelas: **Pantau** → *Atur ulang semua* (arsip kelompok **tidak** terhapus). Menyimpan/memuat kelompok: tab **Kelompok** → *Simpan kelompok* / *Muat tersimpan* (kelompok otomatis terbentuk juga tersimpan sendiri). *Unduh PDF* menghasilkan kartu kelompok dan tabel rotasi.

Akun uji coba: layar pilih nama → *Akun uji coba (guru)* (butuh PIN). Tidak masuk statistik atau kelompok.

## Pengembangan dan uji

```bash
node sumber/bangun.js          # WAJIB setelah mengubah sumber; hasil build (index.html, guru.html, cadangan/) ikut di-commit
node uji/dev-server.js         # server lokal :3200 dengan Redis TIRUAN di memori
node uji/uji-sifat.js          # sifat materi: 7 generator × 400 benih, tes diagnostik (kunci diverifikasi numerik), rute rotasi, kode hasil, kelompok, bank soal
node uji/uji-web.js            # API kelas utama (xiia) + tiruan klien murid asli untuk bug PRD §7
node uji/uji-manual.js         # API kelas uji tersembunyi (kelompok disusun guru)
node uji/isi-kelas.js 3        # bantu uji manual: isi kelas dengan murid tiruan dan buka gerbang
```

Skrip uji menolak berjalan bila server tidak mengirim `x-dev-redis: tiruan` (mencegah menghapus data nyata).

### Daftar periksa peramban (dijalankan sebelum hari pakai)

- Alur murid **asli** (bukan akun uji coba): sambutan → nama → pengantar → tes → hasil → kelompok → langkah dibuka guru → kartu pakar → pameran → tebak → cocokkan → sintesis → tiket → refleksi → penghargaan → PDF.
- Header guru muat di 1280 px: di konsol `document.getElementById('atas').scrollWidth` harus sama dengan `clientWidth`.
- PDF tidak terpotong: untuk tiap `#catatan .hal` dan `#cetak-kel .kh`, elemen berkelas `.jenis, .cocok, .pakar, .kasus, .soal, .kotak, .kk` harus punya `scrollHeight <= clientHeight`.
- Animasi: tombol *Ulangi langkah*, kecepatan 1×/2×/3×, zoom grafik, dan Mundur. Tidak ada animasi yang berjalan sampai akhir sendirian: setiap langkah menunggu tombol Lanjut guru.

## Struktur

```
api/app.js            satu fungsi serverless (semua aksi), Upstash Redis lewat REST, konteks per kelas
api/_lib/bersama.js   dimuat peramban DAN server: konfigurasi kelas, 7 pos, rute jigsaw, tes awal, generator soal, bank tebak/cocok, kode hasil, kelompok, skor
api/_lib/daftar.js    nama murid (dibangun ke halaman)
api/_lib/rahasia.js   PIN guru (HANYA server)
sumber/               HTML/CSS/JS sumber (ui, grafik = mesin visual daerah, intro, siswa, tahap2, guru, catatan, cetak) + font OFL
uji/                  server uji dan uji otomatis
tools/isi-nama.js     pengisi daftar nama
```

## Catatan risiko

- Kunci jawaban tes awal ikut dalam berkas halaman murid (diagnostik, bukan ujian); murid yang membuka kode sumber dapat melihatnya. Server tetap menilai ulang dari benih.
- PIN: 5 angka; hash-nya ada di halaman murid (hanya untuk mode mandiri) sehingga murid yang sangat berniat bisa menebasnya. Tindakan guru di server tetap membutuhkan PIN asli; jaga repositori privat.
- Jaringan sekolah: tablet memeriksa guru tiap ±4 detik; bila gagal, status "Belum bisa memeriksa guru" tampil dan ada tombol **Segarkan**.
- Tablet nyata belum diuji (hanya peramban desktop dengan ukuran 1280×800): cek ketukan, layar penuh, dan kunci orientasi pada gladi.

Font: Bricolage Grotesque, Instrument Sans, Instrument Serif, dan Geist Mono (SIL OFL 1.1), ditanam ke halaman (folder `sumber/fonts`).

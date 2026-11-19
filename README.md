# Area & Calculus

Pembelajaran **luas daerah dengan integral tentu** (di bawah kurva dan antara dua kurva; irisan dx dan dy) untuk kelas XII, SMA Vidatra Bontang. Tablet murid **mendatar (landscape)**, laptop guru. Satu pertemuan 3 JP dengan jigsaw 7 pos × 3 murid.

| Halaman | Alamat | Untuk |
|---|---|---|
| Murid | `/` | pengantar animasi (9 bagian) → tes diagnostik 5 soal (dengan coretan) → kelompok langsung → dasbor (pilih peran) → 6 kartu → ringkasan akhir + catatan A4 |
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

1. **Guru** membuka `/guru` → PIN → pilih kelas → tab **Penjelasan** (pengantar 9 bagian, satu adegan bersambung bergaya Manim). Guru memutar **satu langkah** dengan tombol Lanjut / panah kanan; **Mundur / panah kiri memutar animasi yang sama terbalik** (bukan potong dari awal). Setiap langkah hitungan berhenti sendiri-sendiri, jadi mudah dijelaskan. Tablet murid **tidak pernah melompat sendiri**: murid boleh mundur, maju, dan mengulang langkah sampai posisi guru (tidak mendahului); bila sejajar dengan guru ia ikut otomatis, bila tidak ada tombol **Ikuti guru** (±2,5 detik). Pada bagian *Tujuh materi*, daftar materi dapat diketuk. **Animasi papan hitung tidak memakai morf**: tiap token memiliki satu jalur (geser, pudar, muncul; ukuran tidak berubah) dan Mundur memutar jalur yang sama dari belakang, jadi mundur selalu cermin maju. Aljabar memakai satu pola baku (aljabar.js): ∫ dan dx hilang diganti kurung siku berbatas dan pangkat naik 1, bagi pangkat baru, hitung, sederhanakan, substitusi, hasil; pindah ruas = suku terbang melintasi = dan tandanya berubah. Zoom pada grafik adalah animasi penyorot yang dijalankan skenario (titik potong x = −1, lalu x = 2, lalu zoom out), bukan tombol manual. Rumus dirender KaTeX.
2. **Murid**: pilih kelas dan nama → konfirmasi → pengantar → tes diagnostik (10 menit, 5 soal PG, ada **coretan layar**, nonaktif di awal; tombol *Coretan* menyalakan alat dan memberi penanda aktif) → hasil dan pembahasan → *Lihat kelompok*. Tipe dan tingkat kesulitan soal sama untuk semua murid, angka berbeda tiap murid.
3. **Kelompok langsung**: murid yang menekan *Lihat kelompok* otomatis masuk kelompok (seimbang menurut skor); tablet lain ikut menampilkannya dalam ±4 detik. Setelah *Saya sudah di meja kelompok*, muncul pop-up kelompok, teman, dan materi. **Jumlah hadir tidak harus kelipatan 7**: tab **Kelompok** menampilkan rencana untuk yang hadir (tujuh kelompok bila hadir ≥ 14; bila lebih sedikit, hadir ÷ 2 kelompok memakai materi 1 sampai K; ukuran selisih paling banyak 1). Setelah kehadiran jelas, tekan **Susun ulang dari hasil terkini**; peran, kunjungan, dan tamu otomatis menyesuaikan kelompok yang ada.
4. **Dasbor tahap lanjutan**: kiri = anggota kelompok dan **pilih peran** (Host, Penjelajah A, Penjelajah B; realtime, tidak bisa ganda; tombol *Simpan peran*). Kanan = enam kartu yang dibuka guru:
   1. **Belajar Kelompok**: penjelasan animasi materi kelompok + latihan soal bergambar (selalu baru) + pembahasan beranimasi → *Selesai belajar*.
   2. **Sesi Berkeliling**: Host mengajar (tombol *Mengajar*: penjelasan animasi + latihan) dan menandai tamu; Penjelajah mengunjungi bagiannya (tiga kelompok pada kelompok 3 orang; dibagi rata dan tidak sama dengan rekannya, bebas urutan) dan menandai *Sudah belajar*, lalu memilih Paham / Lumayan / Tidak paham, lalu *Lihat materi*. **Penanda hanya sah bila kode cocok**: Host menampilkan kode 3 karakter, Penjelajah memilih kode yang sama di antara tiga pilihan (seperti pencocokan angka pada autentikator). Tombol *Selesai* tetap bisa ditekan bila belum lengkap, tetapi berwarna lain, ada peringatan, dan bagian yang dilewati dicatat untuk guru.
   3. **Titik Potong**: tiga soal, grafik tanpa angka pada sumbu, coretan; soal sama untuk satu kelompok.
   4. **Bentuk Integral**: tujuh soal (satu per materi), grafik lengkap + arsiran, pilih bentuk integral; soal sama untuk satu kelompok.
   5. **Hitung Luas**: tiga soal acak dari materi yang sudah dipelajari kelompok; tiap murid **memilih satu kartu soal secara langsung** (tidak bisa dipilih ganda); hasil kelompok terakumulasi.
   6. **Tiket Keluar**: tiga soal bertingkat (mudah, sedang, sulit); soal sama untuk satu kelompok.
5. **Ringkasan akhir** (menyala bila enam kartu selesai): capaian kegiatan, nilai kinerja (kartu 3–6), perbandingan dengan tes awal, statistik singkat, perayaan, tombol kembali ke dasbor, dan **Unduh catatan (A4)** berisi seluruh materi, soal kelompok, dan rapor.
6. **Pewaktu** (ikon jam di header guru) mengikuti kartu: *Lanjut ke tahap berikutnya* membuka kartu yang sesuai. Tab **Tahap 2** memuat tombol buka/tutup tiap kartu, sebaran peran, jumlah pertemuan terverifikasi (dari 42), siswa yang melewati bagian, capaian dan nilai tiap siswa, serta *Rekap kelas*.

Mengatur ulang satu nama (tablet berganti): **Pantau** → ketuk nama → *Atur ulang nama ini*. Reset seluruh kelas: **Pantau** → *Atur ulang semua* (arsip kelompok **tidak** terhapus). Menyimpan/memuat kelompok: tab **Kelompok** → *Simpan kelompok* / *Muat tersimpan* (kelompok otomatis terbentuk juga tersimpan sendiri). *Unduh PDF* menghasilkan kartu kelompok dan tabel rotasi.

Akun uji coba: layar pilih nama → *Akun uji coba (guru)* (butuh PIN). Tidak masuk statistik atau kelompok.

## Pengembangan dan uji

```bash
node sumber/bangun.js          # WAJIB setelah mengubah sumber; hasil build (index.html, guru.html, cadangan/) ikut di-commit
node uji/dev-server.js         # server lokal :3200 dengan Redis TIRUAN di memori
node uji/uji-sifat.js          # sifat materi: 7 generator × 400 benih, tes diagnostik (kunci diverifikasi numerik), rute rotasi, kode hasil, kelompok, bank soal
node uji/uji-web.js            # API kelas utama (xiia) + tiruan klien murid asli untuk bug PRD §7
node uji/uji-lanjut.js         # API tahap lanjutan: peran tanpa ganda, pencocokan kode, kartu 5 serempak, rekap guru
node uji/uji-manual.js         # API kelas uji tersembunyi (kelompok disusun guru)
node uji/uji-xiic.js           # API kelas XII-C (22 murid): kelompok 4,3,3,3,3,3,3, peran kelompok 4 orang, kartu 5 dibagi, hadir sebagian
node uji/isi-kelas.js 3        # bantu uji manual: isi kelas dengan murid tiruan dan buka gerbang
```

Skrip uji menolak berjalan bila server tidak mengirim `x-dev-redis: tiruan` (mencegah menghapus data nyata).

### Daftar periksa peramban (dijalankan sebelum hari pakai)

- Alur murid **asli** (bukan akun uji coba): sambutan → nama → pengantar → tes → hasil → kelompok → dasbor (pilih peran) → kartu 1–6 → ringkasan akhir → catatan A4.
- Header guru muat di 1280 px: di konsol `document.getElementById('atas').scrollWidth` harus sama dengan `clientWidth`.
- PDF tidak terpotong: untuk tiap `#catatan .hal` dan `#cetak-kel .kh`, `.h-isi` / `.kk` harus punya `scrollHeight <= clientHeight`.
- Animasi: Lanjut/Mundur (panah kiri/kanan) memutar maju dan terbalik dengan mulus, tombol *Ulangi langkah*, kecepatan 1×/2×/3×. Tidak ada animasi yang berjalan sampai akhir sendirian.

## Struktur

```
api/app.js            satu fungsi serverless (semua aksi), Upstash Redis lewat REST, konteks per kelas
api/_lib/bersama.js   dimuat peramban DAN server: konfigurasi kelas, 7 pos, rute jigsaw, tes awal, generator soal, bank tebak/cocok, kode hasil, kelompok, skor
api/_lib/daftar.js    nama murid (dibangun ke halaman)
api/_lib/rahasia.js   PIN guru (HANYA server)
sumber/               HTML/CSS/JS sumber: ui, matematika (KaTeX), adegan (mesin animasi), panggung (pengantar), pelajaran (animasi materi dan pembahasan), coretan, lanjut (dasbor dan kartu), siswa, guru, catatan, cetak + font OFL dan KaTeX (MIT)
uji/                  server uji dan uji otomatis
tools/isi-nama.js     pengisi daftar nama
```

## Catatan risiko

- Kunci jawaban tes awal ikut dalam berkas halaman murid (diagnostik, bukan ujian); murid yang membuka kode sumber dapat melihatnya. Server tetap menilai ulang dari benih.
- PIN: 5 angka; hash-nya ada di halaman murid (hanya untuk mode mandiri) sehingga murid yang sangat berniat bisa menebasnya. Tindakan guru di server tetap membutuhkan PIN asli; jaga repositori privat.
- Jaringan sekolah: tablet memeriksa guru tiap ±4 detik; bila gagal, status "Belum bisa memeriksa guru" tampil dan ada tombol **Segarkan**.
- Tablet nyata belum diuji (hanya peramban desktop dengan ukuran 1280×800): cek ketukan, layar penuh, dan kunci orientasi pada gladi.

Font: Bricolage Grotesque, Instrument Sans, Instrument Serif, dan Geist Mono (SIL OFL 1.1), ditanam ke halaman (folder `sumber/fonts`). Rumus: KaTeX 0.16 (MIT, `sumber/katex`), tertanam sehingga tidak butuh internet.


### Akun uji coba guru

Semua tombol aktif (tanpa kunci): peran bebas dipilih dan diganti, *Sudah belajar* menerima kode apa pun, Host dapat menganggap tamu cocok, Paham/Lumayan/Tidak paham, Selesai belajar, Kumpulkan, dan Ringkasan akhir tidak terkunci. Data uji coba memakai ruang kunci terpisah sehingga tidak memengaruhi kelompok, peran, pertemuan, atau kartu 5 murid asli.

## XII-D (soshum): mode LKPD

Kelas dengan `mode: 'lkpd'` (XII-D) tidak memakai jigsaw. Alurnya: pilih nama → pilih pertemuan (1 aktif, 2 menyusul) → dasbor (peringkat, teman sekelas, statistik, tombol **Unduh LKPD-mu** dan **Input jawabanmu**) → tap jawaban A–E → konfirmasi → skor, motivasi, konfeti. Jawaban hanya bisa dikirim **sekali**.

- Tiket keluar unik per murid dibangkitkan oleh `api/_lib/lkpd.js` (hanya server dan pembuat PDF): tiap nomor dari keluarga soal yang sama (adil), hasil bilangan bulat, tidak sama dengan contoh/latihan/tiket contoh, dan kunci tiap murid berbeda di sekurang-kurangnya 6 dari 10 nomor. Kunci tidak pernah dikirim ke tablet sebelum murid mengumpulkan.
- PDF per murid: `node lkpd-xiid/buat.js --siswa` menulis `lkpd/xiid/<kode>.pdf` (kode acak, tanpa nama murid). Versi contoh guru: `lkpd-xiid/LKPD-1-Integral-Tentu-v3.pdf` dan kuncinya.
- Aksi API tambahan (siswa, wajib idx+token): `l-status`, `l-unduh`, `l-kirim`; rekap guru ada pada `g-status` (`lkpd`).
- Uji: `node uji/uji-lkpd.js` (pembangkit tiket, keadilan, keunikan kunci, PDF ada, dan semua aksi server).
- Jika daftar nama XII-D berubah, bangun ulang PDF (`node lkpd-xiid/buat.js --siswa`) karena kode berkas dan tiket mengikuti nomor urut.

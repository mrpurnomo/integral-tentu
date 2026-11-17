# Keputusan Materi — Area & Calculus

Dicatat dari pertanyaan awal ke guru (06 §3) dan dari `rancangan-materi-integral-tentu.md`.

## Dijawab langsung oleh guru

| Pertanyaan | Keputusan |
|---|---|
| Struktur jigsaw | **Ikuti rancangan**: 7 pos × 3 murid (21 murid). Kelompok dibentuk otomatis dari tes awal (pola ular). Anggota urutan 1 = **Host**, urutan 2 = **Penjelajah A**, urutan 3 = **Penjelajah B**. Rute putaran memakai rumus modulo 7 dari rancangan (3 putaran × 10 menit), lalu **Transfer ilmu** dua tahap |
| Gamifikasi | Mesin poin/lencana tetap ada (syarat PRD) dengan **istilah akademik**: "skor capaian", gelar *Mulai Memahami / Cakap / Mahir / Pakar Luas Daerah*, lencana *Pakar Pos, Pembaca Data, Pemilih Teknik, Tiket Tuntas, Penyusun Integral, Peserta Pameran, Pembelajar Reflektif*. Tidak ada kata level/misi. Peringkat hanya terlihat guru (Panggung Kelas) |
| Kelas | Satu kelas, 21 murid. Daftar nama memakai nama samaran sampai guru menggantinya di `api/_lib/daftar.js` (atau `node tools/isi-nama.js`) |
| Nama produk dan Git | Nama produk **"Area & Calculus"**. Git atas nama `mrpurnomo`, repositori `https://github.com/mrpurnomo/integral-tentu` |

## Keputusan yang diambil dengan nilai bawaan (dapat diubah)

| Hal | Nilai | Alasan |
|---|---|---|
| Materi | Luas daerah di bawah kurva dan antara dua kurva (dx dan dy), pertemuan 3 JP | Sesuai rancangan |
| Tujuh pos | 1 di bawah sumbu-x · 2 memotong sumbu-x · 3 parabola dan garis · 4 dua parabola · 5 dua kurva bersilangan · 6 terhadap sumbu-y · 7 kanan dikurangi kiri | Pos 1–7 pada rancangan |
| Urutan | Pengantar (apersepsi + mini-lecture, 12 adegan) → tes awal 5 soal (8 menit) → kelompok → 6 langkah | Mesin tetap: pengantar selalu sebelum tes. Tes mengukur prasyarat sehingga tetap valid |
| 6 langkah | 1 Kartu pakar (pendalaman pos) · 2 Pameran pakar (3 putaran + 2 transfer) · 3 Tebak bagiannya · 4 Cocokkan masalah · 5 Tantangan sintesis · 6 Tiket keluar + refleksi | Pola PRD; langkah 5 mengganti "kegiatan khas" |
| Waktu pewaktu | Penjelasan 17′ · tes 10′ · kelompok 5′ · kartu 15′ · putaran 3×10′ · transfer 12′ + 12′ · (istirahat) · tebak 6′ · cocokkan 5′ · sintesis 15′ · tiket 7′ | Total 135′ (90′ + 45′); guru dapat mengubah tiap durasi |
| Jawaban soal cerita | Selalu bilangan bulat (parameter dicari lalu diperiksa eksak); luas pecahan dipakai pada pengantar dan bank tebak/cocok | Papan angka murid |
| Fungsi | Hanya aljabar (garis, parabola, kubik); tanpa trigonometri, akar, eksponen, ln | Batasan rancangan |
| Gaya visual | Biru laut, tosca, pasir; font Fraunces (judul dan rumus) dan Plus Jakarta Sans (isi); motif persegi panjang Riemann | Mengikuti paket Integral Tentu yang sudah ada |
| Kelas cadangan | `xiib` (tersembunyi, kelompok disusun guru) untuk uji dan jika kelak ada kelas kedua; ubah `tampil: true` di `bersama.js` | Mode manual PRD tetap teruji |

## Belum diputuskan guru (perlu tindakan)

1. Daftar nama murid asli (urut tetap, ejaan resmi).
2. Nama resmi kelas (sekarang "XII Matematika Lanjut").
3. Pembuatan proyek Vercel + Upstash dan penentuan kapan repositori dijadikan privat.
4. Jadwal gladi dan hari pakai.

## Revisi 17 November 2026

| Hal | Keputusan |
|---|---|
| Tampilan | Identitas baru "Tinta & Kuningan": navy tua, emas kuningan, merah tinta koreksi, putih gading; garis ukur kuningan di header, sudut bingkai emas, arsiran diagonal emas pada daerah. Tanpa tema festival/bendera (itu milik proyek lain) |
| Kelas | XII-A Teknik, XII-B Teknik, XII-C Kesehatan (luas daerah di antara dua kurva); XII-D Soshum (dasar integral tentu, dua pertemuan, materi menyusul). Kelas uji tersembunyi hanya untuk uji otomatis |
| PIN guru | Diganti (hanya di rahasia.js dan hash-nya di bersama.js; tidak ditulis di dokumen) |
| Pengantar (3 kelas) | 9 slide: judul → "Yuk, ingat kembali" (soal → grafik → arsiran → hitung) → "Bagaimana jika ada 2 fungsi?" → contoh dua kurva → mencari titik potong (persamaan bergeser antarbaris) → menghitung luas (9/2) → tujuh sub-materi (navigasi, dijelaskan guru lisan) → tujuan → bersiap tes |
| Tes diagnostik | 5 soal pilihan ganda, 10 menit, angka berbeda per murid: (1) integral tentu biasa, (2) batas ditukar dengan variasi, (3) batas dipartisi dengan variasi, (4) grafik → pilih penulisan integral yang benar (irisan tegak atau datar), (5) grafik dan f(x) dengan arsiran → hitung luas tanpa integral ditampilkan |
| Kelompok | Langsung: murid masuk kelompok saat menekan Lihat kelompok; tablet lain terbarui sendiri. Tanpa gerbang guru (guru masih bisa mengunci) |
| Tujuh pos | Tetap seperti rancangan (mesin yang sudah direncanakan) |
| Belum | Materi dan tes XII-D; daftar nama asli tiap kelas |

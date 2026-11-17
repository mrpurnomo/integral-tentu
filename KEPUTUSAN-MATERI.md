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

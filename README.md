# Grafik Fungsi

Pembelajaran fungsi untuk **XI-F Soshum** (tablet, landscape saja).

| Halaman | Alamat | Untuk |
|---|---|---|
| Siswa | `/` | pengantar animasi → tes awal 5 soal → kelompok |
| Guru | `/guru` (atau tombol **Guru** di layar sambutan) | penjelasan (pengantar yang sama), pantau, kelompok, tahap lanjutan, kode hasil |

## Memasang di Vercel (±5 menit)

1. Vercel → **Add New → Project** → impor repositori ini → **Deploy** (tanpa pengaturan build).
2. Buka proyek → **Storage** → **Create Database** → pilih **Upstash (Redis)** → hubungkan ke proyek.
   Variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` (atau `UPSTASH_REDIS_REST_URL/TOKEN`) terisi otomatis.
3. PIN guru bawaan ada di `api/_lib/bersama.js` (**ganti sebelum rilis**, 5 angka). Tidak perlu mengisi apa pun. Jika ingin mengganti, tambahkan `GURU_PIN` di **Settings → Environment Variables**; jika variabel itu ada, nilainya yang dipakai.
4. **Deployments → Redeploy** supaya variabel terbaca.
5. Buka `/`, pilih **Guru**, masukkan PIN. Chip **Server aktif** berarti semuanya tersambung.

Tanpa langkah 2–4 aplikasi tetap berjalan dalam **mode mandiri**: nama tidak dikunci, hasil diserahkan lewat **kode 5 karakter**
yang dimasukkan guru di tab *Kode hasil*, dan kelompok disusun di halaman guru.

## Struktur

- `index.html`, `guru.html` — halaman mandiri hasil bangun (`node sumber/bangun.js`); tidak butuh internet setelah termuat.
- `api/app.js` — fungsi serverless (Upstash Redis lewat REST, tanpa pustaka).
- `api/_lib/bersama.js` — daftar kelas, soal acak per siswa, kode hasil, pembentukan kelompok (dipakai peramban dan server).
- `sumber/` — sumber (HTML/CSS/JS), font berlisensi OFL.
- `cadangan/Grafik-Fungsi-siswa.html` — salinan halaman siswa untuk dibagikan lewat WhatsApp/Bluetooth.

## Catatan

- Kunci jawaban tes awal ikut dalam berkas halaman (diagnostik, bukan ujian). Siswa yang membuka kode sumber bisa melihatnya.
- Mengatur ulang nama siswa: halaman guru → **Pantau** → ketuk nama → *Atur ulang*.

## Akun uji coba

Di halaman pilih nama ada tombol **Akun uji coba (guru)** (butuh PIN guru). Akun ini tidak masuk statistik dan kelompok siswa asli, selalu mulai dari awal, dan punya tombol **Lompat ke…** untuk mencoba tiap tahap. Atur ulang dari halaman guru → Pantau.

## Alur di kelas

1. **Penjelasan** (guru) dan **Pengantar** (siswa): animasi yang sama. Guru menyeret angka ke mesin, siswa cukup mengetuk. Tiap adegan punya tombol *Ulangi animasi* dan pilihan kecepatan 1×/2×/3×.
2. **Tes awal** lima soal, hasil dikirim ke guru atau ditunjukkan sebagai kode 5 karakter.
3. **Kelompok** terkunci sampai guru menekan *Buka kelompok untuk siswa* di tab Kelompok.
4. **Tahap lanjutan** berurutan, dibuka guru lewat tab *Tahap 2*: Kartu pakar, Tebak fungsinya (diskusi kelompok), Cocokkan grafik, Tiket keluar dan refleksi. Siswa menutup dengan Kartu Penghargaan; guru melihat peringkat di *Panggung Kelas*.

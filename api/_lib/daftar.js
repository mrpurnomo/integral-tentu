/* DAFTAR NAMA KELAS: satu-satunya tempat nama murid disimpan. Urutan TETAP (nomor urut = idx 0, 1, 2, …).
   Isi dengan nama asli (HURUF BESAR, ejaan resmi) lalu jalankan:  node sumber/bangun.js
   Atau pakai skrip: node tools/isi-nama.js xiia nama-kelas.txt   (satu nama per baris).
   JANGAN taruh nama murid di dokumen atau contoh; repositori sebaiknya privat setelah revisi selesai. */
(function (root) {
  'use strict';
  const buat = (awalan, n) => Array.from({ length: n }, (_, i) => awalan + ' ' + String(i + 1).padStart(2, '0'));
  const DAFTAR_KELAS = {
    /* nama samaran sampai guru mengisi daftar asli (urutan tetap). Jumlah murid per kelas bebas (maks 49); 7 kelompok, anggota per kelompok menyesuaikan. */
    xiia: buat('SISWA A', 21),
    xiib: buat('SISWA B', 21),
    xiic: buat('SISWA C', 21),
    xiid: buat('SISWA D', 21),
    ujim: buat('SISWA UJI', 21)
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DAFTAR_KELAS; else root.DAFTAR_KELAS = DAFTAR_KELAS;
})(typeof window !== 'undefined' ? window : globalThis);

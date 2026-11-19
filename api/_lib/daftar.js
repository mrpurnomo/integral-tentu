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
    xiic: [
      "AFIF AHMAD ZAIDAN",
      "AHMAD AFAN ADIYATMA",
      "AHMAD HUDZAIFAH",
      "ALMIRA QAIREEN KHAIRUNNISA",
      "ANNISA AZH ZHAFIRAH RIZAL",
      "ASYLLA THIESA PUTRI",
      "CALISTA BALQIS PUTRI MAHROZI",
      "DZAKYAH TALITA AZMI",
      "FATHIYYA MAIZA SHABIRAH",
      "GIFTANIA IRENE TIMBULENG",
      "KAYYIZA AISKHA ELYASSIN",
      "MUHAMMAD PASHA ATHALLAH",
      "MUTHIA RANA FAIRUZ",
      "NAILA AZARIA HERMAWAN",
      "NAYYEFA NOOR ALTAHFUNNISA",
      "NOURA FAZILLA LINGE",
      "NUR ANNISA AKMAL",
      "RAKHA ATHAYA SYAMIIL",
      "RAYSHA RIZKI ANDRYANI",
      "SITI WULANDARI",
      "YELSI BALALEMBANG",
      "ZAHRAH IZZAH RAMADHANI"
    ],
    xiid: [
      "AFNAN NABILA",
      "AGNYA SYAHIRA",
      "AINUN PERTIWI",
      "ALEXANDRA TATSBITA ARDININGRUM",
      "AMIRA ZHARA HAMIDAH",
      "ANNISA DELVIANA JASMINE",
      "AQILA ADHA RABITA",
      "ARKANA SANTAYANA GANI",
      "AURORA ESTELINA EDLEHEIT DJURUMUDI",
      "BLESSA NATALIE EARLY KAKAMBONG",
      "CALYA NIKESHA SURYA PUTRI",
      "DIANDRA DAVINA PRAMESWARI",
      "FADLAN NOFRIANSYAH",
      "KALISHA SUCI RAIHANA",
      "KANZA LATIFA RABBANI",
      "KHAIFA SYIRA INAYA",
      "KHALUNA HAURA WIBOWO",
      "MUHAMMAD AFIIF FADHLILLAH",
      "MUHAMMAD AGIL YAHYA",
      "NASYA ANNAYA RAFIFA",
      "NINDIRA HALIMATUS SA'DIYAH",
      "NISRINA NAJLA AULIA YUFAWIJAYA",
      "OLIVIA NEISIA LIMONDOW",
      "PRINCESS WILFA PHOEBE HUTAURUK",
      "RAFIE NAUFAL SANDI",
      "SALSABILLA ATHAYA RYENDA PUTRI",
      "SAYYIDIL HASANI ABDILLAH",
      "SYARIF RAHMADANI",
      "SYAUQI GHAZI AR RAYYAN",
      "TIARA MUTMAINNA",
      "VEGI JETRIA BELA",
      "VIOLENEN ANABELLE TANDI PAYUNG",
      "ZAKIYYAH WIJAYANTI"
    ],
    ujim: buat('SISWA UJI', 21)
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DAFTAR_KELAS; else root.DAFTAR_KELAS = DAFTAR_KELAS;
})(typeof window !== 'undefined' ? window : globalThis);

/* Mengisi daftar nama kelas di api/_lib/daftar.js dari berkas teks (satu nama per baris, urut tetap).
   Pakai:  node tools/isi-nama.js xiia nama-kelas.txt
   - nama diubah ke HURUF BESAR, spasi dirapikan
   - huruf non-Latin yang menyerupai Latin (Sirilik/Yunani) diganti otomatis dan dilaporkan (FR-K4)
   - jangan menaruh berkas nama di repositori publik; hapus berkas teks setelah dipakai */
const fs = require('fs'), path = require('path');
const [kelas, berkas] = process.argv.slice(2);
if (!kelas || !berkas) { console.log('Pakai: node tools/isi-nama.js <kelas: xiia|xiib> <berkas.txt>'); process.exit(1); }
const TARGET = path.join(__dirname, '..', 'api', '_lib', 'daftar.js');
const MIRIP = { 'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'І': 'I', 'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X', 'У': 'Y', 'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X' };
let ganti = 0;
const nama = fs.readFileSync(berkas, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/\s+/g, ' ').toUpperCase().replace(/[^\x00-\x7F]/g, (c) => { if (MIRIP[c]) { ganti++; return MIRIP[c]; } return c; }));
const aneh = nama.filter((n) => /[^A-Z .'’-]/.test(n)); if (aneh.length) { console.log('Periksa karakter pada:', aneh.join(' | ')); process.exit(1); }
const dobel = nama.filter((n, i) => nama.indexOf(n) !== i); if (dobel.length) console.log('PERINGATAN nama ganda:', [...new Set(dobel)].join(' | '));
let s = fs.readFileSync(TARGET, 'utf8');
const re = new RegExp('(\\b' + kelas + ':\\s*)(buat\\([^)]*\\)|\\[[\\s\\S]*?\\])(\\s*[,\\n])');
if (!re.test(s)) { console.log('Kelas tidak ditemukan di daftar.js:', kelas); process.exit(1); }
s = s.replace(re, (m, a, b, c) => a + JSON.stringify(nama, null, 2).replace(/\n/g, '\n    ') + c); fs.writeFileSync(TARGET, s);
console.log('Kelas ' + kelas + ': ' + nama.length + ' nama disimpan' + (ganti ? ' (' + ganti + ' huruf mirip diganti)' : '') + '. Jalankan: node sumber/bangun.js dan node uji/uji-sifat.js');

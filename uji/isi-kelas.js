/* Bantu uji manual di peramban: isi kelas xiia dengan murid tiruan (kecuali nomor yang dikecualikan) lalu buka gerbang.
   Pakai: node uji/isi-kelas.js 3   (server uji harus hidup; 3 = nomor murid yang dikerjakan di peramban) */
const path = require('path'), ROOT = path.join(__dirname, '..'), PIN = require(path.join(ROOT, 'api/_lib/rahasia.js')).PIN_GURU, B = require(path.join(ROOT, 'api/_lib/bersama.js'));
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ kelas: 'xiia' }, o)) }).then((r) => r.json());
(async () => {
  const lewat = process.argv.slice(2).map(Number);
  for (let i = 0; i < 21; i++) { if (lewat.includes(i)) continue; await api({ a: 'klaim', idx: i, token: 'T' + i }); const so = B.soalSiswa(i), k = (i * 5) % 6; await api({ a: 'hasil', idx: i, token: 'T' + i, jawab: so.map((q, j) => (j < k ? q.kunci : (q.kunci + 1) % 5)) }); }
  await api({ a: 'g-gerbang', pin: PIN, buka: true }); console.log('kelas terisi, gerbang dibuka');
})();

// Menyatukan sumber menjadi halaman mandiri: ../index.html (siswa) dan ../guru.html (guru). Jalankan: node sumber/bangun.js
// Font (OFL) dibaca dari sumber/fonts dan ditanam sebagai base64 supaya halaman bisa dibagikan sebagai satu berkas.
const fs = require('fs'), path = require('path');
const S = __dirname, R = path.join(S, '..'); const baca = (f) => fs.readFileSync(path.join(S, f), 'utf8');
const font = (f) => 'url(data:font/ttf;base64,' + fs.readFileSync(path.join(S, 'fonts', f)).toString('base64') + ') format("truetype")';
const ff = (nama, berkas, bobot, gaya) => '@font-face{font-family:"' + nama + '";font-style:' + (gaya || 'normal') + ';font-weight:' + bobot + ';font-display:swap;src:' + font(berkas) + '}';
const fonts = [ff('Bricolage', 'BricolageGrotesque-Regular.ttf', 400), ff('Bricolage', 'BricolageGrotesque-Bold.ttf', '600 900'),
  ff('InstrumentSans', 'InstrumentSans-Regular.ttf', '300 500'), ff('InstrumentSans', 'InstrumentSans-Bold.ttf', '600 900'),
  ff('InstrumentSerif', 'InstrumentSerif-Regular.ttf', 400), ff('InstrumentSerif', 'InstrumentSerif-Italic.ttf', 400, 'italic'),
  ff('GeistMono', 'GeistMono-Regular.ttf', '300 500'), ff('GeistMono', 'GeistMono-Bold.ttf', '600 900')].join('');
/* KaTeX: hanya berkas woff2 yang ditanam (base64); gaya aslinya dipertahankan */
const katexCss = fs.readFileSync(path.join(S, 'katex', 'katex.min.css'), 'utf8').replace(/@font-face\{font-family:([A-Za-z_]+);font-style:(\w+);font-weight:(\d+);src:url\(fonts\/([A-Za-z0-9_-]+)\.woff2\)[^}]*\}/g, (m, fam, st, w, f) => {
  const p = path.join(S, 'katex', 'fonts', f + '.woff2');
  return fs.existsSync(p) ? '@font-face{font-family:' + fam + ';font-style:' + st + ';font-weight:' + w + ';src:url(data:font/woff2;base64,' + fs.readFileSync(p).toString('base64') + ') format("woff2")}' : '';
});
const css = [katexCss].concat(['tema.css', 'intro.css', 'layar.css', 'guru.css', 'tahap2.css', 'premium.css', 'lanjut.css', 'panggung.css', 'lkpd.css'].map(baca)).join('\n');
const daftar = fs.readFileSync(path.join(R, 'api', '_lib', 'daftar.js'), 'utf8'), bersama = fs.readFileSync(path.join(R, 'api', '_lib', 'bersama.js'), 'utf8');   // rahasia.js (PIN) sengaja TIDAK ikut dibangun
const NAMA = 'Area & Calculus';
function rakit(judul, jsAkhir, keluar, tambahan) {
  const js = [baca('katex/katex.min.js'), baca('matematika.js'), baca('ui.js'), baca('hero.js'), baca('grafik.js'), daftar, bersama, baca('intro.js'), baca('adegan.js'), baca('aljabar.js'), baca('panggung.js')].concat((tambahan || []).map(baca), [baca(jsAkhir)]).join('\n;\n');
  const h = baca('halaman.html').replace('@JUDUL@', judul).replace('/*@FONTS*/', () => fonts).replace('/*@CSS*/', () => css).replace('/*@JS*/', () => js);
  fs.writeFileSync(path.join(R, keluar), h); console.log(keluar.padEnd(28), (Buffer.byteLength(h) / 1024).toFixed(0) + ' KB');
}
rakit(NAMA, 'siswa.js', 'index.html', ['pelajaran.js', 'coretan.js', 'lanjut.js', 'catatan.js', 'lkpd.js']); rakit(NAMA + ' — Guru', 'guru.js', 'guru.html', ['cetak.js']);
fs.mkdirSync(path.join(R, 'cadangan'), { recursive: true }); fs.copyFileSync(path.join(R, 'index.html'), path.join(R, 'cadangan', 'Area-Calculus-siswa.html'));

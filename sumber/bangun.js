// Menyatukan sumber menjadi halaman mandiri: ../index.html (siswa) dan ../guru.html (guru). Jalankan: node sumber/bangun.js
// Font (OFL) dibaca dari sumber/fonts dan ditanam sebagai base64 supaya halaman bisa dibagikan sebagai satu berkas.
const fs = require('fs'), path = require('path');
const S = __dirname, R = path.join(S, '..'); const baca = (f) => fs.readFileSync(path.join(S, f), 'utf8');
const font = (f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(S, 'fonts', f)).toString('base64') + ') format("woff2")';
const LAT = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const fonts =
  '@font-face{font-family:"Fraunces";font-style:normal;font-weight:100 900;font-display:swap;src:' + font('fraunces-latin-standard-normal.woff2') + '}' +
  '@font-face{font-family:"Fraunces Math";font-style:italic;font-weight:100 900;font-display:swap;src:' + font('fraunces-latin-standard-italic.woff2') + '}' +
  '@font-face{font-family:"Jakarta";font-style:normal;font-weight:200 800;font-display:swap;src:' + font('plus-jakarta-sans-latin-wght-normal.woff2') + ';unicode-range:' + LAT + '}' +
  '@font-face{font-family:"Jakarta";font-style:normal;font-weight:200 800;font-display:swap;src:' + font('plus-jakarta-sans-latin-ext-wght-normal.woff2') + ';unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF}';
const css = ['tema.css', 'intro.css', 'layar.css', 'guru.css', 'tahap2.css'].map(baca).join('\n');
const bersama = fs.readFileSync(path.join(R, 'api', '_lib', 'bersama.js'), 'utf8');
const NAMA = 'Area & Calculus';
function rakit(judul, jsAkhir, keluar, tambahan) {
  const js = [baca('ui.js'), baca('grafik.js'), bersama, baca('intro.js')].concat((tambahan || []).map(baca), [baca(jsAkhir)]).join('\n;\n');
  const h = baca('halaman.html').replace('@JUDUL@', judul).replace('/*@FONTS*/', () => fonts).replace('/*@CSS*/', () => css).replace('/*@JS*/', () => js);
  fs.writeFileSync(path.join(R, keluar), h); console.log(keluar.padEnd(28), (Buffer.byteLength(h) / 1024).toFixed(0) + ' KB');
}
rakit(NAMA, 'siswa.js', 'index.html', ['tahap2.js', 'catatan.js']); rakit(NAMA + ' — Guru', 'guru.js', 'guru.html', ['cetak.js']);
fs.mkdirSync(path.join(R, 'cadangan'), { recursive: true }); fs.copyFileSync(path.join(R, 'index.html'), path.join(R, 'cadangan', 'Area-Calculus-siswa.html'));

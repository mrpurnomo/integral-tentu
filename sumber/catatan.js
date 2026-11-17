/* Catatan belajar: lembar A4 potret berisi seluruh materi (tujuh materi), soal kelompok, dan rapor. Murid menyimpannya sebagai PDF lewat dialog cetak.
   Rumus memakai KaTeX; grafik memakai mesin Adegan (tema terang). */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, M = B.M;
  const NAMA = B.NAMA_FAM, HEX = { bawah: '#C23A3F', potong: '#C98A0B', garis: '#2A6FC4', parab: '#4F6FA8', silang: '#8C5A1E', sumbuy: '#8A2B4A', kanan: '#3C4F6B' };
  const graf = (spec, o) => { const d = document.createElement('div'); Adegan.statis(d, spec, Object.assign({ tema: 'terang', W: 640, H: 470, label: true }, o)); return d.innerHTML; };
  const tanggal = () => new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  function bangunHalaman(d) {
    const idx = d.idx, P = d.P, t = P.t2 || {}, nama = B.nama(idx).replace(/\s*\(.*\)\s*$/, ''), kls = B.cfg().nama, g = (d.G && d.G.g) || t.g || 1, famSaya = (d.G && d.G.fam) || B.bagianKelompok(g - 1);
    const tes = P.tes && P.tes.jawab ? B.nilai(idx, P.tes.jawab).benar : null, R = d.R || B.rapor(t, tes), peran = d.G && d.G.anggota ? (d.G.anggota.find((a) => a.idx === idx) || {}).peran : null;
    const kel = B.kelasAktif(), halaman = []; let no = 0;
    const hal = (judul, isi, kelas) => { no++; return '<section class="hal ' + (kelas || '') + '"><header class="h-kop"><div class="h-logo">Area <b>&amp; Calculus</b></div><div class="h-nama">' + esc(nama) + ' · ' + esc(kls) + '</div></header>' + (judul ? '<div class="h-judul"><span class="h-no">' + no + '</span><h2>' + judul + '</h2></div>' : '') + '<div class="h-isi">' + isi + '</div><footer class="h-kaki"><span>Matematika Tingkat Lanjut · SMA Vidatra Bontang</span><span>Kelompok ' + g + ' · ' + tanggal() + '</span><span class="h-no-hal">Halaman @N@</span></footer></section>'; };

    /* ringkasan dan rapor */
    const bar = (v, tot) => '<div class="rp-bar"><i style="width:' + Math.round(100 * v / tot) + '%"></i></div>';
    halaman.push(hal('Ringkasan capaian dan nilai kinerja',
      '<div class="rp"><div class="rp-a"><b>' + R.capaian + '<small>%</small></b><span>Capaian kegiatan<br>' + R.kartu.filter(Boolean).length + ' dari 6 kartu selesai</span></div><div class="rp-a"><b>' + R.nilai + '</b><span>Nilai kinerja (dari 100)<br><strong>' + esc(R.predikat) + '</strong></span></div>' + (R.awal != null ? '<div class="rp-a"><b>' + (R.naik >= 0 ? '+' : '') + R.naik + '</b><span>Selisih dengan tes awal<br>(' + R.awal + ' → ' + R.nilai + ')</span></div>' : '') + '</div>'
      + '<table class="ct"><thead><tr><th>Kegiatan</th><th>Hasil</th><th style="width:60mm">Capaian</th></tr></thead><tbody>' + R.komponen.map(([n, b, tt]) => '<tr><td>' + n + '</td><td>' + b + ' dari ' + tt + ' benar</td><td>' + bar(b, tt) + '</td></tr>').join('') + '<tr><td>Tes diagnostik awal</td><td>' + (tes == null ? '-' : tes + ' dari 5 benar') + '</td><td>' + (tes == null ? '' : bar(tes, 5)) + '</td></tr></tbody></table>'
      + '<div class="dua"><div class="kotak biru"><div class="kecil-judul">Kelompok dan peran</div><p>Kelompok <b>' + g + '</b> · materi <b>' + esc(NAMA[famSaya]) + '</b><br>Peran: <b>' + (peran == null ? '-' : esc(B.PERAN[peran].panjang)) + '</b></p></div><div class="kotak emas"><div class="kecil-judul">Catatan sesi berkeliling</div><p>' + (t.k2 && t.k2.selesai ? (t.k2.skip ? 'Selesai, ada bagian yang dilewati.' : 'Selesai, seluruh kode cocok.') : 'Belum selesai.') + '</p></div></div>'
      + '<div class="kotak mint"><div class="kecil-judul">Cara membaca</div><ul><li><b>Capaian</b> = banyak kartu yang kamu selesaikan.</li><li><b>Nilai kinerja</b> = persentase jawaban benar pada Titik Potong, Bentuk Integral, Hitung Luas, dan Tiket Keluar.</li></ul></div>'));

    /* konsep dasar */
    halaman.push(hal('Luas daerah dengan integral tentu',
      '<p class="lead">Integral tentu menghitung <b>luas bertanda</b>: bagian di atas sumbu-' + M('x') + ' bernilai positif, bagian di bawahnya negatif. Luas daerah <b>tidak pernah negatif</b>, jadi kita perlu memperhatikan tanda dan memecah interval bila perlu.</p>'
      + '<div class="rumus-b">' + Mat.tex('L=\\int_{a}^{b}\\left(y_{\\text{atas}}-y_{\\text{bawah}}\\right)dx') + '</div>'
      + '<h3>Prosedur empat langkah</h3><ol class="langkah"><li><b>Sketsa</b> kurva dan tentukan irisan: tegak ' + M('dx') + ' bila kurva berbentuk ' + M('y=f(x)') + ', datar ' + M('dy') + ' bila berbentuk ' + M('x=g(y)') + '.</li><li><b>Cari batas</b>: titik potong kedua kurva (samakan fungsi) atau garis batas yang diberikan.</li><li><b>Tentukan kurva atas dan bawah</b> (atau kanan dan kiri) dengan menguji satu titik di antara batas. Pecah interval bila posisinya bertukar.</li><li><b>Integralkan dan hitung</b>: antiturunan, substitusi batas atas dikurangi batas bawah, lalu pastikan hasilnya positif.</li></ol>'
      + '<div class="dua"><div class="kotak biru"><div class="kecil-judul">Sifat batas integral</div><ul><li>' + M('\\int_{a}^{b}f=-\\int_{b}^{a}f') + ' (ditukar)</li><li>' + M('\\int_{a}^{c}f=\\int_{a}^{b}f+\\int_{b}^{c}f') + ' (dipartisi)</li><li>' + M('\\int_{a}^{a}f=0') + ' (batas sama)</li></ul></div><div class="kotak emas"><div class="kecil-judul">Mencari titik potong</div><ol class="langkah"><li>Samakan ' + M('f(x)=g(x)') + '.</li><li>Pindahkan ke satu ruas lalu faktorkan.</li><li>Substitusikan akar ke <b>salah satu</b> fungsi untuk mendapat ' + M('y') + '.</li></ol></div></div>'));

    /* tujuh materi: satu halaman per materi */
    B.URUT.forEach((f, i) => {
      const D = Pel.LES[f], Pc = Pel.contohP(f), w = HEX[f], mine = f === famSaya, pah = d.G && t.k2 && t.k2.paham ? '' : '';
      halaman.push(hal('Materi ' + (i + 1) + ' · ' + NAMA[f] + (mine ? ' (materi kelompokmu)' : ''),
        '<div class="matb" style="--w:' + w + '"><div class="matb-g">' + graf(Pc, { W: 560, H: 430 }) + '</div><div class="matb-t"><div class="kecil-judul">Ciri</div><p>' + Mat.h(D.ciri) + '</p><div class="rumus-b kecil-r">' + Mat.tex(D.rumus) + '</div><div class="kecil-judul">Alasan singkat</div><ol class="langkah">' + D.t.map((x) => '<li>' + Mat.h(x) + '</li>').join('') + '</ol></div></div>'
        + '<h3>Contoh dan pembahasan</h3><div class="kotak contoh"><p>' + Mat.h(B.tanyaP(Pc)) + '</p><div class="pemb">' + Mat.h(B.jelasP(Pc)) + '</div></div>'
        + '<div class="kotak catat"><div class="kecil-judul">Catatanmu</div><div class="garis"></div><div class="garis"></div><div class="garis"></div></div>'));
    });

    /* soal kelompok: titik potong dan bentuk integral */
    const s3 = B.titikPotongSet(B.seedKelompok(kel, g, 3)), s4 = B.bentukSet(B.seedKelompok(kel, g, 4));
    halaman.push(hal('Titik potong dua kurva',
      '<p class="lead">Titik potong menjadi <b>batas integral</b>. Berikut tiga soal kelompokmu beserta pembahasannya.</p>' + s3.map((q) => '<div class="kotak contoh sedang"><div class="matb-g kecil-g">' + graf(q.P, { W: 420, H: 300, angka: true, arsir: false, titik: true }) + '</div><div class="matb-t"><div class="kecil-judul">Soal ' + q.no + '</div><p>' + Mat.h(q.tanya.replace('(angka pada sumbu sengaja dihilangkan)', '')) + '</p><div class="pemb">' + Mat.h(q.jelas) + '</div></div></div>').join('')));
    halaman.push(hal('Memilih bentuk integral',
      '<p class="lead">Bentuk integral yang tepat untuk tiap materi (soal kelompokmu).</p><div class="daftar7">' + s4.map((q) => '<div class="kotak sedang b7"><div class="b7-g">' + graf(q.P, { W: 360, H: 270, titik: false }) + '</div><div class="b7-t"><div class="kecil-judul">' + q.no + '. ' + esc(NAMA[q.fam]) + '</div><div class="b7-r">' + Mat.h(q.opsi[q.kunci]) + '</div></div></div>').join('') + '</div>'));
    /* sampul */
    const sampul = '<section class="hal sampul"><div class="s-isi"><div class="s-logo">Area <b>&amp; Calculus</b></div><div class="s-j">Catatan Belajar</div><div class="s-sub">Luas daerah dengan integral tentu<br>di antara dua kurva</div></div><div class="s-bawah"><div><small>Nama</small><b>' + esc(nama) + '</b></div><div><small>Kelas</small><b>' + esc(kls) + '</b></div><div><small>Kelompok</small><b>' + g + ' · ' + esc(NAMA[famSaya]) + '</b></div></div><div class="s-kaki">Matematika Tingkat Lanjut · Kelas XII · SMA Vidatra Bontang · ' + tanggal() + '</div></section>';
    const total = halaman.length;
    return sampul + halaman.map((h, i) => h.replace('@N@', (i + 2) + ' dari ' + (total + 1))).join('');
  }

  const CSS = `
#catatan{position:fixed;inset:0;z-index:700;background:#CFD6E6;overflow:auto;-webkit-overflow-scrolling:touch}
.cat-bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:.8rem;padding:.6rem 1.2rem;background:#fff;border-bottom:1px solid var(--garis);box-shadow:var(--bayang)}
.cat-bar b{font-family:var(--tampil);font-size:1.2rem}.cat-bar .ruang{flex:1}.cat-bar .muted{font-size:.85rem;max-width:26rem}
.cat-lembar{display:flex;flex-direction:column;align-items:center;gap:1.2rem;padding:1.4rem 0 3rem}
.hal{width:210mm;height:297mm;box-sizing:border-box;background:#fff;position:relative;overflow:hidden;padding:12mm 14mm 12mm;box-shadow:0 .5rem 2rem rgba(18,38,63,.25);color:#0B1530;font-family:InstrumentSans,'Segoe UI',sans-serif;font-size:10pt;line-height:1.4;display:flex;flex-direction:column;page-break-after:always;break-after:page}
.hal *{box-sizing:border-box}.hal .katex{font-size:1.06em}
.h-kop{display:flex;justify-content:space-between;align-items:center;border-bottom:.6mm solid #0F1F44;padding-bottom:2mm;margin-bottom:4mm;flex:none}.h-logo{font-family:Bricolage,Georgia,serif;font-weight:700;font-size:13pt;color:#0F1F44}.h-logo b{color:#C98A0B}.h-nama{font-size:9pt;color:#44567A;font-weight:600}
.h-judul{display:flex;align-items:center;gap:3mm;margin-bottom:3.5mm;flex:none}.h-no{width:9mm;height:9mm;border-radius:50%;background:#0F1F44;color:#FFC94A;display:grid;place-items:center;font-family:GeistMono,monospace;font-weight:700;font-size:10pt}.h-judul h2{font-family:Bricolage,Georgia,serif;font-size:17pt;margin:0;color:#0A1428;letter-spacing:-.02em}
.h-isi{flex:1;min-height:0;display:flex;flex-direction:column;gap:3mm}.h-kaki{flex:none;display:flex;justify-content:space-between;font-size:8pt;color:#55657A;border-top:.3mm solid #D8DEEA;padding-top:2mm;margin-top:3mm}
.hal h3{font-family:Bricolage,Georgia,serif;font-size:12.5pt;margin:1mm 0 0;color:#0A1428}.hal p{margin:0}.lead{font-size:10.8pt;color:#2A3658}
.kotak{border-radius:3.5mm;padding:3mm 4mm;border:.3mm solid #D8DEEA}.kotak ul,.kotak ol{margin:1mm 0 0;padding-left:5mm}.kotak li{margin:.8mm 0}.biru{background:#EAF0FA;border-color:#C9D6EE}.emas{background:#FFF5DA;border-color:#EFD38B}.mint{background:#E9F7EF;border-color:#B6E0C8}.contoh{background:#F7F9FD}.sedang{padding:2.5mm 3.5mm}
.kecil-judul{font-size:7.8pt;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:#0F1F44;margin-bottom:1mm}.rumus-b{font-size:16pt;text-align:center;padding:2.5mm;border-radius:3mm;background:#EEF2FA}.rumus-b.kecil-r{font-size:12.5pt;margin:2mm 0}
.dua{display:grid;grid-template-columns:1fr 1fr;gap:4mm;align-items:start}.langkah{margin:0;padding-left:5mm}.langkah li{margin:1.4mm 0}
.ct{width:100%;border-collapse:collapse;font-size:9.5pt}.ct th{background:#0F1F44;color:#fff;text-align:left;padding:1.6mm 2.4mm;font-size:8.5pt}.ct td{padding:1.6mm 2.4mm;border-bottom:.3mm solid #E3E8F2}
.rp{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.rp-a{display:flex;align-items:center;gap:3mm;background:#0F1F44;color:#fff;border-radius:4mm;padding:3mm 4mm}.rp-a b{font-family:Bricolage,Georgia,serif;font-size:26pt;color:#FFC94A;line-height:1}.rp-a small{font-size:13pt}.rp-a span{font-size:8.6pt;line-height:1.3;color:#DCE4F6}.rp-a strong{color:#FFC94A}
.rp-bar{height:3mm;border-radius:99px;background:#E3E8F2;overflow:hidden}.rp-bar i{display:block;height:100%;background:linear-gradient(90deg,#E39B14,#FFC94A)}
.matb{display:grid;grid-template-columns:96mm 1fr;gap:4mm;border:.4mm solid var(--w);border-radius:4mm;padding:3mm}.matb-g svg.kv{width:100%;height:auto;display:block}.matb-g{background:#fff;border:.3mm solid #E3E8F2;border-radius:3mm;padding:1.5mm}.matb-t p{font-size:10pt}
.contoh .pemb{margin-top:2mm;font-size:9.6pt;line-height:1.75}.contoh.sedang{display:grid;grid-template-columns:62mm 1fr;gap:3mm}.kecil-g svg.kv{width:100%;height:auto;display:block}
.catat .garis{height:7mm;border-bottom:.3mm dashed #B8C2D8}
.daftar7{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.b7{display:grid;grid-template-columns:34mm 1fr;gap:2.5mm;align-items:center}.b7-g svg.kv{width:100%;height:auto;display:block}.b7-r{font-size:9.4pt;overflow-wrap:anywhere}.b7:last-child{grid-column:1 / span 2}
.sampul{padding:0;background:linear-gradient(165deg,#060E20 0%,#0F1F44 60%,#17306A 100%);color:#fff;justify-content:space-between}.s-isi{padding:42mm 22mm 0}.s-logo{font-family:Bricolage,Georgia,serif;font-size:17pt;font-weight:700;margin-bottom:18mm}.s-logo b{color:#FFC94A}.s-j{font-family:Bricolage,Georgia,serif;font-size:46pt;font-weight:700;line-height:1.02;letter-spacing:-.04em;color:#fff}.s-sub{margin-top:8mm;font-size:15pt;color:#FFC94A;line-height:1.35}
.s-bawah{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin:0 20mm}.s-bawah div{background:rgba(255,255,255,.12);border:.3mm solid rgba(255,255,255,.3);border-radius:4mm;padding:3mm 4mm}.s-bawah small{display:block;font-size:8pt;letter-spacing:.1em;text-transform:uppercase;color:#B8C4E0}.s-bawah b{font-size:12pt}
.s-kaki{padding:10mm 22mm 14mm;font-size:8.5pt;color:#B8C4E0}
@page{size:A4 portrait;margin:0}
@media print{html,body{background:#fff!important;height:auto!important;overflow:visible!important}body>*:not(#catatan){display:none!important}#catatan{position:static!important;overflow:visible!important;background:#fff!important}.cat-bar{display:none!important}.cat-lembar{display:block!important;padding:0!important}.hal{box-shadow:none!important;margin:0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

  function buka(d) {
    const lama = document.getElementById('catatan'); if (lama) lama.remove();
    if (!document.getElementById('catatan-css')) { const st = document.createElement('style'); st.id = 'catatan-css'; st.textContent = CSS; document.head.append(st); }
    const nama = B.nama(d.idx).replace(/\s*\(.*\)\s*$/, ''), judulLama = document.title, w = el('div', { id: 'catatan' });
    const tutup = () => { w.remove(); document.title = judulLama; };
    const cetak = () => { document.title = 'Catatan Belajar - ' + nama; setTimeout(() => { try { window.print(); } catch (e) { UI.toast('Peramban ini tidak mendukung cetak', 'awas'); } }, 50); };
    window.addEventListener('afterprint', () => { document.title = judulLama; }, { once: true });
    w.append(el('div', { kelas: 'cat-bar' }, el('b', null, 'Catatan belajarmu'), el('span', { kelas: 'muted' }, 'Tekan “Simpan sebagai PDF”, lalu pada jendela cetak pilih “Simpan sebagai PDF” (atau “Save as PDF”) sebagai printernya.'), el('span', { kelas: 'ruang' }), el('button', { kelas: 'btn hijau', type: 'button', html: ik('kirim') + 'Simpan sebagai PDF', onclick: cetak }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('silang', 'kecil') + 'Tutup', onclick: tutup })));
    const lembar = el('div', { kelas: 'cat-lembar' }); lembar.innerHTML = bangunHalaman(d); w.append(lembar); document.body.append(w);
    return w;
  }
  root.Catatan = { buka, bangunHalaman };
})(window);

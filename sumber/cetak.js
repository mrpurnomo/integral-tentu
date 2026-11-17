/* Cetak daftar kelompok (Area & Calculus): lembar A4 potret. Mode jigsaw: kartu kelompok dengan pos dan peran + tabel rotasi putaran. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, NAMA = UI.NAMA;
  const HEX = { bawah: '#D94F70', potong: '#E08A1E', garis: '#1B9C8F', parab: '#3B6FD6', silang: '#7E5BD6', sumbuy: '#4C9A3F', kanan: '#3D6A8F' };
  const TUA = { bawah: '#8E1F3B', potong: '#8A4B0B', garis: '#0B5A54', parab: '#1E3F8F', silang: '#43288F', sumbuy: '#2A5E1F', kanan: '#1B3F5E' };
  const MUDA = { bawah: '#FBE3E9', potong: '#FDEED6', garis: '#DDF2EF', parab: '#E0EAFB', silang: '#ECE6FA', sumbuy: '#E6F3DD', kanan: '#E1ECF5' };
  const WARNA = ['#D94F70', '#E08A1E', '#1B9C8F', '#3B6FD6', '#7E5BD6', '#4C9A3F', '#3D6A8F'];
  const bersih = (n) => String(n).replace(/\s*\(.*\)\s*$/, '');
  const inisial = (n) => { const k = bersih(n).split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); return k.length ? (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase() : '?'; };

  function kartuManual(g, gi) {
    const w = WARNA[gi % WARNA.length], f = B.bagianKelompok(gi);
    return '<div class="kk" style="--w:' + w + '"><div class="kk-kep"><span class="kk-no">' + (gi + 1) + '</span><b>Kelompok ' + (gi + 1) + '</b><em>' + g.length + ' murid</em></div><div class="kk-pas" style="flex:3"><div class="kk-nm">' + (g.length ? g.map((s) => '<div><span class="kk-av" style="background:' + w + '">' + esc(inisial(s.nama)) + '</span>' + esc(bersih(s.nama)) + '</div>').join('') : '<div class="muted">kosong</div>') + '</div></div><div class="kk-pas"><div class="kk-fam" style="margin-left:0"><span style="background:' + MUDA[f] + ';border-color:' + HEX[f] + '">Pakar: ' + NAMA[f] + '</span></div></div></div>';
  }
  function kartuJigsaw(g, gi) {
    const f = B.bagianKelompok(gi), w = HEX[f], no = gi + 1, rows = [0, 1, 2].map((p) => { const s = g[p], peran = B.peranDariPos(p), rute = peran.sub ? B.rute3(no, peran.sub).map((x, i) => 'R' + (i + 1) + '→' + x) : ['Menetap di Pos ' + no];
      return '<div class="kk-pas"><div class="kk-pk"><span class="kk-huruf" style="background:' + w + '">' + (peran.sub || 'H') + '</span><div class="kk-nm"><div>' + (s ? '<span class="kk-av" style="background:' + w + '">' + esc(inisial(s.nama)) + '</span>' + esc(bersih(s.nama)) : '<span style="color:#9aa5b4;font-weight:400">(belum ada)</span>') + '<span style="font-weight:400;font-size:7pt;color:#55657A;margin-left:1.5mm">' + (peran.sub ? 'Penj. ' + peran.sub : 'Host') + '</span></div></div></div><div class="kk-fam">' + rute.map((x) => '<span style="color:' + TUA[f] + ';border-color:' + w + '">' + x + '</span>').join('') + '</div></div>'; }).join('');
    return '<div class="kk jig" style="--w:' + w + '"><div class="kk-kep"><span class="kk-no">' + no + '</span><b>Kelompok ' + no + '</b><em>' + g.length + ' murid</em></div><div class="kk-posbar" style="background:' + MUDA[f] + ';color:' + TUA[f] + '">Pos ' + no + ' · ' + UI.NAMA[f] + '</div>' + rows + '</div>';
  }
  function tabelRotasi(kel) {
    const nm = (g, p) => { const s = kel[g] && kel[g][p]; return s ? esc(bersih(s.nama).split(/\s+/).slice(0, 2).join(' ')) : '–'; };
    const baris = kel.map((g, gi) => { const no = gi + 1; return '<tr><td><b>' + no + '</b></td><td>' + UI.NAMA[B.bagianKelompok(gi)] + '</td><td>' + nm(gi, 0) + '</td><td>' + nm(gi, 1) + '<br><span class="rt">' + B.rute3(no, 'A').join(' → ') + '</span></td><td>' + nm(gi, 2) + '<br><span class="rt">' + B.rute3(no, 'B').join(' → ') + '</span></td></tr>'; }).join('');
    const tamu = [1, 2, 3].map((r) => '<tr><td><b>Putaran ' + r + '</b></td>' + kel.map((_, h) => { const t = B.tamuMeja(h + 1, r); return '<td>A:K' + t.A + '<br>B:K' + t.B + '</td>'; }).join('') + '</tr>').join('');
    return '<table class="rot"><thead><tr><th>Kel.</th><th>Pos (bagian)</th><th>Host</th><th>Penjelajah A<br><small>pos putaran 1 → 2 → 3</small></th><th>Penjelajah B<br><small>pos putaran 1 → 2 → 3</small></th></tr></thead><tbody>' + baris + '</tbody></table><div class="rot-judul">Tamu di tiap meja Host (A: dari kelompok…, B: dari kelompok…)</div><table class="rot"><thead><tr><th></th>' + kel.map((_, h) => '<th>Pos ' + (h + 1) + '</th>').join('') + '</tr></thead><tbody>' + tamu + '</tbody></table><div class="rot-cat">Transfer ilmu 1: Penjelajah A mengajarkan tiga pos yang ia kunjungi kepada Host dan Penjelajah B. Transfer ilmu 2: Penjelajah B mengajar Host dan Penjelajah A.</div>';
  }
  function kartuKelompok(g, gi, manual, jigsaw) {
    if (jigsaw) return kartuJigsaw(g, gi);
    if (manual) return kartuManual(g, gi);
    const n = g.length, w = WARNA[gi % WARNA.length], pasangan = {};
    g.forEach((s, pos) => { const bp = B.bagianPasangan(pos, n); (pasangan[bp.pasangan] = pasangan[bp.pasangan] || { huruf: bp.huruf, fam: bp.keluarga.length ? bp.keluarga : B.SET[bp.pasangan % 3], anggota: [] }).anggota.push(s); });
    const baris = Object.keys(pasangan).sort().map((k) => { const p = pasangan[k]; return '<div class="kk-pas"><div class="kk-pk"><span class="kk-huruf" style="background:' + w + '">' + p.huruf + '</span><div class="kk-nm">' + p.anggota.map((s) => '<div><span class="kk-av" style="background:' + w + '">' + esc(inisial(s.nama)) + '</span>' + esc(bersih(s.nama)) + '</div>').join('') + '</div></div><div class="kk-fam">' + p.fam.map((f) => '<span style="background:' + MUDA[f] + ';color:#12263F;border-color:' + HEX[f] + '">' + NAMA[f] + '</span>').join('') + '</div></div>'; }).join('');
    return '<div class="kk" style="--w:' + w + '"><div class="kk-kep"><span class="kk-no">' + (gi + 1) + '</span><b>Kelompok ' + (gi + 1) + '</b><em>' + n + ' murid</em></div>' + baris + '</div>';
  }

  const CSS = `
#cetak-kel{position:fixed;inset:0;z-index:700;background:#CFCBE6;overflow:auto}
.ck-bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:.8rem;padding:.6rem 1.2rem;background:#fff;border-bottom:1px solid var(--garis);box-shadow:var(--bayang)}.ck-bar b{font-family:var(--tampil);font-size:1.2rem}.ck-bar .ruang{flex:1}.ck-bar .muted{font-size:.85rem}
.ck-lembar{display:flex;flex-direction:column;align-items:center;gap:1.2rem;padding:1.4rem 0 3rem}
.kh{width:210mm;height:297mm;box-sizing:border-box;background:#fff;position:relative;overflow:hidden;padding:12mm 13mm;box-shadow:0 .5rem 2rem rgba(18,38,63,.25);color:#12263F;font-family:Jakarta,'Segoe UI',sans-serif;font-size:9.5pt;line-height:1.35;display:flex;flex-direction:column;flex:none}
.kh *{box-sizing:border-box}
.kh-kop{border-radius:5mm;padding:7mm 8mm;background:linear-gradient(135deg,#12263F,#0F766E 60%,#1B9C8F);color:#fff;position:relative;overflow:hidden;flex:none}
.kh-kop svg{position:absolute;right:-6mm;top:-4mm;width:70mm;height:36mm;opacity:.5}
.kh-eye{font-size:8pt;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#FBD9A6}.kh-kop h1{font-family:Fraunces,Georgia,serif;font-size:25pt;line-height:1;margin:2mm 0 1mm}.kh-kop h1 b{background:#F3A64B;color:#12263F;padding:0 2.5mm;border-radius:2mm;display:inline-block;transform:rotate(-2deg)}.kh-sub{font-size:9.5pt;color:#CFE8E4;position:relative}
.kh-meta{display:flex;gap:2.5mm;margin-top:3mm;position:relative}.kh-meta span{background:rgba(255,255,255,.18);border:.3mm solid rgba(255,255,255,.35);border-radius:99px;padding:.6mm 3mm;font-size:8pt;font-weight:700}
.kh-grid{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:4mm;margin-top:5mm}
.kk{border:.5mm solid var(--w);border-radius:4.5mm;overflow:hidden;display:flex;flex-direction:column;background:#fff}
.kk-kep{display:flex;align-items:center;gap:2.5mm;background:var(--w);color:#fff;padding:2mm 3.5mm}.kk-kep b{font-family:Fraunces,Georgia,serif;font-size:13pt;flex:1}.kk-kep em{font-style:normal;font-size:8pt;font-weight:700;opacity:.95}.kk-no{width:7mm;height:7mm;border-radius:50%;background:#fff;color:#12263F;display:grid;place-items:center;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:11pt}
.kk-pas{padding:2.2mm 3.5mm;border-bottom:.25mm dashed #CFC7B1;flex:1;display:flex;flex-direction:column;justify-content:center;gap:1.4mm}.kk-pas:last-child{border-bottom:0}
.kk-pk{display:flex;gap:2.5mm;align-items:center}.kk-huruf{width:6mm;height:6mm;border-radius:1.6mm;color:#fff;display:grid;place-items:center;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:9pt;flex:none}.kk-nm{flex:1;display:grid;grid-template-columns:1fr;gap:.8mm;font-weight:700;font-size:9.8pt}.kk-av{display:inline-grid;place-items:center;width:5.2mm;height:5.2mm;border-radius:50%;color:#fff;font-size:6.5pt;margin-right:1.6mm;vertical-align:middle}
.kk-fam{display:flex;flex-wrap:wrap;gap:1.2mm;margin-left:8.5mm}.kk-fam span{border:.3mm solid;border-radius:99px;padding:.2mm 2.2mm;font-size:7.6pt;font-weight:700}
.kh-kaki{flex:none;display:flex;justify-content:space-between;font-size:7.8pt;color:#55657A;border-top:.3mm solid #E2DCCB;padding-top:2mm;margin-top:4mm}
.kh-grid.m3{grid-template-columns:repeat(3,1fr);gap:3mm}.kh-grid.m3 .kk-nm{font-size:8.4pt}.kh-grid.m3 .kk-kep b{font-size:10.5pt}.kh-grid.m3 .kk-kep{padding:1.6mm 2.6mm}.kh-grid.m3 .kk-pas{padding:1.6mm 2.6mm}
.kk.jig{align-items:stretch}.kk.jig .kk-kep{padding:1.4mm 3mm}.kk.jig .kk-pas{flex-direction:row;align-items:center;justify-content:space-between;padding:.8mm 3mm;gap:2mm}.kk.jig .kk-pk{flex:1;min-width:0}.kk.jig .kk-fam{margin:0;flex:none;max-width:46mm;justify-content:flex-end;gap:.7mm}.kk.jig .kk-fam span{font-size:6.6pt;padding:.1mm 1.4mm}.kk.jig .kk-nm{font-size:8.8pt;gap:0;min-width:0}.kk.jig .kk-nm>div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kk.jig .kk-posbar{padding:1mm 3mm;font-size:8pt}.kk-posbar{padding:1.6mm 3.5mm;font-weight:700;font-size:8.8pt}.kk-pas .kk-fam{margin-left:8.5mm}.kh-rot{flex:1;min-height:0;margin-top:5mm;display:flex;flex-direction:column;gap:3mm}.rot{width:100%;border-collapse:collapse;font-size:8.4pt}.rot th{background:#0F766E;color:#fff;padding:1.6mm 2mm;text-align:left;font-size:8pt;border:.25mm solid #0F766E}.rot td{padding:1.5mm 2mm;border:.25mm solid #CFC7B1;vertical-align:top}.rot small{font-weight:400;opacity:.9}.rot .rt{font-weight:700;color:#0B5A54;font-size:8pt}.rot-judul{font-weight:700;font-size:9pt;color:#0B5A54;margin-top:2mm}.rot-cat{font-size:8.4pt;color:#2B3F58;border-left:1.6mm solid #F3A64B;padding:1.5mm 3mm;background:#FFF3DE}
@page{size:A4 portrait;margin:0}
@media print{html,body{background:#fff!important;height:auto!important;overflow:visible!important}body>*:not(#cetak-kel){display:none!important}#cetak-kel{position:static!important;overflow:visible!important;background:#fff!important}.ck-bar{display:none!important}.ck-lembar{display:block;padding:0}.kh{box-shadow:none!important;margin:0;page-break-after:always;break-after:page}.kh:last-child{page-break-after:auto;break-after:auto}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

  function kelompok(kel, o) {
    o = o || {}; const lama = document.getElementById('cetak-kel'); if (lama) lama.remove();
    if (!document.getElementById('cetak-kel-css')) { const st = document.createElement('style'); st.id = 'cetak-kel-css'; st.textContent = CSS; document.head.append(st); }
    const tgl = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), total = kel.reduce((a, g) => a + g.length, 0), kelas = o.kelas || 'XII', judulLama = document.title;
    const per = o.jigsaw ? 6 : (o.manual ? 9 : 4), halaman = []; for (let i = 0; i < kel.length; i += per) halaman.push(kel.slice(i, i + per));
    const hias = '<svg viewBox="0 0 300 150" fill="none" stroke-linecap="round" stroke-width="5"><path d="M0 120C60 120 70 20 130 20S200 120 260 120 290 40 300 30" stroke="#3B6FD6"/><path d="M0 100L60 40 120 100 180 40 240 100 300 50" stroke="#F3A64B"/></svg>';
    const html = halaman.map((hk, hi) => '<section class="kh"><div class="kh-kop">' + hias + '<div class="kh-eye">Matematika Tingkat Lanjut · ' + esc(kelas) + '</div><h1>Kelompok <b>Belajar</b></h1><div class="kh-sub">' + (o.label ? esc(o.label) + ' · ' : '') + tgl + '</div><div class="kh-meta"><span>' + kel.length + ' kelompok</span><span>' + total + ' murid</span><span>' + (o.jigsaw ? 'Satu pos per kelompok' : (o.manual ? 'Satu jenis grafik per kelompok' : 'Kelompok heterogen')) + '</span><span>' + (halaman.length > 1 ? 'Halaman ' + (hi + 1) + ' dari ' + halaman.length : (o.jigsaw ? 'R1–R3 = putaran, angka = nomor pos' : (o.manual ? 'Pameran pakar' : 'Pasangan pakar A · B · C'))) + '</span></div></div><div class="kh-grid' + (o.manual ? ' m3' : '') + '"' + (o.jigsaw && hi === halaman.length - 1 ? ' style="flex:none;grid-auto-rows:auto"' : '') + '>' + hk.map((g, k) => kartuKelompok(g, hi * per + k, o.manual, o.jigsaw)).join('') + '</div>' + (o.jigsaw && hi === halaman.length - 1 ? '<div class="kh-rot">' + tabelRotasi(kel) + '</div>' : '') + '<div class="kh-kaki"><span>SMA Vidatra Bontang · Aplikasi Area &amp; Calculus</span><span>' + (o.jigsaw ? 'Tiap kelompok menjadi pakar untuk satu pos' : (o.manual ? 'Tiap kelompok menjadi pakar untuk satu jenis' : 'Tiap pasangan menjadi pakar')) + '</span></div></section>').join('');
    const w = el('div', { id: 'cetak-kel' }), tutup = () => { w.remove(); document.title = judulLama; };
    const cetak = () => { document.title = 'Kelompok ' + kelas; setTimeout(() => { try { window.print(); } catch (e) { UI.toast('Peramban ini tidak mendukung cetak', 'awas'); } }, 50); };
    window.addEventListener('afterprint', () => { document.title = judulLama; }, { once: true });
    w.append(el('div', { kelas: 'ck-bar' }, el('b', null, 'Daftar kelompok'), el('span', { kelas: 'muted' }, 'Tekan “Simpan sebagai PDF”, lalu pilih “Save as PDF” sebagai printer.'), el('span', { kelas: 'ruang' }), el('button', { kelas: 'btn hijau', type: 'button', html: ik('kirim') + 'Simpan sebagai PDF', onclick: cetak }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('silang', 'kecil') + 'Tutup', onclick: tutup })));
    const l = el('div', { kelas: 'ck-lembar' }); l.innerHTML = html; w.append(l); document.body.append(w); return w;
  }
  root.Cetak = { kelompok };
})(window);

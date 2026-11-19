/* Mode LKPD (XII-D soshum): pilih pertemuan → dasbor (peringkat, teman sekelas, statistik, unduh LKPD, input jawaban) → input jawaban tiket keluar
   (tinggal ketuk A–E) → hasil dengan perayaan. Kunci jawaban hanya di server: tablet hanya mengirim huruf dan menerima hasilnya.
   Aksi server: l-status, l-unduh, l-kirim (lihat api/app.js). */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, HURUF = 'ABCDE';
  const BAGIAN = [{ judul: 'Integral tentu', sub: 'Hitung integral tanpa grafik', dari: 1, sampai: 5, warna: 'garis' }, { judul: 'Bentuk integral dari grafik', sub: 'Pilih bentuk integral untuk daerah arsiran', dari: 6, sampai: 8, warna: 'parab' }, { judul: 'Luas dari grafik', sub: 'Hitung luas daerah arsiran', dari: 9, sampai: 10, warna: 'potong' }];
  const bagianDari = (no) => BAGIAN.find((b) => no >= b.dari && no <= b.sampai);
  let E = null, S = null, tmr = null, sedangKirim = false;
  const nm1 = (n) => String(n).split(/\s+/)[0];
  const draf = { get: () => { try { const v = JSON.parse(localStorage.getItem('ac_lkpd_draf_' + E.idx())); return Array.isArray(v) && v.length === 10 ? v.map((x) => (Number.isInteger(x) && x >= 0 && x <= 4 ? x : null)) : Array(10).fill(null); } catch (e) { return Array(10).fill(null); } }, set: (a) => { try { localStorage.setItem('ac_lkpd_draf_' + E.idx(), JSON.stringify(a)); } catch (e) { /* abaikan */ } }, hapus: () => { try { localStorage.removeItem('ac_lkpd_draf_' + E.idx()); } catch (e) { /* abaikan */ } } };
  const kirimApi = (a, d) => E.api(a, Object.assign({ idx: E.idx() }, d || {}));
  const hentikan = () => { clearInterval(tmr); tmr = null; };
  const f1 = (v) => (v == null ? '–' : (Math.round(v * 10) / 10).toString().replace('.', ','));
  const motivasi = (s) => (s >= 10 ? ['Sempurna!', 'Semua jawabanmu benar. Kerja yang sangat rapi.'] : (s >= 8 ? ['Luar biasa!', 'Tinggal sedikit lagi menuju sempurna. Lihat nomor yang masih salah.'] : (s >= 6 ? ['Bagus sekali!', 'Kamu sudah di jalur yang tepat. Perbaiki bagian yang masih salah.'] : (s >= 4 ? ['Terus berlatih, ya!', 'Setiap latihan membuatmu makin lancar. Tanyakan bagian yang sulit ke gurumu.'] : ['Terima kasih sudah berusaha!', 'Tidak apa-apa. Bagian yang belum paham bisa kita bahas bersama gurumu.']))));
  const ringkasTopik = (saya) => BAGIAN.map((b) => { let ben = 0, tot = 0; for (let n = b.dari; n <= b.sampai; n++) { tot++; if (saya.benar && saya.benar[n - 1]) ben++; } return { b, ben, tot }; });

  /* ---------------------------------------------------------------- jaringan */
  async function muat() {
    const r = await kirimApi('l-status');
    if (r._s === 403) { hentikan(); await UI.info('Namamu belum dikenali server', '<div class="tengah"><p>Minta gurumu mengatur ulang namamu, lalu masuk lagi.</p></div>', 'Mengerti', { ikon: ik('kunci', 'besar') }); return null; }
    if (r.ok) { S = r; return r; }
    return null;
  }

  /* ---------------------------------------------------------------- 1. pilih pertemuan */
  function sPertemuan() {
    hentikan(); E.bawahKosong(); E.gambarAtas();
    const w = el('div', { kelas: 'lk-wrap lk-pilih' }); E.layar(w, 'tengah-layar');
    w.append(el('div', { kelas: 'eyebrow', gaya: 'justify-content:center' }, 'XII-D · Integral tentu'), el('h2', { gaya: 'margin:.1rem 0 .3rem' }, 'Pilih pertemuan'), el('p', { kelas: 'muted', gaya: 'margin:0 0 1.2rem;font-size:1.1rem' }, 'Mulai dari Pertemuan 1.'));
    const grid = el('div', { kelas: 'lk-pertemuan' }); w.append(grid);
    grid.append(el('button', { kelas: 'lk-kartu-p aktif', type: 'button', onclick: sDasbor, html: '<span class="lk-no">1</span><span class="lk-p-isi"><b>Pertemuan 1</b><span>Integral tentu dan luas di bawah kurva</span><small>Hitung integral tentu, lalu baca grafik daerah arsiran</small></span>' + ik('panah', 'besar') }),
      el('div', { kelas: 'lk-kartu-p terkunci', 'aria-disabled': 'true', html: '<span class="lk-no">2</span><span class="lk-p-isi"><b>Pertemuan 2</b><span>Luas daerah di antara dua kurva</span><small>Dibuka oleh gurumu setelah Pertemuan 1</small></span><span class="chip abu">' + ik('gembok', 'kecil') + 'Segera</span>' }));
  }

  /* ---------------------------------------------------------------- 2. dasbor */
  const stat = (label, nilai, sub, f) => '<div class="lk-stat fx-' + f + '"><small>' + label + '</small><b>' + nilai + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>';
  function kartuHasilku(saya) {
    const t = ringkasTopik(saya), salah = t.filter((x) => x.ben < x.tot), ulang = salah.length ? 'Perlu diulang: ' + salah.map((x) => '<b>' + esc(x.b.judul) + '</b> (' + x.ben + '/' + x.tot + ')').join(', ') + '.' : 'Semua bagian sudah benar.';
    const cip = saya.benar.map((ok, i) => '<div class="lk-no-h ' + (ok ? 'benar' : 'salah') + '"><b>' + (i + 1) + '</b>' + ik(ok ? 'centang' : 'silang', 'kecil') + '<span>' + (ok ? HURUF[saya.jawab[i]] : HURUF[saya.jawab[i]] + ' → ' + HURUF[saya.kunci[i]]) + '</span></div>').join('');
    return '<section class="kartu lk-kartu lk-hasilku"><div class="lk-kepala"><div><div class="eyebrow">Hasilku · tiket keluar</div><h3>' + saya.skor + ' dari 10 benar <span class="chip ok">Nilai ' + saya.nilai + '</span></h3></div></div><div class="lk-nomor-hasil">' + cip + '</div><p class="lk-ulang">' + ulang + '</p><p class="kecil muted" style="margin:.2rem 0 0">Pada nomor yang salah: huruf pertama = jawabanmu, huruf kedua = jawaban yang benar.</p></section>';
  }
  function kartuPeringkat(p) {
    if (!p || !p.top || !p.top.length) return '<section class="kartu lk-kartu"><div class="lk-kepala"><div><div class="eyebrow">Peringkat</div><h3>Belum ada yang mengumpulkan</h3></div></div><p class="muted" style="margin:0">Peringkat muncul setelah ada teman yang mengumpulkan tiket keluar.</p></section>';
    const baris = (x) => '<div class="lk-rank' + (x.saya ? ' saya' : '') + '"><span class="lk-rk r' + Math.min(x.rank, 4) + '">' + x.rank + '</span><span class="lk-nama">' + esc(x.nama) + (x.saya ? ' <em>(kamu)</em>' : '') + '</span><b>' + x.skor + '<small>/10</small></b></div>';
    const adaSaya = p.top.some((x) => x.saya);
    return '<section class="kartu lk-kartu"><div class="lk-kepala"><div><div class="eyebrow">Peringkat · ' + p.jumlah + ' sudah mengumpulkan</div><h3>5 skor tertinggi</h3></div></div>' + p.top.map(baris).join('') + (!adaSaya && p.rankSaya ? '<div class="lk-titik">· · ·</div>' + baris({ rank: p.rankSaya, nama: nm1(E.nama()) , skor: S.saya.skor, saya: true }) : '') + '</section>';
  }
  function kartuTeman(teman) {
    const isi = teman && teman.length ? '<div class="lk-teman">' + teman.map((x) => '<div class="lk-t' + (x.saya ? ' saya' : '') + '"><span class="lk-nama">' + esc(x.nama) + (x.saya ? ' <em>(kamu)</em>' : '') + '</span><b>' + x.skor + '/10</b></div>').join('') + '</div>' : '<p class="muted" style="margin:0">Belum ada teman yang mengumpulkan. Daftarnya muncul di sini begitu ada yang selesai.</p>';
    return '<section class="kartu lk-kartu"><div class="lk-kepala"><div><div class="eyebrow">Teman sekelas</div><h3>Hasil teman yang sudah mengumpulkan</h3></div></div>' + isi + '</section>';
  }
  function kartuStatistik(k) {
    const maks = Math.max(1, ...(k.sebaran || [0])), batang = (k.sebaran || Array(11).fill(0)).map((n, s) => '<div class="lk-b"><i style="height:' + Math.round(100 * n / maks) + '%"></i><em>' + (n || '') + '</em><span>' + s + '</span></div>').join('');
    const akur = k.akurasi ? '<div class="lk-akur-judul">Persen benar tiap nomor (seluruh kelas)</div><div class="lk-akur">' + k.akurasi.map((a, i) => '<div class="lk-a"><i style="height:' + Math.max(4, a) + '%" class="' + (a >= 70 ? 'tinggi' : (a >= 40 ? 'sedang' : 'rendah')) + '"></i><em>' + a + '</em><span>' + (i + 1) + '</span></div>').join('') + '</div>' : '';
    return '<section class="kartu lk-kartu"><div class="lk-kepala"><div><div class="eyebrow">Statistik pengerjaan</div><h3>Bagaimana kelas mengerjakan</h3></div></div><div class="lk-stats">' + stat('Sudah unduh LKPD', k.unduh + '<small>/' + k.total + '</small>', '', 'garis') + stat('Sudah mengumpulkan', k.kirim + '<small>/' + k.total + '</small>', '', 'bawah') + stat('Skor rata-rata', f1(k.rata) + '<small>/10</small>', '', 'potong') + stat('Skor tertinggi', (k.tertinggi == null ? '–' : k.tertinggi) + '<small>/10</small>', '', 'parab') + '</div>' + (k.kirim ? '<div class="lk-akur-judul">Sebaran skor (jumlah murid per skor)</div><div class="lk-sebar">' + batang + '</div>' + akur : '<p class="muted" style="margin:.6rem 0 0">Grafik sebaran skor muncul setelah ada yang mengumpulkan.</p>') + '</section>';
  }
  async function sDasbor() {
    hentikan(); E.bawahKosong(); E.gambarAtas();
    const w = el('div', { kelas: 'lk-wrap lk-dasbor', id: 'lk-dasbor' }), kiri = el('div', { kelas: 'lk-kiri gulir' }), kanan = el('aside', { kelas: 'lk-kanan' }); w.append(kiri, kanan); E.layar(w);
    let tanda = '';
    const gambar = () => {
      const s = S.saya, nama = nm1(E.nama());
      kanan.innerHTML = '';
      kanan.append(el('div', { kelas: 'lk-sapa', html: '<div class="eyebrow">Pertemuan 1</div><h2>Halo, ' + esc(nama) + '!</h2><p>Integral tentu dan luas di bawah kurva</p>' }),
        el('div', { kelas: 'lk-langkah', html: '<ol><li>' + (BS.cfg().lkpdBagian === 'tiket' ? 'Unduh tiket keluarmu (PDF), lalu cetak atau buka di tablet.' : 'Unduh LKPD-mu dan ikuti arahan guru.') + '</li><li>Kerjakan tiket keluar di lembar jawab.</li><li>Kembali ke sini, lalu ketuk jawabanmu.</li></ol>' }),
        el('button', { kelas: 'btn besar sorot lk-tombol', type: 'button', html: ik('buku', 'besar') + '<span><b>Unduh LKPD-mu</b><small>' + (BS.cfg().lkpdBagian === 'tiket' ? 'Tiket keluar khusus untukmu (PDF)' : 'Berkas PDF khusus untukmu') + '</small></span>', onclick: unduh }),
        el('button', { kelas: 'btn besar lk-tombol' + (s.terkirim ? ' mati' : ' hijau'), type: 'button', disabled: s.terkirim, html: (s.terkirim ? ik('centang', 'besar') + '<span><b>Sudah dikirim</b><small>Jawaban hanya bisa dikirim satu kali</small></span>' : ik('pensil', 'besar') + '<span><b>Input jawabanmu</b><small>Ketuk huruf jawaban tiap nomor</small></span>'), onclick: () => { if (!s.terkirim) sInput(); } }),
        el('button', { kelas: 'btn sekunder kecil', type: 'button', gaya: 'align-self:flex-start;margin-top:auto', html: ik('kembali', 'kecil') + 'Pilih pertemuan', onclick: sPertemuan }));
      kiri.innerHTML = (s.terkirim ? kartuHasilku(s) : '') + kartuPeringkat(S.peringkat) + kartuTeman(S.teman) + kartuStatistik(S.kelas);
    };
    const segar = async (diam) => { if (!w.isConnected) return hentikan(); const r = await muat(); if (!r) { if (!diam) UI.toast('Belum terhubung ke server', 'awas'); return; } const t = JSON.stringify(r); if (t !== tanda) { tanda = t; const g = kiri.scrollTop; gambar(); kiri.scrollTop = g; } };
    if (!S) { kiri.append(el('div', { kelas: 'tengah-isi', html: '<div class="spinner"></div><p class="muted">Memuat dasbor…</p>' })); }
    else gambar();
    await segar(false); if (!S) { kiri.innerHTML = ''; kiri.append(el('div', { kelas: 'tengah-isi' }, el('h2', null, 'Belum terhubung ke server'), el('p', { kelas: 'muted' }, 'Pastikan tabletmu tersambung internet, lalu coba lagi.'), el('button', { kelas: 'btn', type: 'button', html: ik('ulang') + 'Coba lagi', onclick: sDasbor }))); }
    tmr = setInterval(() => segar(true), 8000);
  }
  async function unduh() {
    const r = await kirimApi('l-unduh'); const url = (r && r.ok && r.berkas) || (S && S.berkas);
    if (!url) return UI.toast('Belum terhubung ke server. Coba lagi.', 'awas');
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.download = 'LKPD-1-Integral-Tentu.pdf'; document.body.append(a); a.click(); a.remove();
    UI.toast('LKPD-mu sedang diunduh', 'centang');
    if (S) S.kelas.unduh = Math.max(S.kelas.unduh, 1);
  }

  /* ---------------------------------------------------------------- 3. input jawaban */
  function sInput() {
    hentikan(); E.bawahKosong(); E.gambarAtas();
    if (S && S.saya.terkirim) { UI.toast('Jawabanmu sudah dikirim', 'info'); return sDasbor(); }
    let jawab = draf.get();
    const w = el('div', { kelas: 'lk-wrap lk-input' }); E.layar(w);
    const info = el('span', { kelas: 'chip sorot' }), kirimBtn = el('button', { kelas: 'btn besar hijau', type: 'button', html: ik('kirim') + 'Kirim jawaban', onclick: kirim });
    w.append(el('div', { kelas: 'baris lk-atas', gaya: 'justify-content:space-between' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Pertemuan 1 · Tiket keluar'), el('h2', { gaya: 'margin:0' }, 'Input jawabanmu')), el('div', { kelas: 'baris' }, info, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali ke dasbor', onclick: sDasbor }))),
      el('p', { kelas: 'muted', gaya: 'margin:.1rem 0 .6rem' }, 'Ketuk satu huruf untuk tiap nomor, sesuai lembar jawabmu. Ketuk lagi untuk membatalkan.'));
    const isi = el('div', { kelas: 'lk-input-grid' }), kol1 = el('div', { kelas: 'lk-kol' }), kol2 = el('div', { kelas: 'lk-kol' }); isi.append(kol1, kol2); w.append(isi);
    const tombol = [];
    BAGIAN.forEach((b, bi) => {
      const k = el('section', { kelas: 'kartu lk-bagian fx-' + b.warna }, el('div', { kelas: 'lk-b-kepala', html: '<b>Soal ' + b.dari + (b.sampai > b.dari ? '–' + b.sampai : '') + '</b><span>' + esc(b.judul) + '</span>' }));
      for (let n = b.dari; n <= b.sampai; n++) {
        const baris = el('div', { kelas: 'lk-baris' }, el('span', { kelas: 'lk-n' }, n));
        HURUF.split('').forEach((h, j) => { const t = el('button', { kelas: 'lk-opsi', type: 'button', 'aria-label': 'Nomor ' + n + ' jawaban ' + h, onclick: () => { jawab[n - 1] = jawab[n - 1] === j ? null : j; draf.set(jawab); perbarui(); } }, h); tombol[(n - 1) * 5 + j] = t; baris.append(t); });
        k.append(baris);
      }
      (bi === 0 ? kol1 : kol2).append(k);
    });
    w.append(el('div', { kelas: 'baris lk-bawah', gaya: 'justify-content:flex-end' }, kirimBtn));
    function perbarui() { jawab.forEach((v, i) => { for (let j = 0; j < 5; j++) tombol[i * 5 + j].classList.toggle('pilih', v === j); }); const n = jawab.filter((v) => v != null).length; info.innerHTML = ik('pensil', 'kecil') + n + ' dari 10 terisi'; kirimBtn.disabled = n < 10; kirimBtn.className = 'btn besar ' + (n < 10 ? 'mati' : 'hijau denyut'); }
    async function kirim() {
      if (sedangKirim || jawab.some((v) => v == null)) return;
      const ya = await UI.konfirmasi('Yakin mengirim?', '<div class="tengah"><p style="font-size:1.25rem">Kamu akan mengirim <b>10 jawaban</b>.</p><p class="muted">Jawaban hanya bisa dikirim <b>satu kali</b> dan tidak bisa diubah. Periksa lagi kalau masih ragu.</p></div>', 'Ya, kirim', 'Cek ulang');
      if (!ya) return;
      sedangKirim = true; kirimBtn.disabled = true; kirimBtn.className = 'btn besar mati';
      const r = await kirimApi('l-kirim', { jawab }); sedangKirim = false;
      if (r.ok) { draf.hapus(); S = null; return sHasil(r); }
      if (r._s === 409 && r.error === 'sudah') { draf.hapus(); S = null; await UI.info('Jawabanmu sudah pernah dikirim', '<div class="tengah"><p>Tiket keluar hanya bisa dikirim satu kali. Hasilmu ada di dasbor.</p></div>', 'Ke dasbor', { ikon: ik('info', 'besar') }); return sDasbor(); }
      if (r._s === 400) UI.toast('Jawaban belum lengkap atau tidak valid', 'awas'); else if (r._s === 403) UI.toast('Namamu belum dikenali server. Hubungi guru.', 'awas'); else UI.toast('Gagal terkirim. Jawabanmu tetap tersimpan, coba lagi.', 'awas');
      perbarui();
    }
    perbarui();
  }

  /* ---------------------------------------------------------------- 4. hasil + perayaan */
  function sHasil(r) {
    hentikan(); E.bawahKosong(); E.gambarAtas();
    const w = el('div', { kelas: 'hasil-wrap lk-hasil' }); E.layar(w);
    const kiri = el('div', { kelas: 'kartu hasil-skor tengah' }), kanan = el('div', { kelas: 'hasil-kanan' }); w.append(kiri, kanan);
    const m = motivasi(r.skor), kel = 2 * Math.PI * 70;
    kiri.innerHTML = '<div class="eyebrow" style="justify-content:center">Tiket keluar terkirim</div><h2>' + m[0] + '</h2><div class="cincin"><svg viewBox="0 0 168 168"><circle cx="84" cy="84" r="70" fill="none" stroke="#E1E6F0" stroke-width="16"/><circle id="lk-arc" cx="84" cy="84" r="70" fill="none" stroke="var(--markisa)" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 ' + kel.toFixed(1) + '"/></svg><div class="pusat"><b id="lk-angka">0</b><span class="muted">dari 10</span></div></div><div class="baris" style="justify-content:center"><span class="chip ok" style="font-size:1.05rem">' + ik('centang', 'kecil') + r.skor + ' benar</span><span class="chip bad" style="font-size:1.05rem">' + ik('silang', 'kecil') + (10 - r.skor) + ' salah</span><span class="chip sorot" style="font-size:1.05rem">Nilai ' + r.nilai + '</span></div><p class="muted" style="margin:.8rem 0 0">' + m[1] + '</p>';
    const t = ringkasTopik({ benar: r.benar }), cip = r.benar.map((ok, i) => '<div class="lk-no-h ' + (ok ? 'benar' : 'salah') + '"><b>' + (i + 1) + '</b>' + ik(ok ? 'centang' : 'silang', 'kecil') + '<span>' + (ok ? HURUF[r.jawab[i]] : HURUF[r.jawab[i]] + ' → ' + HURUF[r.kunci[i]]) + '</span></div>').join('');
    kanan.append(el('div', { kelas: 'eyebrow' }, 'Nomor yang benar dan salah'), el('div', { kelas: 'lk-nomor-hasil', html: cip }), el('p', { kelas: 'kecil muted', gaya: 'margin:0' }, 'Pada nomor yang salah: huruf pertama = jawabanmu, huruf kedua = jawaban yang benar.'),
      el('div', { kelas: 'lk-topik', html: t.map((x) => '<div class="lk-tp ' + (x.ben === x.tot ? 'ok' : '') + '"><span>' + esc(x.b.judul) + '</span><b>' + x.ben + '/' + x.tot + '</b></div>').join('') }),
      el('div', { kelas: 'kolom', gaya: 'margin-top:auto' }, el('button', { kelas: 'btn besar sorot denyut', type: 'button', html: ik('kembali') + 'Kembali ke dasbor', onclick: sDasbor })));
    setTimeout(() => E.konfeti(innerWidth / 2, innerHeight * .3, r.skor >= 8 ? 110 : 70), 500); if (r.skor >= 6) setTimeout(() => E.konfeti(innerWidth * .3, innerHeight * .35, 40), 1100);
    const arc = document.getElementById('lk-arc'), angka = document.getElementById('lk-angka'), t0 = performance.now(), dur = 1400, target = r.skor / 10 * kel;
    (function f(tt) { const k = Math.min(1, (tt - t0) / dur), e = 1 - Math.pow(1 - k, 3); if (!arc || !arc.isConnected) return; arc.setAttribute('stroke-dasharray', (target * e).toFixed(1) + ' ' + kel.toFixed(1)); angka.textContent = Math.round(r.skor * e); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  /* e = { idx(), P(), simpan(), api(a, data), layar(isi, kelas), net(), gambarAtas(), bawahKosong(), konfeti(x, y, n), nama() } */
  function mulai(e) { E = e; S = null; const P = E.P(); P.tahap = 'lkpd'; E.simpan(); sPertemuan(); }
  root.Lkpd = { mulai, BAGIAN, bagianDari };
})(window);

/* Tahap lanjutan (jigsaw 7 pos): 1 Kartu pakar · 2 Pameran pakar (rute putaran + transfer ilmu) · 3 Tebak bagiannya · 4 Cocokkan masalah · 5 Tantangan sintesis · 6 Tiket keluar + refleksi + Kartu Penghargaan */
(function (root) {
  'use strict';
  const { el, ik, esc, anim } = UI, B = BS, K = GF.K, NAMA = UI.NAMA;
  let E, tmrCek = null;
  const T = () => E.P().t2;
  const XG = () => B.cfg(B.kelasAktif()).jigsaw;
  const NO = () => (XG() ? { kartu: 1, pam: 2, dis: 3, cocok: 4, fung: 5, tiket: 6 } : { kartu: 1, dis: 2, cocok: 3, tiket: 4 });
  const kirim = (d) => { if (E.net() === 'online') E.api('t2', { idx: E.idx(), t2: d, tahap: 'tahap2' }); };
  const warnaFam = (f) => 'var(--f-' + f + ')';
  const WARNA9 = ['bawah', 'potong', 'garis', 'parab', 'silang', 'sumbuy', 'kanan'];
  const inisial = (n) => { const k = String(n).split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); if (!k.length) return '?'; return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };
  const num = (v) => { if (typeof v === 'number') return v; const s = String(v); return parseFloat(s.indexOf(',') >= 0 ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\./g, '')); };
  const F = (n) => String(n).replace('-', '−');
  const adaFam = (f, arr) => (arr || []).indexOf(f) >= 0;

  /* ---------- poin & sinkron ke guru ---------- */
  function hitung() { const t = T(); return B.hitungPoin({ kartu: t.kartu, fam: t.fam, diskusi: t.dis, cocok: t.cocok, tiket: t.tiket, pam: t.pam, fung: t.fung, tamat: t.tamat }); }
  function sinkron(extra) { const t = T(), p = hitung(); t.poin = p.poin; t.lencana = p.lencana; E.simpan(); kirim(Object.assign({ poin: p.poin, lencana: p.lencana, sel: status() }, extra || {})); return p; }

  /* ---------- grafik bantu ---------- */
  const miniGrafik = (fam) => GF.lukis(K[fam].varian[0].spec, { W: 480, H: 340, tanpaTick: true, titik: false }).svg;
  /* penjelasan dengan tombol untuk melihat gambarnya (tidak langsung di soal supaya murid membaca dan menalar dulu) */
  function grafikDialog(s, fam) {
    const isi = el('div', { kelas: 'gd' }); isi.innerHTML = '<div><div class="eyebrow">Titik-titik pada tabel</div><div class="gd-g"></div><p class="muted kecil" style="margin:.3rem 0 0">Setiap warna titik adalah satu kolom tabel.</p></div><div><div class="eyebrow">Daerah yang dihitung luasnya</div><div class="gd-g gd-b"></div><p class="muted kecil" style="margin:.3rem 0 0">' + esc(K[fam].ciri[0]) + '</p></div>';
    const g = isi.querySelectorAll('.gd-g'); g[0].append(GF.dataSVG(s)); g[1].append(GF.lukis(s.spec, { W: 460, H: 330, titik: false }).svg);
    return UI.dialog({ lebar: true, judul: 'Gambar untuk “' + esc(s.judul) + '”', ikon: ik('mata', 'besar'), isi, tombol: [{ t: 'Kembali ke penjelasan', nilai: true }] });
  }
  async function penjelasan(o) {
    for (;;) {
      const salah = o.pilihF && o.pilihF !== o.fam, isi = el('div'); isi.innerHTML = '<p style="font-size:1.3rem;margin:0 0 .5rem">Ini bagian <b>' + NAMA[o.fam] + '</b>' + (salah ? ', bukan ' + NAMA[o.pilihF] : '') + '.</p><p style="margin:.2rem 0;font-size:1.1rem"><b>Mengapa?</b> ' + esc(o.s.alasan) + '</p>' + (salah ? '<p class="muted" style="margin:.4rem 0">Ciri <b>' + NAMA[o.pilihF] + '</b>: ' + esc(K[o.pilihF].ciri[0]) + ' Data pada soal tidak seperti itu.</p>' : '') + '<p class="muted kecil" style="margin:.6rem 0 0">Ingin melihat gambarnya? Tekan “Lihat gambarnya”.</p>';
      const v = await UI.dialog({ lebar: true, judul: o.judul, ikon: ik(o.ok ? 'centang' : 'info', 'besar'), isi, tombol: [{ t: 'Lihat gambarnya', nilai: 'grafik', kelas: 'sekunder', ikon: 'mata' }, { t: o.lanjut || 'Lanjut', nilai: true }] });
      if (v === 'grafik') await grafikDialog(o.s, o.fam); else return;
    }
  }
  const tabelData = (s) => '<table class="tabel-mini"><thead><tr>' + s.kol.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + s.baris.map((r) => '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';

  /* ---------- kerangka layar: kepala, isi, navigasi ---------- */
  function kerangka(eyebrow, judul, o) {
    o = o || {}; const w = el('div', { kelas: 't2-bingkai' }), kep = el('div', { kelas: 't2-kepala' }), isi = el('div', { kelas: 't2-isi' }), nav = el('div', { kelas: 't2-nav' });
    const kiri = el('div', null, el('div', { kelas: 'eyebrow' }, eyebrow), el('h2', { gaya: 'margin:0' }, judul)), kanan = el('div', { kelas: 'baris' });
    if (o.titik) kanan.append(el('div', { kelas: 't2-titik' }, o.titik.map((s, i) => el('button', { type: 'button', 'aria-label': 'Nomor ' + (i + 1), kelas: 'dt' + (s === 'now' ? ' now' : '') + (s === 'isi' ? ' isi' : ''), onclick: o.ke ? () => o.ke(i) : null }, String(i + 1)))));
    if (o.pusat !== false) kanan.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub }));
    kep.append(kiri, kanan); w.append(kep, isi, nav); return { w, isi, nav };
  }
  const tombol = (t, ikon, o) => el('button', Object.assign({ kelas: 'btn ' + ((o && o.kelas) || ''), type: 'button', html: (o && o.kiri ? ik(ikon, 'kecil') + t : t + (ikon ? ik(ikon, 'kecil') : '')) }, o && o.p ? o.p : {}));

  /* ============================================================ penentuan kelompok, pos, dan peran */
  async function tentukan() {
    const t = T(); if (t.fam && t.fam.length && t.kel) return;
    const r = await E.api('kelompok', { idx: E.idx() });
    if (r.ok && r.kelompok && r.kelompok[r.saya]) { const g = r.kelompok[r.saya]; t.grup = r.saya + 1; t.pas = 0; t.fam = [B.bagianKelompok(r.saya)]; t.pos = Math.max(0, g.findIndex((x) => x.idx === E.idx())); if (E.idx() === B.DUMMY) t.pos = 0; t.mitra = g.filter((x) => x.idx !== E.idx()).map((x) => x.nama); t.kel = r.kelompok.map((gg) => gg.map((x) => x.nama)); }
    else { t.pas = 0; t.fam = [B.URUT[0]]; t.mitra = []; t.grup = null; t.pos = 0; t.kel = null; }
    E.simpan(); kirim({ pasangan: 0 });
  }
  async function sapaPasangan() {
    const t = T(), aku = B.nama(E.idx()), av = (n, tag) => '<div class="av-kol"><span class="av-besar fx-' + WARNA9[(n.length + (tag ? 1 : 3)) % 7] + '">' + esc(inisial(n)) + '</span><b>' + esc(n.split(/\s+/).slice(0, 2).join(' ')) + '</b>' + (tag ? '<span class="muted kecil">kamu</span>' : '') + '</div>';
    const teman = t.mitra && t.mitra.length, rol = B.peranDariPos(t.pos || 0);
    const isi = '<div class="tengah"><p style="font-size:1.35rem;margin:.1rem 0 .4rem">' + (teman ? 'Teman sekelompokmu adalah <b>' + t.mitra.map(esc).join(' dan ') + '</b>.' : 'Kamu belajar sendiri untuk bagian ini. Kamu boleh bertanya kepada teman di meja lain.') + '</p>'
      + '<div class="baris" style="justify-content:center;gap:1.4rem;margin:.6rem 0">' + av(aku, true) + (teman ? '<span class="plus-p">+</span>' + t.mitra.map((m) => av(m, false)).join('') : '') + '</div>'
      + '<div class="eyebrow" style="justify-content:center;margin-top:.8rem">Kelompokmu menjadi pakar untuk</div><div class="baris" style="justify-content:center;flex-wrap:wrap;gap:.5rem;margin-top:.3rem">' + t.fam.map((f) => '<span class="chip fx-' + f + '" style="background:var(--tt);color:var(--td);font-size:1.05rem">' + UI.ubin(f) + 'Pos ' + t.grup + ' · ' + NAMA[f] + '</span>').join('') + '</div>'
      + '<p style="margin:.8rem 0 .2rem;font-size:1.15rem">Peranmu: <b>' + esc(rol.panjang) + '</b></p><p class="muted" style="margin:0">Kelompok ' + t.grup + ' akan menjelaskan pos ini kepada kelas pada <b>Pameran Pakar</b>. Siapkan dulu bersama temanmu.</p></div>';
    await UI.dialog({ judul: 'Selamat!', ikon: ik('bintang', 'besar'), isi, lebar: true, tombol: [{ t: 'Mulai belajar', nilai: true, ikon: 'panah' }] });
    E.konfeti(innerWidth / 2, innerHeight / 3, 50);
  }

  /* ============================================================ pusat */
  /* pameran jigsaw: Host (penjaga meja) boleh centang/soal/lewati; Penjelajah wajib soal benar untuk semua pos lain */
  const pamLain = (t) => [1, 2, 3, 4, 5, 6, 7].filter((g) => g !== t.grup);
  const pamDone = (t) => { const p = t.pam || {}, j = p.jawab || {}; if (!p.peran) return 0; const ok = p.peran === 'kelana' ? ['benar'] : ['benar', 'paham', 'lewati']; return pamLain(t).filter((g) => ok.indexOf(j[g]) >= 0).length; };
  const pamSelesai = (t) => !!(t.pam && t.pam.peran) && pamDone(t) >= pamLain(t).length;
  const status = () => { const t = T(); if (XG()) return [t.fam.every((f) => t.kartu[f]), pamSelesai(t), !!t.dis.selesai, !!t.cocok.selesai, !!(t.fung && t.fung.selesai), !!t.tamat]; return [t.fam.every((f) => t.kartu[f]), !!t.dis.selesai, !!t.cocok.selesai, !!t.tamat]; };
  function terbuka(k, sel) { if (E.idx() === B.DUMMY) return true; if (E.net() === 'online') return (T().aktif || [1]).indexOf(k) >= 0; return k === 1 || sel[k - 2]; }
  async function hub() {
    E.bawahKosong(); E.gambarAtas(); await tentukan(); const t = T(); if (!t.sapa) { await sapaPasangan(); t.sapa = true; E.simpan(); }
    mulaiCek(); render(); kirim({ sel: status() });
  }
  function render() {
    const t = T(), sel = status(), selesai = sel.filter(Boolean).length, p = hitung(), fam = t.fam; const w = el('div', { kelas: 't2-hub' });
    /* sisi kiri */
    const sisi = el('aside', { kelas: 'kartu t2-sisi' }), tim = [B.nama(E.idx())].concat(t.mitra || []);
    sisi.append(el('div', { kelas: 'eyebrow' }, t.grup ? 'Kelompok ' + t.grup + ' · Pos ' + t.grup : 'Pakar integral'));
    sisi.append(el('div', { kelas: 't2-tim', html: tim.map((n, i) => '<div class="av-kol kecil"><span class="av-besar kecil fx-' + WARNA9[(n.length + i * 4) % 7] + '">' + esc(inisial(n)) + '</span><span>' + esc(n.split(/\s+/)[0]) + (i === 0 ? ' <span class="muted kecil">(kamu)</span>' : '') + '</span></div>').join('') }));
    if (XG() && t.grup) sisi.append(el('div', { kelas: 'baris', gaya: 'gap:.4rem;flex-wrap:wrap' }, el('span', { kelas: 'chip sorot', html: ik(B.peranDariPos(t.pos || 0).kode === 'jaga' ? 'kelompok' : 'mata', 'kecil') + esc(B.peranDariPos(t.pos || 0).panjang) })));
    const R = 34, C = 2 * Math.PI * R;
    sisi.append(el('div', { kelas: 't2-kemajuan', html: '<svg viewBox="0 0 80 80" class="cincin"><circle cx="40" cy="40" r="' + R + '" fill="none" stroke="#CFE8E4" stroke-width="8"/><circle cx="40" cy="40" r="' + R + '" fill="none" stroke="#0F766E" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (C * selesai / sel.length).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 40 40)"/><text x="40" y="47" text-anchor="middle" font-size="22" font-weight="700" font-family="Fraunces,Georgia,serif" fill="#12263F">' + selesai + '/' + sel.length + '</text></svg><div><b style="font-size:1.1rem">Kemajuanmu</b><div class="muted kecil">' + selesai + ' dari ' + sel.length + ' langkah selesai</div><span class="chip sorot" style="margin-top:.3rem">' + ik('bintang', 'kecil') + p.poin + ' skor</span></div>' }));
    sisi.append(el('div', { kelas: 'eyebrow', gaya: 'margin-top:.2rem' }, 'Pos kelompokmu'), el('div', { kelas: 't2-fam', html: fam.map((f) => '<div class="t2-fam-baris fx-' + f + '">' + UI.ubin(f) + '<b>' + NAMA[f] + '</b>' + (t.kartu[f] ? '<span class="ok-bulat">' + ik('centang', 'kecil') + '</span>' : '') + '</div>').join('') }));
    if (t.tiket.selesai) sisi.append(el('button', { kelas: 'btn hijau denyut-h t2-catatan', type: 'button', html: ik('buku', 'kecil') + 'Catatan belajar (PDF)', onclick: bukaCatatan }));
    sisi.append(el('button', { kelas: 'btn ' + (t.tamat ? 'hijau' : 'sekunder') + ' t2-ringkas', type: 'button', disabled: !t.tamat, html: ik(t.tamat ? 'bintang' : 'gembok', 'kecil') + 'Lihat ringkasan akhir', onclick: tamat }));
    /* sisi kanan */
    const kanan = el('section', { kelas: 't2-utama' }); kanan.append(el('div', { kelas: 't2-judul' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Tahap lanjutan'), el('h2', { gaya: 'margin:0' }, 'Perjalanan belajarmu')), el('div', { kelas: 't2-sambung' }, el('div', { kelas: 'muted' }, 'Langkah dibuka oleh guru saat sudah waktunya.'), el('div', { kelas: 'baris', gaya: 'justify-content:flex-end;gap:.5rem' }, statusSambung(), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('ulang', 'kecil') + 'Segarkan', onclick: async (e) => { const b = e.currentTarget; b.disabled = true; await cekGuru(true); if (document.querySelector('.t2-hub')) render(); } })))));
    const L = langkahXG(t, fam);
    const grid = el('div', { kelas: 't2-langkah n6' });
    L.forEach(([no, j, ikon, d, meta, fn, warna, tot, isi]) => {
      const ok = sel[no - 1], buka = terbuka(no, sel), kelas = ok ? 'selesai' : (buka ? 'siap' : 'terkunci');
      const kartu = el('div', { kelas: 'kartu t2-kartu fx-' + warna + ' ' + kelas });
      kartu.append(el('div', { kelas: 'baris' }, el('span', { kelas: 'no-bulat', html: ok ? ik('centang', 'kecil') : (buka ? String(no) : ik('gembok', 'kecil')) }), el('h3', { gaya: 'margin:0' }, j), el('span', { kelas: 'chip ' + (ok ? 'ok' : (buka ? 'sorot' : 'abu')), gaya: 'margin-left:auto', html: ok ? 'selesai' : (buka ? 'terbuka' : ik('gembok', 'kecil') + 'terkunci') })),
        el('p', { kelas: 'muted', gaya: 'margin:.5rem 0 .3rem' }, d), el('div', { kelas: 't2-meta' }, meta), el('div', { kelas: 't2-prog' }, Array.from({ length: tot }, (_, i) => el('span', { kelas: 'pt' + (i < isi ? ' on' : '') }))));
      kartu.append(el('button', { kelas: 'btn t2-tbl' + (ok ? ' sekunder' : (buka ? ' denyut' : '')), type: 'button', disabled: !buka, html: !buka ? ik('gembok', 'kecil') + 'Menunggu aba-aba guru' : (ok ? 'Buka lagi' : (meta.charAt(0) === '0' ? 'Mulai' : 'Lanjutkan')) + ik('panah', 'kecil'), onclick: () => fn() })); grid.append(kartu);
    });
    kanan.append(grid); w.append(sisi, kanan); E.layar(w);
  }
  function langkahXG(t, fam) {
    const pamN = pamDone(t), fungN = ((t.fung && t.fung.hasil) || []).filter(Boolean).length, rd = (t.dis.rnd || []).filter((r) => r && r.selesai).length, cj = t.cocok.jawab.filter((v) => v != null).length, tj = (t.tiket.jawab || []).filter((v) => v != null).length;
    return [
      [1, 'Kartu pakar', 'buku', 'Kuasai pos kelompokmu: rumus luas, gambar daerah, ciri, lalu soal cerita.', fam.filter((f) => t.kartu[f]).length + ' dari ' + fam.length + ' kartu', kartuPakar, 'bawah', fam.length, fam.filter((f) => t.kartu[f]).length],
      [2, 'Pameran pakar', 'kelompok', 'Putaran keliling dan transfer ilmu. Kuasai keenam pos lain dari teman-temanmu.', pamN + ' dari ' + pamLain(t).length + ' pos', pameran, 'potong', pamLain(t).length, pamN],
      [3, 'Tebak bagiannya', 'kelompok', 'Diskusi: cerita dan tabel ini dihitung luasnya dengan cara yang mana?', rd + ' dari 6 tebakan', diskusi, 'garis', 6, rd],
      [4, 'Cocokkan masalah', 'mata', 'Lima masalah nyata: tentukan bagian (cara hitung) yang cocok.', cj + ' dari 5 masalah', cocok, 'parab', 5, cj],
      [5, 'Tantangan sintesis', 'pensil', 'Dari gambar daerah ke integral: tentukan batas, atas–bawah, lalu hitung.', fungN + ' dari 3 tugas', fungsi, 'silang', 3, fungN],
      [6, 'Tiket keluar', 'ujian', 'Tiga soal singkat, lalu refleksi. Kerjakan sendiri.', tj + ' dari 3 soal', tiket, 'sumbuy', 3, tj]
    ];
  }
  function bukaCatatan() { if (window.Catatan) Catatan.buka({ idx: E.idx(), P: E.P() }); }
  /* sambungan ke guru: memeriksa langkah yang dibuka. Gagal diperiksa = ditampilkan jelas, bukan diam-diam. */
  const sambung = { ok: 0, gagal: 0 };
  const jam = (ms) => new Date(ms).toTimeString().slice(0, 8);
  function statusSambung() {
    if (E.idx() === B.DUMMY) return el('span', { kelas: 'chip sorot', html: 'Akun uji coba: semua langkah terbuka' });
    if (E.net() !== 'online') return el('span', { kelas: 'chip warn', html: ik('putus', 'kecil') + 'Mode mandiri' });
    if (sambung.ok && sambung.gagal === 0) return el('span', { kelas: 'chip ok', html: ik('wifi', 'kecil') + 'Terhubung ke guru · ' + jam(sambung.ok) });
    if (sambung.gagal >= 2) return el('span', { kelas: 'chip warn', html: ik('putus', 'kecil') + 'Belum bisa memeriksa guru' });
    return el('span', { kelas: 'chip abu', html: 'Memeriksa guru…' });
  }
  function perbaruiStatus() { const w = document.querySelector('.t2-sambung .baris'); if (w && w.firstChild) w.replaceChild(statusSambung(), w.firstChild); }
  async function cekGuru(manual) { try { await cekGuru2(manual); } finally { perbaruiStatus(); } }
  async function cekGuru2(manual) {
    if (E.idx() === B.DUMMY) return;
    if (E.net() !== 'online' && E.cekNet) await E.cekNet();
    if (E.net() !== 'online') { sambung.gagal++; return; }
    const r = await E.api('t2s', { idx: E.idx() });
    if (!(r && r.ok)) { sambung.gagal++; if (manual) UI.toast('Belum tersambung ke guru. Coba lagi sebentar lagi.', 'awas'); return; }
    sambung.ok = Date.now(); sambung.gagal = 0;
    const t = T(); if ((r.pameran || 0) !== (t.pameran || 0)) { t.pameran = r.pameran || 0; E.simpan(); if (pamHook) pamHook(); if (t.pameran) UI.toast('Pameran pakar: ' + FASE[Math.min(5, t.pameran)], 'bintang'); }
    const baru = Array.isArray(r.aktif) ? r.aktif : Array.from({ length: r.n || 4 }, (_, i) => i + 1).filter((n) => n <= (r.buka || 1)), lama = t.aktif || [1];
    if (JSON.stringify(baru) === JSON.stringify(lama)) { if (manual) UI.toast('Sudah yang terbaru', 'centang'); return; }
    t.aktif = baru; E.simpan(); const nb = baru.filter((n) => lama.indexOf(n) < 0), tutup = lama.filter((n) => baru.indexOf(n) < 0);
    if (nb.length) UI.toast('Guru membuka langkah ' + nb.join(', '), 'bintang'); else if (tutup.length) UI.toast('Guru menutup langkah ' + tutup.join(', '), 'info');
    if (document.querySelector('.t2-hub')) render();
  }
  function mulaiCek() {
    clearInterval(tmrCek); document.removeEventListener('visibilitychange', cekLagi); document.addEventListener('visibilitychange', cekLagi);
    if (E.idx() === B.DUMMY) return; cekGuru(false); tmrCek = setInterval(() => cekGuru(false), 4000);
  }
  function cekLagi() { if (!document.hidden && E.idx() !== B.DUMMY) cekGuru(false); }

  /* ============================================================ langkah 1: kartu pakar */
  function isiKartu(f, o) {
    const d = K[f], kolom = el('div', { kelas: 'isi fx-' + f, gaya: 'flex:1;min-height:0' }), kiri = el('div', { kelas: 'kotak-grafik' }), wad = el('div', { kelas: 'wadah' }); kiri.append(wad);
    const kanan = el('div', { kelas: 'info gulir' }), rk = el('div', { kelas: 'rumus-kartu' }), sv = el('div', { kelas: 'seg-varian' });
    kanan.append(el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(f) }).firstChild, el('h3', { gaya: 'margin:0;font-size:1.6rem;color:var(--td)' }, NAMA[f])), el('div', { kelas: 'baris', gaya: 'flex-wrap:wrap;gap:.35rem' }, el('span', { kelas: 'muted kecil' }, 'Juga disebut:'), d.alias.map((x) => el('span', { kelas: 'chip abu' }, x))), rk); if (d.varian.length > 1) kanan.append(sv);
    kanan.append(el('div', null, el('div', { kelas: 'eyebrow' }, 'Ciri'), el('ul', null, d.ciri.map((x) => el('li', null, x)))), el('div', null, el('div', { kelas: 'eyebrow' }, 'Contoh dalam kehidupan'), el('ul', null, d.konteks.map((x) => el('li', null, x)))));
    const gambar = (v) => { wad.innerHTML = ''; const r = GF.gambarVarian(d.varian[v]); wad.append(r.svg); rk.innerHTML = '<div class="eyebrow" style="margin:0">Contoh · ' + esc(d.varian[v].nama) + '</div><div class="mat" style="font-size:' + (d.varian[v].panjang ? '1.15rem' : '1.5rem') + '">' + d.varian[v].rumus + '</div>' + '<div class="umum"><span>Rumus luas</span>' + d.umum + '</div>'; r.jalan(1400).catch(() => {}); };
    if (d.varian.length > 1) d.varian.forEach((v, k) => sv.append(el('button', { type: 'button', kelas: k === 0 ? 'aktif' : '', onclick: (e) => { [...sv.children].forEach((x) => x.classList.remove('aktif')); e.currentTarget.classList.add('aktif'); gambar(k); } }, v.nama.split('·')[0].trim())));
    gambar(0); kolom.append(kiri, kanan); return { kolom, kanan };
  }
  function kartuPakar() {
    E.bawahKosong(); const t = T(), fam = t.fam; let aktif = Math.max(0, fam.findIndex((f) => !t.kartu[f])); const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const f = fam[aktif], sel = fam.every((x) => t.kartu[x]);
      const kep = el('div', { kelas: 't2-kepala' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Langkah 1 · ' + fam.filter((x) => t.kartu[x]).length + ' dari ' + fam.length + ' kartu selesai'), el('h2', { gaya: 'margin:0' }, 'Kartu pakar')), el('div', { kelas: 'baris' }, sel ? el('button', { kelas: 'btn hijau denyut-h', type: 'button', html: 'Semua kartu selesai' + ik('panah', 'kecil'), onclick: hub }) : null, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub })));
      const daftar = el('div', { kelas: 'daftar gulir' }), isi = el('div', { gaya: 'min-height:0;display:flex;flex-direction:column;gap:.5rem' });
      fam.forEach((x, i) => daftar.append(el('button', { kelas: 'tab fx-' + x + (i === aktif ? ' aktif' : '') + (t.kartu[x] ? ' lihat' : ''), type: 'button', html: UI.ubin(x) + '<span>' + NAMA[x] + '</span>' + ik('centang', 'kecil').replace('class="ik kecil"', 'class="ik kecil centang"'), onclick: () => { aktif = i; gambar(); } })));
      const { kolom, kanan } = isiKartu(f);
      if (XG()) kanan.append(el('div', { kelas: 'umpan ok', gaya: 'align-items:flex-start', html: ik('info') + '<span><b>Siapkan penjelasanmu.</b> Kelompokmu akan menjadi Host untuk pos ini: nama dan rumus luas, gambar daerah, cara mencari batas, satu contoh kehidupan. Latihan dulu bersama temanmu.</span>' }));
      kanan.append(el('div', { kelas: 'uji-kotak' }, el('div', null, el('b', null, t.kartu[f] ? 'Kartu ini sudah kamu kuasai' : 'Siap menguji dirimu?'), el('div', { kelas: 'muted kecil' }, 'Satu soal cerita: hitung luas daerah untuk pos ' + NAMA[f] + '.')), el('button', { kelas: 'btn hijau ' + (t.kartu[f] ? '' : 'denyut-h'), type: 'button', html: ik('ujian') + (t.kartu[f] ? 'Coba lagi' : 'Uji sekarang'), onclick: () => uji(f, true) })));
      isi.append(kolom); w.append(kep, el('div', { kelas: 'galeri t2-galeri' }, daftar, isi));
    }
    async function uji(f, baru) {
      t.coba = t.coba || {}; if (baru) t.coba[f] = 0; const q = B.tantanganAcak(f, Math.floor(Math.random() * 2e9)), v = await UI.keypadAngka({ judul: 'Soal cerita · ' + NAMA[f], tanya: q.tanya, ikon: ik('ujian', 'besar') }); if (v == null) return;
      t.coba = t.coba || {}; t.coba[f] = (t.coba[f] || 0) + 1;
      if (v === q.kunci) { t.kartu[f] = 1; sinkron({ kartu: Object.keys(t.kartu) }); E.konfeti(innerWidth / 2, innerHeight / 3, 34); await UI.info('Tepat!', '<div class="tengah"><p style="font-size:1.25rem">' + q.jelas + '</p></div>', 'Lanjut', { ikon: ik('centang', 'besar') }); if (fam.every((x) => t.kartu[x])) { await UI.info('Semua kartu selesai', '<div class="tengah"><p style="font-size:1.25rem">Kamu sudah menguasai kartu pakar pos kelompokmu. Tunggu aba-aba guru untuk langkah berikutnya.</p></div>', 'Kembali ke pusat'); return hub(); } aktif = Math.max(0, fam.findIndex((x) => !t.kartu[x])); gambar(); }
      else if (t.coba[f] >= 2) { if (!t.kartu[f]) t.kartu[f] = 2; sinkron({ kartu: Object.keys(t.kartu) }); await UI.info('Ini jawabannya', '<div class="tengah"><p style="font-size:1.25rem">' + q.jelas + '</p><p class="muted">Tidak apa-apa. Tanyakan temanmu bila masih bingung.</p></div>', 'Mengerti', { ikon: ik('info', 'besar') }); gambar(); }
      else { const lagi = await UI.dialog({ judul: 'Belum tepat', ikon: ik('info', 'besar'), isi: '<div class="tengah"><p style="font-size:1.25rem">Jawabanmu <b>' + F(v) + '</b> belum tepat.</p><p class="muted">Petunjuk: cari batas dulu, tentukan kurva atas (atau kanan), lalu hitung pelan-pelan.</p></div>', tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }, { t: 'Coba lagi', nilai: true }] }); if (lagi) uji(f); }
    }
    gambar();
  }

  /* ============================================================ langkah 2: tebak bagiannya (diskusi) */
  const PERAN = [['Pembaca', 'Bacakan konteks dan tabel dengan kata-katamu sendiri.'], ['Penebak', 'Sebutkan tebakanmu dan satu alasan.'], ['Penyanggah', 'Setuju atau beri pandangan lain, lengkap dengan alasannya.'], ['Pencatat', 'Ketuk jawaban setelah kelompok sepakat.']];
  function diskusi() {
    E.bawahKosong(); const t = T(), soal = B.diskusiSiswa(t.grup || (E.idx() % 7) + 1), semua = B.URUT; t.dis.rnd = t.dis.rnd || []; let no = Math.min(5, t.dis.rnd.filter((r) => r && r.selesai).length);
    const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const s = soal[no], r = t.dis.rnd[no] = t.dis.rnd[no] || { coba: 0, selesai: false, ok: false }, peran = PERAN[(no + (t.pos || 0)) % 4];
      const k = kerangka('Langkah ' + NO().dis + ' · tebakan ' + (no + 1) + ' dari 6', 'Tebak bagiannya', { titik: soal.map((_, i) => (i === no ? 'now' : ((t.dis.rnd[i] && t.dis.rnd[i].selesai) ? 'isi' : ''))), ke: (i) => { if (i <= t.dis.rnd.filter((x) => x && x.selesai).length) { no = i; gambar(); } } });
      const kiri = el('div', { kelas: 'kartu t2-konteks' }); kiri.innerHTML = '<div class="eyebrow">Kejadian sehari-hari</div><h3>' + esc(s.judul) + '</h3><p style="font-size:1.15rem;margin:.2rem 0 .4rem">' + esc(s.konteks) + '</p><div class="tabel-besar">' + tabelData(s) + '</div><p class="muted kecil" style="margin:.5rem 0 0">Baca tabelnya: kolom mana yang sama di ujung-ujung? mana yang negatif? apa yang bertukar?</p>';
      const kanan = el('div', { kelas: 't2-diskusi' }); kanan.append(el('div', { kelas: 'peran' }, el('span', { kelas: 'chip sorot', html: ik('siswa', 'kecil') + 'Perananmu: ' + peran[0] }), el('span', { kelas: 'muted kecil' }, peran[1])), el('div', { kelas: 'umpan ok', gaya: 'align-items:flex-start;flex-direction:column;gap:.15rem' , html: '<b>Bicarakan dulu bersama kelompok</b>' + B.PROMPT.map((x, i) => '<span>' + (i + 1) + '. ' + esc(x) + '</span>').join('') }));
      const gridF = el('div', { kelas: 'fam-pilih' }); semua.forEach((f) => gridF.append(el('button', { kelas: 'fam-tbl fx-' + f + (r.selesai ? (f === s.fam ? ' benar' : '') : '') + (r.salah === f && !r.selesai ? ' salah' : ''), type: 'button', html: UI.ubin(f) + '<span>' + NAMA[f] + '</span>', onclick: () => (r.selesai ? lihat() : pilih(f)) }))); kanan.append(el('div', { kelas: 'eyebrow', gaya: 'margin-top:.2rem' }, r.selesai ? 'Jawaban kelompok' : 'Menurut kelompokmu, luas daerah ini dihitung dengan …'), ...(r.selesai ? [el('button', { kelas: 'btn hijau', type: 'button', html: ik('mata') + 'Lihat penjelasan dan gambarnya', onclick: lihat })] : []), gridF);
      k.isi.append(kiri, kanan); k.isi.classList.add('dua'); const sudah = t.dis.rnd.filter((x) => x && x.selesai).length;
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), el('span', { kelas: 'muted' }, r.selesai ? 'Tebakanmu sudah dikunci' : 'Tanpa batas waktu. Diskusikan sampai sepakat.'), no < 5 ? tombol('Berikutnya', 'panah', { p: { disabled: !r.selesai, onclick: () => { no++; gambar(); } } }) : tombol('Selesai diskusi', 'centang', { kelas: 'hijau', kiri: true, p: { disabled: sudah < 6, onclick: akhir } }));
      w.append(k.w);
    }
    async function pilih(f) {
      const s = soal[no], r = t.dis.rnd[no]; r.salah = null;
      if (f === s.fam) { r.selesai = true; r.ok = r.coba === 0; r.pilih = f; hitungDis(); E.simpan(); sinkron({ diskusi: { benar: t.dis.benar, total: 6 } }); if (r.ok) E.konfeti(innerWidth / 2, innerHeight / 3, 30); gambar(); await penjelasan({ ok: true, judul: r.ok ? 'Tepat sekali!' : 'Tepat!', s, fam: s.fam, lanjut: no < 5 ? 'Lanjut' : 'Tutup' }); }
      else if (r.coba >= 1) { r.selesai = true; r.ok = false; r.pilih = s.fam; hitungDis(); E.simpan(); sinkron({ diskusi: { benar: t.dis.benar, total: 6 } }); gambar(); await penjelasan({ ok: false, judul: 'Ini jawabannya', s, fam: s.fam, pilihF: f, lanjut: no < 5 ? 'Lanjut' : 'Tutup' }); }
      else { r.coba++; r.salah = f; E.simpan(); gambar(); await UI.dialog({ judul: 'Belum cocok', ikon: ik('info', 'besar'), isi: '<div class="tengah"><p style="font-size:1.2rem">Bukan <b>' + NAMA[f] + '</b>. Diskusikan sekali lagi.</p><p class="muted">Perhatikan kolom-kolom pada tabel: ada yang bernilai negatif? sama di ujung-ujung? posisi atas dan bawahnya bertukar? ditulis sebagai x atau y?</p></div>', tombol: [{ t: 'Coba lagi', nilai: true }] }); }
    }
    const lihat = () => penjelasan({ ok: !!(t.dis.rnd[no] && t.dis.rnd[no].ok), judul: 'Penjelasan putaran ' + (no + 1), s: soal[no], fam: soal[no].fam, lanjut: 'Tutup' });
    function hitungDis() { t.dis.benar = t.dis.rnd.filter((x) => x && x.ok).length; }
    function dialogFeedback(ok, s, f, judul) {
      const isi = el('div', { kelas: 'umpan-isi' }); isi.innerHTML = '<div class="umpan-g"></div><div><p style="font-size:1.25rem;margin:0 0 .4rem">Ini bagian <b>' + NAMA[s.fam] + '</b>' + (ok ? '' : ', bukan ' + NAMA[f]) + '.</p><p style="margin:.2rem 0">' + esc(s.alasan) + '</p></div>'; isi.querySelector('.umpan-g').append(miniGrafik(s.fam));
      return UI.dialog({ lebar: true, judul, ikon: ik(ok ? 'centang' : 'info', 'besar'), isi, tombol: [{ t: no < 5 ? 'Lanjut' : 'Tutup', nilai: true }] });
    }
    async function akhir() {
      t.dis.selesai = true; hitungDis(); sinkron({ diskusi: { benar: t.dis.benar, total: 6 } }); E.konfeti(innerWidth / 2, innerHeight / 3, 50);
      await UI.info('Diskusi selesai', '<div class="tengah"><p style="font-size:1.3rem"><b>' + t.dis.benar + ' dari 6</b> tebakan tepat pada percobaan pertama.</p><p class="muted">Tunggu aba-aba guru untuk langkah berikutnya.</p></div>', 'Kembali ke pusat', { ikon: ik('bintang', 'besar') }); hub();
    }
    gambar();
  }

  /* ============================================================ langkah 3 & soal tiket: cocokkan grafik */
  function kartuSoal(item, o) {
    const s = B.SITUASI[item.situasi], w = el('div', { kelas: 'cocok-isi' }), kiri = el('div', { kelas: 'kartu cocok-sit gulir' }), pil = el('div', { kelas: 'cocok-nama' });
    kiri.innerHTML = '<div class="eyebrow">Masalah nyata</div><h3>' + esc(s.judul) + '</h3><p style="font-size:1.12rem;margin:.1rem 0 .3rem">' + esc(s.teks) + '</p><div class="tabel-besar">' + tabelData(s) + '</div><p class="muted kecil" style="margin:.5rem 0 0">Baca cerita dan tabelnya dengan teliti, lalu pilih cara hitung yang paling cocok.</p>';
    pil.append(el('div', { kelas: 'eyebrow' }, 'Luasnya paling cocok dihitung dengan …'));
    item.opsi.forEach((f, k) => { const st = o.reveal ? (k === item.kunci ? ' benar' : (k === o.jawab ? ' salah' : '')) : (k === o.jawab ? ' dipilih' : ''); pil.append(el('button', { kelas: 'opsi-nama fx-' + f + st, type: 'button', disabled: !!o.reveal, onclick: () => o.pilih(k), html: '<span class="hrf">' + 'ABC'[k] + '</span><span class="nm"><b>' + NAMA[f] + '</b><span class="muted kecil">' + K[f].alias.slice(0, 2).join(' · ') + '</span></span>' + (st.indexOf('benar') >= 0 ? ik('centang') : (st.indexOf('salah') >= 0 ? ik('silang') : '')) })); });
    w.append(kiri, pil); return w;
  }
  function umpanCocok(item, k) {
    const s = B.SITUASI[item.situasi], ok = k === item.kunci, f = item.fam, pilihF = item.opsi[k], isi = el('div', { kelas: 'umpan-isi' });
    isi.innerHTML = '<div class="umpan-g"></div><div><p style="font-size:1.25rem;margin:0 0 .3rem">Ini bagian <b>' + NAMA[f] + '</b>' + (ok ? '' : ', bukan ' + NAMA[pilihF]) + '.</p><p style="margin:.2rem 0"><b>Mengapa?</b> ' + esc(s.alasan) + '</p>' + (ok ? '' : '<p class="muted" style="margin:.3rem 0">Ciri <b>' + NAMA[pilihF] + '</b>: ' + esc(K[pilihF].ciri[0]) + ' Data di atas tidak seperti itu.</p>') + '</div>'; isi.querySelector('.umpan-g').append(miniGrafik(f, true)); return isi;
  }
  function cocok() {
    E.bawahKosong(); const t = T(), soal = B.cocokSiswa(E.idx()); let no = Math.min(4, t.cocok.jawab.filter((v) => v != null).length); const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      if (t.cocok.selesai && t.cocok.tampilHasil !== false && no > 4) return hasil();
      w.innerHTML = ''; const item = soal[no], jwb = t.cocok.jawab[no], terjawab = jwb != null;
      const k = kerangka('Langkah ' + NO().cocok + ' · masalah ' + (no + 1) + ' dari 5', 'Cocokkan masalah', { titik: soal.map((_, i) => (i === no ? 'now' : (t.cocok.jawab[i] != null ? 'isi' : ''))), ke: (i) => { no = i; gambar(); } });
      k.isi.append(kartuSoal(item, { jawab: jwb, reveal: terjawab, pilih: async (p) => { t.cocok.jawab[no] = p; t.cocok.benar = soal.filter((s, i) => t.cocok.jawab[i] === s.kunci).length; if (t.cocok.jawab.filter((v) => v != null).length >= 5) t.cocok.selesai = true; sinkron({ cocok: { benar: t.cocok.benar } }); const ok = p === item.kunci; gambar(); if (ok) E.konfeti(innerWidth / 2, innerHeight / 3, 26); await penjelasan({ ok, judul: ok ? 'Tepat!' : 'Belum tepat', s: B.SITUASI[item.situasi], fam: item.fam, pilihF: item.opsi[p], lanjut: t.cocok.selesai && no === 4 ? 'Lihat hasil' : 'Lanjut' }); if (t.cocok.selesai && no === 4) { t.cocok.tampilHasil = true; no = 5; return hasil(); } if (no < 4) { no++; gambar(); } } }));
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), terjawab ? el('button', { kelas: 'btn hijau kecil', type: 'button', html: ik('mata', 'kecil') + 'Lihat penjelasan dan gambar', onclick: () => penjelasan({ ok: jwb === item.kunci, judul: 'Penjelasan masalah ' + (no + 1), s: B.SITUASI[item.situasi], fam: item.fam, pilihF: item.opsi[jwb], lanjut: 'Tutup' }) }) : el('span', { kelas: 'muted' }, 'Pilih satu jawaban'), no < 4 ? tombol('Berikutnya', 'panah', { p: { disabled: !terjawab, onclick: () => { no++; gambar(); } } }) : tombol('Lihat hasil', 'centang', { kelas: 'hijau', kiri: true, p: { disabled: !t.cocok.selesai, onclick: () => { no = 5; hasil(); } } }));
      w.append(k.w);
    }
    function hasil() {
      w.innerHTML = ''; const b = soal.filter((s, i) => t.cocok.jawab[i] === s.kunci).length;
      const k = el('div', { kelas: 'tengah-isi kartu', gaya: 'padding:2rem 3rem;margin:auto' }); k.innerHTML = '<div class="eyebrow" style="justify-content:center">Langkah ' + NO().cocok + ' selesai</div><h2>' + b + ' dari 5 masalah tepat</h2><div class="baris" style="justify-content:center;flex-wrap:wrap">' + soal.map((s, i) => '<span class="chip ' + (t.cocok.jawab[i] === s.kunci ? 'ok' : 'warn') + '">' + (i + 1) + '. ' + esc(B.SITUASI[s.situasi].judul) + ' · ' + NAMA[s.fam] + '</span>').join('') + '</div><p class="muted">Yang belum tepat tidak apa-apa. Bahas bersama kelompokmu.</p>';
      k.append(el('div', { kelas: 'baris', gaya: 'justify-content:center' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Lihat lagi', onclick: () => { no = 0; gambar(); } }), el('button', { kelas: 'btn', type: 'button', html: 'Ke pusat' + ik('panah'), onclick: hub }))); w.append(k); E.konfeti(innerWidth / 2, innerHeight * .3, 40);
    }
    gambar();
  }

  /* ============================================================ langkah 4: tiket keluar + refleksi */
  function tiket() {
    E.bawahKosong(); const t = T(), idx = E.idx(), soal = B.tiketSiswa(idx), tk = t.tiket; tk.jawab = tk.jawab || [null, null, null]; if (tk.selesai) return refleksi(); let no = 0; const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    const terisi = () => tk.jawab.filter((v) => v != null).length;
    function gambar() {
      w.innerHTML = ''; const q = soal[no], j = tk.jawab[no];
      const k = kerangka('Tiket keluar · soal ' + (no + 1) + ' dari 3', 'Kerjakan sendiri', { titik: soal.map((_, i) => (i === no ? 'now' : (tk.jawab[i] != null ? 'isi' : ''))), ke: (i) => { no = i; gambar(); } });
      if (q.jenis === 'hitung') { const c = el('div', { kelas: 'kartu tengah-isi', gaya: 'padding:2rem 3rem;max-width:44rem;margin:auto' }); c.innerHTML = '<div class="teks-soal" style="font-size:2.1rem">' + q.tanya + '</div><div class="layar-angka' + (j == null ? ' kosong' : '') + '" style="min-width:10rem">' + (j == null ? '…' : F(j)) + '</div>'; c.append(el('button', { kelas: 'btn besar', type: 'button', html: ik('pensil') + (j == null ? 'Isi jawaban' : 'Ubah jawaban'), onclick: async () => { const v = await UI.keypadAngka({ judul: 'Jawabanmu', tanya: q.tanya }); if (v != null) { tk.jawab[no] = v; E.simpan(); gambar(); } } })); k.isi.append(c); }
      else if (q.jenis === 'nama') { const c = el('div', { kelas: 'cocok-isi' }), kiri = el('div', { kelas: 'kartu cocok-sit gulir' }); kiri.append(el('div', { kelas: 'eyebrow' }, 'Perhatikan daerah terarsir'), el('div', { gaya: 'height:15rem' }, miniGrafik(q.fam)), el('p', { kelas: 'teks-soal', gaya: 'font-size:1.3rem;margin-top:.6rem' }, q.tanya)); const op = el('div', { kelas: 'cocok-nama' }); q.opsi.forEach((f, i) => op.append(el('button', { kelas: 'opsi-nama fx-' + f + (j === i ? ' dipilih' : ''), type: 'button', html: '<span class="hrf">' + 'ABCD'[i] + '</span><span class="nm"><b>' + NAMA[f] + '</b></span>', onclick: () => { tk.jawab[no] = i; E.simpan(); gambar(); } }))); c.append(kiri, op); k.isi.append(c); }
      else { k.isi.append(kartuSoal(q, { jawab: j, reveal: false, pilih: (p) => { tk.jawab[no] = p; E.simpan(); gambar(); } })); }
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), el('span', { kelas: 'muted' }, terisi() + ' dari 3 soal terjawab'), no < 2 ? tombol('Berikutnya', 'panah', { p: { onclick: () => { no++; gambar(); } } }) : tombol('Kumpulkan tiket', 'kirim', { kelas: 'hijau', kiri: true, p: { disabled: terisi() < 3, onclick: kumpul } }));
      w.append(k.w);
    }
    async function kumpul() {
      const ya = await UI.konfirmasi('Kumpulkan tiket?', '<div class="tengah"><p style="font-size:1.25rem">Semua soal sudah terjawab.</p><p class="muted">Setelah dikumpulkan, jawaban tidak bisa diubah.</p></div>', 'Ya, kumpulkan', 'Periksa lagi'); if (!ya) return;
      const ok = soal.map((q, i) => tk.jawab[i] === q.kunci); tk.skor = ok.filter(Boolean).length; tk.selesai = true; tk.ok = ok; sinkron({ tiket: { skor: tk.skor } });
      await UI.dialog({ lebar: true, judul: 'Hasil tiket: ' + tk.skor + ' dari 3', ikon: ik(tk.skor >= 2 ? 'centang' : 'info', 'besar'), isi: soal.map((q, i) => '<div class="umpan ' + (ok[i] ? 'ok' : 'hint') + '" style="margin:.4rem 0;align-items:flex-start">' + ik(ok[i] ? 'centang' : 'info') + '<span><b>Soal ' + (i + 1) + ':</b> ' + (q.jenis === 'cocok' ? 'Masalah “' + esc(B.SITUASI[q.situasi].judul) + '”: bagian ' + NAMA[q.fam] + '. ' + esc(B.SITUASI[q.situasi].alasan) : q.jelas) + '</span></div>').join(''), tombol: [{ t: 'Lanjut ke refleksi', nilai: true }] });
      refleksi();
    }
    gambar();
  }
  function refleksi() {
    E.bawahKosong(); const t = T(); t.ref = t.ref || { kuasai: [], bingung: [] }; t.ref.kuasai = t.ref.kuasai || []; t.ref.bingung = t.ref.bingung || []; const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const total = t.ref.kuasai.length + t.ref.bingung.length;
      const k = kerangka('Refleksi', 'Bagaimana belajarmu hari ini?', { pusat: false });
      const kartu = (judul, ket, jenis, lain) => { const c = el('div', { kelas: 'kartu ref-kartu' }), g = el('div', { kelas: 'ref-grid' }); c.append(el('h3', { gaya: 'margin:0' }, judul), el('div', { kelas: 'muted kecil', gaya: 'margin-bottom:.4rem' }, ket)); B.URUT.forEach((f) => { const on = adaFam(f, t.ref[jenis]), mati = adaFam(f, t.ref[lain]); g.append(el('button', { kelas: 'ref-pil fx-' + f + (on ? ' on' : '') + (mati ? ' mati' : ''), type: 'button', disabled: mati, title: mati ? 'Sudah kamu pilih di kotak lainnya' : '', html: UI.ubin(f) + '<span>' + NAMA[f] + '</span><span class="cek">' + ik('centang', 'kecil') + '</span>', onclick: () => { const a = t.ref[jenis], i = a.indexOf(f); if (i >= 0) a.splice(i, 1); else a.push(f); E.simpan(); gambar(); } })); }); c.append(g); return c; };
      k.isi.append(el('div', { kelas: 'ref-dua' }, kartu('Bagian yang sudah kukuasai', 'Boleh pilih lebih dari satu.', 'kuasai', 'bingung'), kartu('Bagian yang masih membuatku bingung', 'Bagian yang sudah kamu kuasai tidak bisa dipilih di sini.', 'bingung', 'kuasai')));
      k.nav.append(el('span', { kelas: 'muted' }, total + ' bagian dipilih'), el('span'), tombol('Selesai dan lihat penghargaan', 'bintang', { kelas: 'hijau denyut-h', kiri: true, p: { disabled: total === 0, onclick: () => { t.tamat = true; sinkron({ kuasai: t.ref.kuasai, bingung: t.ref.bingung, selesai: true }); tamat(); } } }));
      w.append(k.w);
    }
    gambar();
  }

  /* ============================================================ penutup: kartu penghargaan */
  function tamat() {
    E.bawahKosong(); const t = T(), p = hitung(), b = B.cocokSiswa(E.idx()).filter((s, i) => t.cocok.jawab[i] === s.kunci).length;
    const w = el('div', { kelas: 'penghargaan' }); const nama = B.nama(E.idx());
    w.innerHTML = '<div class="kartu-hadiah"><div class="pita">Kartu Penghargaan</div><div class="eyebrow" style="justify-content:center">Matematika Tingkat Lanjut · Integral Tentu</div><h1 class="ph-nama">' + esc(nama) + '</h1><div class="gelar">' + esc(p.gelar) + '</div>'
      + '<div class="poin-besar"><span id="angkaPoin">0</span><small>skor capaian</small></div>'
      + '<div class="lencana-baris">' + (p.lencana.length ? p.lencana.map((l) => '<span class="lencana">' + ik('bintang', 'kecil') + esc(l) + '</span>').join('') : '<span class="muted">Lencana muncul saat kamu menyelesaikan langkah-langkahnya.</span>') + '</div>'
      + '<div class="ph-stat"><div><b>' + (t.fam || []).filter((f) => t.kartu[f]).length + '/' + (t.fam || []).length + '</b><span>kartu pakar</span></div><div><b>' + ((t.dis && t.dis.benar) || 0) + '/6</b><span>tebakan tepat</span></div><div><b>' + b + '/5</b><span>cocokkan masalah</span></div><div><b>' + ((t.tiket && t.tiket.skor) || 0) + '/3</b><span>tiket keluar</span></div></div>'
      + '<p class="muted ph-tugas">Tugas kecil: temukan satu daerah di sekitarmu (kolam, lahan, atap, jalan) lalu tentukan: kamu akan memakai dx atau dy?</p></div>';
    w.append(el('div', { kelas: 'baris', gaya: 'justify-content:center' }, el('button', { kelas: 'btn hijau denyut-h', type: 'button', html: ik('buku') + 'Catatan belajar (PDF)', onclick: bukaCatatan }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali ke pusat', onclick: hub })));
    E.layar(w, 'tengah-layar');
    const a = w.querySelector('#angkaPoin'), t0 = performance.now(), dur = 1600; const f = (now) => { const k = Math.min(1, (now - t0) / dur); a.textContent = Math.round(p.poin * (1 - Math.pow(1 - k, 3))); if (k < 1 && a.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f);
    [300, 1100, 2000].forEach((ms) => setTimeout(() => { if (w.isConnected) E.konfeti(innerWidth * (0.25 + Math.random() * .5), innerHeight * .25, 70); }, ms));
  }

  /* ============================================================ langkah 2: pameran pakar (jigsaw) — rute putaran + transfer ilmu */
  let pamHook = null;
  const FASE = ['Belum dimulai', 'Putaran 1', 'Putaran 2', 'Putaran 3', 'Transfer ilmu 1', 'Transfer ilmu 2'];
  function pameran() {
    E.bawahKosong(); const t = T(); t.pam = t.pam || { jawab: {} }; t.pam.jawab = t.pam.jawab || {}; const j = t.pam.jawab, own = t.grup, w = el('div', { kelas: 't2-bingkai t2-pameran' }); E.layar(w);
    const urut = B.URUT; let tampil = 'daftar', ajarPos = null; const coba = {}, benarN = () => Object.keys(j).filter((k) => j[k] === 'benar').length;
    if (own && !j[own]) j[own] = 'sendiri';
    const rolDasar = () => B.peranDariPos(t.pos || 0), sub = () => (t.pam.peran === 'jaga' ? null : (t.pos === 2 ? 'B' : 'A'));
    if (!t.pam.peran) { t.pam.peran = rolDasar().kode; E.simpan(); }
    const sync = () => { t.pam.benar = benarN(); sinkron({ pam: { benar: t.pam.benar, peran: t.pam.peran || null } }); };
    pamHook = () => { if (!document.querySelector('.t2-pameran')) { pamHook = null; return; } gambar(); };
    const nm = (gNo, p) => { const g = (t.kel || [])[gNo - 1]; const n = g && g[p]; return n ? n.split(/\s+/).slice(0, 2).join(' ') : '(belum ada)'; };
    const nmPos = (g) => 'Pos ' + g + ' · ' + NAMA[urut[g - 1]];
    async function sapaPeran() {
      const s = sub(), r3 = s ? B.rute3(own, s) : [], isi = el('div', { kelas: 'tengah' });
      isi.innerHTML = '<p style="font-size:1.3rem;margin:.1rem 0 .5rem">Peranmu di Pameran Pakar: <b>' + (s ? 'Penjelajah ' + s : 'Host (penjaga meja)') + '</b></p>' + (s ? '<p>Kamu berkeliling ke 3 pos, 10 menit tiap pos:</p><div class="baris" style="justify-content:center;gap:.6rem;margin:.4rem 0">' + r3.map((g, i) => '<span class="chip fx-' + urut[g - 1] + '" style="background:var(--tt);color:var(--td);font-size:1.05rem">Putaran ' + (i + 1) + ' → ' + nmPos(g) + '</span>').join('') + '</div><p class="muted">Lalu pada Transfer ilmu, kamu mengajarkan tiga pos itu kepada rekan sekelompokmu, dan belajar tiga pos lain dari Penjelajah ' + (s === 'A' ? 'B' : 'A') + '.</p>' : '<p>Kamu <b>menetap di mejamu</b> (' + nmPos(own) + ') dan menjelaskan pos kelompokmu kepada tamu yang datang. Pada Transfer ilmu, kamu belajar enam pos lain dari kedua Penjelajah kelompokmu.</p>') + '<p class="muted kecil" style="margin-top:.6rem">Peran mengikuti urutan nama di kelompokmu. Guru mengumumkan putaran; tablet ini ikut berganti.</p>';
      await UI.dialog({ judul: 'Peranmu hari ini', ikon: ik(s ? 'mata' : 'kelompok', 'besar'), isi, tombol: [{ t: 'Mengerti', nilai: true, ikon: 'centang' }] }); t.pam.sapa = true; E.simpan();
    }
    async function gantiPeran() { const ya = await UI.konfirmasi('Ganti peran?', '<p class="tengah">Peran biasanya mengikuti urutan nama di kelompok. Penjaga yang berganti menjadi penjelajah wajib menjawab benar semua soal. Kemajuanmu tidak hilang.</p>', 'Ya, ganti', 'Batal'); if (!ya) return; t.pam.peran = t.pam.peran === 'jaga' ? 'kelana' : 'jaga'; tampil = 'daftar'; sync(); gambar(); }
    function lihatKartu(f) { UI.dialog({ lebar: true, judul: NAMA[f], ikon: UI.ubin(f), tutupX: true, tutupLuar: true, isi: el('div', { kelas: 'galeri', gaya: 'grid-template-columns:1fr;height:30rem' }, isiKartu(f).kolom), tombol: [{ t: 'Tutup', nilai: true }] }); }
    function set(g, v) { if (j[g] === v) delete j[g]; else j[g] = v; sync(); gambar(); }
    /* teks penunjuk fase yang diumumkan guru */
    function banner() {
      const f = t.pameran || 0, s = sub(), isi = [];
      if (!f) return el('div', { kelas: 'umpan hint', gaya: 'margin:.2rem 0', html: ik('jam') + '<span><b>Menunggu aba-aba guru.</b> Pelajari dulu kartu pos-posmu. Guru akan mengumumkan Putaran 1, 2, dan 3, lalu Transfer ilmu.</span>' });
      if (f <= 3) {
        if (s) { const g = B.ruteKelana(own, s, f); isi.push('<b>' + FASE[f] + ':</b> pergilah ke <b>meja ' + nmPos(g) + '</b> (Kelompok ' + g + '). Host di sana (' + nm(g, 0) + ') akan menjelaskan. Kerjakan soalnya setelah selesai.'); }
        else { const tm = B.tamuMeja(own, f); isi.push('<b>' + FASE[f] + ':</b> jaga mejamu. Tamu: <b>' + nm(tm.A, 1) + '</b> (Penjelajah A, Kelompok ' + tm.A + ') dan <b>' + nm(tm.B, 2) + '</b> (Penjelajah B, Kelompok ' + tm.B + ').'); }
      } else {
        const yg = f === 4 ? 'A' : 'B', pa = B.posAjar(own, yg), pg = pa.map(nmPos).join('; ');
        if (s === yg) isi.push('<b>' + FASE[f] + ':</b> kamu mengajar! Ajarkan <b>' + pg + '</b> kepada Host dan Penjelajah ' + (yg === 'A' ? 'B' : 'A') + '. Buka tab “Bahan mengajar”.');
        else isi.push('<b>' + FASE[f] + ':</b> dengarkan Penjelajah ' + yg + ' (' + nm(own, yg === 'A' ? 1 : 2) + ') mengajarkan <b>' + pg + '</b>. Catat, lalu kerjakan soal pos itu.');
      }
      return el('div', { kelas: 'umpan hint', gaya: 'margin:.2rem 0', html: ik('info') + '<span>' + isi.join('') + '</span>' });
    }
    function kartuJenis(g) {
      const f = urut[g - 1], st = j[g], jaga = t.pam.peran === 'jaga', s = sub(), c = el('div', { kelas: 'pj fx-' + f + (st === 'benar' || st === 'paham' || st === 'lewati' || st === 'sendiri' ? ' ok' : '') });
      const fase = t.pameran || 0, target = (s && fase >= 1 && fase <= 3) ? B.ruteKelana(own, s, fase) : 0; if (target === g) c.classList.add('sorot');
      const ket = { benar: 'soal benar', paham: 'dicentang paham', lewati: 'dilewati', gagal: 'soal belum benar', sendiri: 'pos kelompokmu' }[st] || 'belum dipelajari';
      let tag = ''; if (g !== own) { if (s) { const r = B.rute3(own, s).indexOf(g); tag = r >= 0 ? 'Putaran ' + (r + 1) : 'Dari Penjelajah ' + (s === 'A' ? 'B' : 'A'); } else { tag = B.rute3(own, 'A').indexOf(g) >= 0 ? 'Diajar Penjelajah A' : 'Diajar Penjelajah B'; } }
      c.append(el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(f) }).firstChild, el('div', { gaya: 'flex:1;min-width:0' }, el('b', { gaya: 'font-size:1.05rem;color:var(--td)' }, 'Pos ' + g + ' · ' + NAMA[f]), el('div', { kelas: 'muted kecil' }, tag ? tag : 'Kelompok ' + g)), el('span', { kelas: 'chip ' + (st && st !== 'gagal' ? 'ok' : (st === 'gagal' ? 'warn' : 'abu')) }, ket)));
      if (g === own) { c.append(el('div', { kelas: 'muted kecil', gaya: 'margin-top:.4rem' }, 'Ini pos kelompokmu, sudah dihitung selesai.')); return c; }
      const baris = el('div', { kelas: 'baris', gaya: 'margin-top:.5rem;flex-wrap:wrap;gap:.4rem' }, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('mata', 'kecil') + 'Lihat kartu', onclick: () => lihatKartu(f) }), el('button', { kelas: 'btn hijau kecil' + (st ? '' : ' denyut-h'), type: 'button', html: ik('ujian', 'kecil') + (st === 'benar' ? 'Soal ✓ ulangi' : 'Kerjakan soal'), onclick: () => ujiPam(f, g, true) }));
      if (jaga) baris.append(el('button', { kelas: 'btn sekunder kecil' + (st === 'paham' ? ' aktifx' : ''), type: 'button', disabled: st === 'benar', html: ik('centang', 'kecil') + (st === 'paham' ? 'Batal centang' : 'Sudah paham'), onclick: () => set(g, 'paham') }), el('button', { kelas: 'btn sekunder kecil' + (st === 'lewati' ? ' aktifx' : ''), type: 'button', disabled: st === 'benar' || st === 'paham', html: st === 'lewati' ? 'Batal lewati' : 'Lewati', onclick: () => set(g, 'lewati') }));
      c.append(baris); return c;
    }
    function gambar() {
      w.innerHTML = ''; const peran = t.pam.peran, s = sub();
      const k = kerangka('Langkah ' + NO().pam + ' · ' + (s ? 'Penjelajah ' + s : 'Host (penjaga meja)') + ' · ' + FASE[t.pameran || 0], 'Pameran pakar', {});
      const lain = pamLain(t), n = pamDone(t), selesai = n >= lain.length, bahan = peran === 'jaga' ? [own] : B.posAjar(own, s);
      const atas = el('div', { kelas: 'pam-atas' }, el('span', { kelas: 'chip sorot', html: ik(peran === 'jaga' ? 'kelompok' : 'mata', 'kecil') + (peran === 'jaga' ? 'Host' : 'Penjelajah ' + s) }), el('div', { kelas: 'pam-bar' }, el('div', { kelas: 'lg-bar' }, el('i', { gaya: 'width:' + Math.round(n / lain.length * 100) + '%' })), el('span', { kelas: 'muted kecil' }, n + ' dari ' + lain.length + ' pos lain ' + (peran === 'kelana' ? 'dikuasai (soal benar)' : 'selesai'))),
        el('div', { kelas: 'seg-varian' }, el('button', { type: 'button', kelas: tampil === 'daftar' ? 'aktif' : '', onclick: () => { tampil = 'daftar'; gambar(); } }, 'Pos dan soal'), el('button', { type: 'button', kelas: tampil === 'ajar' ? 'aktif' : '', onclick: () => { tampil = 'ajar'; gambar(); } }, peran === 'jaga' ? 'Mode mengajar' : 'Bahan mengajar')), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('ulang', 'kecil') + 'Ganti peran', onclick: gantiPeran }));
      k.isi.append(atas, banner());
      if (tampil === 'ajar' && own) {
        const cek = t.pam.ajarCek = t.pam.ajarCek || [false, false, false, false]; if (ajarPos == null || bahan.indexOf(ajarPos) < 0) ajarPos = bahan[0];
        k.isi.append(el('div', { kelas: 'ajar-bar' }, el('span', { kelas: 'muted' }, 'Siapkan penjelasanmu:'), ['Nama dan rumus luas', 'Gambar daerah', 'Titik potong dan batas', 'Contoh kehidupan'].map((x, i) => el('button', { kelas: 'cek-chip' + (cek[i] ? ' on' : ''), type: 'button', html: (cek[i] ? ik('centang', 'kecil') : '') + x, onclick: () => { cek[i] = !cek[i]; E.simpan(); gambar(); } })), el('span', { kelas: 'ruang' }), el('span', { kelas: 'muted' }, 'Teman yang sudah kamu ajar:'), el('button', { kelas: 'btn sekunder kecil', type: 'button', onclick: () => { t.pam.ajar = Math.max(0, (t.pam.ajar || 0) - 1); E.simpan(); gambar(); } }, '−'), el('b', { gaya: 'font-size:1.3rem;min-width:1.5rem;text-align:center' }, String(t.pam.ajar || 0)), el('button', { kelas: 'btn kecil', type: 'button', onclick: () => { t.pam.ajar = (t.pam.ajar || 0) + 1; E.simpan(); gambar(); } }, '+')));
        if (bahan.length > 1) k.isi.append(el('div', { kelas: 'seg-varian', gaya: 'align-self:flex-start' }, bahan.map((g) => el('button', { type: 'button', kelas: g === ajarPos ? 'aktif' : '', onclick: () => { ajarPos = g; gambar(); } }, 'Pos ' + g))));
        k.isi.append(el('div', { kelas: 'galeri', gaya: 'grid-template-columns:1fr;flex:1;min-height:0' }, isiKartu(urut[ajarPos - 1]).kolom));
      } else { const grid = el('div', { kelas: 'pj-grid gulir' }); [1, 2, 3, 4, 5, 6, 7].forEach((g) => grid.append(kartuJenis(g))); k.isi.append(grid); }
      k.nav.append(el('span', { kelas: 'muted' }, peran === 'kelana' ? 'Penjelajah: semua pos lain harus soal benar.' : 'Host: centang, kerjakan soal, atau lewati.'), el('span'), selesai ? tombol('Pameran selesai', 'centang', { kelas: 'hijau denyut-h', kiri: true, p: { onclick: hub } }) : el('span', { kelas: 'chip abu' }, (lain.length - n) + ' pos lagi'));
      w.append(k.w);
    }
    async function ujiPam(f, g, baru) {
      if (baru) coba[g] = 0; const q = B.tantanganAcak(f, Math.floor(Math.random() * 2e9)), v = await UI.keypadAngka({ judul: 'Soal cerita · ' + NAMA[f], tanya: q.tanya, ikon: ik('ujian', 'besar') }); if (v == null) return;
      coba[g] = (coba[g] || 0) + 1; const sebelum = pamSelesai(t);
      if (v === q.kunci) { j[g] = 'benar'; sync(); E.konfeti(innerWidth / 2, innerHeight / 3, 28); gambar(); await UI.info('Tepat!', '<div class="tengah"><p style="font-size:1.2rem">' + q.jelas + '</p></div>', 'Lanjut', { ikon: ik('centang', 'besar') }); if (!sebelum && pamSelesai(t)) { E.konfeti(innerWidth / 2, innerHeight / 3, 70); await UI.info('Pameran selesai!', '<div class="tengah"><p style="font-size:1.25rem">Kamu sudah menyelesaikan Pameran Pakar. Tunggu aba-aba guru untuk langkah berikutnya.</p></div>', 'Kembali ke pusat', { ikon: ik('bintang', 'besar') }); hub(); } }
      else if (coba[g] >= 2) { if (j[g] !== 'benar') j[g] = 'gagal'; sync(); gambar(); await UI.info('Ini jawabannya', '<div class="tengah"><p style="font-size:1.2rem">' + q.jelas + '</p><p class="muted">Coba lagi dengan soal baru sampai benar.</p></div>', 'Mengerti', { ikon: ik('info', 'besar') }); }
      else { const lagi = await UI.dialog({ judul: 'Belum tepat', ikon: ik('info', 'besar'), isi: '<div class="tengah"><p style="font-size:1.25rem">Jawabanmu <b>' + F(v) + '</b> belum tepat.</p><p class="muted">Petunjuk: tentukan batas (titik potong), mana kurva atas/kanan, lalu hitung pelan-pelan.</p></div>', tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }, { t: 'Coba lagi', nilai: true }] }); if (lagi) ujiPam(f, g); }
    }
    (async () => { if (!t.pam.sapa) await sapaPeran(); gambar(); })();
  }

  /* ============================================================ langkah 5a: contoh beranimasi "Tantangan sintesis" */
  const DEMO_SPEC = { tipe: 'x', k: [[1, -5, 2], [1, 1]], z: [{ u: 1, l: 0, a: 0, b: 3, w: 0 }] };
  function sintesisDemo() {
    E.bawahKosong(); const w = el('div', { kelas: 't2-bingkai' }); E.layar(w); let langkah = 0, tk = UI.token(), sibuk = false;
    const k = kerangka('Langkah ' + NO().fung + ' · contoh dulu', 'Tantangan sintesis', {});
    const kiri = el('div', { kelas: 'kartu cocok-sit fd-kiri' }); kiri.innerHTML = '<div class="eyebrow">Contoh dulu, lalu giliranmu</div><h3>Dari gambar daerah ke integral</h3><p style="margin:.1rem 0 .4rem;font-size:1.1rem">Daerah dibatasi parabola <b><i>y</i> = 2<i>x</i><sup>2</sup> − 5<i>x</i> + 1</b> dan garis <b><i>y</i> = <i>x</i> + 1</b>.</p><div class="plot-besar fd-plot"></div>';
    const g = GF.lukis(DEMO_SPEC, { W: 520, H: 380, animasi: true, titik: false }), b = g.b, plot = g.svg; kiri.querySelector('.fd-plot').append(plot); const ov = GF.S('g', { class: 'ov' }); plot.append(ov);
    const kanan = el('div', { kelas: 'kartu fung-aturan' }); kanan.innerHTML = '<div class="fung-umum"><span>Bentuk umum</span><div class="mat">L = ' + B.igH('a', 'b') + ' (<i>y</i><sub>atas</sub> − <i>y</i><sub>bawah</sub>) <i>dx</i></div><small><b class="huruf-l">a</b> dan <b class="huruf-l">b</b> = titik potong kedua kurva.</small></div><div class="eyebrow">Susun integralnya</div><div class="fung-rumus mat">L = ' + B.igH('[a]', '[b]').replace('[a]', '<button type="button" class="slot-f kosong" data-l="a" disabled>a</button>').replace('[b]', '<button type="button" class="slot-f kosong" data-l="b" disabled>b</button>') + ' (atas − bawah) <i>dx</i> = <button type="button" class="slot-f kosong" data-l="L" disabled>L</button></div><div class="fd-cap"></div><div class="fd-titik"></div>';
    k.isi.append(el('div', { kelas: 'cocok-isi' }, kiri, kanan)); k.isi.classList.add('fung-isi');
    const cap = kanan.querySelector('.fd-cap'), slot = (l) => kanan.querySelector('.slot-f[data-l="' + l + '"]'), dots = kanan.querySelector('.fd-titik');
    const TEKS = ['Tugas: susun integral untuk luas daerah yang dibatasi dua kurva ini. Kita perlu <b>a</b>, <b>b</b>, dan kurva <b>atas</b>.', 'Cari batas: samakan kedua persamaan. 2<i>x</i><sup>2</sup> − 5<i>x</i> + 1 = <i>x</i> + 1 → 2<i>x</i><sup>2</sup> − 6<i>x</i> = 0 → 2<i>x</i>(<i>x</i> − 3) = 0. Jadi <b>a = 0</b> dan <b>b = 3</b>.', 'Mana yang di atas? Uji <i>x</i> = 1: garis = 2, parabola = −2. Garis di atas parabola.', 'Susun: atas − bawah = (<i>x</i> + 1) − (2<i>x</i><sup>2</sup> − 5<i>x</i> + 1) = −2<i>x</i><sup>2</sup> + 6<i>x</i>. Pita-pita tegak dijumlahkan dari <i>x</i> = 0 sampai 3.', 'Hitung: [−<sup>2</sup>⁄<sub>3</sub><i>x</i><sup>3</sup> + 3<i>x</i><sup>2</sup>] dari 0 sampai 3 = (−18 + 27) − 0 = <b>9</b> satuan luas.'];
    const pulsa = async (x, y, an) => { const c = GF.S('circle', { cx: b.sx(x), cy: b.sy(y), r: 12, fill: 'none', stroke: '#E08A1E', 'stroke-width': 4 }); c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; ov.append(c); if (an) await tk.anim(c, [{ transform: 'scale(.8)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 800, iterations: 2 }); else c.style.opacity = 0; };
    const terbang = async (dariEl, keEl, teks, an) => { if (!an || !dariEl || !keEl) return; const r1 = dariEl.getBoundingClientRect(), r2 = keEl.getBoundingClientRect(), f = el('div', { kelas: 'fd-terbang' }, teks); f.style.left = r1.left + 'px'; f.style.top = r1.top + 'px'; document.body.append(f); try { await tk.anim(f, [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + (r2.left - r1.left) + 'px,' + (r2.top - r1.top) + 'px) scale(1.4)' }], { duration: 1000, easing: 'ease-in-out' }); } finally { f.remove(); } };
    const isi = (l, v) => { const s = slot(l); s.textContent = v; s.classList.remove('kosong'); s.classList.add('isi'); };
    function reset() { tk.cek(); ov.innerHTML = ''; ov.getAnimations().forEach((x) => x.cancel()); document.querySelectorAll('.fd-terbang').forEach((x) => x.remove()); g.kurva.forEach((c) => c.querySelectorAll('path').forEach((p) => { p.setAttribute('stroke-dasharray', 1); p.setAttribute('stroke-dashoffset', 1); p.getAnimations().forEach((q) => q.cancel()); })); g.isi.forEach((e) => e.bangun(0)); ['a', 'b', 'L'].forEach((l) => { const s = slot(l); s.textContent = l; s.className = 'slot-f kosong'; }); cap.innerHTML = ''; }
    const S = [
      async (an) => { if (an) { await Promise.all(g.kurva.map((c) => GF.gambarKurva(c, 1200, tk))); await tk.tidur(300); } else g.kurva.forEach((c) => c.querySelectorAll('path').forEach((p) => { p.setAttribute('stroke-dashoffset', 0); })); ['a', 'b', 'L'].forEach((l) => slot(l).classList.add('denyut')); },
      async (an) => { await pulsa(0, 1, an); await pulsa(3, 4, an); await terbang(cap, slot('a'), '0', an); isi('a', '0'); await terbang(cap, slot('b'), '3', an); isi('b', '3'); },
      async (an) => { const x = 1, yG = 2, yP = -2, L1 = GF.S('line', { x1: b.sx(x), y1: b.sy(yP), x2: b.sx(x), y2: b.sy(yP), stroke: '#E08A1E', 'stroke-width': 5, 'stroke-dasharray': '7 5', 'stroke-linecap': 'round' }); ov.append(L1); if (an) { UI.instan = false; await GF.tumbuh(L1, b.sx(x), b.sy(yP), b.sx(x), b.sy(yG), 800, tk); } else { L1.setAttribute('y2', b.sy(yG)); } ov.append(GF.S('circle', { cx: b.sx(x), cy: b.sy(yG), r: 8, fill: '#12263F' }), GF.S('circle', { cx: b.sx(x), cy: b.sy(yP), r: 8, fill: '#12263F' }), GF.S('text', { x: b.sx(x) + 12, y: b.sy(yG) - 8, 'font-size': 17, 'font-weight': 700, fill: '#12263F', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, 'garis: 2'), GF.S('text', { x: b.sx(x) + 12, y: b.sy(yP) + 20, 'font-size': 17, 'font-weight': 700, fill: '#12263F', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, 'parabola: −2')); },
      async (an) => { ov.innerHTML = ''; if (an) await GF.tumbuhIsi(g.isi[0], 1400, tk); else g.isi[0].bangun(1); },
      async (an) => { g.isi[0].bangun(1); const r = kanan.querySelector('.fung-rumus'); await terbang(cap, slot('L'), '9', an); isi('L', '9'); ['a', 'b', 'L'].forEach((l) => slot(l).classList.remove('denyut')); r.classList.add('benar'); if (an) { await tk.anim(r, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 700 }); E.konfeti(innerWidth * .7, innerHeight * .45, 22); } }
    ];
    const kontrol = () => { k.nav.innerHTML = ''; dots.innerHTML = ''; for (let i = 0; i < 5; i++) dots.append(el('span', { kelas: 'dt' + (i === langkah ? ' now' : (i < langkah ? ' isi' : '')) }));
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: langkah === 0 || sibuk, onclick: () => jalankan(langkah - 1, false) } }), el('div', { kelas: 'baris', gaya: 'gap:.5rem' }, el('button', { kelas: 'btn sekunder', type: 'button', disabled: sibuk, html: ik('ulang', 'kecil') + 'Ulangi animasi', onclick: () => jalankan(langkah, true) }), el('button', { kelas: 'btn sekunder', type: 'button', disabled: sibuk, html: ik('main', 'kecil') + 'Putar semua', onclick: putarSemua }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: 'Lewati ke soal', onclick: () => { tk.stop(); sintesisSoal(); } })), langkah < 4 ? tombol('Berikutnya', 'panah', { p: { disabled: sibuk, onclick: () => jalankan(langkah + 1, true) } }) : tombol('Mulai mencoba', 'panah', { kelas: 'hijau denyut-h', p: { onclick: () => { tk.stop(); sintesisSoal(); } } })); };
    async function jalankan(n, an) {
      if (sibuk) return; tk.stop(); tk = UI.token(); sibuk = true; langkah = n; kontrol();
      try { reset(); cap.innerHTML = '<span class="fd-n">Langkah ' + (n + 1) + ' dari 5</span>' + TEKS[n]; UI.instan = true; for (let i = 0; i < n; i++) await S[i](false); UI.instan = false; await S[n](an); }
      catch (e) { if (!(e instanceof UI.Batal)) throw e; } finally { UI.instan = false; sibuk = false; kontrol(); }
    }
    async function putarSemua() { for (let n = 0; n < 5; n++) { if (!w.isConnected) return; await jalankan(n, true); if (!w.isConnected) return; await UI.tidur(1500); } }
    w.append(k.w); kontrol(); jalankan(0, true);
  }

  /* ============================================================ langkah 5: tantangan sintesis (tiga tugas acak) */
  function fungsi() { const t = T(); t.fung = t.fung || { hasil: [] }; t.fung.hasil = t.fung.hasil || []; if (t.fung.seed == null) { t.fung.seed = Math.floor(Math.random() * 1e6); E.simpan(); } if (t.fung.hasil.some(Boolean)) sintesisSoal(); else sintesisDemo(); }
  function sintesisSoal() {
    E.bawahKosong(); const t = T(), tugas = B.tugasSintesis(t.fung.seed); t.fung = t.fung || { hasil: [] }; t.fung.hasil = t.fung.hasil || []; let no = Math.min(2, t.fung.hasil.filter(Boolean).length);
    const w = el('div', { kelas: 't2-bingkai' }); E.layar(w); const nilai = tugas.map((tg) => tg.label.map(() => null)), salah = tugas.map(() => 0), buka = tugas.map(() => 0);
    const skor = () => t.fung.hasil.filter((h) => h && h.ok).length;
    function gambar() {
      w.innerHTML = ''; const tg = tugas[no], h = t.fung.hasil[no], sel = skor();
      const k = kerangka('Langkah ' + NO().fung + ' · tugas ' + (no + 1) + ' dari 3', 'Tantangan sintesis', { titik: tugas.map((_, i) => (i === no ? 'now' : (t.fung.hasil[i] ? 'isi' : ''))), ke: (i) => { no = i; gambar(); } });
      const kiri = el('div', { kelas: 'kartu cocok-sit gulir' });
      kiri.innerHTML = '<div class="eyebrow">Gambar daerah</div><h3>' + esc(tg.judul) + '</h3><div class="persamaan">' + tg.persamaan.map((p) => '<div class="mat">' + p + '</div>').join('') + '</div><div class="plot-besar"></div><p class="muted kecil" style="margin:.3rem 0 0">Titik potong sengaja tidak diberi label: carilah sendiri.</p>'; kiri.querySelector('.plot-besar').append(GF.lukis(tg.spec, { W: 520, H: 360, titik: false }).svg);
      const kanan = el('div', { kelas: 'kartu fung-aturan' }), formula = el('div', { kelas: 'fung-rumus mat' }); formula.innerHTML = tg.rumus.replace(/\[(\w)\]/g, (m0, l) => '<button type="button" class="slot-f" data-l="' + l + '"></button>');
      kanan.append(el('div', { kelas: 'fung-umum', html: '<span>Bentuk umum</span><div class="mat">' + tg.umum + '</div><small>Isi ' + tg.label.map((l) => '<b class="huruf-l">' + l + '</b>').join(', ') + ' pada rumus di bawah.</small>' }), el('div', { kelas: 'eyebrow' }, 'Susun dan hitung'), formula);
      formula.querySelectorAll('.slot-f').forEach((b) => { const i = tg.label.indexOf(b.dataset.l), selesai = !!h; b.textContent = selesai ? F(tg.jawab[i]) : (nilai[no][i] == null ? b.dataset.l : F(nilai[no][i])); if (!selesai && nilai[no][i] == null) b.classList.add('kosong'); b.disabled = selesai; if (selesai) b.classList.add('isi'); else if (nilai[no][i] != null) b.classList.add('terisi'); b.onclick = async () => { const v = await UI.keypadAngka({ judul: 'Nilai ' + b.dataset.l, tanya: 'Berapa nilai <b>' + b.dataset.l + '</b>?', ikon: ik('pensil', 'besar') }); if (v != null) { nilai[no][i] = v; gambar(); } }; });
      const ph = el('div', { kelas: 'fung-petunjuk' }); for (let i = 0; i < buka[no]; i++) ph.append(el('div', { kelas: 'umpan hint', html: ik('info') + '<span><b>Petunjuk ' + (i + 1) + ':</b> ' + esc(tg.petunjuk[i]) + '</span>' }));
      kanan.append(ph);
      if (h) kanan.append(el('div', { kelas: 'umpan ' + (h.ok ? 'ok' : 'hint'), html: ik(h.ok ? 'centang' : 'info') + '<span><b>' + (h.ok ? 'Tepat!' : 'Ini jawabannya.') + '</b> ' + tg.jelas + '</span>' }));
      else kanan.append(el('div', { kelas: 'baris', gaya: 'margin-top:auto;flex-wrap:wrap' }, el('button', { kelas: 'btn sekunder', type: 'button', disabled: buka[no] >= 2, html: ik('info', 'kecil') + (buka[no] ? 'Petunjuk berikutnya' : 'Minta petunjuk'), onclick: () => { buka[no]++; gambar(); } }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('main', 'kecil') + 'Lihat contoh', onclick: sintesisDemo }), el('button', { kelas: 'btn hijau', type: 'button', disabled: nilai[no].some((v) => v == null), html: ik('centang') + 'Periksa', onclick: periksa })));
      if (t.fung.hasil.filter(Boolean).length >= 3) kanan.append(el('button', { kelas: 'btn sekunder', type: 'button', gaya: 'align-self:flex-start', html: ik('ulang', 'kecil') + 'Latihan dengan soal baru', onclick: () => { t.fung.seed = Math.floor(Math.random() * 1e6); t.fung.hasil = []; E.simpan(); sintesisSoal(); } }));
      k.isi.append(el('div', { kelas: 'cocok-isi' }, kiri, kanan)); k.isi.classList.add('fung-isi');
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), el('span', { kelas: 'muted' }, sel + ' dari 3 tugas tepat'), no < 2 ? tombol('Berikutnya', 'panah', { p: { onclick: () => { no++; gambar(); } } }) : tombol('Selesai', 'centang', { kelas: 'hijau', kiri: true, p: { disabled: t.fung.hasil.filter(Boolean).length < 3, onclick: hub } }));
      w.append(k.w);
    }
    async function periksa() {
      const tg = tugas[no], ok = tg.jawab.every((v, i) => v === nilai[no][i]);
      if (ok) { t.fung.hasil[no] = { ok: true, petunjuk: buka[no] }; E.konfeti(innerWidth / 2, innerHeight / 3, 30); }
      else { salah[no]++; if (salah[no] >= 3) t.fung.hasil[no] = { ok: false }; }
      t.fung.skor = Math.max(t.fung.skor || 0, skor()); t.fung.selesai = t.fung.selesai || t.fung.hasil.filter(Boolean).length >= 3; sinkron({ fung: { skor: t.fung.skor } }); gambar();
      if (ok) await UI.info('Tepat!', '<div class="tengah"><p style="font-size:1.2rem">' + tg.jelas + '</p></div>', 'Lanjut', { ikon: ik('centang', 'besar') });
      else if (salah[no] >= 3) await UI.info('Ini jawabannya', '<div class="tengah"><p style="font-size:1.2rem">' + tg.jelas + '</p><p class="muted">Tidak apa-apa. Coba pahami langkahnya.</p></div>', 'Mengerti', { ikon: ik('info', 'besar') });
      else await UI.info('Belum tepat', '<div class="tengah"><p style="font-size:1.2rem">Coba periksa lagi nilai yang kamu tulis.</p><p class="muted">Tekan “Minta petunjuk” bila perlu.</p></div>', 'Coba lagi', { ikon: ik('info', 'besar') });
    }
    gambar();
  }

  root.Tahap2 = { mulai: (env) => {
    E = env; const P = E.P(); P.t2 = P.t2 || {}; const t = P.t2; t.kartu = t.kartu || {}; t.dis = t.dis || { rnd: [] }; t.cocok = t.cocok || { jawab: [] }; t.cocok.jawab = t.cocok.jawab || []; t.tiket = t.tiket || {}; t.aktif = t.aktif || [1]; t.pam = t.pam || { jawab: {} }; t.fung = t.fung || { hasil: [] };
    if (t.ref && !Array.isArray(t.ref.kuasai)) t.ref = { kuasai: [], bingung: [] };
    hub();
  } };
})(window);

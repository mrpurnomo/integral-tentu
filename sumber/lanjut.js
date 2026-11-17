/* Tahap lanjutan (jigsaw 7 materi): dasbor + peran dipilih sendiri; 1 Belajar Kelompok · 2 Sesi Berkeliling (Host/Penjelajah, pencocokan kode) ·
   3 Titik Potong · 4 Bentuk Integral · 5 Hitung Luas · 6 Tiket Keluar · Ringkasan Akhir. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, NAMA = B.NAMA_FAM, M = B.M;
  let E, G = null, tmrG = null, lagiHub = false, pilihP = null;
  const T = () => E.P().t2, HURUF = 'ABCDE', WARNA9 = ['bawah', 'potong', 'garis', 'parab', 'silang', 'sumbuy', 'kanan'];
  const kirimT2 = (d) => { if (E.net() === 'online') E.api('t2', { idx: E.idx(), t2: d, tahap: 'tahap2' }); };
  const inisial = (n) => { const k = String(n).split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); if (!k.length) return '?'; return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };
  const nm1 = (n) => String(n).split(/\s+/)[0];
  const sel = () => { const t = T(); return [t.k1.selesai, t.k2.selesai, t.k3.selesai, t.k4.selesai, t.k5.selesai, t.k6.selesai].map(Boolean); };
  function inisT2() {
    const P = E.P(), d = { sapa: false, k1: { selesai: false, latihan: 0, benar: 0, lihat: false }, k2: { selesai: false, skip: false }, k3: { jawab: [null, null, null], benar: 0, selesai: false }, k4: { jawab: Array(7).fill(null), benar: 0, selesai: false }, k5: { no: null, benar: 0, selesai: false }, k6: { jawab: [null, null, null], benar: 0, selesai: false }, tamat: false };
    P.t2 = Object.assign(d, P.t2 || {}); ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'].forEach((k) => { P.t2[k] = Object.assign({}, d[k], (P.t2 || {})[k]); });
  }
  const famNama = (f) => NAMA[f];
  const keKartu = (fn) => { tutupPoll(); fn(); };
  function tutupPoll() { clearInterval(tmrG); tmrG = null; lagiHub = false; }

  /* ============================================================ kelompok dan peran (dari server) */
  async function muatGrup() { const r = await E.api('grup', { idx: E.idx() }); if (r.ok && !r.tanpa) { G = r; const t = T(); t.g = r.g; t.fam = r.fam; } else if (!G) G = null; return r; }
  async function grupLokal() {
    const t = T(); if (t.g) { G = { g: t.g, fam: B.bagianKelompok(t.g - 1), anggota: [{ idx: E.idx(), nama: B.nama(E.idx()), peran: null }], kap: B.kapasitasPeran(B.cfg().maks), lokal: true, aktif: [1, 2, 3, 4, 5, 6] }; return; }
    const v = await UI.dialog({ judul: 'Nomor kelompokmu', ikon: ik('kelompok', 'besar'), isi: '<p class="tengah">Tablet belum terhubung ke guru. Pilih nomor kelompokmu (lihat layar guru).</p>', tombol: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ t: 'Kelompok ' + n, nilai: n, kelas: 'sekunder' })) });
    t.g = v || 1; E.simpan(); G = { g: t.g, fam: B.bagianKelompok(t.g - 1), anggota: [{ idx: E.idx(), nama: B.nama(E.idx()), peran: null }], kap: B.kapasitasPeran(B.cfg().maks), lokal: true, aktif: [1, 2, 3, 4, 5, 6] };
  }
  const aktifFam = () => G.fam;
  const peranSaya = () => { const a = G.anggota.find((x) => x.idx === E.idx()); return a ? a.peran : null; };
  async function sapa() {
    const me = E.idx(), mitra = G.anggota.filter((a) => a.idx !== me), av = (n, kamu) => '<div class="av-kol"><span class="av-besar fx-' + WARNA9[(n.length + (kamu ? 1 : 3)) % 7] + '">' + esc(inisial(n)) + '</span><b>' + esc(nm1(n)) + '</b>' + (kamu ? '<span class="muted kecil">kamu</span>' : '') + '</div>';
    const isi = '<div class="sapa"><div class="sapa-kel"><span class="sapa-no">' + G.g + '</span><div><div class="eyebrow">Kelompokmu</div><div class="sapa-j">Kelompok ' + G.g + '</div></div></div>'
      + '<div class="sapa-baris">' + av(B.nama(me), true) + mitra.map((a) => av(a.nama, false)).join('') + '</div>'
      + '<div class="sapa-materi fx-' + G.fam + '">' + UI.ubin(G.fam) + '<div><div class="eyebrow">Materi kelompokmu</div><b>' + esc(famNama(G.fam)) + '</b></div></div>'
      + '<p class="muted" style="margin:.2rem 0 0">Kelompokmu belajar materi ini lebih dulu, lalu mengajarkannya kepada kelompok lain. Pilih perananmu di dasbor.</p></div>';
    await UI.dialog({ judul: 'Selamat datang di mejamu', ikon: ik('kelompok', 'besar'), isi, kelas: 'petunjuk sapaan', lebar: true, tombol: [{ t: 'Lanjut', nilai: true, ikon: 'panah' }] });
    E.konfeti(innerWidth / 2, innerHeight / 3, 50);
  }

  /* ============================================================ dasbor */
  async function hub() {
    E.bawahKosong(); E.gambarAtas(); inisT2(); tutupPoll();
    if (E.net() === 'online') await muatGrup(); if (!G || G.tanpa) await grupLokal();
    if (!T().sapa) { await sapa(); T().sapa = true; E.simpan(); kirimT2({ sapa: true }); }
    lagiHub = true; let tanda = ''; render(); tanda = JSON.stringify([G.anggota, G.aktif]);
    if (E.net() === 'online') tmrG = setInterval(async () => { if (!lagiHub) return; if (!document.querySelector('.t2-hub')) return tutupPoll(); await muatGrup(); const t2 = JSON.stringify([G.anggota, G.aktif]); if (t2 !== tanda) { tanda = t2; render(); } }, 3000);
  }
  const terbuka = (no) => { if (E.idx() === B.DUMMY) return no !== 2 || peranSaya() != null; if (no === 2 && peranSaya() == null) return false; if (G.lokal || E.net() !== 'online') return no === 1 || sel()[no - 2]; return (G.aktif || [1]).indexOf(no) >= 0; };
  function render() {
    const t = T(), s = sel(), selesai = s.filter(Boolean).length, w = el('div', { kelas: 't2-hub' }), me = E.idx(), saved = peranSaya();
    const sisi = el('aside', { kelas: 'kartu t2-sisi' });
    sisi.append(el('div', { kelas: 'sisi-judul', html: '<span class="sapa-no kecil">' + G.g + '</span><div><div class="eyebrow">Kelompok ' + G.g + '</div><b>' + esc(famNama(G.fam)) + '</b></div>' }));
    sisi.append(el('div', { kelas: 'eyebrow' }, 'Anggota kelompok'));
    sisi.append(el('div', { kelas: 't2-tim', html: G.anggota.map((a, i) => '<div class="tim-baris' + (a.idx === me ? ' aku' : '') + '"><span class="av-besar kecil fx-' + WARNA9[(a.nama.length + i * 4) % 7] + '">' + esc(inisial(a.nama)) + '</span><span class="tim-nama">' + esc(nm1(a.nama)) + (a.idx === me ? ' <span class="muted kecil">(kamu)</span>' : '') + '</span>' + (a.peran == null ? '<span class="chip abu">belum memilih</span>' : '<span class="chip sorot">' + esc(B.PERAN[a.peran].nama) + '</span>') + '</div>').join('') }));
    /* peran: tombol, pilihannya di pop-up */
    const pr = el('div', { kelas: 'peran-kotak' }); pr.append(el('div', { kelas: 'eyebrow' }, 'Perananmu'), el('div', { kelas: 'peran-nama' + (saved == null ? ' kosong' : ''), html: saved == null ? 'Belum memilih peran' : '<b>' + esc(B.PERAN[saved].panjang) + '</b>' }), el('button', { kelas: 'btn t2-simpan ' + (saved == null ? 'denyut' : 'sekunder'), type: 'button', html: ik('kelompok', 'kecil') + (saved == null ? 'Pilih peran' : 'Ubah peran'), onclick: async () => { await popupPeran(); render(); } }));
    sisi.append(pr);
    const R = 34, C = 2 * Math.PI * R;
    sisi.append(el('div', { kelas: 't2-kemajuan', html: '<svg viewBox="0 0 80 80" class="cincin"><circle cx="40" cy="40" r="' + R + '" fill="none" stroke="#CCD7EA" stroke-width="8"/><circle cx="40" cy="40" r="' + R + '" fill="none" stroke="#0F1F44" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (C * selesai / 6).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 40 40)"/><text x="40" y="47" text-anchor="middle" font-size="22" font-weight="700" font-family="Bricolage,Georgia,serif" fill="#0F1F44">' + selesai + '/6</text></svg><div><b>Capaian</b><div class="muted kecil">' + selesai + ' dari 6 kartu selesai</div></div>' }));
    const semua = s.every(Boolean) || E.idx() === B.DUMMY;
    sisi.append(el('button', { kelas: 'btn t2-ringkas ' + (semua ? 'hijau denyut' : 'sekunder'), type: 'button', disabled: !semua, html: ik(semua ? 'bintang' : 'gembok', 'kecil') + 'Ringkasan akhir', onclick: () => keKartu(ringkasan) }));
    const kanan = el('section', { kelas: 't2-utama' });
    kanan.append(el('div', { kelas: 't2-judul' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Tahap lanjutan'), el('h2', { gaya: 'margin:0' }, 'Kartu kegiatan')), el('div', { kelas: 't2-sambung' }, el('div', { kelas: 'muted' }, E.idx() === B.DUMMY ? 'Akun uji coba: semua kartu terbuka' : 'Kartu dibuka guru sesuai waktunya.'), statusSambung())));
    const grid = el('div', { kelas: 't2-langkah n6' });
    kartuInfo(t).forEach(([no, j, ikon, d, meta, fn, warna]) => { const ok = s[no - 1], buka = terbuka(no), kls = ok ? 'selesai' : (buka ? 'siap' : 'terkunci'), kunciPeran = no === 2 && peranSaya() == null;
      const k = el('div', { kelas: 'kartu t2-kartu fx-' + warna + ' ' + kls }); k.append(el('div', { kelas: 'baris' }, el('span', { kelas: 'no-bulat', html: ok ? ik('centang', 'kecil') : (buka ? String(no) : ik('gembok', 'kecil')) }), el('h3', { gaya: 'margin:0' }, j), el('span', { kelas: 'chip ' + (ok ? 'ok' : (buka ? 'sorot' : 'abu')), gaya: 'margin-left:auto', html: ok ? 'selesai' : (buka ? 'terbuka' : ik('gembok', 'kecil') + 'terkunci') })), el('p', { kelas: 'muted', gaya: 'margin:.5rem 0 .3rem' }, d), el('div', { kelas: 't2-meta' }, meta));
      k.append(el('button', { kelas: 'btn t2-tbl' + (ok ? ' sekunder' : (buka ? ' denyut' : '')), type: 'button', disabled: !buka, html: !buka ? ik('gembok', 'kecil') + (kunciPeran ? 'Pilih peran dulu' : 'Menunggu aba-aba guru') : (ok ? 'Buka lagi' : 'Mulai') + ik('panah', 'kecil'), onclick: () => keKartu(fn) })); grid.append(k); });
    kanan.append(grid); w.append(sisi, kanan); E.layar(w);
  }
  function kartuInfo(t) {
    return [[1, 'Belajar Kelompok', 'buku', 'Kuasai materi kelompokmu: penjelasan beranimasi dan latihan soal.', t.k1.latihan + ' latihan', kartu1, 'bawah'],
      [2, 'Sesi Berkeliling', 'kelompok', 'Host mengajar tamu, Penjelajah belajar dari kelompok lain.', B.PERAN[peranSaya() == null ? 0 : peranSaya()].nama, kartu2, 'potong'],
      [3, 'Titik Potong', 'mata', 'Tiga soal: tentukan titik potong dua kurva dengan aljabar.', t.k3.selesai ? t.k3.benar + ' dari 3 benar' : '3 soal', () => soalKartu3(), 'garis'],
      [4, 'Bentuk Integral', 'pensil', 'Tujuh soal: pilih bentuk integral yang tepat dari grafik.', t.k4.selesai ? t.k4.benar + ' dari 7 benar' : '7 soal', () => soalKartu4(), 'parab'],
      [5, 'Hitung Luas', 'ujian', 'Tiga soal acak dari materi yang sudah dipelajari. Satu orang satu soal.', t.k5.selesai ? 'terkumpul' : '3 soal', kartu5, 'silang'],
      [6, 'Tiket Keluar', 'ujian', 'Tiga soal singkat bertingkat: mudah, sedang, sulit.', t.k6.selesai ? t.k6.benar + ' dari 3 benar' : '3 soal', () => soalKartu6(), 'sumbuy']];
  }
  function statusSambung() {
    if (E.idx() === B.DUMMY) return el('span', { kelas: 'chip sorot', html: 'Uji coba' });
    if (E.net() !== 'online') return el('span', { kelas: 'chip warn', html: ik('putus', 'kecil') + 'Mode mandiri' });
    return el('span', { kelas: 'chip ok', html: ik('wifi', 'kecil') + 'Terhubung' });
  }
  const kembaliHub = () => hub();
  /* pop-up pilih peran: pilihan teman muncul langsung (refresh otomatis dan tombol Refresh); peran yang sudah diambil tidak bisa dipilih */
  async function popupPeran() {
    const me = E.idx(); let pilih = peranSaya(), tutupFn = null; const isi = el('div', { kelas: 'peran-pop' });
    const gambar = () => {
      isi.innerHTML = ''; isi.append(el('p', { kelas: 'pt-sub' }, 'Satu peran hanya untuk satu anggota. Pilihan temanmu muncul langsung di sini.'));
      B.PERAN.forEach((r, p) => { const pemegang = G.anggota.filter((a) => a.peran === p && a.idx !== me), penuh = me !== B.DUMMY && pemegang.length >= G.kap[p];
        isi.append(el('button', { kelas: 'peran-opsi besar' + (pilih === p ? ' pilih' : '') + (penuh ? ' penuh' : ''), type: 'button', disabled: penuh, onclick: () => { pilih = p; gambar(); }, html: '<span class="peran-ik">' + ik(p === 0 ? 'kelompok' : 'mata', 'kecil') + '</span><span class="peran-isi"><b>' + esc(r.panjang) + '</b><small>' + (penuh ? 'Sudah dipilih ' + esc(nm1(pemegang[0].nama)) : (p === 0 ? 'Menetap di meja dan mengajar tamu dari kelompok lain' : 'Berkeliling dan belajar dari kelompok lain')) + '</small></span>' + (peranSaya() === p ? '<span class="ok-bulat">' + ik('centang', 'kecil') + '</span>' : '') })); });
      isi.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-top:.9rem;gap:.6rem' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang', 'kecil') + 'Refresh', onclick: async () => { await muatGrup(); gambar(); UI.toast('Daftar peran diperbarui', 'ulang'); } }), el('button', { kelas: 'btn hijau', type: 'button', disabled: pilih == null || pilih === peranSaya(), html: ik('centang', 'kecil') + 'Simpan peran', onclick: async () => { if (E.net() !== 'online') { UI.toast('Peran butuh sambungan ke guru', 'awas'); return; } const r = await E.api('peran', { idx: me, peran: pilih }); if (r.ok) { UI.toast('Peran tersimpan: ' + B.PERAN[pilih].panjang, 'centang'); await muatGrup(); if (tutupFn) tutupFn(true); } else { UI.toast(r._s === 409 ? 'Peran itu baru saja dipilih temanmu. Pilih yang lain.' : 'Gagal menyimpan. Coba lagi.', 'awas'); pilih = null; await muatGrup(); gambar(); } } })));
    };
    gambar(); const poll = setInterval(async () => { if (!isi.isConnected) return clearInterval(poll); await muatGrup(); gambar(); }, 2500);
    await UI.dialog({ judul: 'Pilih perananmu', ikon: ik('kelompok', 'besar'), kelas: 'petunjuk', isi, tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }], saatBuka: (b, tutup) => { tutupFn = tutup; } }); clearInterval(poll);
  }
  /* panel latihan satu soal (kartu 1 dan modul mengajar): selalu soal baru; benar dan salah dicatat; pembahasan beranimasi */
  function panelLatihan(fam, o) {
    o = o || {}; const t = T(), w = el('div', { kelas: 'lat' }); let q = null, kunciPil = false;
    const stat = () => { const n = t.k1.latihan, b = t.k1.benar; return '<span class="chip ok">' + ik('centang', 'kecil') + 'Benar ' + b + '</span><span class="chip bad">' + ik('silang', 'kecil') + 'Salah ' + (n - b) + '</span>'; };
    function muat() {
      q = B.latihan(fam, Math.floor(Math.random() * 1e6)); w.innerHTML = '';
      const g = el('div', { kelas: 'lat-graf' }); Adegan.statis(g, q.P, { tema: 'terang', label: true, W: 560, H: 430 });
      const info = el('div', { kelas: 'lat-info' }), aksi = el('div', { kelas: 'baris lat-aksi' });
      if (o.catat) info.innerHTML = stat(); else info.innerHTML = '<span class="muted">Soal untuk tamu</span>';
      const jawab = el('button', { kelas: 'btn', type: 'button', html: ik('pensil', 'kecil') + 'Jawab', onclick: async () => {
        const v = await UI.keypadAngka({ tanya: q.tanya, judul: 'Jawabanmu (satuan luas)', keyboard: true }); if (v == null) return; const ok = v === q.kunci;
        if (o.catat) { t.k1.latihan++; if (ok) t.k1.benar++; E.simpan(); kirimT2({ k1: t.k1 }); info.innerHTML = stat(); if (o.saatJawab) o.saatJawab(ok); }
        aksi.innerHTML = ''; const nb = el('div', { kelas: 'umpan ' + (ok ? 'ok' : 'bad'), html: ik(ok ? 'centang' : 'silang') + '<span>' + (ok ? '<b>Benar!</b> Luasnya ' + q.kunci + ' satuan luas.' : '<b>Belum tepat.</b> Jawabanmu ' + String(v).replace('-', '−') + '.') + '</span>' });
        aksi.append(nb); if (ok) { E.konfeti(innerWidth / 2, innerHeight / 3, 22); aksi.append(el('button', { kelas: 'btn', type: 'button', html: 'Soal berikutnya' + ik('panah', 'kecil'), onclick: muat })); } else aksi.append(el('button', { kelas: 'btn sorot', type: 'button', html: ik('main', 'kecil') + 'Bahas dengan animasi', onclick: () => Pel.bukaPembahasan(q.P, 'Pembahasan latihan') }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang', 'kecil') + 'Soal baru', onclick: muat }));
      } });
      aksi.append(jawab, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('mata', 'kecil') + 'Pembahasan', onclick: () => Pel.bukaPembahasan(q.P, 'Pembahasan latihan') }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang', 'kecil') + 'Soal baru', onclick: muat }));
      w.append(el('div', { kelas: 'lat-kiri' }, g), el('div', { kelas: 'lat-kanan' }, info, el('div', { kelas: 'teks-soal', html: q.tanya }), aksi));
    }
    muat(); return w;
  }



  /* ============================================================ kerangka layar kartu */
  function kerangka(no, judul, ket) {
    const w = el('div', { kelas: 't2-bingkai' }), kep = el('div', { kelas: 't2-kepala' }), isi = el('div', { kelas: 't2-isi' }), nav = el('div', { kelas: 't2-nav' });
    kep.append(el('div', null, el('div', { kelas: 'eyebrow' }, no ? 'Kartu ' + no + ' · ' + (ket || '') : (ket || '')), el('h2', { gaya: 'margin:0' }, judul)), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke dasbor', onclick: kembaliHub })); w.append(kep, isi, nav); E.layar(w); return { w, isi, nav };
  }
  const miniGraf = (fam, ukuran) => { const d = el('div', { kelas: 'mini-graf' }); Adegan.statis(d, Pel.contohP(fam), { tema: 'terang', label: true, W: ukuran || 560, H: 440 }); return d; };

  /* ============================================================ kartu 1: belajar kelompok */
  function kartu1() {
    const t = T(), fam = aktifFam(), K = kerangka(1, 'Belajar Kelompok', 'Materi kelompokmu'), D = Pel.LES[fam], dummy = E.idx() === B.DUMMY;
    const kiri = el('div', { kelas: 'kartu k1-materi fx-' + fam }), kanan = el('div', { kelas: 'kartu k1-latihan' });
    kiri.append(el('div', { kelas: 'k1-judul', html: UI.ubin(fam) + '<div><div class="eyebrow">Materi ' + G.g + '</div><h3>' + esc(famNama(fam)) + '</h3></div>' }), miniGraf(fam, 640), el('p', { kelas: 'k1-ciri', html: D.ciri }), el('div', { kelas: 'k1-rumus', html: M(D.rumus) }));
    kiri.append(el('button', { kelas: 'btn besar ' + (t.k1.lihat ? 'sekunder' : 'denyut'), type: 'button', html: ik('main') + (t.k1.lihat ? 'Putar penjelasan lagi' : 'Mulai belajar dengan animasi'), onclick: () => { Pel.bukaPelajaran(fam, { saatTutup: () => { t.k1.lihat = true; E.simpan(); kartu1(); } }); } }));
    const statEl = el('div', { kelas: 'k1-stat' });
    const stat = () => { statEl.innerHTML = '<div><b>' + t.k1.latihan + '</b><span>soal dikerjakan</span></div><div class="ok"><b>' + t.k1.benar + '</b><span>benar</span></div><div class="bad"><b>' + (t.k1.latihan - t.k1.benar) + '</b><span>salah</span></div>'; };
    kanan.append(el('div', { kelas: 'eyebrow' }, 'Latihan soal'), el('h3', { gaya: 'margin:.1rem 0 .3rem' }, 'Uji pemahamanmu'), el('p', { kelas: 'muted', gaya: 'margin:0 0 .7rem' }, 'Soal muncul di jendela tersendiri dan selalu baru. Salah? Lihat pembahasan beranimasi. Benar? Lanjut ke soal berikutnya.'), statEl,
      el('button', { kelas: 'btn besar sorot' + (t.k1.latihan ? '' : ' denyut'), type: 'button', html: ik('pensil') + 'Kerjakan soal', onclick: async () => { const isi = el('div', null, panelLatihan(fam, { catat: true, saatJawab: () => { stat(); renderNav(); } })); await UI.dialog({ judul: 'Latihan: ' + famNama(fam), ikon: ik('pensil', 'besar'), lebar: true, kelas: 'petunjuk latihan', isi, tombol: [{ t: 'Selesai latihan', nilai: true }] }); stat(); renderNav(); } }));
    K.isi.append(el('div', { kelas: 'k1-grid' }, kiri, kanan)); stat();
    function renderNav() {
      K.nav.innerHTML = ''; const siap = (t.k1.lihat && t.k1.latihan >= 2) || dummy;
      K.nav.append(el('div', { kelas: 'muted' }, siap ? 'Kamu sudah siap.' : 'Putar penjelasan dan kerjakan minimal 2 soal latihan.'), el('button', { kelas: 'btn hijau besar' + (siap ? ' denyut' : ' mati'), type: 'button', disabled: !siap, html: ik('centang') + 'Selesai belajar', onclick: () => { t.k1.selesai = true; E.simpan(); kirimT2({ k1: t.k1 }); UI.toast('Kartu 1 selesai', 'centang'); hub(); } }));
    }
    renderNav();
  }

  /* ============================================================ kartu 2: sesi berkeliling */
  function kartu2() {
    const t = T(), p = peranSaya(); if (p == null) { if (E.idx() === B.DUMMY) { popupPeran().then(() => (peranSaya() == null ? hub() : kartu2())); return; } UI.toast('Pilih peran dulu di dasbor', 'awas'); return hub(); }
    if (E.net() !== 'online' && E.idx() !== B.DUMMY) { UI.info('Perlu sambungan ke guru', '<p class="tengah">Sesi berkeliling mencocokkan kode antarperangkat, jadi tablet harus terhubung ke guru.</p>'); return hub(); }
    const host = p === 0, K = kerangka(2, 'Sesi Berkeliling', host ? 'Peran: Host (pengajar)' : 'Peran: ' + B.PERAN[p].nama), fam = aktifFam(); let S = null, tanda = '', mati = false;
    const isi = K.isi; isi.innerHTML = ''; const area = el('div', { kelas: host ? 'k2-host' : 'k2-jelajah' }); isi.append(area);
    async function muat() { const r = await E.api('k2-status', { idx: E.idx() }); if (r.ok) { S = r; const tt = JSON.stringify(r); if (tt !== tanda) { tanda = tt; gambar(); } } }
    const chipOk = (ok, y, n) => '<span class="chip ' + (ok ? 'ok' : 'abu') + '">' + (ok ? ik('centang', 'kecil') + y : n) + '</span>';
    function gambar() {
      area.innerHTML = '';
      if (host) {
        const kiri = el('div', { kelas: 'kartu k2-besar fx-' + fam }); kiri.append(el('div', { kelas: 'k1-judul', html: UI.ubin(fam) + '<div><div class="eyebrow">Materi kelompokmu</div><h3>' + esc(famNama(fam)) + '</h3></div>' }), miniGraf(fam, 600), el('button', { kelas: 'btn besar denyut', type: 'button', html: ik('kelompok') + 'Mengajar', onclick: () => modeMengajar(fam) }), el('p', { kelas: 'muted kecil' }, 'Tekan Mengajar untuk membuka penjelasan beranimasi dan latihan soal khusus mengajar.'));
        const kan = el('div', { kelas: 'k2-tamu' }); kan.append(el('div', { kelas: 'eyebrow' }, 'Tamu yang akan belajar darimu'));
        (S.tamu || []).forEach((x) => { const k = el('div', { kelas: 'kartu tamu fx-' + x.fam + (x.ok ? ' selesai' : '') }); k.append(el('div', { kelas: 'baris', html: '<span class="sapa-no kecil">' + x.g + '</span><div><b>Kelompok ' + x.g + '</b><div class="muted kecil">Penjelajah ' + x.sub + ' · ' + esc(famNama(x.fam)) + '</div></div>' }), el('button', { kelas: 'btn ' + (x.ok ? 'hijau' : 'sekunder'), type: 'button', html: x.ok ? ik('centang', 'kecil') + 'Sudah mengajar' + (x.siapa ? ' · ' + esc(nm1(x.siapa)) : '') : 'Sudah mengajar', onclick: () => (x.ok ? batalkan(x) : kodeHost(x)) })); kan.append(k); });
        area.append(kiri, kan);
      } else {
        const kan = el('div', { kelas: 'k2-tamu lebar' }); kan.append(el('div', { kelas: 'eyebrow' }, 'Kelompok yang wajib kamu kunjungi · bebas urutannya'));
        (S.tujuan || []).forEach((x) => { const k = el('div', { kelas: 'kartu tamu jelajah fx-' + x.fam + (x.ok ? ' selesai' : '') }); const aktifP = x.ok || E.idx() === B.DUMMY;
          k.append(el('div', { kelas: 'baris', html: '<span class="sapa-no kecil">' + x.h + '</span><div><b>Kelompok ' + x.h + '</b><div class="muted kecil">' + esc(famNama(x.fam)) + '</div></div>' + chipOk(x.ok, 'sudah belajar', 'belum') }),
            el('div', { kelas: 'baris aksi-j' }, el('button', { kelas: 'btn ' + (x.ok ? 'hijau' : ''), type: 'button', disabled: x.ok, html: x.ok ? ik('centang', 'kecil') + 'Sudah belajar' : 'Sudah belajar', onclick: () => cocokKode(x) }), ['paham', 'lumayan', 'tidak'].map((v) => el('button', { kelas: 'btn kecil ' + (x.paham === v ? 'sorot' : 'sekunder'), type: 'button', disabled: !aktifP, onclick: async () => { const r = await E.api('k2-paham', { idx: E.idx(), h: x.h, nilai: v }); if (r.ok) muat(); }, }, v === 'paham' ? 'Paham' : (v === 'lumayan' ? 'Lumayan' : 'Tidak paham'))), el('button', { kelas: 'btn kecil ' + (x.paham ? 'sekunder' : 'sekunder'), type: 'button', disabled: !(aktifP && (x.paham || E.idx() === B.DUMMY)), html: ik('buku', 'kecil') + 'Lihat materi', onclick: () => Pel.bukaPelajaran(x.fam, { labelAkhir: 'Selesai' }) }))); kan.append(k); });
        area.append(kan);
      }
      K.nav.innerHTML = ''; if (E.idx() === B.DUMMY) K.nav.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kelompok', 'kecil') + 'Ganti peran (uji coba)', onclick: async () => { await popupPeran(); kartu2(); } })); const daftar = host ? S.tamu : S.tujuan, lengkap = daftar.every((x) => x.ok) && (host || daftar.every((x) => x.paham));
      if (S.selesai) K.nav.append(el('div', { kelas: 'chip ok', html: ik('centang', 'kecil') + 'Kartu 2 selesai' + (S.skip ? ' (ada yang dilewati)' : '') }), el('button', { kelas: 'btn', type: 'button', html: 'Ke dasbor' + ik('panah', 'kecil'), onclick: hub }));
      else K.nav.append(el('div', { kelas: 'muted' }, lengkap ? 'Semua selesai.' : (host ? daftar.filter((x) => x.ok).length + ' dari ' + daftar.length + ' kelompok sudah kamu ajar' : daftar.filter((x) => x.ok).length + ' dari ' + daftar.length + ' kelompok sudah kamu pelajari')), el('button', { kelas: 'btn besar ' + (lengkap ? 'hijau denyut' : 'amber'), type: 'button', html: (lengkap ? ik('centang') + 'Selesai' : ik('awas') + 'Selesai (lewati)'), onclick: () => selesai(lengkap) }));
    }
    async function selesai(lengkap) {
      if (!lengkap) { const ya = await UI.petunjuk({ judul: 'Selesai tanpa melengkapi?', ikon: ik('awas', 'besar'), sub: 'Masih ada kelompok yang belum dicocokkan kodenya.', butir: [{ ik: 'awas', warna: 'amber', t: 'Kamu akan <b>melewati</b> bagian yang belum selesai.' }, { ik: 'info', t: 'Sistem <b>mencatat</b> bagian yang dilewati dan mencocokkannya dengan akun teman-temanmu. Guru dapat melihatnya.' }], tombol: [{ t: 'Kembali melengkapi', nilai: false, kelas: 'sekunder' }, { t: 'Ya, lewati dan selesai', nilai: true, kelas: 'bahaya' }] }); if (!ya) return; }
      const r = await E.api('k2-selesai', { idx: E.idx(), skip: !lengkap }); if (!r.ok) return UI.toast('Belum bisa menyelesaikan. Periksa koneksi.', 'awas');
      t.k2.selesai = true; t.k2.skip = !!r.skip; E.simpan(); E.konfeti(innerWidth / 2, innerHeight / 3, 30); muat();
    }
    async function batalkan(x) { const ya = await UI.konfirmasi('Hapus tanda?', '<p class="tengah">Tanda “sudah mengajar” untuk Kelompok ' + x.g + ' dihapus. Kodenya harus dicocokkan lagi.</p>', 'Hapus tanda', 'Batal'); if (!ya) return; await E.api('k2-tarik', { idx: E.idx(), g: x.g }); muat(); }
    /* Host: tampilkan kode besar; tamu memilih kode yang sama pada tabletnya */
    async function kodeHost(x) {
      const r = await E.api('k2-kode', { idx: E.idx(), g: x.g }); if (!r.ok || r.sudah) { muat(); return; } let kode = r.kode, selesaiOk = false;
      const kotak = el('div', { kelas: 'kode-kotak' }), info = el('p', { kelas: 'muted tengah' }, 'Menunggu tamu dari Kelompok ' + x.g + ' memilih kode ini…');
      const gambarKode = () => { kotak.innerHTML = '<div class="kode-besar kode3">' + kode.split('').map((c) => '<span>' + c + '</span>').join('') + '</div>'; };
      gambarKode(); const poll = setInterval(async () => { const s2 = await E.api('k2-status', { idx: E.idx() }); if (!s2.ok) return; const y = (s2.tamu || []).find((q) => q.g === x.g); if (y && y.ok) { selesaiOk = true; clearInterval(poll); info.textContent = 'Cocok! Tercatat bahwa kamu sudah mengajar Kelompok ' + x.g + '.'; kotak.classList.add('cocok'); setTimeout(() => { const b = document.querySelector('.tirai .btn'); if (b) b.click(); }, 1200); } else if (y && y.kode && y.kode !== kode) { kode = y.kode; gambarKode(); info.textContent = 'Kode diganti karena tamu salah memilih. Tunjukkan kode yang baru.'; } }, 1800);
      await UI.dialog({ judul: 'Cocokkan kode dengan tamu', ikon: ik('kunci', 'besar'), kelas: 'petunjuk', isi: el('div', null, el('p', { kelas: 'pt-sub' }, 'Tunjukkan layar ini kepada Penjelajah dari Kelompok ' + x.g + '. Mereka memilih kode yang <b>sama</b> di tablet mereka.'), kotak, info), tombol: (E.idx() === B.DUMMY ? [{ t: 'Anggap tamu cocok (uji coba)', nilai: 'paksa', kelas: 'sekunder' }] : []).concat([{ t: 'Tutup', nilai: true, kelas: 'sekunder' }]) }).then(async (v) => { if (v === 'paksa') await E.api('k2-kode', { idx: E.idx(), g: x.g, paksa: true }); }); clearInterval(poll); muat();
    }
    /* Penjelajah: pilih kode yang sama dengan layar Host */
    async function cocokKode(x) {
      const r = await E.api('k2-pilihan', { idx: E.idx(), h: x.h }); if (!r.ok) return UI.toast('Gagal. Periksa koneksi.', 'awas');
      if (!r.ada) { await UI.petunjuk({ judul: 'Minta Host menyiapkan kode', ikon: ik('jam', 'besar'), butir: [{ ik: 'kelompok', t: 'Datangi <b>Host Kelompok ' + x.h + '</b>.' }, { ik: 'kunci', t: 'Host menekan <b>Sudah mengajar</b> pada kartu Kelompok ' + t.g + ' di tabletnya, lalu kode muncul.' }, { ik: 'ulang', t: 'Setelah itu tekan <b>Sudah belajar</b> lagi di sini.' }], tombol: [{ t: 'Mengerti', nilai: true }] }); return; }
      let ulang = true, pil = r.pilihan; if (E.idx() === B.DUMMY) UI.toast('Uji coba: kode apa pun diterima', 'info'); while (ulang) { ulang = false; const v = await UI.dialog({ judul: 'Pilih kode yang sama', ikon: ik('kunci', 'besar'), kelas: 'petunjuk', isi: '<p class="pt-sub">Lihat layar Host Kelompok ' + x.h + ', lalu ketuk kode yang <b>sama persis</b>.</p><div class="kode-pilih">' + pil.map((c, i) => '<button class="kode-btn" data-c="' + c + '">' + c.split('').map((q) => '<span>' + q + '</span>').join('') + '</button>').join('') + '</div>', saatBuka: (b, tutup) => { b.querySelectorAll('.kode-btn').forEach((bt) => bt.addEventListener('click', () => tutup(bt.dataset.c))); }, tombol: [{ t: 'Batal', nilai: null, kelas: 'sekunder' }] }); if (!v) break;
        const h = await E.api('k2-cocok', { idx: E.idx(), h: x.h, pilih: v }); if (h.ok && h.benar) { E.konfeti(innerWidth / 2, innerHeight / 3, 40); UI.toast('Cocok! Tercatat sudah belajar dari Kelompok ' + x.h, 'centang'); break; }
        await UI.info('Kode tidak sama', '<p class="tengah">Periksa lagi layar Host.' + (h.baru ? ' Host akan menampilkan kode baru.' : '') + '</p>', 'Coba lagi'); const n = await E.api('k2-pilihan', { idx: E.idx(), h: x.h }); if (n.ok && n.ada) { pil = n.pilihan; ulang = true; } }
      muat();
    }
    muat(); tmrG = setInterval(() => { if (!document.querySelector('.k2-host, .k2-jelajah')) return tutupPoll(); if (!document.querySelector('.tirai')) muat(); }, 3000);
  }
  /* modul mengajar Host: slide animasi + latihan soal khusus mengajar */
  function modeMengajar(fam) {
    const w = el('div', { kelas: 'ad-layar mengajar' }), isi = el('div', { kelas: 'mj-isi' });
    isi.innerHTML = '<div class="eyebrow" style="color:#FFC94A">Mode mengajar</div><h2>' + esc(famNama(fam)) + '</h2><p>Tunjukkan tabletmu kepada tamu. Gunakan panah kiri dan kanan untuk memutar animasi langkah demi langkah.</p>';
    const b1 = el('button', { kelas: 'btn besar sorot', type: 'button', html: ik('main') + 'Penjelasan animasi', onclick: () => Pel.bukaPelajaran(fam, { labelAkhir: 'Selesai' }) });
    const b2 = el('button', { kelas: 'btn besar', type: 'button', html: ik('pensil') + 'Latihan soal untuk tamu', onclick: () => latihanMengajar(fam) }), b3 = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali', onclick: () => w.remove() });
    isi.append(el('div', { kelas: 'baris', gaya: 'gap:1rem;justify-content:center;margin-top:1.4rem' }, b1, b2), el('div', { gaya: 'margin-top:1rem' }, b3)); w.append(isi); document.body.append(w);
  }
  async function latihanMengajar(fam) {
    const tirai = el('div', { kelas: 'ad-layar mengajar' }), isi = el('div', { kelas: 'mj-soal' });
    isi.append(el('div', { kelas: 'mj-panel' }, el('div', { kelas: 'eyebrow', gaya: 'color:#FFC94A' }, 'Latihan untuk tamu · ' + esc(famNama(fam))), panelLatihan(fam, { catat: false }), el('div', { gaya: 'margin-top:.8rem' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali', 'kecil') + 'Kembali', onclick: () => tirai.remove() }))));
    tirai.append(isi); document.body.append(tirai);
  }

  /* ============================================================ pemeriksa soal umum (kartu 3, 4, 6; dipakai juga kartu 5) */
  function layarSoal(c) {
    const soal = c.soal, n = soal.length, st = c.simpan; let aktif = 0, final = !!st.selesai, cor = null;
    const w = el('div', { kelas: 'tes-wrap so-wrap' }); E.layar(w);
    const kiri = el('div', { kelas: 'soal-kartu kartu' }), kanan = el('div', { kelas: 'tes-samping' }); w.append(kiri, kanan);
    const grid = el('div', { kelas: 'nomor-grid' }), info = el('div', { kelas: 'kecil tengah muted' }), kirim = el('button', { kelas: 'btn hijau besar', type: 'button', html: ik('kirim') + 'Kumpulkan', onclick: () => kumpulkan() });
    kanan.append(el('div', { kelas: 'eyebrow' }, c.eyebrow), el('h3', { gaya: 'margin:.1rem 0 .4rem' }, c.judul), el('div', { kelas: 'eyebrow', gaya: 'margin-top:.3rem' }, 'Nomor soal'), grid, info, kirim, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke dasbor', onclick: kembaliHub }));
    const dijawab = (i) => st.jawab[i] != null;
    function gambar() {
      if (cor) { cor.lepas(); cor = null; } const q = soal[aktif]; kiri.innerHTML = '';
      const bar = el('div', { kelas: 'cor-slot' });
      kiri.append(el('div', { kelas: 'baris so-kepala' }, el('div', { kelas: 'eyebrow' }, 'Soal ' + (aktif + 1) + ' dari ' + n + (q.tingkat ? ' · ' + q.tingkat : '')), bar));
      const badan = el('div', { kelas: 'so-isi' + (q.P ? ' dgrafik' : '') });
      if (q.P) { const g = el('div', { kelas: 'so-grafik' }); const gopt = c.grafik ? c.grafik(q) : { label: true }; Adegan.statis(g, q.P, Object.assign({ tema: 'terang', W: 600, H: 480 }, gopt)); badan.append(g); }
      const teks = el('div', { kelas: 'so-teks' }); teks.append(el('div', { kelas: 'teks-soal', html: q.tanya }));
      if (c.jenis === 'angka') {
        const j = st.jawab[aktif]; teks.append(el('div', { kelas: 'angka-isi' + (final ? (j === q.kunci ? ' benar' : ' salah') : '') }, el('div', { kelas: 'angka-nilai' }, j == null ? '…' : String(j).replace('-', '−')), el('button', { kelas: 'btn' + (final ? ' sekunder' : ''), type: 'button', disabled: final, html: ik('pensil', 'kecil') + (j == null ? 'Isi jawaban' : 'Ubah jawaban'), onclick: async () => { const v = await UI.keypadAngka({ tanya: q.tanya, judul: 'Jawabanmu (satuan luas)', keyboard: true }); if (v == null) return; st.jawab[aktif] = v; E.simpan(); gambar(); } })));
        if (final) teks.append(el('div', { kelas: 'umpan ' + (st.jawab[aktif] === q.kunci ? 'ok' : 'bad'), html: ik(st.jawab[aktif] === q.kunci ? 'centang' : 'silang') + '<span>Jawaban yang benar: <b>' + q.kunci + '</b></span>' }));
      } else {
        const ops = el('div', { kelas: 'opsi-wrap' }); q.opsi.forEach((o, k) => { let kls = 'opsi' + (st.jawab[aktif] === k ? ' pilih' : ''); if (final) kls = 'opsi' + (k === q.kunci ? ' benar' : (k === st.jawab[aktif] ? ' salah' : '')); ops.append(el('button', { kelas: kls, type: 'button', disabled: final, html: '<span class="huruf">' + HURUF[k] + '</span><span>' + o + '</span>' + (final && k === q.kunci ? '<span class="chip ok" style="margin-left:auto">benar</span>' : (final && k === st.jawab[aktif] ? '<span class="chip bad" style="margin-left:auto">jawabanmu</span>' : '')), onclick: () => { st.jawab[aktif] = k; E.simpan(); gambar(); } })); }); teks.append(ops);
      }
      if (final) { teks.append(el('div', { kelas: 'umpan ok pembahasan', html: ik('info') + '<span>' + (q.jelas || '') + '</span>' })); if (q.P) teks.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('main', 'kecil') + 'Pembahasan animasi', onclick: () => Pel.bukaPembahasan(q.P, 'Pembahasan soal ' + (aktif + 1)) })); }
      badan.append(teks); kiri.append(badan, el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-top:auto' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Sebelumnya', disabled: aktif === 0, onclick: () => { aktif--; gambar(); } }), el('button', { kelas: 'btn sekunder', type: 'button', html: 'Berikutnya' + ik('panah'), disabled: aktif === n - 1, onclick: () => { aktif++; gambar(); } })));
      if (c.coretan !== false) cor = Coretan.pasang(kiri, c.kunci + '_' + aktif, { bar });
      grid.innerHTML = ''; soal.forEach((q2, i) => grid.append(el('button', { kelas: 'no' + (i === aktif ? ' aktif' : '') + (dijawab(i) ? ' isi' : '') + (final ? (st.jawab[i] === q2.kunci ? ' benar' : ' salah') : ''), type: 'button', onclick: () => { aktif = i; gambar(); } }, i + 1)));
      const sisa = soal.filter((_, i) => !dijawab(i)).length; info.textContent = final ? st.benar + ' dari ' + n + ' benar' : (sisa ? sisa + ' soal belum dijawab' : 'Semua soal sudah dijawab'); const kunciK = sisa > 0 && E.idx() !== B.DUMMY; kirim.disabled = final || kunciK; kirim.className = 'btn hijau besar' + (final ? ' hidden' : (kunciK ? ' mati' : ' denyut')); kirim.style.display = final ? 'none' : '';
    }
    async function kumpulkan() {
      const ya = await UI.konfirmasi('Kumpulkan jawaban?', '<p class="tengah">Setelah dikumpulkan, jawaban tidak bisa diubah.</p>', 'Ya, kumpulkan', 'Periksa lagi'); if (!ya) return;
      let benar = soal.filter((q, i) => st.jawab[i] === q.kunci).length; st.jawab = st.jawab.map((v) => (v == null ? null : v)); if (c.submit) { const r = await c.submit(st.jawab[0]); if (!r) return; benar = r.benar ? 1 : 0; }
      st.benar = benar; st.selesai = true; final = true; E.simpan(); kirimT2({ [c.kunci]: { benar, selesai: true, jawab: st.jawab } }); if (c.sesudah) c.sesudah(benar); gambar();
      await UI.dialog({ judul: benar === n ? 'Sempurna!' : 'Jawaban tercatat', ikon: ik(benar === n ? 'bintang' : 'centang', 'besar'), isi: '<div class="tengah"><p style="font-size:1.4rem"><b>' + benar + ' dari ' + n + '</b> benar.</p><p class="muted">Ketuk nomor soal untuk melihat pembahasan, termasuk animasinya.</p></div>', tombol: [{ t: 'Lihat pembahasan', nilai: true }] }); if (benar === n) E.konfeti(innerWidth / 2, innerHeight / 3, 60);
    }
    UI.petunjuk && c.petunjuk && !c.petunjuk.tampil && (async () => { c.petunjuk.tampil = true; await UI.petunjuk(c.petunjuk); })();
    gambar(); return { gambar };
  }
  const pet = (judul, ikonN, butir) => ({ judul, ikon: ik(ikonN, 'besar'), butir, tombol: [{ t: 'Mulai mengerjakan', nilai: true, ikon: 'main' }] });
  function soalKartu3() { const t = T(), s = B.titikPotongSet(B.seedKelompok(B.kelasAktif(), G.g, 3)); layarSoal({ eyebrow: 'Kartu 3 · Titik Potong', judul: 'Titik potong dua kurva', kunci: 'k3', soal: s.map((q) => Object.assign(q, { P: q.P })), jenis: 'pilihan', simpan: t.k3, grafik: () => ({ angka: false, arsir: false, titik: false, label: true }), petunjuk: pet('Titik Potong', 'mata', [{ ik: 'mata', t: 'Grafik sengaja <b>tanpa angka</b> pada sumbu, jadi titik potong harus dihitung dengan aljabar.' }, { ik: 'pensil', t: 'Samakan kedua fungsi, selesaikan persamaannya, lalu substitusikan ke <b>salah satu</b> fungsi untuk mendapat $y$.' }, { ik: 'kelompok', t: 'Soal sama untuk satu kelompok. Boleh berdiskusi, tetapi jawab di tabletmu sendiri.' }, { ik: 'pensil', t: 'Pakai <b>coretan</b> di pojok kartu untuk berhitung.' }]) }); }
  function soalKartu4() { const t = T(), s = B.bentukSet(B.seedKelompok(B.kelasAktif(), G.g, 4)); layarSoal({ eyebrow: 'Kartu 4 · Bentuk Integral', judul: 'Pilih bentuk integral', kunci: 'k4', soal: s, jenis: 'pilihan', simpan: t.k4, grafik: () => ({ angka: true, arsir: true, titik: true, label: true }), petunjuk: pet('Bentuk Integral', 'pensil', [{ ik: 'mata', t: 'Setiap soal menampilkan grafik lengkap dengan arsiran. Pilih penulisan integral tentu yang tepat.' }, { ik: 'info', t: 'Ada <b>7 soal</b>, satu untuk tiap materi. Perhatikan batas, kurva atas dan bawah (atau kanan dan kiri), serta $dx$ atau $dy$.' }, { ik: 'kelompok', t: 'Soal sama untuk satu kelompok.' }]) }); }
  function soalKartu6() { const t = T(), s = B.tiketSet(B.seedKelompok(B.kelasAktif(), G.g, 6)); layarSoal({ eyebrow: 'Kartu 6 · Tiket Keluar', judul: 'Tiga soal bertingkat', kunci: 'k6', soal: s, jenis: 'angka', simpan: t.k6, grafik: () => ({ angka: true, arsir: true, titik: true, label: true }), petunjuk: pet('Tiket Keluar', 'ujian', [{ ik: 'info', t: 'Tiga soal singkat: <b>mudah</b>, <b>sedang</b>, <b>sulit</b>. Jawabannya bilangan bulat (satuan luas).' }, { ik: 'pensil', t: 'Gunakan coretan untuk berhitung.' }]) }); }

  /* ============================================================ kartu 5: pilih kartu soal secara langsung */
  async function kartu5() {
    const t = T(); if (E.net() !== 'online' && E.idx() !== B.DUMMY) { UI.info('Perlu sambungan ke guru', '<p class="tengah">Kartu ini dikerjakan serempak satu kelompok, jadi tablet harus terhubung.</p>'); return hub(); }
    const K = kerangka(5, 'Hitung Luas', 'Satu orang satu soal'); let S = await E.api('k5-status', { idx: E.idx() }); if (!S.ok) { UI.toast('Gagal memuat. Periksa koneksi.', 'awas'); return hub(); }
    let soal = B.luasSet(S.seed, S.fams), tanda = '', mati = false;
    const petunjuk = () => UI.petunjuk(pet('Hitung Luas', 'ujian', [{ ik: 'kelompok', t: 'Ada <b>3 kartu soal</b>. Tiap anggota memilih <b>satu</b> kartu, dan kartu yang sudah dipilih temanmu tidak bisa dipilih lagi.' }, { ik: 'pensil', t: 'Buat integralnya sendiri, hitung, lalu isi jawaban bilangan bulat. Tidak ada petunjuk.' }, { ik: 'bintang', t: 'Hasil akhir kelompok adalah gabungan ketiga soal.' }]));
    if (!S.saya) await petunjuk();
    const area = K.isi; K.nav.innerHTML = '';
    function layarPilih() {
      area.innerHTML = ''; const baris = el('div', { kelas: 'k5-kartu' });
      soal.forEach((q, i) => { const no = i + 1, kl = S.klaim[no] || [], j = S.jawab[no], milikku = S.saya === no, semua = [1, 2, 3].every((x) => (S.klaim[x] || []).length), diambil = kl.length && !milikku && !semua;
        const k = el('div', { kelas: 'kartu k5-soal fx-' + WARNA9[i * 2] + (diambil ? ' diambil' : '') + (milikku ? ' milikku' : '') }); const g = el('div', { kelas: 'mini-graf' }); Adegan.statis(g, q.P, { tema: 'terang', label: false, titik: false, angka: false, W: 420, H: 320 });
        k.append(el('div', { kelas: 'eyebrow' }, 'Kartu soal ' + no), g, el('div', { kelas: 'k5-pemilik', html: j ? '<span class="chip ' + (j.benar ? 'ok' : 'bad') + '">' + ik(j.benar ? 'centang' : 'silang', 'kecil') + esc(nm1(j.nama)) + (j.benar ? ' benar' : ' kurang tepat') + '</span>' : (kl.length ? '<span class="chip sorot">' + ik('siswa', 'kecil') + esc(kl.map((x) => nm1(x.nama)).join(', ')) + (milikku ? ' (kamu)' : '') + '</span>' : '<span class="chip abu">belum dipilih</span>') }),
          el('button', { kelas: 'btn' + (milikku ? ' hijau' : '') , type: 'button', disabled: !!(S.saya && !milikku) || !!diambil, html: milikku ? (j ? 'Lihat soalku' : 'Kerjakan soalku') + ik('panah', 'kecil') : (diambil ? 'Sudah dipilih' : 'Pilih kartu ini'), onclick: async () => { if (!milikku) { const r = await E.api('k5-pilih', { idx: E.idx(), no }); if (!r.ok) { UI.toast(r.error === 'diambil' ? 'Kartu itu baru saja dipilih temanmu.' : 'Gagal memilih.', 'awas'); return segar(); } S.saya = no; } mati = true; kerjakan(no); } })); baris.append(k); });
      area.append(baris); const sudah = Object.values(S.jawab), benar = sudah.filter((x) => x.benar).length; K.nav.innerHTML = ''; K.nav.append(el('div', { kelas: 'hasil-grup', html: '<b>Hasil kelompok:</b> ' + sudah.length + ' dari 3 soal terkumpul · <b>' + benar + '</b> benar' }), ...(S.saya && S.jawab[S.saya] ? [el('button', { kelas: 'btn hijau besar' + (sudah.length >= 3 ? ' denyut' : ''), type: 'button', html: ik('centang') + (sudah.length >= 3 ? 'Selesai' : 'Selesai (menunggu teman)'), onclick: () => { t.k5.benar = benar; t.k5.selesai = true; E.simpan(); kirimT2({ k5: { benar, selesai: true } }); hub(); } })] : []));
    }
    async function segar() { if (mati) return; const r = await E.api('k5-status', { idx: E.idx() }); if (r.ok) { const tt = JSON.stringify([r.klaim, r.jawab, r.saya]); if (tt !== tanda) { tanda = tt; S = r; if (JSON.stringify(r.fams) === JSON.stringify(S.fams)) soal = B.luasSet(r.seed, r.fams); layarPilih(); } } }
    function kerjakan(no) {
      tutupPoll(); const q = soal[no - 1], st = { jawab: [null], selesai: !!S.jawab[no], benar: S.jawab[no] && S.jawab[no].benar ? 1 : 0 }; if (S.jawab[no]) st.jawab[0] = S.jawab[no].benar ? q.kunci : null;
      layarSoal({ eyebrow: 'Kartu 5 · Hitung Luas', judul: 'Soal ' + no, kunci: 'k5x', soal: [Object.assign({}, q, { tingkat: 'kartu ' + no })], jenis: 'angka', simpan: st, grafik: () => ({ angka: true, arsir: true, titik: true, label: true }), submit: async (v) => { const r = await E.api('k5-jawab', { idx: E.idx(), nilai: v }); if (!r.ok) { UI.toast('Gagal mengirim. Coba lagi.', 'awas'); return null; } S.jawab[no] = { idx: E.idx(), nama: B.nama(E.idx()), benar: r.benar }; return { benar: r.benar }; }, sesudah: () => { setTimeout(() => { mati = false; kartu5(); }, 4000); } });
    }
    layarPilih(); tanda = JSON.stringify([S.klaim, S.jawab, S.saya]); tmrG = setInterval(() => { if (!document.querySelector('.k5-kartu')) return tutupPoll(); segar(); }, 2500);
  }

  /* ============================================================ ringkasan akhir */
  function ringkasan() {
    const t = T(), tes = E.P().tes ? B.nilai(E.idx(), E.P().tes.jawab).benar : null, R = B.rapor(Object.assign({}, t, {}), tes), K = kerangka('', 'Ringkasan akhir', 'Capaian dan nilai kinerja'); t.tamat = true; E.simpan(); kirimT2({ tamat: true });
    const w = el('div', { kelas: 'rapor' }), kel = 2 * Math.PI * 70, cinc = (v, jud, sub) => '<div class="rp-cincin"><svg viewBox="0 0 168 168"><circle cx="84" cy="84" r="70" fill="none" stroke="#E1E6F0" stroke-width="16"/><circle cx="84" cy="84" r="70" fill="none" stroke="#0F1F44" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + (kel * v / 100).toFixed(1) + ' ' + kel.toFixed(1) + '" transform="rotate(-90 84 84)"/></svg><div class="pusat"><b>' + v + '</b><span>' + sub + '</span></div><div class="rp-jud">' + jud + '</div></div>';
    w.innerHTML = '<div class="rp-kepala fx-bawah"><div><div class="eyebrow">Selamat, ' + esc(nm1(B.nama(E.idx()))) + '!</div><h2>Kamu menyelesaikan seluruh kartu</h2><p class="muted">Kelompok ' + G.g + ' · ' + esc(famNama(G.fam)) + ' · ' + esc(B.PERAN[peranSaya() == null ? 0 : peranSaya()].panjang) + '</p></div><span class="rp-pred">' + esc(R.predikat) + '</span></div>'
      + '<div class="rp-grid"><div class="kartu rp-kiri">' + cinc(R.capaian, 'Capaian kegiatan', '%') + cinc(R.nilai, 'Nilai kinerja', 'dari 100') + '</div><div class="kartu rp-tengah"><div class="eyebrow">Rincian nilai</div>' + R.komponen.map(([n, b, tt]) => '<div class="rp-baris"><span>' + n + '</span><div class="rp-bar"><i style="width:' + Math.round(100 * b / tt) + '%"></i></div><b>' + b + '/' + tt + '</b></div>').join('') + (R.awal != null ? '<div class="rp-awal">Tes awal: <b>' + R.awal + '</b> → Nilai kinerja: <b>' + R.nilai + '</b> <span class="chip ' + (R.naik >= 0 ? 'ok' : 'abu') + '">' + (R.naik >= 0 ? '+' : '') + R.naik + '</span></div>' : '') + '</div></div>';
    K.isi.append(w);
    const stat = el('div', { kelas: 'kartu rp-stat', html: '<div class="eyebrow">Statistik singkat</div><div class="rp-st"><div><b>' + t.k1.latihan + '</b><span>latihan soal</span></div><div><b>' + R.benar + '/' + R.total + '</b><span>jawaban benar</span></div><div><b>' + (t.k2.skip ? 'ada' : 'tidak') + '</b><span>bagian dilewati</span></div><div><b>' + (tes == null ? '-' : tes + '/5') + '</b><span>tes awal</span></div></div>' }); w.append(stat);
    K.nav.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali ke dasbor', onclick: hub }), el('button', { kelas: 'btn hijau besar', type: 'button', html: ik('buku') + 'Unduh catatan (A4)', onclick: () => { if (window.Catatan) Catatan.buka({ idx: E.idx(), P: E.P(), G, R }); } }));
    setTimeout(() => E.konfeti(innerWidth / 2, innerHeight * .25, 120), 400);
  }

  function mulai(env) { E = env; hub(); }
  root.Tahap2 = { mulai, layarSoal };
})(window);

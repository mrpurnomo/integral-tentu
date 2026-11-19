/* Area & Calculus — aplikasi siswa (tablet, landscape): luas daerah dengan integral tentu. */
(function () {
  'use strict';
  const { el, ik, esc, tidur, anim } = UI, B = BS;
  const app = document.getElementById('app'), pg = document.getElementById('panggung'), atas = document.getElementById('atas'), bawah = document.getElementById('bawah');
  const LK = 'ac_', lsGet = (k, d) => { try { const v = localStorage.getItem(LK + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, lsSet = (k, v) => { try { localStorage.setItem(LK + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } };
  let token = lsGet('token', null); if (!token) { token = Math.random().toString(36).slice(2) + Date.now().toString(36); lsSet('token', token); }
  const KELAS_DEF = B.KELAS_TAMPIL[0]; let kelas = lsGet('kelas', KELAS_DEF); if (!B.KELAS_TAMPIL.includes(kelas)) kelas = KELAS_DEF; B.setKelas(kelas);
  const setKelas = (k) => { kelas = k; B.setKelas(k); lsSet('kelas', k); };
  const kunciP = (i) => 'p' + (kelas === KELAS_DEF ? '' : kelas + '_') + i, kunciAk = () => (kelas === KELAS_DEF ? 'aktif' : 'aktif_' + kelas);
  let net = 'cek', idx = null, P = null, intro = null, tmr = null, ping = null;
  const warnaNama = ['bawah', 'potong', 'garis', 'parab', 'silang', 'sumbuy', 'kanan'];
  const inisial = (n) => { const k = n.split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); if (!k.length) return '?'; return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };

  /* ---------------------------------------------------------------- jaringan */
  async function api(a, data) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 6500);
    try { const r = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ a, token, kelas }, data || {})), signal: ctl.signal }); const j = await r.json().catch(() => ({})); j._s = r.status; return j; } catch (e) { return { gagal: true, _s: 0 }; } finally { clearTimeout(to); }
  }
  async function cekJaringan() { const r = await api('cek'); net = r.ok && r.penyimpanan ? 'online' : 'offline'; gambarAtas(); return net; }
  function gambarAtas() {
    atas.innerHTML = '';
    atas.append(el('span', { kelas: 'logo' }, 'Area ', el('b', null, '& Calculus')), el('span', { kelas: 'ruang' }));
    if (idx !== null) atas.append(el('span', { kelas: 'chip' + (idx === B.DUMMY ? ' sorot' : ''), html: ik('siswa', 'kecil') + (idx === B.DUMMY ? 'UJI COBA' : esc(B.nama(idx).split(' ')[0])) }));
    if (idx === B.DUMMY) atas.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('nyala', 'kecil') + 'Lompat ke…', onclick: lompatUji }));
    if (idx === B.DUMMY) atas.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Keluar uji coba', onclick: async () => { if (await UI.konfirmasi('Keluar dari uji coba?', '<p class="tengah">Progres uji coba tidak disimpan dan tidak memengaruhi siswa lain.</p>', 'Keluar', 'Batal')) { clearInterval(ping); lsSet(kunciP(B.DUMMY), null); idx = null; P = null; sWelcome(); } } }));
    if (idx !== null) atas.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('ulang', 'kecil') + 'Segarkan', onclick: segarkan }));
    atas.append(el('span', { kelas: 'chip ' + (net === 'online' ? 'ok' : (net === 'cek' ? 'abu' : 'warn')), html: ik(net === 'online' ? 'wifi' : 'putus', 'kecil') + (net === 'online' ? 'Terhubung ke guru' : (net === 'cek' ? 'Memeriksa…' : 'Mode mandiri')), title: net === 'offline' ? 'Tidak terhubung ke guru. Hasil diserahkan lewat kode.' : '' }));
  }
  async function segarkan() {
    const v = await UI.dialog({ judul: 'Segarkan', ikon: ik('ulang', 'besar'), isi: '<div class="tengah"><p style="font-size:1.15rem">Pilih <b>Periksa ulang</b> bila ada yang belum muncul (misalnya langkah yang sudah dibuka guru).</p><p class="muted">Pilih <b>Muat ulang aplikasi</b> bila layar macet. Progresmu tetap tersimpan di tablet ini.</p></div>', tombol: [{ t: 'Batal', nilai: null, kelas: 'sekunder' }, { t: 'Periksa ulang', nilai: 'cek', kelas: 'sekunder', ikon: 'ulang' }, { t: 'Muat ulang aplikasi', nilai: 'muat', ikon: 'ulang' }], tutupLuar: true });
    if (v === 'muat') { location.reload(); return; }
    if (v === 'cek') { await cekJaringan(); if (net === 'online' && idx !== null) mulaiPing(); if (P && (P.tahap === 'lanjut' || P.tahap === 'kelompok')) lanjutDari(); else UI.toast(net === 'online' ? 'Terhubung ke guru' : 'Belum tersambung ke guru', net === 'online' ? 'centang' : 'awas'); }
  }
  const kosongkanBawah = () => { bawah.innerHTML = ''; bawah.style.display = 'none'; };
  function layar(isi, kelas) { clearInterval(tmr); if (intro) { intro.stop(); intro = null; } pg.innerHTML = ''; const d = el('div', { kelas: 'layar ' + (kelas || '') }); d.append(isi); pg.append(d); return d; }
  const simpan = () => { if (idx !== null) lsSet(kunciP(idx), P); };
  const baruP = () => ({ tahap: 'intro', intro: 0, tes: { jawab: [null, null, null, null, null], mulai: 0, selesai: false, detik: 0 }, terkirim: false });
  function konfeti(x, y, n) { for (let i = 0; i < (n || 40); i++) { const c = el('div', { kelas: 'konfeti', gaya: 'left:' + x + 'px;top:' + y + 'px;background:' + ['#E0AE4A', '#13294B', '#2FA36B', '#B3232D', '#5B7FB8', '#C9922F'][i % 6] }); document.body.append(c); const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 260; anim(c, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 160) + 'px) rotate(' + Math.random() * 720 + 'deg)', opacity: 0 }], { duration: 1200 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)' }).then(() => c.remove()); } }

  /* ---------------------------------------------------------------- 1. selamat datang */
  function sWelcome() {
    kosongkanBawah(); idx = null; gambarAtas();
    const w = el('div', { kelas: 'welcome' });
    w.innerHTML = '<div class="hero-premium"><div class="hp-kiri"><div class="hp-sekolah"><i></i>SMA Vidatra Bontang · Matematika Tingkat Lanjut · Kelas XII</div><h1 class="hp-judul">Area<span class="hp-dan">&amp;</span><br>Calculus</h1><p class="hp-sub">Mengukur luas daerah dengan integral tentu, dari satu kurva sampai dua kurva yang saling berpotongan.</p><div class="hp-aksi"></div><div class="hp-catatan">Pastikan tabletmu dalam posisi mendatar (landscape).</div></div><div class="hp-kanan" aria-hidden="true">' + UI.heroSVG() + '</div></div>';
    const aksi = w.querySelector('.hp-aksi');
    aksi.append(el('button', { kelas: 'btn besar sorot denyut', type: 'button', html: ik('siswa') + 'Masuk sebagai Siswa', onclick: () => { UI.layarPenuh(); sKelas(); } }), el('button', { kelas: 'btn besar sekunder', type: 'button', html: ik('kunci') + 'Guru', onclick: () => loginGuru(false) }));
    const ak = lsGet(kunciAk(), null); if (Number.isInteger(ak) && ak >= 0 && ak < B.cfg(kelas).daftar.length && lsGet(kunciP(ak), null)) aksi.append(el('button', { kelas: 'btn besar', type: 'button', html: ik('siswa') + 'Lanjutkan sebagai ' + esc(B.nama(ak).split(' ')[0]), onclick: () => { UI.layarPenuh(); masukSebagai(ak); } }));
    layar(w, 'tengah-layar');
  }

  /* ---------------------------------------------------------------- lompat (hanya akun uji coba) */
  async function lompatUji() {
    const LD = [['intro', 'Pengantar', 'Animasi pengantar, sembilan bagian', 'main'], ['tes', 'Tes awal', 'Lima soal diagnostik, jawaban terisi otomatis', 'ujian'], ['hasil', 'Hasil tes', 'Skor dan pembahasan tes', 'bintang'], ['kelompok', 'Kelompok', 'Kelompok langsung dan anggotanya', 'kelompok'], ['lanjut', 'Tahap lanjutan', 'Dasbor, peran, dan enam kartu', 'nyala']];
    const isiL = el('div', { kelas: 'lompat-daftar' }, LD.map(([v, t, d, i], n) => el('button', { kelas: 'lompat-item', type: 'button', 'data-v': v, html: '<span class="lompat-no">' + (n + 1) + '</span><span class="lompat-ik">' + ik(i) + '</span><span class="lompat-teks"><b>' + t + '</b><small>' + d + '</small></span><span class="lompat-p">' + ik('panah', 'kecil') + '</span>' })));
    const pilih = await UI.dialog({ judul: 'Lompat ke tahap', ikon: ik('nyala', 'besar'), kelas: 'petunjuk lompat', isi: isiL, tombol: [{ t: 'Batal', nilai: null, kelas: 'sekunder' }], tutupLuar: true, saatBuka: (b, tutup) => { b.querySelectorAll('.lompat-item').forEach((x) => x.addEventListener('click', () => tutup(x.dataset.v))); } }); if (!pilih) return;
    clearInterval(tmr); const so = B.soalSiswa(idx); P.tes = { jawab: so.map((q, i) => (i < 3 ? q.kunci : (q.kunci + 1) % 5)), mulai: Date.now(), selesai: pilih !== 'tes' && pilih !== 'intro', detik: 240 };
    if (pilih === 'intro') { P.tahap = 'intro'; P.intro = 1; P.tes = baruP().tes; } else if (pilih === 'tes') { P.tahap = 'tes'; P.tes = baruP().tes; } else { await api('hasil', { idx, jawab: P.tes.jawab, detik: 240 }); P.terkirim = true; P.tahap = pilih; }
    simpan(); lanjutDari();
  }

  /* ---------------------------------------------------------------- PIN guru */
  async function cekPinGuru(pin) { const r = await api('g-status', { pin }); if (r._s === 401) return false; if (r.ok) return true; return B.cekPinLokal(pin); }
  async function mintaPin(judul, salah) { const v = await UI.papanKetik({ judul, ikon: ik('kunci', 'besar'), panjang: 5, alfabet: '0123456789', kolom: 5, sembunyi: true, otomatis: true, keyboard: true, catatan: salah ? 'PIN salah. Coba lagi.' : 'Masukkan PIN guru (5 angka).' }); if (v == null) return null; if (await cekPinGuru(v)) return v; return mintaPin(judul, true); }
  async function loginGuru() { const v = await mintaPin('Masuk sebagai guru', false); if (v == null) return; try { sessionStorage.setItem('acg_pin', v); } catch (e) { /* abaikan */ } location.href = 'guru.html'; }
  async function masukUji() { const v = await mintaPin('Akun uji coba (guru)', false); if (v == null) return; idx = B.DUMMY; lsSet(kunciP(idx), null); P = baruP(); const r = await api('klaim', { idx }); net = r.ok ? 'online' : 'offline'; gambarAtas(); mulaiPing(); lanjutDari(); }

  /* ---------------------------------------------------------------- 2. pilih kelas */
  function sKelas() {
    if (B.KELAS_TAMPIL.length === 1) { setKelas(B.KELAS_TAMPIL[0]); return sNama(); }
    kosongkanBawah(); gambarAtas();
    const w = el('div', { kelas: 'tengah-isi' }); w.append(el('div', { kelas: 'eyebrow' }, 'Langkah 1 dari 2'), el('h2', null, 'Pilih kelasmu'));
    const kartuK = (k) => { const c = B.cfg(k); return el('button', { kelas: 'kartu-kelas' + (c.siap ? '' : ' belum'), type: 'button', gaya: 'margin-bottom:.7rem', onclick: () => { if (!c.siap) return UI.info('Materi sedang disiapkan', '<div class="tengah"><p style="font-size:1.25rem"><b>' + esc(c.nama) + '</b> memakai materi dasar integral tentu.</p><p class="muted">Materinya belum dibuka. Tunggu arahan gurumu.</p></div>', 'Mengerti', { ikon: ik('jam', 'besar') }); setKelas(k); sNama(); }, html: '<span class="ubin fx-' + ({ Teknik: 'parab', Kesehatan: 'bawah', Soshum: 'potong' }[c.program] || 'garis') + '" style="font:700 2rem var(--tampil);color:#fff">' + esc((c.nama.match(/XII-([A-Z])/) || [0, '?'])[1]) + '</span><div><div class="kelas-nama">' + esc(c.nama) + '</div><div class="muted">Matematika Tingkat Lanjut · ' + (c.siap ? 'Luas daerah di antara dua kurva' : 'Dasar integral tentu (menyusul)') + '</div></div>' + (c.siap ? ik('panah', 'besar') : '<span class="chip abu">Segera</span>') }); };
    const k = el('div', null, B.KELAS_TAMPIL.map(kartuK));
    w.append(k, el('button', { kelas: 'btn sekunder', type: 'button', gaya: 'margin-top:1.4rem', html: ik('kembali') + 'Kembali', onclick: sWelcome })); layar(w, 'tengah-layar');
  }

  /* ---------------------------------------------------------------- 3. pilih nama */
  async function sNama() {
    kosongkanBawah(); gambarAtas();
    const w = el('div', { kelas: 'nama-wrap' }); w.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.4rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, B.KELAS_TAMPIL.length > 1 ? 'Langkah 2 dari 2' : B.cfg(kelas).nama), el('h2', { gaya: 'margin:0' }, 'Pilih namamu')), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Kembali', onclick: B.KELAS_TAMPIL.length > 1 ? sKelas : sWelcome })));
    const grid = el('div', { kelas: 'grid-nama' }); w.append(grid, el('div', { kelas: 'baris', gaya: 'justify-content:flex-end;padding:.2rem 0' }, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('pensil', 'kecil') + 'Akun uji coba (guru)', onclick: masukUji }))); layar(w);
    let st = { diklaim: [], selesai: [] }; const r = await (net === 'cek' ? cekJaringan().then(() => api('status')) : api('status')); if (r && r.ok) st = r; else if (net !== 'offline') { net = 'offline'; gambarAtas(); }
    if (r && r.ok && r.manual && !r.kelasBuka) { grid.remove(); w.querySelector('.baris').nextSibling && w.append(el('div', { kelas: 'tengah-isi' }, el('span', { kelas: 'ubin fx-potong', gaya: 'width:5rem;height:5rem', html: ik('jam') }), el('h2', null, 'Guru sedang menyiapkan kelompok'), el('p', { kelas: 'muted', gaya: 'max-width:34rem;font-size:1.15rem' }, 'Daftar nama akan terbuka otomatis begitu kelompok siap. Tunggu sebentar.'))); clearInterval(tmr); tmr = setTimeout(() => { if (document.querySelector('.nama-wrap')) sNama(); }, 4000); return; }
    B.cfg(kelas).daftar.forEach((_, i) => {
      const nm = B.nama(i), sudah = st.diklaim.includes(i), tamat = st.selesai.includes(i);
      const t = el('button', { kelas: 'tile-nama fx-' + warnaNama[i % 7] + (sudah ? ' dipakai' : ''), type: 'button', onclick: () => pilihNama(i), html: '<span class="av">' + inisial(nm) + '</span><span class="nm">' + esc(nm) + '</span>' + (sudah ? '<span class="lencana-n">' + (tamat ? ik('centang', 'kecil') + 'selesai' : ik('kunci', 'kecil') + 'dipakai') + '</span>' : '') }); grid.append(t); anim(t, [{ opacity: 0, transform: 'translateY(.8rem) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 25 });
    });
  }
  async function pilihNama(i) {
    const nm = B.nama(i);
    const ya = await UI.dialog({ judul: 'Apakah benar ini namamu?', ikon: ik('siswa', 'besar'), isi: '<div class="tengah" style="padding:.6rem 0"><div style="font-family:var(--tampil);font-size:2.2rem;font-weight:700;line-height:1.15">' + esc(nm) + '</div><div class="muted" style="margin-top:.5rem">' + esc(B.cfg(kelas).nama) + '</div></div>', tombol: [{ t: 'Bukan, kembali', nilai: false, kelas: 'sekunder' }, { t: 'Ya, benar', nilai: true, kelas: 'hijau', ikon: 'centang' }] });
    if (!ya) return;
    return masukSebagai(i);
  }
  async function masukSebagai(i) {
    const nm = B.nama(i); await cekJaringan();
    const r = await api('klaim', { idx: i });
    if (r._s === 423) { await UI.info('Kelas belum dibuka', '<div class="tengah"><p>Gurumu belum membuka kelas ini.</p><p class="muted">Tunggu sebentar, lalu pilih namamu lagi.</p></div>', 'Mengerti', { ikon: ik('jam', 'besar') }); return sNama(); }
    if (r._s === 409) { await UI.info('Nama ini sedang dipakai', '<div class="tengah"><p>Nama <b>' + esc(nm) + '</b> sudah dipakai di perangkat lain.</p><p class="muted">Kalau itu memang kamu (misalnya tablet berganti), minta <b>guru</b> untuk mengatur ulang nama ini.</p></div>', 'Mengerti', { ikon: ik('kunci', 'besar') }); return sNama(); }
    if (r.gagal || r._s >= 500 || r._s === 503) { net = 'offline'; } else if (r.ok) { net = 'online'; }
    idx = i; lsSet(kunciAk(), i); P = lsGet(kunciP(i), null) || baruP();
    if (r.hasil && r.hasil.jawab) { P.tes.jawab = r.hasil.jawab; P.tes.selesai = true; P.tes.detik = r.hasil.detik || 0; P.terkirim = true; if (['intro', 'tes'].includes(P.tahap)) P.tahap = 'hasil'; }
    simpan(); gambarAtas(); mulaiPing(); lanjutDari();
  }
  function mulaiPing() { clearInterval(ping); if (net !== 'online') return; ping = setInterval(() => api('ping', { idx, tahap: P && P.tahap }), 20000); }
  function lanjutDari() { if (P.tahap === 'intro') return sIntro(); if (P.tahap === 'tes') return sTes(); if (P.tahap === 'hasil') return sHasil(); if (P.tahap === 'kelompok') return sKelompok(); return sLanjut(); }

  /* ---------------------------------------------------------------- 4. pengantar */
  async function sIntro() {
    kosongkanBawah(); gambarAtas(); const host = el('div', { gaya: 'position:absolute;inset:0' });
    if (P.intro === 0) { layar(host); await UI.dialog({ judul: 'Tunggu aba-aba dari guru', ikon: ik('jam', 'besar'), isi: '<div class="tengah"><p style="font-size:1.4rem">Jangan klik <b>Mulai</b> dulu.</p><p class="muted">Tunggu sampai gurumu mengatakan kita mulai bersama-sama.</p></div>', tombol: [{ t: 'Mulai pengantar', nilai: true, ikon: 'main' }] }); }
    else layar(host);
    intro = Intro.mount(host, { mulai: P.intro, played: P.played || [], saatMain: (a) => { P.played = a; simpan(); }, labelAkhir: 'Mulai tes awal', ambilPosisi: async () => { const r = await api('t2s'); return r && r.ok ? (r.slide || null) : undefined; }, saatLangkah: (i) => { P.intro = i; simpan(); }, saatSelesai: () => { P.tahap = 'tes'; P.intro = 0; simpan(); sTes(); } });
  }

  /* ---------------------------------------------------------------- 5. tes awal */
  const HURUF = 'ABCDE';
  async function sTes() {
    kosongkanBawah(); gambarAtas(); const soal = B.soalSiswa(idx); let aktif = 0;
    const w = el('div', { kelas: 'tes-wrap' }); layar(w);
    if (!P.tes.mulai) {
      await UI.petunjuk({ judul: 'Tes diagnostik awal', ikon: ik('ujian', 'besar'), sub: '5 soal pilihan ganda &nbsp;·&nbsp; ' + Math.round(B.durasi(kelas) / 60) + ' menit', butir: [{ ik: 'ujian', t: 'Soal tentang <b>integral tentu</b> (menghitung, menukar batas, memecah batas) dan membaca <b>grafik luas daerah</b>.' }, { ik: 'siswa', t: 'Angka tiap siswa <b>berbeda</b>, tetapi jenis dan tingkat kesulitannya sama.' }, { ik: 'pensil', t: 'Boleh mengerjakan dari nomor mana saja dan memakai <b>coretan layar</b> (ikon di pojok kartu soal).' }, { ik: 'jam', t: 'Semua soal harus dijawab sebelum dikumpulkan. Jika waktu habis, jawabanmu <b>dikumpulkan otomatis</b>.' }, { ik: 'info', t: 'Ini bukan nilai rapor. Tujuannya mengetahui titik awalmu.' }], tombol: [{ t: 'Mulai tes', nilai: true, ikon: 'main', kelas: 'hijau' }] });
      P.tes.mulai = Date.now(); simpan();
    }
    const kiri = el('div', { kelas: 'soal-kartu kartu' }), kanan = el('div', { kelas: 'tes-samping' }); w.append(kiri, kanan);
    const timer = el('div', { kelas: 'timer' }), grid = el('div', { kelas: 'nomor-grid' }), btnKirim = el('button', { kelas: 'btn hijau besar', type: 'button', html: ik('kirim') + 'Kumpulkan', onclick: () => kumpulkan(false) }), info = el('div', { kelas: 'kecil tengah muted' });
    kanan.append(timer, el('div', { kelas: 'eyebrow', gaya: 'margin-top:.4rem' }, 'Nomor soal'), grid, info, btnKirim);
    const jml = () => P.tes.jawab.filter((v) => v != null).length;
    let cor = null;
    function gambar() {
      if (cor) { cor.lepas(); cor = null; } const q = soal[aktif]; kiri.innerHTML = ''; const slot = el('div', { kelas: 'cor-slot' });
      kiri.append(el('div', { kelas: 'baris so-kepala' }, el('div', { kelas: 'eyebrow' }, 'Soal ' + (aktif + 1) + ' dari 5'), slot));
      if (q.grafik) { const bagi = el('div', { kelas: 'soal-bagi' }, el('div', { kelas: 'teks-soal', html: q.tanya }), el('div', { kelas: 'gambar-soal' })); Adegan.statis(bagi.lastChild, q.grafik.spec, { tema: 'terang', label: true, W: 520, H: 420 }); kiri.append(bagi); } else kiri.append(el('div', { kelas: 'teks-soal', html: q.tanya }));
      const ops = el('div', { kelas: 'opsi-wrap' }); q.opsi.forEach((o, k) => ops.append(el('button', { kelas: 'opsi' + (P.tes.jawab[aktif] === k ? ' pilih' : ''), type: 'button', html: '<span class="huruf">' + HURUF[k] + '</span><span>' + o + '</span>', onclick: () => { P.tes.jawab[aktif] = k; simpan(); gambar(); } }))); kiri.append(ops);
      kiri.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-top:auto' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Sebelumnya', disabled: aktif === 0, onclick: () => { aktif--; gambar(); } }), el('button', { kelas: 'btn sekunder', type: 'button', html: 'Berikutnya' + ik('panah'), disabled: aktif === 4, onclick: () => { aktif++; gambar(); } })));
      grid.innerHTML = ''; soal.forEach((_, i) => grid.append(el('button', { kelas: 'no' + (i === aktif ? ' aktif' : '') + (P.tes.jawab[i] != null ? ' isi' : ''), type: 'button', onclick: () => { aktif = i; gambar(); } }, i + 1)));
      cor = Coretan.pasang(kiri, 'tes' + idx + '_' + aktif, { bar: slot });
      const sisa = 5 - jml(); info.textContent = sisa ? sisa + ' soal belum dijawab' : 'Semua soal sudah dijawab'; btnKirim.disabled = sisa > 0; btnKirim.className = 'btn hijau besar' + (sisa ? ' mati' : ' denyut');
    }
    let selesaiOtomatis = false;
    function ketik() { const sisa = Math.max(0, B.durasi(kelas) - Math.floor((Date.now() - P.tes.mulai) / 1000)); timer.innerHTML = ik('jam') + '<b>' + String(Math.floor(sisa / 60)).padStart(2, '0') + ':' + String(sisa % 60).padStart(2, '0') + '</b>'; timer.classList.toggle('merah', sisa <= 60); if (sisa <= 0 && !selesaiOtomatis) { selesaiOtomatis = true; clearInterval(tmr); kumpulkan(true); } }
    async function kumpulkan(paksa) {
      if (!paksa) { const sisa = 5 - jml(); const ya = await UI.konfirmasi('Kumpulkan jawaban?', '<div class="tengah"><p style="font-size:1.25rem">Semua soal sudah terjawab.</p><p class="muted">Setelah dikumpulkan, jawaban <b>tidak bisa diubah</b>.</p></div>', 'Ya, kumpulkan', 'Periksa lagi'); if (!ya) return; }
      else await UI.info('Waktu habis', '<div class="tengah"><p style="font-size:1.25rem">Jawabanmu dikumpulkan otomatis.</p></div>', 'Lihat hasil', { ikon: ik('jam', 'besar') });
      P.tes.selesai = true; P.tes.detik = Math.min(B.durasi(kelas), Math.floor((Date.now() - P.tes.mulai) / 1000)); P.tahap = 'hasil'; simpan(); sHasil(true);
    }
    gambar(); ketik(); tmr = setInterval(ketik, 1000);
  }

  /* ---------------------------------------------------------------- 6. hasil + perayaan */
  async function sHasil(baru) {
    kosongkanBawah(); gambarAtas(); clearInterval(tmr); const n = B.nilai(idx, P.tes.jawab), soal = B.soalSiswa(idx);
    const w = el('div', { kelas: 'hasil-wrap' }); layar(w);
    const kiri = el('div', { kelas: 'kartu hasil-skor tengah' }), kanan = el('div', { kelas: 'hasil-kanan' }); w.append(kiri, kanan);
    const kel = 2 * Math.PI * 70, cincin = '<div class="cincin"><svg viewBox="0 0 168 168"><circle cx="84" cy="84" r="70" fill="none" stroke="#E1E6F0" stroke-width="16"/><circle id="arc" cx="84" cy="84" r="70" fill="none" stroke="var(--markisa)" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 ' + kel.toFixed(1) + '"/></svg><div class="pusat"><b id="angka">0</b><span class="muted">dari 5</span></div></div>';
    kiri.innerHTML = '<div class="eyebrow" style="justify-content:center">Tes awal selesai</div><h2>' + (n.benar >= 4 ? 'Hebat!' : (n.benar >= 2 ? 'Bagus, terus semangat!' : 'Terima kasih sudah berusaha!')) + '</h2>' + cincin + '<div class="baris" style="justify-content:center;margin-top:.4rem"><span class="chip ok" style="font-size:1.05rem">' + ik('centang', 'kecil') + n.benar + ' soal benar</span><span class="chip bad" style="font-size:1.05rem">' + ik('silang', 'kecil') + n.salah + ' soal salah</span></div><p class="muted kecil" style="margin-top:.8rem">Ini bukan nilai rapor. Hasilnya dipakai guru untuk menyusun kelompok belajar yang seimbang.</p>';
    kanan.append(el('div', { kelas: 'eyebrow' }, 'Ketuk nomor untuk melihat pembahasan'));
    const row = el('div', { kelas: 'nomor-hasil' }); n.hasil.forEach((h, i) => row.append(el('button', { kelas: 'no-h ' + (h.benar ? 'benar' : 'salah'), type: 'button', html: '<b>' + h.no + '</b>' + ik(h.benar ? 'centang' : 'silang', 'kecil') + '<span>' + (h.benar ? 'Benar' : 'Salah') + '</span>', onclick: () => pembahasan(i, soal, n) }))); kanan.append(row);
    const aksi = el('div', { kelas: 'kolom', gaya: 'margin-top:auto' }); kanan.append(aksi);
    const status = el('div', { kelas: 'umpan' }); aksi.append(status);
    const bKirim = el('button', { kelas: 'btn besar', type: 'button', html: ik('kirim') + 'Kirim hasil ke guru' }), bKode = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('salin') + 'Tampilkan kode hasil untuk guru', onclick: () => tampilKode() }), bKel = el('button', { kelas: 'btn sorot besar', type: 'button', html: ik('kelompok') + 'Lihat kelompok', onclick: () => { P.tahap = 'kelompok'; simpan(); sKelompok(); } });
    aksi.append(bKirim, bKode, bKel);
    const perbarui = () => { if (P.terkirim) { status.className = 'umpan ok'; status.innerHTML = ik('centang') + '<span>Hasilmu sudah diterima guru.</span>'; bKirim.style.display = 'none'; bKode.style.display = 'none'; bKel.className = 'btn sorot besar denyut'; } else { status.className = 'umpan'; status.innerHTML = net === 'online' ? ik('info') + '<span>Kirim hasilmu ke guru. Jika gagal, pakai kode hasil.</span>' : ik('awas') + '<span>Tidak terhubung ke guru. Gunakan kode hasil (5 karakter) dan serahkan ke guru.</span>'; bKirim.className = 'btn besar' + (net === 'online' ? '' : ' mati'); bKode.className = 'btn sekunder' + (net === 'online' ? '' : ' denyut'); bKel.className = 'btn sorot besar mati'; } };
    bKirim.onclick = async () => { bKirim.classList.add('mati'); status.innerHTML = ik('jam') + '<span>Mengirim…</span>'; const r = await api('hasil', { idx, jawab: P.tes.jawab, detik: P.tes.detik }); if (r.ok) { P.terkirim = true; net = 'online'; simpan(); gambarAtas(); perbarui(); konfeti(innerWidth / 2, innerHeight / 3, 30); } else { if (r._s === 403 || r.error === 'tidak-dikenali') { await UI.info('Nama belum terdaftar di server', '<p>Minta guru mengatur ulang, atau serahkan <b>kode hasil</b>.</p>', 'Mengerti'); } else { net = 'offline'; gambarAtas(); UI.toast('Gagal terkirim. Pakai kode hasil.', 'awas'); } perbarui(); } };
    perbarui();
    if (baru) { setTimeout(() => konfeti(innerWidth / 2, innerHeight * .3, 80), 500); }
    const arc = document.getElementById('arc'), angka = document.getElementById('angka'); const t0 = performance.now(), dur = 1400, target = n.benar / 5 * kel;
    (function f(t) { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); if (!arc.isConnected) return; arc.setAttribute('stroke-dasharray', (target * e).toFixed(1) + ' ' + kel.toFixed(1)); angka.textContent = Math.round(n.benar * e); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function pembahasan(i, soal, n) {
    const q = soal[i], h = n.hasil[i], mine = h.pilih;
    const gb = el('div', { kelas: 'gambar-soal' }); if (q.grafik) Adegan.statis(gb, q.grafik.spec, { tema: 'terang', label: true, W: 520, H: 400 });
    UI.dialog({ lebar: true, judul: 'Soal ' + (i + 1) + ' · ' + (h.benar ? 'Benar' : 'Salah'), ikon: ik(h.benar ? 'centang' : 'silang', 'besar'), tutupX: true, tutupLuar: true,
      isi: '<div class="' + (q.grafik ? 'soal-bagi' : '') + '"><div class="teks-soal" style="font-size:1.35rem">' + q.tanya + '</div><div class="gb-slot"></div></div><div class="opsi-wrap" style="margin:.6rem 0">' + q.opsi.map((o, k) => '<div class="opsi ' + (k === q.kunci ? 'benar' : (k === mine ? 'salah' : '')) + '" style="cursor:default"><span class="huruf">' + HURUF[k] + '</span><span>' + o + '</span>' + (k === q.kunci ? '<span class="chip ok" style="margin-left:auto">jawaban benar</span>' : (k === mine ? '<span class="chip bad" style="margin-left:auto">jawabanmu</span>' : '')) + '</div>').join('') + '</div><div class="umpan ok" style="align-items:flex-start">' + ik('info') + '<span>' + q.jelas + '</span></div>', tombol: [{ t: 'Tutup', nilai: true }], saatBuka: (b) => { const sl = b.querySelector('.gb-slot'); if (sl && q.grafik) sl.replaceWith(gb); } });
  }
  function tampilKode() {
    const kode = B.buatKode(idx, P.tes.jawab);
    UI.dialog({ judul: 'Kode hasil untuk guru', ikon: ik('salin', 'besar'), isi: '<div class="tengah"><p>Berikan 5 karakter ini kepada gurumu:</p><div class="kode-besar kode">' + kode.split('').map((c) => '<span>' + c + '</span>').join('') + '</div><p class="muted kecil">Kode ini berisi namamu dan jawabanmu. Tulis persis seperti di layar.</p></div>', tombol: [{ t: 'Sudah saya serahkan', nilai: true, kelas: 'hijau' }] }).then(() => { UI.toast('Setelah itu tekan “Lihat kelompok”.', 'info'); const b = [...document.querySelectorAll('.btn')].find((x) => x.textContent.includes('Lihat kelompok')); if (b) b.classList.remove('mati'); });
  }

  /* ---------------------------------------------------------------- 7. kelompok */
  async function sKelompok() {
    kosongkanBawah(); gambarAtas(); const w = el('div', { kelas: 'kel-wrap' }); layar(w);
    const muat = async () => {
      w.innerHTML = '<div class="tengah-isi"><div class="spinner"></div><p class="muted">Menyusun kelompok…</p></div>';
      const r = await api('kelompok', { idx });
      if (r.ok && r.menunggu) { w.innerHTML = '<div class="tengah-isi"><span class="ubin fx-potong" style="width:5rem;height:5rem">' + ik('jam') + '</span><h2>Guru belum membuka kelompok</h2><p class="muted">Tunggu sebentar, halaman ini akan memeriksa sendiri.</p></div>'; clearInterval(tmr); tmr = setTimeout(muat, 4000); return; }
      if (r.ok) { tampil(r.kelompok, r.saya); return; }
      if (r.error === 'tanpa-kelompok') { w.innerHTML = '<div class="tengah-isi"><h2>Namamu belum ada di kelompok</h2><p class="muted" style="max-width:34rem">Beri tahu gurumu agar namamu dimasukkan ke sebuah kelompok, lalu coba lagi.</p></div>'; w.querySelector('.tengah-isi').append(el('button', { kelas: 'btn', type: 'button', gaya: 'margin-top:1rem', html: ik('ulang') + 'Coba lagi', onclick: muat })); return; }
      if (r.error === 'belum-selesai') { w.innerHTML = '<div class="tengah-isi"><h2>Selesaikan tes dulu</h2></div>'; return; }
      w.innerHTML = '<div class="tengah-isi"><span class="ubin fx-tangga" style="width:5rem;height:5rem">' + ik('putus') + '</span><h2>Daftar kelompok ada di layar guru</h2><p class="muted" style="max-width:36rem">Tablet belum terhubung ke guru, jadi kelompok diumumkan lewat layar kelas. Lihat nama dan nomor kelompokmu di sana, lalu pindah ke mejanya.</p></div>'; const b = el('div', { kelas: 'baris', gaya: 'justify-content:center;margin-top:1rem' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Coba terhubung lagi', onclick: muat }), el('button', { kelas: 'btn', type: 'button', html: 'Saya sudah tahu kelompokku' + ik('panah'), onclick: () => { P.tahap = 'lanjut'; simpan(); sLanjut(); } })); w.querySelector('.tengah-isi').append(b);
    };
    /* kelompok langsung: tablet memeriksa server tiap ±4 detik; anggota baru yang masuk muncul sendiri tanpa memuat ulang */
    let tanda = '', lama = null, kelTimer = null;
    const tutupPoll = () => { clearInterval(kelTimer); kelTimer = null; };
    const lanjutKe = () => { tutupPoll(); P.tahap = 'lanjut'; simpan(); sLanjut(); };
    async function segar() { if (!w.isConnected) return tutupPoll(); const r = await api('kelompok', { idx }); if (r.ok && r.kelompok) { const tt = JSON.stringify(r.kelompok.map((g) => g.map((s) => s.idx))); if (tt !== tanda) tampil(r.kelompok, r.saya); } }
    function tampil(kel, saya) {
      const pertama = lama === null, ada = new Set(kel.flat().map((s) => s.idx)), maks = B.cfg(kelas).maks, total = B.cfg(kelas).daftar.length; tanda = JSON.stringify(kel.map((g) => g.map((s) => s.idx)));
      w.innerHTML = ''; const kepala = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.6rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Kelompok belajar · langsung'), el('h2', { gaya: 'margin:0' }, 'Kamu di Kelompok ' + (saya + 1))), el('div', { kelas: 'baris' }, el('span', { kelas: 'chip sorot', html: '<i class="titik-hidup"></i>' + ada.size + ' dari ' + total + ' murid sudah masuk' }), el('button', { kelas: 'btn', type: 'button', html: 'Saya sudah di meja kelompok' + ik('panah'), onclick: lanjutKe })));
      const grid = el('div', { kelas: 'grid-kel' + (kel.length > 4 ? ' g7' : '') }); w.append(kepala, el('div', { kelas: 'umpan ok', html: ik('info') + '<span>' + (B.cfg(kelas).manual ? 'Pindahlah ke meja kelompokmu. Kelompok disusun oleh gurumu.' : 'Pindahlah ke meja kelompokmu. Teman yang baru selesai tes akan muncul sendiri di sini. Perananmu dipilih nanti di dasbor tahap lanjutan.') + '</span>' }), grid);
      kel.forEach((g, gi) => { const k = el('div', { kelas: 'kel-kartu' + (gi === saya ? ' saya' : ''), 'data-g': gi }); const fam = B.bagianKelompok(gi); k.classList.add('fx-' + fam); k.append(el('div', { kelas: 'kel-judul' }, 'Kelompok ' + (gi + 1), el('span', { kelas: 'chip abu' }, g.length + ' / ' + maks)), el('div', { kelas: 'kel-pos', html: UI.ubin(fam) + '<span>Materi ' + (gi + 1) + ' · ' + esc(UI.NAMA[fam]) + '</span>' }));
        g.forEach((s, pi) => { const baru = !pertama && !lama.has(s.idx), n = el('div', { kelas: 'kel-nama' + (s.idx === idx ? ' aku' : '') + (baru ? ' baru' : '') }, el('span', { kelas: 'av2 fx-' + warnaNama[s.idx % 7] }, inisial(s.nama)), el('span', null, s.nama + (s.idx === idx ? ' (kamu)' : ''))); k.append(n); if (baru) anim(n, [{ opacity: 0, transform: 'translateX(-1rem) scale(.96)', background: '#FFF3D1' }, { opacity: 1, transform: 'none', background: '#FFF3D1', offset: .5 }, { opacity: 1, transform: 'none' }], { duration: 1100 }); });
        for (let pi = g.length; pi < maks; pi++) k.append(el('div', { kelas: 'kel-nama kosong' }, el('span', { kelas: 'av2 kosong' }, '?'), el('span', null, 'Menunggu teman…')));
        grid.append(k); if (pertama) anim(k, [{ opacity: 0, transform: 'translateY(1rem)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: gi * 120 }); });
      if (pertama) setTimeout(() => konfeti(innerWidth / 2, innerHeight * .25, 40), 600); lama = ada;
      if (!kelTimer) kelTimer = setInterval(segar, 4000);
    }
    muat();
  }

  /* ---------------------------------------------------------------- 8. tahap berikutnya */
  function sLanjut() {
    gambarAtas(); Tahap2.mulai({ idx: () => idx, P: () => P, simpan, api, layar, net: () => net, cekNet: cekJaringan, gambarAtas, bawahKosong: kosongkanBawah, konfeti }); return;
    kosongkanBawah(); const w = el('div', { kelas: 'tengah-isi' }); w.innerHTML = '<span class="ubin fx-parab" style="width:5.5rem;height:5.5rem">' + UI.glif('parab') + '</span><h2>Tahap berikutnya</h2><p class="muted" style="max-width:38rem;font-size:1.2rem">Tunggu arahan gurumu. Kegiatan berikutnya dilakukan bersama kelompok.</p>';
    w.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kelompok') + 'Lihat kelompok lagi', onclick: () => { P.tahap = 'kelompok'; simpan(); sKelompok(); } })); layar(w, 'tengah-layar');
  }

  /* ---------------------------------------------------------------- mulai */
  UI.pasangPutar(); gambarAtas(); sWelcome(); cekJaringan();
  window.acDebug = { intro: () => intro, P: () => P, idx: () => idx, net: () => net, ke: { welcome: sWelcome, kelas: sKelas, nama: sNama, intro: sIntro, tes: sTes, hasil: sHasil, kelompok: sKelompok, lanjut: sLanjut }, pilih: (i) => { idx = i; P = lsGet(kunciP(i), null) || baruP(); return P; }, set: (i, p) => { idx = i; P = p; simpan(); } };
})();

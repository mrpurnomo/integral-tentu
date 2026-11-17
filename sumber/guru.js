/* Area & Calculus — halaman guru: penjelasan (pengantar sama persis dengan siswa), pantau, kelompok, kode hasil. */
(function () {
  'use strict';
  const { el, ik, esc, anim } = UI, B = BS;
  const atas = document.getElementById('atas'), pg = document.getElementById('panggung'), bawah = document.getElementById('bawah');
  const LS = (k, d) => { try { const v = localStorage.getItem('acg_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, LSset = (k, v) => { try { localStorage.setItem('acg_' + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } };
  let kelas = LS('kelas', BS.KELAS_TAMPIL[0]); if (!BS.KELAS_ID.includes(kelas)) kelas = BS.KELAS_TAMPIL[0]; BS.setKelas(kelas);
  const MANUAL = () => BS.cfg(kelas).manual;
  let pin = '', net = 'cek', tab = 'penjelasan', intro = null, poll = null, data = null;
  const warna = ['bawah', 'potong', 'garis', 'parab', 'silang', 'sumbuy', 'kanan'], JIG = () => BS.cfg(kelas).jigsaw, NSISWA = () => BS.cfg(kelas).daftar.length;
  const inisial = (n) => { const k = n.split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); if (!k.length) return '?'; return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };

  async function ga(a, d) { const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 7000); try { const r = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ a, pin, kelas }, d || {})), signal: ctl.signal }); const j = await r.json().catch(() => ({})); j._s = r.status; return j; } catch (e) { return { gagal: true, _s: 0 }; } finally { clearTimeout(to); } }
  const hasilLokal = () => LS('hasil', {}), kelLokal = () => LS('kelompok', null);

  function gambarAtas() {
    atas.innerHTML = ''; atas.append(el('span', { kelas: 'logo' }, 'Area ', el('b', null, '& Calculus')));
    const tabs = el('div', { kelas: 'tabs-guru' }); [['penjelasan', 'layar', 'Penjelasan'], ['pantau', 'siswa', 'Pantau'], ['kelompok', 'kelompok', 'Kelompok'], ['t2', 'bintang', 'Tahap 2'], ['kode', 'salin', 'Kode']].forEach(([id, ikon, t]) => tabs.append(el('button', { type: 'button', kelas: id === tab ? 'aktif' : '', html: ik(ikon, 'kecil') + t, onclick: () => ke(id) }))); atas.append(el('span', { kelas: 'ruang' }), tabs, el('span', { kelas: 'ruang' }));
    atas.append(el('button', { kelas: 'kelas-aktif k-' + kelas, type: 'button', title: 'Klik untuk mengganti kelas', onclick: () => pilihKelasDialog(false), html: '<small>KELAS AKTIF</small><b>' + esc(BS.cfg(kelas).nama) + '</b>' + ik('panah', 'kecil') }), tmChip(), el('span', { kelas: 'chip ' + (net === 'online' ? 'ok' : (net === 'cek' ? 'abu' : 'warn')), title: net === 'online' ? 'Server aktif' : (net === 'cek' ? 'Memeriksa…' : 'Mode mandiri'), html: ik(net === 'online' ? 'wifi' : 'putus', 'kecil') + (net === 'online' ? '' : (net === 'cek' ? 'Memeriksa…' : 'Mode mandiri')) }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('ulang', 'kecil'), 'aria-label': 'Segarkan data', title: 'Segarkan data', onclick: segarkanGuru }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('layar', 'kecil'), 'aria-label': 'Layar penuh', title: 'Layar penuh', onclick: UI.layarPenuh }), el('button', { kelas: 'btn bahaya kecil', type: 'button', html: ik('kembali', 'kecil'), 'aria-label': 'Keluar', title: 'Keluar', onclick: keluar }));
  }
  async function keluar() { if (!(await UI.konfirmasi('Keluar dari halaman guru?', '<p class="tengah">Kamu akan kembali ke layar sambutan dan harus memasukkan PIN lagi.</p>', 'Keluar', 'Batal'))) return; try { sessionStorage.removeItem('acg_pin'); } catch (e) { /* abaikan */ } location.href = 'index.html'; }
  function bersih() { clearInterval(poll); if (intro) { intro.stop(); intro = null; } pg.innerHTML = ''; }
  async function segarkanGuru() { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } else net = 'offline'; gambarAtas(); if (tab !== 'penjelasan') ke(tab); UI.toast(net === 'online' ? 'Data diperbarui' : 'Server belum terjangkau', net === 'online' ? 'centang' : 'awas'); }
  /* pemilih kelas: muncul saat masuk dan bisa dibuka lagi kapan saja lewat penanda kelas di header */
  function pilihKelasDialog(wajib) {
    return new Promise((resolve) => {
      let tutupFn = null; const isi = el('div', { kelas: 'pilih-kelas-isi' });
      isi.append(el('p', { kelas: 'muted', gaya: 'margin:0 0 .8rem' }, wajib ? 'Pilih kelas yang akan kamu ajar sekarang. Kamu bisa menggantinya kapan saja lewat penanda “Kelas aktif” di bagian atas.' : 'Data tiap kelas terpisah. Mengganti kelas tidak menghapus apa pun.'));
      BS.KELAS_TAMPIL.forEach((k) => { const c = BS.cfg(k); isi.append(el('button', { type: 'button', kelas: 'kartu-pilih k-' + k + (k === kelas ? ' sekarang' : ''), onclick: () => { resolve(k); if (tutupFn) tutupFn(k); }, html: '<span class="kp-ubin">' + c.nama.split(' ')[0] + '</span><span class="kp-teks"><b>' + esc(c.nama) + '</b><small>' + c.daftar.length + ' murid · ' + c.jmlKelompok + ' kelompok × ' + c.maks + ' · ' + (c.manual ? 'disusun guru' : 'otomatis dari tes awal') + '</small></span>' + (k === kelas ? '<span class="chip ok">sedang aktif</span>' : ik('panah', 'kecil')) })); });
      UI.dialog({ lebar: true, judul: 'Pilih kelas', ikon: ik('kelompok', 'besar'), isi, tombol: wajib ? [] : [{ t: 'Tutup', nilai: null, kelas: 'sekunder' }], tutupLuar: !wajib, saatBuka: (b, t) => { tutupFn = t; } }).then((v) => { if (!wajib) { if (v && v !== kelas) gantiKelas(v); resolve(v); } });
    }).then(async (k) => { if (wajib && k && k !== kelas) await gantiKelas(k, true); return k; });
  }
  async function masukKelas(t) { let ok = ''; try { ok = sessionStorage.getItem('acg_kelas_ok') || ''; } catch (e) { /* abaikan */ } if (!ok) { await pilihKelasDialog(true); try { sessionStorage.setItem('acg_kelas_ok', '1'); } catch (e) { /* abaikan */ } gambarAtas(); } ke(t); }
  async function gantiKelas(k, tanpaKe) {
    if (k === kelas) return; tmJeda(); kelas = k; LSset('kelas', k); BS.setKelas(k); data = null; TAHAP = buatTahap(); TM = muatTM(); const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } if (!tanpaKe) ke(tab); else gambarAtas();
  }
  function ke(t) { tab = t; gambarAtas(); bersih(); ({ penjelasan: tPenjelasan, pantau: tPantau, kelompok: tKelompok, t2: tTahap2, kode: tKode })[t](); }

  /* ---------------- penjelasan = pengantar yang sama dengan siswa ---------------- */
  function tPenjelasan() { const host = el('div', { gaya: 'position:absolute;inset:0' }); pg.append(host); intro = Intro.mount(host, { guru: true, mulai: LS('intro', 0), played: LS('played', []), saatMain: (a) => LSset('played', a), labelAkhir: 'Tes awal dimulai', saatLangkah: (i) => LSset('intro', i), saatSelesai: () => ke('pantau') }); }

  /* ---------------- pantau ---------------- */
  async function tPantau() {
    const w = el('div', { kelas: 'pantau' }); pg.append(w);
    const render = () => {
      w.innerHTML = '';
      if (net !== 'online' || !data) { w.append(el('div', { kelas: 'tengah-isi' }, el('span', { kelas: 'ubin fx-tangga', gaya: 'width:5rem;height:5rem', html: ik('putus') }), el('h2', null, 'Mode mandiri'), el('p', { kelas: 'muted' }, 'Server belum terhubung (database belum diatur, atau halaman dibuka dari berkas). Pemantauan langsung tidak tersedia. Gunakan tab “Kode hasil” untuk memasukkan kode dari siswa.'))); return; }
      const d = data.daftar, masuk = d.filter((x) => x.klaim).length, selesai = d.filter((x) => x.skor != null), rata = selesai.length ? (selesai.reduce((a, b) => a + b.skor, 0) / selesai.length).toFixed(1).replace('.', ',') : '–';
      w.append(el('div', { kelas: 'stat-guru' }, stat('Sudah masuk', masuk + '/' + d.length, 'bawah'), stat('Selesai tes awal', selesai.length + '/' + d.length, 'garis'), stat('Rata-rata skor', rata + ' / 5', 'potong'), el('button', { kelas: 'btn sekunder kecil', type: 'button', gaya: 'margin-left:auto', html: ik('pensil', 'kecil') + 'Akun uji coba: ' + (data.uji && data.uji.klaim ? (data.uji.skor != null ? 'selesai tes' : 'aktif') : 'kosong'), onclick: async () => { if (await UI.konfirmasi('Atur ulang akun uji coba?', '<p class="tengah">Akun uji coba dipakai guru untuk mencoba alur. Ini tidak memengaruhi siswa asli.</p>', 'Atur ulang', 'Tutup')) { await ga('g-reset', { idx: B.DUMMY }); UI.toast('Akun uji coba diatur ulang', 'centang'); muat(); } } }), el('button', { kelas: 'btn bahaya kecil', type: 'button', html: ik('hapus', 'kecil') + 'Atur ulang semua', onclick: async () => { if (await UI.konfirmasi('Atur ulang semua?', '<p>Semua nama, hasil tes, dan kelompok akan dihapus. Ini tidak bisa dibatalkan.</p>', 'Ya, hapus semua', 'Batal')) { await ga('g-reset-semua'); muat(); } } })));
      const grid = el('div', { kelas: 'grid-pantau' }); w.append(grid);
      d.forEach((x, i) => { const st = !x.klaim ? 'belum' : (x.skor != null ? 'selesai' : (Date.now() - x.aktif > 60000 ? 'diam' : 'aktif')); const lab = { belum: 'belum masuk', aktif: ({ intro: 'pengantar', tes: 'mengerjakan tes', hasil: 'melihat hasil', kelompok: 'melihat kelompok', lanjut: 'tahap lanjut', masuk: 'sudah masuk' })[x.tahap] || 'aktif', diam: 'tidak aktif >1 mnt', selesai: 'skor ' + x.skor + '/5' }[st];
        const t = el('button', { kelas: 'tile-pantau ' + st + ' fx-' + warna[i % 7], type: 'button', onclick: () => detail(x), html: '<span class="av">' + inisial(x.nama) + '</span><span class="nm">' + esc(x.nama) + '</span><span class="st">' + lab + '</span>' + (x.kel >= 0 ? '<span class="kg">K' + (x.kel + 1) + '</span>' : '') }); grid.append(t); });
    };
    const stat = (l, v, f) => el('div', { kelas: 'kartu stat fx-' + f, html: '<div class="eyebrow" style="margin:0">' + l + '</div><b>' + v + '</b>' });
    async function muat() { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } else if (r._s === 401) { await mintaPin(true); return; } else { net = 'offline'; data = null; } gambarAtas(); render(); }
    function detail(x) { UI.dialog({ judul: x.nama, ikon: ik('siswa', 'besar'), isi: '<p>Status: <b>' + (x.klaim ? (x.skor != null ? 'selesai tes · skor ' + x.skor + ' dari 5' : 'sudah masuk') : 'belum masuk') + '</b>' + (x.kel >= 0 ? ' · Kelompok ' + (x.kel + 1) : '') + '</p><p class="muted">Atur ulang jika siswa berganti tablet atau salah memilih nama. Hasil tesnya ikut terhapus.</p>', tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }, { t: 'Atur ulang nama ini', nilai: true, kelas: 'bahaya', ikon: 'hapus' }], tutupLuar: true }).then(async (v) => { if (v) { await ga('g-reset', { idx: x.idx }); UI.toast('Nama diatur ulang', 'centang'); muat(); } }); }
    await muat(); poll = setInterval(muat, 3000);
  }

  /* ---------------- kelompok ---------------- */
  async function tKelompok() { if (MANUAL()) return tKelompokManual();
    const w = el('div', { kelas: 'kel-wrap' }); pg.append(w);
    const render = () => {
      w.innerHTML = ''; let kel = null, tahan = false;
      if (net === 'online' && data) { kel = data.kelompok; tahan = data.gerbang === 'tutup'; } else { const k = kelLokal(); kel = k ? k.map((g) => g.map((s) => ({ idx: s.idx, nama: B.nama(s.idx) }))) : null; }
      const ket = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.6rem;flex-wrap:wrap' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Kelompok heterogen · ' + BS.cfg(kelas).jmlKelompok + ' kelompok × ' + BS.cfg(kelas).maks + ' orang'), el('h2', { gaya: 'margin:0' }, kel ? 'Daftar kelompok' : 'Belum ada kelompok')));
      const aksi = el('div', { kelas: 'baris' }); aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kelompok', 'kecil') + (kel ? 'Susun ulang dari hasil terkini' : 'Bentuk kelompok sekarang'), onclick: bentuk }));
      if (kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('siswa', 'kecil') + 'Tambahkan yang menyusul', onclick: tambahSusul }));
      if (kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('hapus', 'kecil') + 'Hapus', onclick: async () => { if (net === 'online') await ga('g-hapus-kelompok'); else LSset('kelompok', null); muat(); } }));
      if (kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kirim', 'kecil') + 'Unduh PDF', onclick: () => Cetak.kelompok(kel, { kelas: BS.cfg(kelas).nama, jigsaw: BS.cfg(kelas).jigsaw }) }));
      if (net === 'online' && kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('salin', 'kecil') + 'Simpan kelompok', onclick: simpanArsip }));
      if (net === 'online') aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('buku', 'kecil') + 'Muat tersimpan', onclick: muatArsip }));
      ket.append(aksi); w.append(ket);
      if (net === 'online') {
        const selesaiTes = data ? data.daftar.filter((x) => x.skor != null).length : 0;
        const gerbang = el('div', { kelas: 'kartu gerbang ' + (tahan ? 'kunci' : 'buka') });
        gerbang.append(el('span', { kelas: 'ubin ' + (tahan ? 'fx-tangga' : 'fx-garis'), html: ik(tahan ? 'gembok' : 'centang') }), el('div', { gaya: 'flex:1' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Layar siswa saat ini'), el('h3', { gaya: 'margin:0;font-size:1.5rem' }, tahan ? 'Kelompok TERKUNCI. Siswa menunggu.' : 'Kelompok DIBUKA. Siswa bisa melihat kelompoknya.'), el('div', { kelas: 'muted' }, selesaiTes + ' siswa sudah selesai tes awal. ' + (tahan ? 'Buka setelah semua (atau cukup banyak) siswa selesai.' : 'Siswa yang menyusul masuk lewat “Tambahkan yang menyusul”.'))), el('button', { kelas: 'btn besar ' + (tahan ? 'hijau denyut-h' : 'sekunder'), type: 'button', html: ik(tahan ? 'nyala' : 'gembok') + (tahan ? 'Buka kelompok untuk siswa' : 'Kunci lagi'), onclick: async () => { if (tahan && !(selesaiTes >= 1)) { UI.toast('Belum ada siswa yang selesai tes awal', 'awas'); return; } await ga('g-gerbang', { buka: tahan }); muat(); } }));
        w.append(gerbang);
      }
      if (!kel) { w.append(el('div', { kelas: 'tengah-isi' }, el('p', { kelas: 'muted' }, 'Kelompok disusun dari siswa yang sudah selesai tes awal, secara seimbang (nilai tinggi dan rendah dicampur).'))); return; }
      const grid = el('div', { kelas: 'grid-kel' }); w.append(grid);
      kel.forEach((g, gi) => { const fam = BS.bagianKelompok(gi), k = el('div', { kelas: 'kel-kartu fx-' + fam }); k.append(el('div', { kelas: 'kel-judul' }, 'Kelompok ' + (gi + 1), el('span', { kelas: 'chip abu' }, g.length + ' orang')), el('div', { kelas: 'kel-pos', html: UI.ubin(fam) + '<span>Pos ' + (gi + 1) + ' · ' + esc(UI.NAMA[fam]) + '</span>' })); g.forEach((s, pi) => k.append(el('div', { kelas: 'kel-nama' }, el('span', { kelas: 'av2 fx-' + warna[s.idx % 7] }, inisial(s.nama)), el('span', null, s.nama), el('span', { kelas: 'peran-kecil' }, BS.peranDariPos(pi).nama)))); grid.append(k); });
    };
    async function muat() { if (net !== 'offline') { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } else if (r._s === 401) { await mintaPin(true); return; } else { net = 'offline'; data = null; } gambarAtas(); } render(); }
    async function tambahSusul() { let n = 0; if (net === 'online') { const r = await ga('g-tambah'); n = r.ditambah || 0; } else { const h = hasilLokal(), k = kelLokal(); if (k) { const ada = new Set(k.flat().map((s) => s.idx)); Object.keys(h).map(Number).filter((i) => !ada.has(i)).forEach((i) => { if (B.tambahKelompok(k, { idx: i, skor: h[i] }) >= 0) n++; }); LSset('kelompok', k); } } UI.toast(n ? n + ' siswa ditambahkan ke kelompok' : 'Tidak ada siswa yang menyusul', n ? 'centang' : 'info'); muat(); }
    const tglJam = (t) => new Date(t).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    async function simpanArsip() { const r = await ga('g-simpan-kelompok', { label: BS.cfg(kelas).nama + ' · ' + tglJam(Date.now()) }); if (r.ok) UI.toast('Kelompok disimpan. Bisa dimuat kapan saja, juga setelah data kelas diatur ulang.', 'centang'); else UI.toast('Belum ada kelompok untuk disimpan', 'awas'); }
    async function muatArsip() {
      const r = await ga('g-arsip'); if (!r.ok) { UI.toast('Gagal membaca arsip', 'awas'); return; }
      const isi = el('div', { kelas: 'arsip' }); let tutupFn = null;
      const gambar = (arsip) => { isi.innerHTML = ''; if (!arsip.length) { isi.append(el('p', { kelas: 'muted tengah' }, 'Belum ada kelompok tersimpan. Kelompok yang terbentuk otomatis tersimpan di sini.')); return; }
        arsip.forEach((x) => isi.append(el('div', { kelas: 'arsip-baris' }, el('div', { gaya: 'flex:1' }, el('b', null, x.label === 'otomatis' ? 'Terbentuk otomatis' : x.label), el('div', { kelas: 'muted kecil' }, tglJam(x.t) + ' · ' + x.n + ' kelompok · ' + x.total + ' murid')), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kirim', 'kecil') + 'PDF', onclick: () => Cetak.kelompok(x.kel, { kelas: BS.cfg(kelas).nama, jigsaw: BS.cfg(kelas).jigsaw, label: x.label === 'otomatis' ? '' : x.label }) }), el('button', { kelas: 'btn kecil', type: 'button', html: 'Muat', onclick: async () => { const ada = kel && kel.length; if (ada && !(await UI.konfirmasi('Ganti kelompok sekarang?', '<p class="tengah">Kelompok yang aktif akan diganti dengan kelompok tersimpan ini.</p>', 'Ya, ganti', 'Batal'))) return; const m = await ga('g-muat-kelompok', { id: x.id }); if (m.ok) { UI.toast('Kelompok dimuat', 'centang'); if (tutupFn) tutupFn(true); muat(); } else UI.toast('Gagal memuat', 'awas'); } }), el('button', { kelas: 'btn sekunder kecil', type: 'button', 'aria-label': 'Hapus', html: ik('hapus', 'kecil'), onclick: async () => { await ga('g-hapus-arsip', { id: x.id }); const r2 = await ga('g-arsip'); gambar(r2.arsip || []); } })))); };
      gambar(r.arsip || []); UI.dialog({ lebar: true, judul: 'Kelompok tersimpan', ikon: ik('buku', 'besar'), isi, tombol: [{ t: 'Tutup', nilai: null, kelas: 'sekunder' }], tutupLuar: true, saatBuka: (b, t) => { tutupFn = t; } });
    }
    async function bentuk() {
      if (net === 'online') { const r = await ga('g-bentuk'); if (!r.ok) UI.toast('Gagal membentuk kelompok', 'awas'); } else { const h = hasilLokal(), sel = Object.keys(h).map((k) => ({ idx: +k, skor: h[k] })); if (!sel.length) return UI.toast('Belum ada hasil. Masukkan kode di tab Kode hasil.', 'awas'); LSset('kelompok', B.bentukKelompok(sel)); }
      muat();
    }
    await muat(); poll = setInterval(() => { if (net === 'online') muat(); }, 4000);
  }

  /* ---------------- kelompok manual (kelas yang disusun guru): papan susun dengan seret-lepas atau ketuk ---------------- */
  async function tKelompokManual() {
    const w = el('div', { kelas: 'kb' }); pg.append(w); const J = BS.cfg(kelas).jmlKelompok, SEMUA = BS.cfg(kelas).daftar.map((_, i) => i), jenis = BS.URUT;
    let papan = Array.from({ length: J }, () => []), dipilih = null, aktifG = null, simpanTimer = null, status = 'Memuat…', muatAwal = false;
    const bebas = () => SEMUA.filter((i) => !papan.some((g) => g.includes(i)));
    const nama2 = (i) => BS.nama(i).split(/\s+/).slice(0, 2).join(' '), info = (i) => (data && data.daftar ? data.daftar[i] : null);
    const kirimSimpan = () => { status = 'Menyimpan…'; perbaruiStatus(); clearTimeout(simpanTimer); simpanTimer = setTimeout(async () => { const r = await ga('g-set-kelompok', { kel: papan }); status = r.ok ? 'Tersimpan ✓' : 'Gagal menyimpan'; perbaruiStatus(); if (r.ok) muatStatus(); }, 350); };
    const pindah = (i, tujuan) => { papan.forEach((g) => { const k = g.indexOf(i); if (k >= 0) g.splice(k, 1); }); if (tujuan !== 'bebas') papan[+tujuan].push(i); dipilih = null; kirimSimpan(); gambarPapan(); };
    async function simpanSekarang() { clearTimeout(simpanTimer); const r = await ga('g-set-kelompok', { kel: papan }); status = r.ok ? 'Tersimpan ✓' : 'Gagal menyimpan'; perbaruiStatus(); return r.ok; }
    function perbaruiStatus() { const e = w.querySelector('.kb-status'); if (e) e.textContent = status; }
    function chip(i) {
      const inf = info(i), c = el('button', { type: 'button', kelas: 'kb-chip' + (dipilih === i ? ' pilih' : '') + (inf && inf.skor != null ? ' selesai' : ''), title: BS.nama(i), html: '<span class="av2 fx-' + warna[i % 7] + '">' + inisial(BS.nama(i)) + '</span><span>' + esc(nama2(i)) + '</span>' }); let tujuan = null;
      UI.seret(c, { jatuh: (x, y) => { const e = document.elementsFromPoint(x, y).find((q) => q.dataset && q.dataset.tujuan !== undefined); tujuan = e ? e.dataset.tujuan : null; return tujuan !== null; }, saatJatuh: () => pindah(i, tujuan), saatKetuk: () => { if (aktifG !== null && !papan[aktifG].includes(i)) { pindah(i, String(aktifG)); return; } dipilih = dipilih === i ? null : i; gambarPapan(); } });
      return c;
    }
    function gambarPapan() {
      const pb = w.querySelector('.kb-pool'), gr = w.querySelector('.kb-grid'); if (!pb || !gr) return; pb.innerHTML = ''; gr.innerHTML = '';
      const tersisa = bebas(), terpasang = SEMUA.length - tersisa.length, gm = w.querySelector('.gerbang .muted'); if (gm) gm.textContent = terpasang + ' dari ' + SEMUA.length + ' murid sudah punya kelompok.' + (terpasang < SEMUA.length ? ' Murid yang belum punya kelompok akan diminta menghubungi guru.' : ''); pb.append(el('div', { kelas: 'kb-pool-kep' }, el('b', null, 'Belum punya kelompok'), el('span', { kelas: 'chip ' + (tersisa.length ? 'warn' : 'ok') }, tersisa.length + ' murid')), el('div', { kelas: 'kb-pool-isi', 'data-tujuan': 'bebas' }, tersisa.length ? tersisa.map(chip) : el('div', { kelas: 'muted kecil tengah', gaya: 'padding:1rem' }, 'Semua murid sudah punya kelompok.')));
      pb.dataset.tujuan = 'bebas';
      papan.forEach((g, gi) => { const f = jenis[gi % 7]; const kartu = el('div', { kelas: 'kb-grup fx-' + f + (dipilih !== null ? ' siap' : '') + (aktifG === gi ? ' aktif' : ''), 'data-tujuan': String(gi), onclick: (e) => { if (e.target.closest('.kb-chip')) return; if (dipilih !== null) pindah(dipilih, String(gi)); else { aktifG = aktifG === gi ? null : gi; gambarPapan(); } } }, el('div', { kelas: 'kb-grup-kep', 'data-tujuan': String(gi) }, el('b', null, 'Kelompok ' + (gi + 1)), el('span', { kelas: 'chip', gaya: 'background:var(--t);color:#fff', html: UI.NAMA[f] }), el('span', { kelas: 'kb-n' }, String(g.length))), el('div', { kelas: 'kb-grup-isi', 'data-tujuan': String(gi) }, g.length ? g.map(chip) : el('div', { kelas: 'muted kecil', 'data-tujuan': String(gi) }, 'Tarik atau ketuk nama ke sini'))); gr.append(kartu); });
    }
    function badan() {
      const buka = data && data.kelasBuka;
      w.innerHTML = ''; const total = papan.reduce((a, g) => a + g.length, 0);
      const kep = el('div', { kelas: 'kb-kep' }, el('div', null, el('div', { kelas: 'eyebrow' }, BS.cfg(kelas).nama + ' · ' + J + ' kelompok'), el('h2', { gaya: 'margin:0' }, 'Susun kelompok')), el('div', { kelas: 'kb-aksi' },
        el('span', { kelas: 'kb-status muted kecil' }, status),
        el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('nyala', 'kecil') + 'Isi sisanya', onclick: () => { bebas().forEach((i) => { const g = papan.reduce((m, x, k) => (x.length < papan[m].length ? k : m), 0); papan[g].push(i); }); kirimSimpan(); gambarPapan(); } }),
        el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('hapus', 'kecil') + 'Kosongkan', onclick: async () => { if (await UI.konfirmasi('Kosongkan semua kelompok?', '<p class="tengah">Semua nama dikembalikan ke daftar “belum punya kelompok”.</p>', 'Ya, kosongkan', 'Batal')) { papan = Array.from({ length: J }, () => []); kirimSimpan(); gambarPapan(); } } }),
        el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('salin', 'kecil') + 'Simpan kelompok', onclick: simpanArsipM }),
        el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('buku', 'kecil') + 'Muat tersimpan', onclick: muatArsipM }),
        el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kirim', 'kecil') + 'Unduh PDF', onclick: () => Cetak.kelompok(papan.map((g) => g.map((i) => ({ idx: i, nama: BS.nama(i) }))), { kelas: BS.cfg(kelas).nama, manual: true, jigsaw: BS.cfg(kelas).jigsaw }) })));
      const gerbang = el('div', { kelas: 'kartu gerbang ' + (buka ? 'buka' : 'kunci') }, el('span', { kelas: 'ubin ' + (buka ? 'fx-garis' : 'fx-tangga'), html: ik(buka ? 'centang' : 'gembok') }), el('div', { gaya: 'flex:1' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Pintu masuk murid'), el('h3', { gaya: 'margin:0;font-size:1.4rem' }, buka ? 'Kelas DIBUKA. Murid bisa memilih nama dan mulai.' : 'Kelas TERTUTUP. Murid menunggu di layar “guru sedang menyiapkan kelompok”.'), el('div', { kelas: 'muted' }, total + ' dari ' + SEMUA.length + ' murid sudah punya kelompok.' + (total < SEMUA.length ? ' Murid yang belum punya kelompok akan diminta menghubungi guru.' : ''))),
        el('button', { kelas: 'btn besar ' + (buka ? 'sekunder' : 'hijau denyut-h'), type: 'button', html: ik(buka ? 'gembok' : 'nyala') + (buka ? 'Tutup kelas' : 'Buka kelas untuk murid'), onclick: async () => { const tot = papan.reduce((a, g) => a + g.length, 0); await simpanSekarang(); if (!buka && tot === 0) { UI.toast('Susun kelompok dulu', 'awas'); return; } if (!buka && tot < SEMUA.length && !(await UI.konfirmasi('Masih ada murid tanpa kelompok', '<p class="tengah">' + (SEMUA.length - tot) + ' murid belum ditempatkan. Tetap buka kelas?</p>', 'Ya, buka', 'Kembali'))) return; await ga('g-kelas', { buka: !buka }); await muatStatus(); badan(); } }),
        el('button', { kelas: 'btn bahaya kecil', type: 'button', html: ik('hapus', 'kecil') + 'Atur ulang kelas', title: 'Hapus kelompok dan hasil tes; murid harus tes lagi', onclick: async () => { if (await UI.konfirmasi('Atur ulang kelas ' + BS.cfg(kelas).nama + '?', '<p class="tengah">Kelompok dan <b>semua hasil tes</b> dihapus, kelas ditutup kembali. Murid harus mengerjakan tes awal lagi. Kelompok yang sudah diarsipkan tidak ikut terhapus.</p>', 'Ya, atur ulang', 'Batal')) { await ga('g-reset-semua'); papan = Array.from({ length: J }, () => []); dipilih = null; status = 'Diatur ulang'; await muatStatus(); badan(); } } }));
      const papanEl = el('div', { kelas: 'kb-papan' }, el('div', { kelas: 'kb-pool kartu' }), el('div', { kelas: 'kb-grid' })); w.append(kep, gerbang, el('div', { kelas: 'muted kecil', gaya: 'margin:.2rem 0 .4rem' }, 'Cara cepat: ketuk sebuah kelompok sampai berwarna, lalu ketuk nama-nama anggotanya satu per satu. Bisa juga menarik nama (tahan lalu geser) ke kelompok. Perubahan tersimpan otomatis.'), papanEl); gambarPapan();
    }
    async function simpanArsipM() { await ga('g-set-kelompok', { kel: papan }); const r = await ga('g-simpan-kelompok', { label: BS.cfg(kelas).nama + ' · ' + new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }); UI.toast(r.ok ? 'Kelompok disimpan di arsip' : 'Belum ada kelompok untuk disimpan', r.ok ? 'centang' : 'awas'); }
    async function muatArsipM() {
      const r = await ga('g-arsip'); if (!r.ok) { UI.toast('Gagal membaca arsip', 'awas'); return; } const isi = el('div', { kelas: 'arsip' }); let tutupFn = null;
      const arsip = (r.arsip || []).filter((x) => x.label !== 'otomatis'); if (!arsip.length) isi.append(el('p', { kelas: 'muted tengah' }, 'Belum ada kelompok tersimpan. Tekan “Simpan kelompok” untuk menyimpan susunan sekarang.'));
      arsip.forEach((x) => isi.append(el('div', { kelas: 'arsip-baris' }, el('div', { gaya: 'flex:1' }, el('b', null, x.label), el('div', { kelas: 'muted kecil' }, x.n + ' kelompok · ' + x.total + ' murid')), el('button', { kelas: 'btn kecil', type: 'button', html: 'Muat', onclick: async () => { const m = await ga('g-muat-kelompok', { id: x.id }); if (m.ok) { papan = Array.from({ length: J }, (_, k) => ((x.kel[k] || []).map((s) => s.idx))); status = 'Dimuat ✓'; if (tutupFn) tutupFn(true); await muatStatus(); badan(); } } }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('hapus', 'kecil'), 'aria-label': 'Hapus', onclick: async () => { await ga('g-hapus-arsip', { id: x.id }); UI.toast('Dihapus', 'info'); if (tutupFn) tutupFn(true); } }))));
      UI.dialog({ lebar: true, judul: 'Kelompok tersimpan', ikon: ik('buku', 'besar'), isi, tombol: [{ t: 'Tutup', nilai: null, kelas: 'sekunder' }], tutupLuar: true, saatBuka: (b, t) => { tutupFn = t; } });
    }
    async function muatStatus() { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; if (!muatAwal) { muatAwal = true; if (r.kelompok) papan = Array.from({ length: J }, (_, k) => ((r.kelompok[k] || []).map((x) => x.idx))); status = 'Tersimpan ✓'; badan(); } else { const g = w.querySelector('.kb-grup-kep'); } } else net = 'offline'; }
    await muatStatus(); poll = setInterval(async () => { const buka0 = data && data.kelasBuka; await muatStatus(); if (data && data.kelasBuka !== buka0) badan(); }, 5000);
  }

  /* ---------------- tahap lanjutan: langkah, pemahaman, panggung kelas ---------------- */
  const LANG = () => ['Kartu pakar', 'Pameran pakar', 'Tebak bagiannya', 'Cocokkan masalah', 'Tantangan sintesis', 'Tiket keluar'];
  function konfeti(n) { for (let i = 0; i < n; i++) { const c = el('div', { kelas: 'konfeti', gaya: 'left:' + (innerWidth * (.2 + Math.random() * .6)) + 'px;top:' + (innerHeight * .25) + 'px;background:' + ['#F3A64B', '#0F766E', '#2FA36B', '#BE3455', '#3B6FD6', '#E08A1E'][i % 6] }); document.body.append(c); const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 360; anim(c, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 220) + 'px) rotate(' + Math.random() * 720 + 'deg)', opacity: 0 }], { duration: 1400 + Math.random() * 1000, easing: 'cubic-bezier(.2,.7,.3,1)' }).then(() => c.remove()); } }
  function panggungKelas(t) {
    const grup = (t.grup || []).filter((g) => g.n > 0).sort((a, b) => b.rata - a.rata), orang = (t.peringkat || []).slice(0, 10);
    if (!grup.length && !orang.length) { UI.info('Belum ada poin', '<p class="tengah">Poin muncul setelah siswa mengerjakan langkah di tahap lanjutan.</p>', 'Tutup'); return; }
    const seq = grup.map((g, i) => ({ jenis: 'g', i })).reverse().concat(orang.map((o, i) => ({ jenis: 'o', i })).reverse()), isi = el('div', { kelas: 'panggung-kelas' });
    const kolG = el('div', { kelas: 'pk-kol' }, el('h3', null, 'Kelompok terbaik'), el('div', { kelas: 'muted kecil' }, 'Rata-rata poin per siswa')), kolO = el('div', { kelas: 'pk-kol' }, el('h3', null, 'Bintang kelas'), el('div', { kelas: 'muted kecil' }, 'Poin tertinggi perorangan'));
    const medali = ['#F5B700', '#B8BECF', '#C9803A'];
    grup.forEach((g, i) => kolG.append(el('div', { kelas: 'pk-baris sembunyi', 'data-k': 'g' + i, html: '<span class="rk" style="background:' + (medali[i] || '#0F766E') + '">' + (i + 1) + '</span><b>Kelompok ' + g.kel + '</b><span class="muted kecil">' + g.n + ' siswa</span><span class="pt">' + Math.round(g.rata) + ' <small>rata-rata</small></span>' })));
    orang.forEach((o, i) => kolO.append(el('div', { kelas: 'pk-baris sembunyi', 'data-k': 'o' + i, html: '<span class="rk" style="background:' + (medali[i] || '#0F766E') + '">' + (i + 1) + '</span><b>' + esc(o.nama) + '</b><span class="muted kecil">' + (o.kel ? 'K' + o.kel : '') + (o.lencana && o.lencana.length ? ' · ' + o.lencana.length + ' lencana' : '') + '</span><span class="pt">' + o.poin + ' <small>poin</small></span>' })));
    isi.append(kolG, kolO); let n = 0;
    const tampil = () => { const x = seq[n++]; const e = isi.querySelector('[data-k="' + x.jenis + x.i + '"]'); if (e) { e.classList.remove('sembunyi'); anim(e, [{ transform: 'translateY(1.2rem) scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' }); } if (x.i === 0) konfeti(x.jenis === 'o' ? 110 : 60); };
    const bMaju = el('button', { kelas: 'btn hijau', type: 'button', html: 'Tampilkan berikutnya' + ik('panah', 'kecil'), onclick: () => { if (n < seq.length) tampil(); if (n >= seq.length) { bMaju.disabled = true; bSemua.disabled = true; } } }), bSemua = el('button', { kelas: 'btn sekunder', type: 'button', html: 'Tampilkan semua', onclick: () => { while (n < seq.length) tampil(); bMaju.disabled = true; bSemua.disabled = true; } });
    const wrap = el('div', null, el('div', { kelas: 'baris', gaya: 'justify-content:center;margin-bottom:.8rem' }, bSemua, bMaju), isi);
    return UI.dialog({ lebar: true, judul: 'Panggung Kelas', ikon: ik('bintang', 'besar'), isi: wrap, tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }] });
  }
  /* kendali Pameran Pakar: guru mengumumkan Putaran 1–3 dan Transfer ilmu 1–2; tablet murid ikut menampilkan rute */
  const FASE = ['Belum dimulai', 'Putaran 1', 'Putaran 2', 'Putaran 3', 'Transfer ilmu 1', 'Transfer ilmu 2'];
  function panelPameran(t) {
    const r = (data && data.pameran) || 0, kel = (data && data.kelompok) || [], aktif = (t.aktif || []).indexOf(2) >= 0, nama = (g, p) => { const a = kel[g - 1]; return a && a[p] ? a[p].nama.split(' ').slice(0, 2).join(' ') : '–'; };
    const ke = async (n, mulai) => { const x0 = await ga('g-pameran', { n }); if (!x0.ok) UI.toast('Gagal menyimpan. Periksa koneksi.', 'awas'); if (mulai) { const ti = TAHAP.findIndex((x) => x.pameran === n); if (ti >= 0) tmPilih(ti, true); } const x = await ga('g-status'); if (x.ok) data = x; if (tab === 't2') { const p = document.querySelector('.pam-guru'); if (p) p.replaceWith(panelPameran((data && data.tahap2) || t)); } gambarAtas(); };
    const kartu = el('div', { kelas: 'kartu pam-guru' }), atas = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;gap:.8rem;flex-wrap:wrap' });
    atas.append(el('div', { gaya: 'min-width:0' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Pameran pakar (jigsaw) · ' + (((data && data.tahap2 && data.tahap2.peranJaga) || 0)) + ' Host, ' + (((data && data.tahap2 && data.tahap2.peranKelana) || 0)) + ' Penjelajah sudah memilih peran'), el('b', { gaya: 'font-size:1.2rem' }, 'Tahap yang diumumkan: ' + FASE[Math.min(5, r)]), el('div', { kelas: 'muted kecil' }, aktif ? 'Pilih tahap di bawah. Tablet murid menampilkan rute (putaran) atau bahan mengajar (transfer) dalam ±4 detik, dan pewaktu ikut berpindah.' : 'Buka langkah 2 dulu agar murid bisa masuk ke Pameran pakar.')),
      el('div', { kelas: 'baris', gaya: 'gap:.4rem;flex-wrap:wrap;justify-content:flex-end' }, [1, 2, 3, 4, 5].map((n) => el('button', { kelas: 'btn kecil ' + (r === n ? 'hijau' : 'sekunder'), type: 'button', onclick: () => ke(n, true) }, FASE[n])), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: 'Ulang', onclick: () => ke(0, false) })));
    kartu.append(atas);
    if (r >= 1 && r <= 3 && kel.length) { const meja = el('div', { kelas: 'pam-meja' }); for (let h = 1; h <= BS.NPOS; h++) { const tm = BS.tamuMeja(h, r); meja.append(el('div', { kelas: 'pm fx-' + BS.bagianKelompok(h - 1), html: '<b>Pos ' + h + '</b><span class="muted kecil">Host ' + esc(nama(h, 0)) + '</span><span class="kecil">← A: ' + esc(nama(tm.A, 1)) + ' (K' + tm.A + ')</span><span class="kecil">← B: ' + esc(nama(tm.B, 2)) + ' (K' + tm.B + ')</span>' })); } kartu.append(meja); }
    else if (r >= 4) kartu.append(el('div', { kelas: 'muted', gaya: 'margin-top:.4rem' }, r === 4 ? 'Penjelajah A mengajarkan 3 pos yang ia kunjungi kepada Host dan Penjelajah B.' : 'Penjelajah B mengajarkan 3 pos yang ia kunjungi kepada Host dan Penjelajah A.'));
    return kartu;
  }
  async function tTahap2() {
    const w = el('div', { kelas: 'pantau' }); pg.append(w);
    const render = () => {
      w.innerHTML = ''; if (net !== 'online' || !data || !data.tahap2) { w.append(el('div', { kelas: 'tengah-isi' }, el('h2', null, 'Perlu server'), el('p', { kelas: 'muted' }, 'Pemantauan tahap lanjutan hanya tersedia saat server terhubung.'))); return; }
      const t = data.tahap2, fmt = (v, d) => (v == null ? '–' : v.toFixed(d == null ? 1 : d).replace('.', ',')), lk = t.langkah || 1;
      const aktifL = Array.isArray(t.aktif) ? t.aktif : [1].filter((n) => n <= lk), sel = t.selStep || LANG().map(() => 0);
      const ctrl = el('div', { kelas: 'kartu ctrl-langkah' }); ctrl.append(el('div', { gaya: 'max-width:15rem' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Buka / tutup langkah'), el('div', { kelas: 'muted kecil' }, 'Tiap langkah punya tombolnya sendiri. Kondisinya tersimpan di server dan tidak berubah saat kamu pindah tab.')));
      const baris = el('div', { kelas: 'langkah-guru' });
      LANG().forEach((nm, i) => { const n = i + 1, buka = aktifL.indexOf(n) >= 0, pct = Math.min(100, Math.round(sel[i] / ((data && data.daftar && data.daftar.length) || NSISWA()) * 100));
        const toggle = async () => { const baru = !buka; data.tahap2.aktif = baru ? aktifL.concat([n]).sort() : aktifL.filter((x) => x !== n); render(); const r = await ga('g-langkah', { n, buka: baru }); if (!r.ok) UI.toast('Gagal menyimpan. Periksa koneksi.', 'awas'); else { UI.toast('Langkah ' + n + (baru ? ' dibuka' : ' ditutup') + ' untuk siswa', baru ? 'centang' : 'info'); const ti = TAHAP.findIndex((x) => x.langkah === n && x.pameran !== 2 && x.pameran !== 3 && x.pameran !== 4 && x.pameran !== 5); if (baru && !TM.jalan && ti >= 0 && TM.i !== ti) tmPilih(ti, false); } muat(); };
        baris.append(el('div', { kelas: 'lg ' + (buka ? 'buka' : 'tutup') }, el('div', { kelas: 'lg-kep' }, el('span', { kelas: 'no' }, String(n)), el('b', null, nm), el('span', { kelas: 'chip ' + (buka ? 'ok' : 'abu'), html: buka ? 'TERBUKA' : 'TERTUTUP' })), el('div', { kelas: 'lg-bar' }, el('i', { gaya: 'width:' + pct + '%' })), el('div', { kelas: 'muted kecil' }, 'selesai ' + sel[i] + ' dari ' + ((data && data.daftar && data.daftar.length) || NSISWA()) + ' siswa'), el('button', { kelas: 'btn ' + (buka ? 'sekunder' : 'hijau'), type: 'button', html: ik(buka ? 'gembok' : 'nyala', 'kecil') + (buka ? 'Tutup langkah ' : 'Buka langkah ') + n, onclick: toggle })));
      });
      ctrl.append(baris, el('div', { kelas: 'lg-samping' }, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: 'Buka semua', onclick: async () => { await ga('g-langkah', { n: 1, semua: true }); muat(); } }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: 'Tutup semua', onclick: async () => { await ga('g-langkah', { n: 1, semua: false }); muat(); } }), el('button', { kelas: 'btn sorot kecil', type: 'button', html: ik('bintang', 'kecil') + 'Panggung Kelas', onclick: () => panggungKelas(t) }))); w.append(ctrl); if (JIG()) w.append(panelPameran(t));
      w.append(el('div', { kelas: 'stat-guru' }, el('div', { kelas: 'kartu stat fx-garis', html: '<div class="eyebrow" style="margin:0">Selesai tahap lanjutan</div><b>' + t.selesai + '/' + NSISWA() + '</b>' }), el('div', { kelas: 'kartu stat fx-parab', html: '<div class="eyebrow" style="margin:0">Tebak bagiannya</div><b>' + fmt(t.diskusi) + ' / 6</b>' }), el('div', { kelas: 'kartu stat fx-potong', html: '<div class="eyebrow" style="margin:0">Cocokkan masalah</div><b>' + fmt(t.cocok) + ' / 5</b>' }), el('div', { kelas: 'kartu stat fx-bawah', html: '<div class="eyebrow" style="margin:0">Tiket keluar</div><b>' + fmt(t.tiket) + ' / 3</b>' })));
      const k = el('div', { kelas: 'kartu gulir', gaya: 'flex:1;min-height:0' }); k.append(el('h3', null, 'Pemahaman per bagian materi'), el('p', { kelas: 'muted kecil' }, 'Dari refleksi akhir siswa: bagian yang dikuasai dan yang masih membingungkan. Bagian dengan banyak “bingung” layak dibahas ulang.'));
      const maks = Math.max(1, ...Object.values(t.agr).map((x) => x.kuasai + x.bingung));
      UI.URUT.forEach((f) => { const x = t.agr[f]; k.append(el('div', { kelas: 'baris fx-' + f, gaya: 'margin:.45rem 0' }, el('div', { html: UI.ubin(f) }).firstChild, el('b', { gaya: 'width:11rem;color:var(--td)' }, UI.NAMA[f]), el('div', { kelas: 'bar-pemahaman' }, el('i', { kelas: 'p', gaya: 'width:' + (x.kuasai / maks * 100) + '%' }), el('i', { kelas: 'b', gaya: 'width:' + (x.bingung / maks * 100) + '%' })), el('span', { kelas: 'chip ok' }, 'dikuasai ' + x.kuasai), el('span', { kelas: 'chip warn' }, 'bingung ' + x.bingung))); });
      w.append(k);
    };
    async function muat() { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } else net = 'offline'; render(); }
    await muat(); poll = setInterval(muat, 4000);
  }

  /* ---------------- kode hasil ---------------- */
  function tKode() {
    const w = el('div', { kelas: 'kode-wrap' }); pg.append(w);
    const render = () => {
      const h = hasilLokal(), ids = Object.keys(h).map(Number).sort((a, b) => a - b); w.innerHTML = '';
      w.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.6rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Untuk siswa yang tidak bisa mengirim'), el('h2', { gaya: 'margin:0' }, 'Masukkan kode hasil siswa')), el('div', { kelas: 'baris' }, el('button', { kelas: 'btn besar', type: 'button', html: ik('pensil') + 'Masukkan kode', onclick: tambah }), ids.length ? el('button', { kelas: 'btn sekunder', type: 'button', html: ik('hapus', 'kecil') + 'Kosongkan daftar', onclick: () => { LSset('hasil', {}); render(); } }) : null)));
      if (!ids.length) { w.append(el('div', { kelas: 'tengah-isi' }, el('p', { kelas: 'muted', gaya: 'font-size:1.2rem' }, 'Belum ada kode. Ketuk “Masukkan kode”, lalu ketik 5 karakter dari layar siswa.'))); return; }
      const grid = el('div', { kelas: 'grid-pantau' }); ids.forEach((i) => grid.append(el('div', { kelas: 'tile-pantau selesai fx-' + warna[i % 7], html: '<span class="av">' + inisial(B.nama(i)) + '</span><span class="nm">' + esc(B.nama(i)) + '</span><span class="st">skor ' + h[i] + '/5</span>' }))); w.append(el('div', { kelas: 'muted kecil', gaya: 'margin-bottom:.4rem' }, ids.length + ' siswa tercatat'), grid);
    };
    async function tambah() {
      for (;;) {
        const k = await UI.papanKetik({ judul: 'Kode hasil siswa', ikon: ik('salin', 'besar'), panjang: 5, otomatis: true, keyboard: true, kolom: 8, catatan: 'Ketik 5 karakter dari layar siswa (keyboard atau papan di layar).' }); if (!k) break;
        const r = B.bacaKode(k); if (r.error) { await UI.info('Kode ditolak', '<p class="tengah" style="font-size:1.2rem">' + esc(r.error) + '</p>', 'Coba lagi'); continue; }
        const n = B.nilai(r.idx, r.jawab); const h = hasilLokal(); h[r.idx] = n.benar; LSset('hasil', h); if (net === 'online') await ga('g-kode', { kode: k });
        const lagi = await UI.dialog({ judul: 'Kode diterima', ikon: ik('centang', 'besar'), isi: '<div class="tengah"><div style="font-family:var(--tampil);font-size:2rem;font-weight:700">' + esc(B.nama(r.idx)) + '</div><p style="font-size:1.5rem">Skor <b>' + n.benar + '</b> dari 5</p></div>', tombol: [{ t: 'Selesai', nilai: false, kelas: 'sekunder' }, { t: 'Kode berikutnya', nilai: true }] }); render(); if (!lagi) break;
      }
      render();
    }
    render();
  }

  /* ---------------- pengatur waktu per tahap ---------------- */
  /* Tahap pewaktu mengikuti rancangan 3 JP (135 menit): Sesi 1 = 90 menit, istirahat, Sesi 2 = 45 menit. durasi dalam detik; langkah → buka langkah; pameran → umumkan fase */
  const buatTahap = () => [
    { nama: 'Penjelasan (apersepsi dan materi inti)', dur: 1020, tab: 'penjelasan' }, { nama: 'Tes awal', dur: 600, tab: 'pantau' }, { nama: 'Kelompok', dur: 300, tab: 'kelompok' },
    { nama: 'Langkah 1 · Kartu pakar', dur: 900, tab: 't2', langkah: 1 },
    { nama: 'Langkah 2 · Putaran 1', dur: 600, tab: 't2', langkah: 2, pameran: 1 }, { nama: 'Langkah 2 · Putaran 2', dur: 600, tab: 't2', langkah: 2, pameran: 2 }, { nama: 'Langkah 2 · Putaran 3', dur: 600, tab: 't2', langkah: 2, pameran: 3 },
    { nama: 'Langkah 2 · Transfer ilmu 1', dur: 720, tab: 't2', langkah: 2, pameran: 4 }, { nama: 'Istirahat sekolah', dur: 900, tab: 't2' },
    { nama: 'Langkah 2 · Transfer ilmu 2', dur: 720, tab: 't2', langkah: 2, pameran: 5 },
    { nama: 'Langkah 3 · Tebak bagiannya', dur: 360, tab: 't2', langkah: 3 }, { nama: 'Langkah 4 · Cocokkan masalah', dur: 300, tab: 't2', langkah: 4 },
    { nama: 'Langkah 5 · Tantangan sintesis', dur: 900, tab: 't2', langkah: 5 }, { nama: 'Langkah 6 · Tiket keluar dan refleksi', dur: 420, tab: 't2', langkah: 6 }
  ];
  let TAHAP = buatTahap();
  const muatTM = () => Object.assign({ i: 0, sisa: TAHAP[0].dur, jalan: false, akhir: 0, dur: {}, habis: false }, LS('timer_' + kelas, {}));
  let TM = muatTM();
  const durasi = (i) => (TM.dur && TM.dur[i]) || TAHAP[i].dur, sisaNow = () => (TM.jalan ? Math.max(0, Math.round((TM.akhir - Date.now()) / 1000)) : TM.sisa), simpanTM = () => LSset('timer_' + kelas, TM);
  const mmss = (v) => String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
  function tmMulai() { if (!TM.jalan) { if (TM.sisa <= 0) TM.sisa = durasi(TM.i); TM.akhir = Date.now() + TM.sisa * 1000; TM.jalan = true; TM.habis = false; simpanTM(); } }
  function tmJeda() { if (TM.jalan) { TM.sisa = sisaNow(); TM.jalan = false; simpanTM(); } }
  function tmSet(detik, mulai) { TM.sisa = detik; TM.jalan = false; TM.habis = false; simpanTM(); if (mulai) tmMulai(); tmTick(); }
  function tmTambah(d) { const v = Math.max(0, sisaNow() + d); if (TM.jalan) TM.akhir = Date.now() + v * 1000; else TM.sisa = v; TM.habis = v <= 0 && TM.habis; if (v > 0) TM.habis = false; simpanTM(); }
  function tmPilih(i, mulai) { TM.i = i; TM.sisa = durasi(i); TM.jalan = false; TM.habis = false; simpanTM(); if (mulai) tmMulai(); tmTick(); }
  function beep() { try { const A = new (window.AudioContext || window.webkitAudioContext)(); [0, .38, .76].forEach((t) => { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = 880; g.gain.value = .18; o.connect(g); g.connect(A.destination); o.start(A.currentTime + t); o.stop(A.currentTime + t + .24); }); } catch (e) { /* abaikan */ } }
  function tmChip() { return el('button', { kelas: 'tm-chip', type: 'button', title: 'Pengatur waktu: ' + TAHAP[TM.i].nama, html: ik('jam', 'kecil') + '<span class="tm-live">' + mmss(sisaNow()) + '</span>', onclick: panelWaktu }); }
  function tmTick() {
    const v = sisaNow(); document.querySelectorAll('.tm-live').forEach((e) => { e.textContent = mmss(v); });
    document.querySelectorAll('.tm-chip').forEach((c) => { c.classList.toggle('jalan', TM.jalan && v > 60); c.classList.toggle('hampir', TM.jalan && v <= 60 && v > 0); c.classList.toggle('habis', v <= 0 && TM.habis); c.title = 'Pengatur waktu: ' + TAHAP[TM.i].nama; });
    if (TM.jalan && v <= 0 && !TM.habis) { TM.jalan = false; TM.sisa = 0; TM.habis = true; simpanTM(); beep(); popupHabis(); }
  }
  async function pindahTahap(i) {
    if (i >= TAHAP.length) { tmJeda(); ke('t2'); setTimeout(() => { if (data && data.tahap2) panggungKelas(data.tahap2); }, 800); return; }
    const t = TAHAP[i]; if (t.langkah) await ga('g-langkah', { n: t.langkah, buka: true }); if (t.pameran != null) await ga('g-pameran', { n: t.pameran }); if (t.pameran != null || t.langkah) { const x = await ga('g-status'); if (x.ok) data = x; } ke(t.tab); tmPilih(i, true); UI.toast('Pewaktu berjalan: ' + t.nama, 'jam');
  }
  let popupAktif = false;
  async function popupHabis() {
    if (popupAktif) return; popupAktif = true; const i = TM.i, akhir = i >= TAHAP.length - 1, nx = akhir ? null : TAHAP[i + 1];
    const v = await UI.dialog({ judul: 'Waktu habis', ikon: ik('jam', 'besar'), isi: '<div class="tengah"><p style="font-size:1.4rem;margin:.2rem 0"><b>' + esc(TAHAP[i].nama) + '</b> sudah melewati waktunya.</p><p class="muted">Tambah waktu bila perlu, atau lanjutkan ke ' + (akhir ? 'penutup (Panggung Kelas).' : '<b>' + esc(nx.nama) + '</b>.') + '</p></div>', tombol: [{ t: '+1 menit', nilai: 'm1', kelas: 'sekunder' }, { t: '+5 menit', nilai: 'm5', kelas: 'sekunder' }, { t: akhir ? 'Buka Panggung Kelas' : 'Lanjut: ' + nx.nama, nilai: 'lanjut', ikon: 'panah' }] });
    popupAktif = false; if (v === 'm1' || v === 'm5') { tmTambah(v === 'm1' ? 60 : 300); tmMulai(); } else if (v === 'lanjut') pindahTahap(i + 1); else { /* ditutup */ }
  }
  function panelWaktu() {
    const isi = el('div', { kelas: 'panel-waktu' });
    const gambar = () => {
      isi.innerHTML = ''; const pil = el('div', { kelas: 'tm-tahap' });
      TAHAP.forEach((t, i) => pil.append(el('button', { type: 'button', kelas: i === TM.i ? 'aktif' : '', onclick: () => { tmPilih(i, false); gambar(); } }, t.nama)));
      const besar = el('div', { kelas: 'tm-besar' + (TM.habis ? ' habis' : '') }, el('span', { kelas: 'tm-live' }, mmss(sisaNow())));
      const sel = (lab, d) => el('button', { kelas: 'btn sekunder', type: 'button', onclick: () => { tmTambah(d); tmTick(); gambar(); } }, lab);
      isi.append(el('div', { kelas: 'eyebrow' }, 'Tahap'), pil, besar, el('div', { kelas: 'baris tm-atur' }, sel('−5 mnt', -300), sel('−1 mnt', -60), sel('−30 dtk', -30), sel('+30 dtk', 30), sel('+1 mnt', 60), sel('+5 mnt', 300)),
        el('div', { kelas: 'baris', gaya: 'justify-content:center;margin-top:.8rem' }, el('button', { kelas: 'btn ' + (TM.jalan ? 'sorot' : 'hijau'), type: 'button', html: ik(TM.jalan ? 'jam' : 'main') + (TM.jalan ? 'Jeda' : (TM.sisa <= 0 ? 'Mulai ulang' : 'Mulai')), onclick: () => { if (TM.jalan) tmJeda(); else tmMulai(); tmTick(); gambar(); } }),
          el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang', 'kecil') + 'Atur ulang', onclick: () => { tmPilih(TM.i, false); gambar(); } }),
          el('button', { kelas: 'btn sekunder', type: 'button', html: ik('centang', 'kecil') + 'Jadikan bawaan tahap ini', onclick: () => { TM.dur[TM.i] = Math.max(30, sisaNow() || durasi(TM.i)); simpanTM(); UI.toast('Durasi bawaan ' + TAHAP[TM.i].nama + ': ' + mmss(TM.dur[TM.i]), 'centang'); } }),
          el('button', { kelas: 'btn', type: 'button', html: (TM.i >= TAHAP.length - 1 ? 'Selesai' : 'Lanjut ke tahap berikutnya') + ik('panah', 'kecil'), onclick: () => { document.querySelector('.panel-waktu').closest('.tirai').querySelector('.kaki .btn').click(); pindahTahap(TM.i + 1); } })));
    };
    gambar(); return UI.dialog({ lebar: true, judul: 'Pengatur waktu', ikon: ik('jam', 'besar'), isi, tombol: [{ t: 'Tutup', nilai: null, kelas: 'sekunder' }], tutupLuar: true });
  }
  setInterval(tmTick, 250);

  async function mintaPin(salah) {
    const v = await UI.papanKetik({ judul: 'PIN guru', ikon: ik('kunci', 'besar'), panjang: 5, alfabet: '0123456789', kolom: 5, sembunyi: true, otomatis: true, keyboard: true, catatan: salah ? 'PIN salah. Coba lagi.' : 'Masukkan PIN guru (5 angka).' });
    if (v == null) { location.href = 'index.html'; return; } pin = v; const r = await ga('g-status'); if (r._s === 401) return mintaPin(true); if (r.ok) { net = 'online'; data = r; } else { net = 'offline'; if (!B.cekPinLokal(pin)) return mintaPin(true); } try { sessionStorage.setItem('acg_pin', pin); } catch (e) { /* abaikan */ } gambarAtas(); masukKelas(tab);
  }
  UI.pasangPutar(); gambarAtas(); bawah.style.display = 'none';
  (async () => { const c = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 'cek' }) }).then((r) => r.json()).catch(() => ({})); let ss = ''; try { ss = sessionStorage.getItem('acg_pin') || ''; } catch (e) { /* abaikan */ }
    if (c.ok && c.penyimpanan) { net = 'online'; if (ss) { pin = ss; const r = await ga('g-status'); if (r.ok) { data = r; gambarAtas(); return masukKelas('penjelasan'); } } await mintaPin(false); } else { net = 'offline'; if (ss && B.cekPinLokal(ss)) { pin = ss; gambarAtas(); masukKelas('penjelasan'); } else await mintaPin(false); } })();
  window.gfGuru = { ke, ga: () => ga };
})();

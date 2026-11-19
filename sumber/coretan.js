/* CORETAN LAYAR untuk murid: pensil, stabilo, hapus per piksel, hapus per goresan, warna kontras, ukuran, urungkan/ulangi, reset,
   mode stylus saja (jari tidak menggores) dan penolak sentuhan ganda (mencubit untuk zoom tidak meninggalkan coretan acak).
   Coretan tersimpan per kunci (satu soal = satu kertas) selama sesi. Ikon saja, supaya hemat ruang. */
(function (root) {
  'use strict';
  const { el } = UI, NS = 'http://www.w3.org/2000/svg';
  const IKON = {
    pensil: '<path d="M4 20l1-4.5L16.5 4a2 2 0 0 1 3 3L8 18.5 4 20z"/><path d="M14 6.5l3.5 3.5"/>',
    stabilo: '<path d="M9 11l5 5M5 19h5l-1-3-4 3z"/><path d="M8 12l7.5-7.5a2 2 0 0 1 3 3L11 15"/>',
    hapusPiksel: '<path d="M8 20h11M4.6 14.4l8-8a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L12 19H8l-3.4-3.4a2 2 0 0 1 0-1.2z"/><path d="M9.5 9.5l5 5"/>',
    hapusGoresan: '<circle cx="12" cy="12" r="8"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>',
    tangan: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5v-6a1.5 1.5 0 0 1 3 0V11M14 10.5V6.5a1.5 1.5 0 0 1 3 0V13c0 4-2 7-6 7-3 0-4.5-1.5-6.2-4.3L3.4 13a1.5 1.5 0 0 1 2.4-1.7L8 14"/>',
    urung: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    ulangi: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    reset: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v6M14 11v5"/>',
    stylus: '<path d="M14.5 4.5l5 5L9 20H4v-5L14.5 4.5z"/><path d="M12 7l5 5"/>',
    jari: '<path d="M9 11V6a1.6 1.6 0 0 1 3.2 0v5M12 10.5a1.6 1.6 0 0 1 3.2 0V14c0 3-1.8 6-5 6-2.6 0-3.7-1.4-5-3.6L4 13.4a1.4 1.4 0 0 1 2.3-1.6L9 14"/>'
  };
  const ikon = (n) => '<svg viewBox="0 0 24 24" class="ik" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + IKON[n] + '</svg>';
  const WARNA = ['#0B1530', '#C23A3F', '#2A6FC4', '#1F9D6B', '#E07B00', '#7A3FC2'], UKURAN = [2.5, 5, 10];
  const S = { alat: 'pensil', warna: 0, ukuran: 1, stylus: false, aktif: false }, simpanan = new Map();
  try { const v = JSON.parse(localStorage.getItem('ac_coretan') || 'null'); if (v) Object.assign(S, v); } catch (e) { /* abaikan */ }
  S.aktif = false; const simpanS = () => { try { localStorage.setItem('ac_coretan', JSON.stringify(Object.assign({}, S, { aktif: false }))); } catch (e) { /* abaikan */ } };
  const kertas = (k) => { let d = simpanan.get(k); if (!d) { d = { goresan: [], batal: [], ulang: [] }; simpanan.set(k, d); } return d; };

  /* host: elemen berposisi relatif (kartu soal). opsi.bar: elemen tempat bilah alat diletakkan (default: pojok host) */
  function pasang(host, kunci, opsi) {
    opsi = opsi || {}; const d = kertas(kunci); if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    /* KERTAS COretan tersendiri: saat aktif, sebuah kertas (dengan alatnya) muncul di sisi kanan kartu dan isi kartu menyempit ke kiri.
       Goresan hanya terjadi di atas kertas, jadi soal, gambar, dan tombol tidak pernah tertutup coretan. */
    const cv = el('canvas', { kelas: 'cor-kanvas' }), ctx = cv.getContext('2d'), tombolBar = el('div', { kelas: 'cor-bar' }), bar = el('div', { kelas: 'cor-alat' });
    const badanPad = el('div', { kelas: 'cor-pad-badan' }, cv), pad = el('div', { kelas: 'cor-pad', hidden: true }, el('div', { kelas: 'cor-pad-kepala' }, el('div', { kelas: 'cor-pad-judul' }, 'Kertas coretan'), bar), badanPad);
    host.append(pad); (opsi.bar || host).append(tombolBar);
    let W = 0, H = 0, dpr = 1, sedang = null, ids = new Map(), tersentuh = new Set(), tekanSuprs = false, bukaWarna = false;
    const ulangGambar = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      d.goresan.forEach((g) => gambarGoresan(g)); if (sedang) gambarGoresan(sedang);
    };
    function gambarGoresan(g) {
      const p = g.t; if (!p.length) return; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = g.w * (g.mode === 'sorot' ? 3.4 : 1); ctx.strokeStyle = g.c; ctx.globalAlpha = g.mode === 'sorot' ? .32 : 1; ctx.globalCompositeOperation = g.mode === 'hapus' ? 'destination-out' : 'source-over';
      ctx.beginPath(); ctx.moveTo(p[0][0] * W, p[0][1] * H); if (p.length === 1) ctx.lineTo(p[0][0] * W + .01, p[0][1] * H); for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i]; ctx.quadraticCurveTo(a[0] * W, a[1] * H, (a[0] + b[0]) / 2 * W, (a[1] + b[1]) / 2 * H); } ctx.stroke(); ctx.restore();
    }
    const ukur = () => { const r = badanPad.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height)); dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ulangGambar(); };
    const lebarPad = () => { const w = host.getBoundingClientRect().width; if (w > 0) host.style.setProperty('--padw', Math.max(250, Math.round(w * .44)) + 'px'); };
    const ro = new ResizeObserver(() => requestAnimationFrame(() => { lebarPad(); ukur(); })); ro.observe(host); ro.observe(badanPad); lebarPad(); ukur();
    const titik = (e) => { const r = badanPad.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    const boleh = (e) => S.aktif && S.alat !== 'tangan' && (e.pointerType === 'pen' || e.pointerType === 'mouse' || (e.pointerType === 'touch' && !S.stylus));
    const jauh = (g) => { const t = g.t; let mnx = 1, mxx = 0, mny = 1, mxy = 0; t.forEach((q) => { mnx = Math.min(mnx, q[0]); mxx = Math.max(mxx, q[0]); mny = Math.min(mny, q[1]); mxy = Math.max(mxy, q[1]); }); return Math.hypot((mxx - mnx) * W, (mxy - mny) * H); };
    function hapusDekat(p) {
      const r = 14, keluar = []; d.goresan.forEach((g) => { if (g.mode === 'hapus') return; if (g.t.some((q, i) => { const a = g.t[i - 1] || q; for (let s = 0; s <= 4; s++) { const x = a[0] + (q[0] - a[0]) * s / 4, y = a[1] + (q[1] - a[1]) * s / 4; if (Math.hypot((x - p[0]) * W, (y - p[1]) * H) < r + g.w) return true; } return false; })) keluar.push(g); });
      return keluar;
    }
    let hapusBatch = null;
    function mulai(e) {
      if (!S.aktif) return;
      if (e.pointerType === 'touch') { tersentuh.add(e.pointerId); if (tersentuh.size > 1) { sedang = null; hapusBatch = null; ulangGambar(); return; } }
      if (!boleh(e)) return; if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); try { badanPad.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } tekanSuprs = false; ids.set(e.pointerId, 1);
      const p = titik(e);
      if (S.alat === 'hapusGoresan') { hapusBatch = []; const k = hapusDekat(p); k.forEach((g) => { d.goresan.splice(d.goresan.indexOf(g), 1); hapusBatch.push(g); }); ulangGambar(); return; }
      sedang = { t: [p], w: S.alat === 'hapusPiksel' ? UKURAN[S.ukuran] * 2.6 : UKURAN[S.ukuran], c: WARNA[S.warna], mode: S.alat === 'stabilo' ? 'sorot' : (S.alat === 'hapusPiksel' ? 'hapus' : 'pena') };
      ulangGambar();
    }
    function gerak(e) {
      if (e.pointerType === 'touch' && tersentuh.size > 1) { if (sedang) { sedang = null; ulangGambar(); } return; }
      if (!ids.has(e.pointerId)) return; e.preventDefault(); const p = titik(e);
      if (hapusBatch) { const k = hapusDekat(p); if (k.length) { k.forEach((g) => { d.goresan.splice(d.goresan.indexOf(g), 1); hapusBatch.push(g); }); ulangGambar(); } return; }
      if (!sedang) return; const ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (ev.length ? ev : [e]).forEach((x) => sedang.t.push(titik(x))); ulangGambar();
    }
    function selesai(e) {
      if (e.pointerType === 'touch') tersentuh.delete(e.pointerId);
      if (!ids.has(e.pointerId)) return; ids.delete(e.pointerId);
      if (hapusBatch) { if (hapusBatch.length) { d.batal.push({ hapus: hapusBatch }); d.ulang.length = 0; } hapusBatch = null; ui(); return; }
      if (!sedang) return; const g = sedang; sedang = null;
      if (jauh(g) < 6) { ulangGambar(); return; }   // ketukan biasa: bukan coretan
      tekanSuprs = true; setTimeout(() => { tekanSuprs = false; }, 80); d.goresan.push(g); d.batal.push({ tambah: g }); d.ulang.length = 0; ulangGambar(); ui();
    }
    badanPad.addEventListener('pointerdown', mulai, true); badanPad.addEventListener('pointermove', gerak, true); ['pointerup', 'pointercancel'].forEach((n) => badanPad.addEventListener(n, selesai, true));
    badanPad.addEventListener('click', (e) => { if (tekanSuprs) { e.stopPropagation(); e.preventDefault(); tekanSuprs = false; } }, true);
    badanPad.addEventListener('touchmove', (e) => { if (S.alat !== 'tangan' && (ids.size || e.touches.length > 1)) { if (e.cancelable && ids.size) e.preventDefault(); } }, { passive: false });
    const urungkan = () => { const a = d.batal.pop(); if (!a) return; if (a.tambah) d.goresan.splice(d.goresan.indexOf(a.tambah), 1); else a.hapus.forEach((g) => d.goresan.push(g)); d.ulang.push(a); ulangGambar(); ui(); };
    const ulangi = () => { const a = d.ulang.pop(); if (!a) return; if (a.tambah) d.goresan.push(a.tambah); else a.hapus.forEach((g) => { const i = d.goresan.indexOf(g); if (i >= 0) d.goresan.splice(i, 1); }); d.batal.push(a); ulangGambar(); ui(); };
    const reset = () => { if (!d.goresan.length) return; const semua = d.goresan.slice(); d.goresan.length = 0; d.batal.push({ hapus: semua }); d.ulang.length = 0; ulangGambar(); ui(); };
    const btn = (id, judul, aksi, kelas) => el('button', { kelas: 'cor-btn ' + (kelas || ''), type: 'button', title: judul, 'aria-label': judul, 'data-a': id, html: ikon(id === 'stylus' ? (S.stylus ? 'stylus' : 'jari') : id), onclick: aksi });
    function ui() {
      bar.innerHTML = ''; tombolBar.innerHTML = ''; pad.hidden = !S.aktif; host.classList.toggle('cor-dock', S.aktif); if (S.aktif) { lebarPad(); ukur(); }
      tombolBar.append(el('button', { kelas: 'cor-tog' + (S.aktif ? ' on' : ''), type: 'button', title: S.aktif ? 'Matikan coretan (coretan disembunyikan)' : 'Aktifkan coretan', 'aria-pressed': S.aktif ? 'true' : 'false', html: ikon('pensil') + '<span>' + (S.aktif ? 'Coretan aktif' : 'Coretan') + '</span>' + (S.aktif ? '<i class="cor-titik"></i>' : ''), onclick: () => { S.aktif = !S.aktif; ui(); } }));
      if (!S.aktif) { cv.style.cursor = 'default'; return; }
      const alat = [['pensil', 'Pensil'], ['stabilo', 'Stabilo'], ['hapusPiksel', 'Hapus per piksel'], ['hapusGoresan', 'Hapus per goresan'], ['tangan', 'Tangan: tidak mencoret, hanya memilih atau menggulir']];
      alat.forEach(([id, t]) => bar.append(btn(id, t, () => { S.alat = id; simpanS(); ui(); }, S.alat === id ? 'aktif' : '')));
      bar.append(el('span', { kelas: 'cor-sk' }));
      const warna = el('div', { kelas: 'cor-warna' }, WARNA.map((c, i) => el('button', { kelas: 'cor-sw' + (S.warna === i ? ' aktif' : ''), type: 'button', 'aria-label': 'Warna ' + (i + 1), gaya: 'background:' + c, onclick: () => { S.warna = i; if (S.alat === 'tangan' || S.alat.startsWith('hapus')) S.alat = 'pensil'; simpanS(); ui(); } })));
      const ukr = el('div', { kelas: 'cor-ukuran' }, UKURAN.map((u, i) => el('button', { kelas: 'cor-uk' + (S.ukuran === i ? ' aktif' : ''), type: 'button', 'aria-label': 'Ukuran ' + (i + 1), onclick: () => { S.ukuran = i; simpanS(); ui(); } }, el('i', { gaya: 'width:' + (5 + i * 4) + 'px;height:' + (5 + i * 4) + 'px' }))));
      bar.append(warna, ukr, el('span', { kelas: 'cor-sk' }));
      const u = btn('urung', 'Urungkan', urungkan), r = btn('ulangi', 'Ulangi', ulangi); u.disabled = !d.batal.length; r.disabled = !d.ulang.length; bar.append(u, r, btn('reset', 'Hapus semua coretan', reset), el('span', { kelas: 'cor-sk' }), btn('stylus', S.stylus ? 'Mode stylus: hanya pena yang mencoret (ketuk untuk memakai jari)' : 'Mode jari: jari boleh mencoret (ketuk agar hanya stylus)', () => { S.stylus = !S.stylus; simpanS(); ui(); }, S.stylus ? 'aktif' : ''));
      host.dataset.alat = S.alat; cv.style.cursor = S.alat === 'tangan' ? 'default' : 'crosshair'; badanPad.style.touchAction = S.alat === 'tangan' ? 'pan-x pan-y pinch-zoom' : 'none';
    }
    ui();
    return { lepas() { ro.disconnect(); pad.remove(); tombolBar.remove(); host.classList.remove('cor-dock'); }, urungkan, ulangi, reset, ada: () => d.goresan.length > 0 };
  }
  root.Coretan = { pasang, ikon, S };
})(window);

/* Pustaka UI kustom: ikon, glif tujuh bagian materi, dialog, papan ketik, toast, bantuan animasi. */
(function (root) {
  'use strict';
  const IK = {
    centang: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', silang: '<path d="M6 6l12 12M18 6L6 18"/>', kunci: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    siswa: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.8-4.2 3.8-6.5 7.5-6.5s6.7 2.3 7.5 6.5"/>', kelompok: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 5.3a3.4 3.4 0 0 1 0 6.4M18.5 14.8c1.8.7 2.9 2.4 3.3 5.2"/>',
    panah: '<path d="M5 12h14M13 5.5l6.5 6.5-6.5 6.5"/>', kembali: '<path d="M19 12H5M11 5.5L4.5 12l6.5 6.5"/>', jam: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.7 1.8M9.5 2.8h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>', bintang: '<path d="M12 3.2l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.4 2.8 1-6L3.2 9.6l6.1-.9L12 3.2z"/>',
    kirim: '<path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3z"/>', salin: '<rect x="9" y="9" width="11.5" height="11.5" rx="2.5"/><path d="M5.5 15.5V6.5a2 2 0 0 1 2-2h9"/>',
    awas: '<path d="M10.3 4.2L2.8 17.4a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>', main: '<path d="M7 4.5l12 7.5-12 7.5v-15z"/>',
    ulang: '<path d="M20 11a8 8 0 0 0-14.3-3.8L4 9M4 4v5h5M4 13a8 8 0 0 0 14.3 3.8L20 15M20 20v-5h-5"/>', wifi: '<path d="M2.5 9.5a14 14 0 0 1 19 0M5.8 13a9.3 9.3 0 0 1 12.4 0M9.2 16.4a4.6 4.6 0 0 1 5.6 0"/><circle cx="12" cy="19.6" r=".9"/>',
    putus: '<path d="M2.5 9.5a14 14 0 0 1 6-3.4M21.5 9.5a14 14 0 0 0-5-3M5.8 13a9.3 9.3 0 0 1 3-1.8M18.2 13a9.3 9.3 0 0 0-2.4-1.6M9.2 16.4a4.6 4.6 0 0 1 5.6 0M3 3l18 18"/>',
    layar: '<rect x="3" y="4" width="18" height="12" rx="2.5"/><path d="M8 20h8M12 16v4"/>', buku: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    hapus: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v6M14 11v5"/>', ujian: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 3h6v3H9zM9 12.5l2 2 4-4.5M9 18h6"/>',
    mata: '<path d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12s-3.6 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>', pensil: '<path d="M4 20l1-4.5L16.5 4a2 2 0 0 1 3 3L8 18.5 4 20z"/>',
    nyala: '<path d="M13 3L5 13.5h6L10.5 21 19 10h-6.2L13 3z"/>', gembok: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 7.6-1.7"/>', hapusKarakter: '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM17 9.5l-5 5M12 9.5l5 5"/>'
  };
  const ik = (n, k) => '<svg class="ik ' + (k || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (IK[n] || IK.info) + '</svg>';
  const GLIF = {
    bawah: '<path d="M3 8h26" stroke-width="2.4"/><path d="M6 8c2 18 18 18 20 0" /><path d="M9 11c2 9 12 9 14 0" opacity=".45"/>',
    potong: '<path d="M3 16h26" stroke-width="2.4"/><path d="M4 26c8 0 9-19 14-19s7 8 10 9" />',
    garis: '<path d="M4 7c4 22 20 22 24 0"/><path d="M3 13.5h26"/>',
    parab: '<path d="M4 25C9 3 23 3 28 25"/><path d="M4 7c5 22 19 22 24 0"/>',
    silang: '<path d="M3 27c9 1 9-21 13-11s8 12 13-12"/><path d="M3 26L29 6"/>',
    sumbuy: '<path d="M6 3v26" stroke-width="2.4"/><path d="M6 4c22 4 22 20 0 24"/>',
    kanan: '<path d="M9 3c-6 9-6 17 0 26"/><path d="M25 3c-14 7-14 19 0 26"/>',
    tangga: '<path d="M3 26h8v-8h8v-8h10"/>', sepotong: '<path d="M3 24L12 12"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M16 21h7"/><circle cx="16" cy="21" r="2" fill="#fff" stroke-width="2"/><path d="M24 17l5-11"/>'
  };
  const URUT = ['bawah', 'potong', 'garis', 'parab', 'silang', 'sumbuy', 'kanan'];
  const NAMA = { bawah: 'Di bawah sumbu-x', potong: 'Memotong sumbu-x', garis: 'Parabola dan garis', parab: 'Dua parabola', silang: 'Dua kurva bersilangan', sumbuy: 'Terhadap sumbu-y', kanan: 'Kanan dikurangi kiri' };
  const glif = (id) => '<svg viewBox="0 0 32 32" aria-hidden="true">' + (GLIF[id] || GLIF.bawah) + '</svg>';
  const ubin = (id) => '<span class="ubin fx-' + id + '">' + glif(id) + '</span>';
  function untaian(el) {
    const W = Math.max(320, el.clientWidth || 900), H = 74, n = Math.min(7, Math.max(5, Math.floor(W / 120))), ids = URUT.slice(0, 7);
    const pilih = []; for (let i = 0; i < n; i++) pilih.push(ids[Math.round(i * (ids.length - 1) / (n - 1))]);
    const atas = 6, kendur = 20; let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true"><path d="M-6 ' + atas + ' Q ' + (W / 2) + ' ' + (atas + 2 * kendur) + ' ' + (W + 6) + ' ' + atas + '" fill="none" stroke="#CFC7B1" stroke-width="2.4" stroke-linecap="round"/>';
    pilih.forEach((id, i) => { const t = (i + .5) / n, x = W * t, y = atas + 4 * kendur * t * (1 - t), a = Math.atan(4 * kendur * (1 - 2 * t) / W) * 180 / Math.PI, fw = 30, fh = 36;
      s += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + a.toFixed(1) + ')"><g class="bendera" style="animation-delay:-' + (i * .55).toFixed(2) + 's"><path d="M' + (-fw / 2) + ' 0H' + (fw / 2) + 'L0 ' + fh + 'Z" fill="var(--f-' + id + ')" stroke="var(--f-' + id + ')" stroke-width="6" stroke-linejoin="round"/><g transform="translate(-7 4) scale(.44)" style="color:#fff;stroke:#fff;fill:none;stroke-width:3;stroke-linecap:round">' + GLIF[id] + '</g></g></g>'; });
    el.innerHTML = s + '</svg>';
  }
  const gayaBendera = document.createElement('style'); gayaBendera.textContent = '.bendera{transform-box:fill-box;transform-origin:50% 0;animation:ayun 4.2s ease-in-out infinite alternate}@keyframes ayun{from{transform:rotate(-2.6deg)}to{transform:rotate(2.6deg)}}'; document.head.appendChild(gayaBendera);

  /* ---------- DOM mini ---------- */
  function el(tag, attrs, ...anak) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { const v = attrs[k]; if (v == null || v === false) continue; if (k === 'kelas') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'gaya') e.style.cssText = v; else e.setAttribute(k, v === true ? '' : v); }
    anak.flat().forEach((a) => { if (a != null && a !== false) e.append(a.nodeType ? a : document.createTextNode(a)); });
    return e;
  }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const faktor = () => (root.UI && root.UI.instan ? 1e6 : (root.UI ? root.UI.speed : 1));
  const tidur = (ms) => new Promise((r) => setTimeout(r, ms / faktor()));
  const anim = (e, kf, opt) => { try { const o = Object.assign({ duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }, opt), k = faktor(); o.duration = o.duration / k; if (o.delay) o.delay = o.delay / k; return e.animate(kf, o).finished; } catch (x) { return Promise.resolve(); } };

  /* token pembatal: menghentikan animasi yang sedang berjalan saat berpindah layar */
  class Batal extends Error {}
  function token() {
    const t = { batal: false, tidur(ms) { return new Promise((res, rej) => { setTimeout(() => (t.batal ? rej(new Batal()) : res()), ms / faktor()); }); }, cek() { if (t.batal) throw new Batal(); }, stop() { t.batal = true; }, async anim(e, kf, o) { const r = await anim(e, kf, o); t.cek(); return r; } };
    return t;
  }

  /* ---------- dialog ---------- */
  function dialog(o) {
    return new Promise((resolve) => {
      const tirai = el('div', { kelas: 'tirai', role: 'dialog', 'aria-modal': 'true' });
      const kotak = el('div', { kelas: 'dialog' + (o.lebar ? ' lebar' : '') });
      const tutup = (v) => { tirai.classList.add('tutup'); setTimeout(() => { tirai.remove(); resolve(v); }, 190); };
      kotak.append(el('div', { kelas: 'kepala' }, o.ikon ? el('span', { html: o.ikon }) : null, el('h3', { html: o.judul || '' }), o.tutupX ? el('button', { kelas: 'tutup-x', 'aria-label': 'Tutup', html: ik('silang'), onclick: () => tutup(null) }) : null));
      const badan = el('div', { kelas: 'badan gulir' }); if (typeof o.isi === 'string') badan.innerHTML = o.isi; else if (o.isi) badan.append(o.isi);
      kotak.append(badan);
      if (o.tombol && o.tombol.length) kotak.append(el('div', { kelas: 'kaki' }, o.tombol.map((t) => el('button', { kelas: 'btn ' + (t.kelas || ''), html: (t.ikon ? ik(t.ikon) : '') + esc(t.t), onclick: () => tutup(t.nilai === undefined ? t.t : t.nilai) }))));
      tirai.append(kotak);
      if (o.tutupLuar) tirai.addEventListener('pointerdown', (e) => { if (e.target === tirai) tutup(null); });
      document.body.append(tirai);
      if (o.saatBuka) o.saatBuka(badan, tutup);
    });
  }
  const konfirmasi = (judul, isi, ya, tidak, o) => dialog(Object.assign({ judul, isi, tombol: [{ t: tidak || 'Batal', nilai: false, kelas: 'sekunder' }, { t: ya || 'Ya', nilai: true }] }, o));
  const info = (judul, isi, tombol, o) => dialog(Object.assign({ judul, isi, tombol: [{ t: tombol || 'Mengerti', nilai: true }] }, o));
  function toast(t, ikon) { const e = el('div', { kelas: 'toast', role: 'status', html: (ikon ? ik(ikon) : '') + esc(t) }); document.body.append(e); setTimeout(() => e.remove(), 2600); }

  /* ---------- papan ketik kustom (PIN / kode) ---------- */
  const ALFA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  function papanKetik(o) {
    const panjang = o.panjang || 5, alfabet = o.alfabet || ALFA; let nilai = '';
    return new Promise((resolve) => {
      const tampil = el('div', { kelas: 'tampil' }), tuts = el('div', { kelas: 'tuts', gaya: '--kol:' + (o.kolom || 8) });
      const gambar = () => { tampil.innerHTML = ''; for (let i = 0; i < panjang; i++) tampil.append(el('div', { kelas: 'sel' + (nilai[i] ? ' isi' : '') }, o.sembunyi && nilai[i] ? '•' : (nilai[i] || ''))); };
      let tutupFn; const galat = el('div', { kelas: 'kecil', gaya: 'min-height:1.4rem;text-align:center;color:var(--koral-800);font-weight:700' });
      const tekan = (c) => { if (nilai.length < panjang) { nilai += c; gambar(); if (nilai.length === panjang && o.otomatis) tutupFn(nilai); } };
      alfabet.split('').forEach((c) => tuts.append(el('button', { kelas: 'tut', type: 'button', onclick: () => tekan(c) }, c)));
      tuts.append(el('button', { kelas: 'tut fungsi', type: 'button', html: ik('hapusKarakter'), 'aria-label': 'Hapus', onclick: () => { nilai = nilai.slice(0, -1); gambar(); } }));
      const papan = el('div', { kelas: 'papan-ketik' }, tampil, galat, tuts); gambar();
      let lepas = () => {}; if (o.keyboard) { const onKey = (e) => { if (e.ctrlKey || e.metaKey || e.altKey) return; const k = e.key; if (k === 'Backspace') { nilai = nilai.slice(0, -1); gambar(); e.preventDefault(); } else if (k === 'Escape') { tutupFn(null); } else if (k === 'Enter') { if (!o.otomatis && nilai.length === panjang) tutupFn('__ok'); } else if (k.length === 1 && alfabet.includes(k.toUpperCase())) { tekan(k.toUpperCase()); e.preventDefault(); } }; document.addEventListener('keydown', onKey, true); lepas = () => document.removeEventListener('keydown', onKey, true); }
      dialog({ judul: o.judul, isi: papan, ikon: o.ikon, tombol: [{ t: 'Batal', nilai: null, kelas: 'sekunder' }].concat(o.otomatis ? [] : [{ t: o.tombol || 'OK', nilai: '__ok' }]), tutupLuar: false, saatBuka: (b, tutup) => { tutupFn = tutup; if (o.catatan) b.prepend(el('p', { kelas: 'muted kecil tengah' }, o.catatan)); } }).then((v) => { lepas(); if (v === '__ok') resolve(nilai); else resolve(v); });
    });
  }


  /* ---------- papan angka kustom (jawaban numerik) ---------- */
  function keypadAngka(o) {
    let nilai = '';
    return new Promise((resolve) => {
      const tampil = el('div', { kelas: 'layar-angka' }), tuts = el('div', { kelas: 'tuts-angka' });
      const gambar = () => { tampil.textContent = nilai || '…'; tampil.classList.toggle('kosong', !nilai); };
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0'].forEach((c) => tuts.append(el('button', { kelas: 'tut', type: 'button', onclick: () => { if (nilai.length < 6 && !(c === '−' && nilai.length)) { nilai += c; gambar(); } } }, c)));
      tuts.append(el('button', { kelas: 'tut fungsi', type: 'button', html: ik('hapusKarakter'), 'aria-label': 'Hapus', onclick: () => { nilai = nilai.slice(0, -1); gambar(); } }));
      const isi = el('div', null, el('div', { kelas: 'teks-soal-d', html: o.tanya || '' }), tampil, tuts); gambar();
      let lepas = () => {}; let tutupFn = null; if (o.keyboard) { const onKey = (e) => { if (e.ctrlKey || e.metaKey || e.altKey) return; const k = e.key; if (/^[0-9]$/.test(k) && nilai.length < 6) { nilai += k; gambar(); e.preventDefault(); } else if ((k === '-' || k === '−') && !nilai.length) { nilai = '−'; gambar(); } else if (k === 'Backspace') { nilai = nilai.slice(0, -1); gambar(); e.preventDefault(); } else if (k === 'Enter') { const b = [...document.querySelectorAll('.dialog .btn')].find((x) => x.textContent.includes('Periksa')); if (b) b.click(); } }; document.addEventListener('keydown', onKey, true); lepas = () => document.removeEventListener('keydown', onKey, true); }
      dialog({ judul: o.judul || 'Jawabanmu', isi, ikon: o.ikon, tombol: [{ t: 'Batal', nilai: null, kelas: 'sekunder' }, { t: 'Periksa', nilai: '__ok', kelas: 'hijau', ikon: 'centang' }] }).then((v) => { lepas(); resolve(v === '__ok' ? (nilai === '' || nilai === '−' ? null : Number(nilai.replace('−', '-'))) : null); });
    });
  }

  /* ---------- seret (drag) kustom ---------- */
  function seret(elm, o) {
    let aktif = false, sx = 0, sy = 0, klon = null, pid = null, jalan = false;
    elm.style.touchAction = 'none';
    elm.addEventListener('pointerdown', (e) => { if (o.aktif && !o.aktif()) return; aktif = true; jalan = false; pid = e.pointerId; sx = e.clientX; sy = e.clientY; try { elm.setPointerCapture(pid); } catch (x) { /* abaikan */ } });
    elm.addEventListener('pointermove', (e) => {
      if (!aktif || e.pointerId !== pid) return; const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!jalan && Math.hypot(dx, dy) > 8) { jalan = true; const r = elm.getBoundingClientRect(); klon = elm.cloneNode(true); klon.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;z-index:400;pointer-events:none;transform:scale(1.08);box-shadow:0 1rem 2rem rgba(18,38,63,.3)'; document.body.append(klon); elm.style.opacity = '.35'; klon._r = r; }
      if (jalan) { klon.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.08)'; if (o.saatGerak) o.saatGerak(e.clientX, e.clientY, klon); }
    });
    const akhir = (e) => {
      if (!aktif || e.pointerId !== pid) return; aktif = false; elm.style.opacity = '';
      if (jalan) { const kena = o.jatuh ? o.jatuh(e.clientX, e.clientY) : false; if (klon) { klon.remove(); klon = null; } if (kena && o.saatJatuh) o.saatJatuh(); } else if (o.saatKetuk && e.type === 'pointerup') o.saatKetuk();
    };
    elm.addEventListener('pointerup', akhir); elm.addEventListener('pointercancel', akhir);
  }

  /* ---------- lapisan "putar tablet" + kunci orientasi ---------- */
  function pasangPutar() {
    if (document.getElementById('putar')) return;
    const d = el('div', { id: 'putar' }, el('div', { kelas: 'tablet' }), el('h2', null, 'Putar tabletmu'), el('p', null, 'Halaman ini hanya bisa dipakai dalam posisi mendatar (landscape).'));
    document.body.append(d);
    const kunciO = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* abaikan */ } };
    document.addEventListener('pointerdown', kunciO, { once: true });
  }
  async function layarPenuh() { try { const d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) await d.requestFullscreen(); if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch (e) { /* abaikan */ } }

  root.UI = { speed: 1, instan: false, IK, ik, glif, ubin, GLIF, URUT, NAMA, untaian, el, esc, tidur, anim, token, Batal, dialog, konfirmasi, info, toast, papanKetik, keypadAngka, seret, pasangPutar, layarPenuh, ALFA };
})(window);

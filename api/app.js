/* Fungsi serverless Vercel (Area & Calculus): satu titik masuk /api/app (POST {a: aksi, ...}).
   Penyimpanan: Upstash Redis lewat REST (tanpa pustaka). Variabel lingkungan yang dipakai:
   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (atau KV_REST_API_URL + KV_REST_API_TOKEN)  dan  GURU_PIN. */
const B = require('./_lib/bersama.js');
const { AsyncLocalStorage } = require('node:async_hooks');
const als = new AsyncLocalStorage();
const KELAS_OK = B.KELAS_ID, KELAS_DEF = B.KELAS_TAMPIL[0];
const keys = (kl) => ({ S: 'ac:' + kl + ':siswa', KEL: 'ac:' + kl + ':kelompok', G: 'ac:' + kl + ':gerbang', L: 'ac:' + kl + ':langkah', A: 'ac:' + kl + ':arsip', KB: 'ac:' + kl + ':kelasbuka', P: 'ac:' + kl + ':pameran', SL: 'ac:' + kl + ':slide' });
const ctx = () => als.getStore() || { kl: KELAS_DEF, K: keys(KELAS_DEF) };
const nm = (i) => B.nama(i, ctx().kl), CFG = () => B.cfg(ctx().kl), NLANGKAH = () => CFG().langkah;

// Nama variabel bisa berawalan apa pun (KV_, UPSTASH_REDIS_, STORAGE_, ...): cari yang berakhiran REST_API_URL / REST_URL dan *_TOKEN.
const cariEnv = (akhir, jangan) => { const k = Object.keys(process.env).find((n) => n.endsWith(akhir) && !(jangan && n.includes(jangan))); return k ? process.env[k] : undefined; };
const URL_REDIS = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || cariEnv('REST_API_URL') || cariEnv('REDIS_REST_URL');
const TOK_REDIS = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || cariEnv('REST_API_TOKEN', 'READ_ONLY') || cariEnv('REDIS_REST_TOKEN');
const PINS = [String(process.env.GURU_PIN || ''), String(require('./_lib/rahasia.js').PIN_GURU || '')].filter(Boolean);   // PIN bawaan selalu berlaku, GURU_PIN (jika ada) juga berlaku
const pinOk = (p) => PINS.includes(String(p));

async function redis(...cmd) {
  const r = await fetch(URL_REDIS, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK_REDIS, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
}
async function semuaSiswa() { const arr = (await redis('HGETALL', ctx().K.S)) || [], out = {}; for (let i = 0; i < arr.length; i += 2) { try { out[arr[i]] = JSON.parse(arr[i + 1]); } catch (e) { /* abaikan */ } } return out; }
async function ambilSiswa(idx) { const v = await redis('HGET', ctx().K.S, 's' + idx); return v ? JSON.parse(v) : null; }
async function simpanSiswa(idx, d) { await redis('HSET', ctx().K.S, 's' + idx, JSON.stringify(d)); }
async function ambilKel() { const v = await redis('GET', ctx().K.KEL); return v ? JSON.parse(v) : null; }
async function simpanKel(k) { await redis('SET', ctx().K.KEL, JSON.stringify(k)); }
/* langkah tahap lanjutan: daftar langkah yang dibuka guru (tiap langkah bisa dibuka/ditutup sendiri). Format lama (satu angka n) dibaca sebagai langkah 1..n. */
async function bacaLangkah() { const v = await redis('GET', ctx().K.L); if (v == null) return [1]; try { const x = JSON.parse(v); if (Array.isArray(x)) return [...new Set(x.filter((n) => Number.isInteger(n) && n >= 1 && n <= NLANGKAH()))].sort((p, q) => p - q); if (Number.isInteger(x) && x >= 1) return Array.from({ length: NLANGKAH() }, (_, i) => i + 1).filter((n) => n <= x); } catch (e) { /* abaikan */ } return [1]; }
async function tulisLangkah(arr) { await redis('SET', ctx().K.L, JSON.stringify([...new Set(arr)].sort((p, q) => p - q))); }
/* arsip kelompok: bertahan walau semua data kelas diatur ulang */
async function ambilArsip() { const v = await redis('GET', ctx().K.A); try { return v ? JSON.parse(v) : []; } catch (e) { return []; } }
async function arsipkan(kel, label, ganti) {
  const arr = await ambilArsip(), snap = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Date.now(), label: label || 'otomatis', kel: kel.kel.map((g) => g.map((s) => ({ idx: s.idx, skor: s.skor }))) };
  if (ganti && arr[0] && arr[0].label === 'otomatis') arr[0] = snap; else arr.unshift(snap); await redis('SET', ctx().K.A, JSON.stringify(arr.slice(0, 12))); return snap;
}
const bersihIdx = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 0 && (n < CFG().daftar.length || n === B.DUMMY) ? n : null; };
const nyata = (k) => +k.slice(1) < CFG().daftar.length;   // tanpa akun uji coba
const selesaiNyata = (s) => Object.keys(s).filter((k) => nyata(k) && s[k].hasil).map((k) => ({ idx: +k.slice(1), skor: s[k].hasil.skor }));
const sudahMasuk = (kel, idx) => { for (let g = 0; g < kel.length; g++) if (kel[g].some((s) => s.idx === idx)) return g; return -1; };
const tampilKel = (kel) => kel.map((g) => g.map((s) => ({ idx: s.idx, nama: nm(s.idx) })));

const bacaSlide = async () => { try { const v = await redis('GET', ctx().K.SL); const o = v ? JSON.parse(v) : null; return o && Number.isInteger(o.c) && Number.isInteger(o.b) ? { c: o.c, b: o.b } : null; } catch (e) { return null; } };
const handler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const kirim = (kode, o) => { res.statusCode = kode; res.end(JSON.stringify(o)); };
  if (req.method !== 'POST') return kirim(405, { error: 'Gunakan POST' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.a === 'cek') return kirim(200, { ok: true, penyimpanan: !!(URL_REDIS && TOK_REDIS) });
  if (!URL_REDIS || !TOK_REDIS) return kirim(503, { error: 'belum-dikonfigurasi' });
  try {
    /* ---------------- aksi siswa ---------------- */
    if (b.a === 'status') { const s = await semuaSiswa(), kb = !CFG().manual || (await redis('GET', ctx().K.KB)) === '1'; return kirim(200, { ok: true, kelasBuka: kb, manual: CFG().manual, diklaim: Object.keys(s).filter(nyata).map((k) => +k.slice(1)), selesai: Object.keys(s).filter((k) => nyata(k) && s[k].hasil).map((k) => +k.slice(1)) }); }
    if (b.a === 't2s') { const ak = await bacaLangkah(); const pam = Number(await redis('GET', ctx().K.P)) || 0; return kirim(200, { ok: true, buka: ak.length ? Math.max.apply(null, ak) : 0, aktif: ak, pameran: pam, n: NLANGKAH(), slide: await bacaSlide() }); }
    if (['klaim', 'ping', 'hasil', 'kelompok', 't2'].includes(b.a)) {
      const idx = bersihIdx(b.idx); if (idx === null || !b.token) return kirim(400, { error: 'Data tidak lengkap' });
      let d = await ambilSiswa(idx);
      if (b.a === 'klaim' && idx === B.DUMMY) { d = { hasil: null, token: b.token, aktif: Date.now(), tahap: 'masuk' }; await simpanSiswa(idx, d); return kirim(200, { ok: true, hasil: null, uji: true }); }
      if (b.a === 'klaim' && CFG().manual && idx !== B.DUMMY && (await redis('GET', ctx().K.KB)) !== '1') return kirim(423, { error: 'kelas-tutup' });
      if (b.a === 'klaim') { if (d && d.token !== b.token) return kirim(409, { error: 'dipakai' }); d = Object.assign({ hasil: null }, d, { token: b.token, aktif: Date.now(), tahap: d && d.tahap || 'masuk' }); await simpanSiswa(idx, d); return kirim(200, { ok: true, hasil: d.hasil }); }
      if (!d || d.token !== b.token) return kirim(403, { error: 'tidak-dikenali' });
      if (b.a === 'ping') { d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true }); }
      if (b.a === 'hasil') {
        if (!Array.isArray(b.jawab)) return kirim(400, { error: 'Jawaban tidak valid' });
        const jw = b.jawab.slice(0, 5).map((v) => (Number.isInteger(v) && v >= 0 && v <= 4 ? v : null)), n = B.nilai(idx, jw);
        if (!d.hasil) { d.hasil = { jawab: jw, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: Math.max(0, Math.min(B.durasi(ctx().kl), Number(b.detik) || 0)) }; d.tahap = 'selesai-tes'; await simpanSiswa(idx, d); }
        return kirim(200, { ok: true, benar: d.hasil.benar, kode: B.buatKode(idx, d.hasil.jawab) });
      }
      if (b.a === 't2') {
        const t = b.t2 || {}, u = d.t2 || {}, FAM = Object.keys(B.NAMA_FAM), ok = (v) => FAM.includes(v), n = (v, mx) => (Number.isInteger(v) && v >= 0 && v <= mx ? v : undefined);
        if (Number.isInteger(t.pasangan) && t.pasangan >= 0 && t.pasangan <= 2) u.pasangan = t.pasangan;
        if (t.paham && typeof t.paham === 'object') { u.paham = u.paham || {}; Object.keys(t.paham).filter(ok).forEach((k) => { if (['ya', 'bingung'].includes(t.paham[k])) u.paham[k] = t.paham[k]; }); }
        if (Array.isArray(t.kartu)) u.kartu = t.kartu.filter(ok);
        if (t.cocok && n(t.cocok.benar, 5) !== undefined) u.cocok = { benar: t.cocok.benar, total: 5 };
        if (t.tiket && n(t.tiket.skor, 3) !== undefined) u.tiket = { skor: t.tiket.skor };
        if (Array.isArray(t.kuasai)) u.kuasai = [...new Set(t.kuasai.filter(ok))];
        if (Array.isArray(t.bingung)) u.bingung = [...new Set(t.bingung.filter(ok))].filter((f) => !(u.kuasai || []).includes(f));
        if (t.diskusi && n(t.diskusi.benar, 6) !== undefined) u.diskusi = { benar: t.diskusi.benar, total: Math.min(6, Number(t.diskusi.total) || 6) };
        if (t.fung && n(t.fung.skor, 3) !== undefined) u.fung = { skor: t.fung.skor };
        if (t.pam && n(t.pam.benar, 9) !== undefined) u.pam = { benar: t.pam.benar, peran: ['jaga', 'kelana'].includes(t.pam.peran) ? t.pam.peran : ((u.pam && u.pam.peran) || null) };
        if (n(t.poin, 400) !== undefined) u.poin = t.poin;
        if (Array.isArray(t.lencana)) u.lencana = t.lencana.map((x) => String(x).slice(0, 24)).slice(0, 8);
        if (Array.isArray(t.sel) && t.sel.length === NLANGKAH()) u.sel = t.sel.map((v) => v === true);
        if (t.selesai === true) u.selesai = true; d.t2 = u; d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true });
      }
      if (b.a === 'kelompok') {
        if (!d.hasil && !CFG().manual) { const k0 = await ambilKel(); if (!(k0 && sudahMasuk(k0.kel, idx) >= 0)) return kirim(409, { error: 'belum-selesai' }); }
        if (!d.hasil && CFG().manual && idx !== B.DUMMY) return kirim(409, { error: 'belum-selesai' });
        if (CFG().manual) {
          const gerbangM = (await redis('GET', ctx().K.G)) || 'tutup', kelM = await ambilKel(); if (gerbangM === 'tutup' || !kelM) return kirim(200, { ok: true, menunggu: true });
          if (idx === B.DUMMY) { const k0 = JSON.parse(JSON.stringify(kelM.kel)); k0[0] = (k0[0] || []).concat([{ idx, skor: 0 }]); return kirim(200, { ok: true, kelompok: tampilKel(k0), saya: 0, uji: true }); }
          const gM = sudahMasuk(kelM.kel, idx); if (gM < 0) return kirim(409, { error: 'tanpa-kelompok' }); return kirim(200, { ok: true, kelompok: tampilKel(kelM.kel), saya: gM });
        }
        if (idx === B.DUMMY) { /* akun uji coba: lihat kelompok sementara, tidak disimpan dan tidak mengubah kelompok asli */
          const s0 = await semuaSiswa(), sel0 = selesaiNyata(s0); let k0 = await ambilKel(); k0 = k0 ? { kel: JSON.parse(JSON.stringify(k0.kel)) } : { kel: B.bentukKelompok(sel0, ctx().kl) }; const g0 = B.tambahKelompok(k0.kel, { idx, skor: d.hasil.skor }, ctx().kl); return kirim(200, { ok: true, kelompok: tampilKel(k0.kel), saya: g0 < 0 ? 0 : g0, uji: true }); }
        const gerbang = (await redis('GET', ctx().K.G)) || 'buka'; let kel = await ambilKel();
        if (gerbang === 'tutup') return kirim(200, { ok: true, menunggu: true });
        if (!kel) { const s = await semuaSiswa(); kel = { kel: B.bentukKelompok(selesaiNyata(s), ctx().kl), dibuat: Date.now() }; await simpanKel(kel); await arsipkan(kel, 'otomatis', true); }
        let g = sudahMasuk(kel.kel, idx); if (g < 0) { g = B.tambahKelompok(kel.kel, { idx, skor: d.hasil ? d.hasil.skor : 0 }, ctx().kl); if (g < 0) return kirim(409, { error: 'penuh' }); await simpanKel(kel); }
        return kirim(200, { ok: true, kelompok: tampilKel(kel.kel), saya: g });
      }
    }
    /* ---------------- aksi guru (butuh PIN) ---------------- */
    if (String(b.a || '').startsWith('g-')) {
      if (!pinOk(b.pin)) return kirim(401, { error: 'PIN salah' });
      if (b.a === 'g-status') {
        const s = await semuaSiswa(), kel = await ambilKel(), gerbang = (await redis('GET', ctx().K.G)) || (CFG().manual ? 'tutup' : 'buka');
        const uji = s['s' + B.DUMMY] ? { klaim: true, tahap: s['s' + B.DUMMY].tahap, skor: s['s' + B.DUMMY].hasil ? s['s' + B.DUMMY].hasil.skor : null } : { klaim: false };
        const FAM = Object.keys(B.NAMA_FAM), agr = {}; FAM.forEach((f) => { agr[f] = { kuasai: 0, bingung: 0 }; }); let cs = 0, cn = 0, ts = 0, tn = 0, ds = 0, dn = 0, sel2 = 0, fsum = 0, fn = 0, pjaga = 0, pkelana = 0; const poinSiswa = [];
        Object.keys(s).filter(nyata).forEach((k) => { const t = s[k].t2; if (!t) return; (t.kuasai || []).forEach((f) => { if (agr[f]) agr[f].kuasai++; }); (t.bingung || []).forEach((f) => { if (agr[f]) agr[f].bingung++; }); if (t.cocok) { cs += t.cocok.benar; cn++; } if (t.tiket) { ts += t.tiket.skor; tn++; } if (t.diskusi) { ds += t.diskusi.benar; dn++; } if (t.selesai) sel2++; if (t.fung) { fsum += t.fung.skor; fn++; } if (t.pam && t.pam.peran === 'jaga') pjaga++; if (t.pam && t.pam.peran === 'kelana') pkelana++; if (t.poin != null) poinSiswa.push({ idx: +k.slice(1), nama: nm(+k.slice(1)), poin: t.poin, lencana: t.lencana || [] }); });
        poinSiswa.sort((x, y) => y.poin - x.poin); const grupPoin = (kel ? kel.kel : []).map((g, gi) => { const p = g.map((m) => (poinSiswa.find((q) => q.idx === m.idx) || {}).poin).filter((v) => v != null); return { kel: gi + 1, n: p.length, total: p.reduce((x, y) => x + y, 0), rata: p.length ? p.reduce((x, y) => x + y, 0) / p.length : 0 }; });
        poinSiswa.forEach((p) => { p.kel = kel ? sudahMasuk(kel.kel, p.idx) + 1 : 0; });
        const aktifL = await bacaLangkah(), langkah = aktifL.length ? Math.max.apply(null, aktifL) : 0, selStep = Array.from({ length: NLANGKAH() }, () => 0); Object.keys(s).filter(nyata).forEach((k) => { const sl = s[k].t2 && s[k].t2.sel; if (sl) sl.forEach((v, i) => { if (v) selStep[i]++; }); });
        const tahap2 = { agr, cocok: cn ? cs / cn : null, cocokN: cn, tiket: tn ? ts / tn : null, tiketN: tn, diskusi: dn ? ds / dn : null, peranJaga: pjaga, peranKelana: pkelana, fung: fn ? fsum / fn : null, selesai: sel2, langkah, aktif: aktifL, selStep, peringkat: poinSiswa.slice(0, 10), grup: grupPoin };
        const daftar = CFG().daftar.map((_, i) => { const d = s['s' + i]; return { idx: i, nama: nm(i), klaim: !!d, aktif: d ? d.aktif : 0, tahap: d ? d.tahap : null, skor: d && d.hasil ? d.hasil.skor : null, detik: d && d.hasil ? d.hasil.detik : null, kel: kel ? sudahMasuk(kel.kel, i) : -1 }; });
        return kirim(200, { ok: true, sekarang: Date.now(), kelas: ctx().kl, manual: CFG().manual, kelasBuka: !CFG().manual || (await redis('GET', ctx().K.KB)) === '1', pameran: Number(await redis('GET', ctx().K.P)) || 0, nLangkah: NLANGKAH(), daftar, uji, tahap2, kelompok: kel ? tampilKel(kel.kel) : null, gerbang });
      }
      if (b.a === 'g-reset') { const idx = bersihIdx(b.idx); if (idx === null) return kirim(400, { error: 'idx' }); await redis('HDEL', ctx().K.S, 's' + idx); const kel = await ambilKel(); if (kel) { kel.kel = kel.kel.map((g) => g.filter((s) => s.idx !== idx)); await simpanKel(kel); } return kirim(200, { ok: true }); }
      if (b.a === 'g-reset-semua') { await redis('DEL', ctx().K.S); await redis('DEL', ctx().K.KEL); await redis('DEL', ctx().K.L); await redis('DEL', ctx().K.G); await redis('DEL', ctx().K.KB); await redis('DEL', ctx().K.P); await redis('DEL', ctx().K.SL); return kirim(200, { ok: true }); }
      if (b.a === 'g-bentuk' && CFG().manual) return kirim(400, { error: 'kelompok-manual' });
      if (b.a === 'g-bentuk') { const s = await semuaSiswa(); const kel = { kel: B.bentukKelompok(selesaiNyata(s), ctx().kl), dibuat: Date.now() }; await simpanKel(kel); await arsipkan(kel, 'otomatis', true); return kirim(200, { ok: true, kelompok: tampilKel(kel.kel) }); }
      if (b.a === 'g-tambah') { const s = await semuaSiswa(); let kel = await ambilKel(); if (!kel) return kirim(200, { ok: true, ditambah: 0 }); let n = 0; Object.keys(s).filter((k) => nyata(k) && s[k].hasil).forEach((k) => { const idx = +k.slice(1); if (sudahMasuk(kel.kel, idx) < 0 && B.tambahKelompok(kel.kel, { idx, skor: s[k].hasil.skor }, ctx().kl) >= 0) n++; }); await simpanKel(kel); if (n) await arsipkan(kel, 'otomatis', true); return kirim(200, { ok: true, ditambah: n }); }
      if (b.a === 'g-hapus-kelompok') { await redis('DEL', ctx().K.KEL); return kirim(200, { ok: true }); }
      if (b.a === 'g-gerbang') { await redis('SET', ctx().K.G, b.buka ? 'buka' : 'tutup'); if (b.buka && !CFG().manual && !(await ambilKel())) { const s = await semuaSiswa(); const k1 = { kel: B.bentukKelompok(selesaiNyata(s), ctx().kl), dibuat: Date.now() }; await simpanKel(k1); await arsipkan(k1, 'otomatis', true); } return kirim(200, { ok: true }); }
      if (b.a === 'g-langkah') {
        const N = NLANGKAH(), sem = Array.from({ length: N }, (_, i) => i + 1), n = Math.max(1, Math.min(N, Number(b.n) || 1)); let ak = await bacaLangkah();
        if (b.buka === true) ak.push(n); else if (b.buka === false) ak = ak.filter((x) => x !== n); else ak = sem.filter((x) => x <= n);   /* tanpa 'buka': cara lama = buka langkah 1..n */
        if (b.semua === true) ak = sem; if (b.semua === false) ak = [];
        await tulisLangkah(ak); return kirim(200, { ok: true, n, aktif: [...new Set(ak)].sort((p, q) => p - q) });
      }
      if (b.a === 'g-set-kelompok') {
        if (!CFG().manual || !Array.isArray(b.kel)) return kirim(400, { error: 'tidak-valid' });
        const J = CFG().jmlKelompok, pakai = new Set(), kel = Array.from({ length: J }, (_, i) => ((Array.isArray(b.kel[i]) ? b.kel[i] : []).map(Number).filter((v) => Number.isInteger(v) && v >= 0 && v < CFG().daftar.length && !pakai.has(v) && pakai.add(v)).map((v) => ({ idx: v, skor: 0 }))));
        await simpanKel({ kel, dibuat: Date.now(), manual: true }); return kirim(200, { ok: true, terpasang: pakai.size });
      }
      if (b.a === 'g-kelas') {
        if (!CFG().manual) return kirim(200, { ok: true }); const kelX = await ambilKel();
        if (b.buka === true) { if (!kelX || !kelX.kel.some((g) => g.length)) return kirim(409, { error: 'belum-ada-kelompok' }); await redis('SET', ctx().K.KB, '1'); await redis('SET', ctx().K.G, 'buka'); } else await redis('SET', ctx().K.KB, '0');
        return kirim(200, { ok: true });
      }
      if (b.a === 'g-slide') { const c = Number(b.c), bb = Number(b.b); if (!Number.isInteger(c) || !Number.isInteger(bb) || c < 0 || c > 30 || bb < 0 || bb > 40) return kirim(400, { error: 'posisi-tidak-valid' }); await redis('SET', ctx().K.SL, JSON.stringify({ c, b: bb })); return kirim(200, { ok: true, c, b: bb }); }
      if (b.a === 'g-pameran') { const n = Math.max(0, Math.min(9, Number(b.n) || 0)); await redis('SET', ctx().K.P, String(n)); return kirim(200, { ok: true, n }); }
      if (b.a === 'g-arsip') { const arr = await ambilArsip(); return kirim(200, { ok: true, arsip: arr.map((x) => ({ id: x.id, t: x.t, label: x.label, n: x.kel.length, total: x.kel.reduce((s, g) => s + g.length, 0), kel: tampilKel(x.kel) })) }); }
      if (b.a === 'g-simpan-kelompok') { const kel = await ambilKel(); if (!kel) return kirim(409, { error: 'belum-ada-kelompok' }); const sn = await arsipkan(kel, String(b.label || 'Disimpan guru').slice(0, 40), false); return kirim(200, { ok: true, id: sn.id }); }
      if (b.a === 'g-muat-kelompok') { const arr = await ambilArsip(), x = arr.find((q) => q.id === b.id); if (!x) return kirim(404, { error: 'tidak-ada' }); await simpanKel({ kel: x.kel.map((g) => g.map((s) => ({ idx: s.idx, skor: s.skor }))), dibuat: Date.now(), dimuat: x.id }); return kirim(200, { ok: true, kelompok: tampilKel(x.kel) }); }
      if (b.a === 'g-hapus-arsip') { const arr = (await ambilArsip()).filter((q) => q.id !== b.id); await redis('SET', ctx().K.A, JSON.stringify(arr)); return kirim(200, { ok: true }); }
      if (b.a === 'g-kode') { const r = B.bacaKode(b.kode); if (r.error) return kirim(200, { error: r.error }); if (r.idx >= CFG().daftar.length) return kirim(200, { error: 'Kode ini bukan milik kelas yang sedang dipilih' }); let d = await ambilSiswa(r.idx) || { token: null, tahap: 'kode' }; const n = B.nilai(r.idx, r.jawab); if (!d.hasil) { d.hasil = { jawab: r.jawab, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: null }; d.tahap = 'selesai-tes'; await simpanSiswa(r.idx, d); } return kirim(200, { ok: true, idx: r.idx, nama: nm(r.idx), benar: n.benar }); }
    }
    return kirim(400, { error: 'Aksi tidak dikenal' });
  } catch (e) { return kirim(500, { error: 'galat-server', pesan: String(e.message || e).slice(0, 120) }); }
};

module.exports = (req, res) => {
  let b = req.body; try { if (typeof b === 'string') b = JSON.parse(b || '{}'); } catch (e) { b = {}; }
  const kl = b && KELAS_OK.includes(b.kelas) ? b.kelas : KELAS_DEF;
  return als.run({ kl, K: keys(kl) }, () => handler(req, res));
};

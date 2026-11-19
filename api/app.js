/* Fungsi serverless Vercel (Area & Calculus): satu titik masuk /api/app (POST {a: aksi, ...}).
   Penyimpanan: Upstash Redis lewat REST (tanpa pustaka). Variabel lingkungan yang dipakai:
   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (atau KV_REST_API_URL + KV_REST_API_TOKEN)  dan  GURU_PIN. */
const B = require('./_lib/bersama.js');
const { AsyncLocalStorage } = require('node:async_hooks');
const als = new AsyncLocalStorage();
const KELAS_OK = B.KELAS_ID, KELAS_DEF = B.KELAS_TAMPIL[0];
const keys = (kl) => ({ S: 'ac:' + kl + ':siswa', KEL: 'ac:' + kl + ':kelompok', G: 'ac:' + kl + ':gerbang', L: 'ac:' + kl + ':langkah', A: 'ac:' + kl + ':arsip', KB: 'ac:' + kl + ':kelasbuka', P: 'ac:' + kl + ':pameran', SL: 'ac:' + kl + ':slide', PR: 'ac:' + kl + ':peran', PA: 'ac:' + kl + ':pasangan', K5: 'ac:' + kl + ':k5', PS: 'ac:' + kl + ':picktime' });
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

/* ---------------- tahap lanjutan: peran, sesi berkeliling (pencocokan kode), kartu 5 ---------------- */
const hashObj = async (key) => { const arr = (await redis('HGETALL', key)) || [], o = {}; for (let i = 0; i < arr.length; i += 2) { try { o[arr[i]] = JSON.parse(arr[i + 1]); } catch (e) { /* abaikan */ } } return o; };
const kodeAcak = (r) => { let k = ''; for (let i = 0; i < 3; i++) k += B.ALFA[Math.floor(r() * 32)]; return k; };
const hashStr = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
async function posisiGrup(idx) { const kel = await ambilKel(), m = kel ? kel.kel : [], g = idx === B.DUMMY ? 0 : sudahMasuk(m, idx); if (g < 0) return null; const anggota = (m[g] || []).map((x) => x.idx); if (idx === B.DUMMY && !anggota.includes(idx)) anggota.push(idx); return { g, anggota }; }
async function aksiLanjut(b, idx, d, kirim) {
  const K = ctx().K, pos = await posisiGrup(idx), now = Date.now(); if (!pos) return kirim(200, { ok: true, tanpa: true });
  const g1 = pos.g + 1, gk = idx === B.DUMMY ? 0 : pos.g + 1, fam = B.bagianKelompok(pos.g), PR = await hashObj(K.PR), saya = PR[String(idx)], maks = Math.max(1, pos.anggota.length), kelAll = await ambilKel(), ada = (g) => idx === B.DUMMY || !!(kelAll && kelAll.kel[g - 1] && kelAll.kel[g - 1].length), PS = await hashObj(K.PS), semuaG = idx === B.DUMMY ? [1, 2, 3, 4, 5, 6, 7] : (kelAll ? kelAll.kel.map((m, i) => (m.length ? i + 1 : 0)).filter(Boolean) : [g1]), anggotaG = (g) => (kelAll && kelAll.kel[g - 1] ? kelAll.kel[g - 1].map((s) => s.idx) : []),
    /* rencana kunjungan satu kelompok: Penjelajah diurut (peran A dulu, lalu menurut waktu memilih), tiap Penjelajah mendapat satu bagian tujuan yang lepas dari yang lain */
    rencana = (g) => {
      const mem = anggotaG(g), hold = mem.filter((m) => PR[String(m)] === 1 || PR[String(m)] === 2).sort((p, q) => (PR[String(p)] - PR[String(q)]) || ((PS[String(p)] || 0) - (PS[String(q)] || 0)) || (p - q));
      let slot; if (hold.length) slot = hold.map((m) => ({ idx: m, p: PR[String(m)] })); else { const E = Math.max(1, mem.length - 1), cA = Math.ceil(E / 2); slot = Array.from({ length: E }, (_, s) => ({ idx: null, p: s < cA ? 1 : 2 })); }
      const nA = slot.filter((x) => x.p === 1).length, nB = slot.length - nA; let ia = 0, ib = 0; slot.forEach((x) => { x.sub = x.p === 1 ? (nA > 1 ? 'A' + (++ia) : 'A') : (nB > 1 ? 'B' + (++ib) : 'B'); });
      const bagi = B.bagiTujuan(semuaG, g, slot.length); slot.forEach((x, i) => { x.h = bagi[i]; }); return slot;
    },
    tamuAda = () => { const out = []; semuaG.filter((g) => g !== g1).forEach((g) => { const s = rencana(g).find((x) => x.h.includes(g1)); if (s) out.push({ g, sub: s.sub }); }); return out; }, simpanD = async () => { d.aktif = now; await simpanSiswa(idx, d); };
  const tujuan = () => { if (saya !== 1 && saya !== 2) return []; const pl = rencana(g1), s = pl.find((x) => x.idx === idx) || pl.find((x) => x.p === saya) || pl[0]; return s ? s.h : []; };
  if (b.a === 'grup') return kirim(200, { ok: true, g: g1, fam, anggota: pos.anggota.map((m) => ({ idx: m, nama: nm(m), peran: PR[String(m)] == null ? null : PR[String(m)] })), kap: B.kapasitasPeran(maks), maks, aktif: await bacaLangkah() });
  if (b.a === 'peran') {
    const p = Number(b.peran); if (![0, 1, 2].includes(p)) return kirim(400, { error: 'peran-tidak-valid' });
    if (idx !== B.DUMMY && pos.anggota.filter((m) => m !== idx && PR[String(m)] === p).length >= B.kapasitasPeran(maks)[p]) return kirim(409, { error: 'dipakai' });
    if (PR[String(idx)] !== p) await redis('HSET', K.PS, String(idx), JSON.stringify(now));   /* urutan memilih: menetapkan siapa mendapat bagian tujuan yang mana */
    await redis('HSET', K.PR, String(idx), JSON.stringify(p)); return kirim(200, { ok: true, peran: p });
  }
  if (b.a.startsWith('k2-')) {
    if (saya == null) return kirim(409, { error: 'belum-pilih-peran' });
    const PA = await hashObj(K.PA), pairKey = (h, g) => h + ':' + g;
    if (b.a === 'k2-status') {
      const o = { ok: true, peran: saya, selesai: !!(d.k2 && d.k2.selesai), skip: !!(d.k2 && d.k2.skip) };
      if (saya === 0) o.tamu = tamuAda().map(({ g, sub }) => { const pr = PA[pairKey(gk, g)]; return { g, sub, fam: B.bagianKelompok(g - 1), ok: !!(pr && pr.ok), siapa: pr && pr.ok ? nm(pr.siapa) : null, kode: pr && !pr.ok && pr.exp > now ? pr.kode : null }; });
      else o.tujuan = tujuan().map((h) => { const pr = PA[pairKey(h, gk)]; return { h, fam: B.bagianKelompok(h - 1), ok: !!(pr && pr.ok), siap: !!(pr && !pr.ok && pr.exp > now), paham: ((d.k2 && d.k2.paham) || {})[h] || null }; });
      return kirim(200, o);
    }
    if (b.a === 'k2-kode' || b.a === 'k2-tarik') {
      const g = Number(b.g); if (saya !== 0 || !tamuAda().some((x) => x.g === g)) return kirim(403, { error: 'bukan-host' });
      const key = pairKey(gk, g);
      if (b.a === 'k2-tarik') { await redis('HDEL', K.PA, key); return kirim(200, { ok: true }); }
      if (idx === B.DUMMY && b.paksa === true) { await redis('HSET', K.PA, key, JSON.stringify({ kode: 'UJI', exp: now, ok: true, siapa: idx, t: now })); return kirim(200, { ok: true, paksa: true }); }
      const ada = PA[key]; if (ada && ada.ok) return kirim(200, { ok: true, sudah: true });
      if (ada && ada.exp > now) return kirim(200, { ok: true, kode: ada.kode, exp: ada.exp });
      const kode = kodeAcak(B.mulberry(hashStr(key + ':' + now))), rec = { kode, exp: now + 180000, ok: false, salah: 0, t: now }; await redis('HSET', K.PA, key, JSON.stringify(rec)); return kirim(200, { ok: true, kode, exp: rec.exp });
    }
    if (b.a === 'k2-pilihan' || b.a === 'k2-cocok' || b.a === 'k2-paham') {
      const h = Number(b.h); if (!(saya === 1 || saya === 2) || !tujuan().includes(h)) return kirim(403, { error: 'bukan-tujuan' });
      const key = pairKey(h, gk), pr = PA[key];
      if (b.a === 'k2-paham') { if ((!(pr && pr.ok) && idx !== B.DUMMY) || !['paham', 'lumayan', 'tidak'].includes(b.nilai)) return kirim(409, { error: 'belum-belajar' }); d.k2 = d.k2 || {}; d.k2.paham = d.k2.paham || {}; d.k2.paham[h] = b.nilai; await simpanD(); return kirim(200, { ok: true }); }
      if (idx === B.DUMMY && (!pr || pr.ok || pr.exp <= now)) { const rec = { kode: kodeAcak(B.mulberry(hashStr(key + ':' + now))), exp: now + 180000, ok: false, salah: 0, t: now }; await redis('HSET', K.PA, key, JSON.stringify(rec)); PA[key] = rec; }
      const pr2 = PA[key]; if (!pr2 || pr2.ok || pr2.exp <= now) return kirim(200, { ok: true, ada: false });
      if (b.a === 'k2-pilihan') { const r = B.mulberry(hashStr(pr2.kode + ':' + idx)), lain = []; while (lain.length < 2) { const c = kodeAcak(r); if (c !== pr2.kode && !lain.includes(c)) lain.push(c); } return kirim(200, { ok: true, ada: true, pilihan: B.acak(r, [pr2.kode].concat(lain)) }); }
      if (idx === B.DUMMY || String(b.pilih).toUpperCase() === pr2.kode) { pr2.ok = true; pr2.siapa = idx; pr2.t = now; await redis('HSET', K.PA, key, JSON.stringify(pr2)); d.k2 = d.k2 || {}; d.k2.belajar = d.k2.belajar || {}; d.k2.belajar[h] = true; await simpanD(); return kirim(200, { ok: true, benar: true }); }
      pr2.salah = (pr2.salah || 0) + 1; let baru = false; if (pr2.salah >= 3) { pr2.kode = kodeAcak(B.mulberry(hashStr(key + ':' + now + 'x'))); pr2.salah = 0; pr2.exp = now + 180000; baru = true; } await redis('HSET', K.PA, key, JSON.stringify(pr2)); return kirim(200, { ok: true, benar: false, baru });
    }
    if (b.a === 'k2-selesai') {
      const perlu = saya === 0 ? tamuAda().map((x) => PA[pairKey(gk, x.g)]) : tujuan().map((h) => PA[pairKey(h, gk)]), lengkap = perlu.every((p) => p && p.ok) || idx === B.DUMMY;
      if (!lengkap && b.skip !== true) return kirim(409, { error: 'belum-lengkap' });
      d.k2 = d.k2 || {}; d.k2.selesai = true; d.k2.skip = !lengkap; d.k2.kurang = perlu.filter((p) => !(p && p.ok)).length; d.k2.waktu = now; await simpanD(); return kirim(200, { ok: true, skip: !lengkap });
    }
  }
  if (b.a.startsWith('k5-')) {
    const H = await hashObj(K.K5), PA = await hashObj(K.PA); let snap = H[g1 + ':set'];
    if (!snap) { const fams = [fam]; Object.keys(PA).forEach((k) => { const [h, g] = k.split(':').map(Number); if (g === gk && PA[k].ok) { const f = B.bagianKelompok(h - 1); if (!fams.includes(f)) fams.push(f); } }); snap = { fams, t: now }; await redis('HSET', K.K5, g1 + ':set', JSON.stringify(snap)); }
    const seed = B.seedKelompok(ctx().kl, g1, 5), klaim = {}, jawab = {};
    [1, 2, 3].forEach((no) => { klaim[no] = (H[gk + ':' + no] || []).map((m) => ({ idx: m, nama: nm(m) })); const j = H[gk + ':' + no + ':j']; if (j) jawab[no] = { idx: j.idx, nama: nm(j.idx), benar: !!j.benar }; });
    const saatIni = () => { for (const no of [1, 2, 3]) if ((H[gk + ':' + no] || []).includes(idx)) return no; return null; };
    if (b.a === 'k5-status') return kirim(200, { ok: true, fams: snap.fams, seed, klaim, jawab, saya: saatIni() });
    if (b.a === 'k5-pilih') {
      const no = Number(b.no); if (![1, 2, 3].includes(no)) return kirim(400, { error: 'no' }); if (saatIni()) return kirim(200, { ok: true, saya: saatIni() });
      const semua = [1, 2, 3].every((n) => (H[gk + ':' + n] || []).length); if ((H[gk + ':' + no] || []).length && !semua) return kirim(409, { error: 'diambil' });
      const arr = H[gk + ':' + no] || []; arr.push(idx); await redis('HSET', K.K5, gk + ':' + no, JSON.stringify(arr)); return kirim(200, { ok: true, saya: no });
    }
    if (b.a === 'k5-jawab') {
      const no = saatIni(); if (!no) return kirim(409, { error: 'belum-pilih' }); const ada = H[gk + ':' + no + ':j']; if (ada && ada.idx === idx) return kirim(200, { ok: true, benar: !!ada.benar, kunci: B.luasSet(seed, snap.fams)[no - 1].kunci, sudah: true });
      const kunci = B.luasSet(seed, snap.fams)[no - 1].kunci, benar = Number(b.nilai) === kunci; await redis('HSET', K.K5, gk + ':' + no + ':j', JSON.stringify({ idx, benar, nilai: Number(b.nilai), t: now }));
      d.t2 = d.t2 || {}; d.t2.k5 = { no, benar: benar ? 1 : 0, selesai: true }; await simpanD(); return kirim(200, { ok: true, benar, kunci });
    }
  }
  return kirim(400, { error: 'Aksi tidak dikenal' });
}

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
    if (['klaim', 'ping', 'hasil', 'kelompok', 't2', 'grup', 'peran', 'k2-status', 'k2-kode', 'k2-pilihan', 'k2-cocok', 'k2-tarik', 'k2-paham', 'k2-selesai', 'k5-status', 'k5-pilih', 'k5-jawab'].includes(b.a)) {
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
        const t = b.t2 || {}, u = d.t2 || {}, n = (v, mx) => (Number.isInteger(v) && v >= 0 && v <= mx ? v : undefined), jw = (a, k) => (Array.isArray(a) ? a.slice(0, k).map((v) => (Number.isInteger(v) && v >= 0 && v <= 99999 ? v : null)) : undefined);
        if (t.k1 && typeof t.k1 === 'object') u.k1 = { selesai: t.k1.selesai === true, latihan: n(t.k1.latihan, 999) || 0, benar: n(t.k1.benar, 999) || 0 };
        [['k3', 3], ['k4', 7], ['k5', 3], ['k6', 3]].forEach(([k, mx]) => { if (t[k] && n(t[k].benar, mx) !== undefined) u[k] = { benar: t[k].benar, selesai: t[k].selesai === true, jawab: jw(t[k].jawab, mx) }; });
        if (t.tamat === true) u.tamat = true; if (t.sapa === true) u.sapa = true;
        d.t2 = u; d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true });
      }
      if (String(b.a).startsWith('k2-') || String(b.a).startsWith('k5-') || b.a === 'grup' || b.a === 'peran') return aksiLanjut(b, idx, d, kirim);
      if (b.a === 'kelompok') {
        if (!d.hasil && !CFG().manual) { const k0 = await ambilKel(); if (!(k0 && sudahMasuk(k0.kel, idx) >= 0)) return kirim(409, { error: 'belum-selesai' }); }
        if (!d.hasil && CFG().manual && idx !== B.DUMMY) return kirim(409, { error: 'belum-selesai' });
        if (CFG().manual) {
          const gerbangM = (await redis('GET', ctx().K.G)) || 'tutup', kelM = await ambilKel(); if (gerbangM === 'tutup' || !kelM) return kirim(200, { ok: true, menunggu: true });
          if (idx === B.DUMMY) { const k0 = JSON.parse(JSON.stringify(kelM.kel)); k0[0] = (k0[0] || []).concat([{ idx, skor: 0 }]); return kirim(200, { ok: true, kelompok: tampilKel(k0), saya: 0, uji: true }); }
          const gM = sudahMasuk(kelM.kel, idx); if (gM < 0) return kirim(409, { error: 'tanpa-kelompok' }); return kirim(200, { ok: true, kelompok: tampilKel(kelM.kel), saya: gM });
        }
        if (idx === B.DUMMY) { /* akun uji coba: lihat kelompok sementara, tidak disimpan dan tidak mengubah kelompok asli */
          const s0 = await semuaSiswa(), sel0 = selesaiNyata(s0); let k0 = await ambilKel(); k0 = k0 ? { kel: JSON.parse(JSON.stringify(k0.kel)) } : { kel: B.bentukKelompok(sel0, ctx().kl) }; const g0 = B.tambahKelompok(k0.kel, { idx, skor: d.hasil.skor }, ctx().kl, k0.k); return kirim(200, { ok: true, kelompok: tampilKel(k0.kel), saya: g0 < 0 ? 0 : g0, uji: true }); }
        const gerbang = (await redis('GET', ctx().K.G)) || 'buka'; let kel = await ambilKel();
        if (gerbang === 'tutup') return kirim(200, { ok: true, menunggu: true });
        if (!kel) { const s = await semuaSiswa(); kel = { kel: B.bentukKelompok(selesaiNyata(s), ctx().kl), dibuat: Date.now() }; await simpanKel(kel); await arsipkan(kel, 'otomatis', true); }
        let g = sudahMasuk(kel.kel, idx); if (g < 0) { g = B.tambahKelompok(kel.kel, { idx, skor: d.hasil ? d.hasil.skor : 0 }, ctx().kl, kel.k); if (g < 0) return kirim(409, { error: 'penuh' }); await simpanKel(kel); }
        return kirim(200, { ok: true, kelompok: tampilKel(kel.kel), saya: g });
      }
    }
    /* ---------------- aksi guru (butuh PIN) ---------------- */
    if (String(b.a || '').startsWith('g-')) {
      if (!pinOk(b.pin)) return kirim(401, { error: 'PIN salah' });
      if (b.a === 'g-status') {
        const s = await semuaSiswa(), kel = await ambilKel(), gerbang = (await redis('GET', ctx().K.G)) || (CFG().manual ? 'tutup' : 'buka');
        const uji = s['s' + B.DUMMY] ? { klaim: true, tahap: s['s' + B.DUMMY].tahap, skor: s['s' + B.DUMMY].hasil ? s['s' + B.DUMMY].hasil.skor : null } : { klaim: false };
        const PR = await hashObj(ctx().K.PR), PA = await hashObj(ctx().K.PA), aktifL = await bacaLangkah(), langkah = aktifL.length ? Math.max.apply(null, aktifL) : 0, selStep = [0, 0, 0, 0, 0, 0], peran = { host: 0, A: 0, B: 0, belum: 0 }; let pOk = 0, skip = 0, sel2 = 0, sumNilai = 0, nN = 0, sumCap = 0; const siswa = [], paham = { paham: 0, lumayan: 0, tidak: 0 };
        Object.keys(s).filter(nyata).forEach((k) => { const i = +k.slice(1), t = s[k].t2 || {}, p = PR[String(i)], tes = s[k].hasil ? s[k].hasil.skor : null, R = B.rapor(Object.assign({}, t, { k2: s[k].k2 }), tes); R.kartu.forEach((v, j) => { if (v) selStep[j]++; }); if (p === 0) peran.host++; else if (p === 1) peran.A++; else if (p === 2) peran.B++; else peran.belum++; if (s[k].k2 && s[k].k2.skip) skip++; if (s[k].k2 && s[k].k2.paham) Object.values(s[k].k2.paham).forEach((v) => { if (paham[v] != null) paham[v]++; }); if (R.kartu.some(Boolean)) { sumNilai += R.nilai; nN++; sumCap += R.capaian; } if (R.kartu.every(Boolean)) sel2++; siswa.push({ idx: i, nama: nm(i), kel: kel ? sudahMasuk(kel.kel, i) + 1 : 0, peran: p == null ? null : p, capaian: R.capaian, nilai: R.nilai, awal: R.awal, predikat: R.predikat, kartu: R.kartu, skip: !!(s[k].k2 && s[k].k2.skip), paham: (s[k].k2 && s[k].k2.paham) || {} }); });
        Object.keys(PA).forEach((k) => { if (PA[k].ok && !k.startsWith('0:') && !k.endsWith(':0')) pOk++; });
        const tahap2 = { langkah, aktif: aktifL, selStep, peran, pasangan: { ok: pOk, total: (() => { const k = kel ? kel.kel.filter((m) => m.length).length : 7; return k * (k - 1); })() }, skip, selesai: sel2, nilaiRata: nN ? sumNilai / nN : null, capaianRata: nN ? sumCap / nN : null, paham, siswa };
        const daftar = CFG().daftar.map((_, i) => { const d = s['s' + i]; return { idx: i, nama: nm(i), klaim: !!d, aktif: d ? d.aktif : 0, tahap: d ? d.tahap : null, skor: d && d.hasil ? d.hasil.skor : null, detik: d && d.hasil ? d.hasil.detik : null, kel: kel ? sudahMasuk(kel.kel, i) : -1 }; });
        return kirim(200, { ok: true, sekarang: Date.now(), kelas: ctx().kl, manual: CFG().manual, kelasBuka: !CFG().manual || (await redis('GET', ctx().K.KB)) === '1', pameran: Number(await redis('GET', ctx().K.P)) || 0, nLangkah: NLANGKAH(), daftar, uji, tahap2, kelompok: kel ? tampilKel(kel.kel) : null, gerbang });
      }
      if (b.a === 'g-reset') { const idx = bersihIdx(b.idx); if (idx === null) return kirim(400, { error: 'idx' }); await redis('HDEL', ctx().K.S, 's' + idx); await redis('HDEL', ctx().K.PR, String(idx)); await redis('HDEL', ctx().K.PS, String(idx)); const kel = await ambilKel(); if (kel) { kel.kel = kel.kel.map((g) => g.filter((s) => s.idx !== idx)); await simpanKel(kel); } return kirim(200, { ok: true }); }
      if (b.a === 'g-reset-semua') { await redis('DEL', ctx().K.S); await redis('DEL', ctx().K.KEL); await redis('DEL', ctx().K.L); await redis('DEL', ctx().K.G); await redis('DEL', ctx().K.KB); await redis('DEL', ctx().K.P); await redis('DEL', ctx().K.SL); await redis('DEL', ctx().K.PR); await redis('DEL', ctx().K.PS); await redis('DEL', ctx().K.PA); await redis('DEL', ctx().K.K5); return kirim(200, { ok: true }); }
      if (b.a === 'g-bentuk' && CFG().manual) return kirim(400, { error: 'kelompok-manual' });
      if (b.a === 'g-bentuk') { const s = await semuaSiswa(), sel = selesaiNyata(s); const kel = { kel: B.bentukKelompok(sel, ctx().kl, true), dibuat: Date.now(), k: Math.max(1, B.rencanaKelompok(sel.length).K) }; await simpanKel(kel); await arsipkan(kel, 'otomatis', true); return kirim(200, { ok: true, kelompok: tampilKel(kel.kel) }); }
      if (b.a === 'g-tambah') { const s = await semuaSiswa(); let kel = await ambilKel(); if (!kel) return kirim(200, { ok: true, ditambah: 0 }); let n = 0; Object.keys(s).filter((k) => nyata(k) && s[k].hasil).forEach((k) => { const idx = +k.slice(1); if (sudahMasuk(kel.kel, idx) < 0 && B.tambahKelompok(kel.kel, { idx, skor: s[k].hasil.skor }, ctx().kl, kel.k) >= 0) n++; }); await simpanKel(kel); if (n) await arsipkan(kel, 'otomatis', true); return kirim(200, { ok: true, ditambah: n }); }
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

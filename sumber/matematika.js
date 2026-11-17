/* Rumus matematika dirender dengan KaTeX (tertanam di halaman, tanpa jaringan).
   Teks campuran memakai penanda $…$ (sebaris) dan $$…$$ (blok). Mat.h(teks) mengubah penanda itu menjadi HTML KaTeX. */
(function (root) {
  'use strict';
  const cache = new Map();
  const aman = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function tex(s, blok) {
    const k = (blok ? 'B' : 'I') + s; let h = cache.get(k);
    if (h === undefined) {
      try { h = root.katex.renderToString(s, { throwOnError: false, output: 'html', displayMode: !!blok, strict: false }); } catch (e) { h = '<span class="katex-gagal">' + aman(s) + '</span>'; }
      if (cache.size > 4000) cache.clear(); cache.set(k, h);
    }
    return h;
  }
  const h = (str) => { str = String(str == null ? '' : str); if (str.indexOf('$') < 0) return str; return str.replace(/\$\$([^$]+?)\$\$/g, (m, t) => tex(t, true)).replace(/\$([^$]+?)\$/g, (m, t) => tex(t, false)); };
  root.Mat = { tex, h, aman };
})(window);

/* Pengantar kelas: seluruh animasi kini ada di panggung.js (mesin adegan.js). Berkas ini tinggal penghubung nama lama. */
(function (root) { 'use strict'; root.Intro = { mount: (host, o) => root.Panggung.mount(host, o) }; })(window);

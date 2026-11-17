/* Ilustrasi sambutan: dua kurva digambar, daerah di antaranya diarsir emas, lalu rumus luasnya muncul. Animasi murni CSS (premium.css). */
(function (root) {
  'use strict';
  function heroSVG() {
    let kisi = '';
    for (let x = 60; x <= 520; x += 40) kisi += '<path d="M' + x + ' 40V470" class="hs-kisi' + (x % 120 === 0 ? ' mayor' : '') + '"/>';
    for (let y = 50; y <= 470; y += 40) kisi += '<path d="M40 ' + y + 'H530" class="hs-kisi' + (y % 120 === 50 ? ' mayor' : '') + '"/>';
    return '<svg viewBox="0 0 560 520" class="hero-svg" role="img" aria-label="Daerah di antara dua kurva diarsir">'
      + '<defs><pattern id="hh" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#E0AE4A" fill-opacity=".14"/><line x1="0" y1="0" x2="0" y2="9" stroke="#E0AE4A" stroke-width="3.2" stroke-opacity=".9"/></pattern>'
      + '<clipPath id="hc"><rect class="hs-sapu" x="100" y="0" width="420" height="520"/></clipPath></defs>'
      + '<rect x="14" y="14" width="532" height="492" rx="26" class="hs-panel"/>' + kisi
      + '<path d="M60 430H525M90 470V46" class="hs-sumbu"/>'
      + '<path d="M150 430Q310 70 470 430Q310 330 150 430Z" fill="url(#hh)" clip-path="url(#hc)"/>'
      + '<path class="hs-kurva hs-f" pathLength="1" d="M150 430Q310 70 470 430"/><path class="hs-kurva hs-g" pathLength="1" d="M150 430Q310 330 470 430"/>'
      + '<g class="hs-titik"><circle class="hs-ring" cx="150" cy="430" r="9"/><circle class="hs-ring r2" cx="470" cy="430" r="9"/><circle cx="150" cy="430" r="7"/><circle cx="470" cy="430" r="7"/></g>'
      + '<g class="hs-label"><text x="330" y="222" class="hs-t f">y = f(x)</text><text x="318" y="408" class="hs-t g">y = g(x)</text><text x="150" y="460" class="hs-t ab" text-anchor="middle">a</text><text x="470" y="460" class="hs-t ab" text-anchor="middle">b</text></g>'
      + '<g class="hs-rumus"><text x="280" y="494" text-anchor="middle" class="hs-rm"><tspan class="it">L</tspan> = ∫<tspan class="bt" dy="-13" dx="1">b</tspan><tspan class="bt" dy="25" dx="-7">a</tspan><tspan dy="-12" dx="7"> [ </tspan><tspan class="it">f</tspan>(<tspan class="it">x</tspan>) − <tspan class="it">g</tspan>(<tspan class="it">x</tspan>) ] <tspan class="it">dx</tspan></text></g></svg>';
  }
  UI.heroSVG = heroSVG;
})(window);

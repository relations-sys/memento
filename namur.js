/* MEMENTO — façade interactive de Namur (FR/EN). Le texte vient de `L`, défini dans la page.
   Façade sud d'après les plans : 103'-4" de long, deux étages de chambres, hall en pierre, resto-bar, modules du spa.
   1 pi = 6 unités ; niveaux : sol 100', RDC 103', étage 2 112', avant-toit 121'-6", tour 130'-4".
   Palette de la charte seulement, et un seul cadre vermillon. */
(function () {
  const C = { encre: '#0B0B0C', graphite: '#232326', beton: '#A7A39C', craie: '#F1EDE6', vermillon: '#FF4F1F' };
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('facade');
  const stage = document.getElementById('stage');
  const state = { m: 'jour', on: 'resto' };

  const G = 340, X0 = 50, U = 6;
  const x = ft => X0 + ft * U;
  const y = ft => G - (ft - 100) * U;
  // grille des plans, de gauche à droite (K → A), en pieds depuis K
  const K = 0, J = 8.83, Cg = J + 56, B = Cg + 13, A = B + 25.5, SPA = A + 44;
  const BAYS = Array.from({ length: 7 }, (_, i) => J + 4 + i * 8);   // axes des chambres
  const lit = i => (i * 5 + 2) % 9 < 6;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  const rect = (x1, y1, x2, y2, a) => el('rect', Object.assign({ x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }, a));

  function draw() {
    const nuit = state.m === 'nuit';
    while (svg.lastChild && svg.lastChild.tagName !== 'title') svg.removeChild(svg.lastChild);

    const defs = el('defs', {});
    const glow = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feGaussianBlur', { stdDeviation: 5, result: 'b' }, glow);
    const mg = el('feMerge', {}, glow);
    el('feMergeNode', { in: 'b' }, mg); el('feMergeNode', { in: 'SourceGraphic' }, mg);
    // bardage vertical (bois teint encre) et pierre
    const lames = el('pattern', { id: 'lames', width: 4, height: 10, patternUnits: 'userSpaceOnUse' }, defs);
    el('path', { d: 'M.5 0V10', stroke: C.beton, 'stroke-opacity': nuit ? .07 : .12, 'stroke-width': .6 }, lames);
    const pierre = el('pattern', { id: 'pierre', width: 14, height: 7, patternUnits: 'userSpaceOnUse' }, defs);
    el('path', { d: 'M0 .5H14M0 3.5H14M5 .5V3.5M11 3.5V7M2 3.5V7', stroke: C.beton, 'stroke-opacity': .22, 'stroke-width': .6, fill: 'none' }, pierre);
    const tole = el('pattern', { id: 'tole', width: 3, height: 10, patternUnits: 'userSpaceOnUse' }, defs);
    el('path', { d: 'M.5 0V10', stroke: C.encre, 'stroke-opacity': .5, 'stroke-width': .8 }, tole);

    // ciel de nuit : quelques étoiles craie
    if (nuit) for (let i = 0; i < 40; i++) el('circle', { cx: (i * 263) % 1000, cy: 12 + (i * 97) % 150, r: i % 4 ? .7 : 1.1, fill: C.craie, opacity: .3 + (i % 3) * .2 });

    // la forêt derrière : sapins en béton
    const sapin = nuit ? C.graphite : C.beton;
    for (let i = 0; i < 46; i++) {
      const cx = -10 + i * 23 + (i % 3) * 5, h = 70 + ((i * 37) % 60), w = 15 + (i % 4) * 3;
      el('path', { d: `M${cx} ${G - h} L${cx + w} ${G} H${cx - w}Z`, fill: sapin, opacity: nuit ? .55 : .2 });
    }

    // sol
    rect(0, G, 1000, G + 6, { fill: C.beton, opacity: nuit ? .25 : .35 });
    rect(0, G + 6, 1000, 400, { fill: nuit ? C.graphite : C.beton, opacity: nuit ? .5 : .15 });

    const bois = nuit ? C.graphite : C.encre;
    const pier = nuit ? C.encre : C.graphite;

    // --- toitures (débord encre/graphite) ---
    el('path', { d: `M${x(J) - 10} ${y(121.5)} L${x(BAYS[4])} ${y(127.5)} L${x(B) + 6} ${y(121.5)} V${y(120.5)} L${x(BAYS[4])} ${y(126.3)} L${x(J) - 10} ${y(120.3)}Z`, fill: nuit ? C.beton : C.graphite });
    el('path', { d: `M${x(B) - 4} ${y(122)} L${x(A) + 8} ${y(126)} V${y(124.8)} L${x(B) - 4} ${y(120.8)}Z`, fill: nuit ? C.beton : C.graphite });

    // --- aile des chambres (J → C) ---
    el('path', { d: `M${x(J)} ${G} V${y(120.5)} L${x(BAYS[4])} ${y(126.3)} L${x(Cg)} ${y(124.4)} V${G}Z`, fill: bois });
    el('path', { d: `M${x(J)} ${G} V${y(120.5)} L${x(BAYS[4])} ${y(126.3)} L${x(Cg)} ${y(124.4)} V${G}Z`, fill: 'url(#lames)' });
    rect(x(J), y(112) - 1, x(Cg), y(112) + 1, { fill: nuit ? C.encre : C.graphite });   // ligne d'étage
    rect(x(J), y(103), x(Cg), G, { fill: C.beton, opacity: nuit ? .15 : .35 });          // soubassement

    let i = 0;
    [[104.5, 'rdc'], [113.5, 'e2']].forEach(([sill, lvl]) => {
      BAYS.forEach((bx, k) => {
        const w = 5.4 * U, h = 5.4 * U, wx = x(bx) - w / 2, wy = y(sill) - h;
        const signe = lvl === 'e2' && k === BAYS.length - 1;     // en haut à droite : le cadre vermillon
        const on = nuit && (lit(i++) || signe);
        el('path', { d: `M${wx - 5} ${wy + h + 7} V${wy - 5} H${wx + w + 5} V${wy + h + 7}`, fill: 'none', stroke: signe ? C.vermillon : C.beton, 'stroke-width': signe ? 3 : 2.2, opacity: nuit && !signe ? .55 : 1, filter: nuit && signe ? 'url(#glow)' : '' });
        rect(wx, wy, wx + w, wy + h, { fill: on ? C.craie : (nuit ? C.encre : C.graphite), opacity: on ? .92 : 1, filter: on ? 'url(#glow)' : '' });
        if (!on && !nuit) el('path', { d: `M${wx} ${wy + h * .55} L${wx + w * .55} ${wy} H${wx + w * .8} L${wx} ${wy + h * .85}Z`, fill: C.beton, opacity: .14 });
      });
    });

    // --- tour d'escalier (K → J), pierre, mention verticale ---
    rect(x(K), y(130.3), x(J), G, { fill: pier });
    rect(x(K), y(130.3), x(J), G, { fill: 'url(#pierre)' });
    rect(x(K) - 2, y(130.3) - 3, x(J) + 2, y(130.3), { fill: nuit ? C.beton : C.encre });
    const t = el('text', { x: 0, y: 0, transform: `translate(${(x(K) + x(J)) / 2 + 4} ${(y(130.3) + G) / 2}) rotate(90)`, 'text-anchor': 'middle', 'font-family': 'Space Mono, monospace', 'font-size': 7, 'letter-spacing': 2.6, fill: C.craie, filter: nuit ? 'url(#glow)' : '' });
    t.textContent = 'HÔTEL · MEMENTO · NAMUR';

    // --- hall d'entrée (C → B), pierre ---
    rect(x(Cg), y(124.5), x(B), G, { fill: pier });
    rect(x(Cg), y(124.5), x(B), G, { fill: 'url(#pierre)' });
    const dw = 6 * U, dx = (x(Cg) + x(B)) / 2 - dw / 2, dy = y(110.5);
    rect(dx, dy, dx + dw, G, { fill: nuit ? C.craie : C.encre, opacity: nuit ? .8 : 1, filter: nuit ? 'url(#glow)' : '' });
    el('path', { d: `M${dx} ${G} V${dy} H${dx + dw} V${G}`, fill: 'none', stroke: C.craie, 'stroke-width': 3 });
    el('line', { x1: dx + dw / 2, x2: dx + dw / 2, y1: dy, y2: G, stroke: nuit ? C.graphite : C.graphite, 'stroke-width': 1.2 });
    rect(dx - 8, y(119.5), dx + dw + 8, y(113.5), { fill: nuit ? C.craie : C.graphite, opacity: nuit ? .75 : 1 });   // baie de l'étage
    // marches
    rect(dx - 14, G - 4, dx + dw + 14, G, { fill: C.beton, opacity: .6 });

    // --- resto-bar (B → A) : vitrine pleine largeur, logotype au-dessus ---
    el('path', { d: `M${x(B)} ${G} V${y(121)} L${x(A)} ${y(124.8)} V${G}Z`, fill: bois });
    el('path', { d: `M${x(B)} ${G} V${y(121)} L${x(A)} ${y(124.8)} V${G}Z`, fill: 'url(#lames)' });
    const gy1 = y(112.5), gx1 = x(B) + 8, gx2 = x(A) - 8;
    rect(gx1, gy1, gx2, G, { fill: nuit ? C.craie : C.graphite, opacity: nuit ? .88 : 1, filter: nuit ? 'url(#glow)' : '' });
    for (let k = 0; k <= 5; k++) el('line', { x1: gx1 + k * (gx2 - gx1) / 5, x2: gx1 + k * (gx2 - gx1) / 5, y1: gy1, y2: G, stroke: C.encre, 'stroke-width': 2.2 });
    if (!nuit) el('path', { d: `M${gx1} ${G - 12} L${gx1 + 50} ${gy1} H${gx1 + 74} L${gx1} ${G - 1}Z`, fill: C.beton, opacity: .13 });
    if (nuit) {   // le foyer et le bar, en silhouette
      el('circle', { cx: gx1 + 40, cy: G - 18, r: 9, fill: C.graphite });
      rect(gx2 - 70, G - 22, gx2 - 14, G - 18, { fill: C.graphite });
      rect(gx2 - 66, G - 18, gx2 - 62, G, { fill: C.graphite }); rect(gx2 - 22, G - 18, gx2 - 18, G, { fill: C.graphite });
    }
    // logotype MEMENTO (dessin de la charte, réduit)
    const wmW = (x(A) - x(B)) * .62, sc = wmW / 951, lx = (x(B) + x(A)) / 2 - wmW / 2, ly = y(118.6);
    const g = el('g', { transform: `translate(${lx} ${ly}) scale(${sc})`, fill: 'none', stroke: C.craie, 'stroke-width': 2.4 / sc * .5, filter: nuit ? 'url(#glow)' : '' });
    ['M1.1,100 V1.1 H111.9 V100', 'M155,0 V100', 'M155,1.1 H240', 'M155,50 H226', 'M155,98.9 H240', 'M290,100 V1.1 L338.5,58 L387,1.1 V100',
     'M437,0 V100', 'M437,1.1 H522', 'M437,50 H508', 'M437,98.9 H522', 'M578,100 V1.1 L663,98.9 V0', 'M719,1.1 H804', 'M761.5,0 V100']
      .forEach(d => el('path', { d }, g));
    el('ellipse', { cx: 902.5, cy: 50, rx: 47, ry: 48.9 }, g);
    const cafe = el('text', { x: (x(B) + x(A)) / 2, y: gy1 - 6, 'text-anchor': 'middle', 'font-family': 'Space Mono, monospace', 'font-size': 6.5, 'letter-spacing': 2.6, fill: C.beton });
    cafe.textContent = L.resto;

    // --- spa : modules graphite, deux hautes fenêtres-portes ---
    rect(x(A), y(112.5), x(SPA), G, { fill: nuit ? C.encre : C.graphite });
    rect(x(A), y(112.5), x(SPA), G, { fill: 'url(#tole)' });
    rect(x(A) - 2, y(112.5) - 3, x(SPA) + 2, y(112.5), { fill: nuit ? C.beton : C.encre });
    [A + 12, A + 24].forEach(fx => {
      const w = 3 * U, h = 7.5 * U, wx = x(fx) - w / 2, wy = G - h - 4;
      rect(wx, wy, wx + w, wy + h, { fill: nuit ? C.craie : C.encre, opacity: nuit ? .85 : 1, filter: nuit ? 'url(#glow)' : '' });
      el('path', { d: `M${wx - 4} ${wy + h + 4} V${wy - 4} H${wx + w + 4} V${wy + h + 4}`, fill: 'none', stroke: C.craie, 'stroke-width': 2 });
    });
    const spa = el('text', { x: x(A + 36), y: y(109), 'text-anchor': 'middle', 'font-family': 'Space Mono, monospace', 'font-size': 8, 'letter-spacing': 3, fill: C.craie }); spa.textContent = 'SPA';

    // --- zones interactives ---
    const Z = {
      e2: [x(J), y(121.5), x(Cg), y(112)],
      rdc: [x(J), y(112), x(Cg), G],
      accueil: [x(Cg), y(124.5), x(B), G],
      resto: [x(B), y(124.8), x(A), G],
      spa: [x(A), y(112.5), x(SPA), G]
    };
    Object.entries(Z).forEach(([k, [x1, y1, x2, y2]]) => {
      const gz = el('g', { class: 'fl' + (state.on === k ? ' on' : ''), 'data-k': k });
      gz.appendChild(rect(x1, y1, x2, y2, { class: 'hit' }));
      el('line', { class: 'tick', x1: (x1 + x2) / 2, x2: (x1 + x2) / 2, y1: G + 10, y2: G + 26, stroke: C.vermillon, 'stroke-width': 1.4 }, gz);
      const lb = el('text', { class: 'tick', x: (x1 + x2) / 2, y: G + 38, 'text-anchor': 'middle', 'font-family': 'Space Mono, monospace', 'font-size': 8, 'letter-spacing': 1.5, fill: nuit ? C.craie : C.encre }, gz);
      lb.textContent = floorOf(k).n;
      gz.addEventListener('mouseenter', () => select(k));
      gz.addEventListener('click', () => select(k));
    });
  }

  function floorOf(k) { return L.floors.find(f => f.k === k); }

  function select(k) {
    state.on = k;
    const f = floorOf(k);
    document.getElementById('d-etq').textContent = f.n;
    document.getElementById('d-titre').textContent = f.t;
    document.getElementById('d-txt').textContent = f.d;
    svg.querySelectorAll('.fl').forEach(g => g.classList.toggle('on', g.dataset.k === k));
    document.querySelectorAll('#pile button').forEach(b => b.setAttribute('aria-current', b.dataset.k === k));
  }

  const pile = document.getElementById('pile');
  L.floors.forEach(f => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.k = f.k;
    b.innerHTML = `<span class="n"></span><span class="etq"></span>`;
    b.querySelector('.n').textContent = f.t;
    b.querySelector('.etq').textContent = f.n;
    b.addEventListener('click', () => select(f.k));
    li.appendChild(b); pile.appendChild(li);
  });

  document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
    b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    state.m = b.dataset.m; stage.classList.toggle('nuit', state.m === 'nuit');
    draw(); select(state.on);
  }));

  if (/nuit|night/.test(location.hash)) document.querySelector('[data-m="nuit"]').click();
  draw(); select(state.on);
  if (document.fonts) document.fonts.ready.then(() => { draw(); select(state.on); });
})();

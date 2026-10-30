/* MEMENTO — façade interactive (FR/EN). Le texte vient de `L`, défini dans la page.
   Dessin en unités de 1/10 de pied : RDC au sol (y 840), 9 pi ; étages 2 à 7 à 9,5 pi ; toit-pavillon au-dessus.
   Palette de la charte seulement : encre, graphite, béton, craie, et un seul point vermillon. */
(function () {
  const C = { encre: '#0B0B0C', graphite: '#232326', beton: '#A7A39C', craie: '#F1EDE6', vermillon: '#FF4F1F' };
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('facade');
  const stage = document.getElementById('stage');
  const state = { v: 'memento', m: 'jour', on: 'rdc' };

  const G = 840;                       // niveau du sol
  const X0 = 120, XB = 360, X1 = 437.5; // corps principal | cage d'escalier | limite
  const yAt = ft => G - (ft - 100) * 10;
  const FLOORS = [];                   // [clé, bas, haut] en pieds
  FLOORS.push(['rdc', 100, 109]);
  for (let n = 2; n <= 7; n++) FLOORS.push([String(n), 109 + 9.5 * (n - 2), 118.5 + 9.5 * (n - 2)]);
  FLOORS.push(['toit', 166, 178.7]);
  // fenêtres allumées la nuit (motif fixe, pas aléatoire au rechargement)
  const LIT = '110111101011111101';

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }

  function draw() {
    const nuit = state.m === 'nuit', mem = state.v === 'memento';
    while (svg.lastChild && svg.lastChild.tagName !== 'title') svg.removeChild(svg.lastChild);

    const defs = el('defs', {});
    const glow = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feGaussianBlur', { stdDeviation: 6, result: 'b' }, glow);
    const mg = el('feMerge', {}, glow);
    el('feMergeNode', { in: 'b' }, mg); el('feMergeNode', { in: 'SourceGraphic' }, mg);
    const hatch = el('pattern', { id: 'brique', width: 12, height: 6, patternUnits: 'userSpaceOnUse' }, defs);
    el('path', { d: 'M0 .5H12M0 3.5H12M6 .5V3.5M0 3.5V6M12 3.5V6', stroke: mem ? C.beton : C.beton, 'stroke-opacity': mem ? .16 : .5, 'stroke-width': .6, fill: 'none' }, hatch);

    // contexte : voisins, trottoir
    const voisin = nuit ? C.graphite : C.beton;
    el('rect', { x: 0, y: 470, width: 108, height: G - 470, fill: voisin, opacity: nuit ? .55 : .22 });
    el('rect', { x: 447, y: 80, width: 113, height: G - 80, fill: voisin, opacity: nuit ? .55 : .22 });
    el('rect', { x: 0, y: G, width: 560, height: 14, fill: C.beton, opacity: nuit ? .25 : .35 });
    el('rect', { x: 0, y: G + 14, width: 560, height: 46, fill: nuit ? C.graphite : C.beton, opacity: nuit ? .5 : .15 });

    const body = mem ? (nuit ? C.graphite : C.encre) : (nuit ? '#3a3936' : '#D9D4CB');
    const tower = mem ? (nuit ? C.encre : C.graphite) : (nuit ? '#4a4844' : C.craie);

    // pavillon / mezzanine
    if (mem) {
      el('rect', { x: 150, y: yAt(178.7), width: 180, height: 7, fill: nuit ? C.graphite : C.encre });
      el('rect', { x: 154, y: yAt(178), width: 172, height: yAt(171.6) - yAt(178), fill: nuit ? C.craie : C.graphite, opacity: nuit ? .9 : 1, filter: nuit ? 'url(#glow)' : '' });
      for (let x = 154; x <= 326; x += 28.6) el('line', { x1: x, x2: x, y1: yAt(178), y2: yAt(171.6), stroke: nuit ? C.graphite : C.encre, 'stroke-width': 2 });
      if (!nuit) el('rect', { x: 154, y: yAt(178), width: 172, height: 18, fill: C.beton, opacity: .18 });
      el('line', { x1: X0, x2: XB, y1: yAt(171.6) - 9, y2: yAt(171.6) - 9, stroke: C.beton, 'stroke-width': 1.2 });   // garde-corps
      for (let x = X0; x <= XB; x += 20) el('line', { x1: x, x2: x, y1: yAt(171.6) - 9, y2: yAt(171.6), stroke: C.beton, 'stroke-width': .8 });
    } else {
      el('rect', { x: X0, y: yAt(178.7), width: 240, height: yAt(171.6) - yAt(178.7), fill: nuit ? '#2c2b29' : '#55534f' });
      for (let i = 0; i < 4; i++) el('rect', { x: 196 + i * 22, y: yAt(177.5), width: 16, height: 42, fill: nuit ? C.craie : C.graphite, opacity: nuit ? .8 : 1 });
    }

    // corps + cage d'escalier
    el('rect', { x: X0, y: yAt(171.6), width: XB - X0, height: G - yAt(171.6), fill: body });
    el('rect', { x: XB, y: yAt(171.6), width: X1 - XB, height: G - yAt(171.6), fill: tower });
    el('rect', { x: XB, y: yAt(171.6), width: X1 - XB, height: G - yAt(171.6), fill: 'url(#brique)' });
    if (mem) el('rect', { x: X0 - 3, y: yAt(171.6) - 3, width: X1 - X0 + 6, height: 4, fill: nuit ? C.beton : C.graphite });   // couronnement

    // étages 2 à 7
    let i = 0;
    for (let n = 2; n <= 7; n++) {
      const top = yAt(118.5 + 9.5 * (n - 2)), bot = yAt(109 + 9.5 * (n - 2));
      if (mem) {
        el('line', { x1: X0, x2: XB, y1: bot, y2: bot, stroke: nuit ? C.encre : C.graphite, 'stroke-width': 1.4 });
      } else {
        // panneaux gris en damier (M1/M2)
        for (let c = 0; c < 6; c++) el('rect', { x: X0 + c * 40, y: top, width: 40, height: 95, fill: C.beton, opacity: ((c + n) % 2 ? .55 : .8) * (nuit ? .5 : 1) });
      }
      [160, 240, 320].forEach(cx => {
        const w = mem ? 46 : 44, h = 58, x = cx - w / 2, y = top + 18;
        const lit = nuit && LIT[i++] === '1';
        if (mem) {
          // la porte : cadre béton ouvert vers le bas
          el('path', { d: `M${x - 7} ${y + h + 10} V${y - 8} H${x + w + 7} V${y + h + 10}`, fill: 'none', stroke: C.beton, 'stroke-width': 3.2, opacity: nuit ? .55 : 1 });
        }
        el('rect', { x, y, width: w, height: h, fill: lit ? C.craie : (mem ? (nuit ? C.encre : C.graphite) : (nuit ? '#1b1b1c' : C.graphite)), opacity: lit ? .92 : 1, filter: lit ? 'url(#glow)' : '' });
        if (!lit && !nuit) el('path', { d: `M${x} ${y + h * .55} L${x + w * .55} ${y} H${x + w * .8} L${x} ${y + h * .85}Z`, fill: C.beton, opacity: .14 });
        el('line', { x1: x + w / 2, x2: x + w / 2, y1: y, y2: y + h, stroke: mem ? C.encre : C.craie, 'stroke-width': 1.2, opacity: .8 });
        if (!mem) el('rect', { x, y, width: w, height: h, fill: 'none', stroke: C.craie, 'stroke-width': 1.5 });
      });
    }

    // enseigne verticale sur la cage d'escalier
    if (mem) {
      const t = el('text', {
        x: 0, y: 0, transform: `translate(${(XB + X1) / 2 + 6} ${yAt(166) + 14}) rotate(90)`,
        'font-family': 'Space Mono, monospace', 'font-size': 15, 'letter-spacing': 7.6, fill: C.craie,
        filter: nuit ? 'url(#glow)' : ''
      });
      t.textContent = 'HÔTEL · MEMENTO · MONTRÉAL';
    }

    // rez-de-chaussée
    const rTop = yAt(109);
    if (mem) {
      el('rect', { x: X0, y: rTop, width: XB - X0, height: 12, fill: nuit ? C.graphite : C.encre });          // bandeau
      const cafe = el('text', { x: 134, y: rTop + 9, 'font-family': 'Space Mono, monospace', 'font-size': 8, 'letter-spacing': 2.4, fill: C.craie }); cafe.textContent = 'CAFÉ · MEMENTO';
      const gy = rTop + 14;
      el('rect', { x: X0 + 6, y: gy, width: XB - X0 - 12, height: G - gy, fill: nuit ? C.craie : C.graphite, opacity: nuit ? .88 : 1, filter: nuit ? 'url(#glow)' : '' });
      for (let x = X0 + 6; x <= XB - 6; x += 45.6) el('line', { x1: x, x2: x, y1: gy, y2: G, stroke: C.encre, 'stroke-width': 2.4 });
      if (!nuit) el('path', { d: `M${X0 + 6} ${G - 20} L${X0 + 90} ${gy} H${X0 + 130} L${X0 + 6} ${G - 2}Z`, fill: C.beton, opacity: .13 });
      // tables du café, en silhouette la nuit
      if (nuit) [150, 205, 285].forEach(x => { el('rect', { x: x - 10, y: G - 26, width: 20, height: 3, fill: C.graphite }); el('rect', { x: x - 1, y: G - 24, width: 2, height: 24, fill: C.graphite }); });
      // l'entrée : la porte, dans la cage d'escalier
      const ex = XB + 12, ew = X1 - XB - 24, ey = rTop + 4;
      el('rect', { x: ex, y: ey, width: ew, height: G - ey, fill: nuit ? C.craie : C.encre, opacity: nuit ? .75 : 1 });
      el('path', { d: `M${ex} ${G} V${ey} H${ex + ew} V${G}`, fill: 'none', stroke: C.craie, 'stroke-width': 4 });
      // enseigne drapeau : le seul point vermillon de la façade
      const sx = X0 - 34, sy = yAt(116.5);
      el('line', { x1: sx + 24, x2: X0, y1: sy + 10, y2: sy + 10, stroke: C.beton, 'stroke-width': 2 });
      el('line', { x1: sx + 24, x2: X0, y1: sy + 98, y2: sy + 98, stroke: C.beton, 'stroke-width': 2 });
      el('rect', { x: sx, y: sy, width: 26, height: 108, fill: C.encre, stroke: C.craie, 'stroke-width': 1.2, filter: nuit ? 'url(#glow)' : '' });
      el('path', { d: `M${sx + 6} ${sy + 34} V${sy + 10} H${sx + 20} V${sy + 34}`, fill: 'none', stroke: C.craie, 'stroke-width': 1.6 });
      el('circle', { cx: sx + 13, cy: sy + 27, r: 2.4, fill: C.vermillon });
      const m = el('text', { x: 0, y: 0, transform: `translate(${sx + 16.5} ${sy + 44}) rotate(90)`, 'font-family': 'Space Grotesk, sans-serif', 'font-weight': 500, 'font-size': 9.5, 'letter-spacing': 2.2, fill: C.craie });
      m.textContent = 'MEMENTO';
    } else {
      el('rect', { x: X0, y: rTop, width: X1 - X0, height: G - rTop, fill: nuit ? '#4a4844' : C.craie });
      el('rect', { x: X0, y: rTop, width: X1 - X0, height: G - rTop, fill: 'url(#brique)' });
      [[132, 'P', 334], [212, 'V', 'CAFÉ BUANDERIE'], [365, 'P', 330]].forEach(([x, k, s]) => {
        el('rect', { x, y: rTop + 6, width: 58, height: 16, fill: C.beton });
        const t = el('text', { x: x + 29, y: rTop + 17, 'text-anchor': 'middle', 'font-family': 'Space Mono, monospace', 'font-size': k === 'V' ? 5.5 : 8, fill: C.encre }); t.textContent = s;
        el('rect', { x: x + 6, y: k === 'V' ? rTop + 32 : rTop + 28, width: 46, height: k === 'V' ? 40 : G - rTop - 28, fill: nuit ? C.craie : C.graphite, opacity: nuit ? .8 : 1, stroke: C.encre, 'stroke-width': 2 });
      });
    }

    // étages interactifs (zones de survol)
    FLOORS.forEach(([k, b, t]) => {
      const g = el('g', { class: 'fl' + (state.on === k ? ' on' : ''), 'data-k': k, tabindex: -1 });
      const y1 = yAt(t), y2 = yAt(b);
      const x1 = k === 'toit' ? 150 : X0, x2 = k === 'toit' ? 330 : X1;
      el('rect', { class: 'hit', x: x1, y: y1, width: x2 - x1, height: y2 - y1 }, g);
      el('line', { class: 'tick', x1: X1 + 6, x2: X1 + 30, y1: (y1 + y2) / 2, y2: (y1 + y2) / 2, stroke: C.vermillon, 'stroke-width': 1.4 }, g);
      const lb = el('text', { class: 'tick', x: X1 + 34, y: (y1 + y2) / 2 + 3.5, 'font-family': 'Space Mono, monospace', 'font-size': 10, 'letter-spacing': 1.5, fill: nuit ? C.craie : C.encre }, g);
      lb.textContent = floorOf(k).n;
      g.addEventListener('mouseenter', () => select(k));
      g.addEventListener('click', () => select(k));
    });

    document.getElementById('legende').textContent = L.vers[state.v];
  }

  function floorOf(k) { return L.floors.find(f => f.k === k); }

  function select(k) {
    state.on = k;
    const f = floorOf(k);
    document.getElementById('d-etq').textContent = k === 'toit' ? f.n : (k === 'rdc' ? f.n : L.etage + ' ' + f.n);
    document.getElementById('d-titre').textContent = f.t;
    document.getElementById('d-txt').textContent = f.d;
    svg.querySelectorAll('.fl').forEach(g => g.classList.toggle('on', g.dataset.k === k));
    document.querySelectorAll('#pile button').forEach(b => b.setAttribute('aria-current', b.dataset.k === k));
  }

  // la pile d'étages, dans le panneau
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
    const grp = b.parentElement;
    grp.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    if (b.dataset.v) state.v = b.dataset.v;
    if (b.dataset.m) { state.m = b.dataset.m; stage.classList.toggle('nuit', state.m === 'nuit'); }
    draw(); select(state.on);
  }));

  // lien direct : #nuit, #origine (combinables : #origine-nuit)
  const h = location.hash;
  if (/nuit|night/.test(h)) document.querySelector('[data-m="nuit"]').click();
  if (/origine|original/.test(h)) document.querySelector('[data-v="origine"]').click();

  draw(); select(state.on);
  if (document.fonts) document.fonts.ready.then(() => { draw(); select(state.on); });
})();

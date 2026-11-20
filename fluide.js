/* MEMENTO — le mouvement des pages bâtiment (Montréal, Namur ; FR/EN).
   Des ressorts (amortissement + réponse, à la manière d'Apple) plutôt que des durées
   fixes : tout part de la valeur affichée, donc tout peut être repris en plein vol.
   La page annonce ses changements par deux événements :
     memento:dessin  — la façade vient d'être redessinée
     memento:select  — un étage (ou une zone) est choisi ; detail = sa clé
   Sans ce fichier, les pages fonctionnent exactement comme avant. */
(function () {
  const calme = matchMedia('(prefers-reduced-motion: reduce)');

  // Un ressort : k et c tirés de la réponse (s) et de l'amortissement (1 = sans rebond).
  function Ressort(pose, zeta, rep) {
    const r = { val: 0, vit: 0, cible: 0, zeta, rep, raf: 0, t0: 0 };
    function pas(t) {
      const dt = Math.min((t - r.t0) / 1000, 1 / 30); r.t0 = t;
      const k = Math.pow(2 * Math.PI / r.rep, 2), c = 4 * Math.PI * r.zeta / r.rep;
      r.vit += (-k * (r.val - r.cible) - c * r.vit) * dt; r.val += r.vit * dt;
      if (Math.abs(r.vit) < .01 && Math.abs(r.val - r.cible) < .01) { r.val = r.cible; r.vit = 0; pose(r.val); r.raf = 0; return; }
      pose(r.val); r.raf = requestAnimationFrame(pas);
    }
    r.vers = c => {
      r.cible = c;
      if (calme.matches) { r.val = c; r.vit = 0; pose(c); return; }
      if (!r.raf) { r.t0 = performance.now(); r.raf = requestAnimationFrame(pas); }
    };
    r.poser = v => { cancelAnimationFrame(r.raf); r.raf = 0; r.val = r.cible = v; r.vit = 0; pose(v); };
    return r;
  }

  document.documentElement.classList.add('js');

  /* La barre flotte ; son filet n'apparaît que quand du contenu passe dessous. */
  const bar = document.querySelector('.topbar');
  if (bar) { const maj = () => bar.classList.toggle('sous', scrollY > 4); addEventListener('scroll', maj, { passive: true }); maj(); }

  /* Le curseur d'étage : une bande qui glisse d'un étage à l'autre. */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('facade');
  let curseur = null, place = false, choisi = null;
  const box = { x: 0, y: 0, w: 0, h: 0 };
  const poseCurseur = () => { if (curseur) { curseur.setAttribute('x', box.x); curseur.setAttribute('y', box.y); curseur.setAttribute('width', Math.max(0, box.w)); curseur.setAttribute('height', Math.max(0, box.h)); } };
  const R = {};
  ['x', 'y', 'w', 'h'].forEach(k => { R[k] = Ressort(v => { box[k] = v; poseCurseur(); }, 1, .32); });
  function viser(k, saut) {
    const hit = svg && svg.querySelector(`.fl[data-k="${k}"] rect.hit`); if (!hit) return;
    const t = { x: +hit.getAttribute('x'), y: +hit.getAttribute('y'), w: +hit.getAttribute('width'), h: +hit.getAttribute('height') };
    for (const c in t) saut ? R[c].poser(t[c]) : R[c].vers(t[c]);
  }
  document.addEventListener('memento:dessin', () => {
    if (!svg) return;
    curseur = document.createElementNS(NS, 'rect');
    curseur.setAttribute('class', 'curseur');
    const premier = svg.querySelector('.fl');
    premier ? svg.insertBefore(curseur, premier) : svg.appendChild(curseur);
    poseCurseur();
  });

  /* Le panneau : le texte arrive du côté où l'on s'est déplacé dans le bâtiment. */
  const detail = document.querySelector('.detail');
  const glisse = Ressort(v => { if (detail) { detail.style.transform = `translateY(${v}px)`; detail.style.opacity = 1 - Math.min(1, Math.abs(v) / 14) * .65; } }, 1, .3);
  const ordre = k => [...document.querySelectorAll('#pile button')].findIndex(b => b.dataset.k === k);

  document.addEventListener('memento:select', e => {
    const k = e.detail;
    if (!place) { viser(k, true); place = true; choisi = k; return; }
    viser(k, false);
    if (k !== choisi && detail) {
      // la pile se lit de haut en bas : monter dans le bâtiment fait arriver le texte d'en haut
      const sens = ordre(k) < ordre(choisi) ? -1 : 1;
      glisse.poser(sens * 14); glisse.vers(0);
    }
    choisi = k;
  });

  /* Jour / nuit : un pouce qui glisse, et la façade qui passe d'un état à l'autre en fondu. */
  document.querySelectorAll('.seg').forEach(seg => {
    const pouce = document.createElement('span'); pouce.className = 'pouce'; pouce.setAttribute('aria-hidden', 'true');
    seg.prepend(pouce);
    const px = Ressort(v => { pouce.style.transform = `translateX(${v}px)`; }, 1, .3);
    const pw = Ressort(v => { pouce.style.width = v + 'px'; }, 1, .3);
    const cale = saut => {
      const b = seg.querySelector('button[aria-pressed="true"]'); if (!b) return;
      saut ? (px.poser(b.offsetLeft), pw.poser(b.offsetWidth)) : (px.vers(b.offsetLeft), pw.vers(b.offsetWidth));
    };
    seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.getAttribute('aria-pressed') !== 'true' && svg) fondu();
      requestAnimationFrame(() => cale(false));
    }, true);
    cale(true);
    if (document.fonts) document.fonts.ready.then(() => cale(true));
    addEventListener('resize', () => cale(true));
  });

  // L'ancienne façade, figée par-dessus la nouvelle, s'efface.
  function fondu() {
    const stage = svg.parentElement, r = svg.getBoundingClientRect(), s = stage.getBoundingClientRect();
    const copie = svg.cloneNode(true);
    copie.removeAttribute('id'); copie.setAttribute('aria-hidden', 'true');
    copie.querySelectorAll('[id]').forEach(n => { if (n.tagName === 'title') n.remove(); });
    Object.assign(copie.style, { position: 'absolute', left: (r.left - s.left) + 'px', top: (r.top - s.top) + 'px', width: r.width + 'px', height: r.height + 'px', pointerEvents: 'none', transition: `opacity ${calme.matches ? 150 : 450}ms ease`, zIndex: 1 });
    stage.appendChild(copie);
    requestAnimationFrame(() => requestAnimationFrame(() => { copie.style.opacity = 0; }));
    setTimeout(() => copie.remove(), 600);
  }
})();

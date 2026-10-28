/** Ponto de entrada: inicializa módulos, acessibilidade, menu e FAQ. */
import { store } from './utils/storage.js';
import { initAuth } from './modules/auth.js';
import { initMailer } from './modules/mailer.js';
import { initTestimonials } from './modules/testimonials.js';
import { initTriage } from './modules/triage.js';
import { initMap } from './modules/map.js';
import { initCalendar } from './modules/calendar.js';

const root = document.documentElement;

function initA11y() {
  let level = store.get('fontLevel', 0);
  const applyFont = () => { root.style.fontSize = (100 + level * 12.5) + '%'; store.set('fontLevel', level); };
  document.querySelectorAll('[data-font]').forEach((b) => b.addEventListener('click', () => {
    const d = Number(b.dataset.font);
    level = d === 0 ? 0 : Math.max(-2, Math.min(4, level + d));
    applyFont();
  }));
  applyFont();

  const btn = document.getElementById('contrast');
  const setContrast = (on) => {
    root.dataset.contrast = on ? 'high' : 'normal';
    btn.setAttribute('aria-pressed', String(on));
    store.set('contrast', on);
  };
  btn.addEventListener('click', () => setContrast(root.dataset.contrast !== 'high'));
  setContrast(store.get('contrast', false));
}

function initNav() {
  const btn = document.getElementById('menu-btn'), nav = document.getElementById('nav');
  btn.addEventListener('click', () => btn.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
  nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
}

function initAccordion() {
  document.getElementById('accordion').addEventListener('click', (e) => {
    const btn = e.target.closest('button[aria-controls]');
    if (!btn) return;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
  });
}

// Ordem importa: depoimentos renderizam antes da triagem para que o filtro os alcance.
initA11y();
initNav();
initAuth();
initMailer();
initTestimonials();
initTriage();
initMap();
initCalendar();
initAccordion();

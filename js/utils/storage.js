/** Camada de persistência (localStorage) com namespace e tratamento de erros, + utilitários de UI. */
const NS = 'or:';

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(NS + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) { try { localStorage.removeItem(NS + key); } catch { /* ignora */ } }
};

/** Escapa HTML para evitar injeção ao renderizar texto do usuário. */
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

let toastTimer;
/** Mensagem curta e acessível (região aria-live). */
export function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

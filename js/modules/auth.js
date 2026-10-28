/**
 * Autenticação não-bloqueante (soft-gate).
 * DEMO: contas ficam no localStorage com hash SHA-256. Em produção, troque por API segura (HTTPS, bcrypt/argon2, sessão httpOnly).
 */
import { store, esc, toast, isEmail } from '../utils/storage.js';

const listeners = [];
let mode = 'register';
const $ = (id) => document.getElementById(id);

async function hash(text) {
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(text)));
}

export function currentUser() {
  const email = store.get('session');
  const user = (store.get('users', {}))[email];
  return user ? { email, name: user.name, status: user.status } : null;
}

export const onAuthChange = (cb) => listeners.push(cb);

function renderArea() {
  const user = currentUser();
  const area = $('auth-area');
  area.innerHTML = user
    ? `<span class="tag">Olá, ${esc(user.name)}</span><button class="btn-icon" id="logout">Sair</button>`
    : `<button class="btn-icon" id="login-btn">Entrar</button>`;
  const out = $('logout'); if (out) out.onclick = logout;
  const inn = $('login-btn'); if (inn) inn.onclick = () => openGate('Entre para guardar suas preferências e lembretes.');
}

function setMode(next) {
  mode = next;
  const reg = mode === 'register';
  $('auth-name-wrap').hidden = !reg;
  $('auth-treat-wrap').hidden = !reg;
  $('auth-submit').textContent = reg ? 'Criar conta' : 'Entrar';
  $('auth-switch').textContent = reg ? 'Já tenho conta' : 'Quero criar conta';
  $('auth-pass').autocomplete = reg ? 'new-password' : 'current-password';
  $('auth-error').textContent = '';
}

/** Abre o convite de cadastro/login; ignorar ou fechar nunca bloqueia o uso. */
export function openGate(reason) {
  const dlg = $('auth-dialog');
  if (currentUser() || dlg.open) return;
  $('auth-reason').textContent = reason || 'Crie uma conta para salvar seu progresso. É opcional.';
  setMode('register');
  dlg.showModal();
}

export function logout() {
  store.remove('session');
  renderArea();
  listeners.forEach((cb) => cb(null));
  toast('Você saiu da conta.');
}

export function initAuth() {
  const dlg = $('auth-dialog');
  $('auth-close').onclick = () => dlg.close();
  $('auth-switch').onclick = () => setMode(mode === 'register' ? 'login' : 'register');
  $('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('auth-email').value.trim().toLowerCase();
    const pass = $('auth-pass').value;
    const err = $('auth-error');
    if (!isEmail(email)) { err.textContent = 'Informe um e-mail válido.'; return; }
    if (pass.length < 8) { err.textContent = 'A senha precisa ter pelo menos 8 caracteres.'; return; }
    const users = store.get('users', {});
    const h = await hash(pass);
    if (mode === 'register') {
      const name = $('auth-name').value.trim();
      if (name.length < 2) { err.textContent = 'Informe seu nome.'; return; }
      if (users[email]) { err.textContent = 'Este e-mail já tem conta. Use "Já tenho conta".'; return; }
      // O status de tratamento só é gravado se a pessoa marcar explicitamente.
      users[email] = { name, hash: h, status: $('auth-treat').checked ? 'treatment' : 'none' };
      store.set('users', users);
    } else if (!users[email] || users[email].hash !== h) {
      err.textContent = 'E-mail ou senha incorretos.'; return;
    }
    store.set('session', email);
    dlg.close();
    $('auth-form').reset();
    renderArea();
    listeners.forEach((cb) => cb(currentUser()));
    toast('Tudo certo! Você está conectada.');
  });
  renderArea();
}

/** Triagem "Sua primeira vez?": destaca/atenua conteúdos por perfil, sem recarregar a página. */
import { store, esc, toast, isEmail } from '../utils/storage.js';
import { currentUser, openGate } from './auth.js';
import { send } from './mailer.js';

const PANELS = {
  me: () => `<h3>Vamos começar com calma</h3><p>Destacamos o caminho no SUS e as dúvidas mais comuns. Quer receber um guia ilustrativo por e-mail?</p>
    <form data-form="me" novalidate><label for="t-email">Seu e-mail</label><input id="t-email" type="email" autocomplete="email" value="${esc(currentUser()?.email || '')}">
    <p class="error" role="alert"></p><button class="btn btn-primary" type="submit">Receber guia por e-mail</button></form>`,
  support: () => `<h3>Obrigada por cuidar de quem você ama</h3><p>Destacamos orientações para quem apoia. Você pode enviar um guia em seu nome.</p>
    <form data-form="support" novalidate>
    <label for="t-from">Seu nome</label><input id="t-from" autocomplete="name" value="${esc(currentUser()?.name || '')}">
    <label for="t-to">E-mail da pessoa querida</label><input id="t-to" type="email">
    <label class="check"><input type="checkbox" id="t-consent"> Tenho certeza de que essa pessoa pode receber esta mensagem.</label>
    <p class="error" role="alert"></p><button class="btn btn-primary" type="submit">Enviar mensagem de apoio</button></form>`,
  treat: () => `<h3>Você não está sozinha</h3><p>Destacamos seus direitos (como a Lei dos 60 dias) e redes de apoio. Respire, vá no seu tempo.</p>
    <button class="btn btn-primary" data-done>Concluir</button>`
};

/** Aplica destaque (is-match) e atenuação (is-dim) em todo elemento com data-audience. */
export function applyProfile(profile) {
  document.querySelectorAll('[data-audience]').forEach((el) => {
    const match = !!profile && el.dataset.audience.split(' ').includes(profile);
    el.classList.toggle('is-match', match);
    el.classList.toggle('is-dim', !!profile && !match);
  });
}

export function initTriage() {
  const buttons = [...document.querySelectorAll('.profile')];
  const out = document.getElementById('triage-result');

  const select = (profile, announce) => {
    const current = store.get('profile');
    const next = announce && current === profile ? null : profile; // clicar de novo limpa o filtro
    store.set('profile', next);
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.profile === next)));
    applyProfile(next);
    out.hidden = !next;
    out.innerHTML = next ? PANELS[next]() : '';
    if (next && announce) toast('Conteúdos relevantes destacados.');
  };

  buttons.forEach((b) => b.addEventListener('click', () => select(b.dataset.profile, true)));

  out.addEventListener('click', (e) => {
    if (e.target.matches('[data-done]')) openGate('Quer criar uma conta para guardar suas preferências? É opcional.');
  });

  out.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target, err = form.querySelector('.error');
    if (form.dataset.form === 'me') {
      const to = form.querySelector('#t-email').value.trim();
      if (!isEmail(to)) { err.textContent = 'Informe um e-mail válido.'; return; }
      send(to, 'guide', { name: currentUser()?.name || '' });
    } else {
      const from = form.querySelector('#t-from').value.trim();
      const to = form.querySelector('#t-to').value.trim();
      if (from.length < 2) { err.textContent = 'Informe seu nome para a mensagem.'; return; }
      if (!isEmail(to)) { err.textContent = 'Informe um e-mail válido da pessoa.'; return; }
      if (!form.querySelector('#t-consent').checked) { err.textContent = 'Confirme que a pessoa pode receber a mensagem.'; return; }
      send(to, 'support', { from });
    }
    err.textContent = '';
    form.reset();
    openGate('Triagem concluída! Quer criar uma conta para guardar suas preferências? É opcional.');
  });

  select(store.get('profile'), false); // restaura escolha anterior
}

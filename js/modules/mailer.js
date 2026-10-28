/**
 * Camada de e-mails (SIMULAÇÃO frontend). Cada envio vai para uma "caixa de saída" local.
 * Em produção, troque deliver() por um fetch para seu backend (SendGrid, SES etc.).
 * Regra ética: tom neutro por padrão; tom de acompanhamento só se o perfil declarou tratamento.
 */
import { store, esc, toast } from '../utils/storage.js';
import { currentUser } from './auth.js';

const SITE = location.href.split('#')[0];
const DAY = 86400000;
const fmt = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });

const TEMPLATES = {
  guide: ({ name }) => ({
    subject: 'Seu guia para a primeira mamografia e o autoconhecimento',
    body: `Olá${name ? ', ' + name : ''}!\n\nGuia rápido (orientações gerais):\n1. Procure a UBS do seu bairro com documento com foto e Cartão SUS.\n2. Peça avaliação das mamas e a solicitação de mamografia.\n3. No dia do exame, use roupa de duas peças e leve exames anteriores, se houver.\n4. Observe suas mamas no dia a dia e procure atendimento diante de qualquer mudança.\n5. Anote datas e protocolos dos agendamentos.\n\nVolte quando quiser: ${SITE}\n\nEste conteúdo é informativo e não substitui orientação médica.`
  }),
  support: ({ from }) => ({
    subject: `${from} enviou um guia de cuidados para você`,
    body: `Olá!\n\n${from}, que se importa com você, enviou este guia de cuidados.\n\n• Cuidar da saúde das mamas faz parte do autocuidado de toda mulher.\n• A UBS do seu bairro pode orientar e solicitar a mamografia.\n• Pelo SUS, a mamografia é garantida a partir dos 40 anos.\n• Você não precisa passar por nada sozinha.\n\nConheça a plataforma: ${SITE}\n\nConteúdo informativo; não substitui orientação médica.`
  }),
  confirm: ({ title, start, place, treat }) => ({
    subject: treat ? 'Sua consulta de acompanhamento está registrada' : 'Confirmação: lembrete do seu autocuidado',
    body: `${treat ? 'Sua consulta de acompanhamento foi registrada. Conte com quem cuida de você.' : 'Seu compromisso de autocuidado foi registrado.'}\n\n${title}\nQuando: ${fmt(start)}\nOnde: ${place}\n\nVocê receberá lembretes por e-mail antes da data.`
  }),
  remind: ({ title, start, place, treat, days }) => ({
    subject: treat ? `Lembrete da sua consulta de acompanhamento (${days === 1 ? 'amanhã' : 'em ' + days + ' dias'})`
                   : 'Lembrete do seu exame de rotina e autocuidado',
    body: `${treat ? 'Estamos pensando em você. Sua consulta se aproxima.' : 'Cuidar de você é importante. Um lembrete gentil:'}\n\n${title}\nQuando: ${fmt(start)}\nOnde: ${place}\n\nSe precisar remarcar, sem problema: o importante é manter o cuidado.`
  })
};

/** Entrega simulada: grava na caixa de saída. */
function deliver(message) {
  const box = store.get('outbox', []);
  box.unshift(message);
  store.set('outbox', box.slice(0, 30));
  renderOutbox();
}

export function send(to, key, data = {}, sendAt = Date.now()) {
  const { subject, body } = TEMPLATES[key](data);
  deliver({ id: Date.now() + Math.random(), to, subject, body, sendAt });
  if (sendAt <= Date.now()) toast(`E-mail simulado enviado para ${to}.`);
}

/** Confirmação imediata + lembretes 7 e 1 dia antes (apenas datas futuras). */
export function scheduleAppointment({ email, title, start, place }) {
  const user = currentUser();
  const treat = !!(user && user.status === 'treatment');
  const base = { title, start: start.getTime(), place, treat };
  send(email, 'confirm', base);
  [7, 1].forEach((days) => {
    const at = start.getTime() - days * DAY;
    if (at > Date.now()) send(email, 'remind', { ...base, days }, at);
  });
}

export function renderOutbox() {
  const list = document.getElementById('outbox-list');
  const box = store.get('outbox', []);
  if (!box.length) { list.innerHTML = '<li>Nenhum e-mail simulado ainda.</li>'; return; }
  list.innerHTML = box.map((m) => {
    const status = m.sendAt <= Date.now() ? 'enviado (simulado)' : 'agendado para ' + new Date(m.sendAt).toLocaleDateString('pt-BR');
    return `<li><details><summary>${esc(m.subject)} → ${esc(m.to)} · ${status}</summary><pre>${esc(m.body)}</pre></details></li>`;
  }).join('');
}

export const initMailer = renderOutbox;

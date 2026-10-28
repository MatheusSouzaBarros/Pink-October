/** Marcador de consulta: link do Google Agenda, arquivo .ics e e-mails simulados. */
import { esc, toast, isEmail } from '../utils/storage.js';
import { currentUser, openGate } from './auth.js';
import { scheduleAppointment } from './mailer.js';
import { UNITS } from './map.js';

const pad = (n) => String(n).padStart(2, '0');
/** Horário local "flutuante" (sem fuso), aceito por Google Agenda e ICS. */
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const icsEsc = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function googleLink({ title, start, end, place, details }) {
  const p = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${stamp(start)}/${stamp(end)}`, details, location: place });
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}

export function buildICS({ title, start, end, place, details }) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Outubro Rosa//PT-BR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${Date.now()}@outubro-rosa`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${icsEsc(title)}`, `LOCATION:${icsEsc(place)}`, `DESCRIPTION:${icsEsc(details)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Lembrete de autocuidado', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

let blobUrl;

export function initCalendar() {
  const form = document.getElementById('appt-form');
  const result = document.getElementById('appt-result');
  const err = document.getElementById('a-err');
  const date = document.getElementById('a-date');
  date.min = new Date().toISOString().slice(0, 10);
  document.getElementById('places').innerHTML = UNITS.map((u) => `<option value="${esc(u.name)}">`).join('');
  document.getElementById('a-email').value = currentUser()?.email || '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('a-title').value.trim();
    const place = document.getElementById('a-place').value.trim();
    const email = document.getElementById('a-email').value.trim();
    const start = new Date(`${date.value}T${document.getElementById('a-time').value}`);
    if (!title || !place || isNaN(start)) { err.textContent = 'Preencha o que será feito, a data, a hora e o local.'; return; }
    if (email && !isEmail(email)) { err.textContent = 'O e-mail informado não é válido.'; return; }
    err.textContent = '';
    const end = new Date(start.getTime() + 3600000);
    const details = 'Lembrete do seu exame de rotina e autocuidado. Plataforma Outubro Rosa: Acolher & Prevenir.';
    const ev = { title, start, end, place, details };
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = URL.createObjectURL(new Blob([buildICS(ev)], { type: 'text/calendar;charset=utf-8' }));
    result.innerHTML = `<h3>Consulta marcada</h3><p><strong>${esc(title)}</strong><br>${esc(start.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }))}<br>${esc(place)}</p>
      <div class="actions"><a class="btn btn-primary" href="${esc(googleLink(ev))}" target="_blank" rel="noopener">Adicionar ao Google Agenda</a>
      <a class="btn btn-outline" href="${blobUrl}" download="consulta-outubro-rosa.ics">Baixar .ics (Apple/Outlook)</a></div>
      <p class="hint">${email ? 'Enviamos (simulação) a confirmação e agendamos lembretes. Veja a caixa de saída no rodapé.' : 'Informe um e-mail se quiser receber confirmação e lembretes.'}</p>`;
    if (email) scheduleAppointment({ email, title, start, place });
    toast('Consulta marcada!');
    openGate('Quer criar uma conta para guardar seus lembretes? É opcional.');
  });
}

/** Mapa Leaflet da Grande SP. Sem geolocalização: centro fixo e marcadores predefinidos. */
import { esc } from '../utils/storage.js';

export const UNITS = [
  { name: 'Hospital Pérola Byington', lat: -23.5589, lng: -46.6498, type: 'Centro de referência em saúde da mulher', addr: 'Av. Brigadeiro Luís Antônio, 683 – Bela Vista, São Paulo', tel: '(11) 3248-8000', care: 'Mamografia, ultrassonografia, biópsia e tratamento oncológico pelo SUS.' },
  { name: 'ICESP – Instituto do Câncer do Estado de SP', lat: -23.5578, lng: -46.6694, type: 'Hospital de oncologia', addr: 'Av. Dr. Arnaldo, 251 – Cerqueira César, São Paulo', tel: '(11) 3893-2000', care: 'Tratamento oncológico de alta complexidade, por encaminhamento do SUS.' },
  { name: 'Hospital das Clínicas (HCFMUSP)', lat: -23.5565, lng: -46.6700, type: 'Hospital universitário', addr: 'Av. Dr. Enéas de Carvalho Aguiar, 255 – Cerqueira César, São Paulo', tel: '(11) 2661-0000', care: 'Mastologia, exames de imagem e acompanhamento oncológico, por encaminhamento.' },
  { name: 'Hospital A.C. Camargo Cancer Center', lat: -23.5641, lng: -46.6313, type: 'Centro de câncer', addr: 'R. Prof. Antônio Prudente, 211 – Liberdade, São Paulo', tel: '(11) 2189-5000', care: 'Prevenção, diagnóstico e tratamento. Atende SUS (por encaminhamento), convênios e particular.' },
  { name: 'Hospital São Paulo (Unifesp)', lat: -23.5983, lng: -46.6420, type: 'Hospital universitário', addr: 'R. Napoleão de Barros, 715 – Vila Mariana, São Paulo', tel: '(11) 5576-4000', care: 'Ambulatório de mastologia e exames de imagem pelo SUS, por encaminhamento.' }
];

export function initMap() {
  const el = document.getElementById('map');
  const card = document.getElementById('unit-card');
  const list = document.getElementById('unit-list');
  if (!window.L) { el.innerHTML = '<p style="padding:24px">Não foi possível carregar o mapa. Use a lista de unidades ao lado.</p>'; }

  const show = (u, idx) => {
    card.innerHTML = `<h3>${esc(u.name)}</h3><p><span class="tag">${esc(u.type)}</span></p>
      <p><strong>Endereço:</strong> ${esc(u.addr)}<br><strong>Telefone:</strong> <a href="tel:${u.tel.replace(/\D/g, '')}">${esc(u.tel)}</a><br><strong>Atendimento:</strong> ${esc(u.care)}</p>
      <p class="hint">Confirme horários e necessidade de encaminhamento antes de ir.</p>`;
    list.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === idx)));
  };

  let map;
  if (window.L) {
    map = L.map(el, { scrollWheelZoom: false }).setView([-23.575, -46.65], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; colaboradores do OpenStreetMap' }).addTo(map);
  }

  UNITS.forEach((u, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button">${esc(u.name)}</button>`;
    li.firstChild.addEventListener('click', () => { show(u, i); if (map) map.flyTo([u.lat, u.lng], 14); });
    list.appendChild(li);
    if (map) L.marker([u.lat, u.lng], { title: u.name, alt: u.name }).addTo(map).on('click', () => show(u, i)).bindPopup(`<strong>${esc(u.name)}</strong>`);
  });
}

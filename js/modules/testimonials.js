/** Depoimentos fictícios + Espaço Seguro (relatos anônimos com localStorage). */
import { store, esc, toast } from '../utils/storage.js';
import { openGate } from './auth.js';

const STORIES = [
  { n: 'Beatriz', age: 23, uf: 'Pernambuco', tags: ['Jovem', 'Apoio da mãe'], aud: 'me support', t: 'Senti um nódulo e quase deixei para depois, por achar que era nova demais. Minha mãe foi comigo à UBS. O diagnóstico veio cedo e ela esteve ao meu lado em cada etapa.' },
  { n: 'Márcia', age: 41, uf: 'São Paulo', tags: ['Adulta', 'Rotina'], aud: 'me', t: 'A mamografia de rotina mostrou uma alteração pequena. Meu marido assumiu a casa e minhas colegas se revezaram para me levar ao hospital. Aprendi a aceitar ajuda.' },
  { n: 'Lourdes', age: 72, uf: 'Minas Gerais', tags: ['Idosa', 'SUS'], aud: 'treat support', t: 'Achei que mamografia era coisa de gente mais nova. Minha neta marcou o exame e me levou de carro. Fui muito bem tratada pelo SUS e hoje bordo com meu grupo de apoio.' },
  { n: 'Camila', age: 34, uf: 'Rio Grande do Sul', tags: ['Adulta', 'Tratamento'], aud: 'treat', t: 'Eu tinha medo até da palavra. Minha irmã anotava cada orientação médica comigo e a família criou um grupo para me animar. Terminei o tratamento em março.' },
  { n: 'Teresinha', age: 58, uf: 'Bahia', tags: ['Adulta', 'Família'], aud: 'me support', t: 'Descobri no primeiro exame depois dos 50. Meus filhos se revezaram para dormir comigo no hospital. Hoje digo a todas as amigas: vá fazer o exame.' },
  { n: 'Helena', age: 67, uf: 'Paraná', tags: ['Idosa', 'Vizinhança'], aud: 'treat support', t: 'Fiquei viúva e achei que enfrentaria tudo sozinha. Minha filha mudou de cidade para ficar perto e as vizinhas levavam comida pronta. Cada gesto valeu como um remédio a mais.' }
];

const SEED = [
  { kind: 'Relato', text: 'Fiz minha primeira mamografia aos 41 anos, depois de adiar muito. Deu tudo certo, e o alívio foi enorme.' },
  { kind: 'Pergunta', text: 'Sinto dor nas mamas perto da menstruação. Isso é normal? Quando procurar um médico?' }
];

function renderStories() {
  document.getElementById('testimonials').innerHTML = STORIES.map((s) =>
    `<article class="card" data-audience="${s.aud}">${s.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
     <p>“${esc(s.t)}”</p><p><strong>${esc(s.n)}, ${s.age} anos</strong><br>${esc(s.uf)}</p></article>`).join('');
}

function renderCommunity() {
  const items = [...store.get('stories', []), ...SEED];
  document.getElementById('story-list').innerHTML = items.map((i) =>
    `<li><b>${i.kind === 'Relato' ? 'Relato anônimo' : 'Pergunta anônima'}</b><p>${esc(i.text)}</p></li>`).join('');
}

export function initTestimonials() {
  renderStories();
  renderCommunity();
  const form = document.getElementById('story-form');
  const area = document.getElementById('story-text');
  const err = document.getElementById('story-err');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = area.value.trim();
    if (text.length < 10) { err.textContent = 'Escreva pelo menos 10 caracteres para enviar.'; area.focus(); return; }
    err.textContent = '';
    const kind = form.elements.kind.value;
    if (document.getElementById('story-ok').checked) {
      const list = store.get('stories', []);
      list.unshift({ kind, text });
      store.set('stories', list.slice(0, 50));
      renderCommunity();
    }
    form.reset();
    toast(kind === 'Relato' ? 'Obrigada por compartilhar. Seu relato é anônimo.' : 'Pergunta recebida de forma anônima. Para orientação médica, procure sua UBS.');
    openGate('Quer criar uma conta para receber orientações e lembretes? É opcional.');
  });
}

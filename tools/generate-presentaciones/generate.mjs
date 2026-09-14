// Generador de presentaciones PDF para los talleres del Semillero Singularidad.
//
// Lee el contenido editorial en content/*.md (la misma fuente que usa el sitio web)
// y construye, para cada taller y para el programa general, una presentación en PDF
// con la identidad visual del sitio (paleta, tipografía Inter, logotipos).
//
// Uso:
//   cd tools/generate-presentaciones
//   npm install playwright   (una sola vez; requiere red)
//   node generate.mjs
//
// Requiere que node tenga acceso al paquete "playwright" con Chromium instalado
// (en este entorno de construcción, PLAYWRIGHT_BROWSERS_PATH ya apunta a un Chromium
// preinstalado). Los PDF se escriben en assets/presentaciones/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..'); // raíz del sitio (taller-singularidad/)
const CONTENT_DIR = path.join(ROOT, 'content');
const OUT_DIR = path.join(ROOT, 'assets', 'presentaciones');
const LOGO_SINGULARIDAD = path.join(ROOT, 'assets', 'logos', 'singularidad.png');
const LOGO_FUCS = path.join(ROOT, 'assets', 'logos', 'fucs.png');
const FONTS_DIR = path.join(HERE, 'fonts');

fs.mkdirSync(OUT_DIR, { recursive: true });

// ───────────────────────── Tokens visuales (idénticos al sitio) ─────────────────────────
const TOKENS = {
  negro: '#0A0A0B', negro2: '#131315', superficie: '#1B1B1E', superficie2: '#222226',
  texto: '#F4F1EA', textoSec: '#B7B5AE', naranja: '#E8892E', naranja2: '#F2A94E',
  linea: '#2E2E33', verdeOk: '#4CAF7D', azulInfo: '#6FA3D8',
};

// ───────────────────────── Utilidades Markdown mínimas ─────────────────────────
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Convierte **negrita** y [texto](url) a HTML simple (para slides).
function inline(s) {
  let out = esc(s);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => `<a href="${esc(url)}">${label}</a>`);
  return out;
}

function splitSections(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let title = '';
  const sections = [];
  let current = null;
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    if (h1 && !title) { title = h1[1].trim(); continue; }
    if (h2) { current = { heading: h2[1].trim(), lines: [] }; sections.push(current); continue; }
    if (current) current.lines.push(line);
  }
  return { title, sections };
}

function section(sections, heading) {
  const s = sections.find((s) => s.heading.toLowerCase().trim() === heading.toLowerCase().trim());
  return s ? s.lines : [];
}

function bulletItems(lines) {
  return lines.filter((l) => /^-\s+/.test(l) && !/^- \[[ xX]\]/.test(l)).map((l) => l.replace(/^-\s+/, ''));
}
function numberedItems(lines) {
  return lines.filter((l) => /^\d+\.\s+/.test(l)).map((l) => l.replace(/^\d+\.\s+/, ''));
}
function checklistItems(lines) {
  return lines.filter((l) => /^- \[[ xX]\]\s+/.test(l)).map((l) => l.replace(/^- \[[ xX]\]\s+/, ''));
}
function paragraph(lines) {
  return lines.filter((l) => l.trim() !== '' && !/^-\s+/.test(l) && !/^\d+\.\s+/.test(l)).join(' ').trim();
}
function linkItems(lines) {
  const out = [];
  lines.forEach((l) => {
    const m = l.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (m) out.push({ texto: m[1], url: m[2] });
  });
  return out;
}
function calloutLine(lines) {
  const l = lines.find((l) => /^\*\*Criterio de avance:\*\*/.test(l));
  return l ? l.replace(/^\*\*Criterio de avance:\*\*\s*/, '') : '';
}

// ───────────────────────── Ciclo semanal (mismo componente que en el sitio) ─────────────────────────
const FASES_SEMANALES = [
  { fase: 'Preparar', actividad: 'Revisar conceptos, recursos y prerrequisitos.' },
  { fase: 'Ejecutar', actividad: 'Completar la actividad paso a paso sobre el proyecto.' },
  { fase: 'Verificar', actividad: 'Comprobar fuentes, datos, coherencia y privacidad.' },
  { fase: 'Retroalimentar', actividad: 'Presentar decisiones y acordar cambios.' },
  { fase: 'Ajustar', actividad: 'Corregir y versionar antes del siguiente taller.' },
];

function flujoHtml() {
  return `<div class="flujo">${FASES_SEMANALES.map((p, i) => `
    <div class="flujo-paso">
      <span class="flujo-num">${i + 1}</span>
      <span class="flujo-texto"><strong>${esc(p.fase)}</strong><br>${esc(p.actividad)}</span>
    </div>`).join('')}</div>`;
}

// ───────────────────────── Plantilla base de cada slide ─────────────────────────
function fontFace() {
  const files = {
    Regular: 'Inter-Regular.ttf', Medium: 'Inter-Medium.ttf',
    SemiBold: 'Inter-SemiBold.ttf', Bold: 'Inter-Bold.ttf', ExtraBold: 'Inter-ExtraBold.ttf',
  };
  const weightNum = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800 };
  return Object.entries(files).map(([name, file]) => `
    @font-face {
      font-family: 'Inter';
      font-weight: ${weightNum[name]};
      src: url('file://${path.join(FONTS_DIR, file)}') format('truetype');
    }`).join('\n');
}

function baseCss() {
  return `
  ${fontFace()}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1280px; }
  body { font-family: 'Inter', system-ui, sans-serif; background: ${TOKENS.negro}; color: ${TOKENS.texto}; }
  .slide {
    width: 1280px; height: 720px; position: relative; overflow: hidden;
    background: ${TOKENS.negro};
    padding: 64px 76px 56px;
    break-after: page;
    display: flex; flex-direction: column;
  }
  .slide:last-child { break-after: auto; }
  .slide::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 8px;
    background: linear-gradient(${TOKENS.naranja}, ${TOKENS.naranja2});
  }
  .kicker { color: ${TOKENS.naranja2}; font-weight: 700; font-size: 17px; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 10px; }
  .slide h1 { font-size: 44px; font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 14px; }
  .slide h2 { font-size: 30px; font-weight: 800; color: #fff; margin-bottom: 22px; border-bottom: 3px solid ${TOKENS.naranja}; padding-bottom: 12px; display: inline-block; }
  .lead { font-size: 20px; color: ${TOKENS.textoSec}; line-height: 1.5; max-width: 96ch; }
  .content { flex: 1; min-height: 0; }
  ul.bullets, ol.steps { list-style: none; display: flex; flex-direction: column; gap: 14px; }
  ul.bullets li, ol.steps li { display: flex; gap: 14px; align-items: flex-start; font-size: 19px; line-height: 1.45; color: ${TOKENS.texto}; }
  ul.bullets li::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: ${TOKENS.naranja}; margin-top: 9px; flex-shrink: 0; }
  ol.steps { counter-reset: step; }
  ol.steps li::before {
    counter-increment: step; content: counter(step);
    background: ${TOKENS.naranja}; color: #201200; font-weight: 800; font-size: 15px;
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; flex: 1; min-height: 0; }
  .box { background: ${TOKENS.superficie}; border: 1px solid ${TOKENS.linea}; border-radius: 16px; padding: 26px 28px; }
  .box h3 { font-size: 18px; color: ${TOKENS.naranja2}; font-weight: 700; margin-bottom: 14px; }
  .pill-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
  .pill { background: ${TOKENS.superficie2}; border: 1px solid ${TOKENS.linea}; color: ${TOKENS.texto}; font-size: 14px; font-weight: 600; padding: 7px 14px; border-radius: 999px; }
  .footer { position: absolute; left: 76px; right: 76px; bottom: 26px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: ${TOKENS.textoSec}; border-top: 1px solid ${TOKENS.linea}; padding-top: 12px; }
  .footer img { height: 20px; opacity: .9; }
  .footer .marca { display: flex; align-items: center; gap: 10px; }
  .callout { background: rgba(232,137,46,.12); border: 1px solid rgba(232,137,46,.4); border-radius: 12px; padding: 16px 20px; font-size: 17px; color: ${TOKENS.texto}; margin-top: 16px; }
  .callout strong { color: ${TOKENS.naranja2}; }
  .flujo { display: flex; gap: 12px; margin-top: 6px; }
  .flujo-paso { flex: 1; background: ${TOKENS.superficie}; border: 1px solid ${TOKENS.linea}; border-radius: 14px; padding: 16px; display: flex; gap: 10px; align-items: flex-start; }
  .flujo-num { background: ${TOKENS.naranja}; color: #201200; font-weight: 800; font-size: 14px; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .flujo-texto { font-size: 14.5px; line-height: 1.4; }
  .flujo-texto strong { font-size: 15px; }
  .checklist { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .checklist li { font-size: 19px; display: flex; gap: 12px; align-items: flex-start; }
  .checklist li::before { content: '☐'; color: ${TOKENS.naranja2}; font-size: 20px; }
  .recursos { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .recursos li { font-size: 17px; display: flex; gap: 10px; align-items: baseline; }
  .recursos a { color: ${TOKENS.naranja2}; text-decoration: none; font-weight: 600; }
  .recursos .dom { color: ${TOKENS.textoSec}; font-size: 14px; }
  .cover { justify-content: center; align-items: flex-start; padding-left: 100px; }
  .cover .logos { display: flex; gap: 22px; align-items: center; margin-bottom: 46px; }
  .cover .logos img { height: 58px; }
  .cover .taller-tag { font-size: 20px; color: ${TOKENS.naranja2}; font-weight: 700; margin-bottom: 8px; }
  .cover h1 { font-size: 56px; max-width: 18ch; }
  .cover .subt { font-size: 22px; color: ${TOKENS.textoSec}; margin-top: 6px; max-width: 56ch; }
  .closing { align-items: center; justify-content: center; text-align: center; }
  .closing .logos { display: flex; gap: 24px; margin-bottom: 30px; }
  .closing .logos img { height: 50px; }
  .closing h2 { border: none; font-size: 32px; }
  .closing p { color: ${TOKENS.textoSec}; font-size: 18px; margin-top: 10px; }
  .closing .url { margin-top: 26px; color: ${TOKENS.naranja2}; font-weight: 700; font-size: 18px; }
  `;
}

function footer(tag) {
  return `<div class="footer">
    <span class="marca"><img src="file://${LOGO_SINGULARIDAD}"> Semillero de Investigación Singularidad · FUCS</span>
    <span>${esc(tag)}</span>
  </div>`;
}

// ───────────────────────── Slides de un taller ─────────────────────────
function buildTallerDeck(t) {
  const slides = [];

  // 1. Portada
  slides.push(`
  <section class="slide cover">
    <div class="logos">
      <img src="file://${LOGO_SINGULARIDAD}" style="height:60px">
      <img src="file://${LOGO_FUCS}" style="height:44px">
    </div>
    <div class="taller-tag">Taller ${t.numero} de 12</div>
    <h1>${esc(t.nombre)}</h1>
    <p class="subt">${esc(t.justificacion)}</p>
    <div class="pill-row">
      <span class="pill">Trabajo autónomo: 2 a 4 horas</span>
      <span class="pill">Retroalimentación: 30 a 60 minutos</span>
      <span class="pill">Evaluación formativa</span>
    </div>
    ${footer('Programa de talleres — Semillero Singularidad')}
  </section>`);

  // 2. Resultados de aprendizaje
  slides.push(`
  <section class="slide">
    <div class="kicker">Taller ${t.numero} · ${esc(t.nombre)}</div>
    <h2>Resultados de aprendizaje</h2>
    <div class="content"><ul class="bullets">${t.resultados.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>
    ${footer('Resultados de aprendizaje')}
  </section>`);

  // 3. Base conceptual
  slides.push(`
  <section class="slide">
    <div class="kicker">Taller ${t.numero} · ${esc(t.nombre)}</div>
    <h2>Base conceptual</h2>
    <div class="content"><ul class="bullets">${t.contexto.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>
    ${footer('Base conceptual')}
  </section>`);

  // 4. Cómo se trabaja este taller (preparación + ciclo semanal → componente metodológico)
  slides.push(`
  <section class="slide">
    <div class="kicker">Taller ${t.numero} · ${esc(t.nombre)}</div>
    <h2>Cómo se trabaja este taller</h2>
    <div class="content">
      <div class="box" style="margin-bottom:18px;">
        <h3>Preparación previa</h3>
        <ul class="bullets">${t.preparacion.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
      </div>
      ${flujoHtml()}
    </div>
    ${footer('Preparación y ciclo semanal')}
  </section>`);

  // 5. Actividad paso a paso
  const stepChunks = chunk(t.actividad, 6);
  stepChunks.forEach((chunkSteps, ci) => {
    slides.push(`
    <section class="slide">
      <div class="kicker">Taller ${t.numero} · ${esc(t.nombre)}</div>
      <h2>Actividad paso a paso${stepChunks.length > 1 ? ` (${ci + 1}/${stepChunks.length})` : ''}</h2>
      <div class="content"><ol class="steps" start="${ci * 6 + 1}">${chunkSteps.map((x) => `<li>${inline(x)}</li>`).join('')}</ol></div>
      ${footer('Actividad paso a paso')}
    </section>`);
  });

  // 6. Aplicación al proyecto + Entregables
  slides.push(`
  <section class="slide">
    <div class="kicker">Taller ${t.numero} · ${esc(t.nombre)}</div>
    <h2>Aplicación al proyecto</h2>
    <div class="cols">
      <div class="box">
        <h3>Aplicación</h3>
        <p class="lead" style="font-size:17px;">${inline(t.aplicacion)}</p>
      </div>
      <div class="box">
        <h3>Entregables de este taller</h3>
        <ul class="bullets">${t.entregables.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
      </div>
    </div>
    ${footer('Aplicación al proyecto y entregables')}
  </section>`);

  // 7. Lista de chequeo y KPI
  slides.push(`
  <section class="slide">
    <div class="kicker">Taller ${t.numero} · ${esc(t.nombre)}</div>
    <h2>Lista de chequeo y KPI</h2>
    <div class="content">
      <ul class="checklist">${t.checklist.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
      ${t.criterio ? `<div class="callout"><strong>Criterio de avance:</strong> ${inline(t.criterio)}</div>` : ''}
    </div>
    ${footer('Lista de chequeo y KPI')}
  </section>`);

  // 8. Retroalimentación + Recursos
  slides.push(`
  <section class="slide">
    <div class="kicker">Taller ${t.numero} · ${esc(t.nombre)}</div>
    <h2>Retroalimentación y recursos</h2>
    <div class="cols">
      <div class="box">
        <h3>Retroalimentación semanal</h3>
        <p class="lead" style="font-size:17px;">${inline(t.retro)}</p>
      </div>
      <div class="box">
        <h3>Recursos</h3>
        <ul class="recursos">${t.recursos.map((r) => `<li>📎 <a href="${esc(r.url)}">${esc(r.texto)}</a></li>`).join('')}</ul>
      </div>
    </div>
    ${footer('Retroalimentación y recursos')}
  </section>`);

  // 9. Cierre
  const nextNote = t.numeroInt < 12 ? `Continúe en el Taller ${t.numeroInt + 1} cuando complete al menos el 80 % de la lista de chequeo.` : 'Este es el último taller del programa: consolide el manuscrito versión 1.';
  slides.push(`
  <section class="slide closing">
    <div class="logos">
      <img src="file://${LOGO_SINGULARIDAD}">
      <img src="file://${LOGO_FUCS}">
    </div>
    <h2>Gracias — Taller ${t.numero} de 12</h2>
    <p>${esc(nextNote)}</p>
    <p class="url">jjsprockel.github.io/taller-singularidad</p>
  </section>`);

  return slides.join('\n');
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out.length ? out : [[]];
}

// ───────────────────────── Deck del programa general ─────────────────────────
function buildProgramaDeck(p) {
  const slides = [];
  slides.push(`
  <section class="slide cover">
    <div class="logos">
      <img src="file://${LOGO_SINGULARIDAD}" style="height:60px">
      <img src="file://${LOGO_FUCS}" style="height:44px">
    </div>
    <div class="taller-tag">Programa de talleres</div>
    <h1>Talleres del Semillero de Investigación Singularidad</h1>
    <p class="subt">Inteligencia artificial aplicada a la investigación en salud — itinerario de doce talleres progresivos para estudiantes de medicina.</p>
    <div class="pill-row">
      <span class="pill">12 talleres</span>
      <span class="pill">2 a 4 h autónomas por taller</span>
      <span class="pill">Retroalimentación semanal de 30 a 60 min</span>
      <span class="pill">Evaluación exclusivamente formativa</span>
    </div>
    ${footer('Presentación general del programa')}
  </section>`);

  slides.push(`
  <section class="slide">
    <div class="kicker">Programa</div>
    <h2>Competencia general</h2>
    <div class="content"><p class="lead">${inline(p.competencia)}</p></div>
    ${footer('Competencia general')}
  </section>`);

  slides.push(`
  <section class="slide">
    <div class="kicker">Programa</div>
    <h2>Cuatro rutas de proyecto</h2>
    <div class="content cols" style="grid-template-columns:1fr 1fr; gap:20px;">
      ${p.rutas.map((r) => `<div class="box"><h3>Ruta ${esc(r.letra)} — ${esc(r.titulo)}</h3><p class="lead" style="font-size:16px;">${inline(r.descripcion)}</p></div>`).join('')}
    </div>
    ${footer('Rutas de proyecto A–D')}
  </section>`);

  slides.push(`
  <section class="slide">
    <div class="kicker">Programa</div>
    <h2>Ciclo semanal de trabajo</h2>
    <div class="content">${flujoHtml()}
      <div class="callout" style="margin-top:26px;"><strong>Evaluación formativa:</strong> ${inline(p.evaluacion)}</div>
    </div>
    ${footer('Método de trabajo')}
  </section>`);

  const cronoChunks = chunk(p.cronograma, 6);
  cronoChunks.forEach((rows, ci) => {
    slides.push(`
    <section class="slide">
      <div class="kicker">Programa</div>
      <h2>Mapa de los doce talleres${cronoChunks.length > 1 ? ` (${ci + 1}/${cronoChunks.length})` : ''}</h2>
      <div class="content"><ul class="bullets">${rows.map((r) => `<li><strong>Taller ${esc(r.taller)}.</strong> ${esc(r.tema)} — <span style="color:${TOKENS.textoSec}">${esc(r.productos)}</span></li>`).join('')}</ul></div>
      ${footer('Cronograma y productos acumulativos')}
    </section>`);
  });

  slides.push(`
  <section class="slide">
    <div class="kicker">Programa</div>
    <h2>Hitos acumulativos</h2>
    <div class="content"><ul class="bullets">${p.hitos.map((h) => `<li><strong>Hito ${esc(h.hito)}</strong> — Taller ${esc(h.taller)}: ${esc(h.descripcion)}</li>`).join('')}</ul></div>
    ${footer('Hitos del programa')}
  </section>`);

  slides.push(`
  <section class="slide">
    <div class="kicker">Programa</div>
    <h2>Indicadores globales</h2>
    <div class="content"><ul class="bullets">${p.indicadores.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>
    ${footer('Indicadores globales')}
  </section>`);

  slides.push(`
  <section class="slide closing">
    <div class="logos">
      <img src="file://${LOGO_SINGULARIDAD}">
      <img src="file://${LOGO_FUCS}">
    </div>
    <h2>Gracias</h2>
    <p>Programa de talleres del Semillero de Investigación Singularidad — FUCS</p>
    <p class="url">jjsprockel.github.io/taller-singularidad</p>
  </section>`);

  return slides.join('\n');
}

// ───────────────────────── Extracción de datos por taller ─────────────────────────
function readTaller(num) {
  const idNum = String(num).padStart(2, '0');
  const file = path.join(CONTENT_DIR, `${idNum}_taller_${idNum}.md`);
  const md = fs.readFileSync(file, 'utf8');
  const { title, sections } = splitSections(md);
  const m = title.match(/^Taller\s+(\d+)\s+(.*)$/i);
  const numero = m ? m[1] : String(num);
  const nombre = m ? m[2] : title;

  const checklistLines = section(sections, 'Lista de chequeo y KPI');
  return {
    numero, numeroInt: Number(numero), nombre,
    justificacion: paragraph(section(sections, 'Justificación')),
    resultados: bulletItems(section(sections, 'Resultados de aprendizaje')),
    contexto: bulletItems(section(sections, 'Contexto teórico')),
    preparacion: bulletItems(section(sections, 'Preparación')),
    actividad: numberedItems(section(sections, 'Actividad paso a paso')),
    aplicacion: paragraph(section(sections, 'Aplicación al proyecto')),
    entregables: bulletItems(section(sections, 'Entregables')),
    checklist: checklistItems(checklistLines),
    criterio: calloutLine(checklistLines),
    retro: paragraph(section(sections, 'Retroalimentación semanal')),
    recursos: linkItems(section(sections, 'Recursos')),
  };
}

function readPrograma() {
  const md = fs.readFileSync(path.join(CONTENT_DIR, '00_programa_general.md'), 'utf8');
  const { sections } = splitSections(md);
  const rutasLines = bulletItems(section(sections, 'Rutas de proyecto'));
  const rutas = rutasLines.map((l) => {
    const m = l.match(/^Ruta\s+(\w)\.\s+\*\*(.+?)\*\*\.?\s*(.*)$/);
    return m ? { letra: m[1], titulo: m[2], descripcion: m[3] } : { letra: '', titulo: l, descripcion: '' };
  });
  const cronoLines = section(sections, 'Cronograma y productos acumulativos').filter((l) => /^\|.*\|$/.test(l.trim())).slice(2);
  const cronograma = cronoLines.map((l) => {
    const c = l.trim().slice(1, -1).split('|').map((x) => x.trim());
    return { taller: c[0], tema: c[1], productos: c[2] };
  });
  const hitosLines = bulletItems(section(sections, 'Hitos del programa'));
  const hitos = hitosLines.map((l) => {
    const m = l.match(/^Hito\s+(\d+),\s+al finalizar el taller\s+(\d+):\s+(.*)$/);
    return m ? { hito: m[1], taller: m[2], descripcion: m[3].replace(/\.$/, '') } : { hito: '', taller: '', descripcion: l };
  });
  return {
    competencia: paragraph(section(sections, 'Competencia general')),
    evaluacion: paragraph(section(sections, 'Evaluación formativa')),
    rutas,
    cronograma,
    hitos,
    indicadores: bulletItems(section(sections, 'Indicadores globales')),
  };
}

// ───────────────────────── Render a PDF ─────────────────────────
const TMP_DIR = path.join(HERE, '.cache');
fs.mkdirSync(TMP_DIR, { recursive: true });

async function renderPdf(browser, bodyHtml, outFile) {
  const page = await browser.newPage();
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss()}</style></head><body>${bodyHtml}</body></html>`;
  // Se escribe a un archivo temporal y se navega con file:// (en vez de page.setContent,
  // cuyo documento queda en el origen about:blank y no puede cargar imágenes/fuentes
  // locales por restricciones de origen cruzado de Chromium).
  const tmpFile = path.join(TMP_DIR, path.basename(outFile).replace(/\.pdf$/, '.html'));
  fs.writeFileSync(tmpFile, html, 'utf8');
  await page.goto('file://' + tmpFile, { waitUntil: 'load' });
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
  await page.pdf({
    path: outFile,
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    pageRanges: '',
  });
  await page.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });

  const programa = readPrograma();
  await renderPdf(browser, buildProgramaDeck(programa), path.join(OUT_DIR, 'programa-general.pdf'));
  console.log('✔ programa-general.pdf');

  for (let n = 1; n <= 12; n++) {
    const t = readTaller(n);
    await renderPdf(browser, buildTallerDeck(t), path.join(OUT_DIR, `taller-${String(n).padStart(2, '0')}.pdf`));
    console.log(`✔ taller-${String(n).padStart(2, '0')}.pdf (${t.nombre})`);
  }

  await browser.close();
  console.log('Listo. PDF generados en', OUT_DIR);
}

main().catch((err) => { console.error(err); process.exit(1); });

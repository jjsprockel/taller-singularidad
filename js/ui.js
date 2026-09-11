import * as C from './content.js';
import * as S from './storage.js';
import { tallerPath, navigate } from './router.js';

const PLANTILLAS = [
  { file: 'ficha_proyecto.md', nombre: 'Ficha de proyecto', proposito: 'Registra código y versión, ruta A–D, título provisional, problema, población, pregunta, objetivo, papel de la IA, datos necesarios, producto esperado, riesgos y próxima decisión.', talleres: 'Taller 1 · Proyectos' },
  { file: 'matriz_alineacion.md', nombre: 'Matriz de alineación', proposito: 'Conecta pregunta, objetivo, variable o constructo, fuente del dato, momento, análisis, producto y criterio de éxito.', talleres: 'Taller 5 · Taller 10' },
  { file: 'registro_decisiones.md', nombre: 'Registro de decisiones', proposito: 'Documenta cada decisión relevante, la evidencia considerada, alternativas, papel de la IA y efecto sobre el protocolo o el análisis.', talleres: 'Transversal · Proyectos' },
  { file: 'rubrica_retroalimentacion.md', nombre: 'Rúbrica de retroalimentación', proposito: 'Guía la reunión semanal con cinco dominios formativos: exactitud, coherencia, reproducibilidad, ética y comunicación.', talleres: 'Transversal · Proyectos' },
  { file: 'matriz_evidencia.md', nombre: 'Matriz de evidencia', proposito: 'Organiza la extracción y síntesis de referencias verificadas: diseño, población, hallazgo, limitación y aporte al proyecto.', talleres: 'Taller 4' },
  { file: 'matriz_riesgos.md', nombre: 'Matriz de riesgos', proposito: 'Identifica riesgos, causas, probabilidad, impacto, controles preventivos y riesgo residual.', talleres: 'Taller 6 · Taller 7' },
  { file: 'plan_gestion_datos.md', nombre: 'Plan de gestión de datos', proposito: 'Inventario de fuentes de datos con sensibilidad y autorización, además del flujo y los controles de gestión.', talleres: 'Taller 7 · Taller 8' },
  { file: 'checklist_protocolo.md', nombre: 'Lista de chequeo del protocolo', proposito: 'Verifica que el protocolo tenga título, pregunta, diseño, variables, análisis, ética, papel de la IA y cronograma completos.', talleres: 'Taller 10' },
  { file: 'checklist_manuscrito.md', nombre: 'Lista de chequeo del manuscrito', proposito: 'Verifica título, métodos, resultados, discusión, referencias, declaraciones de autoría y uso de IA antes de enviar el manuscrito.', talleres: 'Taller 12' },
  { file: 'bitacora_uso_ia.md', nombre: 'Bitácora de uso de IA', proposito: 'Registra fecha, tarea, plataforma, archivos usados, prompt relevante, salida, verificación y decisión humana.', talleres: 'Transversal · especialmente Taller 2' },
  { file: 'arquitectura_contenidos_web.md', nombre: 'Arquitectura de contenidos web', proposito: 'Referencia técnica de navegación y pestañas usada para construir este sitio.', talleres: 'Referencia general' },
];

const HITO_TALLERES = ['taller-03', 'taller-05', 'taller-07', 'taller-10', 'taller-12'];

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function pill(text, variant = '') {
  return `<span class="pill ${variant}">${C.escapeHtml(text)}</span>`;
}

function copyBtn(text, label = 'Copiar') {
  return `<button type="button" class="copy-btn" data-action="copy" data-copy="${C.escapeHtml(text)}" aria-label="Copiar texto">
    <span class="copy-btn-label">${label}</span>
  </button>`;
}

function setTitle(t) {
  document.title = `${t} · Talleres Singularidad`;
}

function focusHeading(container) {
  const h = container.querySelector('.page-title');
  if (h) {
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: false });
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function privacyNotice() {
  return `<div class="notice notice-warning" role="note">
    <strong>Aviso de privacidad:</strong> no cargue datos clínicos reales, nombres de pacientes ni información identificable en servicios de IA. Use siempre datos sintéticos, anonimizados o públicos. Todo producto generado con IA requiere revisión humana, verificación de fuentes y trazabilidad.
  </div>`;
}

// ---------- Portada ----------
async function renderInicio(container) {
  const { sections } = await C.getProgramaGeneral();
  const cronograma = C.parseCronograma(sections);
  const rutas = C.parseRutas(sections);
  const hitos = C.parseHitos(sections);

  const talleresGrid = cronograma.map((row) => {
    const num = row.taller.padStart(2, '0');
    const id = `taller-${num}`;
    return `<a class="card taller-card" href="${tallerPath(id)}">
      <div class="card-header"><span class="taller-num">Taller ${row.taller}</span></div>
      <div class="card-body">
        <h3>${C.escapeHtml(row.tema)}</h3>
        <p class="muted">${C.escapeHtml(row.productos)}</p>
      </div>
    </a>`;
  }).join('');

  const rutasHtml = rutas.map((r) => `
    <div class="card ruta-card">
      <div class="card-header"><span class="ruta-letra">Ruta ${C.escapeHtml(r.letra)}</span></div>
      <div class="card-body">
        <h3>${C.escapeHtml(r.titulo)}</h3>
        <p>${C.escapeHtml(r.descripcion)}</p>
      </div>
    </div>`).join('');

  const hitosHtml = hitos.map((h) => `
    <li><span class="hito-num">Hito ${h.hito}</span> — Taller ${h.taller}: ${C.escapeHtml(h.descripcion)}</li>
  `).join('');

  container.innerHTML = `
    <section class="hero">
      <div class="hero-logos">
        <img src="assets/logos/singularidad.png" alt="Logotipo del Semillero de Investigación Singularidad" class="logo logo-singularidad">
        <img src="assets/logos/fucs.png" alt="Logotipo de la Fundación Universitaria de Ciencias de la Salud (FUCS)" class="logo logo-fucs">
      </div>
      <h1 class="page-title">Talleres del Semillero de Investigación Singularidad</h1>
      <p class="hero-subtitle">Inteligencia artificial aplicada a la investigación en salud</p>
      <p class="hero-desc">Un itinerario formativo de doce talleres progresivos para que estudiantes de medicina formulen, planifiquen, conduzcan y comuniquen una investigación en salud apoyada por IA, con evaluación exclusivamente formativa y evidencia individual trazable.</p>
      <div class="pill-row">
        ${pill('12 talleres')}
        ${pill('Trabajo autónomo de 2 a 4 horas')}
        ${pill('Retroalimentación semanal de 30 a 60 minutos')}
        ${pill('Modalidad híbrida')}
      </div>
      <div class="btn-row">
        <a class="btn btn-primary" href="${tallerPath('taller-01')}">Explorar talleres</a>
        <a class="btn btn-secondary" href="#/programa">Ver programa</a>
      </div>
    </section>

    ${privacyNotice()}

    <section class="section">
      <h2 class="section-title">Rutas de proyecto</h2>
      <div class="grid grid-4">${rutasHtml}</div>
    </section>

    <section class="section">
      <h2 class="section-title">Hitos acumulativos del programa</h2>
      <ol class="hitos-line">${hitosHtml}</ol>
    </section>

    <section class="section">
      <h2 class="section-title">Los doce talleres</h2>
      <div class="grid grid-3">${talleresGrid}</div>
    </section>
  `;
  setTitle('Inicio');
  focusHeading(container);
}

// ---------- Programa ----------
async function renderPrograma(container) {
  const { title, sections } = await C.getProgramaGeneral();
  const blocksHtml = sections.map((s) => `
    <section class="card section-card">
      <div class="card-header"><h2>${C.escapeHtml(s.heading)}</h2></div>
      <div class="card-body">${C.renderMarkdownBlock(s.lines)}</div>
    </section>
  `).join('');

  container.innerHTML = `
    <h1 class="page-title">${C.escapeHtml(title)}</h1>
    ${privacyNotice()}
    <div class="stack">${blocksHtml}</div>
  `;
  setTitle('Programa');
  focusHeading(container);
}

// ---------- Proyectos ----------
async function renderProyectos(container) {
  const { sections } = await C.getProgramaGeneral();
  const rutas = C.parseRutas(sections);
  const cronograma = C.parseCronograma(sections);

  const rutasHtml = rutas.map((r) => `
    <div class="card ruta-card">
      <div class="card-header"><span class="ruta-letra">Ruta ${C.escapeHtml(r.letra)}</span></div>
      <div class="card-body">
        <h3>${C.escapeHtml(r.titulo)}</h3>
        <p>${C.escapeHtml(r.descripcion)}</p>
      </div>
    </div>`).join('');

  const continuidadRows = cronograma.map((row) => `
    <tr><td>Taller ${row.taller}</td><td>${C.escapeHtml(row.tema)}</td><td>${C.escapeHtml(row.productos)}</td></tr>
  `).join('');

  const plantillasProyecto = ['ficha_proyecto.md', 'matriz_alineacion.md', 'registro_decisiones.md', 'rubrica_retroalimentacion.md']
    .map((f) => PLANTILLAS.find((p) => p.file === f))
    .map((p) => `<li><a class="btn btn-small" href="content/plantillas/${p.file}" download>${C.escapeHtml(p.nombre)}</a></li>`)
    .join('');

  container.innerHTML = `
    <h1 class="page-title">Proyectos</h1>
    <p class="lead">Cada estudiante se integra desde el Taller 1 a un proyecto individual o grupal. En proyectos grupales, cada integrante produce una evidencia individual identificable: bitácora, revisión, componente metodológico o producto firmado.</p>

    <section class="section">
      <h2 class="section-title">Cuatro rutas de proyecto</h2>
      <div class="grid grid-4">${rutasHtml}</div>
    </section>

    <section class="section">
      <h2 class="section-title">Continuidad: productos que se acumulan del taller 1 al 12</h2>
      <div class="card">
        <div class="card-body table-scroll">
          <table class="md-table">
            <thead><tr><th>Taller</th><th>Tema</th><th>Productos centrales</th></tr></thead>
            <tbody>${continuidadRows}</tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Plantillas para iniciar y sostener el proyecto</h2>
      <ul class="download-list">${plantillasProyecto}</ul>
    </section>
  `;
  setTitle('Proyectos');
  focusHeading(container);
}

// ---------- Taller ----------
function tabsBar(tabs, activeId, tallerId) {
  const buttons = tabs.map((t) => `
    <button type="button"
      role="tab"
      id="tab-${t.id}"
      aria-selected="${t.id === activeId}"
      aria-controls="panel-${t.id}"
      tabindex="${t.id === activeId ? '0' : '-1'}"
      class="tab-btn ${t.id === activeId ? 'active' : ''}"
      data-tab="${t.id}">${C.escapeHtml(t.label)}</button>
  `).join('');
  return `<div class="tabs-bar" role="tablist" aria-label="Secciones del taller" data-taller="${tallerId}">${buttons}</div>`;
}

function checklistPanel(taller, checklistState) {
  const items = taller.checklistItems.map((text, idx) => {
    const checked = !!checklistState[idx];
    return `<li class="checklist-item">
      <label>
        <input type="checkbox" data-action="toggle-check" data-index="${idx}" ${checked ? 'checked' : ''}>
        <span>${C.escapeHtml(text)}</span>
      </label>
    </li>`;
  }).join('');

  const completed = checklistState.filter(Boolean).length;
  const total = taller.checklistItems.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return `
    <div class="checklist-summary">
      <div class="progress-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
      <p><strong>${completed} de ${total}</strong> criterios completados (${percent}%)</p>
    </div>
    <ul class="checklist-list">${items}</ul>
    ${taller.checklistExtraHtml}
    <button type="button" class="btn btn-secondary" data-action="reset-checklist">Restablecer este taller</button>
  `;
}

// Pestaña Actividad: cada paso es un bloque copiable (además de bloques de código, si existieran).
function renderActividadPanel(lines) {
  const stepLines = lines.filter((l) => /^\d+\.\s+/.test(l));
  const otherLines = lines.filter((l) => !/^\d+\.\s+/.test(l));
  const steps = stepLines.map((l) => l.replace(/^\d+\.\s+/, ''));
  if (steps.length === 0) {
    return C.renderMarkdownBlock(lines);
  }
  const allText = steps.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const stepsHtml = steps.map((t, i) => `
    <li class="step-item">
      <span class="step-number" aria-hidden="true">${i + 1}</span>
      <div class="step-text">${C.inlineMd(t)}</div>
      ${copyBtn(t, 'Copiar paso')}
    </li>`).join('');
  const otherHtml = otherLines.length ? C.renderMarkdownBlock(otherLines) : '';
  return `
    <div class="actividad-toolbar">${copyBtn(allText, 'Copiar todos los pasos')}</div>
    <ol class="step-list">${stepsHtml}</ol>
    ${otherHtml}
  `;
}

async function renderTaller(container, id, requestedTab) {
  const num = Number(id.replace('taller-', ''));
  const taller = await C.getTaller(num);
  const tabs = C.TALLER_TABS;
  const validTabIds = tabs.map((t) => t.id);
  const activeId = validTabIds.includes(requestedTab) ? requestedTab : 'inicio';

  S.markVisited(id, taller.checklistItems.length, activeId);
  const checklistState = S.getChecklist(id, taller.checklistItems.length);
  const progress = S.getProgress(id, taller.checklistItems.length);

  const prevNum = num > 1 ? num - 1 : null;
  const nextNum = num < 12 ? num + 1 : null;
  const prevId = prevNum ? `taller-${String(prevNum).padStart(2, '0')}` : null;
  const nextId = nextNum ? `taller-${String(nextNum).padStart(2, '0')}` : null;

  const panels = {};
  tabs.forEach((t) => {
    if (t.id === 'checklist') {
      panels[t.id] = checklistPanel(taller, checklistState);
    } else if (t.id === 'actividad') {
      const lines = taller.tabsRaw[t.id];
      panels[t.id] = lines && lines.length ? renderActividadPanel(lines) : '<p class="empty-note">Esta sección aún no tiene contenido asignado. Se completará en una próxima edición editorial.</p>';
    } else {
      const lines = taller.tabsRaw[t.id];
      panels[t.id] = lines && lines.length ? C.renderMarkdownBlock(lines) : '<p class="empty-note">Esta sección aún no tiene contenido asignado. Se completará en una próxima edición editorial.</p>';
    }
  });

  const panelsHtml = tabs.map((t) => `
    <div role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}" class="tab-panel ${t.id === activeId ? '' : 'hidden'}" tabindex="0">
      ${panels[t.id]}
    </div>
  `).join('');

  container.innerHTML = `
    <header class="taller-header">
      <p class="taller-position">Taller ${taller.numero} de 12</p>
      <h1 class="page-title">${C.escapeHtml(taller.numero)}. ${C.escapeHtml(taller.nombre)}</h1>
      <div class="pill-row">
        ${pill('Duración: 2 a 4 horas de trabajo autónomo')}
        ${pill('Retroalimentación: 30 a 60 minutos')}
      </div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${progress.percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso de la lista de chequeo">
        <div class="progress-fill" style="width:${progress.percent}%"></div>
      </div>
      <p class="muted">${progress.completed} de ${progress.total} criterios de la lista de chequeo completados</p>
      <nav class="taller-pager" aria-label="Navegación entre talleres">
        ${prevId ? `<a class="btn btn-secondary" href="${tallerPath(prevId)}">← Taller anterior</a>` : '<span></span>'}
        ${nextId ? `<a class="btn btn-secondary" href="${tallerPath(nextId)}">Siguiente taller →</a>` : '<span></span>'}
      </nav>
    </header>

    ${tabsBar(tabs, activeId, id)}
    <div class="tab-panels">${panelsHtml}</div>
  `;
  setTitle(`Taller ${taller.numero}. ${taller.nombre}`);
  focusHeading(container);
  wireTabs(container, id);
}

function wireTabs(container, tallerId) {
  const tablist = container.querySelector('.tabs-bar');
  if (!tablist) return;
  const buttons = Array.from(tablist.querySelectorAll('.tab-btn'));
  const panels = Array.from(container.querySelectorAll('.tab-panel'));

  // Cambia de pestaña actualizando el DOM localmente (sin recargar todo el taller),
  // para no perder el foco del teclado ni volver a solicitar los datos.
  function activate(tabId, focusButton) {
    buttons.forEach((b) => {
      const isActive = b.dataset.tab === tabId;
      b.setAttribute('aria-selected', String(isActive));
      b.tabIndex = isActive ? 0 : -1;
      b.classList.toggle('active', isActive);
    });
    panels.forEach((p) => {
      p.classList.toggle('hidden', p.id !== `panel-${tabId}`);
    });
    history.replaceState(null, '', tallerPath(tallerId, tabId));
    if (focusButton) {
      const btn = buttons.find((b) => b.dataset.tab === tabId);
      if (btn) btn.focus();
    }
  }

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => activate(btn.dataset.tab, false));
    btn.addEventListener('keydown', (ev) => {
      let targetIdx = null;
      if (ev.key === 'ArrowRight') targetIdx = (idx + 1) % buttons.length;
      else if (ev.key === 'ArrowLeft') targetIdx = (idx - 1 + buttons.length) % buttons.length;
      else if (ev.key === 'Home') targetIdx = 0;
      else if (ev.key === 'End') targetIdx = buttons.length - 1;
      if (targetIdx !== null) {
        ev.preventDefault();
        activate(buttons[targetIdx].dataset.tab, true);
      }
    });
  });
}

// ---------- Plantillas ----------
async function renderPlantillas(container) {
  const rows = PLANTILLAS.map((p) => `
    <div class="card plantilla-card">
      <div class="card-body">
        <h3>${C.escapeHtml(p.nombre)}</h3>
        <p>${C.escapeHtml(p.proposito)}</p>
        <p class="muted">Talleres relacionados: ${C.escapeHtml(p.talleres)}</p>
        <a class="btn btn-primary" href="content/plantillas/${p.file}" download>Descargar ${p.file}</a>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <h1 class="page-title">Plantillas</h1>
    <p class="lead">Descargue los archivos Markdown originales para usarlos como base de sus productos. No se muestran reconstruidos en pantalla: use el archivo descargado como fuente de edición.</p>
    <div class="grid grid-2">${rows}</div>
  `;
  setTitle('Plantillas');
  focusHeading(container);
}

// ---------- Recursos ----------
async function renderRecursos(container) {
  const { sections } = await C.getProgramaGeneral();
  const generales = C.findSection(sections, 'Recursos generales');
  const generalesLinks = generales ? C.parseRecursosLinks(generales.lines) : [];

  const nums = Array.from({ length: 12 }, (_, i) => i + 1);
  const talleres = await Promise.all(nums.map((n) => C.getTaller(n)));

  const porTaller = talleres.map((t) => {
    const links = C.parseRecursosLinks(t.tabsRaw.recursos);
    if (!links.length) return '';
    const items = links.map((l) => `<li><a href="${C.escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${C.escapeHtml(l.texto)}</a></li>`).join('');
    return `<div class="card">
      <div class="card-header"><h3>Taller ${t.numero}. ${C.escapeHtml(t.nombre)}</h3></div>
      <div class="card-body"><ul class="link-list">${items}</ul></div>
    </div>`;
  }).join('');

  const generalesItems = generalesLinks.map((l) => `<li><a href="${C.escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${C.escapeHtml(l.texto)}</a></li>`).join('');

  container.innerHTML = `
    <h1 class="page-title">Recursos</h1>
    <section class="section">
      <h2 class="section-title">Recursos generales del programa</h2>
      <div class="card"><div class="card-body"><ul class="link-list">${generalesItems}</ul></div></div>
    </section>
    <section class="section">
      <h2 class="section-title">Recursos por taller</h2>
      <div class="grid grid-2">${porTaller}</div>
    </section>
  `;
  setTitle('Recursos');
  focusHeading(container);
}

// ---------- Seguimiento ----------
async function renderSeguimiento(container) {
  const nums = Array.from({ length: 12 }, (_, i) => i + 1);
  const talleres = await Promise.all(nums.map((n) => C.getTaller(n)));
  const counts = {};
  talleres.forEach((t) => { counts[t.id] = t.checklistItems.length; });
  const stats = S.getGlobalStats(counts);

  const hitosHtml = HITO_TALLERES.map((id, i) => {
    const d = stats.detalle[id];
    const logrado = d && d.total > 0 && d.completed === d.total;
    return `<li class="${logrado ? 'hito-logrado' : ''}">
      <span aria-hidden="true">${logrado ? '✔' : '○'}</span>
      Hito ${i + 1} — ${id.replace('taller-', 'Taller ')} ${logrado ? '(alcanzado)' : '(pendiente)'}
    </li>`;
  }).join('');

  const detalleRows = talleres.map((t) => {
    const d = stats.detalle[t.id];
    return `<tr>
      <td><a href="${tallerPath(t.id)}">${t.numero}. ${C.escapeHtml(t.nombre)}</a></td>
      <td>${d.visited ? 'Sí' : 'No'}</td>
      <td>${d.completed} de ${d.total} (${d.percent}%)</td>
    </tr>`;
  }).join('');

  const lastVisited = stats.lastVisitedTaller;
  const lastVisitedTaller = lastVisited ? talleres.find((t) => t.id === lastVisited) : null;

  container.innerHTML = `
    <h1 class="page-title">Seguimiento</h1>
    <div class="notice" role="note">Este panel se calcula únicamente con datos guardados en este navegador (<code>localStorage</code>). No se transmite a ningún servidor y no constituye una calificación.</div>

    <section class="section grid grid-3">
      <div class="card stat-card"><div class="card-body"><p class="stat-number">${stats.iniciados} de ${stats.totalTalleres}</p><p>Talleres iniciados</p></div></div>
      <div class="card stat-card"><div class="card-body"><p class="stat-number">${stats.completos} de ${stats.totalTalleres}</p><p>Talleres con lista de chequeo completa</p></div></div>
      <div class="card stat-card"><div class="card-body"><p class="stat-number">${stats.globalPercent}%</p><p>Progreso global promedio</p></div></div>
    </section>

    <section class="section">
      <h2 class="section-title">Hitos acumulativos</h2>
      <ul class="hitos-list">${hitosHtml}</ul>
    </section>

    ${lastVisitedTaller ? `<section class="section">
      <h2 class="section-title">Último taller visitado</h2>
      <p><a class="btn btn-primary" href="${tallerPath(lastVisitedTaller.id)}">Continuar en Taller ${lastVisitedTaller.numero}. ${C.escapeHtml(lastVisitedTaller.nombre)}</a></p>
    </section>` : ''}

    <section class="section">
      <h2 class="section-title">Detalle por taller</h2>
      <div class="card"><div class="card-body table-scroll">
        <table class="md-table">
          <thead><tr><th>Taller</th><th>Iniciado</th><th>Lista de chequeo</th></tr></thead>
          <tbody>${detalleRows}</tbody>
        </table>
      </div></div>
    </section>
  `;
  setTitle('Seguimiento');
  focusHeading(container);
}

// ---------- Acerca del semillero ----------
async function renderNosotros(container) {
  const { sections } = await C.getProgramaGeneral();
  const proposito = C.findSection(sections, 'Propósito');
  const poblacion = C.findSection(sections, 'Población y alcance');
  const competencia = C.findSection(sections, 'Competencia general');

  container.innerHTML = `
    <h1 class="page-title">Acerca del semillero</h1>
    <div class="hero-logos hero-logos-inline">
      <img src="assets/logos/singularidad.png" alt="Logotipo del Semillero de Investigación Singularidad" class="logo logo-singularidad">
      <img src="assets/logos/fucs.png" alt="Logotipo de la Fundación Universitaria de Ciencias de la Salud (FUCS)" class="logo logo-fucs">
    </div>
    <p class="lead">El Semillero de Investigación Singularidad, de la Fundación Universitaria de Ciencias de la Salud (FUCS), impulsa este itinerario formativo para estudiantes de medicina interesados en la investigación en salud apoyada por inteligencia artificial.</p>

    <section class="card section-card">
      <div class="card-header"><h2>Propósito</h2></div>
      <div class="card-body">${proposito ? C.renderMarkdownBlock(proposito.lines) : ''}</div>
    </section>
    <section class="card section-card">
      <div class="card-header"><h2>Población y alcance</h2></div>
      <div class="card-body">${poblacion ? C.renderMarkdownBlock(poblacion.lines) : ''}</div>
    </section>
    <section class="card section-card">
      <div class="card-header"><h2>Competencia general</h2></div>
      <div class="card-body">${competencia ? C.renderMarkdownBlock(competencia.lines) : ''}</div>
    </section>

    <div class="notice" role="note">Este sitio es educativo y formativo; no constituye asesoría clínica ni almacena información identificable de pacientes.</div>
  `;
  setTitle('Acerca del semillero');
  focusHeading(container);
}

const RENDERERS = {
  inicio: renderInicio,
  programa: renderPrograma,
  proyectos: renderProyectos,
  plantillas: renderPlantillas,
  recursos: renderRecursos,
  seguimiento: renderSeguimiento,
  nosotros: renderNosotros,
};

export async function renderRoute(route, container) {
  try {
    if (route.page === 'talleres') {
      if (!route.id) {
        navigate(tallerPath('taller-01'));
        return;
      }
      await renderTaller(container, route.id, route.tab);
      return;
    }
    const renderer = RENDERERS[route.page] || renderInicio;
    await renderer(container);
  } catch (err) {
    container.innerHTML = `<h1 class="page-title">No se pudo cargar el contenido</h1>
      <p>Ocurrió un problema al leer los archivos de contenido. Verifique que el sitio se esté sirviendo mediante un servidor local o GitHub Pages (no abriendo el archivo directamente).</p>
      <p class="muted">${C.escapeHtml(err.message)}</p>`;
    setTitle('Error');
    focusHeading(container);
  }
}

// Delegación de eventos globales: copiar, checklist, reset.
export function mountGlobalHandlers(container, onChecklistChange) {
  container.addEventListener('click', async (ev) => {
    const copyEl = ev.target.closest('[data-action="copy"]');
    if (copyEl) {
      const text = copyEl.dataset.copy || '';
      await copyText(text);
      const label = copyEl.querySelector('.copy-btn-label');
      const original = label.textContent;
      label.textContent = 'Copiado';
      copyEl.classList.add('copied');
      setTimeout(() => { label.textContent = original; copyEl.classList.remove('copied'); }, 1800);
      return;
    }

    const resetEl = ev.target.closest('[data-action="reset-checklist"]');
    if (resetEl) {
      const tallerId = container.querySelector('.tabs-bar')?.dataset.taller;
      if (!tallerId) return;
      const confirmed = window.confirm('¿Restablecer la lista de chequeo de este taller? Esta acción borra el progreso guardado en este navegador.');
      if (!confirmed) return;
      const num = Number(tallerId.replace('taller-', ''));
      const taller = await C.getTaller(num);
      S.resetTaller(tallerId, taller.checklistItems.length);
      const route = { page: 'talleres', id: tallerId, tab: 'checklist' };
      await renderRoute(route, container);
    }
  });

  container.addEventListener('change', async (ev) => {
    const box = ev.target.closest('[data-action="toggle-check"]');
    if (!box) return;
    const tallerId = container.querySelector('.tabs-bar')?.dataset.taller;
    if (!tallerId) return;
    const num = Number(tallerId.replace('taller-', ''));
    const taller = await C.getTaller(num);
    const index = Number(box.dataset.index);
    S.setChecklistItem(tallerId, taller.checklistItems.length, index, box.checked);
    const progress = S.getProgress(tallerId, taller.checklistItems.length);
    const summary = container.querySelector('.checklist-summary');
    if (summary) {
      summary.querySelector('.progress-fill').style.width = `${progress.percent}%`;
      summary.querySelector('.progress-bar').setAttribute('aria-valuenow', String(progress.percent));
      summary.querySelector('p').innerHTML = `<strong>${progress.completed} de ${progress.total}</strong> criterios completados (${progress.percent}%)`;
    }
    const headerBar = container.querySelector('.taller-header .progress-bar');
    if (headerBar) {
      headerBar.querySelector('.progress-fill').style.width = `${progress.percent}%`;
      headerBar.setAttribute('aria-valuenow', String(progress.percent));
      container.querySelector('.taller-header .muted').textContent = `${progress.completed} de ${progress.total} criterios de la lista de chequeo completados`;
    }
    if (onChecklistChange) onChecklistChange();
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (err2) {
      window.prompt('Copie el texto manualmente:', text);
      return false;
    }
  }
}

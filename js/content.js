// Carga y análisis de los contenidos Markdown fuente (content/*.md).
// El texto de cada taller se conserva íntegro; solo se segmenta por encabezados.

const cache = new Map();

async function fetchText(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path} (${res.status})`);
  const text = await res.text();
  cache.set(path, text);
  return text;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function inlineMd(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
    const safeUrl = escapeHtml(url);
    const external = /^https?:\/\//i.test(url);
    const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${safeUrl}"${rel}>${label}</a>`;
  });
  return out;
}

// Convierte un bloque de líneas Markdown (sin encabezados) a HTML semántico simple.
export function renderMarkdownBlock(lines) {
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    // Tabla: fila de cabecera seguida de línea separadora ---
    if (/^\|.*\|$/.test(line.trim()) && lines[i + 1] && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const rows = [];
      const headerCells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
      i += 2;
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        rows.push(lines[i].trim().slice(1, -1).split('|').map((c) => c.trim()));
        i++;
      }
      let table = '<div class="table-scroll"><table class="md-table"><thead><tr>';
      headerCells.forEach((c) => { table += `<th>${inlineMd(c)}</th>`; });
      table += '</tr></thead><tbody>';
      rows.forEach((r) => {
        table += '<tr>';
        r.forEach((c) => { table += `<td>${inlineMd(c)}</td>`; });
        table += '</tr>';
      });
      table += '</tbody></table></div>';
      html.push(table);
      continue;
    }

    // Lista de chequeo (checklist estático, no interactivo, fuera de la pestaña dedicada)
    if (/^- \[[ xX]\]\s+/.test(line)) {
      let items = [];
      while (i < lines.length && /^- \[[ xX]\]\s+/.test(lines[i])) {
        const m = lines[i].match(/^- \[([ xX])\]\s+(.*)$/);
        items.push({ checked: m[1].toLowerCase() === 'x', text: m[2] });
        i++;
      }
      let ul = '<ul class="md-checklist-static">';
      items.forEach((it) => {
        ul += `<li>${it.checked ? '☑' : '☐'} ${inlineMd(it.text)}</li>`;
      });
      ul += '</ul>';
      html.push(ul);
      continue;
    }

    // Lista ordenada
    if (/^\d+\.\s+/.test(line)) {
      let items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      let ol = '<ol class="md-list">';
      items.forEach((t) => { ol += `<li>${inlineMd(t)}</li>`; });
      ol += '</ol>';
      html.push(ol);
      continue;
    }

    // Lista no ordenada
    if (/^-\s+/.test(line)) {
      let items = [];
      while (i < lines.length && /^-\s+/.test(lines[i]) && !/^- \[[ xX]\]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^-\s+/, ''));
        i++;
      }
      let ul = '<ul class="md-list">';
      items.forEach((t) => { ul += `<li>${inlineMd(t)}</li>`; });
      ul += '</ul>';
      html.push(ul);
      continue;
    }

    // Párrafo (une líneas consecutivas de texto plano)
    let paras = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^\|.*\|$/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i]) && !/^-\s+/.test(lines[i])) {
      paras.push(lines[i]);
      i++;
    }
    const text = paras.join(' ').trim();
    const isCallout = /^\*\*Criterio de avance:\*\*/.test(text);
    html.push(`<p class="${isCallout ? 'callout' : ''}">${inlineMd(text)}</p>`);
  }
  return html.join('\n');
}

// Divide un documento Markdown en título (H1) y secciones (H2).
function splitSections(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let title = '';
  const sections = [];
  let current = null;
  lines.forEach((line) => {
    const h1 = line.match(/^#\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    if (h1 && !title) {
      title = h1[1].trim();
      return;
    }
    if (h2) {
      current = { heading: h2[1].trim(), lines: [] };
      sections.push(current);
      return;
    }
    if (current) current.lines.push(line);
  });
  return { title, sections };
}

export const TALLER_TABS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'resultados', label: 'Resultados de aprendizaje' },
  { id: 'conceptual', label: 'Base conceptual' },
  { id: 'preparacion', label: 'Preparación' },
  { id: 'actividad', label: 'Actividad' },
  { id: 'aplicacion', label: 'Aplicación al proyecto' },
  { id: 'entregables', label: 'Entregables' },
  { id: 'checklist', label: 'Lista de chequeo' },
  { id: 'retro', label: 'Retroalimentación' },
  { id: 'recursos', label: 'Recursos' },
];

const HEADING_TO_TAB = {
  'justificación': 'inicio',
  'resultados de aprendizaje': 'resultados',
  'contexto teórico': 'conceptual',
  'preparación': 'preparacion',
  'actividad paso a paso': 'actividad',
  'aplicación al proyecto': 'aplicacion',
  'entregables': 'entregables',
  'lista de chequeo y kpi': 'checklist',
  'retroalimentación semanal': 'retro',
  'recursos': 'recursos',
};

function normalizeHeading(h) {
  return h.toLowerCase().trim();
}

export async function getTaller(num) {
  const idNum = String(num).padStart(2, '0');
  const id = `taller-${idNum}`;
  const path = `content/${idNum}_taller_${idNum}.md`;
  const md = await fetchText(path);
  const { title, sections } = splitSections(md);
  const titleMatch = title.match(/^Taller\s+(\d+)\s+(.*)$/i);
  const numero = titleMatch ? titleMatch[1] : String(Number(idNum));
  const nombre = titleMatch ? titleMatch[2] : title;

  const byTab = {};
  TALLER_TABS.forEach((t) => { byTab[t.id] = []; });
  sections.forEach((s) => {
    const tabId = HEADING_TO_TAB[normalizeHeading(s.heading)];
    if (tabId) byTab[tabId].push(...s.lines);
    else byTab.inicio.push(`## ${s.heading}`, ...s.lines);
  });

  // Ítems de la lista de chequeo (interactivos), y contenido adicional (p. ej. Criterio de avance).
  const checklistLines = byTab.checklist;
  const checklistItems = [];
  const extraChecklistLines = [];
  checklistLines.forEach((line) => {
    const m = line.match(/^- \[([ xX])\]\s+(.*)$/);
    if (m) checklistItems.push(m[2]);
    else extraChecklistLines.push(line);
  });

  return {
    id,
    numero,
    nombre,
    titleRaw: title,
    tabsRaw: byTab,
    checklistItems,
    checklistExtraHtml: renderMarkdownBlock(extraChecklistLines),
  };
}

export async function getProgramaGeneral() {
  const md = await fetchText('content/00_programa_general.md');
  const { title, sections } = splitSections(md);
  return { title, sections };
}

export function findSection(sections, heading) {
  return sections.find((s) => normalizeHeading(s.heading) === normalizeHeading(heading));
}

// Cronograma: tabla con columnas Taller | Tema | Productos centrales.
export function parseCronograma(sections) {
  const s = findSection(sections, 'Cronograma y productos acumulativos');
  if (!s) return [];
  const lines = s.lines.filter((l) => /^\|.*\|$/.test(l.trim()));
  const rows = lines.slice(2); // omite cabecera y separador
  return rows.map((line) => {
    const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
    return { taller: cells[0], tema: cells[1], productos: cells[2] };
  });
}

// Rutas de proyecto: lista "- Ruta A. **Título.** Descripción".
export function parseRutas(sections) {
  const s = findSection(sections, 'Rutas de proyecto');
  if (!s) return [];
  const items = s.lines.filter((l) => /^-\s+Ruta/.test(l));
  return items.map((l) => {
    const m = l.match(/^-\s+Ruta\s+(\w)\.\s+\*\*(.+?)\*\*\.?\s*(.*)$/);
    if (!m) return { letra: '', titulo: l, descripcion: '' };
    return { letra: m[1], titulo: m[2], descripcion: m[3] };
  });
}

// Hitos: lista "- Hito N, al finalizar el taller X: descripción."
export function parseHitos(sections) {
  const s = findSection(sections, 'Hitos del programa');
  if (!s) return [];
  const items = s.lines.filter((l) => /^-\s+Hito/.test(l));
  return items.map((l) => {
    const m = l.match(/^-\s+Hito\s+(\d+),\s+al finalizar el taller\s+(\d+):\s+(.*)$/);
    if (!m) return { hito: '', taller: '', descripcion: l };
    return { hito: m[1], taller: m[2], descripcion: m[3].replace(/\.$/, '') };
  });
}

export function extractDedicacion(sections) {
  const s = findSection(sections, 'Población y alcance');
  if (!s) return null;
  const line = s.lines.find((l) => /Dedicación por taller/.test(l));
  if (!line) return null;
  const m = line.match(/Dedicación por taller:\s*(\d+ a \d+ horas) de trabajo autónomo y (\d+ a \d+ minutos) de retroalimentación/);
  if (!m) return null;
  return { horas: m[1], retro: m[2] };
}

// Recursos: recopila enlaces [texto](url) de todas las secciones "Recursos".
export function parseRecursosLinks(lines) {
  const links = [];
  lines.forEach((l) => {
    const m = l.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (m) links.push({ texto: m[1], url: m[2] });
  });
  return links;
}

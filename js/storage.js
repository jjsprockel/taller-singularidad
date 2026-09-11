// Persistencia local de progreso formativo (solo interfaz, sin datos académicos).
const KEY = 'singularidad-talleres:v1';

function defaultState() {
  return {
    version: 1,
    talleres: {},
    lastVisitedTaller: null,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.talleres) return defaultState();
    return parsed;
  } catch (err) {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    // Almacenamiento no disponible (modo privado, cuota agotada, etc.): se omite en silencio.
  }
}

function ensureTaller(state, tallerId, totalItems) {
  let t = state.talleres[tallerId];
  if (!t) {
    t = { checklist: new Array(totalItems).fill(false), visited: false, lastTab: 'inicio' };
    state.talleres[tallerId] = t;
  }
  if (!Array.isArray(t.checklist)) t.checklist = [];
  if (t.checklist.length !== totalItems) {
    const next = new Array(totalItems).fill(false);
    for (let i = 0; i < Math.min(totalItems, t.checklist.length); i++) next[i] = !!t.checklist[i];
    t.checklist = next;
  }
  return t;
}

export function markVisited(tallerId, totalItems, tab) {
  const state = loadState();
  const t = ensureTaller(state, tallerId, totalItems);
  t.visited = true;
  if (tab) t.lastTab = tab;
  state.lastVisitedTaller = tallerId;
  saveState(state);
}

export function setChecklistItem(tallerId, totalItems, index, value) {
  const state = loadState();
  const t = ensureTaller(state, tallerId, totalItems);
  if (index >= 0 && index < t.checklist.length) t.checklist[index] = !!value;
  saveState(state);
  return t.checklist.slice();
}

export function resetTaller(tallerId, totalItems) {
  const state = loadState();
  const t = ensureTaller(state, tallerId, totalItems);
  t.checklist = new Array(totalItems).fill(false);
  saveState(state);
  return t.checklist.slice();
}

export function getChecklist(tallerId, totalItems) {
  const state = loadState();
  const t = ensureTaller(state, tallerId, totalItems);
  return t.checklist.slice();
}

export function getProgress(tallerId, totalItems) {
  const checklist = getChecklist(tallerId, totalItems);
  const completed = checklist.filter(Boolean).length;
  const percent = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
  return { completed, total: totalItems, percent };
}

export function isVisited(tallerId) {
  const state = loadState();
  return !!(state.talleres[tallerId] && state.talleres[tallerId].visited);
}

export function getLastVisitedTaller() {
  const state = loadState();
  return state.lastVisitedTaller;
}

export function getGlobalStats(countsByTaller) {
  const state = loadState();
  const ids = Object.keys(countsByTaller);
  let iniciados = 0;
  let completos = 0;
  let sumaPercent = 0;
  const detalle = {};
  ids.forEach((id) => {
    const total = countsByTaller[id];
    const t = state.talleres[id];
    const checklist = t && Array.isArray(t.checklist) ? t.checklist : new Array(total).fill(false);
    const completed = checklist.filter(Boolean).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (t && t.visited) iniciados += 1;
    if (total > 0 && completed === total) completos += 1;
    sumaPercent += percent;
    detalle[id] = { completed, total, percent, visited: !!(t && t.visited) };
  });
  const globalPercent = ids.length > 0 ? Math.round(sumaPercent / ids.length) : 0;
  return {
    iniciados,
    completos,
    totalTalleres: ids.length,
    globalPercent,
    detalle,
    lastVisitedTaller: state.lastVisitedTaller,
  };
}

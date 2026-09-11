// Enrutador basado en hash, sin dependencias, compatible con GitHub Pages.
const VALID_PAGES = ['inicio', 'programa', 'proyectos', 'talleres', 'plantillas', 'recursos', 'seguimiento', 'nosotros'];
const TALLER_ID_RE = /^taller-(0[1-9]|1[0-2])$/;

function parseHash(hash) {
  let h = (hash || '').replace(/^#/, '');
  if (h.startsWith('/')) h = h.slice(1);
  const [pathPart, queryPart] = h.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const query = {};
  if (queryPart) {
    queryPart.split('&').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k) query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    });
  }

  const page = segments[0] || 'inicio';

  if (page === 'talleres' && segments[1] && TALLER_ID_RE.test(segments[1])) {
    return { page: 'talleres', id: segments[1], tab: query.tab || 'inicio' };
  }
  if (page === 'talleres') {
    return { page: 'talleres', id: null, tab: null };
  }
  if (VALID_PAGES.includes(page)) {
    return { page, id: null, tab: null };
  }
  return { page: 'inicio', id: null, tab: null };
}

export function getCurrentRoute() {
  return parseHash(window.location.hash);
}

export function navigate(path) {
  window.location.hash = path;
}

export function tallerPath(id, tab) {
  return `#/talleres/${id}${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`;
}

export function initRouter(onChange) {
  const handler = () => onChange(getCurrentRoute());
  window.addEventListener('hashchange', handler);
  if (!window.location.hash) {
    window.location.hash = '#/inicio';
  } else {
    handler();
  }
}

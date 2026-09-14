# Talleres del Semillero de Investigación Singularidad

Sitio web estático que publica los doce talleres de inteligencia artificial aplicada a la investigación en salud del Semillero de Investigación Singularidad (Fundación Universitaria de Ciencias de la Salud, FUCS). Está construido con HTML, CSS y JavaScript puro (sin framework ni paso de compilación) y listo para publicarse en GitHub Pages.

Referencia visual: [jjsprockel.github.io/singularidad-proyectos](https://jjsprockel.github.io/singularidad-proyectos/)

## Novedades de esta versión

Se incorporaron tres componentes tomados y adaptados del sitio de referencia
(`singularidad-proyectos`), para ampliar la presentación de contenidos de cada taller:

- **Visor de presentación en PDF** (`bloquePdf`): cada taller tiene, en su pestaña
  Inicio, una diapositiva descargable con toolbar, visor embebido y enlace de respaldo,
  igual que en el sitio de referencia. Los PDF viven en `assets/presentaciones/` y se
  generan con `tools/generate-presentaciones/` (ver ese directorio para regenerarlos
  tras editar un taller).
- **Flujo metodológico semanal**: el ciclo Preparar → Ejecutar → Verificar →
  Retroalimentar → Ajustar, visible en Inicio, en cada taller y en Programa (con el
  detalle de evidencia esperada por fase).
- **Tarjetas mini de recursos**: los enlaces de la pestaña Recursos (por taller y en la
  página Recursos) se muestran como tarjetas con icono en vez de una lista simple de
  enlaces.

## Estructura del proyecto

```text
/
├── .nojekyll
├── index.html
├── README.md
├── CLAUDE.md
├── assets/
│   ├── logos/
│   │   ├── singularidad.png
│   │   └── fucs.png
│   └── presentaciones/
│       ├── programa-general.pdf
│       └── taller-01.pdf ... taller-12.pdf
├── tools/
│   └── generate-presentaciones/   (script para regenerar los PDF anteriores)
├── content/
│   ├── 00_programa_general.md
│   ├── 01_taller_01.md ... 12_taller_12.md
│   └── plantillas/
│       ├── ficha_proyecto.md
│       ├── matriz_alineacion.md
│       ├── registro_decisiones.md
│       ├── rubrica_retroalimentacion.md
│       ├── matriz_evidencia.md
│       ├── matriz_riesgos.md
│       ├── plan_gestion_datos.md
│       ├── checklist_protocolo.md
│       ├── checklist_manuscrito.md
│       ├── bitacora_uso_ia.md
│       └── arquitectura_contenidos_web.md
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── content.js
    ├── router.js
    ├── storage.js
    └── ui.js
```

## Cómo funciona

- **Enrutador por hash** (`js/router.js`): rutas como `#/inicio`, `#/programa`, `#/talleres/taller-03?tab=actividad`. Funciona bajo cualquier subdirectorio de GitHub Pages sin configuración de servidor.
- **Contenido** (`js/content.js`): cada página lee y analiza en el navegador los archivos Markdown de `content/` (fetch + un analizador ligero propio, sin dependencias externas). El contenido curricular nunca se duplica manualmente en el código: siempre se lee del `.md` original.
- **Interfaz** (`js/ui.js`): arma cada página, las diez pestañas accesibles de cada taller (roles ARIA `tablist`/`tab`/`tabpanel`, navegación con flechas, `Home` y `End`), los botones de copia y la lista de chequeo interactiva.
- **Persistencia local** (`js/storage.js`): guarda únicamente estado de interfaz (talleres visitados, casillas marcadas) en `localStorage` bajo la clave `singularidad-talleres:v1`. No se guarda ni se transmite ningún contenido académico.

## Previsualización local

Como el sitio usa `fetch()` para cargar los archivos Markdown, debe servirse con un servidor HTTP local (no abrir `index.html` directamente con `file://`, porque los navegadores bloquean `fetch` sobre archivos locales).

Con Python (incluido en macOS):

```bash
cd "Taller encuentros 2026-2027"
python3 -m http.server 8000
```

Luego abrir `http://localhost:8000/index.html` en el navegador.

Alternativas equivalentes: `npx serve .` o la extensión "Live Server" de VS Code.

## Editar contenidos

- Los doce talleres y el programa general están en `content/*.md`. Cada taller mantiene las secciones `Justificación`, `Resultados de aprendizaje`, `Contexto teórico`, `Preparación`, `Actividad paso a paso`, `Aplicación al proyecto`, `Entregables`, `Lista de chequeo y KPI`, `Retroalimentación semanal` y `Recursos`; estas se mapean automáticamente a las diez pestañas de la interfaz. No renombrar los encabezados `##` sin actualizar el mapa `HEADING_TO_TAB` en `js/content.js`.
- Las plantillas descargables están en `content/plantillas/`. Se sirven tal cual (no se reconstruyen en pantalla); si se agrega un archivo nuevo, también debe añadirse su entrada en el arreglo `PLANTILLAS` de `js/ui.js` (nombre, propósito y talleres relacionados).
- Los logotipos en `assets/logos/` son los originales del sitio de referencia y no deben recortarse, recolorearse ni reemplazarse.
- Las presentaciones en `assets/presentaciones/` se generan a partir de estos mismos archivos `.md` (ver `tools/generate-presentaciones/README.md`). Tras editar un taller, vuelva a ejecutar el generador para que la presentación quede sincronizada; no edite los PDF directamente.

## Desplegar en GitHub Pages

1. Confirmar que todas las rutas del código son relativas (no empiezan por `/`) — ya lo son en este proyecto.
2. Hacer commit y push de este directorio a la rama `main` de un repositorio de GitHub.
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, seleccionar rama `main` y carpeta `/ (root)`.
4. Guardar. El sitio quedará disponible en `https://<usuario>.github.io/<repositorio>/`.
5. El archivo `.nojekyll` ya está incluido para evitar que GitHub Pages procese el sitio con Jekyll.

## Alcance y límites

- Evaluación exclusivamente formativa: no hay notas, rankings ni calificación sumativa en ninguna página.
- No hay backend, formularios que envíen datos, analítica ni dependencias remotas: todo el estado vive en `localStorage` del navegador de cada persona.
- No se incluyen datos clínicos reales ni información identificable de pacientes; el aviso de privacidad es visible en las páginas donde se usa IA.

// Genera las plantillas descargables en formato .docx (Word), a partir del mismo
// contenido editorial que vive en content/plantillas/*.md — para que los estudiantes,
// que pueden no estar familiarizados con Markdown, puedan abrirlas y diligenciarlas
// directamente en Word (o Google Docs / LibreOffice) sin fricción.
//
// Uso:
//   cd tools/generate-plantillas-docx
//   node generate.mjs
//
// Escribe los .docx directamente en ../../content/plantillas/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ShadingType, Header, Footer, ImageRun,
  PageNumber, VerticalAlign,
} from 'docx';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const OUT_DIR = path.join(ROOT, 'content', 'plantillas');
const LOGO_SINGULARIDAD = path.join(ROOT, 'assets', 'logos', 'singularidad.png');
const LOGO_FUCS = path.join(ROOT, 'assets', 'logos', 'fucs.png');

const NARANJA = 'E8892E';
const NARANJA_2 = 'C96A12';
const GRIS = '595959';
const GRIS_CLARO = 'F2F2F2';

// ───────────────────────── Helpers ─────────────────────────

function docHeader(subtitulo) {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({ data: fs.readFileSync(LOGO_SINGULARIDAD), transformation: { width: 76, height: 36 }, type: 'png' }),
          new TextRun({ text: '   ' }),
          new ImageRun({ data: fs.readFileSync(LOGO_FUCS), transformation: { width: 66, height: 28 }, type: 'png' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NARANJA, space: 4 } },
        children: [
          new TextRun({ text: 'Semillero de Investigación Singularidad · FUCS', color: GRIS, size: 16 }),
          new TextRun({ text: subtitulo ? '  —  ' + subtitulo : '', color: GRIS, size: 16, italics: true }),
        ],
      }),
    ],
  });
}

function docFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'Plantilla editable · Talleres del Semillero Singularidad — Página ', color: GRIS, size: 16 }),
          new TextRun({ children: [PageNumber.CURRENT], color: GRIS, size: 16 }),
        ],
      }),
    ],
  });
}

function title(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 160 },
    children: [new TextRun({ text, color: NARANJA_2, bold: true, size: 40 })],
  });
}

function sectionTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: NARANJA, space: 2 } },
    children: [new TextRun({ text, color: '1A1A1A', bold: true, size: 26 })],
  });
}

function intro(text) {
  return new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text, italics: true, color: GRIS, size: 21 })] });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 160, after: 120 },
    shading: { type: ShadingType.CLEAR, fill: 'FDF2E4' },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: NARANJA, space: 6 },
      top: { style: BorderStyle.SINGLE, size: 2, color: 'FDF2E4', space: 6 },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'FDF2E4', space: 6 },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'FDF2E4', space: 6 },
    },
    children: [new TextRun({ text, size: 20 })],
  });
}

function para(text) {
  return new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text, size: 21 })] });
}

function checklist(items) {
  return items.map((t) => new Paragraph({
    spacing: { after: 100 },
    indent: { left: 200 },
    children: [new TextRun({ text: '☐  ', size: 22 }), new TextRun({ text: t, size: 21 })],
  }));
}

// Tabla con encabezado (naranja) y N filas vacías para diligenciar.
function fillTable(headers, emptyRows = 8, colWidths) {
  const totalWidth = 9350; // ancho útil aprox. en DXA para carta con márgenes de 1"
  const widths = colWidths || headers.map(() => Math.floor(totalWidth / headers.length));

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: NARANJA },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 80, bottom: 80, left: 70, right: 70 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 17 })] })],
    })),
  });

  const dataRows = Array.from({ length: emptyRows }, () => new TableRow({
    children: headers.map((_, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 140, bottom: 140, left: 70, right: 70 },
      children: [new Paragraph({ children: [new TextRun({ text: '', size: 19 })] })],
    })),
  }));

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
    },
    rows: [headerRow, ...dataRows],
  });
}

// Tabla de campos "Etiqueta | espacio para completar" (formulario de una columna de datos).
function fieldsTable(labels, labelWidth = 3200) {
  const totalWidth = 9350;
  const valueWidth = totalWidth - labelWidth;
  const rows = labels.map((label) => new TableRow({
    children: [
      new TableCell({
        width: { size: labelWidth, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: GRIS_CLARO },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 120, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
      }),
      new TableCell({
        width: { size: valueWidth, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: '', size: 20 })] }), new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })],
      }),
    ],
  }));
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: [labelWidth, valueWidth],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
    },
    rows,
  });
}

function spacer(h = 120) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

async function writeDoc(fileBase, subtitulo, bodyChildren) {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // Carta (Letter)
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
        },
      },
      headers: { default: docHeader(subtitulo) },
      footers: { default: docFooter() },
      children: bodyChildren,
    }],
  });
  const buf = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, `${fileBase}.docx`);
  fs.writeFileSync(outPath, buf);
  console.log('✔', path.relative(ROOT, outPath));
}

// ───────────────────────── Documentos ─────────────────────────

async function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  await writeDoc('ficha_proyecto', 'Taller 1 · Proyectos', [
    title('Ficha de proyecto'),
    intro('Delimita el problema, la ruta de proyecto (A–D) y el producto esperado. Complete cada campo directamente en la columna derecha.'),
    fieldsTable([
      'Código y versión', 'Estudiante o equipo', 'Ruta (A, B, C o D)', 'Título provisional',
      'Problema y brecha', 'Población y contexto', 'Pregunta estructurada', 'Objetivo general',
      'Papel de la IA', 'Datos necesarios y autorización', 'Producto esperado en 12 semanas',
      'Riesgos principales', 'Próxima decisión',
    ]),
  ]);

  await writeDoc('matriz_alineacion', 'Taller 5 · Taller 10', [
    title('Matriz de alineación'),
    intro('Relaciona pregunta, objetivos, variables, datos y análisis. Agregue una fila por objetivo específico.'),
    fillTable(['Pregunta', 'Objetivo', 'Variable o constructo', 'Fuente del dato', 'Momento', 'Análisis', 'Producto', 'Criterio de éxito'], 8, [1000, 1000, 1600, 1300, 900, 850, 850, 1850]),
  ]);

  await writeDoc('registro_decisiones', 'Transversal · Proyectos', [
    title('Registro de decisiones'),
    intro('Mantiene trazabilidad de cambios y del papel de la IA en cada decisión relevante del proyecto.'),
    fillTable(['Fecha', 'Decisión', 'Evidencia considerada', 'Alternativas', 'Papel de la IA', 'Responsable', 'Efecto sobre protocolo o análisis', 'Versión afectada'], 10, [700, 950, 1500, 1100, 1100, 1100, 1800, 1100]),
  ]);

  await writeDoc('rubrica_retroalimentacion', 'Transversal · Proyectos', [
    title('Rúbrica de retroalimentación'),
    intro('Guía la reunión semanal con cinco dominios formativos. Escala: 0 ausente, 1 inicial, 2 suficiente, 3 sólido.'),
    fillDomainTable(),
    spacer(160),
    fieldsTable(['Decisión (avanzar / corregir antes de avanzar / consultar)', 'Responsable y fecha del siguiente producto']),
  ]);

  await writeDoc('matriz_evidencia', 'Taller 4', [
    title('Matriz de evidencia'),
    intro('Organiza la extracción y síntesis de referencias verificadas. Agregue una fila por estudio incluido.'),
    fillTable(['ID', 'Referencia verificada', 'Diseño', 'Población y muestra', 'Intervención o exposición', 'Comparador', 'Desenlace', 'Hallazgo principal', 'Limitación', 'Aporte al proyecto'], 10, [450, 1155, 650, 1075, 1160, 1160, 950, 900, 1000, 850]),
  ]);

  await writeDoc('matriz_riesgos', 'Taller 6 · Taller 7', [
    title('Matriz de riesgos'),
    intro('Identifica riesgos metodológicos y éticos, con causa, impacto, control y responsable.'),
    fillTable(['Riesgo', 'Causa', 'Consecuencia', 'Probabilidad', 'Impacto', 'Control preventivo', 'Respuesta', 'Responsable', 'Riesgo residual'], 8, [650, 630, 1250, 1250, 750, 1500, 930, 1100, 1290]),
  ]);

  await writeDoc('plan_gestion_datos', 'Taller 7 · Taller 8', [
    title('Plan de gestión de datos'),
    sectionTitle('Inventario'),
    fillTable(['Fuente', 'Tipo de dato', 'Sensibilidad', 'Base de autorización', 'Responsable', 'Ubicación autorizada', 'Acceso', 'Retención', 'Eliminación'], 6, [750, 800, 1210, 1410, 1125, 1275, 700, 955, 1125]),
    sectionTitle('Flujo y controles'),
    para('Describa captura, transferencia, seudonimización o anonimización, validación, respaldo, versiones, análisis, publicación y cierre.'),
    ...Array.from({ length: 6 }, () => new Paragraph({ spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' } }, children: [new TextRun({ text: ' ' })] })),
  ]);

  await writeDoc('checklist_protocolo', 'Taller 10', [
    title('Lista de chequeo del protocolo'),
    intro('Verifica que el protocolo tenga título, pregunta, diseño, variables, análisis, ética, papel de la IA y cronograma completos.'),
    ...checklist([
      'Título y versión con fecha.',
      'Problema, brecha y justificación sustentados.',
      'Pregunta, objetivo principal y desenlace alineados.',
      'Diseño, población, muestra y unidades definidos.',
      'Variables, fuentes, momentos y calidad especificados.',
      'Plan de análisis por objetivo.',
      'Riesgos de sesgo y controles.',
      'Ética, privacidad y gobernanza de datos.',
      'Papel de la IA, supervisión humana y trazabilidad.',
      'Cronograma, responsables y recursos.',
      'Guía de protocolo pertinente completada.',
      'Registro de cambios y criterios para desviaciones.',
    ]),
  ]);

  await writeDoc('checklist_manuscrito', 'Taller 12', [
    title('Lista de chequeo del manuscrito'),
    intro('Verifica título, métodos, resultados, discusión, referencias, declaraciones de autoría y uso de IA antes de enviar el manuscrito.'),
    ...checklist([
      'Título y resumen representan diseño y resultado principal.',
      'Introducción conduce a la pregunta y objetivo.',
      'Métodos corresponden al protocolo y explican desviaciones.',
      'Resultados incluyen denominadores e incertidumbre.',
      'Texto, tablas y figuras son consistentes.',
      'Discusión no excede los datos.',
      'Limitaciones y aplicabilidad están explícitas.',
      'Referencias, DOI, URL y citas se verificaron.',
      'Autoría, conflictos, ética, datos y código están declarados.',
      'Uso de IA está descrito según las normas aplicables.',
      'Lista EQUATOR pertinente completada.',
    ]),
  ]);

  await writeDoc('bitacora_uso_ia', 'Transversal · especialmente Taller 2', [
    title('Bitácora de uso de IA'),
    intro('Registra fecha, tarea, plataforma, archivos usados, prompt relevante, salida, verificación y decisión humana. Agregue una fila por interacción relevante.'),
    fillTable(['Fecha', 'Taller y tarea', 'Plataforma o modelo', 'Archivos o datos usados', 'Prompt o instrucción relevante', 'Salida utilizada', 'Verificación realizada', 'Decisión humana', 'Responsable'], 12, [750, 1050, 1050, 1050, 1250, 1050, 1050, 1050, 1050]),
  ]);

  await writeDoc('arquitectura_contenidos_web', 'Referencia general', [
    title('Arquitectura de contenidos para la página web'),
    intro('Referencia técnica de navegación y pestañas usada para construir este sitio. No es un formulario para diligenciar.'),
    sectionTitle('Navegación izquierda'),
    para('Inicio, Programa, Proyectos, Talleres 1 a 12, Plantillas, Recursos y Seguimiento.'),
    sectionTitle('Pestañas de cada taller'),
    ...[
      'Inicio', 'Resultados de aprendizaje', 'Base conceptual', 'Preparación', 'Actividad',
      'Aplicación al proyecto', 'Entregables', 'Lista de chequeo', 'Retroalimentación', 'Recursos',
    ].map((t, i) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `${i + 1}. ${t}`, size: 21 })] })),
    sectionTitle('Convención de contenido'),
    para('Cada página debe mostrar número y título, tiempo estimado, prerrequisitos, instrucciones numeradas, archivos descargables, criterio de avance y fecha de actualización. Los enlaces externos deben revisarse periódicamente. No se alojarán datos de investigación sensibles en GitHub Pages.'),
  ]);

  console.log('\nListo. Documentos .docx generados en', path.relative(ROOT, OUT_DIR));
}

function fillDomainTable() {
  const dominios = [
    ['Exactitud y evidencia', '30'],
    ['Coherencia metodológica', '25'],
    ['Reproducibilidad y trazabilidad', '20'],
    ['Ética y gobernanza de datos', '15'],
    ['Comunicación científica', '10'],
  ];
  const headers = ['Dominio', 'Peso', 'Puntaje', 'Evidencia', 'Cambio requerido'];
  const widths = [2200, 650, 950, 2700, 2850];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: NARANJA },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 80, bottom: 80, left: 70, right: 70 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 17 })] })],
    })),
  });

  const dataRows = dominios.map(([dominio, peso]) => new TableRow({
    children: [
      new TableCell({ width: { size: widths[0], type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: dominio, size: 19 })] })] }),
      new TableCell({ width: { size: widths[1], type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: peso + ' %', size: 19 })] })] }),
      new TableCell({ width: { size: widths[2], type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: '', size: 19 })] })] }),
      new TableCell({ width: { size: widths[3], type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: '', size: 19 })] })] }),
      new TableCell({ width: { size: widths[4], type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: '', size: 19 })] })] }),
    ],
  }));

  return new Table({
    width: { size: 9350, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
    },
    rows: [headerRow, ...dataRows],
  });
}

build().catch((err) => { console.error(err); process.exit(1); });

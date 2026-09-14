# Generador de plantillas en Word (.docx)

Genera las once plantillas descargables que se muestran en la página `Plantillas` y en
`Proyectos` (`content/plantillas/*.docx`), a partir de las mismas plantillas `.md` que
sirven de fuente editorial.

Se distribuyen como documentos Word en vez de Markdown para que los estudiantes puedan
abrirlas y diligenciarlas directamente en Word, Google Docs o LibreOffice, sin necesitar
familiaridad previa con la sintaxis Markdown. El generador **no inventa contenido**: cada
campo, tabla o lista de chequeo del `.docx` reproduce la estructura del `.md`
correspondiente.

## Requisitos

- Node.js 18 o superior.
- El paquete `docx` (ver `package.json`).

## Uso

```bash
cd tools/generate-plantillas-docx
npm install
npm run build
```

Los archivos se escriben directamente en `../../content/plantillas/`, sobrescribiendo
los `.docx` existentes. Los archivos `.md` originales se conservan en la misma carpeta
como fuente editorial; si edita una plantilla, actualice primero el `.md` y luego vuelva
a ejecutar este generador para que el `.docx` quede sincronizado.

## Plantillas generadas

`ficha_proyecto`, `matriz_alineacion`, `registro_decisiones`, `rubrica_retroalimentacion`,
`matriz_evidencia`, `matriz_riesgos`, `plan_gestion_datos`, `checklist_protocolo`,
`checklist_manuscrito`, `bitacora_uso_ia`, `arquitectura_contenidos_web`.

## Personalizar el diseño

Los colores y la tipografía están al inicio de `generate.mjs` (`NARANJA`, `NARANJA_2`,
`GRIS`, `GRIS_CLARO`) y el tamaño de página es carta (Letter). Si cambia la paleta del
sitio, actualice también `css/styles.css` y `tools/generate-presentaciones/generate.mjs`
para mantener la coherencia visual entre el sitio, las presentaciones y las plantillas.

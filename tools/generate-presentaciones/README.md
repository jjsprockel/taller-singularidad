# Generador de presentaciones PDF

Genera las 13 presentaciones en PDF que se muestran en el sitio (`assets/presentaciones/`):
`programa-general.pdf` y `taller-01.pdf` … `taller-12.pdf`.

El generador **no inventa contenido**: lee los mismos archivos `content/00_programa_general.md`
y `content/0X_taller_0X.md` que usa el sitio web, y construye cada diapositiva a partir de esas
secciones. Si edita un taller en `content/`, vuelva a ejecutar este script para que la
presentación quede sincronizada.

## Requisitos

- Node.js 18 o superior.
- El paquete `playwright` con Chromium instalado (se usa para exportar el PDF con la misma
  tipografía, colores y logotipos del sitio).

## Uso

```bash
cd tools/generate-presentaciones
npm install playwright
npx playwright install chromium   # solo la primera vez, si Chromium no está instalado
npm run build
```

Los archivos se escriben directamente en `../../assets/presentaciones/`, sobrescribiendo
los existentes.

## Qué contiene cada presentación

Cada taller genera una presentación de 9 a 10 diapositivas: portada, resultados de
aprendizaje, base conceptual, preparación y ciclo semanal (el mismo componente de flujo
metodológico que usa el sitio: Preparar → Ejecutar → Verificar → Retroalimentar → Ajustar),
actividad paso a paso, aplicación al proyecto y entregables, lista de chequeo y KPI,
retroalimentación y recursos, y cierre. `programa-general.pdf` resume el programa completo
(rutas de proyecto, cronograma de los doce talleres, hitos e indicadores).

## Personalizar el diseño

Los tokens de color y tipografía están al inicio de `generate.mjs` (objeto `TOKENS` y
función `baseCss()`) y son los mismos valores usados en `css/styles.css`. Si cambia la
paleta del sitio, actualice ambos lugares para mantener la coherencia visual.

# Instrucciones para Claude Code

## Proyecto

Construir el sitio web estático **Talleres del Semillero de Investigación Singularidad** para estudiantes de medicina. El sitio debe publicar el programa formativo de doce talleres de inteligencia artificial aplicada a la investigación en salud, sus actividades, productos, listas de chequeo, recursos y plantillas.

La referencia visual obligatoria es:

- Sitio publicado: https://jjsprockel.github.io/singularidad-proyectos/
- Referencia técnica afín: https://github.com/jjsprockel/taller-IA-Investigacion

El resultado debe poder desplegarse directamente en **GitHub Pages**, sin servidor, base de datos, autenticación ni paso de compilación.

## Resultado esperado

Entregar una aplicación web educativa en español, completa y navegable, que:

1. Mantenga la identidad visual, los dos logotipos y el lenguaje de interfaz del sitio de referencia.
2. Presente los doce talleres como módulos progresivos.
3. Permita recorrer cada taller mediante pestañas.
4. Conserve listas de chequeo y progreso en el navegador mediante `localStorage`.
5. Permita copiar prompts y bloques de código con un botón.
6. Facilite descargar las plantillas Markdown.
7. Funcione correctamente en escritorio, tableta y móvil.
8. Use únicamente rutas relativas para funcionar bajo un subdirectorio de GitHub Pages.

## Insumos obligatorios

Usar como fuente editorial los archivos suministrados junto con este documento:

- `content/00_programa_general.md`
- `content/01_taller_01.md` a `content/12_taller_12.md`
- `content/plantillas/*.md`

No resumir, inventar ni eliminar contenido curricular. Se permiten correcciones ortográficas menores y ajustes de marcado para la interfaz, sin cambiar el significado. Mantener tildes, caracteres especiales, enlaces, tablas, listas y jerarquías.

## Reglas no negociables

- Idioma de toda la interfaz: español.
- Evaluación exclusivamente formativa; no mostrar notas, rankings ni calificación sumativa.
- Cada taller debe vincular el aprendizaje con un proyecto individual o grupal y evidenciar la contribución individual.
- La reunión semanal de retroalimentación dura entre 30 y 60 minutos.
- No incluir datos clínicos reales, nombres de pacientes ni ejemplos identificables.
- Mostrar de manera visible la advertencia sobre privacidad y revisión humana en las actividades que usan IA.
- No añadir chatbots conectados a APIs ni solicitar claves.
- No agregar backend, formularios que envíen datos, analítica invasiva, cookies de seguimiento ni dependencias remotas innecesarias.
- No reemplazar los logotipos por versiones generadas con IA.
- No modificar el sitio de referencia. Construir un sitio nuevo que reutilice su sistema visual.

## Identidad visual que debe conservarse

Reproducir el estilo observado en el sitio de referencia mediante variables CSS. Usar estos valores como base:

```css
:root {
  --negro: #0A0A0B;
  --negro-2: #131315;
  --superficie: #1B1B1E;
  --superficie-2: #222226;
  --texto: #F4F1EA;
  --texto-sec: #B7B5AE;
  --naranja: #E8892E;
  --naranja-2: #F2A94E;
  --azul-info: #6FA3D8;
  --verde-ok: #4CAF7D;
  --linea: #2E2E33;
  --sidebar-w: 272px;
  --content-max: 880px;
  --r-sm: 6px;
  --r-md: 12px;
  --r-lg: 20px;
  --r-xl: 32px;
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --sp-4: 32px;
  --sp-5: 48px;
  --sh-xs: 0 1px 3px rgba(0,0,0,.35);
  --sh-sm: 0 2px 10px rgba(0,0,0,.40);
  --sh-md: 0 8px 28px rgba(0,0,0,.48);
  --trans: .18s ease;
}
```

### Reglas de composición

- Fuente: `Inter, system-ui, -apple-system, sans-serif`.
- Fondo principal `--negro`; barra lateral `--negro-2`.
- En escritorio, barra lateral fija de 272 px y contenido centrado con ancho máximo de 880 px.
- Encabezados blancos, texto secundario gris cálido y acentos naranja.
- Secciones con línea inferior naranja.
- Tarjetas oscuras con bordes sutiles, esquinas redondeadas y encabezado sobre `--superficie-2`.
- Usar borde lateral naranja en tarjetas de información o instrucciones relevantes.
- Píldoras para duración, modalidad, producto esperado y estado.
- La pestaña activa debe mostrar fondo marrón oscuro y subrayado naranja.
- Los estados completados usan verde y nunca dependen únicamente del color: añadir icono o texto.
- Evitar degradados llamativos, colores neón, ilustraciones genéricas y exceso de animaciones.

## Imágenes y activos

Conservar exactamente los dos logotipos del sitio de referencia:

- `https://jjsprockel.github.io/singularidad-proyectos/assets/logos/singularidad.png`
- `https://jjsprockel.github.io/singularidad-proyectos/assets/logos/fucs.png`

Durante la implementación:

1. Descargar ambos archivos una sola vez.
2. Guardarlos localmente como `assets/logos/singularidad.png` y `assets/logos/fucs.png`.
3. No hacer *hotlinking* en el sitio final.
4. No recortar, recolorear, deformar ni añadir efectos a los logotipos.
5. Mantener su relación de aspecto y textos alternativos descriptivos.
6. Mostrar ambos en la barra lateral y en la portada, como en la referencia.

Si alguno no se puede descargar, detener esa parte y reportar el bloqueo; no sustituirlo por otro archivo.

## Arquitectura de información

La navegación lateral persistente debe contener:

1. Inicio
2. Programa
3. Proyectos
4. Talleres
   - 1. Fundamentos de IA y definición del proyecto
   - 2. Trabajo riguroso con chatbots y LLM
   - 3. Problema y pregunta de investigación
   - 4. Búsqueda y evaluación crítica de literatura
   - 5. Marco teórico, objetivos e hipótesis
   - 6. Diseño, población, variables y sesgos
   - 7. Ética, gobernanza de datos y reproducibilidad
   - 8. Preparación de datos y análisis exploratorio
   - 9. Diseño y evaluación de ML, DL y LLM
   - 10. Protocolo y plan de análisis
   - 11. Conducción, análisis y resultados
   - 12. Escritura científica y comunicación
5. Plantillas
6. Recursos
7. Seguimiento
8. Acerca del semillero

En escritorio, el menú queda fijo. En móvil se convierte en panel desplegable con botón visible, foco gestionado, cierre con `Escape` y bloqueo del desplazamiento del fondo.

## Páginas y rutas

Implementar una SPA con rutas basadas en hash para evitar problemas de redirección en GitHub Pages:

- `#/inicio`
- `#/programa`
- `#/proyectos`
- `#/talleres/taller-01` a `#/talleres/taller-12`
- `#/plantillas`
- `#/recursos`
- `#/seguimiento`
- `#/nosotros`

Al cambiar de ruta o taller, actualizar el título del documento, el estado activo del menú y el foco principal. La URL debe permitir enlazar directamente un taller.

## Portada

La portada debe conservar el lenguaje visual del ejemplo y contener:

- Logotipos de Singularidad y FUCS.
- Título: **Talleres del Semillero de Investigación Singularidad**.
- Subtítulo: **Inteligencia artificial aplicada a la investigación en salud**.
- Descripción breve del itinerario.
- Píldoras: doce talleres; trabajo autónomo de 2 a 4 horas; retroalimentación semanal de 30 a 60 minutos; modalidad híbrida.
- Botones: `Explorar talleres` y `Ver programa`.
- Resumen de las cuatro rutas de proyecto.
- Línea de cinco hitos acumulativos del programa.
- Cuadrícula con las doce tarjetas de taller y su producto central.

## Página Programa

Renderizar íntegramente `content/00_programa_general.md`, con bloques diferenciados para:

- propósito;
- población y alcance;
- competencia general;
- rutas de proyecto;
- método de trabajo;
- retroalimentación semanal;
- evaluación formativa;
- cronograma;
- reglas transversales;
- hitos;
- indicadores globales;
- recursos.

## Página Proyectos

Explicar que cada estudiante se integra desde el taller 1 a un proyecto individual o grupal. Mostrar las cuatro rutas A–D y una tarjeta de continuidad con los productos que se acumulan del taller 1 al 12.

No crear expedientes de estudiantes ni recolectar datos. Añadir enlaces de descarga a `ficha_proyecto.md`, `matriz_alineacion.md`, `registro_decisiones.md` y `rubrica_retroalimentacion.md`.

## Estructura de cada taller

Cada taller debe abrir como una página propia con una franja horizontal de pestañas fija bajo el borde superior del contenido. Usar exactamente estas pestañas:

1. Inicio
2. Resultados de aprendizaje
3. Base conceptual
4. Preparación
5. Actividad
6. Aplicación al proyecto
7. Entregables
8. Lista de chequeo
9. Retroalimentación
10. Recursos

### Mapeo del Markdown a las pestañas

| Sección editorial | Pestaña |
|---|---|
| Justificación, propósito, duración, producto | Inicio |
| Objetivos o resultados de aprendizaje | Resultados de aprendizaje |
| Contexto o base conceptual | Base conceptual |
| Preparación previa, materiales, herramientas | Preparación |
| Instrucciones, pasos, ejercicios y prompts | Actividad |
| Aplicación al proyecto y evidencia individual | Aplicación al proyecto |
| Productos centrales y archivos requeridos | Entregables |
| Lista de chequeo y KPI | Lista de chequeo |
| Guion de reunión semanal y criterios de revisión | Retroalimentación |
| Referencias y enlaces | Recursos |

No ocultar secciones que estén vacías: mostrar una nota editorial clara para que puedan completarse posteriormente.

### Encabezado del taller

Mostrar:

- número y nombre;
- breve propósito;
- duración estimada;
- producto central;
- posición `Taller X de 12`;
- botones `Anterior` y `Siguiente`;
- barra de progreso basada únicamente en la lista de chequeo local.

## Interacciones

### Pestañas

- Deben funcionar con clic y teclado.
- Implementar roles ARIA `tablist`, `tab` y `tabpanel`.
- Permitir flechas izquierda/derecha, `Home` y `End`.
- La pestaña activa debe reflejarse en la URL, por ejemplo `#/talleres/taller-03?tab=actividad`.
- En móvil, la fila puede desplazarse horizontalmente.

### Botones de copia

- Añadir `Copiar` en prompts y bloques de código.
- Cambiar temporalmente a `Copiado` tras una operación exitosa.
- Si la API de portapapeles falla, ofrecer selección manual sin romper la página.

### Listas de chequeo

- Convertir los ítems de chequeo de cada taller en casillas interactivas.
- Persistir en `localStorage` usando una clave versionada, por ejemplo `singularidad-talleres:v1`.
- Mostrar `n de N criterios completados` y porcentaje.
- Incluir `Restablecer este taller` con confirmación local.
- No sincronizar ni transmitir esta información.

### Seguimiento

La página `Seguimiento` resume localmente:

- talleres iniciados;
- talleres con checklist completo;
- porcentaje global;
- cinco hitos alcanzados según los talleres 3, 5, 7, 10 y 12;
- acceso al último taller visitado.

Indicar que el estado vive solo en ese navegador y no constituye una nota.

### Descargas

La página `Plantillas` debe listar cada archivo con nombre, propósito, talleres relacionados y botón de descarga. Entregar los `.md` originales; no reconstruirlos desde texto mostrado en pantalla.

## Estructura técnica requerida

Usar HTML, CSS y JavaScript puro, sin framework y sin compilación. Propuesta mínima:

```text
/
├── .nojekyll
├── index.html
├── README.md
├── CLAUDE.md
├── assets/
│   └── logos/
│       ├── singularidad.png
│       └── fucs.png
├── content/
│   ├── 00_programa_general.md
│   ├── 01_taller_01.md ... 12_taller_12.md
│   └── plantillas/
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── content.js
    ├── router.js
    ├── storage.js
    └── ui.js
```

Se puede usar una biblioteca Markdown pequeña y fijada por versión solo si queda vendorizada localmente. Preferir una transformación controlada o contenido estructurado en JS cuando facilite el mapeo a pestañas. El sitio debe seguir funcionando sin red después de cargar sus archivos locales.

## Implementación por fases

### Fase 1. Auditoría e inventario

1. Leer todos los archivos de `content/`.
2. Inspeccionar el sitio de referencia en escritorio y móvil.
3. Descargar y validar los dos logotipos.
4. Crear una matriz que mapee todas las secciones de los doce talleres a las diez pestañas.
5. Reportar inconsistencias editoriales antes de alterar contenido.

### Fase 2. Base visual y navegación

1. Crear la estructura de archivos.
2. Implementar variables CSS, barra lateral, encabezados, tarjetas, píldoras y pie de página.
3. Implementar el enrutador por hash y el menú activo.
4. Resolver el menú móvil y la navegación por teclado.

### Fase 3. Contenido

1. Construir Inicio, Programa, Proyectos y Nosotros.
2. Integrar los doce talleres completos.
3. Construir Plantillas, Recursos y Seguimiento.
4. Verificar que ningún texto quede truncado o sin asignar.

### Fase 4. Interacciones

1. Implementar pestañas accesibles.
2. Implementar copiar prompts/código.
3. Implementar checklists y progreso con `localStorage`.
4. Implementar navegación anterior/siguiente y restauración del último estado.

### Fase 5. Control de calidad

1. Probar todas las rutas desde carga directa.
2. Probar el sitio bajo un subdirectorio, no solo en `/`.
3. Probar 320, 375, 768, 1024 y 1440 px de ancho.
4. Probar teclado, foco visible, contraste, textos alternativos y reducción de movimiento.
5. Verificar enlaces externos y descargas.
6. Verificar persistencia y restablecimiento de progreso.
7. Ejecutar auditoría de Lighthouse y corregir problemas materiales.

### Fase 6. Documentación y despliegue

1. Crear `README.md` con estructura, uso local, edición de contenidos y despliegue.
2. Incluir `.nojekyll`.
3. Confirmar que todas las rutas a archivos son relativas y no comienzan por `/`.
4. Documentar cómo activar GitHub Pages desde rama `main`, carpeta raíz.
5. No publicar ni hacer `git push` sin autorización expresa del usuario.

## Accesibilidad y calidad

- HTML semántico con `aside`, `nav`, `main`, `section`, encabezados ordenados y `footer`.
- Enlace `Saltar al contenido` visible al recibir foco.
- Contraste mínimo WCAG AA.
- Foco visible en enlaces, botones, pestañas y casillas.
- Tamaño táctil cercano a 44 × 44 px.
- `aria-current="page"` para la ruta activa.
- Textos alternativos correctos en los logotipos.
- Respetar `prefers-reduced-motion`.
- No usar color como única señal.
- Sin errores en consola.
- Sin desplazamiento horizontal de toda la página a 320 px.

## Seguridad, ética y privacidad

- Todo el contenido es educativo y no constituye asesoría clínica.
- Incluir aviso permanente: no cargar información identificable de pacientes en servicios de IA no autorizados.
- Los ejemplos deben usar datos sintéticos, anonimizados o públicos.
- Los productos generados con IA requieren revisión humana, verificación de fuentes y trazabilidad.
- No almacenar respuestas académicas completas en `localStorage`; solo estados de interfaz y checklist.
- Abrir enlaces externos con `rel="noopener noreferrer"` cuando corresponda.
- No insertar contenido remoto mediante HTML sin sanitización.

## Criterios de aceptación

El trabajo se considera terminado solo si se cumplen todos los puntos:

- [ ] Los doce talleres están completos y accesibles desde el menú lateral.
- [ ] Cada taller contiene diez pestañas funcionales y accesibles.
- [ ] Todo el contenido fuente fue incorporado y puede rastrearse hasta su Markdown.
- [ ] Los logotipos originales de Singularidad y FUCS están almacenados localmente y se ven correctamente.
- [ ] La paleta, tipografía, barra lateral, tarjetas, pestañas y acentos reproducen el lenguaje visual de la referencia.
- [ ] Inicio, Programa, Proyectos, Plantillas, Recursos, Seguimiento y Nosotros funcionan.
- [ ] Las listas de chequeo persisten después de recargar.
- [ ] Los botones de copia funcionan.
- [ ] Las descargas de todas las plantillas funcionan.
- [ ] Las rutas funcionan en GitHub Pages bajo el nombre del repositorio.
- [ ] El sitio es utilizable por teclado y responsive desde 320 px.
- [ ] No hay datos reales de pacientes, claves, secretos ni llamadas a APIs privadas.
- [ ] No hay errores de consola ni enlaces internos rotos.
- [ ] `README.md` explica instalación, edición y despliegue.

## Entrega esperada de Claude Code

Al finalizar, responder con:

1. Resumen de lo implementado.
2. Árbol final de archivos.
3. Decisiones técnicas relevantes.
4. Comandos de prueba ejecutados y sus resultados.
5. Lista de controles de aceptación cumplidos o pendientes.
6. Instrucciones exactas para previsualizar localmente.
7. Instrucciones exactas para desplegar en GitHub Pages.
8. Cualquier bloqueo real, sin ocultarlo ni sustituir activos silenciosamente.

## Prompt inicial para ejecutar en Claude Code

```text
Lee CLAUDE.md completo y trata sus reglas como especificación del proyecto. Revisa todos los archivos de content/ antes de programar. Construye el sitio estático de doce talleres del Semillero Singularidad con HTML, CSS y JavaScript puro, listo para GitHub Pages. Conserva el lenguaje visual y los logotipos del sitio de referencia indicado en CLAUDE.md. Implementa la navegación lateral, las diez pestañas por taller, las plantillas descargables, los botones de copia y el seguimiento local formativo. Trabaja por las fases descritas, valida cada criterio de aceptación y no publiques ni hagas push sin mi autorización. Si encuentras una contradicción que cambie el alcance, detente y descríbela; para decisiones menores, elige la opción más simple y documenta la decisión.
```

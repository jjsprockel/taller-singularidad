# Taller 9 Diseño y evaluación de modelos ML DL y LLM

## Justificación

Formular estudios de modelado con comparadores, particiones y métricas que permitan una evaluación honesta y clínicamente interpretable.

## Resultados de aprendizaje

- Definir tarea, entrada, salida, etiqueta y caso de uso.
- Seleccionar una línea base y un modelo acorde con datos y muestra.
- Prevenir fuga de datos y sobreajuste.
- Elegir métricas de desempeño, calibración, utilidad y equidad.

## Contexto teórico

- Aprendizaje supervisado y no supervisado; ML, DL y evaluación de LLM.
- Entrenamiento, validación, prueba, validación externa y validación temporal.
- Discriminación, calibración, sensibilidad, especificidad, F1 y utilidad clínica.
- Errores por subgrupos, cambios de distribución, opacidad y evaluación humana.

## Preparación

- Definir el caso de uso y usuario final.
- Confirmar disponibilidad y calidad de etiquetas.
- Llevar distribución estimada del desenlace o clases.

## Actividad paso a paso

1. Redactar una especificación de la tarea con entrada, salida, usuario, momento y decisión apoyada.
2. Definir un comparador mínimo y justificar la complejidad del modelo.
3. Diseñar particiones a nivel de paciente, centro o tiempo según riesgo de fuga.
4. Seleccionar métricas primarias y umbrales con interpretación clínica.
5. Planear análisis por subgrupos, errores y calibración.
6. Para LLM, construir un conjunto de casos, una rúbrica, evaluadores y criterios de adjudicación.
7. Crear una ficha del modelo con uso previsto, límites, datos, evaluación y supervisión.

## Aplicación al proyecto

El estudiante debe aplicar la actividad al proyecto asignado y señalar con precisión qué parte elaboró de forma individual. Si el proyecto aún no dispone de datos o autorización, utilizará datos sintéticos, públicos o un caso de práctica. La entrega debe incluir la versión anterior, la nueva versión y una nota breve sobre las decisiones tomadas con apoyo de IA.

## Entregables

- Especificación del caso de uso
- Plan de partición y validación
- Tabla de métricas
- Plan de análisis de errores
- Ficha inicial del modelo

## Lista de chequeo y KPI

- [ ] La partición evita que una unidad aparezca en más de un conjunto.
- [ ] Existe una línea base explícita.
- [ ] La métrica primaria corresponde al daño y beneficio del caso de uso.
- [ ] Se planean subgrupos relevantes.
- [ ] El modelo tiene condiciones de uso y de no uso.

**Criterio de avance:** completar al menos 80 por ciento de la lista, sin incumplimientos de privacidad, referencias inventadas o pérdida de trazabilidad.

## Retroalimentación semanal

Defensa del plan de evaluación. El tutor plantea un escenario de fuga, desbalance o cambio de prevalencia y el estudiante debe explicar el efecto esperado.

## Recursos

- [TRIPOD AI en EQUATOR](https://www.equator-network.org/reporting-guidelines/tripod-statement/)

# Cursos Interactivos — Módulo Electricidad

Curso educativo interactivo para introducir conceptos de electricidad, practicar diagnósticos y explorar circuitos en un entorno simulado.

> **Aviso de seguridad:** es una herramienta didáctica. No dimensiona ni certifica instalaciones reales. Los trabajos eléctricos reales deben ser realizados o supervisados por un electricista matriculado.

## Cómo correrlo

No requiere build ni dependencias. Es una app estática con ES modules y debe servirse por HTTP (no abrir el `index.html` con `file://`):

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Alcance educativo implementado

La currícula contiene **16 temas** distribuidos en tres niveles y **15 simuladores** (Cable + Térmica cubre dos temas). Cada tema tiene un quiz de cierre. Al aprobar todos los quizzes, se habilita un certificado local, imprimible o guardable como PDF.

- **Básico (6 temas):** Ley de Ohm y potencia; cables y secciones; térmicas y protección del conductor; cortocircuito y sobrecarga; puesta a tierra; tomacorrientes y polaridad.
- **Intermedio (5 temas):** serie y paralelo; cargas por ambiente; diferencial; tablero; iluminación.
- **Avanzado (5 temas):** trifásica; arranque de motores; diagnóstico de compresores; selectividad; introducción a normativa AEA.

Los simuladores incluyen diagramas SVG, actividades breves de comprensión y explicaciones. Los quizzes tienen cuatro preguntas por tema y un umbral de aprobación del 70 %.

## Banco de trabajo

Lienzo SVG interactivo para armar circuitos con fuente, térmica, cargas y conductores, conectando bornes. Incluye:

- Motor didáctico que analiza caminos activos, continuidad de fase/neutro, térmicas en serie y bypass.
- Estados diferenciados para circuito incompleto, configuración incompatible con los supuestos, sobrecarga y actuación modelada de la térmica.
- Retos guiados, modo libre y alternativa de conexión sin arrastrar.
- Multímetro virtual con lecturas ideales de tensión, corriente, resistencia y continuidad.
- Diagnóstico guiado de conductor abierto, térmica puenteada y corto fase-neutro.
- Estimador monofásico de caída de tensión y análisis de cargas, simultaneidad supuesta y energía proyectada.

**Límites del modelo:** las lecturas y cálculos son aproximaciones educativas con supuestos explícitos. No representan instrumentos reales, curvas de disparo, impedancias de cortocircuito, comportamiento completo de motores, mediciones de seguridad ni un cálculo reglamentario. Una configuración que el simulador considere compatible nunca equivale a declarar segura una instalación real.

## Seguridad y alcance del certificado

- Las actividades deben explicar el procedimiento seguro aplicable y no invitar a intervenir equipos energizados.
- La continuidad y resistencia se bloquean en el banco mientras la fuente simulada está energizada.
- Las fallas se aplican a escenarios aislados para no destruir el armado original.
- El contenido aclara cuándo una magnitud no está modelada o cuándo el resultado es indeterminado.
- El certificado es **local y educativo**: el progreso se guarda en `localStorage`, puede modificarse desde el navegador y no tiene verificación online. No es matrícula ni habilitación profesional.

## Tecnología y estructura

- JavaScript nativo con ES modules; no requiere framework ni proceso de build.
- SVG y eventos de puntero para el banco de trabajo.
- Pruebas automatizadas con el runner nativo `node --test`.

Archivos principales:

- `index.html`: shell de la aplicación.
- `css/styles.css`: estilos y adaptación responsive.
- `js/app.js`: navegación, temario y registro de simuladores.
- `js/simuladores/`: simuladores por tema.
- `js/workbench/`: modelo, motor, interacción, instrumentos, análisis y diagnósticos del banco.
- `js/visuales.js`: diagramas SVG.
- `js/guia-interactiva.js`: misiones de aprendizaje.
- `data/curricula.js`, `data/quizzes.js`, `data/catalogo.js`: contenido y datos.
- `tests/`: pruebas automatizadas.
- `docs/AUDITORIA-UX-UI-PLAN.md`: auditoría, decisiones y límites conocidos.

## Estado de cierre

La implementación educativa y sus pruebas automatizadas están avanzadas. La última ejecución registrada para la rama de laboratorio informó **58 pruebas aprobadas**. Esto no reemplaza las verificaciones finales que faltan:

1. Recorrido manual completo en navegador de escritorio y móvil (incluido el banco de trabajo táctil).
2. Revisión profesional externa de valores, supuestos, seguridad y referencias normativas.
3. Corrección de cualquier hallazgo y nueva ejecución de la suite.
4. Revisión final de accesibilidad y documentación.

Hasta completar esas verificaciones, el proyecto debe considerarse una versión educativa candidata a cierre, no un curso técnicamente certificado ni una instalación de referencia.

## Fuera del alcance de esta versión

Autenticación, pagos, control de acceso comercial, progreso sincronizado en servidor y certificados verificables pertenecen a una etapa posterior de producto. No se deben presentar como funciones disponibles en esta versión.

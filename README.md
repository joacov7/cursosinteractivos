# Cursos Interactivos — Módulo Electricidad

Curso con simulaciones para aprender instalaciones eléctricas de forma segura,
basado en [`spec-electricidad.md`](spec-electricidad.md).

> Herramienta educativa. Las instalaciones reales las hace o supervisa un
> electricista matriculado.

## Cómo correrlo

No requiere build ni dependencias. Es una app estática con ES modules, así que
necesita servirse por HTTP (no abrir el `index.html` con `file://`):

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

## Estado actual

**Curso de Electricidad completo** (spec secciones 1, 2 y 3): los tres niveles con
dieciséis simuladores, quiz de cierre en cada tema y certificado de finalización.

### Avanzado (spec sección 3)

- **3.1 Trifásica** — 220 V (fase-neutro) vs. 380 V (fase-fase); clasificar qué
  cargas requieren trifásica vs. monofásica.
- **3.2 Motores — arranque** — pico de arranque vs. corriente nominal; arranque
  directo vs. estrella-triángulo y curva de térmica para que no salte al arrancar.
- **3.3 Arranque de compresores** — diagnóstico entre capacitor, relé, protector
  térmico o motor según los síntomas (puente con Refrigeración).
- **3.4 Mantenimiento industrial — selectividad** — dimensionar protecciones para
  que una falla corte solo su máquina y no toda la planta.
- **3.5 Normativa (AEA)** — qué es la AEA y cuándo consultarla como referencia
  (sin memorizar articulado).

### Certificado

Al aprobar los quizzes de los tres niveles se habilita un **certificado de
finalización** con el nombre del alumno, imprimible / guardable como PDF. Es un
certificado **educativo, no una matrícula habilitante** (así lo aclara el propio
certificado).

### Intermedio (spec sección 2)

- **2.1 Serie vs. paralelo** — tres lamparitas: en serie una quemada apaga todas;
  en paralelo son independientes. Muestra la resistencia equivalente.
- **2.2 Cálculo de cargas por ambiente** — asignar artefactos a circuitos sin
  sobrecargar ninguno; la falla clásica es meter toda la casa en un circuito.
- **2.3 Disyuntor diferencial (RCD)** — fuga a tierra: con térmica sola no corta,
  con diferencial (30 mA) corta en ms. Roles distintos, el tablero necesita ambos.
- **2.4 Tablero completo** — armar el tablero respetando la jerarquía llave
  general → diferencial → térmicas seccionales.
- **2.5 Iluminación** — LED vs. incandescente y cuántas bocas entran en la térmica
  de iluminación (10 A).

### Básico (spec sección 1)

- **1.1 Ley de Ohm y potencia** — circuito resistivo con multímetro virtual: el
  alumno mide V y R y calcula I = V/R y P = V·I, con verificación y casos nuevos.
- **1.2 / 1.3 Cable + Térmica** — las tres reglas de falla:
  - la carga supera la capacidad del cable → el cable se sobrecalienta;
  - la térmica es menor que la carga → corta apenas se usa el circuito;
  - la térmica supera la capacidad del cable → no protege al cable.
- **1.4 Cortocircuito vs. sobrecarga** — dos escenarios animados lado a lado:
  disparo térmico (lento, curva térmica) vs. disparo magnético (instantáneo).
- **1.5 Puesta a tierra** — artefacto con falla de aislación, con y sin tierra;
  la tierra no evita la falla, da camino seguro para que la protección actúe.
- **1.6 Tomacorrientes y polaridad** — toma 2P+T (IRAM 2073); muestra que con
  fase y neutro invertidos el artefacto anda igual pero queda fase en reposo.

Además:

- **Quiz de cierre por tema** (spec sección 6): 4 preguntas por tema, corrección
  con explicación, umbral de aprobación del 70 %. Al aprobar, el tema queda
  marcado con ✔ en el temario y suma al progreso del nivel (X/6).
- **Progreso del alumno** persistido en `localStorage` (conveniencia por
  visitante; ver "Pendiente / producto" para la validación real).
- **Catálogo de componentes** consultable (spec sección 4): cables, protecciones,
  tomacorrientes, herramientas y EPP, cada uno con especificación técnica, para
  qué sirve, qué pasa si se usa mal y en qué nivel del curso aparece.
- **Temario** con toda la currícula (básico / intermedio / avanzado). Los temas
  aún sin simulación aparecen como "próximamente".
- **Seguridad transversal**: recordatorio antes de cada simulación y cierre
  educativo en cada pantalla (spec secciones 0 y 5).

## Estructura

```
index.html                     Shell de la app
css/styles.css                 Estilos
js/app.js                      Navegación por hash + temario
js/catalogo-view.js            Vista del catálogo
js/simuladores/cable-termica.js  Simulador 1.2 / 1.3
data/catalogo.js               Base de datos de componentes
data/curricula.js              Currícula y aviso educativo
```

## Cómo agregar una simulación nueva

1. Crear `js/simuladores/<id>.js` que exporte `render(container)`.
2. Registrarlo en el objeto `SIMULADORES` de `js/app.js`.
3. En `data/curricula.js`, marcar el tema con `estado: "listo"` y `sim: "<id>"`.
4. (Opcional) Agregar su quiz de cierre en `data/quizzes.js` bajo el id del tema.

## Pendiente (según spec)

El curso de Electricidad de la spec está completo. Lo que sigue es producto:
nuevos oficios (plomería, refrigeración, mecánica) y la parte de venta —ver abajo.

## Pendiente / producto

El objetivo es que estos sean **cursos vendibles**, y que al de electricidad le
sigan otros oficios (**plomería, refrigeración, mecánica**). Dos consecuencias:

- **Multi-oficio.** El motor de quiz y de progreso ya es genérico: el progreso se
  guarda con clave `oficio:tema` y el quiz se indexa por id de tema. Para sumar un
  oficio nuevo hay que generalizar la selección de currícula (hoy `OFICIO` está
  fijo en `js/app.js`) a un selector de oficio + su propia currícula/catálogo.
  Conviene hacerlo al empezar el segundo oficio, no antes, para no sobre-diseñar.
- **Venta y certificado con valor.** Login, pago/control de acceso y un
  certificado verificable necesitan un backend: hoy el progreso vive solo en el
  navegador del alumno (`localStorage`) y no sirve como prueba. Es una decisión de
  producto (proveedor de pago, autenticación, emisión de certificados) a definir
  aparte.

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

Primer piso funcional del módulo:

- **Simulador Cable + Térmica** (spec 1.2 y 1.3) con las tres reglas de falla:
  - la carga supera la capacidad del cable → el cable se sobrecalienta;
  - la térmica es menor que la carga → corta apenas se usa el circuito;
  - la térmica supera la capacidad del cable → no protege al cable.
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

## Pendiente (según spec)

Resto de básico (1.1, 1.4, 1.5, 1.6), todo intermedio y avanzado, quiz de cierre
por tema y certificado al completar los tres niveles.

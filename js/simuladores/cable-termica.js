// Simulador Cable + Térmica (spec 1.2 y 1.3).
// El alumno elige una carga, una sección de cable y una térmica, y comprueba
// las tres reglas de falla:
//   - compara la corriente de carga con ampacidades asumidas en este escenario
//   - identifica incompatibilidades didácticas sin calcular temperatura ni curva de disparo

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgCableBreaker } from "../visuales.js";

// Cargas típicas (corriente aproximada a 220 V).
const CARGAS = [
  { id: "iluminacion", nombre: "Iluminación (varias bocas LED)", corriente_A: 3 },
  { id: "tomas_livingg", nombre: "Tomas de living (TV, cargadores)", corriente_A: 8 },
  { id: "heladera_micro", nombre: "Heladera + microondas", corriente_A: 14 },
  { id: "termotanque", nombre: "Termotanque eléctrico", corriente_A: 18 },
  { id: "aire_acondicionado", nombre: "Aire acondicionado split grande", corriente_A: 22 },
  { id: "cocina", nombre: "Anafe/horno eléctrico", corriente_A: 30 },
];

// Valores de ampacidad supuestos para el escenario didáctico; no son una tabla normativa universal.
const CABLES = [
  { seccion_mm2: 1.5, capacidad_A: 10 },
  { seccion_mm2: 2.5, capacidad_A: 16 },
  { seccion_mm2: 4, capacidad_A: 25 },
  { seccion_mm2: 6, capacidad_A: 32 },
  { seccion_mm2: 10, capacidad_A: 50 },
];

// Térmicas comerciales habituales (corriente nominal en A).
const BREAKERS = [6, 10, 16, 20, 25, 32, 40];

const RECORDATORIO_SEGURIDAD =
  "Antes de intervenir: aislá todas las fuentes, evitá la reconexión y verificá ausencia de tensión con un instrumento adecuado y comprobado. Usá herramientas y EPP apropiados.";

function evaluar(loadA, capacidadCableA, breakerA) {
  const problemas = [];

  // Regla 1.2 — el cable no soporta la carga.
  if (loadA > capacidadCableA) {
    problemas.push({
      tipo: "cable",
      severidad: "peligro",
      titulo: "La carga supera la capacidad supuesta del conductor",
      detalle:
        `La carga (${loadA} A) supera la capacidad del cable (${capacidadCableA} A). ` +
        "La combinación excede la capacidad de corriente asumida en este ejercicio. El modelo no calcula temperatura, degradación de aislación ni riesgo de incendio real.",
    });
  }

  // Regla 1.3 — falla "chica": la térmica es menor que la carga.
  if (breakerA < loadA) {
    problemas.push({
      tipo: "breaker_chico",
      severidad: "molesto",
      titulo: "La corriente de carga supera la corriente nominal de la térmica",
      detalle:
        `La térmica (${breakerA} A) es menor que la carga (${loadA} A), así que ` +
        "puede provocar una actuación ante una sobrecorriente sostenida. El tiempo de disparo depende de la curva, la temperatura y el dispositivo real; no es necesariamente instantáneo.",
    });
  }

  // Regla 1.3 — falla "grande": la térmica supera la capacidad del cable.
  if (breakerA > capacidadCableA) {
    problemas.push({
      tipo: "breaker_grande",
      severidad: "peligro",
      titulo: "La protección nominal supera la capacidad supuesta del conductor",
      detalle:
        `La térmica (${breakerA} A) es mayor que la capacidad del cable (${capacidadCableA} A). ` +
        "La coordinación entre protección y conductor no cumple la regla simplificada de este ejercicio. La evaluación real requiere capacidad admisible corregida, corriente de diseño y características del dispositivo.",
    });
  }

  const ok = problemas.length === 0;
  return {
    ok,
    problemas,
    resumen: ok
      ? "Combinación compatible con los supuestos del ejercicio. No valida una instalación real."
      : "Combinación inválida. Revisá las observaciones.",
  };
}

function opcion(value, label, selected) {
  return `<option value="${value}"${selected ? " selected" : ""}>${label}</option>`;
}

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Cable + Térmica</h2>
      <p class="sim-intro">
        Elegí una carga, una sección de conductor y una protección. Compará la corriente de carga
        con los valores supuestos del escenario; la actividad no dimensiona una instalación real.
      </p>

      ${svgCableBreaker()}

      <p class="nota-modelo"><strong>Modelo didáctico:</strong> las capacidades asignadas a cada sección son valores simplificados del escenario. La ampacidad real depende del material, aislación, método de instalación, temperatura, agrupamiento, cantidad de conductores cargados y otras condiciones. No uses esta tabla para elegir cables o térmicas en una instalación.</p>

      <div class="controles">
        <label>
          Carga del circuito
          <select id="sel-carga">
            ${CARGAS.map((c, i) => opcion(c.id, `${c.nombre} — ${c.corriente_A} A`, i === 2)).join("")}
          </select>
        </label>

        <label>
          Sección del cable
          <select id="sel-cable">
            ${CABLES.map((c, i) =>
              opcion(String(c.seccion_mm2), `${c.seccion_mm2} mm² — soporta ${c.capacidad_A} A`, i === 1)
            ).join("")}
          </select>
        </label>

        <label>
          Térmica (breaker)
          <select id="sel-breaker">
            ${BREAKERS.map((a, i) => opcion(String(a), `${a} A`, i === 2)).join("")}
          </select>
        </label>
      </div>

      <div id="resultado" class="resultado" aria-live="polite"></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const selCarga = container.querySelector("#sel-carga");
  const selCable = container.querySelector("#sel-cable");
  const selBreaker = container.querySelector("#sel-breaker");
  const resultado = container.querySelector("#resultado");

  function actualizar() {
    const carga = CARGAS.find((c) => c.id === selCarga.value);
    const cable = CABLES.find((c) => String(c.seccion_mm2) === selCable.value);
    const breakerA = Number(selBreaker.value);

    const r = evaluar(carga.corriente_A, cable.capacidad_A, breakerA);

    const listaProblemas = r.problemas
      .map(
        (p) => `
        <li class="problema problema--${p.severidad}">
          <span class="problema-titulo">${p.titulo}</span>
          <span class="problema-detalle">${p.detalle}</span>
        </li>`
      )
      .join("");

    resultado.className = `resultado ${r.ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${r.ok ? "✔ Compatible en el modelo" : "✖ Revisar combinación"}</span>
        <p>${r.resumen}</p>
      </div>
      <div class="valores">
        <span>Carga: <strong>${carga.corriente_A} A</strong></span>
        <span>Cable: <strong>${cable.seccion_mm2} mm² (${cable.capacidad_A} A)</strong></span>
        <span>Térmica: <strong>${breakerA} A</strong></span>
      </div>
      ${r.ok ? "" : `<ul class="problemas">${listaProblemas}</ul>`}
    `;
  }

  [selCarga, selCable, selBreaker].forEach((el) => el.addEventListener("change", actualizar));
  actualizar();
}

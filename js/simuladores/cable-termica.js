// Simulador Cable + Térmica (spec 1.2 y 1.3).
// El alumno elige una carga, una sección de cable y una térmica, y comprueba
// las tres reglas de falla:
//   - load > capacidad_cable        → el cable se calienta / humea
//   - breaker < load                → la térmica corta apenas se usa (falla "chica")
//   - breaker > capacidad_cable     → la térmica no protege al cable (falla "grande")

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

// Cargas típicas (corriente aproximada a 220 V).
const CARGAS = [
  { id: "iluminacion", nombre: "Iluminación (varias bocas LED)", corriente_A: 3 },
  { id: "tomas_livingg", nombre: "Tomas de living (TV, cargadores)", corriente_A: 8 },
  { id: "heladera_micro", nombre: "Heladera + microondas", corriente_A: 14 },
  { id: "termotanque", nombre: "Termotanque eléctrico", corriente_A: 18 },
  { id: "aire_acondicionado", nombre: "Aire acondicionado split grande", corriente_A: 22 },
  { id: "cocina", nombre: "Anafe/horno eléctrico", corriente_A: 30 },
];

// Cables disponibles: sección → capacidad de corriente (ampacidad).
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
  "En la vida real, antes de intervenir un circuito: cortá la llave general y " +
  "verificá ausencia de tensión con el buscapolos. Usá herramientas aisladas.";

function evaluar(loadA, capacidadCableA, breakerA) {
  const problemas = [];

  // Regla 1.2 — el cable no soporta la carga.
  if (loadA > capacidadCableA) {
    problemas.push({
      tipo: "cable",
      severidad: "peligro",
      titulo: "El cable se sobrecalienta",
      detalle:
        `La carga (${loadA} A) supera la capacidad del cable (${capacidadCableA} A). ` +
        "El conductor se calienta, la aislación se degrada y puede humear o iniciar fuego.",
    });
  }

  // Regla 1.3 — falla "chica": la térmica es menor que la carga.
  if (breakerA < loadA) {
    problemas.push({
      tipo: "breaker_chico",
      severidad: "molesto",
      titulo: "La térmica corta apenas se usa el circuito",
      detalle:
        `La térmica (${breakerA} A) es menor que la carga (${loadA} A), así que ` +
        "dispara ni bien la carga entra en régimen. No es peligroso, pero el circuito es inutilizable.",
    });
  }

  // Regla 1.3 — falla "grande": la térmica supera la capacidad del cable.
  if (breakerA > capacidadCableA) {
    problemas.push({
      tipo: "breaker_grande",
      severidad: "peligro",
      titulo: "La térmica no protege al cable",
      detalle:
        `La térmica (${breakerA} A) es mayor que la capacidad del cable (${capacidadCableA} A). ` +
        "Ante una sobrecarga, el cable llega a temperatura peligrosa antes de que la térmica dispare. " +
        "La térmica se dimensiona en relación al cable, nunca por encima de su capacidad.",
    });
  }

  const ok = problemas.length === 0;
  return {
    ok,
    problemas,
    resumen: ok
      ? "Combinación correcta: la carga entra en el cable y la térmica protege al cable sin cortar de más."
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
        Elegí la carga del circuito, la sección del cable y la térmica. El objetivo es que
        <strong>la carga entre en el cable</strong> y que <strong>la térmica proteja al cable</strong>
        (dimensionada en relación al cable, no a la carga).
      </p>

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
        <span class="badge">${r.ok ? "✔ Correcto" : "✖ Falla"}</span>
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

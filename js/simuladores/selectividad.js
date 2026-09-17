// Simulador Mantenimiento industrial — selectividad de protecciones (spec 3.4).
// Un tablero con varias máquinas. Ante una falla en una máquina, debe cortar
// SOLO la protección de esa máquina (la más cercana a la falla), no la general.
// El alumno dimensiona las protecciones y provoca una falla.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "La selectividad evita que una falla puntual deje toda la planta parada. En " +
  "mantenimiento, leer el unifilar y respetar la jerarquía de protecciones es clave.";

const MAQUINAS = [
  { id: "m1", nombre: "Máquina 1", consumo: 12 },
  { id: "m2", nombre: "Máquina 2", consumo: 16 },
  { id: "m3", nombre: "Máquina 3", consumo: 10 },
];
const OPCIONES_BREAKER = [16, 20, 25, 32, 40, 63];

export function render(container) {
  const seccional = {}; // maquinaId -> A
  let general = 40;

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Selectividad de protecciones</h2>
      <p class="sim-intro">
        Tres máquinas cuelgan de una protección general. Dimensioná cada protección seccional y la
        general para que, ante una falla en una máquina, corte <strong>solo esa</strong> y las demás
        sigan trabajando. Regla práctica: la seccional debe ser bastante menor que la general.
      </p>

      <div class="tablero">
        <div class="tablero-slot">
          <div class="tablero-slot-info"><strong>Protección general</strong>
            <span class="tablero-ayuda">Alimenta a todas las máquinas.</span></div>
          <select id="sel-general">
            ${OPCIONES_BREAKER.map((a) => `<option value="${a}" ${a === general ? "selected" : ""}>${a} A</option>`).join("")}
          </select>
        </div>
        ${MAQUINAS.map(
          (m) => `
          <div class="tablero-slot">
            <div class="tablero-slot-info"><strong>${m.nombre}</strong>
              <span class="tablero-ayuda">Consume ${m.consumo} A.</span></div>
            <select data-maq="${m.id}">
              <option value="">— térmica —</option>
              ${OPCIONES_BREAKER.map((a) => `<option value="${a}">${a} A</option>`).join("")}
            </select>
          </div>`
        ).join("")}
      </div>

      <div class="controles">
        <label>
          Provocar falla en…
          <select id="sel-falla">
            ${MAQUINAS.map((m) => `<option value="${m.id}">${m.nombre}</option>`).join("")}
          </select>
        </label>
      </div>
      <button type="button" id="btn-falla" class="btn-primario">Provocar falla</button>
      <div id="sel-resultado" class="resultado" aria-live="polite" hidden></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const resultado = container.querySelector("#sel-resultado");
  container.querySelector("#sel-general").addEventListener("change", (e) => {
    general = Number(e.target.value);
    resultado.hidden = true;
  });
  container.querySelectorAll("select[data-maq]").forEach((s) =>
    s.addEventListener("change", () => {
      seccional[s.dataset.maq] = Number(s.value) || 0;
      resultado.hidden = true;
    })
  );

  container.querySelector("#btn-falla").addEventListener("click", () => {
    const maqId = container.querySelector("#sel-falla").value;
    const maq = MAQUINAS.find((m) => m.id === maqId);
    const brk = seccional[maqId] || 0;
    resultado.hidden = false;

    // Validaciones de diseño previas.
    const faltan = MAQUINAS.filter((m) => !seccional[m.id]);
    if (faltan.length) {
      resultado.className = "resultado";
      resultado.innerHTML = `<div class="resultado-cabecera"><span class="badge">Faltan térmicas</span>
        <p>Asigná una térmica seccional a cada máquina antes de provocar la falla.</p></div>`;
      return;
    }

    // ¿La seccional protege el consumo normal de su máquina?
    const seccionalDemasiadoChica = brk < maq.consumo;
    // Selectividad: la seccional de la máquina debe ser menor que la general.
    const haySelectividad = brk < general;

    let ok, badge, msg;
    if (seccionalDemasiadoChica) {
      ok = false;
      badge = "✖ Seccional subdimensionada";
      msg = `La térmica de ${maq.nombre} (${brk} A) es menor que su consumo (${maq.consumo} A): cortaría en uso normal, no solo ante falla.`;
    } else if (haySelectividad) {
      ok = true;
      badge = "✔ Cortó solo la máquina fallada";
      msg = `Hay selectividad: la seccional de ${maq.nombre} (${brk} A) es menor que la general (${general} A), así que actúa primero y corta solo esa máquina. Las demás siguen trabajando.`;
    } else {
      ok = false;
      badge = "✖ Cortó la general (toda la planta)";
      msg = `Sin selectividad: la seccional (${brk} A) no es menor que la general (${general} A). La general corta y se para toda la planta. Bajá la seccional o subí la general.`;
    }

    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera"><span class="badge">${badge}</span><p>${msg}</p></div>
      <div class="valores">
        <span>Falla en: <strong>${maq.nombre}</strong></span>
        <span>Seccional: <strong>${brk} A</strong></span>
        <span>General: <strong>${general} A</strong></span>
      </div>`;
  });
}

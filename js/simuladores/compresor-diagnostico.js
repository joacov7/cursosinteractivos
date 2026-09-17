// Simulador Arranque de compresores — diagnóstico (spec 3.3, puente con Refrigeración).
// Un compresor no arranca. Según los síntomas, el alumno diagnostica cuál es el
// componente en falla: capacitor de arranque, relé de arranque o protector térmico.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "Antes de tocar un compresor: cortá la alimentación y descargá el capacitor " +
  "(guarda energía aunque esté desconectado). Puede provocar una descarga.";

const COMPONENTES = [
  { id: "capacitor", nombre: "Capacitor de arranque" },
  { id: "rele", nombre: "Relé de arranque" },
  { id: "protector", nombre: "Protector térmico del motor" },
  { id: "motor", nombre: "Bobinado del motor" },
];

// Escenarios: síntoma observable + componente realmente fallado + explicación.
const ESCENARIOS = [
  {
    sintoma:
      "El compresor zumba unos segundos, no arranca y salta el protector térmico. El capacitor está hinchado.",
    culpable: "capacitor",
    explicacion:
      "Sin par de arranque el motor no gira, toma mucha corriente y el protector lo saca. Un capacitor hinchado o sin capacidad es la causa típica.",
  },
  {
    sintoma:
      "El motor no intenta arrancar. El capacitor mide bien. Se escucha que el relé no conmuta (no hace 'clic').",
    culpable: "rele",
    explicacion:
      "Si el relé de arranque no conecta el bobinado de arranque, el motor nunca recibe el impulso inicial. Capacitor sano + relé que no conmuta apunta al relé.",
  },
  {
    sintoma:
      "El compresor arranca, trabaja unos minutos y corta. Al enfriarse vuelve a arrancar solo, en ciclos.",
    culpable: "protector",
    explicacion:
      "El ciclado por temperatura (corta caliente, rearranca frío) es típico del protector térmico actuando, sea por sobrecarga o por protector defectuoso.",
  },
  {
    sintoma:
      "No arranca de ninguna forma. Capacitor y relé OK. El bobinado mide en cortocircuito / a masa.",
    culpable: "motor",
    explicacion:
      "Con capacitor y relé sanos, un bobinado en corto o derivado a masa deja al motor fuera de servicio: la falla es el propio motor.",
  },
];

export function render(container) {
  let escenario = ESCENARIOS[Math.floor(Math.random() * ESCENARIOS.length)];

  function pintar() {
    container.innerHTML = `
      <section class="sim">
        <div class="aviso-seguridad" role="note">
          <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
        </div>

        <h2>Simulador: Arranque de compresores</h2>
        <p class="sim-intro">
          Un compresor no arranca. Leé los síntomas y diagnosticá qué componente está fallando.
        </p>

        <div class="diag-sintoma">
          <strong>Síntomas:</strong> ${escenario.sintoma}
        </div>

        <p class="diag-pregunta">¿Cuál es el componente en falla?</p>
        <div class="diag-opciones">
          ${COMPONENTES.map(
            (c) => `<button type="button" class="diag-btn" data-id="${c.id}">${c.nombre}</button>`
          ).join("")}
        </div>

        <div id="diag-resultado" class="resultado" aria-live="polite" hidden></div>
        <button type="button" id="diag-nuevo" class="btn-primario" hidden>Nuevo caso</button>

        <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
      </section>
    `;

    const resultado = container.querySelector("#diag-resultado");
    const btnNuevo = container.querySelector("#diag-nuevo");

    container.querySelectorAll(".diag-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const acierto = b.dataset.id === escenario.culpable;
        const nombreCulpable = COMPONENTES.find((c) => c.id === escenario.culpable).nombre;
        container.querySelectorAll(".diag-btn").forEach((x) => {
          x.disabled = true;
          if (x.dataset.id === escenario.culpable) x.classList.add("diag-btn--correcta");
          else if (x === b) x.classList.add("diag-btn--mal");
        });
        resultado.hidden = false;
        resultado.className = `resultado ${acierto ? "resultado--ok" : "resultado--falla"}`;
        resultado.innerHTML = `
          <div class="resultado-cabecera">
            <span class="badge">${acierto ? "✔ Diagnóstico correcto" : "✖ No era esa"}</span>
            <p>${acierto ? "" : `El componente en falla era: <strong>${nombreCulpable}</strong>. `}${escenario.explicacion}</p>
          </div>`;
        btnNuevo.hidden = false;
      });
    });

    btnNuevo.addEventListener("click", () => {
      let nuevo;
      do {
        nuevo = ESCENARIOS[Math.floor(Math.random() * ESCENARIOS.length)];
      } while (nuevo === escenario && ESCENARIOS.length > 1);
      escenario = nuevo;
      pintar();
    });
  }

  pintar();
}

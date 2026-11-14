// Simulador Trifásica (spec 3.1).
// Clasificación según la alimentación indicada en la placa de cada ejemplo.
// Los valores de tensión son nominales de referencia, no mediciones de red.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgTrifasica } from "../visuales.js";

const RECORDATORIO_SEGURIDAD =
  "Los valores de tensión del ejercicio son nominales y simplificados. Antes de intervenir, " +
  "identificá el sistema, verificá ausencia de tensión en todos los conductores activos " +
  "y aplicá el procedimiento seguro.";

const ARTEFACTOS = [
  { id: "lampara", nombre: "Iluminación LED del hogar — placa: 1~ 220 V", tipo: "mono" },
  { id: "heladera", nombre: "Heladera familiar — placa: 1~ 220 V", tipo: "mono" },
  { id: "aire_hogar", nombre: "Aire acondicionado split — placa: 1~ 220 V", tipo: "mono" },
  { id: "motor_industrial", nombre: "Motor 10 HP — placa: 3~ 380 V", tipo: "tri" },
  { id: "ascensor", nombre: "Accionamiento de ascensor — placa: 3~ 380 V", tipo: "tri" },
  { id: "soldadora_grande", nombre: "Soldadora industrial — placa: 3~ 380 V", tipo: "tri" },
  { id: "bomba_grande", nombre: "Bomba — motor indicado en placa: 3~ 380 V", tipo: "tri" },
  { id: "microondas", nombre: "Microondas — placa: 1~ 220 V", tipo: "mono" },
];

export function render(container) {
  const eleccion = {};

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Trifásica</h2>
      <p class="sim-intro">
        En esta actividad usamos valores nominales de referencia de <strong>220 V</strong>
        fase-neutro y <strong>380 V</strong> entre fases. La alimentación correcta de un equipo
        se determina por su placa y el sistema disponible, no solo por el tipo de artefacto.
        Clasificá cada caso.
      </p>

      ${svgTrifasica()}

      <div class="clasif-lista">
        ${ARTEFACTOS.map(
          (a) => `
          <div class="clasif-fila" data-art="${a.id}">
            <span>${a.nombre}</span>
            <div class="clasif-botones">
              <button type="button" data-tipo="mono">Monofásica 220 V</button>
              <button type="button" data-tipo="tri">Trifásica 380 V</button>
            </div>
          </div>`
        ).join("")}
      </div>

      <button type="button" id="btn-verificar" class="btn-primario">Verificar</button>
      <div id="tri-resultado" class="resultado" aria-live="polite" hidden></div>

      <p class="nota-modelo">
        La clasificación se basa en la placa indicada en cada caso. No se puede inferir la
        alimentación solo por la categoría del equipo: existen modelos monofásicos y trifásicos.
        Los valores 220/380 V son referencias nominales usadas por esta actividad.
      </p>
      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const resultado = container.querySelector("#tri-resultado");

  container.querySelectorAll(".clasif-fila").forEach((fila) => {
    const botones = fila.querySelectorAll("button");
    botones.forEach((b) => {
      b.addEventListener("click", () => {
        eleccion[fila.dataset.art] = b.dataset.tipo;
        botones.forEach((x) => x.classList.remove("clasif-sel"));
        b.classList.add("clasif-sel");
        resultado.hidden = true;
      });
    });
  });

  container.querySelector("#btn-verificar").addEventListener("click", () => {
    const sinResp = ARTEFACTOS.filter((a) => !eleccion[a.id]);
    const errores = ARTEFACTOS.filter((a) => eleccion[a.id] && eleccion[a.id] !== a.tipo);

    resultado.hidden = false;
    if (sinResp.length) {
      resultado.className = "resultado";
      resultado.innerHTML = `<div class="resultado-cabecera"><span class="badge">Faltan respuestas</span>
        <p>Clasificá todos los artefactos.</p></div>`;
      return;
    }
    const ok = errores.length === 0;
    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${ok ? "✔ Todo correcto" : `✖ ${errores.length} error(es)`}</span>
        <p>${ok
          ? "En estos ejemplos, la placa indica el tipo de alimentación. En equipos reales, verificá siempre la placa, el esquema de conexión y la tensión de red disponible."
          : "Revisá: " + errores.map((a) => `${a.nombre} corresponde a alimentación ${a.tipo === "tri" ? "trifásica" : "monofásica"}`).join("; ") + "."}</p>
      </div>`;
  });
}

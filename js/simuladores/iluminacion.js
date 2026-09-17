// Simulador Iluminación (spec 2.5).
// Tipos de lámpara (incandescente vs LED) y su consumo real. El alumno arma un
// circuito de iluminación con varias bocas y verifica que entre en la térmica
// de 10 A (cable de 1.5 mm²).

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "El circuito de iluminación se protege con térmica de 10 A y cable de 1.5 mm². " +
  "No cuelgues tomas de fuerza del circuito de luces.";

const V = 220;
const LIMITE_A = 10; // térmica de iluminación
const TIPOS = {
  incandescente: { nombre: "Incandescente", watts: 60 },
  led: { nombre: "LED", watts: 9 },
};

export function render(container) {
  let tipo = "led";
  let bocas = 8;

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Iluminación</h2>
      <p class="sim-intro">
        Mismo nivel de luz, distinto consumo: una LED de 9 W ilumina como una incandescente de 60 W.
        Armá un circuito de iluminación y fijate cuántas bocas entran en la térmica de ${LIMITE_A} A.
      </p>

      <div class="controles">
        <label>
          Tipo de lámpara
          <select id="sel-tipo">
            <option value="led">LED (9 W)</option>
            <option value="incandescente">Incandescente (60 W)</option>
          </select>
        </label>
        <label>
          Cantidad de bocas: <strong id="lbl-bocas">${bocas}</strong>
          <input type="range" id="rng-bocas" min="1" max="40" value="${bocas}" />
        </label>
      </div>

      <div id="ilum-resultado" class="resultado" aria-live="polite"></div>

      <div class="comparacion">
        <h3>Por qué importa el tipo</h3>
        <p>
          La potencia total del circuito es la suma de las lámparas, y la corriente es
          <code>I = P / V</code>. Con LED, la misma cantidad de bocas consume mucho menos, así que
          entran muchas más en el mismo circuito. Cambiar a LED baja el consumo y descarga la instalación.
        </p>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const selTipo = container.querySelector("#sel-tipo");
  const rng = container.querySelector("#rng-bocas");
  const lblBocas = container.querySelector("#lbl-bocas");
  const resultado = container.querySelector("#ilum-resultado");

  function actualizar() {
    const w = TIPOS[tipo].watts;
    const potencia = w * bocas;
    const corriente = potencia / V;
    const pct = Math.min((corriente / LIMITE_A) * 100, 100);
    const sobre = corriente > LIMITE_A;
    const maxBocas = Math.floor((LIMITE_A * V) / w);

    lblBocas.textContent = bocas;
    resultado.className = `resultado ${sobre ? "resultado--falla" : "resultado--ok"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${sobre ? "✖ Supera la térmica" : "✔ Entra en el circuito"}</span>
        <p>${sobre
          ? `Con ${bocas} bocas ${TIPOS[tipo].nombre} el circuito pide ${corriente.toFixed(1)} A y la térmica de ${LIMITE_A} A cortará. Máximo con esta lámpara: ${maxBocas} bocas.`
          : `${bocas} bocas ${TIPOS[tipo].nombre} consumen ${corriente.toFixed(1)} A: entran holgado. Con esta lámpara entran hasta ${maxBocas} bocas.`}</p>
      </div>
      <div class="valores">
        <span>Potencia total: <strong>${potencia} W</strong></span>
        <span>Corriente: <strong>${corriente.toFixed(1)} A</strong> / ${LIMITE_A} A</span>
        <span>Máximo de bocas: <strong>${maxBocas}</strong></span>
      </div>
      <div class="corr-barra"><div class="corr-fill ${sobre ? "corr-fill--trip" : ""}" style="width:${pct}%"></div></div>`;
  }

  selTipo.addEventListener("change", () => {
    tipo = selTipo.value;
    actualizar();
  });
  rng.addEventListener("input", () => {
    bocas = Number(rng.value);
    actualizar();
  });
  actualizar();
}

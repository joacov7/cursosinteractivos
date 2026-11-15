// Simulador Iluminación (spec 2.5).
// Compara potencias nominales y estima corriente en un escenario didáctico.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgIluminacion } from "../visuales.js";

const RECORDATORIO_SEGURIDAD =
  "La protección y la sección del conductor deben calcularse para la instalación real. " +
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
        Compará el consumo nominal de lámparas LED e incandescentes. La equivalencia de iluminación
        depende del flujo luminoso (lúmenes) y la eficacia de cada modelo, no solo de los watts.
      </p>

      ${svgIluminacion()}

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

      <p class="nota-modelo">Modelo ideal a 220 V: suma watts nominales y calcula I = P/V. El límite de 10 A es solo un supuesto didáctico; no vincula automáticamente una térmica con 1,5 mm² ni contempla factor de potencia, corriente de arranque, temperatura, método de instalación o reglamentación. Para comparar luz, revisar lúmenes y especificaciones del fabricante.</p>\n      <p class="nota-modelo">Modelo ideal a 220 V: suma watts nominales y calcula I = P/V. El límite de 10 A es solo un supuesto didáctico; no vincula automáticamente una térmica con 1,5 mm² ni contempla factor de potencia, corriente de arranque, temperatura, método de instalación o reglamentación. Para comparar luz, revisá los lúmenes y las especificaciones del fabricante.</p>
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
          ? `Con ${bocas} bocas ${TIPOS[tipo].nombre} la corriente ideal estimada es ${corriente.toFixed(1)} A, por encima del límite supuesto de ${LIMITE_A} A en este ejercicio. No se calcula el tiempo de actuación de una protección real.`
          : `${bocas} bocas ${TIPOS[tipo].nombre} representan ${corriente.toFixed(1)} A en el modelo ideal, por debajo del límite supuesto. Esto no valida la cantidad de bocas ni el dimensionamiento real.`}</p>
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

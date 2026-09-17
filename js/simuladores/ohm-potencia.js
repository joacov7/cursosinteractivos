// Simulador Ley de Ohm y potencia (spec 1.1).
// Circuito resistivo simple con multímetro virtual: el alumno "mide" tensión y
// resistencia, y calcula la corriente (I = V/R) y la potencia (P = V·I).

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "Medir tensión con el multímetro se hace con el circuito energizado y mucho " +
  "cuidado. Medir resistencia se hace SIEMPRE con el circuito sin tensión.";

// Casos con números redondos: I = V/R y P = V·I dan enteros.
const CASOS = [
  { V: 12, R: 6 },
  { V: 24, R: 12 },
  { V: 12, R: 3 },
  { V: 24, R: 8 },
  { V: 48, R: 12 },
  { V: 110, R: 55 },
  { V: 220, R: 110 },
  { V: 220, R: 44 },
  { V: 220, R: 22 },
];

function nuevoCaso(previo) {
  let c;
  do {
    c = CASOS[Math.floor(Math.random() * CASOS.length)];
  } while (previo && c.V === previo.V && c.R === previo.R && CASOS.length > 1);
  return { V: c.V, R: c.R, I: c.V / c.R, P: c.V * (c.V / c.R) };
}

function casiIgual(a, b) {
  return Math.abs(Number(a) - b) < 0.05;
}

export function render(container) {
  let caso = nuevoCaso(null);

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Ley de Ohm y potencia</h2>
      <p class="sim-intro">
        Un circuito resistivo simple: una fuente y una resistencia. Medí con el
        multímetro la tensión y la resistencia, y calculá la corriente y la potencia.
      </p>

      <div class="ohm-circuito" aria-hidden="true">
        <span class="ohm-fuente">⎓ Fuente</span>
        <span class="ohm-cable"></span>
        <span class="ohm-resistor">▭ R</span>
        <span class="ohm-cable"></span>
      </div>

      <div class="multimetro">
        <div class="mm-display">
          <span class="mm-label">Multímetro</span>
          <span id="mm-lectura" class="mm-lectura">— · —</span>
        </div>
        <div class="mm-botones">
          <button id="btn-medir-v" type="button">Medir tensión (V)</button>
          <button id="btn-medir-r" type="button">Medir resistencia (Ω)</button>
        </div>
      </div>

      <div class="ohm-medidos" id="ohm-medidos">
        <span>Tensión medida: <strong id="val-v">— V</strong></span>
        <span>Resistencia medida: <strong id="val-r">— Ω</strong></span>
      </div>

      <form id="ohm-form" class="ohm-form" novalidate>
        <label>
          Corriente I (A) — <span class="hint">I = V / R</span>
          <input id="in-i" type="number" step="any" inputmode="decimal" autocomplete="off" />
        </label>
        <label>
          Potencia P (W) — <span class="hint">P = V · I</span>
          <input id="in-p" type="number" step="any" inputmode="decimal" autocomplete="off" />
        </label>
        <div class="ohm-acciones">
          <button type="submit" class="btn-primario">Verificar</button>
          <button type="button" id="btn-nuevo">Nuevo caso</button>
        </div>
      </form>

      <div id="ohm-resultado" class="resultado" aria-live="polite" hidden></div>

      <details class="ohm-ref">
        <summary>Recordar fórmulas</summary>
        <ul>
          <li><code>V = I · R</code> → <code>I = V / R</code></li>
          <li><code>P = V · I</code> → también <code>I = P / V</code></li>
          <li>Combinando: <code>P = V² / R = I² · R</code></li>
        </ul>
      </details>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const lectura = container.querySelector("#mm-lectura");
  const valV = container.querySelector("#val-v");
  const valR = container.querySelector("#val-r");
  const inI = container.querySelector("#in-i");
  const inP = container.querySelector("#in-p");
  const resultado = container.querySelector("#ohm-resultado");
  let medidoV = false;
  let medidoR = false;

  container.querySelector("#btn-medir-v").addEventListener("click", () => {
    lectura.textContent = `${caso.V} V`;
    valV.textContent = `${caso.V} V`;
    medidoV = true;
  });
  container.querySelector("#btn-medir-r").addEventListener("click", () => {
    lectura.textContent = `${caso.R} Ω`;
    valR.textContent = `${caso.R} Ω`;
    medidoR = true;
  });

  function reiniciar() {
    caso = nuevoCaso(caso);
    lectura.textContent = "— · —";
    valV.textContent = "— V";
    valR.textContent = "— Ω";
    inI.value = "";
    inP.value = "";
    resultado.hidden = true;
    medidoV = false;
    medidoR = false;
  }

  container.querySelector("#btn-nuevo").addEventListener("click", reiniciar);

  container.querySelector("#ohm-form").addEventListener("submit", (e) => {
    e.preventDefault();

    if (!medidoV || !medidoR) {
      resultado.hidden = false;
      resultado.className = "resultado";
      resultado.innerHTML =
        `<div class="resultado-cabecera"><span class="badge">Medí primero</span>` +
        `<p>Usá el multímetro para medir la tensión y la resistencia antes de calcular.</p></div>`;
      return;
    }

    const iOk = casiIgual(inI.value, caso.I);
    const pOk = casiIgual(inP.value, caso.P);
    const ok = iOk && pOk;

    resultado.hidden = false;
    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${ok ? "✔ Correcto" : "✖ Revisá"}</span>
        <p>${ok ? "Bien: aplicaste la Ley de Ohm y la fórmula de potencia." : "Alguno de los valores no coincide."}</p>
      </div>
      <ul class="problemas">
        <li class="problema problema--${iOk ? "molesto" : "peligro"}">
          <span class="problema-titulo">Corriente ${iOk ? "✔" : "✖"}</span>
          <span class="problema-detalle">I = V / R = ${caso.V} / ${caso.R} = <strong>${caso.I} A</strong></span>
        </li>
        <li class="problema problema--${pOk ? "molesto" : "peligro"}">
          <span class="problema-titulo">Potencia ${pOk ? "✔" : "✖"}</span>
          <span class="problema-detalle">P = V · I = ${caso.V} · ${caso.I} = <strong>${caso.P} W</strong></span>
        </li>
      </ul>
    `;
  });
}

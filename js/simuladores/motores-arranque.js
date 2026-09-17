// Simulador Motores — arranque (spec 3.2).
// La corriente de arranque es varias veces la nominal. Si la térmica se
// dimensiona por la corriente de régimen con una curva inadecuada, salta en
// cada arranque. El alumno prueba método de arranque + curva de térmica.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "Un motor arranca tomando varias veces su corriente nominal. Dimensionar la " +
  "protección solo por la corriente de régimen provoca disparos molestos.";

const I_NOMINAL = 10; // A de régimen

// Métodos de arranque: cuántas veces la nominal toman en el pico de arranque.
const METODOS = {
  directo: { nombre: "Arranque directo", factor: 6, nota: "Simple, pero pico alto (~6× la nominal)." },
  estrella_triangulo: { nombre: "Estrella-triángulo", factor: 2, nota: "Reduce el pico de arranque a ~1/3." },
};

// Curvas de térmica: múltiplo de la nominal a partir del cual dispara el magnético.
const CURVAS = {
  B: { nombre: "Curva B", disparo: 4 },
  C: { nombre: "Curva C", disparo: 8 },
  D: { nombre: "Curva D", disparo: 13 },
};

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Motores — arranque</h2>
      <p class="sim-intro">
        Motor de corriente nominal ${I_NOMINAL} A. Elegí el método de arranque y la curva de la
        térmica, y arrancá el motor. El objetivo: que <strong>no salte en el arranque</strong> pero que
        siga protegiendo.
      </p>

      <div class="controles">
        <label>
          Método de arranque
          <select id="sel-metodo">
            <option value="directo">Arranque directo</option>
            <option value="estrella_triangulo">Estrella-triángulo</option>
          </select>
        </label>
        <label>
          Curva de la térmica
          <select id="sel-curva">
            <option value="B">Curva B (resistivo/iluminación)</option>
            <option value="C">Curva C (mixto/pequeños motores)</option>
            <option value="D">Curva D (motores, alta corriente de arranque)</option>
          </select>
        </label>
      </div>

      <button type="button" id="btn-arrancar" class="btn-primario">Arrancar motor</button>
      <div id="mot-resultado" class="resultado" aria-live="polite" hidden></div>

      <div class="comparacion">
        <h3>La idea</h3>
        <p>
          El pico de arranque es transitorio: no es una falla. Por eso a los motores se les pone una
          curva que tolere ese pico (C o D) o se reduce el pico con un arranque estrella-triángulo.
          Una curva B, pensada para cargas resistivas, dispararía en cada arranque.
        </p>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const selMetodo = container.querySelector("#sel-metodo");
  const selCurva = container.querySelector("#sel-curva");
  const resultado = container.querySelector("#mot-resultado");

  container.querySelector("#btn-arrancar").addEventListener("click", () => {
    const metodo = METODOS[selMetodo.value];
    const curva = CURVAS[selCurva.value];
    const iArranque = I_NOMINAL * metodo.factor;
    const umbralDisparo = I_NOMINAL * curva.disparo;
    const salta = iArranque >= umbralDisparo;

    resultado.hidden = false;
    resultado.className = `resultado ${salta ? "resultado--falla" : "resultado--ok"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${salta ? "✖ Saltó en el arranque" : "✔ Arrancó bien"}</span>
        <p>${salta
          ? `El pico de arranque (${iArranque} A) alcanzó el umbral de disparo magnético de la ${curva.nombre} (${umbralDisparo} A): la térmica corta en cada arranque. Usá una curva más alta o reducí el pico con estrella-triángulo.`
          : `El pico de arranque (${iArranque} A) queda por debajo del disparo de la ${curva.nombre} (${umbralDisparo} A): el motor arranca sin disparos molestos y la protección sigue vigente.`}</p>
      </div>
      <div class="valores">
        <span>Nominal: <strong>${I_NOMINAL} A</strong></span>
        <span>Pico de arranque: <strong>${iArranque} A</strong> (${metodo.nombre})</span>
        <span>Disparo ${curva.nombre}: <strong>${umbralDisparo} A</strong></span>
      </div>`;
  });
}

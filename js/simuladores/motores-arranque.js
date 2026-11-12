// Simulador Motores — arranque (spec 3.2).
// Comparación conceptual del pico de arranque con bandas magnéticas típicas.
// No dimensiona la protección ni sustituye curvas tiempo-corriente del fabricante.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgMotor } from "../visuales.js";

const RECORDATORIO_SEGURIDAD =
  "La protección de un motor requiere coordinar sobrecarga, cortocircuito, " +
  "conductor, método de arranque y condiciones de servicio. No elijas una curva solo por esta animación.";

const I_NOMINAL = 10;

const METODOS = {
  directo: { nombre: "Arranque directo", factor: 6, nota: "Pico ilustrativo: 6 × In." },
  estrella_triangulo: { nombre: "Estrella-triángulo", factor: 2, nota: "Pico ilustrativo reducido; método válido solo si motor y carga lo permiten." },
};

// Bandas magnéticas orientativas típicas expresadas como múltiplos de In.
// El resultado dentro de la banda es indeterminado: se necesita la curva real.
const CURVAS = {
  B: { nombre: "Curva B", min: 3, max: 5 },
  C: { nombre: "Curva C", min: 5, max: 10 },
  D: { nombre: "Curva D", min: 10, max: 20 },
};

export function evaluarArranque(metodoId, curvaId, nominalA = I_NOMINAL) {
  const metodo = METODOS[metodoId];
  const curva = CURVAS[curvaId];
  if (!metodo || !curva || !Number.isFinite(nominalA) || nominalA <= 0) {
    throw new TypeError("Método, curva o corriente nominal inválidos.");
  }
  const iArranque = nominalA * metodo.factor;
  const minimo = nominalA * curva.min;
  const maximo = nominalA * curva.max;
  const estado = iArranque < minimo ? "debajo" : iArranque > maximo ? "encima" : "indeterminado";
  return { metodo, curva, nominalA, iArranque, minimo, maximo, estado };
}

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Motores — arranque</h2>
      <p class="sim-intro">
        Motor de corriente nominal de ejemplo: ${I_NOMINAL} A. Compará un pico de arranque
        ilustrativo con las <strong>bandas magnéticas</strong> de distintas curvas.
      </p>
      <p class="nota-modelo">
        Bandas orientativas: B = 3–5 × In, C = 5–10 × In y D = 10–20 × In.
        Si el pico cae dentro de la banda, el resultado es indeterminado: la actuación depende
        de la curva tiempo-corriente concreta y del fabricante. Esta actividad no dimensiona
        la protección térmica ni valida la coordinación del motor.
      </p>

      ${svgMotor()}

      <div class="controles">
        <label>
          Método de arranque
          <select id="sel-metodo">
            <option value="directo">Arranque directo</option>
            <option value="estrella_triangulo">Estrella-triángulo (si es compatible)</option>
          </select>
        </label>
        <label>
          Curva del interruptor
          <select id="sel-curva">
            <option value="B">Curva B</option>
            <option value="C" selected>Curva C</option>
            <option value="D">Curva D</option>
          </select>
        </label>
      </div>

      <button type="button" id="btn-arrancar" class="btn-primario">Evaluar arranque</button>
      <div id="mot-resultado" class="resultado" aria-live="polite" hidden></div>

      <div class="comparacion">
        <h3>La idea</h3>
        <p>
          La banda magnética orienta sobre la respuesta ante corrientes elevadas, pero no describe
          por sí sola toda la protección del motor. También se debe resolver la protección contra
          sobrecarga, el contactor, el conductor, el arranque y la coordinación del conjunto.
        </p>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const selMetodo = container.querySelector("#sel-metodo");
  const selCurva = container.querySelector("#sel-curva");
  const resultado = container.querySelector("#mot-resultado");

  container.querySelector("#btn-arrancar").addEventListener("click", () => {
    const r = evaluarArranque(selMetodo.value, selCurva.value);
    const estadoUI = {
      debajo: {
        clase: "resultado--ok",
        titulo: "Por debajo de la banda magnética",
        texto: "El pico ilustrativo queda por debajo del límite inferior de la banda. Esto no demuestra que el motor esté correctamente protegido.",
      },
      encima: {
        clase: "resultado--falla",
        titulo: "Por encima de la banda magnética",
        texto: "El pico ilustrativo supera el límite superior de la banda; es esperable una actuación magnética, pero debe verificarse con la curva real y la corriente de arranque medida o declarada.",
      },
      indeterminado: {
        clase: "resultado",
        titulo: "Resultado indeterminado",
        texto: "El pico cae dentro de la banda magnética. No se puede afirmar si disparará sin consultar la curva tiempo-corriente y los datos del fabricante.",
      },
    }[r.estado];

    resultado.hidden = false;
    resultado.className = `resultado ${estadoUI.clase}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${estadoUI.titulo}</span>
        <p>${estadoUI.texto}</p>
      </div>
      <div class="valores">
        <span>Nominal del ejemplo: <strong>${r.nominalA} A</strong></span>
        <span>Pico supuesto: <strong>${r.iArranque} A</strong> (${r.metodo.nombre})</span>
        <span>Banda ${r.curva.nombre}: <strong>${r.minimo}–${r.maximo} A</strong></span>
      </div>`;
  });
}

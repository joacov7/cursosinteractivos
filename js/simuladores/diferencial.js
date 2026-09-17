// Simulador Disyuntor diferencial / RCD (spec 2.3).
// Una fuga de corriente a tierra por falla de aislación. El alumno compara:
// con térmica sola no corta (no es sobrecarga); con diferencial corta en ms.
// Protege PERSONAS, no la instalación. Sensibilidad doméstica: 30 mA.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "El diferencial protege personas y la térmica protege la instalación: un " +
  "tablero necesita AMBOS. Probá el diferencial con su botón de test una vez por mes.";

const RECOMENDADO_MA = 30;

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Disyuntor diferencial (RCD)</h2>
      <p class="sim-intro">
        Un artefacto con falla de aislación produce una <strong>fuga a tierra</strong>. Elegí la
        protección del tablero y provocá la fuga para ver qué corta y qué no.
      </p>

      <div class="controles">
        <label>
          Protección del tablero
          <select id="sel-proteccion">
            <option value="termica">Solo térmica</option>
            <option value="ambas">Térmica + diferencial</option>
          </select>
        </label>
        <label>
          Sensibilidad del diferencial
          <select id="sel-sens">
            <option value="30">30 mA (doméstico)</option>
            <option value="300">300 mA (industrial)</option>
          </select>
        </label>
        <label>
          Corriente de fuga a tierra
          <select id="sel-fuga">
            <option value="15">15 mA</option>
            <option value="50" selected>50 mA</option>
            <option value="150">150 mA</option>
          </select>
        </label>
      </div>

      <button type="button" id="btn-fuga" class="btn-primario">Provocar fuga a tierra</button>
      <div id="dif-resultado" class="resultado" aria-live="polite" hidden></div>

      <div class="comparacion">
        <h3>Roles distintos</h3>
        <p>
          Una fuga a tierra puede ser de decenas de miliamperios: <strong>no es una sobrecarga</strong>,
          así que la térmica ni se entera. El diferencial mide la diferencia entre lo que entra por la
          fase y lo que vuelve por el neutro; si falta corriente (se fue a tierra) y supera su
          sensibilidad, corta en milisegundos. Por eso se necesitan los dos.
        </p>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const selProteccion = container.querySelector("#sel-proteccion");
  const selSens = container.querySelector("#sel-sens");
  const selFuga = container.querySelector("#sel-fuga");
  const resultado = container.querySelector("#dif-resultado");

  container.querySelector("#btn-fuga").addEventListener("click", () => {
    const conDiferencial = selProteccion.value === "ambas";
    const sens = Number(selSens.value);
    const fuga = Number(selFuga.value);

    resultado.hidden = false;
    const cortaDiferencial = conDiferencial && fuga >= sens;

    if (cortaDiferencial) {
      resultado.className = "resultado resultado--ok";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✔ Cortó el diferencial</span>
          <p>La fuga (${fuga} mA) superó la sensibilidad (${sens} mA): el diferencial cortó en
          milisegundos y protegió a la persona. La térmica no habría actuado: no es una sobrecarga.</p>
        </div>`;
    } else if (conDiferencial && fuga < sens) {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✖ No cortó (sensibilidad alta)</span>
          <p>La fuga (${fuga} mA) no alcanzó la sensibilidad de ${sens} mA. Para protección de
          personas se usa <strong>${RECOMENDADO_MA} mA</strong>; ${sens} mA es de uso industrial y
          deja pasar fugas peligrosas para una persona.</p>
        </div>`;
    } else {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✖ Nadie cortó</span>
          <p>Con solo térmica, una fuga a tierra de ${fuga} mA no dispara nada: la térmica ve
          sobrecargas y cortocircuitos, no fugas. La persona queda expuesta. Falta un diferencial.</p>
        </div>`;
    }
  });
}

// Simulador Puesta a tierra (spec 1.5).
// Artefacto con falla de aislación (carcasa metálica energizada). El alumno
// activa/desactiva la puesta a tierra y prueba "tocar la carcasa".
// Mensaje central: la tierra no EVITA la falla; da un camino seguro para que la
// protección actúe.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "Toda carcasa metálica de un artefacto debe estar conectada a tierra. Ante " +
  "cosquilleo al tocar un electrodoméstico, cortá y hacé revisar la instalación.";

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Puesta a tierra</h2>
      <p class="sim-intro">
        Un artefacto tiene una <strong>falla de aislación</strong>: un conductor interno toca la
        carcasa metálica y la deja energizada. Probá qué pasa con y sin puesta a tierra.
      </p>

      <label class="switch-tierra">
        <input type="checkbox" id="chk-tierra" />
        <span>Conectar puesta a tierra en el artefacto</span>
      </label>

      <div class="tierra-escena">
        <div class="tierra-artefacto" id="artefacto">
          <span class="tierra-icono">🔌</span>
          <span class="tierra-carcasa" id="carcasa">Carcasa metálica</span>
          <span class="tierra-tension" id="tension-carcasa">220 V</span>
        </div>
        <div class="tierra-camino" id="camino"></div>
      </div>

      <button type="button" id="btn-tocar" class="btn-primario">Tocar la carcasa</button>

      <div id="tierra-resultado" class="resultado" aria-live="polite" hidden></div>

      <div class="comparacion">
        <h3>La idea central</h3>
        <p>
          La tierra <strong>no evita</strong> la falla de aislación: la falla sigue ahí. Lo que hace
          es dar un <strong>camino seguro</strong> a la corriente de falla, para que la protección
          (térmica y, sobre todo, el diferencial) la detecte y corte antes de que una persona
          sea el camino a tierra.
        </p>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const chk = container.querySelector("#chk-tierra");
  const carcasa = container.querySelector("#carcasa");
  const tensionCarcasa = container.querySelector("#tension-carcasa");
  const camino = container.querySelector("#camino");
  const resultado = container.querySelector("#tierra-resultado");

  function actualizarEscena() {
    const conTierra = chk.checked;
    carcasa.classList.toggle("tierra-carcasa--energizada", !conTierra);
    carcasa.classList.toggle("tierra-carcasa--segura", conTierra);
    tensionCarcasa.textContent = conTierra ? "≈ 0 V" : "220 V";
    camino.textContent = conTierra
      ? "Corriente de falla → cable de tierra → la protección corta"
      : "Sin camino a tierra: la carcasa queda a 220 V";
    camino.className = `tierra-camino ${conTierra ? "tierra-camino--ok" : "tierra-camino--peligro"}`;
    resultado.hidden = true;
  }

  container.querySelector("#btn-tocar").addEventListener("click", () => {
    const conTierra = chk.checked;
    resultado.hidden = false;
    if (conTierra) {
      resultado.className = "resultado resultado--ok";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✔ Protegido</span>
          <p>La corriente de falla ya circuló por el cable de tierra y la protección
          cortó. La carcasa está a ≈ 0 V: tocarla es seguro.</p>
        </div>`;
    } else {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✖ Riesgo de electrocución</span>
          <p>Sin puesta a tierra, la carcasa está a 220 V. Al tocarla, tu cuerpo se
          vuelve el camino a tierra y circula corriente por vos. La térmica sola no
          se entera (no es una sobrecarga): por eso hace falta también un diferencial.</p>
        </div>`;
    }
  });

  chk.addEventListener("change", actualizarEscena);
  actualizarEscena();
}

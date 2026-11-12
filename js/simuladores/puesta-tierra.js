// Simulador Puesta a tierra (spec 1.5).
// Artefacto con falla de aislación (carcasa metálica energizada). El alumno
// activa/desactiva la puesta a tierra y prueba "tocar la carcasa".
// Mensaje central: la tierra no EVITA la falla; da un camino seguro para que la
// protección actúe.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgTierra } from "../visuales.js";

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

      ${svgTierra()}

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

      <button type="button" id="btn-tocar" class="btn-primario">Simular contacto accidental</button>

      <div id="tierra-resultado" class="resultado" aria-live="polite" hidden></div>

      <div class="comparacion">
        <h3>La idea central</h3>
        <p>
          La tierra <strong>no evita</strong> la falla de aislación. El PE proporciona una trayectoria
          para la corriente de falla; la desconexión automática depende del esquema de puesta a tierra,
          la impedancia del lazo, las protecciones y sus tiempos de actuación. No se debe asumir seguridad
          sin ensayos y mediciones.
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
    tensionCarcasa.textContent = conTierra ? "Falla derivada por PE" : "Masa potencialmente energizada";
    camino.textContent = conTierra
      ? "Camino de falla por PE → verificar actuación y tiempo de desconexión"
      : "Sin PE: la masa puede quedar a potencial peligroso";
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
          <span class="badge">Camino de falla disponible</span>
          <p>El PE ofrece una trayectoria para la corriente de falla y puede facilitar la desconexión
          automática si el sistema de puesta a tierra y las protecciones están correctamente diseñados
          y verificados. Esta animación no demuestra una tensión de contacto segura ni un tiempo de corte.</p>
        </div>`;
    } else {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">Riesgo de contacto eléctrico</span>
          <p>Sin PE, una falla de aislación puede dejar la masa a un potencial peligroso.
          Una persona podría convertirse en parte del camino de corriente. No realices esta prueba
          en una instalación real: se requieren verificaciones instrumentales y protecciones adecuadas.</p>
        </div>`;
    }
  });

  chk.addEventListener("change", actualizarEscena);
  actualizarEscena();
}

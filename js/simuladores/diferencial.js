// Simulador Disyuntor diferencial / RCD (spec 2.3).
// Modelo conceptual: compara corriente diferencial con una sensibilidad seleccionada.
// No calcula tiempos normalizados ni garantiza protección personal.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgDiferencial } from "../visuales.js";

const RECORDATORIO_SEGURIDAD =
  "El diferencial y la protección contra sobrecorrientes cumplen funciones distintas. " +
  "Verificá el dispositivo y su botón de prueba según las instrucciones del fabricante; " +
  "la prueba no reemplaza las verificaciones eléctricas reglamentarias.";

const RECOMENDADO_MA = 30;

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Disyuntor diferencial (RCD)</h2>
      <p class="sim-intro">
        Una falla de aislación puede generar una <strong>corriente diferencial</strong>.
        Elegí la protección y observá el comportamiento del modelo simplificado.
      </p>

      ${svgDiferencial()}

      <div class="controles">
        <label>
          Protección del tablero
          <select id="sel-proteccion">
            <option value="termica">Solo protección termomagnética</option>
            <option value="ambas">Termomagnética + diferencial</option>
          </select>
        </label>
        <label>
          Sensibilidad nominal del diferencial
          <select id="sel-sens">
            <option value="30">30 mA (alta sensibilidad)</option>
            <option value="300">300 mA (sensibilidad menor)</option>
          </select>
        </label>
        <label>
          Corriente diferencial del escenario
          <select id="sel-fuga">
            <option value="15">15 mA</option>
            <option value="50" selected>50 mA</option>
            <option value="150">150 mA</option>
          </select>
        </label>
      </div>

      <button type="button" id="btn-fuga" class="btn-primario">Simular corriente diferencial</button>
      <div id="dif-resultado" class="resultado" aria-live="polite" hidden></div>

      <div class="comparacion">
        <h3>Roles distintos</h3>
        <p>
          La protección termomagnética actúa frente a sobrecargas y cortocircuitos.
          El diferencial detecta un desequilibrio entre las corrientes de los conductores activos.
          En este modelo, el resultado cambia cuando la corriente diferencial alcanza el valor nominal
          seleccionado; el comportamiento real depende del tipo de dispositivo, la forma de onda,
          la corriente y el tiempo de actuación, la instalación y las condiciones de ensayo.
        </p>
      </div>
      <p class="nota-modelo">
        <strong>Importante:</strong> el umbral exacto de esta simulación es una simplificación pedagógica.
        Un resultado favorable no demuestra que una persona esté protegida ni sustituye la selección,
        instalación, ensayo y verificación de un dispositivo conforme a la reglamentación aplicable.
        Un diferencial de 300 mA no es equivalente a uno de 30 mA como protección adicional de alta sensibilidad.
      </p>

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
          <span class="badge">✔ Actuación en el modelo</span>
          <p>La corriente diferencial del escenario (${fuga} mA) alcanzó o superó la sensibilidad nominal seleccionada (${sens} mA).
          El modelo representa una actuación, pero no calcula el tiempo real ni permite concluir que la instalación o una persona estén protegidas.</p>
        </div>`;
    } else if (conDiferencial && fuga < sens) {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✖ No actúa en este escenario</span>
          <p>La corriente diferencial (${fuga} mA) quedó por debajo de la sensibilidad nominal (${sens} mA).
          Para protección adicional de personas suele utilizarse alta sensibilidad, habitualmente 30 mA, según el diseño y la reglamentación aplicable.</p>
        </div>`;
    } else {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✖ Sin detección diferencial</span>
          <p>En el escenario elegido no hay interruptor diferencial. La protección termomagnética no reemplaza la detección de corrientes diferenciales.</p>
        </div>`;
    }
  });
}

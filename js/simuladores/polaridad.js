// Simulador Tomacorrientes y polaridad (spec 1.6).
// Norma argentina 2P+T (IRAM 2073). El alumno compara conexión correcta vs.
// fase y neutro invertidos, y ve que el artefacto "anda" igual pero queda fase
// presente en partes que en reposo no deberían tenerla.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "En un tomacorriente 2P+T (IRAM 2073) mirándolo de frente: la tierra es el " +
  "borne superior, y fase y neutro los dos inferiores. El interruptor de un " +
  "artefacto SIEMPRE debe cortar la fase, no el neutro.";

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Tomacorrientes y polaridad</h2>
      <p class="sim-intro">
        Una lámpara con su interruptor, conectada a un toma 2P+T. Cambiá la conexión y el
        interruptor, y mirá dónde queda presente la fase.
      </p>

      <div class="controles">
        <label>
          Conexión del toma
          <select id="sel-conexion">
            <option value="correcta">Correcta (fase e interruptor del mismo lado)</option>
            <option value="invertida">Fase y neutro invertidos</option>
          </select>
        </label>
        <label class="switch-interruptor">
          Interruptor de la lámpara
          <button type="button" id="btn-switch" class="btn-switch" aria-pressed="false">Apagado</button>
        </label>
      </div>

      <div class="polaridad-escena">
        <div class="toma">
          <span class="toma-borne toma-tierra">T</span>
          <div class="toma-inferior">
            <span class="toma-borne" id="borne-izq">F</span>
            <span class="toma-borne" id="borne-der">N</span>
          </div>
        </div>
        <div class="lampara" id="lampara">
          <span class="lampara-bulbo" id="bulbo">💡</span>
          <span class="lampara-porta" id="porta">Portalámparas</span>
        </div>
      </div>

      <div id="polaridad-resultado" class="resultado" aria-live="polite"></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const selConexion = container.querySelector("#sel-conexion");
  const btnSwitch = container.querySelector("#btn-switch");
  const bulbo = container.querySelector("#bulbo");
  const porta = container.querySelector("#porta");
  const resultado = container.querySelector("#polaridad-resultado");
  let encendido = false;

  btnSwitch.addEventListener("click", () => {
    encendido = !encendido;
    btnSwitch.setAttribute("aria-pressed", String(encendido));
    btnSwitch.textContent = encendido ? "Encendido" : "Apagado";
    btnSwitch.classList.toggle("btn-switch--on", encendido);
    actualizar();
  });
  selConexion.addEventListener("change", actualizar);

  function actualizar() {
    const invertida = selConexion.value === "invertida";

    // La lámpara enciende igual en ambos casos (funciona).
    bulbo.classList.toggle("lampara-bulbo--on", encendido);

    // El interruptor corta un polo. En conexión correcta corta la fase; con
    // fase/neutro invertidos, el interruptor termina cortando el neutro, así que
    // el portalámparas queda con FASE presente aunque esté apagado.
    const faseEnPorta = encendido || invertida;
    porta.classList.toggle("lampara-porta--fase", faseEnPorta);
    porta.textContent = faseEnPorta ? "Portalámparas — ⚡ FASE presente" : "Portalámparas — sin tensión";

    if (!invertida) {
      resultado.className = "resultado resultado--ok";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✔ Polaridad correcta</span>
          <p>El interruptor corta la <strong>fase</strong>. Con la lámpara apagada, el
          portalámparas queda del lado del neutro: sin tensión. Cambiar la lámpara es seguro.</p>
        </div>`;
    } else if (invertida && !encendido) {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✖ Riesgo oculto</span>
          <p>La lámpara <strong>anda igual</strong>, pero el interruptor corta el <strong>neutro</strong>.
          Apagada, el portalámparas <strong>sigue con fase</strong>. Si alguien va a cambiar el foco
          confiando en que está "apagado", puede recibir una descarga.</p>
        </div>`;
    } else {
      resultado.className = "resultado resultado--falla";
      resultado.innerHTML = `
        <div class="resultado-cabecera">
          <span class="badge">✖ Conexión invertida</span>
          <p>Encendida funciona, pero la polaridad está mal: apagala y vas a ver que la
          fase queda presente en el portalámparas. El artefacto "anda" y esconde el riesgo.</p>
        </div>`;
    }
  }

  actualizar();
}

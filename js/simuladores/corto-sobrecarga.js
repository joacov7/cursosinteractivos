// Simulador Cortocircuito vs. sobrecarga (spec 1.4).
// Animación conceptual de dos mecanismos distintos; no es una curva de disparo.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgFalla } from "../visuales.js";

const NOMINAL_A = 10;

const RECORDATORIO_SEGURIDAD =
  "La protección termomagnética debe coordinarse con los conductores y la instalación. " +
  "Nunca la puentes ni la reemplaces por otra de mayor corriente para evitar disparos.";

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Cortocircuito vs. sobrecarga</h2>
      <p class="sim-intro">
        Son <strong>dos fallas distintas</strong>. Observá la diferencia conceptual entre la respuesta
        térmica ante una sobrecarga y la respuesta magnética ante una corriente de cortocircuito.
        El ejemplo toma como referencia una protección nominal de ${NOMINAL_A} A.
      </p>
      <p class="nota-modelo">
        Animación cualitativa: las magnitudes y la duración visual no representan corrientes,
        tiempos ni curvas reales. La actuación efectiva depende de la curva del dispositivo,
        la corriente de falla, la impedancia del lazo y las condiciones de instalación.
      </p>

      ${svgFalla()}

      <div class="dos-escenarios">
        ${escenarioHTML("sobrecarga", "Sobrecarga", "Una corriente superior a la de servicio produce calentamiento acumulativo; el mecanismo térmico responde con retardo.") }
        ${escenarioHTML("corto", "Cortocircuito", "Una falla de baja impedancia puede generar una corriente elevada; el mecanismo magnético puede actuar rápidamente.") }
      </div>

      <div class="comparacion">
        <h3>La diferencia clave</h3>
        <p>
          La protección termomagnética combina un mecanismo térmico, asociado a sobrecargas,
          y uno magnético, asociado a corrientes elevadas de cortocircuito. No existe un tiempo
          único de disparo: debe consultarse la curva tiempo-corriente y la documentación del fabricante.
        </p>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  container.querySelectorAll("[data-escenario]").forEach((card) => {
    const tipo = card.dataset.escenario;
    const barra = card.querySelector(".corr-fill");
    const lectI = card.querySelector(".corr-valor");
    const cron = card.querySelector(".corr-cron");
    const estado = card.querySelector(".corr-estado");
    const btn = card.querySelector(".corr-btn");
    let timer = null;

    function reset() {
      clearInterval(timer);
      timer = null;
      barra.style.width = "0%";
      barra.className = "corr-fill";
      lectI.textContent = "Sin magnitud calculada";
      cron.textContent = "En espera";
      estado.textContent = "En espera";
      estado.className = "corr-estado";
      btn.disabled = false;
      btn.textContent = tipo === "corto" ? "Ver respuesta magnética" : "Ver respuesta térmica";
    }

    function disparo(msg) {
      clearInterval(timer);
      timer = null;
      estado.textContent = msg;
      estado.className = "corr-estado corr-estado--trip";
      barra.className = "corr-fill corr-fill--trip";
      btn.disabled = false;
      btn.textContent = "Reiniciar";
    }

    btn.addEventListener("click", () => {
      if (btn.textContent === "Reiniciar") {
        reset();
        return;
      }
      btn.disabled = true;
      estado.textContent = "Representación conceptual en curso…";
      estado.className = "corr-estado corr-estado--activo";

      if (tipo === "corto") {
        lectI.textContent = "Corriente elevada (no calculada)";
        barra.style.width = "100%";
        cron.textContent = "Respuesta rápida (conceptual)";
        setTimeout(() => disparo("Mecanismo MAGNÉTICO: respuesta rápida en el modelo"), 450);
      } else {
        lectI.textContent = "Sobrecorriente (sin escala real)";
        const tripMs = 4000;
        const t0 = performance.now();
        timer = setInterval(() => {
          const prog = Math.min((performance.now() - t0) / tripMs, 1);
          barra.style.width = `${prog * 100}%`;
          cron.textContent = "Progreso visual, no tiempo de disparo";
          if (prog >= 1) disparo("Mecanismo TÉRMICO: respuesta retardada en el modelo");
        }, 100);
      }
    });

    reset();
  });
}

function escenarioHTML(id, titulo, desc) {
  return `
    <article class="escenario" data-escenario="${id}">
      <h3>${titulo}</h3>
      <p class="escenario-desc">${desc}</p>
      <div class="corr-medida">
        <span class="corr-valor">Sin magnitud calculada</span>
        <span class="corr-cron">En espera</span>
      </div>
      <div class="corr-barra"><div class="corr-fill"></div></div>
      <p class="corr-estado">En espera</p>
      <button type="button" class="corr-btn"></button>
    </article>
  `;
}

// Simulador Cortocircuito vs. sobrecarga (spec 1.4).
// Dos escenarios lado a lado que muestran que son fallas DISTINTAS y que la
// térmica actúa por mecanismos distintos:
//   - Sobrecarga: la corriente sube gradualmente → disparo TÉRMICO (tarda).
//   - Cortocircuito: corriente altísima instantánea → disparo MAGNÉTICO (inmediato).
// Idea a evitar: pensar que son "lo mismo pero más fuerte".

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const NOMINAL_A = 10; // corriente nominal de la térmica del ejemplo

const RECORDATORIO_SEGURIDAD =
  "La térmica protege al cable. Nunca la puentees ni la reemplaces por una de " +
  "mayor corriente para 'que no salte': eso deja el cable sin protección.";

export function render(container) {
  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Cortocircuito vs. sobrecarga</h2>
      <p class="sim-intro">
        Son <strong>dos fallas distintas</strong>, no "la misma pero más fuerte". Provocá cada
        una y observá cómo y cuándo corta la térmica (nominal ${NOMINAL_A} A).
      </p>

      <div class="dos-escenarios">
        ${escenarioHTML("sobrecarga", "Sobrecarga", "Se conectan demasiadas cargas al mismo circuito. La corriente sube por encima de lo normal, de a poco.")}
        ${escenarioHTML("corto", "Cortocircuito", "Dos conductores (fase y neutro) se tocan directamente. Casi sin resistencia, la corriente se dispara al instante.")}
      </div>

      <div class="comparacion">
        <h3>La diferencia clave</h3>
        <p>
          La térmica tiene <strong>dos mecanismos</strong>: un bimetálico que se curva con el
          calor (lento, para sobrecargas) y una bobina magnética que actúa por el pico de
          corriente (instantánea, para cortocircuitos). Por eso la misma térmica reacciona
          <em>distinto</em> a cada falla.
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
      lectI.textContent = `${NOMINAL_A} A`;
      cron.textContent = "0 ms";
      estado.textContent = "En espera";
      estado.className = "corr-estado";
      btn.disabled = false;
      btn.textContent = tipo === "corto" ? "Provocar cortocircuito" : "Provocar sobrecarga";
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
      estado.textContent = "Falla en curso…";
      estado.className = "corr-estado corr-estado--activo";

      if (tipo === "corto") {
        // Cortocircuito: pico instantáneo, disparo magnético (<20 ms).
        const pico = NOMINAL_A * 50;
        lectI.textContent = `${pico} A`;
        barra.style.width = "100%";
        cron.textContent = "≈ 15 ms";
        setTimeout(() => disparo("Disparo MAGNÉTICO inmediato (< 20 ms)"), 450);
      } else {
        // Sobrecarga: sube gradual y el bimetálico tarda (curva térmica).
        const objetivo = Math.round(NOMINAL_A * 1.6); // 16 A ≈ 160 %
        const tripMs = 4000; // el bimetálico tarda unos segundos
        const t0 = performance.now();
        timer = setInterval(() => {
          const t = performance.now() - t0;
          const prog = Math.min(t / tripMs, 1);
          const iAhora = Math.round(NOMINAL_A + (objetivo - NOMINAL_A) * Math.min(prog * 1.4, 1));
          lectI.textContent = `${iAhora} A`;
          barra.style.width = `${40 + prog * 60}%`;
          cron.textContent = `${(t / 1000).toFixed(1)} s`;
          if (prog >= 1) disparo("Disparo TÉRMICO tras la sobrecarga (curva térmica)");
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
        <span class="corr-valor">${NOMINAL_A} A</span>
        <span class="corr-cron">0 ms</span>
      </div>
      <div class="corr-barra"><div class="corr-fill"></div></div>
      <p class="corr-estado">En espera</p>
      <button type="button" class="corr-btn"></button>
    </article>
  `;
}

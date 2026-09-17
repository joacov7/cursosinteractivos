// Simulador Normativa — introducción a AEA (spec 3.5).
// No se trata de memorizar articulado, sino de saber QUÉ es la AEA y CUÁNDO
// conviene consultarla. El alumno decide, ante situaciones, si corresponde ir a
// la reglamentación como referencia.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "La reglamentación existe para que las instalaciones sean seguras. Ante la duda, " +
  "la respuesta correcta casi siempre es: consultar la norma y, si hace falta, a un matriculado.";

const SITUACIONES = [
  {
    texto: "Vas a definir la sección mínima de cable para un circuito nuevo de una vivienda.",
    consultar: true,
    porque: "La reglamentación AEA fija secciones mínimas y criterios de dimensionamiento: es exactamente para esto.",
  },
  {
    texto: "Tenés que decidir la cantidad y tipo de circuitos obligatorios en una vivienda.",
    consultar: true,
    porque: "La AEA establece los circuitos mínimos y su categorización según la superficie y el grado de electrificación.",
  },
  {
    texto: "Querés elegir el color de la pared del ambiente donde va el tablero.",
    consultar: false,
    porque: "Es una decisión estética sin relación con la seguridad eléctrica: la norma no aplica.",
  },
  {
    texto: "Vas a dimensionar la puesta a tierra y la protección diferencial de una instalación.",
    consultar: true,
    porque: "Puesta a tierra y protección diferencial están reglamentadas: hay que verificar valores y exigencias.",
  },
  {
    texto: "Elegís qué música escuchar mientras trabajás.",
    consultar: false,
    porque: "No tiene nada que ver con la instalación eléctrica.",
  },
  {
    texto: "Dudás sobre las distancias y protecciones exigidas para instalaciones en un baño.",
    consultar: true,
    porque: "Los locales húmedos (baños) tienen zonas y exigencias específicas en la reglamentación.",
  },
];

export function render(container) {
  let i = 0;
  let aciertos = 0;

  function pintar() {
    const s = SITUACIONES[i];
    container.innerHTML = `
      <section class="sim">
        <div class="aviso-seguridad" role="note">
          <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
        </div>

        <h2>Simulador: Normativa (introducción a AEA)</h2>
        <p class="sim-intro">
          La <strong>AEA</strong> (Asociación Electrotécnica Argentina) publica la reglamentación de
          referencia para instalaciones eléctricas. No hay que memorizar el articulado, sí saber
          <strong>cuándo consultarla</strong>. Decidí en cada situación.
        </p>

        <div class="aea-progreso">Situación ${i + 1} de ${SITUACIONES.length}</div>
        <div class="diag-sintoma">${s.texto}</div>

        <div class="diag-opciones">
          <button type="button" class="diag-btn" data-op="true">Consultar la AEA</button>
          <button type="button" class="diag-btn" data-op="false">No corresponde</button>
        </div>

        <div id="aea-resultado" class="resultado" aria-live="polite" hidden></div>
        <button type="button" id="aea-siguiente" class="btn-primario" hidden>
          ${i < SITUACIONES.length - 1 ? "Siguiente" : "Ver resultado"}
        </button>

        <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
      </section>
    `;

    const resultado = container.querySelector("#aea-resultado");
    const btnSig = container.querySelector("#aea-siguiente");

    container.querySelectorAll(".diag-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const eligio = b.dataset.op === "true";
        const acierto = eligio === s.consultar;
        if (acierto) aciertos++;
        container.querySelectorAll(".diag-btn").forEach((x) => (x.disabled = true));
        resultado.hidden = false;
        resultado.className = `resultado ${acierto ? "resultado--ok" : "resultado--falla"}`;
        resultado.innerHTML = `
          <div class="resultado-cabecera">
            <span class="badge">${acierto ? "✔ Correcto" : "✖ Revisá"}</span>
            <p>${s.consultar ? "Sí corresponde consultarla. " : "No corresponde. "}${s.porque}</p>
          </div>`;
        btnSig.hidden = false;
      });
    });

    btnSig.addEventListener("click", () => {
      if (i < SITUACIONES.length - 1) {
        i++;
        pintar();
      } else {
        pintarFinal();
      }
    });
  }

  function pintarFinal() {
    const ok = aciertos >= Math.ceil(SITUACIONES.length * 0.7);
    container.innerHTML = `
      <section class="sim">
        <h2>Simulador: Normativa (introducción a AEA)</h2>
        <div class="resultado ${ok ? "resultado--ok" : "resultado--falla"}">
          <div class="resultado-cabecera">
            <span class="badge">${aciertos} / ${SITUACIONES.length}</span>
            <p>${ok
              ? "Buen criterio: reconocés cuándo una decisión toca la seguridad eléctrica y hay que ir a la norma."
              : "Repasá: casi todo lo que afecta a la seguridad de la instalación (secciones, circuitos, tierra, locales húmedos) se consulta en la reglamentación."}</p>
          </div>
        </div>
        <button type="button" id="aea-reiniciar" class="btn-primario">Reiniciar</button>
        <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
      </section>
    `;
    container.querySelector("#aea-reiniciar").addEventListener("click", () => {
      i = 0;
      aciertos = 0;
      pintar();
    });
  }

  pintar();
}

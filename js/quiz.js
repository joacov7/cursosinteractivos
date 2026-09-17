// Motor de quiz de cierre por tema (spec sección 6).
// Genérico: recibe el oficio y el id de tema, toma las preguntas de data/quizzes
// y registra la aprobación en el progreso del alumno.

import { QUIZZES, UMBRAL_APROBACION } from "../data/quizzes.js";
import { marcarAprobado, estaAprobado } from "./progreso.js";
import { AVISO_EDUCATIVO } from "../data/curricula.js";

export function render(container, { oficio, temaId, onCambioProgreso }) {
  const quiz = QUIZZES[temaId];
  if (!quiz) {
    container.innerHTML = `<section class="sim"><h2>Quiz no disponible</h2>
      <p>Todavía no hay quiz para este tema.</p></section>`;
    return;
  }

  const yaAprobado = estaAprobado(oficio, temaId);
  const necesarias = Math.ceil(quiz.preguntas.length * UMBRAL_APROBACION);

  container.innerHTML = `
    <section class="sim quiz">
      <h2>Quiz de cierre — ${quiz.tema}</h2>
      <p class="sim-intro">
        ${quiz.preguntas.length} preguntas. Necesitás ${necesarias} correctas para aprobar.
        ${yaAprobado ? '<span class="badge-aprobado">✔ Ya aprobado</span>' : ""}
      </p>

      <form id="quiz-form" class="quiz-form">
        ${quiz.preguntas
          .map(
            (p, i) => `
          <fieldset class="quiz-pregunta" data-i="${i}">
            <legend><span class="quiz-num">${i + 1}.</span> ${p.q}</legend>
            ${p.opciones
              .map(
                (op, j) => `
              <label class="quiz-opcion">
                <input type="radio" name="p${i}" value="${j}" />
                <span>${op}</span>
              </label>`
              )
              .join("")}
            <p class="quiz-explicacion" hidden></p>
          </fieldset>`
          )
          .join("")}

        <div class="quiz-acciones">
          <button type="submit" class="btn-primario">Corregir</button>
          <button type="button" id="quiz-reintentar" hidden>Reintentar</button>
        </div>
      </form>

      <div id="quiz-resultado" class="resultado" aria-live="polite" hidden></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const form = container.querySelector("#quiz-form");
  const resultado = container.querySelector("#quiz-resultado");
  const btnReintentar = container.querySelector("#quiz-reintentar");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Requiere responder todas.
    const sinResponder = quiz.preguntas.some((_, i) => !form.querySelector(`input[name="p${i}"]:checked`));
    if (sinResponder) {
      resultado.hidden = false;
      resultado.className = "resultado";
      resultado.innerHTML = `<div class="resultado-cabecera"><span class="badge">Faltan respuestas</span>
        <p>Respondé todas las preguntas antes de corregir.</p></div>`;
      return;
    }

    let correctas = 0;
    quiz.preguntas.forEach((p, i) => {
      const fs = form.querySelector(`.quiz-pregunta[data-i="${i}"]`);
      const elegido = Number(form.querySelector(`input[name="p${i}"]:checked`).value);
      const acierto = elegido === p.correcta;
      if (acierto) correctas++;

      fs.classList.remove("quiz-pregunta--ok", "quiz-pregunta--mal");
      fs.classList.add(acierto ? "quiz-pregunta--ok" : "quiz-pregunta--mal");

      // Marca visualmente la correcta y la elegida.
      fs.querySelectorAll(".quiz-opcion").forEach((lab, j) => {
        lab.classList.remove("quiz-opcion--correcta", "quiz-opcion--elegida-mal");
        if (j === p.correcta) lab.classList.add("quiz-opcion--correcta");
        else if (j === elegido) lab.classList.add("quiz-opcion--elegida-mal");
      });

      const exp = fs.querySelector(".quiz-explicacion");
      exp.hidden = false;
      exp.textContent = `${acierto ? "✔" : "✖"} ${p.explicacion}`;
    });

    form.querySelectorAll("input[type=radio]").forEach((r) => (r.disabled = true));

    const aprobo = correctas >= necesarias;
    if (aprobo) {
      marcarAprobado(oficio, temaId, `${correctas}/${quiz.preguntas.length}`);
      if (typeof onCambioProgreso === "function") onCambioProgreso();
    }

    resultado.hidden = false;
    resultado.className = `resultado ${aprobo ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${aprobo ? "✔ Aprobado" : "✖ No alcanzó"}</span>
        <p>${correctas} de ${quiz.preguntas.length} correctas.
        ${aprobo ? "Tema completado." : `Necesitás ${necesarias}. Repasá el simulador y reintentá.`}</p>
      </div>`;

    btnReintentar.hidden = false;
  });

  btnReintentar.addEventListener("click", () => render(container, { oficio, temaId, onCambioProgreso }));
}

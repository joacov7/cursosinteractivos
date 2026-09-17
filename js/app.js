// Shell de la app: navegación por hash + temario del módulo Electricidad.

import { CURRICULA } from "../data/curricula.js";
import * as cableTermica from "./simuladores/cable-termica.js";
import * as ohmPotencia from "./simuladores/ohm-potencia.js";
import * as cortoSobrecarga from "./simuladores/corto-sobrecarga.js";
import * as puestaTierra from "./simuladores/puesta-tierra.js";
import * as polaridad from "./simuladores/polaridad.js";
import * as serieParalelo from "./simuladores/serie-paralelo.js";
import * as cargasAmbiente from "./simuladores/cargas-ambiente.js";
import * as diferencial from "./simuladores/diferencial.js";
import * as tablero from "./simuladores/tablero.js";
import * as iluminacion from "./simuladores/iluminacion.js";
import * as trifasica from "./simuladores/trifasica.js";
import * as motoresArranque from "./simuladores/motores-arranque.js";
import * as compresorDiagnostico from "./simuladores/compresor-diagnostico.js";
import * as selectividad from "./simuladores/selectividad.js";
import * as normativaAea from "./simuladores/normativa-aea.js";
import * as catalogoView from "./catalogo-view.js";
import * as quiz from "./quiz.js";
import * as certificado from "./certificado.js";
import { QUIZZES } from "../data/quizzes.js";
import { estaAprobado, resumenNivel, cursoCompleto } from "./progreso.js";

// Oficio actual. Al sumar plomería / refrigeración / mecánica, este valor y la
// currícula pasan a seleccionarse por oficio; el resto del motor ya es genérico.
const OFICIO = "electricidad";

// Registro de simuladores disponibles por id.
const SIMULADORES = {
  "cable-termica": cableTermica,
  "ohm-potencia": ohmPotencia,
  "corto-sobrecarga": cortoSobrecarga,
  "puesta-tierra": puestaTierra,
  polaridad: polaridad,
  "serie-paralelo": serieParalelo,
  "cargas-ambiente": cargasAmbiente,
  diferencial: diferencial,
  tablero: tablero,
  iluminacion: iluminacion,
  trifasica: trifasica,
  "motores-arranque": motoresArranque,
  "compresor-diagnostico": compresorDiagnostico,
  selectividad: selectividad,
  "normativa-aea": normativaAea,
};

const vista = document.getElementById("vista");
const nav = document.getElementById("nav-temario");

const todosLosTemas = CURRICULA.flatMap((b) => b.temas);

function renderNav() {
  nav.innerHTML = CURRICULA.map((bloque) => {
    const ids = bloque.temas.map((t) => t.id);
    const { aprobados, total } = resumenNivel(OFICIO, ids);
    return `
      <div class="nav-bloque">
        <h4>${bloque.titulo} <span class="nav-progreso">${aprobados}/${total}</span></h4>
        <ul>
          ${bloque.temas
            .map((t) => {
              const clickable = t.estado === "listo" && t.sim;
              const href = clickable ? `#/sim/${t.sim}` : "#/pendiente";
              const ok = estaAprobado(OFICIO, t.id);
              return `
                <li>
                  <a href="${href}"
                     class="nav-tema ${clickable ? "" : "nav-tema--pendiente"}"
                     data-tema="${t.id}">
                    <span class="tema-id">${t.id}</span>
                    <span class="tema-titulo">${t.titulo}</span>
                    ${
                      ok
                        ? '<span class="tema-estado tema-estado--ok" title="Quiz aprobado">✔</span>'
                        : clickable
                          ? '<span class="tema-estado">▶</span>'
                          : '<span class="tema-estado tema-estado--soon">próximamente</span>'
                    }
                  </a>
                </li>`;
            })
            .join("")}
        </ul>
      </div>`;
  }).join("");
  const completo = cursoCompleto(OFICIO, todosLosTemas.map((t) => t.id));
  nav.insertAdjacentHTML(
    "beforeend",
    `<div class="nav-bloque">
       <h4>Referencia</h4>
       <ul>
         <li><a href="#/catalogo" class="nav-tema"><span class="tema-titulo">Catálogo de componentes</span></a></li>
         <li><a href="#/certificado" class="nav-tema ${completo ? "" : "nav-tema--pendiente"}">
           <span class="tema-titulo">Certificado</span>
           <span class="tema-estado ${completo ? "tema-estado--ok" : "tema-estado--soon"}">${completo ? "✔ listo" : "al completar"}</span>
         </a></li>
       </ul>
     </div>`
  );
}

function renderInicio() {
  vista.innerHTML = `
    <section class="inicio">
      <h2>Módulo Electricidad</h2>
      <p>
        Curso con simulaciones para aprender instalaciones eléctricas de forma segura.
        Cada tema sigue el mismo patrón: magnitud requerida, capacidad del componente,
        elemento de protección y reglas de falla.
      </p>
      <div class="aviso-seguridad" role="note">
        <strong>La seguridad es transversal.</strong> Todo simulador es una herramienta
        educativa; una instalación real la hace o supervisa un electricista matriculado.
      </div>
      <p>Elegí un tema del temario para empezar. Cada tema tiene su simulación y un
      <strong>quiz de cierre</strong>; al aprobarlo queda marcado con ✔.</p>
    </section>`;
}

function renderPendiente() {
  vista.innerHTML = `
    <section class="pendiente">
      <h2>En construcción</h2>
      <p>Esta simulación todavía no está disponible. Todo el nivel <strong>Básico</strong> ya está
      construido: elegí cualquier tema 1.x del temario, o consultá el
      <a href="#/catalogo">catálogo de componentes</a>.</p>
    </section>`;
}

// CTA al quiz de cierre debajo de un simulador. Un simulador puede cubrir más de
// un tema (p. ej. cable-termica cubre 1.2 y 1.3), así que se listan todos.
function anexarQuizCTA(simId) {
  const temas = todosLosTemas.filter((t) => t.sim === simId && QUIZZES[t.id]);
  if (!temas.length) return;
  const links = temas
    .map((t) => {
      const ok = estaAprobado(OFICIO, t.id);
      return `<a class="quiz-cta ${ok ? "quiz-cta--ok" : ""}" href="#/quiz/${t.id}">
        ${ok ? "✔ " : ""}Quiz de cierre — ${t.id} ${t.titulo}
      </a>`;
    })
    .join("");
  const seccion = vista.querySelector("section.sim") || vista;
  seccion.insertAdjacentHTML(
    "beforeend",
    `<div class="quiz-cta-wrap"><span>Cerrá el tema:</span>${links}</div>`
  );
}

function marcarActivo() {
  const hash = location.hash || "#/";
  nav.querySelectorAll(".nav-tema").forEach((a) => {
    a.classList.toggle("nav-tema--activo", a.getAttribute("href") === hash);
  });
}

function refrescarProgreso() {
  renderNav();
  marcarActivo();
}

function router() {
  const hash = location.hash || "#/";
  const partes = hash.replace(/^#\//, "").split("/");

  if (partes[0] === "sim" && partes[1] && SIMULADORES[partes[1]]) {
    SIMULADORES[partes[1]].render(vista);
    anexarQuizCTA(partes[1]);
  } else if (partes[0] === "quiz" && partes[1]) {
    quiz.render(vista, { oficio: OFICIO, temaId: partes[1], onCambioProgreso: refrescarProgreso });
  } else if (partes[0] === "certificado") {
    certificado.render(vista, { onCambioProgreso: refrescarProgreso });
  } else if (partes[0] === "catalogo") {
    catalogoView.render(vista);
  } else if (partes[0] === "pendiente") {
    renderPendiente();
  } else {
    renderInicio();
  }
  marcarActivo();
  vista.scrollTop = 0;
}

renderNav();
window.addEventListener("hashchange", router);
router();

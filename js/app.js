// Shell de la app: navegación por hash + temario del módulo Electricidad.

import { CURRICULA } from "../data/curricula.js";
// Los simuladores se cargan bajo demanda después de validar el acceso al curso.
import * as catalogoView from "./catalogo-view.js";
import * as quiz from "./quiz.js";
import * as certificado from "./certificado.js";
import * as landing from "./landing.js";
import * as cuenta from "./cuenta.js";
import * as api from "./api-client.js";
import * as workbench from "./workbench/workbench.js";
import { QUIZZES } from "../data/quizzes.js";
import { estaAprobado, resumenNivel, cursoCompleto } from "./progreso.js";
import { activarGuia } from "./guia-interactiva.js";

// Oficio actual. Al sumar plomería / refrigeración / mecánica, este valor y la
// currícula pasan a seleccionarse por oficio; el resto del motor ya es genérico.
const OFICIO = "electricidad";

// Registro de simuladores disponibles por id.
const SIMULADORES = {
  "cable-termica": () => import("./simuladores/cable-termica.js"),
  "ohm-potencia": () => import("./simuladores/ohm-potencia.js"),
  "corto-sobrecarga": () => import("./simuladores/corto-sobrecarga.js"),
  "puesta-tierra": () => import("./simuladores/puesta-tierra.js"),
  "polaridad": () => import("./simuladores/polaridad.js"),
  "serie-paralelo": () => import("./simuladores/serie-paralelo.js"),
  "cargas-ambiente": () => import("./simuladores/cargas-ambiente.js"),
  "diferencial": () => import("./simuladores/diferencial.js"),
  "tablero": () => import("./simuladores/tablero.js"),
  "iluminacion": () => import("./simuladores/iluminacion.js"),
  "trifasica": () => import("./simuladores/trifasica.js"),
  "motores-arranque": () => import("./simuladores/motores-arranque.js"),
  "compresor-diagnostico": () => import("./simuladores/compresor-diagnostico.js"),
  "selectividad": () => import("./simuladores/selectividad.js"),
  "normativa-aea": () => import("./simuladores/normativa-aea.js"),
};

const vista = document.getElementById("vista");
const nav = document.getElementById("nav-temario");
const sidebar = document.querySelector(".sidebar");
const navToggle = document.getElementById("nav-toggle");

navToggle?.addEventListener("click", () => {
  const collapsed = sidebar.classList.toggle("sidebar--collapsed");
  navToggle.setAttribute("aria-expanded", String(!collapsed));
  navToggle.textContent = collapsed ? "Mostrar temario" : "Ocultar temario";
});

// En móvil, elegir un tema pliega el índice para devolver el espacio a la lección.
nav.addEventListener("click", (event) => {
  if (!event.target.closest("a.nav-tema")) return;
  if (window.matchMedia?.("(max-width: 760px)").matches) {
    sidebar.classList.add("sidebar--collapsed");
    navToggle?.setAttribute("aria-expanded", "false");
    if (navToggle) navToggle.textContent = "Mostrar temario";
  }
});

const todosLosTemas = CURRICULA.flatMap((b) => b.temas);

function renderNav() {
  nav.innerHTML = `
    <div class="nav-bloque">
      <h4>Destacado</h4>
      <ul><li><a href="#/banco" class="nav-tema nav-tema--destacado">
        <span class="tema-titulo">⚡ Banco de trabajo</span>
        <span class="tema-estado tema-estado--nuevo">nuevo</span>
      </a></li></ul>
    </div>` + CURRICULA.map((bloque) => {
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
  landing.render(vista);
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
    const activo = a.getAttribute("href") === hash;
    a.classList.toggle("nav-tema--activo", activo);
    if (activo) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function refrescarProgreso() {
  renderNav();
  marcarActivo();
}


async function validarAcceso(simulatorKey) {
  vista.innerHTML = '<section class="account-page"><p>Verificando el acceso al curso…</p></section>';
  try {
    const allowed = await api.canAccessSimulator(simulatorKey);
    if (allowed) return true;
    vista.innerHTML = `
      <section class="access-wall">
        <span class="account-course-tag">CURSO DE ELECTRICIDAD</span>
        <h2>Esta clase está bloqueada</h2>
        <p>Podés acceder a esta simulación cuando tengas una inscripción activa al curso.</p>
        <a class="btn-primario" href="#/cuenta">Ingresar o ver mis cursos</a>
        <a href="#/">Volver al inicio</a>
      </section>`;
    return false;
  } catch (error) {
    vista.innerHTML = `
      <section class="access-wall">
        <h2>No pudimos validar el acceso</h2>
        <p>${String(error.message).replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}</p>
        <p>La plataforma no habilita las clases pagas si no puede verificar la inscripción.</p>
        <a class="btn-primario" href="#/cuenta">Ir a mi cuenta</a>
      </section>`;
    return false;
  }
}

async function router() {
  const hash = location.hash || "#/";
  const route = hash.slice(2);
  const [pathname, query = ""] = route.split("?");
  const partes = pathname.split("/");
  const params = new URLSearchParams(query);

  if (partes[0] === "sim" && partes[1] && SIMULADORES[partes[1]]) {
    if (await validarAcceso(partes[1])) {
      const simulator = await SIMULADORES[partes[1]]();
      simulator.render(vista);
      activarGuia(vista, partes[1]);
      anexarQuizCTA(partes[1]);
    }
  } else if (partes[0] === "quiz" && partes[1]) {
    const tema = todosLosTemas.find((item) => item.id === partes[1]);
    if (tema?.sim && await validarAcceso(tema.sim)) {
      quiz.render(vista, { oficio: OFICIO, temaId: partes[1], onCambioProgreso: refrescarProgreso });
    } else if (!tema) {
      renderPendiente();
    }
  } else if (partes[0] === "banco") {
    if (await validarAcceso("banco")) workbench.render(vista);
  } else if (partes[0] === "certificado") {
    if (await validarAcceso("banco")) certificado.render(vista, { onCambioProgreso: refrescarProgreso });
  } else if (partes[0] === "catalogo") {
    catalogoView.render(vista);
  } else if (partes[0] === "cuenta") {
    cuenta.render(vista);
  } else if (partes[0] === "verificar-email") {
    cuenta.render(vista, { action: "verify", token: params.get("token") });
  } else if (partes[0] === "restablecer-contrasena") {
    cuenta.render(vista, { action: "reset", token: params.get("token") });
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

// Shell de la app: navegación por hash + temario del módulo Electricidad.

import { CURRICULA } from "../data/curricula.js";
import * as cableTermica from "./simuladores/cable-termica.js";
import * as catalogoView from "./catalogo-view.js";

// Registro de simuladores disponibles por id.
const SIMULADORES = {
  "cable-termica": cableTermica,
};

const vista = document.getElementById("vista");
const nav = document.getElementById("nav-temario");

function renderNav() {
  nav.innerHTML = CURRICULA.map(
    (bloque) => `
      <div class="nav-bloque">
        <h4>${bloque.titulo}</h4>
        <ul>
          ${bloque.temas
            .map((t) => {
              const clickable = t.estado === "listo" && t.sim;
              const href = clickable ? `#/sim/${t.sim}` : "#/pendiente";
              return `
                <li>
                  <a href="${href}"
                     class="nav-tema ${clickable ? "" : "nav-tema--pendiente"}"
                     data-tema="${t.id}">
                    <span class="tema-id">${t.id}</span>
                    <span class="tema-titulo">${t.titulo}</span>
                    ${clickable ? '<span class="tema-estado">▶</span>' : '<span class="tema-estado tema-estado--soon">próximamente</span>'}
                  </a>
                </li>`;
            })
            .join("")}
        </ul>
      </div>`
  ).join("");
  nav.insertAdjacentHTML(
    "beforeend",
    `<div class="nav-bloque">
       <h4>Referencia</h4>
       <ul><li><a href="#/catalogo" class="nav-tema"><span class="tema-titulo">Catálogo de componentes</span></a></li></ul>
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
      <p>Elegí un tema del temario para empezar. Los marcados <em>▶</em> ya tienen simulación.</p>
    </section>`;
}

function renderPendiente() {
  vista.innerHTML = `
    <section class="pendiente">
      <h2>En construcción</h2>
      <p>Esta simulación todavía no está disponible. Ya podés usar el
      <a href="#/sim/cable-termica">simulador de Cable + Térmica</a> y consultar el
      <a href="#/catalogo">catálogo de componentes</a>.</p>
    </section>`;
}

function marcarActivo() {
  const hash = location.hash || "#/";
  nav.querySelectorAll(".nav-tema").forEach((a) => {
    a.classList.toggle("nav-tema--activo", a.getAttribute("href") === hash);
  });
}

function router() {
  const hash = location.hash || "#/";
  const partes = hash.replace(/^#\//, "").split("/");

  if (partes[0] === "sim" && partes[1] && SIMULADORES[partes[1]]) {
    SIMULADORES[partes[1]].render(vista);
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

// Vista del catálogo de componentes consultable (spec sección 4).

import { CATALOGO, CATEGORIAS, NIVELES } from "../data/catalogo.js";

function tarjeta(comp) {
  const specs = Object.entries(comp.especificacion_tecnica)
    .map(([k, v]) => `<li><span class="spec-k">${k.replace(/_/g, " ")}:</span> ${v}</li>`)
    .join("");

  return `
    <article class="comp-card" data-categoria="${comp.categoria}" data-nivel="${comp.nivel_curso}">
      <header class="comp-head">
        <h3>${comp.nombre}</h3>
        <span class="pill pill--${comp.nivel_curso}">${NIVELES[comp.nivel_curso]}</span>
      </header>
      <ul class="comp-specs">${specs}</ul>
      <p class="comp-uso"><strong>Para qué sirve:</strong> ${comp.uso_correcto}</p>
      <p class="comp-riesgo"><strong>Si se usa mal:</strong> ${comp.riesgo_uso_incorrecto}</p>
    </article>
  `;
}

export function render(container) {
  const categorias = Object.entries(CATEGORIAS);

  container.innerHTML = `
    <section class="catalogo">
      <h2>Catálogo de componentes</h2>
      <p class="sim-intro">
        Referencia cruzada de las simulaciones: qué es cada componente, para qué sirve,
        qué pasa si se usa mal y en qué nivel del curso aparece.
      </p>

      <div class="filtros">
        <label>
          Categoría
          <select id="filtro-categoria">
            <option value="">Todas</option>
            ${categorias.map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
          </select>
        </label>
        <label>
          Nivel
          <select id="filtro-nivel">
            <option value="">Todos</option>
            ${Object.entries(NIVELES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}
          </select>
        </label>
      </div>

      <div id="grid-comp" class="grid-comp">
        ${CATALOGO.map(tarjeta).join("")}
      </div>
    </section>
  `;

  const fCat = container.querySelector("#filtro-categoria");
  const fNivel = container.querySelector("#filtro-nivel");
  const grid = container.querySelector("#grid-comp");

  function filtrar() {
    grid.querySelectorAll(".comp-card").forEach((card) => {
      const okCat = !fCat.value || card.dataset.categoria === fCat.value;
      const okNivel = !fNivel.value || card.dataset.nivel === fNivel.value;
      card.hidden = !(okCat && okNivel);
    });
  }

  fCat.addEventListener("change", filtrar);
  fNivel.addEventListener("change", filtrar);
}

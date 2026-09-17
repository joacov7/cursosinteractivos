// Simulador Cálculo de cargas por ambiente (spec 2.2).
// El alumno recibe artefactos de una vivienda y los reparte en circuitos
// separados. Cada circuito tiene su protección y capacidad. Falla típica:
// meter toda la casa en un solo circuito y sobrecargarlo.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "Repartir la carga en circuitos separados no es opcional: evita sobrecargas, " +
  "acota las fallas y permite cortar un sector sin dejar toda la casa a oscuras.";

// Circuitos disponibles y su límite práctico de corriente (según térmica/cable).
const CIRCUITOS = [
  { id: "ilum", nombre: "Iluminación (10 A · 1.5 mm²)", limite: 10 },
  { id: "tomas", nombre: "Tomas uso general (16 A · 2.5 mm²)", limite: 16 },
  { id: "especial", nombre: "Uso especial AC/cocina (20 A · 4 mm²)", limite: 20 },
];

// Artefactos de la vivienda (corriente aproximada a 220 V) y a qué tipo pertenecen.
const ARTEFACTOS = [
  { id: "luces_living", nombre: "Luces del living", corriente: 2, tipo: "ilum" },
  { id: "luces_dorm", nombre: "Luces de dormitorios", corriente: 2, tipo: "ilum" },
  { id: "tv", nombre: "TV + equipos", corriente: 3, tipo: "tomas" },
  { id: "heladera", nombre: "Heladera", corriente: 4, tipo: "tomas" },
  { id: "microondas", nombre: "Microondas", corriente: 6, tipo: "tomas" },
  { id: "aire", nombre: "Aire acondicionado", corriente: 12, tipo: "especial" },
  { id: "horno", nombre: "Horno eléctrico", corriente: 14, tipo: "especial" },
];

export function render(container) {
  // Asignación inicial vacía: el alumno decide.
  const asignacion = {}; // artefactoId -> circuitoId

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Cálculo de cargas por ambiente</h2>
      <p class="sim-intro">
        Asigná cada artefacto a un circuito. La idea es <strong>no meter todo en uno</strong>:
        separá iluminación, tomas de uso general y cargas especiales, y que ninguno supere su límite.
      </p>

      <div class="cargas-grid">
        <div class="cargas-artefactos">
          <h3>Artefactos</h3>
          ${ARTEFACTOS.map(
            (a) => `
            <div class="carga-fila">
              <span class="carga-nombre">${a.nombre} <em>(${a.corriente} A)</em></span>
              <select data-art="${a.id}">
                <option value="">— sin asignar —</option>
                ${CIRCUITOS.map((c) => `<option value="${c.id}">${c.nombre.split(" (")[0]}</option>`).join("")}
              </select>
            </div>`
          ).join("")}
        </div>

        <div class="cargas-circuitos" id="cargas-circuitos"></div>
      </div>

      <button type="button" id="btn-verificar" class="btn-primario">Verificar diseño</button>
      <div id="cargas-resultado" class="resultado" aria-live="polite" hidden></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const panelCircuitos = container.querySelector("#cargas-circuitos");
  const resultado = container.querySelector("#cargas-resultado");

  function totalPorCircuito() {
    const tot = Object.fromEntries(CIRCUITOS.map((c) => [c.id, 0]));
    for (const a of ARTEFACTOS) {
      const c = asignacion[a.id];
      if (c) tot[c] += a.corriente;
    }
    return tot;
  }

  function pintarCircuitos() {
    const tot = totalPorCircuito();
    panelCircuitos.innerHTML = `<h3>Circuitos</h3>` + CIRCUITOS.map((c) => {
      const usado = tot[c.id];
      const pct = Math.min((usado / c.limite) * 100, 100);
      const sobre = usado > c.limite;
      return `
        <div class="circuito-box ${sobre ? "circuito-box--sobre" : ""}">
          <div class="circuito-cab"><strong>${c.nombre}</strong><span>${usado} / ${c.limite} A</span></div>
          <div class="corr-barra"><div class="corr-fill ${sobre ? "corr-fill--trip" : ""}" style="width:${pct}%"></div></div>
        </div>`;
    }).join("");
  }

  container.querySelectorAll("select[data-art]").forEach((sel) => {
    sel.addEventListener("change", () => {
      asignacion[sel.dataset.art] = sel.value;
      pintarCircuitos();
      resultado.hidden = true;
    });
  });

  container.querySelector("#btn-verificar").addEventListener("click", () => {
    const tot = totalPorCircuito();
    const sinAsignar = ARTEFACTOS.filter((a) => !asignacion[a.id]);
    const sobrecargados = CIRCUITOS.filter((c) => tot[c.id] > c.limite);
    // Buenas prácticas: cada artefacto en un circuito acorde a su tipo.
    const malTipo = ARTEFACTOS.filter((a) => asignacion[a.id] && asignacion[a.id] !== a.tipo);

    resultado.hidden = false;
    const problemas = [];
    if (sinAsignar.length)
      problemas.push({ sev: "molesto", t: "Faltan asignar", d: sinAsignar.map((a) => a.nombre).join(", ") + "." });
    if (sobrecargados.length)
      problemas.push({
        sev: "peligro",
        t: "Circuito sobrecargado",
        d: sobrecargados.map((c) => `${c.nombre.split(" (")[0]} (${tot[c.id]} A > ${c.limite} A)`).join("; ") +
          ". La térmica cortará o el cable se recalienta.",
      });
    if (malTipo.length)
      problemas.push({
        sev: "molesto",
        t: "Agrupamiento poco prolijo",
        d: "Conviene separar por tipo: " + malTipo.map((a) => a.nombre).join(", ") +
          " no está en el circuito que le corresponde.",
      });

    const ok = problemas.length === 0;
    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${ok ? "✔ Diseño válido" : "✖ Revisá el diseño"}</span>
        <p>${ok ? "Cargas repartidas y ningún circuito supera su límite. Así se dimensiona una instalación." : "Hay cosas para corregir."}</p>
      </div>
      ${ok ? "" : `<ul class="problemas">${problemas
        .map((p) => `<li class="problema problema--${p.sev}"><span class="problema-titulo">${p.t}</span><span class="problema-detalle">${p.d}</span></li>`)
        .join("")}</ul>`}`;
  });

  pintarCircuitos();
}

// Simulador Tablero completo (spec 2.4).
// El alumno arma el tablero de una vivienda chica respetando la jerarquía de
// protecciones: llave general → diferencial general → térmicas seccionales por
// circuito (iluminación, tomas, AC/cocina).

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "En un tablero real: identificá cada circuito con etiquetas, respetá la " +
  "jerarquía de protecciones y dejá el esquema unifilar a la vista.";

// Cada slot del tablero, en orden de arriba hacia abajo, y qué componente espera.
const SLOTS = [
  { id: "general", nombre: "Entrada / cabecera", correcto: "llave_general", ayuda: "Lo primero que corta todo." },
  { id: "personas", nombre: "Protección de personas", correcto: "diferencial", ayuda: "Corta ante fugas a tierra." },
  { id: "c_ilum", nombre: "Circuito iluminación", correcto: "termica_10", ayuda: "Protege el cable de 1.5 mm²." },
  { id: "c_tomas", nombre: "Circuito tomas", correcto: "termica_16", ayuda: "Protege el cable de 2.5 mm²." },
  { id: "c_especial", nombre: "Circuito AC / cocina", correcto: "termica_20", ayuda: "Protege el cable de 4 mm²." },
];

const COMPONENTES = [
  { id: "llave_general", nombre: "Llave general (interruptor principal)" },
  { id: "diferencial", nombre: "Disyuntor diferencial 30 mA" },
  { id: "termica_10", nombre: "Térmica 10 A" },
  { id: "termica_16", nombre: "Térmica 16 A" },
  { id: "termica_20", nombre: "Térmica 20 A" },
];

export function render(container) {
  const eleccion = {}; // slotId -> componenteId

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Tablero completo</h2>
      <p class="sim-intro">
        Armá el tablero de una vivienda chica. Asigná el componente correcto a cada posición,
        respetando la jerarquía: primero corta todo la <strong>llave general</strong>, después el
        <strong>diferencial</strong> protege personas, y cada circuito lleva su <strong>térmica</strong>.
      </p>

      <div class="tablero" id="tablero">
        ${SLOTS.map(
          (s) => `
          <div class="tablero-slot" data-slot="${s.id}">
            <div class="tablero-slot-info">
              <strong>${s.nombre}</strong>
              <span class="tablero-ayuda">${s.ayuda}</span>
            </div>
            <select data-slot-sel="${s.id}">
              <option value="">— elegir —</option>
              ${COMPONENTES.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("")}
            </select>
          </div>`
        ).join("")}
      </div>

      <button type="button" id="btn-armar" class="btn-primario">Verificar tablero</button>
      <div id="tablero-resultado" class="resultado" aria-live="polite" hidden></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const resultado = container.querySelector("#tablero-resultado");

  container.querySelectorAll("select[data-slot-sel]").forEach((sel) => {
    sel.addEventListener("change", () => {
      eleccion[sel.dataset.slotSel] = sel.value;
      resultado.hidden = true;
    });
  });

  container.querySelector("#btn-armar").addEventListener("click", () => {
    const errores = [];
    const usados = {};
    for (const s of SLOTS) {
      const elegido = eleccion[s.id] || "";
      if (!elegido) errores.push(`Falta el componente de "${s.nombre}".`);
      else if (elegido !== s.correcto) {
        const comp = COMPONENTES.find((c) => c.id === elegido);
        errores.push(`En "${s.nombre}" no corresponde ${comp.nombre}.`);
      }
      usados[elegido] = (usados[elegido] || 0) + 1;
    }
    // Un mismo componente no puede ocupar dos posiciones (cada uno es único).
    Object.entries(usados).forEach(([id, n]) => {
      if (id && n > 1) {
        const comp = COMPONENTES.find((c) => c.id === id);
        errores.push(`${comp.nombre} está repetido en ${n} posiciones.`);
      }
    });

    resultado.hidden = false;
    const ok = errores.length === 0;
    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${ok ? "✔ Tablero correcto" : "✖ Revisá el tablero"}</span>
        <p>${ok
          ? "Jerarquía respetada: llave general → diferencial → térmicas seccionales, cada una protegiendo su cable."
          : "Todavía no cumple la jerarquía de protecciones."}</p>
      </div>
      ${ok ? "" : `<ul class="problemas">${errores
        .map((e) => `<li class="problema problema--peligro"><span class="problema-detalle">${e}</span></li>`)
        .join("")}</ul>`}`;
  });
}

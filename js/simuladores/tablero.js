// Simulador Tablero completo (spec 2.4).
// Ejercicio de reconocimiento de componentes y jerarquía funcional.
// No dimensiona conductores ni selecciona protecciones para una instalación real.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgTablero } from "../visuales.js";

const RECORDATORIO_SEGURIDAD =
  "En un tablero real: identificá cada circuito con etiquetas, respetá la " +
  "jerarquía de protecciones y dejá el esquema unifilar a la vista. El diseño " +
  "y dimensionamiento deben verificarse según la instalación y la reglamentación aplicable.";

const SLOTS = [
  { id: "general", nombre: "Entrada / cabecera", correcto: "llave_general", ayuda: "Interruptor principal del tablero." },
  { id: "personas", nombre: "Protección diferencial", correcto: "diferencial", ayuda: "Protección diferencial de alta sensibilidad para protección adicional." },
  { id: "c_ilum", nombre: "Circuito de iluminación", correcto: "termica_10", ayuda: "Ejemplo didáctico: térmica de 10 A." },
  { id: "c_tomas", nombre: "Circuito de tomacorrientes", correcto: "termica_16", ayuda: "Ejemplo didáctico: térmica de 16 A." },
  { id: "c_especial", nombre: "Circuito de uso específico", correcto: "termica_20", ayuda: "Ejemplo didáctico: térmica de 20 A." },
];

const COMPONENTES = [
  { id: "llave_general", nombre: "Interruptor principal" },
  { id: "diferencial", nombre: "Interruptor diferencial 30 mA" },
  { id: "termica_10", nombre: "Interruptor termomagnético 10 A" },
  { id: "termica_16", nombre: "Interruptor termomagnético 16 A" },
  { id: "termica_20", nombre: "Interruptor termomagnético 20 A" },
];

export function render(container) {
  const eleccion = {};

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Tablero completo</h2>
      <p class="sim-intro">
        Reconocé los componentes y ubicá cada uno en este <strong>esquema didáctico simplificado</strong>.
        El ejercicio representa una organización funcional; no define calibres ni acredita que un tablero real esté correctamente dimensionado.
      </p>

      ${svgTablero()}

      <div class="nota-modelo">
        <strong>Alcance del ejercicio:</strong> los valores de 10 A, 16 A y 20 A son opciones de esta actividad.
        No se vinculan automáticamente con secciones de cable. La selección real depende, entre otros factores,
        de la corriente de diseño, capacidad admisible corregida, método de instalación, agrupamiento,
        temperatura, caída de tensión y poder de corte.
      </div>

      <div class="tablero" id="tablero">
        ${SLOTS.map(
          (s) => `
          <div class="tablero-slot" data-slot="${s.id}">
            <div class="tablero-slot-info">
              <strong>${s.nombre}</strong>
              <span class="tablero-ayuda">${s.ayuda}</span>
            </div>
            <select data-slot-sel="${s.id}" aria-label="Componente para ${s.nombre}">
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
        errores.push(`En "${s.nombre}" no corresponde ${comp?.nombre ?? "ese componente"}.`);
      }
      usados[elegido] = (usados[elegido] || 0) + 1;
    }
    Object.entries(usados).forEach(([id, n]) => {
      if (id && n > 1) {
        const comp = COMPONENTES.find((c) => c.id === id);
        errores.push(`${comp?.nombre ?? "El componente"} está repetido en ${n} posiciones.`);
      }
    });

    resultado.hidden = false;
    const ok = errores.length === 0;
    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${ok ? "✔ Componentes ubicados" : "✖ Revisá el tablero"}</span>
        <p>${ok
          ? "Reconociste los componentes y el orden didáctico propuesto. Esto no valida el dimensionamiento ni la seguridad de una instalación real."
          : "Todavía hay componentes faltantes, repetidos o ubicados en una posición incorrecta."}
        </p>
      </div>
      ${ok ? "" : `<ul class="problemas">${errores
        .map((e) => `<li class="problema problema--peligro"><span class="problema-detalle">${e}</span></li>`)
        .join("")}</ul>`}`;
  });
}

// Simulador Mantenimiento industrial — coordinación de protecciones (spec 3.4).
// Enseña que comparar corrientes nominales no basta para demostrar selectividad.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import { svgSelectividad } from "../visuales.js";

const RECORDATORIO_SEGURIDAD =
  "La selectividad debe verificarse con curvas tiempo-corriente y tablas de coordinación " +
  "del fabricante para la corriente de falla prevista. No alcanza con comparar amperajes.";

const MAQUINAS = [
  { id: "m1", nombre: "Máquina 1", consumo: 12 },
  { id: "m2", nombre: "Máquina 2", consumo: 16 },
  { id: "m3", nombre: "Máquina 3", consumo: 10 },
];
const OPCIONES_BREAKER = [16, 20, 25, 32, 40, 63];

export function evaluarCoordinacionNominal(seccionalA, generalA, consumoA) {
  if (![seccionalA, generalA, consumoA].every(Number.isFinite) ||
      seccionalA <= 0 || generalA <= 0 || consumoA < 0) {
    throw new TypeError("Corrientes de coordinación inválidas.");
  }
  return {
    seccionalSobreCarga: seccionalA < consumoA,
    escalonamientoNominal: seccionalA < generalA,
    selectividadVerificada: false,
  };
}

export function render(container) {
  const seccional = {};
  let general = 40;

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Selectividad de protecciones</h2>
      <p class="sim-intro">
        Tres máquinas cuelgan de una protección general. Elegí las corrientes nominales
        de las protecciones y analizá si existe un <strong>escalonamiento nominal</strong>.
        Después identificá qué información falta para demostrar selectividad real.
      </p>

      ${svgSelectividad()}

      <div class="nota-modelo">
        <strong>Límite importante:</strong> que la protección seccional tenga menos amperes
        que la general no demuestra que vaya a abrir primero. La selectividad depende de las
        curvas tiempo-corriente, la corriente de cortocircuito disponible, el tipo de dispositivo
        y las tablas de coordinación del fabricante.
      </div>

      <div class="tablero">
        <div class="tablero-slot">
          <div class="tablero-slot-info"><strong>Protección general</strong>
            <span class="tablero-ayuda">Corriente nominal del ejemplo.</span></div>
          <select id="sel-general">
            ${OPCIONES_BREAKER.map((a) => `<option value="${a}" ${a === general ? "selected" : ""}>${a} A</option>`).join("")}
          </select>
        </div>
        ${MAQUINAS.map(
          (m) => `
          <div class="tablero-slot">
            <div class="tablero-slot-info"><strong>${m.nombre}</strong>
              <span class="tablero-ayuda">Corriente de carga supuesta: ${m.consumo} A.</span></div>
            <select data-maq="${m.id}" aria-label="Protección seccional para ${m.nombre}">
              <option value="">— seleccionar —</option>
              ${OPCIONES_BREAKER.map((a) => `<option value="${a}">${a} A</option>`).join("")}
            </select>
          </div>`
        ).join("")}
      </div>

      <div class="controles">
        <label>
          Analizar el circuito de…
          <select id="sel-falla">
            ${MAQUINAS.map((m) => `<option value="${m.id}">${m.nombre}</option>`).join("")}
          </select>
        </label>
      </div>
      <button type="button" id="btn-falla" class="btn-primario">Evaluar coordinación</button>
      <div id="sel-resultado" class="resultado" aria-live="polite" hidden></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const resultado = container.querySelector("#sel-resultado");
  container.querySelector("#sel-general").addEventListener("change", (e) => {
    general = Number(e.target.value);
    resultado.hidden = true;
  });
  container.querySelectorAll("select[data-maq]").forEach((s) =>
    s.addEventListener("change", () => {
      seccional[s.dataset.maq] = Number(s.value) || 0;
      resultado.hidden = true;
    })
  );

  container.querySelector("#btn-falla").addEventListener("click", () => {
    const maqId = container.querySelector("#sel-falla").value;
    const maq = MAQUINAS.find((m) => m.id === maqId);
    const brk = seccional[maqId] || 0;
    resultado.hidden = false;

    const faltan = MAQUINAS.filter((m) => !seccional[m.id]);
    if (faltan.length) {
      resultado.className = "resultado";
      resultado.innerHTML = `<div class="resultado-cabecera"><span class="badge">Faltan protecciones</span>
        <p>Asigná una corriente nominal a cada protección seccional antes de analizar.</p></div>`;
      return;
    }

    const r = evaluarCoordinacionNominal(brk, general, maq.consumo);
    const observaciones = [];
    observaciones.push(r.seccionalSobreCarga
      ? `La protección seccional (${brk} A) tiene una corriente nominal inferior a la carga supuesta (${maq.consumo} A); debe revisarse la selección y la protección contra sobrecarga.`
      : `La corriente nominal seccional (${brk} A) no es inferior a la corriente de carga supuesta (${maq.consumo} A).`);
    observaciones.push(r.escalonamientoNominal
      ? `Hay escalonamiento nominal: ${brk} A seccional frente a ${general} A general.`
      : `No hay escalonamiento nominal: la seccional (${brk} A) no es menor que la general (${general} A).`);
    observaciones.push("La selectividad NO queda demostrada con estos datos. Se necesitan corriente de cortocircuito prevista, curvas tiempo-corriente y tablas de coordinación del fabricante.");

    resultado.className = "resultado resultado--falla";
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">Selectividad no verificada</span>
        <p>${observaciones.join(" ")}</p>
      </div>
      <div class="valores">
        <span>Circuito: <strong>${maq.nombre}</strong></span>
        <span>Seccional: <strong>${brk} A</strong></span>
        <span>General: <strong>${general} A</strong></span>
      </div>`;
  });
}

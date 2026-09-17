// Simulador Trifásica (spec 3.1).
// 220 V (fase-neutro) vs 380 V (fase-fase): cuándo hace falta trifásica. El
// alumno clasifica artefactos como monofásicos o trifásicos.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const RECORDATORIO_SEGURIDAD =
  "En trifásica hay 380 V entre fases: el riesgo es mayor. Verificá secuencia de " +
  "fases y ausencia de tensión en las tres antes de trabajar.";

// Artefactos y su alimentación correcta.
const ARTEFACTOS = [
  { id: "lampara", nombre: "Iluminación LED del hogar", tipo: "mono" },
  { id: "heladera", nombre: "Heladera familiar", tipo: "mono" },
  { id: "aire_hogar", nombre: "Aire acondicionado split hogareño", tipo: "mono" },
  { id: "motor_industrial", nombre: "Motor industrial de 10 HP", tipo: "tri" },
  { id: "ascensor", nombre: "Ascensor de edificio", tipo: "tri" },
  { id: "soldadora_grande", nombre: "Soldadora industrial de gran porte", tipo: "tri" },
  { id: "bomba_grande", nombre: "Bomba de agua de gran caudal", tipo: "tri" },
  { id: "microondas", nombre: "Microondas", tipo: "mono" },
];

export function render(container) {
  const eleccion = {};

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Trifásica</h2>
      <p class="sim-intro">
        En una vivienda hay <strong>220 V</strong> entre fase y neutro (monofásica). La
        <strong>trifásica</strong> usa tres fases (<strong>380 V</strong> entre fases) y se necesita para
        cargas grandes, sobre todo motores de mucha potencia. Clasificá cada artefacto.
      </p>

      <div class="clasif-lista">
        ${ARTEFACTOS.map(
          (a) => `
          <div class="clasif-fila" data-art="${a.id}">
            <span>${a.nombre}</span>
            <div class="clasif-botones">
              <button type="button" data-tipo="mono">Monofásica 220 V</button>
              <button type="button" data-tipo="tri">Trifásica 380 V</button>
            </div>
          </div>`
        ).join("")}
      </div>

      <button type="button" id="btn-verificar" class="btn-primario">Verificar</button>
      <div id="tri-resultado" class="resultado" aria-live="polite" hidden></div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const resultado = container.querySelector("#tri-resultado");

  container.querySelectorAll(".clasif-fila").forEach((fila) => {
    const botones = fila.querySelectorAll("button");
    botones.forEach((b) => {
      b.addEventListener("click", () => {
        eleccion[fila.dataset.art] = b.dataset.tipo;
        botones.forEach((x) => x.classList.remove("clasif-sel"));
        b.classList.add("clasif-sel");
        resultado.hidden = true;
      });
    });
  });

  container.querySelector("#btn-verificar").addEventListener("click", () => {
    const sinResp = ARTEFACTOS.filter((a) => !eleccion[a.id]);
    const errores = ARTEFACTOS.filter((a) => eleccion[a.id] && eleccion[a.id] !== a.tipo);

    resultado.hidden = false;
    if (sinResp.length) {
      resultado.className = "resultado";
      resultado.innerHTML = `<div class="resultado-cabecera"><span class="badge">Faltan respuestas</span>
        <p>Clasificá todos los artefactos.</p></div>`;
      return;
    }
    const ok = errores.length === 0;
    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;
    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${ok ? "✔ Todo correcto" : `✖ ${errores.length} error(es)`}</span>
        <p>${ok
          ? "La regla práctica: cargas grandes (motores de mucha potencia, ascensores, máquinas industriales) van en trifásica; el resto del hogar es monofásico."
          : "Revisá: " + errores.map((a) => `${a.nombre} es ${a.tipo === "tri" ? "trifásica" : "monofásica"}`).join("; ") + "."}</p>
      </div>`;
  });
}

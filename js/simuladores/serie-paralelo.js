// Simulador Circuitos serie vs. paralelo (spec 2.1).
// Tres lamparitas iguales. El alumno cambia la configuración y "quema" una para
// ver la diferencia: en serie, si una se abre cortan todas; en paralelo, las
// demás siguen. Muestra la resistencia equivalente en cada caso.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";

const V = 220; // tensión de alimentación
const R = 440; // resistencia de cada lamparita (Ω)
const N = 3;

const RECORDATORIO_SEGURIDAD =
  "Antes de tocar una lamparita o portalámparas: cortá la fase y verificá " +
  "ausencia de tensión. Que una boca esté apagada no garantiza que no tenga fase.";

export function render(container) {
  let config = "paralelo";
  let quemadas = new Set(); // índices de lámparas abiertas (quemadas)

  container.innerHTML = `
    <section class="sim">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Simulador: Serie vs. paralelo</h2>
      <p class="sim-intro">
        Tres lamparitas iguales (${R} Ω cada una) a ${V} V. Cambiá la configuración y hacé
        clic en una lamparita para "quemarla" (dejarla abierta). Observá qué pasa con el resto.
      </p>

      <div class="controles">
        <label>
          Configuración
          <select id="sel-config">
            <option value="paralelo">Paralelo</option>
            <option value="serie">Serie</option>
          </select>
        </label>
      </div>

      <div class="lamparas-fila" id="lamparas"></div>

      <div id="sp-resultado" class="resultado" aria-live="polite"></div>

      <div class="comparacion">
        <h3>Por qué pasa esto</h3>
        <p>
          En <strong>serie</strong> la corriente tiene un único camino: si una lamparita se abre,
          se corta todo el circuito. Además la resistencia equivalente es la <em>suma</em>
          (R<sub>eq</sub> = R₁+R₂+R₃), así que con más lámparas circula menos corriente y alumbran menos.
          En <strong>paralelo</strong> cada lamparita tiene su propio camino a ${V} V: son independientes
          y R<sub>eq</sub> = 1 / (1/R₁+1/R₂+1/R₃).
        </p>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const selConfig = container.querySelector("#sel-config");
  const fila = container.querySelector("#lamparas");
  const resultado = container.querySelector("#sp-resultado");

  function calcular() {
    const activas = N - quemadas.size;
    if (config === "serie") {
      // Si hay al menos una quemada, el circuito se abre: no circula corriente.
      const abierto = quemadas.size > 0;
      const Req = N * R; // equivalente con todas sanas
      const I = abierto ? 0 : V / Req;
      return { abierto, Req, I, encendidas: abierto ? [] : [0, 1, 2] };
    }
    // Paralelo: cada rama sana conduce; las quemadas no.
    const encendidas = [0, 1, 2].filter((i) => !quemadas.has(i));
    const Req = activas > 0 ? R / activas : Infinity;
    const I = activas > 0 ? V / (R / activas) : 0; // I total = suma de ramas
    return { abierto: false, Req, I, encendidas };
  }

  function pintarLamparas(encendidas) {
    fila.innerHTML = [0, 1, 2]
      .map((i) => {
        const quemada = quemadas.has(i);
        const on = encendidas.includes(i);
        const estado = quemada ? "quemada" : on ? "on" : "off";
        return `
          <button type="button" class="lampara-item lampara-item--${estado}" data-i="${i}"
            title="${quemada ? "Reparar" : "Quemar"} lamparita ${i + 1}">
            <span class="lampara-item-icono">${quemada ? "💥" : "💡"}</span>
            <span class="lampara-item-label">L${i + 1}${quemada ? " (abierta)" : on ? "" : " (apagada)"}</span>
          </button>`;
      })
      .join("");
    fila.querySelectorAll(".lampara-item").forEach((b) => {
      b.addEventListener("click", () => {
        const i = Number(b.dataset.i);
        if (quemadas.has(i)) quemadas.delete(i);
        else quemadas.add(i);
        actualizar();
      });
    });
  }

  function actualizar() {
    const r = calcular();
    pintarLamparas(r.encendidas);

    const ok = r.encendidas.length > 0;
    const ReqTxt = r.Req === Infinity ? "∞" : `${Math.round(r.Req)} Ω`;
    resultado.className = `resultado ${ok ? "resultado--ok" : "resultado--falla"}`;

    let mensaje;
    if (config === "serie" && r.abierto) {
      mensaje =
        "En serie, al quemarse una lamparita se abre el único camino de la corriente: " +
        "<strong>se apagan todas</strong>. Es el clásico de las viejas guirnaldas navideñas.";
    } else if (config === "serie") {
      mensaje =
        `En serie las tres comparten la corriente (${(r.I * 1000).toFixed(0)} mA). ` +
        "Alumbran, pero más débil que en paralelo, porque la tensión se reparte entre las tres.";
    } else if (r.encendidas.length === N) {
      mensaje = "En paralelo cada lamparita recibe los 220 V completos y son independientes.";
    } else if (ok) {
      mensaje =
        `En paralelo, las quemadas se apagan pero <strong>las demás siguen encendidas</strong> ` +
        `(${r.encendidas.length} de ${N}). Cada una mantiene sus 220 V.`;
    } else {
      mensaje = "Se quemaron las tres: no queda ninguna rama conduciendo.";
    }

    resultado.innerHTML = `
      <div class="resultado-cabecera">
        <span class="badge">${config === "serie" && r.abierto ? "Circuito abierto" : ok ? "Encendidas: " + r.encendidas.length + "/" + N : "Todo apagado"}</span>
        <p>${mensaje}</p>
      </div>
      <div class="valores">
        <span>Configuración: <strong>${config}</strong></span>
        <span>R equivalente: <strong>${ReqTxt}</strong></span>
        <span>Corriente total: <strong>${(r.I * 1000).toFixed(0)} mA</strong></span>
      </div>`;
  }

  selConfig.addEventListener("change", () => {
    config = selConfig.value;
    actualizar();
  });
  actualizar();
}

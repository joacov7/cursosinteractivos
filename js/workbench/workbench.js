// Banco de trabajo: lienzo interactivo para armar un circuito.
// SVG + pointer events (mouse y touch), sin dependencias ni build.
// Arrastrás componentes, los cableás borne a borne y el motor evalúa en vivo si
// el circuito está seguro, en sobrecarga o si salta la térmica, con efectos.

import { AVISO_EDUCATIVO } from "../../data/curricula.js";
import {
  CABLES, TERMICAS, CARGAS, NODO_W, NODO_H, GRID,
  crearNodo, crearEdge, idGlobalPuerto, posPuerto, snap,
} from "./modelo.js";
import { evaluarCircuito } from "./motor.js";

const RECORDATORIO_SEGURIDAD =
  "Este es un banco de pruebas virtual. En una instalación real, cada tramo se " +
  "calcula y se verifica sin tensión; nunca se energiza un circuito sin protección.";

export function render(container) {
  /** @type {{nodes:any[], edges:any[]}} */
  const estado = { nodes: [], edges: [] };
  let seleccion = null; // { clase:"node"|"edge", id }
  let inter = null; // interacción en curso

  container.innerHTML = `
    <section class="sim wb">
      <div class="aviso-seguridad" role="note">
        <strong>Seguridad primero.</strong> ${RECORDATORIO_SEGURIDAD}
      </div>

      <h2>Banco de trabajo: armá el circuito</h2>
      <p class="sim-intro">
        Agregá una <strong>fuente</strong>, una <strong>térmica</strong> y una <strong>carga</strong>,
        arrastralos y uní los bornes (rojo = fase, azul = neutro) para cerrar el circuito.
        El resultado se calcula solo.
      </p>

      <div class="wb-toolbar">
        <button type="button" data-add="fuente">+ Fuente 220V</button>
        <button type="button" data-add="termica">+ Térmica</button>
        <button type="button" data-add="carga">+ Carga</button>
        <button type="button" id="wb-ejemplo">Cargar ejemplo</button>
        <button type="button" id="wb-limpiar">Limpiar</button>
      </div>

      <div class="wb-lienzo-wrap">
        <svg id="wb-svg" class="wb-svg" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>

      <div class="wb-abajo">
        <div id="wb-props" class="wb-props"></div>
        <div id="wb-estado" class="resultado wb-estado" aria-live="polite"></div>
      </div>

      <p class="cierre-educativo">${AVISO_EDUCATIVO}</p>
    </section>
  `;

  const svg = container.querySelector("#wb-svg");
  const panelProps = container.querySelector("#wb-props");
  const panelEstado = container.querySelector("#wb-estado");

  // ── Helpers de geometría ──────────────────────────────────────────
  const nodo = (id) => estado.nodes.find((n) => n.id === id);
  function posGlobal(gid) {
    const [nid, pid] = gid.split(":");
    const n = nodo(nid);
    if (!n) return { x: 0, y: 0 };
    const p = n.ports.find((x) => x.id === pid);
    return posPuerto(n, p);
  }
  function svgXY(ev) {
    const r = svg.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }
  function pathCable(x1, y1, x2, y2) {
    const dx = Math.max(40, Math.abs(x2 - x1) / 2);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  // ── Alta de nodos ─────────────────────────────────────────────────
  function agregar(tipo) {
    const n = estado.nodes.length;
    const nodoNuevo = crearNodo(tipo, 60 + (n % 3) * 180, 60 + Math.floor(n / 3) * 100);
    estado.nodes.push(nodoNuevo);
    seleccion = { clase: "node", id: nodoNuevo.id };
    pintar();
  }

  function cargarEjemplo() {
    estado.nodes = [];
    estado.edges = [];
    const f = crearNodo("fuente", 40, 80);
    const t = crearNodo("termica", 260, 80);
    t.props.corriente = 16;
    const c = crearNodo("carga", 480, 80);
    c.props = { potencia: CARGAS[2].potencia, nombre: CARGAS[2].nombre };
    estado.nodes.push(f, t, c);
    estado.edges.push(crearEdge(idGlobalPuerto(f.id, "F"), idGlobalPuerto(t.id, "in"), 2.5));
    estado.edges.push(crearEdge(idGlobalPuerto(t.id, "out"), idGlobalPuerto(c.id, "F"), 2.5));
    estado.edges.push(crearEdge(idGlobalPuerto(c.id, "N"), idGlobalPuerto(f.id, "N"), 2.5));
    seleccion = null;
    pintar();
  }

  function eliminarSeleccion() {
    if (!seleccion) return;
    if (seleccion.clase === "node") {
      estado.nodes = estado.nodes.filter((n) => n.id !== seleccion.id);
      estado.edges = estado.edges.filter(
        (e) => !e.desde.startsWith(seleccion.id + ":") && !e.hasta.startsWith(seleccion.id + ":")
      );
    } else {
      estado.edges = estado.edges.filter((e) => e.id !== seleccion.id);
    }
    seleccion = null;
    pintar();
  }

  // ── Render ────────────────────────────────────────────────────────
  function pintar() {
    const r = evaluarCircuito(estado.nodes, estado.edges);
    const hot = r.estado === "sobrecarga";
    const activos = new Set(r.edgesActivos);

    const edgesSvg = estado.edges
      .map((e) => {
        const a = posGlobal(e.desde);
        const b = posGlobal(e.hasta);
        const clase = ["wb-edge"];
        if (hot && activos.has(e.id)) clase.push("wb-edge--hot");
        if (seleccion && seleccion.clase === "edge" && seleccion.id === e.id) clase.push("wb-edge--sel");
        return `<path d="${pathCable(a.x, a.y, b.x, b.y)}" class="${clase.join(" ")}"
                  data-edge="${e.id}" fill="none" />
                <text class="wb-edge-lbl" x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 6}">${e.mm2} mm²</text>`;
      })
      .join("");

    // Humo sobre los tramos sobrecargados.
    const humo = hot
      ? estado.edges
          .filter((e) => activos.has(e.id))
          .map((e) => {
            const a = posGlobal(e.desde);
            const b = posGlobal(e.hasta);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return [0, 1, 2]
              .map(
                (i) =>
                  `<circle class="wb-humo" cx="${mx}" cy="${my}" r="${5 + i}" style="animation-delay:${i * 0.4}s"></circle>`
              )
              .join("");
          })
          .join("")
      : "";

    const nodesSvg = estado.nodes.map((n) => nodoSvg(n, r)).join("");

    svg.innerHTML = `
      <defs>
        <pattern id="wb-grid" width="${GRID}" height="${GRID}" patternUnits="userSpaceOnUse">
          <path d="M ${GRID} 0 L 0 0 0 ${GRID}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wb-grid)" data-fondo="1"></rect>
      <g class="wb-edges">${edgesSvg}</g>
      <g class="wb-humos">${humo}</g>
      <path id="wb-temp" class="wb-edge wb-edge--temp" fill="none" d="" style="display:none"></path>
      <g class="wb-nodes">${nodesSvg}</g>
    `;

    pintarProps();
    pintarEstado(r);
  }

  function nodoSvg(n, r) {
    const sel = seleccion && seleccion.clase === "node" && seleccion.id === n.id;
    const tripped = r.estado === "salta" && r.termicasActivas.includes(n.id);
    let titulo = "";
    let sub = "";
    if (n.tipo === "fuente") { titulo = "⎓ Fuente"; sub = "220 V"; }
    if (n.tipo === "termica") { titulo = "Térmica"; sub = `${n.props.corriente} A`; }
    if (n.tipo === "carga") { titulo = n.props.nombre || "Carga"; sub = `${n.props.potencia} W`; }

    const ports = n.ports
      .map((p) => {
        const pos = posPuerto(n, p);
        return `<circle class="wb-port wb-port--${p.tipo}" cx="${pos.x}" cy="${pos.y}" r="7"
                  data-port="${idGlobalPuerto(n.id, p.id)}"></circle>`;
      })
      .join("");

    const lever =
      n.tipo === "termica"
        ? `<line class="wb-lever ${tripped ? "wb-lever--off" : ""}"
             x1="${n.x + NODO_W / 2}" y1="${n.y + 12}"
             x2="${n.x + NODO_W / 2 + (tripped ? 12 : 0)}" y2="${n.y + (tripped ? 26 : 4)}"></line>`
        : "";

    return `
      <g class="wb-node wb-node--${n.tipo} ${sel ? "wb-node--sel" : ""} ${tripped ? "wb-node--tripped" : ""}"
         data-node="${n.id}">
        <rect x="${n.x}" y="${n.y}" width="${NODO_W}" height="${NODO_H}" rx="8" class="wb-node-box"></rect>
        <text class="wb-node-t" x="${n.x + NODO_W / 2}" y="${n.y + 26}">${titulo}</text>
        <text class="wb-node-s" x="${n.x + NODO_W / 2}" y="${n.y + 45}">${sub}</text>
        ${lever}
        ${ports}
      </g>`;
  }

  function pintarProps() {
    if (!seleccion) {
      panelProps.innerHTML = `<p class="wb-hint">Tip: tocá un componente o un cable para editarlo. Arrastrá desde un borne para cablear.</p>`;
      return;
    }
    let campos = "";
    if (seleccion.clase === "node") {
      const n = nodo(seleccion.id);
      if (!n) { seleccion = null; return pintarProps(); }
      if (n.tipo === "termica") {
        campos = selectHTML("Corriente de la térmica", "prop-termica",
          TERMICAS.map((a) => [a, `${a} A`]), n.props.corriente);
      } else if (n.tipo === "carga") {
        campos = selectHTML("Carga", "prop-carga",
          CARGAS.map((c) => [c.potencia, `${c.nombre} — ${(c.potencia / 220).toFixed(1)} A`]), n.props.potencia);
      } else {
        campos = `<p class="wb-hint">Fuente monofásica de 220 V.</p>`;
      }
    } else {
      const e = estado.edges.find((x) => x.id === seleccion.id);
      if (!e) { seleccion = null; return pintarProps(); }
      campos = selectHTML("Sección del cable", "prop-cable",
        CABLES.map((c) => [c.mm2, `${c.mm2} mm² — ${c.capacidadA} A`]), e.mm2);
    }
    panelProps.innerHTML = `
      <div class="wb-props-fila">${campos}
        <button type="button" id="wb-eliminar">Eliminar</button>
      </div>`;

    const sel = panelProps.querySelector("select");
    if (sel) sel.addEventListener("change", () => aplicarProp(sel.dataset.k, Number(sel.value)));
    panelProps.querySelector("#wb-eliminar").addEventListener("click", eliminarSeleccion);
  }

  function aplicarProp(k, valor) {
    if (k === "prop-termica") nodo(seleccion.id).props.corriente = valor;
    if (k === "prop-carga") {
      const n = nodo(seleccion.id);
      const c = CARGAS.find((x) => x.potencia === valor);
      n.props = { potencia: valor, nombre: c ? c.nombre : "Carga" };
    }
    if (k === "prop-cable") {
      const e = estado.edges.find((x) => x.id === seleccion.id);
      const c = CABLES.find((x) => x.mm2 === valor);
      e.mm2 = c.mm2; e.capacidadA = c.capacidadA;
    }
    pintar();
  }

  function pintarEstado(r) {
    const map = {
      incompleto: ["Circuito incompleto", "Uní fuente → térmica → carga y cerrá el neutro para que circule corriente."],
      seguro: ["✔ Seguro", "La carga entra en el cable y la térmica lo protege. Así se dimensiona bien."],
      sobrecarga: ["✖ Sobrecarga", "La corriente supera la capacidad del cable: se calienta y humea. Faltó una protección adecuada."],
      salta: ["⚡ Salta la térmica", "La térmica corta porque la corriente supera su valor: protege el circuito."],
    };
    const [badge, msg] = map[r.estado] || map.incompleto;
    const clase =
      r.estado === "seguro" ? "resultado--ok" :
      r.estado === "incompleto" ? "" : "resultado--falla";
    panelEstado.className = `resultado wb-estado ${clase}`;
    panelEstado.innerHTML = `
      <div class="resultado-cabecera"><span class="badge">${badge}</span><p>${msg}</p></div>
      ${r.estado === "incompleto" ? "" : `<div class="valores">
        <span>Corriente: <strong>${r.I} A</strong></span>
        <span>Cable: <strong>${r.capCable ?? "—"} A</strong></span>
        <span>Térmica: <strong>${r.breaker ?? "sin protección"}${r.breaker ? " A" : ""}</strong></span>
      </div>`}
      ${r.warnings.length ? `<ul class="problemas">${r.warnings
        .map((w) => `<li class="problema problema--peligro"><span class="problema-detalle">${w}</span></li>`).join("")}</ul>` : ""}`;
  }

  // ── Interacción (pointer) ─────────────────────────────────────────
  svg.addEventListener("pointerdown", (ev) => {
    const t = ev.target;
    const gStart = svgXY(ev);
    svg.setPointerCapture(ev.pointerId);

    if (t.dataset.port) {
      inter = { modo: "wire", desde: t.dataset.port, moved: false };
      const p = posGlobal(t.dataset.port);
      const temp = svg.querySelector("#wb-temp");
      temp.style.display = "";
      temp.setAttribute("d", pathCable(p.x, p.y, gStart.x, gStart.y));
      return;
    }
    const gNode = t.closest("[data-node]");
    if (gNode) {
      const n = nodo(gNode.dataset.node);
      inter = { modo: "drag", id: n.id, offx: gStart.x - n.x, offy: gStart.y - n.y, moved: false, start: gStart };
      return;
    }
    const eEl = t.closest("[data-edge]");
    if (eEl) { inter = { modo: "edge", id: eEl.dataset.edge, moved: false, start: gStart }; return; }
    // fondo: deseleccionar
    inter = { modo: "fondo", moved: false };
  });

  svg.addEventListener("pointermove", (ev) => {
    if (!inter) return;
    const g = svgXY(ev);
    inter.moved = inter.moved || (inter.start && Math.hypot(g.x - inter.start.x, g.y - inter.start.y) > 4) || inter.modo === "wire";

    if (inter.modo === "wire") {
      const p = posGlobal(inter.desde);
      svg.querySelector("#wb-temp").setAttribute("d", pathCable(p.x, p.y, g.x, g.y));
    } else if (inter.modo === "drag") {
      const n = nodo(inter.id);
      n.x = snap(g.x - inter.offx);
      n.y = snap(g.y - inter.offy);
      pintar();
    }
  });

  svg.addEventListener("pointerup", (ev) => {
    if (!inter) return;
    if (inter.modo === "wire") {
      const destino = document.elementFromPoint(ev.clientX, ev.clientY);
      const gid = destino && destino.dataset ? destino.dataset.port : null;
      if (gid && gid.split(":")[0] !== inter.desde.split(":")[0]) {
        estado.edges.push(crearEdge(inter.desde, gid, 2.5));
      }
      inter = null;
      pintar();
      return;
    }
    if (!inter.moved) {
      // click: seleccionar
      if (inter.modo === "drag") seleccion = { clase: "node", id: inter.id };
      else if (inter.modo === "edge") seleccion = { clase: "edge", id: inter.id };
      else seleccion = null;
    }
    inter = null;
    pintar();
  });

  // ── Toolbar ───────────────────────────────────────────────────────
  container.querySelectorAll("[data-add]").forEach((b) =>
    b.addEventListener("click", () => agregar(b.dataset.add))
  );
  container.querySelector("#wb-ejemplo").addEventListener("click", cargarEjemplo);
  container.querySelector("#wb-limpiar").addEventListener("click", () => {
    estado.nodes = []; estado.edges = []; seleccion = null; pintar();
  });

  cargarEjemplo(); // arranca con un circuito de ejemplo funcionando
}

// Genera un <label><select> con opciones [valor, etiqueta] y el valor activo.
function selectHTML(label, key, opciones, actual) {
  return `<label>${label}
    <select data-k="${key}">
      ${opciones.map(([v, t]) => `<option value="${v}" ${v === actual ? "selected" : ""}>${t}</option>`).join("")}
    </select>
  </label>`;
}

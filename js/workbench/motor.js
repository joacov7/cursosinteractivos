// Motor didáctico del banco de trabajo.
// Evalúa caminos eléctricos en un grafo de bornes. El modelo representa una
// fuente monofásica, cargas y térmicas ideales; no reemplaza un cálculo normativo.

import { TENSION, idGlobalPuerto } from "./modelo.js";

function adyacencia(nodes, edges, termicaExcluida = null) {
  const ady = new Map();
  const add = (a, b, dato) => {
    if (!ady.has(a)) ady.set(a, []);
    ady.get(a).push({ to: b, ...dato });
  };

  for (const e of edges) {
    add(e.desde, e.hasta, { edgeId: e.id, capacidadA: e.capacidadA });
    add(e.hasta, e.desde, { edgeId: e.id, capacidadA: e.capacidadA });
  }

  for (const n of nodes) {
    if (n.tipo !== "termica" || n.id === termicaExcluida) continue;
    const gin = idGlobalPuerto(n.id, "in");
    const gout = idGlobalPuerto(n.id, "out");
    add(gin, gout, { thermalId: n.id });
    add(gout, gin, { thermalId: n.id });
  }
  return ady;
}

function camino(ady, origen, destino) {
  const cola = [origen];
  const previo = new Map([[origen, null]]);
  while (cola.length) {
    const actual = cola.shift();
    if (actual === destino) break;
    for (const paso of ady.get(actual) || []) {
      if (!previo.has(paso.to)) {
        previo.set(paso.to, { desde: actual, ...paso });
        cola.push(paso.to);
      }
    }
  }
  if (!previo.has(destino)) return null;
  const pasos = [];
  let actual = destino;
  while (actual !== origen) {
    const p = previo.get(actual);
    pasos.push(p);
    actual = p.desde;
  }
  return pasos.reverse();
}

function termicaEnSerie(nodes, edges, origen, destino, termicas) {
  const base = adyacencia(nodes, edges);
  const caminoBase = camino(base, origen, destino);
  if (!caminoBase) return [];
  return termicas.filter((t) => {
    const sinTermica = adyacencia(nodes, edges, t.id);
    return camino(sinTermica, origen, destino) === null;
  });
}

/**
 * Resultado:
 * incompleto | seguro | inseguro | sobrecarga | salta
 *
 * Las capacidades de CABLES son valores didácticos simplificados. No consideran
 * método de instalación, material, aislación, temperatura, agrupamiento ni caída.
 */
export function evaluarCircuito(nodes, edges) {
  const fuente = nodes.find((n) => n.tipo === "fuente");
  const cargas = nodes.filter((n) => n.tipo === "carga");
  const base = {
    estado: "incompleto", I: 0, capCable: null, breaker: null,
    warnings: [], edgesActivos: [], termicasActivas: [],
    potenciaTotalW: 0, cargasConectadas: [],
  };
  if (!fuente || !cargas.length || !edges.length) return base;

  const fF = idGlobalPuerto(fuente.id, "F");
  const fN = idGlobalPuerto(fuente.id, "N");
  const termicas = nodes.filter((n) => n.tipo === "termica");
  const edgesPorId = new Map(edges.map((e) => [e.id, e]));
  const caminosCarga = [];

  for (const carga of cargas) {
    const cF = idGlobalPuerto(carga.id, "F");
    const cN = idGlobalPuerto(carga.id, "N");
    const fase = camino(adyacencia(nodes, edges), fF, cF);
    const neutro = camino(adyacencia(nodes, edges), cN, fN);
    if (!fase || !neutro) continue;
    const protecciones = termicaEnSerie(nodes, edges, fF, cF, termicas);
    caminosCarga.push({ carga, fase, neutro, protecciones });
  }

  if (!caminosCarga.length) return base;

  const I = caminosCarga.reduce((s, x) => s + Number(x.carga.props.potencia || 0) / TENSION, 0);
  const activos = new Set();
  const termicasActivas = new Set();
  let capCable = Infinity;
  let breaker = Infinity;
  let sinProteccionSerie = false;

  for (const x of caminosCarga) {
    for (const paso of [...x.fase, ...x.neutro]) {
      if (paso.edgeId) {
        activos.add(paso.edgeId);
        const edge = edgesPorId.get(paso.edgeId);
        if (edge && Number.isFinite(edge.capacidadA)) capCable = Math.min(capCable, edge.capacidadA);
      }
    }
    if (!x.protecciones.length) {
      sinProteccionSerie = true;
    } else {
      for (const t of x.protecciones) {
        termicasActivas.add(t.id);
        breaker = Math.min(breaker, Number(t.props.corriente));
      }
    }
  }

  if (!Number.isFinite(capCable)) capCable = null;
  if (!Number.isFinite(breaker)) breaker = null;

  const warnings = [];
  if (sinProteccionSerie || breaker === null) {
    warnings.push("No hay una térmica en serie que proteja la fase de todas las cargas.");
  }
  if (breaker !== null && capCable !== null && breaker > capCable) {
    warnings.push(`La térmica (${breaker} A) supera la capacidad del cable (${capCable} A): no lo protege.`);
  }

  let estado = "seguro";
  if (capCable === null) {
    estado = "incompleto";
  } else if (I > capCable && (sinProteccionSerie || breaker === null || breaker > capCable)) {
    estado = "sobrecarga";
  } else if (breaker !== null && I > breaker) {
    estado = "salta";
  } else if (sinProteccionSerie || breaker === null || breaker > capCable) {
    estado = "inseguro";
  }

  return {
    estado,
    I: Math.round(I * 10) / 10,
    capCable,
    breaker,
    warnings,
    edgesActivos: [...activos],
    termicasActivas: [...termicasActivas],
    potenciaTotalW: caminosCarga.reduce((s, x) => s + Math.max(0, Number(x.carga.props.potencia) || 0), 0),
    cargasConectadas: caminosCarga.map((x) => ({ id: x.carga.id, nombre: x.carga.props.nombre || "Carga", potenciaW: Math.max(0, Number(x.carga.props.potencia) || 0) })),
  };
}

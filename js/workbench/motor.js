// Motor de cálculo eléctrico del banco de trabajo.
// Reutiliza las reglas del simulador Cable + Térmica (I = P/V, ampacidad del
// cable, dimensionamiento de la térmica) sobre el grafo Node/Port/Edge.
//
// Estados posibles del circuito:
//   incompleto  - no hay un lazo fuente → carga → fuente
//   seguro      - la carga entra en el cable y la protección es correcta
//   sobrecarga  - la corriente supera la capacidad del cable (se calienta/humea)
//   salta       - la térmica corta antes (protege) porque I supera su corriente

import { TENSION, idGlobalPuerto } from "./modelo.js";

// Construye la lista de adyacencia entre bornes (grafo no dirigido).
function adyacencia(nodes, edges) {
  const ady = new Map();
  const add = (a, b) => {
    if (!ady.has(a)) ady.set(a, new Set());
    ady.get(a).add(b);
  };
  // Conexiones dibujadas (cables).
  for (const e of edges) {
    add(e.desde, e.hasta);
    add(e.hasta, e.desde);
  }
  // Paso interno de la térmica: la corriente atraviesa de "in" a "out".
  for (const n of nodes) {
    if (n.tipo === "termica") {
      const gin = idGlobalPuerto(n.id, "in");
      const gout = idGlobalPuerto(n.id, "out");
      add(gin, gout);
      add(gout, gin);
    }
  }
  return ady;
}

function alcanzables(ady, origen) {
  const visto = new Set([origen]);
  const cola = [origen];
  while (cola.length) {
    const actual = cola.shift();
    for (const sig of ady.get(actual) || []) {
      if (!visto.has(sig)) {
        visto.add(sig);
        cola.push(sig);
      }
    }
  }
  return visto;
}

/**
 * Evalúa el circuito armado.
 * @param {Node[]} nodes
 * @param {Edge[]} edges
 * @returns {{estado:string, I:number, capCable:number|null, breaker:number|null,
 *            warnings:string[], edgesActivos:string[], termicasActivas:string[]}}
 */
export function evaluarCircuito(nodes, edges) {
  const fuente = nodes.find((n) => n.tipo === "fuente");
  const cargas = nodes.filter((n) => n.tipo === "carga");
  const base = { estado: "incompleto", I: 0, capCable: null, breaker: null, warnings: [], edgesActivos: [], termicasActivas: [] };

  if (!fuente || cargas.length === 0 || edges.length === 0) return base;

  const ady = adyacencia(nodes, edges);
  const fF = idGlobalPuerto(fuente.id, "F");
  const fN = idGlobalPuerto(fuente.id, "N");
  const desdeF = alcanzables(ady, fF);
  const desdeN = alcanzables(ady, fN);

  // Cargas energizadas: su F llega a la fase de la fuente y su N al neutro.
  const energizadas = cargas.filter(
    (c) => desdeF.has(idGlobalPuerto(c.id, "F")) && desdeN.has(idGlobalPuerto(c.id, "N"))
  );
  if (energizadas.length === 0) return base;

  const I = energizadas.reduce((acc, c) => acc + c.props.potencia / TENSION, 0);

  // Cable limitante: la menor ampacidad entre los tramos dibujados.
  const capCable = Math.min(...edges.map((e) => e.capacidadA));

  // Térmica en la fase: aquella cuyos bornes in/out están en el lado de la fase.
  const termicasActivas = nodes
    .filter((n) => n.tipo === "termica")
    .filter((n) => desdeF.has(idGlobalPuerto(n.id, "in")) && desdeF.has(idGlobalPuerto(n.id, "out")));
  const breaker = termicasActivas.length
    ? Math.min(...termicasActivas.map((t) => t.props.corriente))
    : null;

  const warnings = [];
  if (breaker === null) warnings.push("No hay térmica protegiendo el circuito.");
  else if (breaker > capCable)
    warnings.push(`La térmica (${breaker} A) es mayor que la capacidad del cable (${capCable} A): no lo protege.`);

  let estado;
  if (breaker !== null && I > breaker) estado = "salta";
  else if (I > capCable) estado = "sobrecarga";
  else estado = "seguro";

  // Tramos "activos": los que conducen (todos los del lazo, MVP: todos).
  const edgesActivos = edges.map((e) => e.id);

  return {
    estado,
    I: Math.round(I * 10) / 10,
    capCable,
    breaker,
    warnings,
    edgesActivos,
    termicasActivas: termicasActivas.map((t) => t.id),
  };
}

// Modelo de datos del banco de trabajo (Node / Port / Edge).
// Vanilla JS con tipos documentados en JSDoc (sin build, mobile-friendly).
//
// @typedef {Object} Port
//   @property {string} id     - id local dentro del nodo ("F", "N", "in", "out")
//   @property {"F"|"N"} tipo  - fase o neutro (para colorear/validar)
//   @property {number} dx     - offset x del borne respecto de la esquina del nodo
//   @property {number} dy     - offset y del borne
//
// @typedef {Object} Node
//   @property {string} id
//   @property {"fuente"|"termica"|"carga"} tipo
//   @property {number} x       - esquina sup-izq (en px del lienzo, alineada a grilla)
//   @property {number} y
//   @property {Object} props   - tension | corriente | potencia según tipo
//   @property {Port[]} ports
//
// @typedef {Object} Edge
//   @property {string} id
//   @property {string} desde  - id global de borne "nodeId:portId"
//   @property {string} hasta
//   @property {number} mm2     - sección del cable elegido
//   @property {number} capacidadA - ampacidad de esa sección

export const TENSION = 220;
export const GRID = 20;

export const NODO_W = 104;
export const NODO_H = 64;

// Secciones de cable disponibles para los tramos (edges).
export const CABLES = [
  { mm2: 1.5, capacidadA: 10 },
  { mm2: 2.5, capacidadA: 16 },
  { mm2: 4, capacidadA: 25 },
  { mm2: 6, capacidadA: 32 },
];

// Térmicas comerciales para el nodo de protección.
export const TERMICAS = [10, 16, 32];

// Cargas típicas (potencia en W a 220 V).
export const CARGAS = [
  { nombre: "Lámparas", potencia: 400 },
  { nombre: "TV + equipos", potencia: 700 },
  { nombre: "Heladera + micro", potencia: 3080 },
  { nombre: "Termotanque", potencia: 4000 },
  { nombre: "Aire acondicionado", potencia: 4840 },
  { nombre: "Horno eléctrico", potencia: 6600 },
];

// Layout de bornes por tipo de nodo (offsets respecto de la esquina sup-izq).
const PUERTOS = {
  fuente: [
    { id: "F", tipo: "F", dx: NODO_W, dy: NODO_H * 0.33 },
    { id: "N", tipo: "N", dx: NODO_W, dy: NODO_H * 0.7 },
  ],
  termica: [
    { id: "in", tipo: "F", dx: 0, dy: NODO_H / 2 },
    { id: "out", tipo: "F", dx: NODO_W, dy: NODO_H / 2 },
  ],
  carga: [
    { id: "F", tipo: "F", dx: 0, dy: NODO_H * 0.33 },
    { id: "N", tipo: "N", dx: 0, dy: NODO_H * 0.7 },
  ],
};

const PROPS_DEFAULT = {
  fuente: { tension: TENSION },
  termica: { corriente: 16 },
  carga: { potencia: CARGAS[2].potencia, nombre: CARGAS[2].nombre },
};

let contador = 0;
export function nuevoId(prefijo = "n") {
  contador += 1;
  return `${prefijo}${contador}`;
}

export function snap(v) {
  return Math.round(v / GRID) * GRID;
}

/** @returns {Node} */
export function crearNodo(tipo, x, y) {
  return {
    id: nuevoId(tipo[0]),
    tipo,
    x: snap(x),
    y: snap(y),
    props: { ...PROPS_DEFAULT[tipo] },
    ports: PUERTOS[tipo].map((p) => ({ ...p })),
  };
}

export function idGlobalPuerto(nodeId, portId) {
  return `${nodeId}:${portId}`;
}

// Posición absoluta (centro) de un borne, para dibujar.
export function posPuerto(node, port) {
  return { x: node.x + port.dx, y: node.y + port.dy };
}

/** @returns {Edge} */
export function crearEdge(desde, hasta, mm2) {
  const cable = CABLES.find((c) => c.mm2 === mm2) || CABLES[0];
  return { id: nuevoId("e"), desde, hasta, mm2: cable.mm2, capacidadA: cable.capacidadA };
}

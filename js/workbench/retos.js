// Retos guiados del banco de trabajo.
// Cada reto tiene un objetivo y un validador puro que recibe el resultado del
// motor (r) más los nodos/edges actuales, y decide si está cumplido.
// `inicio`: cómo arranca el lienzo al entrar al reto ("vacio" o "ejemplo").

export const RETOS = [
  {
    id: "r1",
    titulo: "Cerrá el circuito",
    enunciado:
      "Agregá fuente, térmica y carga; uní la fase (bornes rojos) pasando por la térmica y el neutro (azules) directo. Lográ que el circuito quede SEGURO.",
    pista: "El neutro va de la carga a la fuente. La fase pasa por la térmica: fuente → térmica → carga.",
    inicio: "vacio",
    validar: (r) => r.estado === "seguro",
  },
  {
    id: "r2",
    titulo: "Hacé saltar la térmica",
    enunciado: "Elegí una carga y una térmica tales que la corriente supere el valor de la térmica y la haga saltar.",
    pista: "La térmica salta cuando la corriente supera su corriente nominal (ej.: carga de 30 A con térmica de 16 A).",
    inicio: "ejemplo",
    validar: (r) => r.estado === "salta",
  },
  {
    id: "r3",
    titulo: "Provocá una sobrecarga",
    enunciado:
      "Hacé que la corriente supere la capacidad del CABLE (se calienta y humea) sin que la térmica corte.",
    pista: "Poné una carga grande, un cable finito y una térmica más grande que el cable: así el cable se sobrecarga y la térmica no protege.",
    inicio: "ejemplo",
    validar: (r) => r.estado === "sobrecarga",
  },
  {
    id: "r4",
    titulo: "Protegé un horno de 6600 W",
    enunciado:
      "Armá un circuito SEGURO para un horno eléctrico (6600 W ≈ 30 A): elegí bien la sección del cable y la térmica.",
    pista: "30 A necesita cable de 6 mm² (soporta 32 A) y térmica de 32 A. La térmica nunca debe superar la capacidad del cable.",
    inicio: "ejemplo",
    validar: (r, nodes) =>
      r.estado === "seguro" && nodes.some((n) => n.tipo === "carga" && n.props.potencia >= 6600),
  },
  {
    id: "r5",
    titulo: "Protección correcta",
    enunciado:
      "Dejá el circuito SEGURO y bien protegido: con térmica, y que la térmica no sea mayor que la capacidad del cable (sin advertencias).",
    pista: "Tiene que haber una térmica y su valor no puede superar los amperios del cable elegido.",
    inicio: "ejemplo",
    validar: (r) => r.estado === "seguro" && r.breaker !== null && r.warnings.length === 0,
  },
];

// Persistencia de retos completados (conveniencia por-visitante).
const KEY = "cursos-interactivos:banco-retos";

export function leerCompletados() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY)) || []);
  } catch {
    return new Set();
  }
}

export function guardarCompletados(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* storage bloqueado: no persiste */
  }
}

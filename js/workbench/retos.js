// Retos guiados del banco de trabajo.
// Los validadores exigen un resultado del motor coherente con el objetivo.

export const RETOS = [
  {
    id: "r1",
    titulo: "Cerrá el circuito",
    enunciado: "Agregá fuente, térmica y carga; uní la fase pasando por la térmica y el neutro directo. Lográ que el circuito quede SEGURO.",
    pista: "La térmica debe quedar realmente en serie: fuente → térmica → carga. Un cable que la puentee no cuenta como protección.",
    inicio: "vacio",
    validar: (r) => r.estado === "seguro" && r.breaker !== null && r.warnings.length === 0,
  },
  {
    id: "r2",
    titulo: "Hacé saltar la térmica",
    enunciado: "Elegí una carga y una térmica en serie tales que la corriente supere el valor nominal de la térmica.",
    pista: "La térmica debe estar en el camino de fase, sin un cable que la puentee.",
    inicio: "ejemplo",
    validar: (r) => r.estado === "salta" && r.breaker !== null && r.termicasActivas.length > 0,
  },
  {
    id: "r3",
    titulo: "Provocá una sobrecarga",
    enunciado: "Hacé que la corriente supere la capacidad del cable sin que la térmica pueda protegerlo.",
    pista: "Elegí un cable de menor capacidad que la térmica y una carga que supere la capacidad del cable.",
    inicio: "ejemplo",
    validar: (r) => r.estado === "sobrecarga" && r.capCable !== null,
  },
  {
    id: "r4",
    titulo: "Protegé un horno de 6600 W",
    enunciado: "Armá un circuito didáctico para un horno de 6600 W y conseguí que la térmica proteja el cable.",
    pista: "En este modelo simplificado, usá cable de 6 mm² (32 A) y térmica de 32 A. En una instalación real se verifica la normativa y el método de instalación.",
    inicio: "ejemplo",
    validar: (r, nodes) =>
      r.estado === "seguro" && r.breaker !== null && r.warnings.length === 0 &&
      nodes.some((n) => n.tipo === "carga" && n.props.potencia >= 6600),
  },
  {
    id: "r5",
    titulo: "Protección correcta",
    enunciado: "Dejá el circuito SEGURO y bien protegido: la térmica debe estar en serie y no superar la capacidad del cable.",
    pista: "Una térmica que está dibujada pero puenteada no protege el circuito.",
    inicio: "ejemplo",
    validar: (r) => r.estado === "seguro" && r.breaker !== null && r.warnings.length === 0,
  },
];

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
    // El progreso sigue disponible durante esta sesión aunque storage esté bloqueado.
  }
}

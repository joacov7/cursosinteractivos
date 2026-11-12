// Lecturas del multímetro virtual. Modelo ideal y exclusivamente didáctico.
export function evaluarBloqueoMedicion(modo, fuenteEncendida) {
  if (fuenteEncendida && modo === "continuidad") {
    return "Desconectá la fuente antes de medir continuidad. La prueba queda bloqueada mientras el circuito está energizado.";
  }
  return "";
}
export function calcularLectura(resultado, modo, punto, nodes = []) {
  const fuente = nodes.some((n) => n.tipo === "fuente");
  const carga = nodes.some((n) => n.tipo === "carga");
  const energizado = ["seguro", "inseguro", "sobrecarga"].includes(resultado.estado);
  if (resultado.estado === "corto" && modo === "corriente") return { valor: "Icc: no modelada", detalle: "El ejercicio detecta el cortocircuito, pero no calcula corriente de falla: faltan impedancia de fuente y lazo, características del dispositivo y datos de instalación." };
  const disparada = resultado.estado === "salta";

  if (modo === "tension") {
    if (punto === "fuente") {
      return fuente
        ? { valor: "220,0 V~", detalle: "Tensión nominal ideal de la fuente del ejercicio." }
        : { valor: "— V", detalle: "No hay una fuente conectada en el banco." };
    }
    if (punto === "carga") {
      return carga && energizado
        ? { valor: "220,0 V~", detalle: "Tensión ideal en bornes de la carga mientras el circuito está energizado." }
        : { valor: "0,0 V~", detalle: disparada ? "La protección abrió el circuito en este modelo." : "No se establece tensión en la carga con el circuito abierto o incompleto." };
    }
    return { valor: energizado ? "220,0 V~" : "0,0 V~", detalle: "Lectura ideal entre fase y neutro del circuito." };
  }

  if (modo === "corriente") {
    if (!energizado && !disparada) return { valor: "0,0 A", detalle: "No circula corriente en el estado actual del modelo." };
    return {
      valor: `${Number(resultado.I || 0).toFixed(1).replace(".", ",")} A`,
      detalle: disparada
        ? "Corriente estimada de la carga antes de la apertura ideal de la térmica; no representa una curva de disparo."
        : "Corriente calculada como potencia total dividida por 220 V, bajo el supuesto ideal del ejercicio.",
    };
  }

  if (modo === "continuidad") {
    const hayCamino = Array.isArray(resultado.edgesActivos) && resultado.edgesActivos.length > 0;
    return hayCamino
      ? { valor: "CONTINUIDAD", detalle: "El modelo encuentra un camino eléctrico hacia una carga. No equivale a una prueba real de continuidad del conductor de protección." }
      : { valor: "ABIERTO", detalle: "El modelo no encuentra un camino completo hacia una carga." };
  }

  return { valor: "—", detalle: "Seleccioná una función de medición." };
}

/**
 * Construye una copia aislada del circuito para inyectar fallas sin alterar
 * el diseño original que el alumno está armando.
 */
export function crearEscenarioFalla(nodes, edges, falla, evaluar) {
  const copiaNodos = nodes.map((n) => ({ ...n, props: { ...n.props }, ports: (n.ports || []).map((p) => ({ ...p })) }));
  let copiaEdges = edges.map((e) => ({ ...e }));
  let edgeAbierto = null;
  let cortoDetectado = false;
  if (falla === "conductor-abierto") {
    const base = evaluar(copiaNodos, copiaEdges);
    edgeAbierto = base.edgesActivos[0] || null;
    if (edgeAbierto) copiaEdges = copiaEdges.filter((e) => e.id !== edgeAbierto);
  } else if (falla === "corto-fase-neutro") {
    const fuente = copiaNodos.find((n) => n.tipo === "fuente");
    if (fuente) {
      copiaEdges.push({ id: "falla-corto-fn", desde: `${fuente.id}:F`, hasta: `${fuente.id}:N`, mm2: 6, capacidadA: 32 });
      cortoDetectado = true;
    }
  } else if (falla === "puente-termica") {
    const fuente = copiaNodos.find((n) => n.tipo === "fuente");
    const carga = copiaNodos.find((n) => n.tipo === "carga");
    if (fuente && carga) copiaEdges.push({
      id: "falla-puente-termica", desde: `${fuente.id}:F`, hasta: `${carga.id}:F`,
      mm2: 6, capacidadA: 32,
    });
  }
  return { nodes: copiaNodos, edges: copiaEdges, edgeAbierto, cortoDetectado };
}

/**
 * Multímetro entre dos bornes. La topología se reduce a nodos conectados
 * idealmente; no modela impedancia, caída de tensión ni instrumentos reales.
 */
export function medirEntreBornes(nodes, edges, borneA, borneB, { energizada = true } = {}) {
  if (!borneA || !borneB) return { tension: "—", continuidad: "—", detalle: "Elegí los dos bornes de prueba." };
  const parent = new Map();
  const find = (x) => {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
    return parent.get(x);
  };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  for (const e of edges) union(e.desde, e.hasta);
  for (const n of nodes) {
    if (n.tipo === "termica") union(`${n.id}:in`, `${n.id}:out`);
  }
  const a = find(borneA), b = find(borneB);
  const fuente = nodes.find((n) => n.tipo === "fuente");
  if (!fuente) return { tension: "OL", continuidad: "ABIERTO", detalle: "No hay fuente en el banco." };
  const fase = find(`${fuente.id}:F`), neutro = find(`${fuente.id}:N`);
  const potencial = (grupo) => grupo === fase ? 220 : grupo === neutro ? 0 : null;
  const va = potencial(a), vb = potencial(b);
  const tension = !energizada ? "0,0 V~" : va === null || vb === null ? "OL" : `${Math.abs(va-vb).toFixed(1).replace(".", ",")} V~`;
  const continuidad = a === b ? "CONTINUIDAD" : "ABIERTO";
  return {
    tension, continuidad,
    detalle: !energizada
      ? "Fuente desconectada: no hay tensión de alimentación en el modelo. La continuidad se evalúa por separado."
      : tension === "OL"
        ? "Al menos una punta está en un nodo flotante o sin referencia en este modelo."
        : "Lectura ideal entre los bornes seleccionados; no contempla impedancias ni caída de tensión.",
  };
}

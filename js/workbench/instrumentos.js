// Lecturas del multímetro virtual. Modelo ideal y exclusivamente didáctico.
export function calcularLectura(resultado, modo, punto, nodes = []) {
  const fuente = nodes.some((n) => n.tipo === "fuente");
  const carga = nodes.some((n) => n.tipo === "carga");
  const energizado = ["seguro", "inseguro", "sobrecarga"].includes(resultado.estado);
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
  if (falla === "conductor-abierto") {
    const base = evaluar(copiaNodos, copiaEdges);
    edgeAbierto = base.edgesActivos[0] || null;
    if (edgeAbierto) copiaEdges = copiaEdges.filter((e) => e.id !== edgeAbierto);
  } else if (falla === "puente-termica") {
    const fuente = copiaNodos.find((n) => n.tipo === "fuente");
    const carga = copiaNodos.find((n) => n.tipo === "carga");
    if (fuente && carga) copiaEdges.push({
      id: "falla-puente-termica", desde: `${fuente.id}:F`, hasta: `${carga.id}:F`,
      mm2: 6, capacidadA: 32,
    });
  }
  return { nodes: copiaNodos, edges: copiaEdges, edgeAbierto };
}

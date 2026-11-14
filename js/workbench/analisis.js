// Cálculos complementarios del banco: estimaciones didácticas explícitas.
const RESISTIVIDAD = { cobre: 0.0175, aluminio: 0.0282 }; // ohm·mm²/m a 20 °C

export function calcularCaidaTension({ corrienteA, longitudM, seccionMm2, material = "cobre" } = {}) {
  const I = Number(corrienteA), L = Number(longitudM), S = Number(seccionMm2);
  const rho = RESISTIVIDAD[material];
  if (![I, L, S].every(Number.isFinite) || I < 0 || L <= 0 || S <= 0 || !rho) {
    return { valida: false, error: "Ingresá corriente válida, longitud mayor que cero, sección mayor que cero y material reconocido." };
  }
  const resistenciaIdaVuelta = (2 * L * rho) / S;
  const caidaV = I * resistenciaIdaVuelta;
  const porcentaje = (caidaV / 220) * 100;
  return {
    valida: true, resistenciaOhm: resistenciaIdaVuelta, caidaV, porcentaje,
    tensionEstimadaV: 220 - caidaV,
    advertencia: porcentaje >= 3
      ? "La caída estimada alcanza o supera el 3 % de la tensión nominal. Revisá el diseño completo y la normativa aplicable."
      : "La caída estimada es menor al 3 % en este escenario; esto no demuestra cumplimiento normativo."
  };
}

// Devuelve solo cargas que tienen camino completo fase-carga y carga-neutro-fuente.
export function diagnosticarCargasConectadas(nodes = [], edges = [], tensionV = 220) {
  const fuente = nodes.find(n => n.tipo === "fuente");
  if (!fuente) return { cargas: [], potenciaTotalW: 0, corrienteEstimadaA: 0 };
  const ady = new Map();
  const add = (a,b) => { if (!ady.has(a)) ady.set(a,[]); ady.get(a).push(b); };
  for (const e of edges) { add(e.desde,e.hasta); add(e.hasta,e.desde); }
  for (const n of nodes) if (n.tipo === "termica") {
    add(`${n.id}:in`,`${n.id}:out`); add(`${n.id}:out`,`${n.id}:in`);
  }
  const alcanza = (origen,destino) => {
    const vistos = new Set([origen]), cola = [origen];
    while (cola.length) {
      const actual = cola.shift();
      if (actual === destino) return true;
      for (const next of ady.get(actual) || []) if (!vistos.has(next)) { vistos.add(next); cola.push(next); }
    }
    return false;
  };
  const cargas = nodes.filter(n => n.tipo === "carga" &&
    alcanza(`${fuente.id}:F`,`${n.id}:F`) &&
    alcanza(`${n.id}:N`,`${fuente.id}:N`))
    .map(n => ({ id:n.id, nombre:n.props?.nombre || "Carga", potenciaW:Math.max(0,Number(n.props?.potencia)||0) }));
  const potenciaTotalW = cargas.reduce((sum,c)=>sum+c.potenciaW,0);
  return { cargas, potenciaTotalW, corrienteEstimadaA: tensionV > 0 ? potenciaTotalW/tensionV : 0 };
}

export function calcularConsumoEnergia(potenciaW, horas) {
  const p = Number(potenciaW), h = Number(horas);
  if (!Number.isFinite(p) || p < 0 || !Number.isFinite(h) || h < 0) return null;
  return (p / 1000) * h;
}


export function calcularDemandaSimultanea(potenciaInstaladaW, simultaneidadPct = 100) {
  const potencia = Number(potenciaInstaladaW), factor = Number(simultaneidadPct);
  if (!Number.isFinite(potencia) || potencia < 0 || !Number.isFinite(factor) || factor < 0 || factor > 100) return null;
  return potencia * factor / 100;
}

export function compararSecciones({ corrienteA, longitudM, material = "cobre", tensionV = 220, secciones = [1.5, 2.5, 4, 6, 10, 16] } = {}) {
  return secciones.map((seccionMm2) => {
    const resultado = calcularCaidaTension({ corrienteA, longitudM, seccionMm2, material });
    return { seccionMm2, ...resultado, tensionV };
  });
}

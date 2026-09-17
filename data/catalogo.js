// Catálogo de componentes — base de datos consultable dentro de la app.
// Cada componente incluye especificación técnica + para qué sirve + qué pasa
// si se usa mal + en qué nivel del curso se introduce (spec sección 4).

export const CATALOGO = [
  // ── Cables ──────────────────────────────────────────────────────────
  {
    id: "cable_1_5",
    categoria: "cables",
    nombre: "Cable unipolar 1.5 mm²",
    especificacion_tecnica: {
      seccion_mm2: 1.5,
      capacidad_A: 10,
      aislacion: "PVC",
      color_normalizado: "fase (marrón/negro/rojo), neutro (celeste), tierra (verde-amarillo)",
    },
    uso_correcto: "Circuitos de iluminación (bocas de luz).",
    riesgo_uso_incorrecto: "Si se usa para tomacorrientes de uso general se sobrecarga y la aislación se degrada por calor.",
    nivel_curso: "basico",
  },
  {
    id: "cable_2_5",
    categoria: "cables",
    nombre: "Cable unipolar 2.5 mm²",
    especificacion_tecnica: {
      seccion_mm2: 2.5,
      capacidad_A: 16,
      aislacion: "PVC",
      color_normalizado: "fase (marrón/negro/rojo), neutro (celeste), tierra (verde-amarillo)",
    },
    uso_correcto: "Circuitos de tomacorrientes de uso general.",
    riesgo_uso_incorrecto: "Sobrecalentamiento y falla de aislación si se usa en un circuito de mayor consumo.",
    nivel_curso: "basico",
  },
  {
    id: "cable_4",
    categoria: "cables",
    nombre: "Cable unipolar 4 mm²",
    especificacion_tecnica: {
      seccion_mm2: 4,
      capacidad_A: 25,
      aislacion: "PVC",
      color_normalizado: "fase (marrón/negro/rojo), neutro (celeste), tierra (verde-amarillo)",
    },
    uso_correcto: "Circuitos de tomas de uso especial (aire acondicionado, cocinas eléctricas).",
    riesgo_uso_incorrecto: "Sobredimensionar encarece la instalación; subdimensionar en cargas mayores recalienta el cable.",
    nivel_curso: "basico",
  },
  {
    id: "cable_6",
    categoria: "cables",
    nombre: "Cable unipolar 6 mm²",
    especificacion_tecnica: {
      seccion_mm2: 6,
      capacidad_A: 32,
      aislacion: "PVC",
      color_normalizado: "fase (marrón/negro/rojo), neutro (celeste), tierra (verde-amarillo)",
    },
    uso_correcto: "Alimentación de tableros seccionales y cargas de alta potencia.",
    riesgo_uso_incorrecto: "Usarlo donde no corresponde dificulta el conexionado; en cargas mayores no protege.",
    nivel_curso: "intermedio",
  },
  {
    id: "cable_10",
    categoria: "cables",
    nombre: "Cable unipolar 10 mm²",
    especificacion_tecnica: {
      seccion_mm2: 10,
      capacidad_A: 50,
      aislacion: "PVC",
      color_normalizado: "fase (marrón/negro/rojo), neutro (celeste), tierra (verde-amarillo)",
    },
    uso_correcto: "Acometida y alimentación general de tableros.",
    riesgo_uso_incorrecto: "Es rígido y caro para circuitos chicos; el error frecuente es subdimensionar la acometida.",
    nivel_curso: "intermedio",
  },
  {
    id: "cable_bipolar_prolongacion",
    categoria: "cables",
    nombre: "Cable bipolar/tripolar para prolongación",
    especificacion_tecnica: {
      seccion_mm2: 2.5,
      capacidad_A: 16,
      aislacion: "PVC doble vaina",
      color_normalizado: "conductores individuales según norma dentro de la vaina",
    },
    uso_correcto: "Prolongaciones y conexión de artefactos móviles (no instalación fija embutida).",
    riesgo_uso_incorrecto: "Usarlo como instalación fija embutida no cumple norma y dificulta el mantenimiento.",
    nivel_curso: "basico",
  },

  // ── Protecciones ────────────────────────────────────────────────────
  {
    id: "termica_curva_b",
    categoria: "protecciones",
    nombre: "Térmica (breaker) curva B",
    especificacion_tecnica: {
      curva: "B",
      corrientes_tipicas_A: [6, 10, 16, 20, 25],
      disparo_magnetico: "3 a 5 veces la corriente nominal",
    },
    uso_correcto: "Circuitos resistivos y de iluminación (baja corriente de arranque).",
    riesgo_uso_incorrecto: "En circuitos con motores puede disparar de forma molesta en cada arranque.",
    nivel_curso: "intermedio",
  },
  {
    id: "termica_curva_c",
    categoria: "protecciones",
    nombre: "Térmica (breaker) curva C",
    especificacion_tecnica: {
      curva: "C",
      corrientes_tipicas_A: [6, 10, 16, 20, 25, 32],
      disparo_magnetico: "5 a 10 veces la corriente nominal",
    },
    uso_correcto: "Circuitos mixtos y pequeños motores (uso doméstico general).",
    riesgo_uso_incorrecto: "En cargas puramente resistivas conviene curva B; en motores grandes puede no arrancar bien.",
    nivel_curso: "basico",
  },
  {
    id: "termica_curva_d",
    categoria: "protecciones",
    nombre: "Térmica (breaker) curva D",
    especificacion_tecnica: {
      curva: "D",
      corrientes_tipicas_A: [16, 20, 25, 32, 40],
      disparo_magnetico: "10 a 20 veces la corriente nominal",
    },
    uso_correcto: "Motores grandes y cargas con alta corriente de arranque.",
    riesgo_uso_incorrecto: "En circuitos domésticos comunes es demasiado tolerante y no protege bien.",
    nivel_curso: "avanzado",
  },
  {
    id: "diferencial_30ma",
    categoria: "protecciones",
    nombre: "Disyuntor diferencial 30 mA",
    especificacion_tecnica: {
      sensibilidad_mA: 30,
      tiempo_disparo: "milisegundos ante fuga a tierra",
      protege: "personas",
    },
    uso_correcto: "Protección de personas en instalaciones domésticas (obligatorio en el tablero).",
    riesgo_uso_incorrecto: "No reemplaza a la térmica: no protege al cable contra sobrecarga ni cortocircuito.",
    nivel_curso: "intermedio",
  },
  {
    id: "diferencial_300ma",
    categoria: "protecciones",
    nombre: "Disyuntor diferencial 300 mA",
    especificacion_tecnica: {
      sensibilidad_mA: 300,
      tiempo_disparo: "milisegundos ante fuga a tierra",
      protege: "instalación (protección contra incendios)",
    },
    uso_correcto: "Protección general en industria y protección contra incendios.",
    riesgo_uso_incorrecto: "No protege personas con la sensibilidad de 30 mA; no usar como único diferencial doméstico.",
    nivel_curso: "avanzado",
  },
  {
    id: "protector_termico_motor",
    categoria: "protecciones",
    nombre: "Protector térmico de motor (relé térmico)",
    especificacion_tecnica: {
      ajuste: "según corriente nominal del motor",
      protege: "el bobinado del motor contra sobrecarga",
    },
    uso_correcto: "Protección de motores contra sobrecarga prolongada.",
    riesgo_uso_incorrecto: "Mal calibrado deja al motor sin protección o lo saca de servicio innecesariamente.",
    nivel_curso: "avanzado",
  },

  // ── Tomacorrientes y fichas ─────────────────────────────────────────
  {
    id: "toma_iram_2073",
    categoria: "tomacorrientes",
    nombre: "Tomacorriente 2P+T (IRAM 2073)",
    especificacion_tecnica: {
      norma: "IRAM 2073",
      configuracion: "2 polos + tierra",
      corrientes: "10 A / 20 A",
    },
    uso_correcto: "Tomacorriente estándar argentino con puesta a tierra.",
    riesgo_uso_incorrecto: "Invertir fase y neutro deja partes con tensión en reposo (riesgo al tocar aunque el aparato funcione).",
    nivel_curso: "basico",
  },
  {
    id: "ficha_trifasica",
    categoria: "tomacorrientes",
    nombre: "Ficha industrial trifásica",
    especificacion_tecnica: {
      configuracion: "3 fases + neutro + tierra (según modelo)",
      tension: "380 V (fase-fase)",
    },
    uso_correcto: "Conexión de máquinas y motores trifásicos.",
    riesgo_uso_incorrecto: "Conectar un artefacto monofásico a trifásica o invertir secuencia de fases daña equipos.",
    nivel_curso: "avanzado",
  },

  // ── Herramientas ────────────────────────────────────────────────────
  {
    id: "multimetro",
    categoria: "herramientas",
    nombre: "Multímetro",
    especificacion_tecnica: { mide: "tensión, corriente, resistencia, continuidad" },
    uso_correcto: "Medir tensión, resistencia y continuidad en el circuito.",
    riesgo_uso_incorrecto: "Medir corriente en modo tensión (o al revés) puede dañar el instrumento o provocar un arco.",
    nivel_curso: "basico",
  },
  {
    id: "pinza_amperometrica",
    categoria: "herramientas",
    nombre: "Pinza amperométrica",
    especificacion_tecnica: { mide: "corriente sin abrir el circuito" },
    uso_correcto: "Medir la corriente que circula por un conductor sin interrumpirlo.",
    riesgo_uso_incorrecto: "Abrazar más de un conductor a la vez da lecturas erróneas.",
    nivel_curso: "intermedio",
  },
  {
    id: "buscapolos",
    categoria: "herramientas",
    nombre: "Buscapolos (detector de tensión)",
    especificacion_tecnica: { detecta: "presencia de tensión" },
    uso_correcto: "Verificar ausencia/presencia de tensión antes de trabajar.",
    riesgo_uso_incorrecto: "Confiar en un buscapolos sin verificar su funcionamiento previo puede dar un falso 'sin tensión'.",
    nivel_curso: "basico",
  },
  {
    id: "destornillador_aislado",
    categoria: "herramientas",
    nombre: "Destornillador aislado",
    especificacion_tecnica: { aislacion: "mango dieléctrico normalizado (1000 V)" },
    uso_correcto: "Trabajar sobre bornes con menor riesgo de contacto.",
    riesgo_uso_incorrecto: "Un destornillador común (no aislado) no protege del contacto eléctrico.",
    nivel_curso: "basico",
  },
  {
    id: "pelacables",
    categoria: "herramientas",
    nombre: "Pelacables / prensa terminales",
    especificacion_tecnica: { funcion: "quitar aislación y prensar terminales sin dañar el conductor" },
    uso_correcto: "Preparar conductores y colocar terminales de forma prolija.",
    riesgo_uso_incorrecto: "Usar cuchillo daña hilos del conductor y reduce su sección efectiva.",
    nivel_curso: "basico",
  },

  // ── Equipo de protección personal (EPP) ─────────────────────────────
  {
    id: "guantes_dielectricos",
    categoria: "epp",
    nombre: "Guantes dieléctricos",
    especificacion_tecnica: { proteccion: "aislación según clase/tensión de trabajo" },
    uso_correcto: "Trabajo con posible presencia de tensión.",
    riesgo_uso_incorrecto: "Guantes dañados o de clase incorrecta no protegen; deben verificarse antes de usar.",
    nivel_curso: "basico",
  },
  {
    id: "calzado_aislante",
    categoria: "epp",
    nombre: "Calzado aislante",
    especificacion_tecnica: { proteccion: "aisla del contacto con tierra" },
    uso_correcto: "Reducir el riesgo de que el cuerpo sea camino a tierra.",
    riesgo_uso_incorrecto: "Calzado húmedo o común no cumple la función aislante.",
    nivel_curso: "basico",
  },
  {
    id: "gafas_proteccion",
    categoria: "epp",
    nombre: "Gafas de protección",
    especificacion_tecnica: { proteccion: "impactos y arco eléctrico" },
    uso_correcto: "Proteger la vista ante posibles arcos o proyecciones.",
    riesgo_uso_incorrecto: "No usarlas expone los ojos a un arco eléctrico.",
    nivel_curso: "basico",
  },
  {
    id: "tapete_aislante",
    categoria: "epp",
    nombre: "Tapete aislante",
    especificacion_tecnica: { proteccion: "aisla al operario del piso al trabajar en tableros" },
    uso_correcto: "Trabajo frente a tableros para aislarse de tierra.",
    riesgo_uso_incorrecto: "Un tapete deteriorado o mojado pierde su capacidad aislante.",
    nivel_curso: "intermedio",
  },
];

// Etiquetas legibles por categoría, para la UI del catálogo.
export const CATEGORIAS = {
  cables: "Cables",
  protecciones: "Protecciones",
  tomacorrientes: "Tomacorrientes y fichas",
  herramientas: "Herramientas",
  epp: "Protección personal (EPP)",
};

export const NIVELES = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

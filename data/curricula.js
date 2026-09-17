// Estructura de la currícula del módulo Electricidad (spec secciones 1-3).
// `estado`: "listo" (simulación implementada) | "pendiente" (por construir).
// `sim`: id del simulador que resuelve el tema, si existe.

export const CURRICULA = [
  {
    nivel: "basico",
    titulo: "Básico",
    temas: [
      { id: "1.1", titulo: "Ley de Ohm y potencia", estado: "listo", sim: "ohm-potencia" },
      { id: "1.2", titulo: "Cables y secciones (mm²)", estado: "listo", sim: "cable-termica" },
      { id: "1.3", titulo: "Térmicas (breakers) — protección del cable", estado: "listo", sim: "cable-termica" },
      { id: "1.4", titulo: "Cortocircuito vs. sobrecarga", estado: "listo", sim: "corto-sobrecarga" },
      { id: "1.5", titulo: "Puesta a tierra", estado: "listo", sim: "puesta-tierra" },
      { id: "1.6", titulo: "Tomacorrientes y polaridad", estado: "listo", sim: "polaridad" },
    ],
  },
  {
    nivel: "intermedio",
    titulo: "Intermedio",
    temas: [
      { id: "2.1", titulo: "Circuitos serie vs. paralelo", estado: "pendiente" },
      { id: "2.2", titulo: "Cálculo de cargas por ambiente", estado: "pendiente" },
      { id: "2.3", titulo: "Disyuntor diferencial (RCD)", estado: "pendiente" },
      { id: "2.4", titulo: "Tablero completo", estado: "pendiente" },
      { id: "2.5", titulo: "Iluminación", estado: "pendiente" },
    ],
  },
  {
    nivel: "avanzado",
    titulo: "Avanzado",
    temas: [
      { id: "3.1", titulo: "Trifásica", estado: "pendiente" },
      { id: "3.2", titulo: "Motores — arranque", estado: "pendiente" },
      { id: "3.3", titulo: "Arranque de compresores", estado: "pendiente" },
      { id: "3.4", titulo: "Mantenimiento industrial básico", estado: "pendiente" },
      { id: "3.5", titulo: "Normativa (introducción a AEA)", estado: "pendiente" },
    ],
  },
];

// Cierre educativo obligatorio en cada simulador (spec sección 0 y 5).
export const AVISO_EDUCATIVO =
  "Esto es una simulación educativa. Una instalación real la debe hacer o " +
  "supervisar un electricista matriculado.";

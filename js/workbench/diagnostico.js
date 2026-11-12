// Casos guiados de diagnóstico. Son prácticas conceptuales, no procedimientos
// para intervenir instalaciones reales ni sustituyen protocolos profesionales.
export const CASOS_DIAGNOSTICO = {
  "conductor-abierto": {
    titulo: "La carga no funciona: posible conductor interrumpido",
    contexto: "La carga no recibe alimentación en el escenario simulado. El esquema marca un tramo abierto.",
    pasos: [
      {
        pregunta: "¿Cuál es la primera medida antes de comprobar continuidad?",
        opciones: [
          "Desconectar la fuente y verificar ausencia de tensión con un instrumento adecuado",
          "Medir continuidad con la fuente conectada",
          "Aumentar el calibre de la térmica"
        ],
        correcta: 0,
        explicacion: "La continuidad se comprueba con el circuito desenergizado. En una instalación real también se aplica el procedimiento de bloqueo y verificación correspondiente."
      },
      {
        pregunta: "¿Qué prueba conceptual ayuda a localizar el tramo interrumpido?",
        opciones: [
          "Comprobar continuidad por tramos con el circuito aislado",
          "Medir corriente con el circuito desconectado",
          "Puentea el conductor para ver si arranca"
        ],
        correcta: 0,
        explicacion: "La comprobación por tramos permite acotar dónde se interrumpió el camino. No se debe puentear una falla para poner en servicio la instalación."
      },
      {
        pregunta: "¿Cuál es el diagnóstico más consistente con el esquema?",
        opciones: [
          "Hay una interrupción en uno de los conductores del circuito",
          "La tensión de alimentación aumentó",
          "La protección diferencial está actuando"
        ],
        correcta: 0,
        explicacion: "El escenario representa un conductor abierto. La simulación no identifica daños físicos ni reemplaza la inspección profesional."
      }
    ]
  },
  "puente-termica": {
    titulo: "La carga funciona, pero la térmica quedó puenteada",
    contexto: "El escenario agrega un camino alternativo que evita la protección termomagnética.",
    pasos: [
      {
        pregunta: "¿Que la carga funcione demuestra que está correctamente protegida?",
        opciones: [
          "No. Puede existir un camino de fase que evita la térmica",
          "Sí. Si funciona, la protección está bien",
          "Sí, siempre que el cable sea grueso"
        ],
        correcta: 0,
        explicacion: "Que circule corriente no demuestra que la protección esté en serie. El modelo busca caminos alternativos que puentean la térmica."
      },
      {
        pregunta: "¿Qué condición de seguridad debe cumplirse antes de inspeccionar conexiones?",
        opciones: [
          "Desconectar la alimentación y verificar ausencia de tensión",
          "Mantener la fuente encendida para seguir el recorrido",
          "Tocar los bornes para detectar temperatura"
        ],
        correcta: 0,
        explicacion: "La inspección de conexiones se realiza sin tensión y con las verificaciones de seguridad aplicables."
      },
      {
        pregunta: "¿Cuál es el diagnóstico del escenario?",
        opciones: [
          "Existe un camino alternativo que deja la térmica fuera de serie",
          "La carga tiene potencia insuficiente",
          "El neutro está necesariamente interrumpido"
        ],
        correcta: 0,
        explicacion: "El puente permite alimentar la carga sin que la térmica proteja correctamente la fase. No debe ponerse en servicio así."
      }
    ]
  },
  "corto-fase-neutro": {
    titulo: "Se detecta una unión directa fase-neutro",
    contexto: "El escenario virtual representa una conexión directa entre fase y neutro. La corriente de falla y la respuesta de la protección no están modeladas.",
    pasos: [
      {
        pregunta: "¿Qué indica una unión directa fase-neutro en este escenario?",
        opciones: [
          "Una condición de cortocircuito que no debe energizarse",
          "Una conexión normal de la carga",
          "Una medición de continuidad de protección"
        ],
        correcta: 0,
        explicacion: "Una unión directa fase-neutro representa una falla. El simulador no calcula la corriente de cortocircuito ni garantiza la actuación de una protección."
      },
      {
        pregunta: "¿Cuál es la conducta segura dentro de esta práctica?",
        opciones: [
          "Desconectar la fuente y no volver a energizar el circuito con la falla presente",
          "Subir el calibre de la térmica y probar otra vez",
          "Mantenerlo energizado para medir la corriente de falla"
        ],
        correcta: 0,
        explicacion: "No se debe reenergizar un circuito con una falla conocida. La evaluación y reparación de una instalación real corresponde a personal calificado."
      },
      {
        pregunta: "¿Qué conclusión permite el modelo y cuál no?",
        opciones: [
          "Permite identificar la unión fase-neutro, pero no calcular Icc ni el tiempo de disparo",
          "Permite conocer la corriente exacta y el tiempo de disparo",
          "Demuestra que cualquier térmica abrirá el circuito"
        ],
        correcta: 0,
        explicacion: "Para calcular Icc y verificar la protección se necesitan, entre otros datos, impedancia de fuente y lazo y características del dispositivo. No están incluidos en este modelo."
      }
    ]
  }
};

export function evaluarRespuestaDiagnostico(falla, paso, opcion) {
  const caso = CASOS_DIAGNOSTICO[falla];
  const pregunta = caso?.pasos[paso];
  if (!pregunta) return { valida: false, correcta: false, explicacion: "No hay una pregunta activa." };
  const correcta = Number(opcion) === pregunta.correcta;
  return { valida: true, correcta, explicacion: correcta ? pregunta.explicacion : "Todavía no. Revisá el síntoma y la condición de seguridad antes de elegir." };
}

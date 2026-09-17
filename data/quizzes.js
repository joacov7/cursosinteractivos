// Quiz de cierre por tema (spec sección 6). Indexado por id de tema para que el
// mismo motor sirva a los próximos oficios. Cada pregunta: enunciado, opciones,
// índice de la correcta y explicación que se muestra al corregir.
//
// Aprobación: se necesita al menos el 70 % de respuestas correctas.

export const UMBRAL_APROBACION = 0.7;

export const QUIZZES = {
  "1.1": {
    tema: "Ley de Ohm y potencia",
    preguntas: [
      {
        q: "Si una resistencia de 22 Ω se conecta a 220 V, ¿qué corriente circula?",
        opciones: ["1 A", "10 A", "22 A", "4840 A"],
        correcta: 1,
        explicacion: "I = V / R = 220 / 22 = 10 A.",
      },
      {
        q: "¿Cuál es la potencia de esa carga (220 V, 10 A)?",
        opciones: ["22 W", "230 W", "2200 W", "22 000 W"],
        correcta: 2,
        explicacion: "P = V · I = 220 · 10 = 2200 W.",
      },
      {
        q: "Manteniendo la tensión fija, si la resistencia AUMENTA, la corriente…",
        opciones: ["aumenta", "disminuye", "no cambia", "se vuelve cero"],
        correcta: 1,
        explicacion: "En I = V/R, a mayor R (con V constante) menor corriente.",
      },
      {
        q: "¿Cuándo se mide resistencia con el multímetro de forma segura?",
        opciones: [
          "Con el circuito energizado",
          "Con el circuito SIN tensión",
          "Da igual el estado del circuito",
          "Solo con corriente circulando",
        ],
        correcta: 1,
        explicacion: "La resistencia se mide siempre con el circuito desenergizado.",
      },
    ],
  },
  "1.2": {
    tema: "Cables y secciones",
    preguntas: [
      {
        q: "La capacidad de corriente de un cable depende sobre todo de su…",
        opciones: ["color", "longitud", "sección (mm²)", "marca"],
        correcta: 2,
        explicacion: "A mayor sección, más corriente puede conducir sin recalentarse.",
      },
      {
        q: "¿Qué pasa si la carga supera la capacidad del cable?",
        opciones: [
          "Nada, el cable se adapta",
          "El cable se calienta y la aislación se degrada",
          "Baja la tensión y ya",
          "Se corta solo sin riesgo",
        ],
        correcta: 1,
        explicacion: "El conductor se sobrecalienta; puede humear o iniciar fuego.",
      },
      {
        q: "Para un circuito de tomacorrientes de uso general se usa típicamente…",
        opciones: ["1.5 mm²", "2.5 mm²", "0.5 mm²", "cualquiera"],
        correcta: 1,
        explicacion: "2.5 mm² (≈16 A) es lo habitual para tomas de uso general; 1.5 mm² se reserva a iluminación.",
      },
      {
        q: "El color verde-amarillo de un conductor corresponde a…",
        opciones: ["fase", "neutro", "tierra", "retorno"],
        correcta: 2,
        explicacion: "Verde-amarillo es siempre el conductor de protección (tierra).",
      },
    ],
  },
  "1.3": {
    tema: "Térmicas (protección del cable)",
    preguntas: [
      {
        q: "¿A qué se dimensiona la térmica?",
        opciones: [
          "A la carga directamente",
          "Al cable que protege",
          "A la tensión de la red",
          "Al tamaño del tablero",
        ],
        correcta: 1,
        explicacion: "La térmica protege al cable, así que se dimensiona en relación a su capacidad.",
      },
      {
        q: "Si la térmica es MENOR que la carga del circuito…",
        opciones: [
          "corta apenas se usa el circuito",
          "no protege al cable",
          "mejora el rendimiento",
          "no pasa nada",
        ],
        correcta: 0,
        explicacion: "Falla 'chica': dispara ni bien la carga entra en régimen; el circuito queda inutilizable.",
      },
      {
        q: "Si la térmica es MAYOR que la capacidad del cable…",
        opciones: [
          "protege mejor",
          "no protege al cable ante sobrecarga",
          "corta más rápido",
          "ahorra energía",
        ],
        correcta: 1,
        explicacion: "Falla 'grande': el cable llega a temperatura peligrosa antes de que la térmica dispare.",
      },
      {
        q: "Ante una térmica que 'salta seguido', lo correcto NO es…",
        opciones: [
          "revisar si el circuito está sobrecargado",
          "puentear la térmica o poner una de más corriente",
          "repartir la carga en otro circuito",
          "verificar la sección del cable",
        ],
        correcta: 1,
        explicacion: "Puentearla o agrandarla deja el cable sin protección: es peligroso.",
      },
    ],
  },
  "1.4": {
    tema: "Cortocircuito vs. sobrecarga",
    preguntas: [
      {
        q: "Una sobrecarga es…",
        opciones: [
          "dos conductores que se tocan",
          "corriente por encima de lo normal, de forma gradual",
          "una baja de tensión",
          "una falla de aislación",
        ],
        correcta: 1,
        explicacion: "La sobrecarga sube la corriente por encima de lo normal; la térmica corta por el bimetálico (curva térmica).",
      },
      {
        q: "En un cortocircuito, la térmica corta por…",
        opciones: [
          "el bimetálico (lento)",
          "la bobina magnética (instantáneo)",
          "el diferencial",
          "no corta",
        ],
        correcta: 1,
        explicacion: "El pico de corriente dispara la bobina magnética en milisegundos.",
      },
      {
        q: "¿Son la misma falla 'pero más fuerte'?",
        opciones: [
          "Sí, es lo mismo",
          "No, son fallas distintas con mecanismos de corte distintos",
          "Solo en corriente continua",
          "Depende del cable",
        ],
        correcta: 1,
        explicacion: "Son fenómenos distintos: gradual (térmico) vs. pico instantáneo (magnético).",
      },
      {
        q: "El disparo magnético actúa en el orden de…",
        opciones: ["varios segundos", "algunos minutos", "milisegundos", "una hora"],
        correcta: 2,
        explicacion: "Ante un cortocircuito el corte es casi instantáneo (< 20 ms).",
      },
    ],
  },
  "1.5": {
    tema: "Puesta a tierra",
    preguntas: [
      {
        q: "La puesta a tierra, ante una falla de aislación…",
        opciones: [
          "evita que ocurra la falla",
          "da un camino seguro para que la protección corte",
          "aumenta la tensión de la carcasa",
          "no cumple ninguna función",
        ],
        correcta: 1,
        explicacion: "No evita la falla: ofrece un camino de baja resistencia para que la protección actúe.",
      },
      {
        q: "Sin puesta a tierra, una carcasa metálica con falla de aislación queda…",
        opciones: ["a 0 V", "energizada (riesgo al tocarla)", "más fría", "sin cambios"],
        correcta: 1,
        explicacion: "La carcasa queda a tensión de red; tocarla te vuelve el camino a tierra.",
      },
      {
        q: "¿Qué protección detecta mejor una fuga a tierra por falla de aislación?",
        opciones: ["la térmica sola", "el diferencial (RCD)", "el cable", "el tomacorriente"],
        correcta: 1,
        explicacion: "La térmica ve sobrecargas/cortos; la fuga a tierra la detecta el diferencial.",
      },
      {
        q: "Ante 'cosquilleo' al tocar un electrodoméstico, corresponde…",
        opciones: [
          "seguir usándolo",
          "cortar y hacer revisar la instalación",
          "mojarlo para descargar",
          "cambiar la lámpara",
        ],
        correcta: 1,
        explicacion: "Es señal de carcasa energizada: cortar y revisar tierra/aislación.",
      },
    ],
  },
  "1.6": {
    tema: "Tomacorrientes y polaridad",
    preguntas: [
      {
        q: "La norma argentina de tomacorriente domiciliario es…",
        opciones: ["Schuko", "2P+T (IRAM 2073)", "NEMA 5-15", "tipo C"],
        correcta: 1,
        explicacion: "En Argentina el estándar es 2P+T según IRAM 2073.",
      },
      {
        q: "El interruptor de un artefacto debe cortar…",
        opciones: ["el neutro", "la fase", "la tierra", "cualquiera"],
        correcta: 1,
        explicacion: "Debe cortar la fase, para que en reposo no quede tensión aguas abajo.",
      },
      {
        q: "Con fase y neutro invertidos, el artefacto…",
        opciones: [
          "no funciona",
          "funciona igual, pero queda fase presente en partes que deberían estar sin tensión",
          "consume el doble",
          "se quema al toque",
        ],
        correcta: 1,
        explicacion: "El aparato 'anda', pero el riesgo queda oculto: hay fase donde no debería en reposo.",
      },
      {
        q: "En un toma 2P+T visto de frente, la tierra es el borne…",
        opciones: ["inferior izquierdo", "inferior derecho", "superior", "no tiene"],
        correcta: 2,
        explicacion: "La tierra es el borne superior; fase y neutro son los dos inferiores.",
      },
    ],
  },
};

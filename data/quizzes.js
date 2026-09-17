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

  "2.1": {
    tema: "Circuitos serie vs. paralelo",
    preguntas: [
      {
        q: "En un circuito serie, si una lamparita se quema (se abre)…",
        opciones: ["las demás siguen igual", "se apagan todas", "brillan más", "no pasa nada"],
        correcta: 1,
        explicacion: "En serie hay un único camino: al abrirse una, se corta toda la corriente.",
      },
      {
        q: "La resistencia equivalente de tres resistencias en serie es…",
        opciones: ["la suma R₁+R₂+R₃", "el promedio", "1/(1/R₁+1/R₂+1/R₃)", "la menor"],
        correcta: 0,
        explicacion: "En serie las resistencias se suman.",
      },
      {
        q: "En paralelo, cada rama recibe…",
        opciones: ["una fracción de la tensión", "la tensión completa de la fuente", "el doble", "cero"],
        correcta: 1,
        explicacion: "Cada rama en paralelo queda a la tensión completa; por eso son independientes.",
      },
      {
        q: "La instalación domiciliaria de tomas e iluminación se conecta en…",
        opciones: ["serie", "paralelo", "mixto obligatorio", "da igual"],
        correcta: 1,
        explicacion: "En paralelo, para que cada artefacto reciba 220 V y funcione independiente.",
      },
    ],
  },
  "2.2": {
    tema: "Cálculo de cargas por ambiente",
    preguntas: [
      {
        q: "¿Por qué se reparte la casa en varios circuitos?",
        opciones: [
          "para gastar más cable",
          "para no sobrecargar y poder cortar por sector",
          "es puramente estético",
          "no hace falta",
        ],
        correcta: 1,
        explicacion: "Separar circuitos evita sobrecargas y acota las fallas a un sector.",
      },
      {
        q: "Si sumás toda la casa en un solo circuito, lo más probable es que…",
        opciones: ["ande mejor", "se sobrecargue y corte la térmica", "ahorre energía", "no cambie nada"],
        correcta: 1,
        explicacion: "La corriente total supera la protección: sobrecarga y corte.",
      },
      {
        q: "El aire acondicionado y el horno conviene ponerlos en…",
        opciones: [
          "el circuito de iluminación",
          "un circuito de uso especial dimensionado para su consumo",
          "el mismo de la heladera",
          "cualquiera",
        ],
        correcta: 1,
        explicacion: "Son cargas altas: van en circuitos de uso especial (mayor sección y protección).",
      },
      {
        q: "Un circuito de tomas de uso general típico se protege con…",
        opciones: ["térmica 6 A", "térmica 16 A y cable 2.5 mm²", "térmica 40 A", "sin térmica"],
        correcta: 1,
        explicacion: "Tomas de uso general: 16 A con cable de 2.5 mm².",
      },
    ],
  },
  "2.3": {
    tema: "Disyuntor diferencial (RCD)",
    preguntas: [
      {
        q: "El disyuntor diferencial protege principalmente…",
        opciones: ["el cable", "las personas (contra fugas a tierra)", "la térmica", "el medidor"],
        correcta: 1,
        explicacion: "El diferencial protege personas cortando ante fugas a tierra.",
      },
      {
        q: "Ante una fuga a tierra de 50 mA, la térmica sola…",
        opciones: ["corta enseguida", "no corta (no es sobrecarga)", "explota", "baja la tensión"],
        correcta: 1,
        explicacion: "La térmica ve sobrecargas y cortos, no fugas: no se entera.",
      },
      {
        q: "La sensibilidad para protección de personas en casa es…",
        opciones: ["300 mA", "30 mA", "3 A", "30 A"],
        correcta: 1,
        explicacion: "30 mA es el valor doméstico para protección de personas.",
      },
      {
        q: "En un tablero doméstico correcto conviven…",
        opciones: [
          "solo térmicas",
          "solo diferencial",
          "térmica y diferencial (roles distintos)",
          "ninguno",
        ],
        correcta: 2,
        explicacion: "Se necesitan ambos: la térmica protege la instalación, el diferencial a las personas.",
      },
    ],
  },
  "2.4": {
    tema: "Tablero completo",
    preguntas: [
      {
        q: "El orden jerárquico del tablero es…",
        opciones: [
          "térmicas → diferencial → llave general",
          "llave general → diferencial → térmicas seccionales",
          "diferencial → llave general → térmicas",
          "no hay un orden",
        ],
        correcta: 1,
        explicacion: "Primero la llave general, luego el diferencial y después las térmicas de cada circuito.",
      },
      {
        q: "Cada térmica seccional se dimensiona según…",
        opciones: [
          "el gusto del instalador",
          "el cable del circuito que protege",
          "la potencia total de la casa",
          "el tamaño del tablero",
        ],
        correcta: 1,
        explicacion: "La térmica protege el cable de su circuito, así que se dimensiona a ese cable.",
      },
      {
        q: "El componente que corta TODA la instalación es…",
        opciones: ["la térmica de iluminación", "la llave general", "el diferencial de 30 mA", "el medidor"],
        correcta: 1,
        explicacion: "La llave general (cabecera) corta la totalidad del tablero.",
      },
      {
        q: "Un circuito de iluminación (1.5 mm²) lleva una térmica de…",
        opciones: ["10 A", "20 A", "32 A", "40 A"],
        correcta: 0,
        explicacion: "El cable de 1.5 mm² se protege con térmica de 10 A.",
      },
    ],
  },
  "2.5": {
    tema: "Iluminación",
    preguntas: [
      {
        q: "Una lámpara LED que ilumina como una incandescente de 60 W consume aprox…",
        opciones: ["60 W", "40 W", "9 W", "100 W"],
        correcta: 2,
        explicacion: "Una LED equivalente ronda los 9 W: mismo nivel de luz, mucho menos consumo.",
      },
      {
        q: "La corriente de un circuito de iluminación se calcula con…",
        opciones: ["I = V·R", "I = P / V", "I = P·V", "I = R / V"],
        correcta: 1,
        explicacion: "La corriente es la potencia total dividida la tensión: I = P/V.",
      },
      {
        q: "Cambiar todas las luces a LED, respecto de la instalación, hace que…",
        opciones: [
          "se sobrecargue más",
          "entren muchas más bocas en el mismo circuito",
          "haya que engrosar el cable",
          "no cambie nada",
        ],
        correcta: 1,
        explicacion: "Al bajar el consumo por boca, entran muchas más lámparas en la misma térmica.",
      },
      {
        q: "El circuito de iluminación se protege típicamente con…",
        opciones: ["10 A y 1.5 mm²", "20 A y 4 mm²", "32 A y 6 mm²", "no se protege"],
        correcta: 0,
        explicacion: "Iluminación: térmica de 10 A con cable de 1.5 mm².",
      },
    ],
  },
};

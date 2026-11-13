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
        q: "En este ejercicio simplificado, ¿qué sección se toma como ejemplo para un circuito de tomacorrientes de uso general?",
        opciones: ["1.5 mm²", "2.5 mm²", "0.5 mm²", "cualquiera"],
        correcta: 1,
        explicacion: "Es un ejemplo didáctico, no una regla universal. La sección y protección reales se determinan según normativa vigente, método de instalación, material, aislación, temperatura, agrupamiento y demás condiciones de diseño.",
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
        q: "¿Qué criterio básico debe coordinar la corriente de carga, la protección y el conductor?",
        opciones: [
          "Elegir la térmica solo por la potencia total",
          "Verificar Ib ≤ In ≤ Iz y las demás condiciones de diseño",
          "Usar siempre el calibre más alto disponible",
          "Elegir según el tamaño del tablero",
        ],
        correcta: 1,
        explicacion: "Como criterio básico, Ib es la corriente de diseño, In la corriente nominal de la protección e Iz la capacidad admisible corregida del conductor. También deben verificarse cortocircuito, caída de tensión, curva, poder de corte y normativa aplicable.",
      },
      {
        q: "Si la corriente de carga supera la nominal de la térmica…",
        opciones: [
          "puede actuar según la magnitud, duración y curva del dispositivo",
          "corta siempre de forma instantánea",
          "mejora el rendimiento",
          "no pasa nada",
        ],
        correcta: 0,
        explicacion: "Una sobrecorriente puede provocar la actuación de la protección, pero el tiempo depende de su curva, magnitud, temperatura y condiciones reales. No debe suponerse un disparo instantáneo.",
      },
      {
        q: "Si la corriente nominal de la protección supera la capacidad admisible corregida del conductor…",
        opciones: [
          "la protección cuida mejor al conductor",
          "la coordinación es incorrecta y el conductor puede quedar sin protección adecuada ante sobrecarga",
          "la protección corta siempre más rápido",
          "se reduce el consumo",
        ],
        correcta: 1,
        explicacion: "La protección debe coordinarse con la capacidad admisible corregida del conductor. La evaluación real requiere datos de instalación y características del dispositivo.",
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
        q: "¿Qué describe mejor la respuesta magnética de una termomagnética?",
        opciones: ["Una respuesta rápida ante corrientes elevadas de cortocircuito", "Una respuesta lenta ante pequeñas variaciones de tensión", "La detección de fugas a tierra", "La medición de consumo"],
        correcta: 0,
        explicacion: "El disparador magnético responde rápidamente ante corrientes elevadas. El umbral y el tiempo dependen de la curva y del dispositivo; no hay un tiempo único aplicable a todos los casos.",
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
        q: "Sin conductor de protección, ante una falla de aislación una carcasa metálica puede…",
        opciones: ["quedar siempre a 0 V", "alcanzar un potencial peligroso y generar riesgo de choque eléctrico", "enfriarse", "eliminar la falla automáticamente"],
        correcta: 1,
        explicacion: "Sin una trayectoria de protección eficaz, la masa puede quedar a potencial peligroso. La tensión de contacto y la actuación de las protecciones dependen del sistema y de las condiciones de falla.",
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
        q: "Antes de elegir la sección y protección de un circuito de tomacorrientes, ¿qué corresponde hacer?",
        opciones: ["Copiar una combinación fija para todas las viviendas", "Calcular la demanda y verificar conductor, método de instalación y condiciones de protección", "Elegir la térmica más grande disponible", "Usar siempre la misma sección"],
        correcta: 1,
        explicacion: "La selección depende de la demanda, capacidad admisible corregida, caída de tensión, cortocircuito, características de las protecciones y reglamentación vigente.",
      },
    ],
  },
  "2.3": {
    tema: "Disyuntor diferencial (RCD)",
    preguntas: [
      {
        q: "¿Qué función cumple un interruptor diferencial?",
        opciones: ["Proteger al cable frente a toda sobrecarga", "Detectar corrientes residuales o desequilibrios entre conductores activos", "Reemplazar la puesta a tierra", "Medir el consumo de energía"],
        correcta: 1,
        explicacion: "Detecta una corriente residual y puede aportar protección adicional frente a ciertos contactos indirectos. No reemplaza la puesta a tierra, la protección contra sobrecorrientes ni las verificaciones reglamentarias.",
      },
      {
        q: "Ante una fuga a tierra de 50 mA, la térmica sola…",
        opciones: ["corta enseguida", "no corta (no es sobrecarga)", "explota", "baja la tensión"],
        correcta: 1,
        explicacion: "La térmica ve sobrecargas y cortos, no fugas: no se entera.",
      },
      {
        q: "En muchas aplicaciones de protección adicional de personas, ¿qué sensibilidad nominal suele utilizarse, según el diseño y la reglamentación aplicable?",
        opciones: ["300 mA", "30 mA", "3 A", "30 A"],
        correcta: 1,
        explicacion: "Los diferenciales de alta sensibilidad, habitualmente de 30 mA, se emplean como protección adicional en los casos que corresponda. La selección no reemplaza el diseño ni la verificación de la instalación.",
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
        q: "Al seleccionar una térmica seccional, ¿qué debe verificarse?",
        opciones: [
          "Solo el gusto del instalador",
          "La corriente de diseño, la capacidad admisible corregida del conductor y las condiciones de cortocircuito",
          "Únicamente la potencia total de la casa",
          "El tamaño físico del tablero",
        ],
        correcta: 1,
        explicacion: "La selección coordina carga, conductor y protección, y además verifica poder de corte, curva, caída de tensión y requisitos reglamentarios.",
      },
      {
        q: "El componente que corta TODA la instalación es…",
        opciones: ["la térmica de iluminación", "la llave general", "el diferencial de 30 mA", "el medidor"],
        correcta: 1,
        explicacion: "La llave general (cabecera) corta la totalidad del tablero.",
      },
      {
        q: "¿Qué determina la protección de un circuito de iluminación?",
        opciones: ["Una combinación fija válida para cualquier instalación", "La coordinación entre carga, conductor y condiciones de instalación y cortocircuito", "El color de los cables", "La cantidad de teclas de luz"],
        correcta: 1,
        explicacion: "No existe una combinación universal: deben verificarse corriente de diseño, capacidad admisible corregida, caída de tensión, cortocircuito, dispositivo y reglamentación.",
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
        q: "¿Qué criterio debe guiar la selección de cable y protección para iluminación?",
        opciones: ["Usar siempre 10 A y 1.5 mm²", "Verificar demanda, capacidad admisible corregida, método de instalación y requisitos reglamentarios", "Elegir la mayor sección sin revisar la protección", "No instalar protección"],
        correcta: 1,
        explicacion: "La combinación debe calcularse para cada instalación. Los valores de sección y protección no son universales y deben comprobarse con la reglamentación vigente.",
      },
    ],
  },

  "3.1": {
    tema: "Trifásica",
    preguntas: [
      {
        q: "En una vivienda, entre fase y neutro hay…",
        opciones: ["380 V", "220 V", "12 V", "110 V"],
        correcta: 1,
        explicacion: "La tensión monofásica domiciliaria es 220 V (fase-neutro).",
      },
      {
        q: "La tensión entre fases en trifásica es…",
        opciones: ["220 V", "380 V", "220 V siempre", "24 V"],
        correcta: 1,
        explicacion: "Entre dos fases hay 380 V.",
      },
      {
        q: "¿Qué carga típicamente necesita trifásica?",
        opciones: ["una lamparita", "un motor industrial de gran potencia", "un cargador de celular", "una heladera familiar"],
        correcta: 1,
        explicacion: "Los motores de mucha potencia y máquinas industriales usan trifásica.",
      },
      {
        q: "La ventaja de la trifásica para motores grandes es…",
        opciones: [
          "que es más barata siempre",
          "un funcionamiento más eficiente y equilibrado a alta potencia",
          "que no necesita protección",
          "que usa menos cables en todos los casos",
        ],
        correcta: 1,
        explicacion: "La trifásica entrega potencia de forma más equilibrada y eficiente para cargas grandes.",
      },
    ],
  },
  "3.2": {
    tema: "Motores — arranque",
    preguntas: [
      {
        q: "La corriente de arranque de un motor, respecto de la nominal, es…",
        opciones: ["igual", "varias veces mayor", "la mitad", "cero"],
        correcta: 1,
        explicacion: "En el arranque el motor toma varias veces (p. ej. ~6×) su corriente nominal.",
      },
      {
        q: "El arranque estrella-triángulo sirve para…",
        opciones: [
          "aumentar el pico de arranque",
          "reducir el pico de corriente de arranque",
          "cambiar el sentido de giro",
          "eliminar la protección",
        ],
        correcta: 1,
        explicacion: "Reduce la corriente de arranque a aproximadamente un tercio.",
      },
      {
        q: "Al seleccionar la curva de una protección para un motor con arranque directo…",
        opciones: [
          "se elige siempre curva B",
          "se verifica la corriente y duración del arranque junto con cortocircuito y protección del conductor",
          "se elimina la protección",
          "cualquier curva es equivalente",
        ],
        correcta: 1,
        explicacion: "La curva debe coordinarse con el arranque real, el nivel de cortocircuito y la protección del conductor. No se elige únicamente por tratarse de un motor.",
      },
      {
        q: "¿Qué debe comprobarse antes de elegir una curva C o D para una carga con alto pico de arranque?",
        opciones: ["Solo que la carga sea un motor", "Que el arranque sea compatible y que la protección siga actuando correctamente ante cortocircuitos", "Que el cable sea del color correcto", "Que el tablero tenga espacio"],
        correcta: 1,
        explicacion: "Una curva más tolerante al pico puede afectar la desconexión ante fallas. Deben comprobarse la corriente de arranque, la impedancia del lazo, el tiempo de desconexión y las condiciones reglamentarias.",
      },
    ],
  },
  "3.3": {
    tema: "Arranque de compresores",
    preguntas: [
      {
        q: "Un compresor zumba, no arranca y salta el protector; el capacitor está hinchado. La falla más probable es…",
        opciones: ["el capacitor de arranque", "el cable", "el termostato", "la lamparita"],
        correcta: 0,
        explicacion: "Sin par de arranque (capacitor fallado) el motor no gira y el protector lo saca.",
      },
      {
        q: "El componente que da el impulso inicial conectando el bobinado de arranque es…",
        opciones: ["el relé de arranque", "la térmica general", "el diferencial", "el neutro"],
        correcta: 0,
        explicacion: "El relé de arranque conmuta para dar el arranque y luego lo desconecta.",
      },
      {
        q: "Antes de tocar un capacitor hay que…",
        opciones: ["nada", "descargarlo (guarda energía)", "calentarlo", "mojarlo"],
        correcta: 1,
        explicacion: "El capacitor almacena carga y puede dar una descarga aunque esté desconectado.",
      },
      {
        q: "Un compresor que corta caliente y rearranca al enfriarse, en ciclos, sugiere…",
        opciones: [
          "actuación del protector térmico",
          "falla del tomacorriente",
          "exceso de iluminación",
          "polaridad invertida",
        ],
        correcta: 0,
        explicacion: "El ciclado por temperatura es típico del protector térmico actuando.",
      },
    ],
  },
  "3.4": {
    tema: "Mantenimiento industrial — selectividad",
    preguntas: [
      {
        q: "La selectividad busca que, ante una falla, corte…",
        opciones: [
          "la protección general (toda la planta)",
          "solo la protección más cercana a la falla",
          "todas a la vez",
          "ninguna",
        ],
        correcta: 1,
        explicacion: "Debe actuar la protección aguas abajo, más cercana a la falla, y solo esa.",
      },
      {
        q: "Para lograr selectividad amperométrica, la seccional debe ser…",
        opciones: ["mayor que la general", "menor que la general", "igual a la general", "sin relación"],
        correcta: 1,
        explicacion: "La seccional se elige por debajo de la general para que actúe primero.",
      },
      {
        q: "Si la seccional y la general son iguales, ante una falla puede…",
        opciones: [
          "cortar la general y parar toda la planta",
          "no pasar nada",
          "mejorar la selectividad",
          "arrancar el motor",
        ],
        correcta: 0,
        explicacion: "Sin margen, puede disparar la general y dejar todo sin servicio.",
      },
      {
        q: "En mantenimiento, para entender un tablero conviene leer…",
        opciones: ["el plano unifilar", "el manual del microondas", "la factura de luz", "nada"],
        correcta: 0,
        explicacion: "El unifilar muestra la estructura de circuitos y protecciones de la instalación.",
      },
    ],
  },
  "3.5": {
    tema: "Normativa (AEA)",
    preguntas: [
      {
        q: "La AEA es…",
        opciones: [
          "una marca de cables",
          "la Asociación Electrotécnica Argentina, que publica la reglamentación de referencia",
          "un tipo de térmica",
          "un impuesto",
        ],
        correcta: 1,
        explicacion: "La AEA edita la reglamentación de instalaciones eléctricas usada como referencia.",
      },
      {
        q: "El enfoque correcto frente a la normativa es…",
        opciones: [
          "memorizar todo el articulado",
          "saber cuándo consultarla y usarla como referencia",
          "ignorarla",
          "inventar criterios propios",
        ],
        correcta: 1,
        explicacion: "No hace falta memorizarla; sí saber cuándo y para qué consultarla.",
      },
      {
        q: "¿Cuál de estas decisiones se consulta en la reglamentación?",
        opciones: [
          "el color de la pared",
          "la sección mínima de un cable y la puesta a tierra",
          "la música de fondo",
          "la marca del destornillador",
        ],
        correcta: 1,
        explicacion: "Todo lo que hace a la seguridad de la instalación está reglamentado.",
      },
      {
        q: "La reglamentación existe principalmente para…",
        opciones: [
          "complicar el trabajo",
          "que las instalaciones sean seguras",
          "vender más cable",
          "decorar el tablero",
        ],
        correcta: 1,
        explicacion: "Su objetivo es la seguridad de las personas y los bienes.",
      },
    ],
  },
};

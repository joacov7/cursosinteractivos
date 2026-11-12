// Micro-guías didácticas: una misión breve para transformar cada simulación
// en una actividad de observación, decisión y explicación.
const MISIONES = {
  "ohm-potencia": {
    etapa: "01 · Comprender", titulo: "Calculá antes de conectar",
    pregunta: "Si la tensión se mantiene y la resistencia se duplica, ¿qué ocurre con la corriente?",
    opciones: ["Se duplica", "Se reduce a la mitad", "No cambia"],
    correcta: 1, pista: "Usá I = V / R: la resistencia está en el denominador.",
    explicacion: "Con tensión constante, la corriente es inversamente proporcional a la resistencia. Si R se duplica, I queda reducida a la mitad."
  },
  "cable-termica": {
    etapa: "02 · Elegir protección", titulo: "La protección cuida al conductor",
    pregunta: "¿Qué condición básica debe cumplirse entre corriente de carga, protección y capacidad admisible del cable?",
    opciones: ["La protección debe superar la capacidad del cable", "La carga debe superar la protección", "La carga no debe superar la protección y esta no debe superar la capacidad admisible del cable"],
    correcta: 2, pista: "Pensá en una coordinación: carga, dispositivo de protección y conductor.",
    explicacion: "Como criterio didáctico simplificado: Ib ≤ In ≤ Iz. El dimensionamiento real requiere método de instalación, correcciones, caída de tensión, cortocircuito y normativa aplicable."
  },
  "corto-sobrecarga": {
    etapa: "03 · Diagnosticar", titulo: "Dos fallas, dos respuestas",
    pregunta: "¿Qué mecanismo de una termomagnética responde principalmente ante un cortocircuito de gran magnitud?",
    opciones: ["El magnético", "El térmico", "El diferencial"],
    correcta: 0, pista: "El evento es muy rápido y produce una corriente muy elevada.",
    explicacion: "El disparador magnético responde a corrientes elevadas de cortocircuito. El elemento térmico responde a sobrecargas sostenidas."
  },
  "puesta-tierra": {
    etapa: "04 · Proteger personas", titulo: "El camino de la corriente de falla",
    pregunta: "¿Cuál es la función principal del conductor de protección PE?",
    opciones: ["Reemplazar al neutro", "Proporcionar un camino de falla que facilite la actuación de la protección", "Evitar que ocurra cualquier falla de aislación"],
    correcta: 1, pista: "La puesta a tierra no impide que el aislamiento falle; ayuda a que la protección actúe.",
    explicacion: "El PE une las masas al sistema de protección y permite una trayectoria de falla. La desconexión depende del esquema de tierra y de las protecciones correctamente coordinadas."
  },
  polaridad: {
    etapa: "05 · Verificar", titulo: "Identificá cada conductor",
    pregunta: "En una toma correctamente cableada, ¿qué conductor debe conectarse al borne de protección?",
    opciones: ["Fase", "Neutro", "Conductor PE"],
    correcta: 2, pista: "Es el conductor de protección, no debe utilizarse como conductor activo.",
    explicacion: "El PE se conecta al contacto de protección y a las masas correspondientes. Nunca debe sustituirse por neutro."
  },
  "serie-paralelo": {
    etapa: "06 · Analizar circuitos", titulo: "Un camino o varias ramas",
    pregunta: "En un circuito paralelo ideal, ¿qué magnitud es común a las ramas?",
    opciones: ["La tensión", "La corriente de cada rama", "La resistencia equivalente de cada rama"],
    correcta: 0, pista: "Las ramas comparten los mismos dos nodos.",
    explicacion: "En paralelo, cada rama está sometida a la misma diferencia de potencial; la corriente se distribuye según la impedancia de cada rama."
  },
  "cargas-ambiente": {
    etapa: "07 · Distribuir cargas", titulo: "Separá circuitos con criterio",
    pregunta: "¿Por qué conviene dividir una instalación en varios circuitos?",
    opciones: ["Para que todos tengan la misma corriente", "Para limitar efectos de fallas y adecuar conductores y protecciones a cada uso", "Para eliminar la necesidad de protecciones"],
    correcta: 1, pista: "Pensá en continuidad de servicio, seguridad y adecuación de cada circuito.",
    explicacion: "La división por usos y demandas facilita la protección, el mantenimiento y la continuidad. La distribución debe cumplir los requisitos reglamentarios."
  },
  diferencial: {
    etapa: "08 · Detectar fugas", titulo: "Qué compara un diferencial",
    pregunta: "¿Qué detecta un interruptor diferencial?",
    opciones: ["La potencia total consumida", "La diferencia entre corrientes que circulan por los conductores activos", "La temperatura del cable"],
    correcta: 1, pista: "En condiciones normales, la corriente que sale debe coincidir con la que retorna.",
    explicacion: "El diferencial detecta una corriente residual. No reemplaza la protección contra sobrecargas y cortocircuitos ni garantiza por sí solo seguridad ante cualquier contacto."
  },
  tablero: {
    etapa: "09 · Organizar", titulo: "Ordená las protecciones",
    pregunta: "¿Qué criterio debe guiar la selección y disposición de protecciones en un tablero?",
    opciones: ["Elegirlas solo por su tamaño", "Coordinar función, corriente, poder de corte y requisitos de la instalación", "Usar siempre el mismo calibre"],
    correcta: 1, pista: "No alcanza con que el dispositivo entre físicamente en el tablero.",
    explicacion: "Las protecciones se seleccionan según la carga, conductores, corriente de cortocircuito prevista, selectividad cuando corresponda y reglamentación."
  },
  iluminacion: {
    etapa: "10 · Comparar tecnologías", titulo: "Eficiencia luminosa",
    pregunta: "Para obtener un flujo luminoso similar, ¿qué suele caracterizar a una lámpara LED frente a una incandescente?",
    opciones: ["Mayor consumo", "Menor eficacia luminosa", "Menor potencia eléctrica"],
    correcta: 2, pista: "Compará cuánta energía eléctrica necesita cada tecnología para producir luz.",
    explicacion: "La tecnología LED suele ofrecer más lúmenes por watt y menor consumo para un flujo luminoso comparable. También importan calidad, vida útil y condiciones de uso."
  },
  trifasica: {
    etapa: "11 · Interpretar fases", titulo: "Desfase entre fases",
    pregunta: "En un sistema trifásico equilibrado, ¿cuál es el desfase angular entre tensiones de fase?",
    opciones: ["90°", "120°", "180°"],
    correcta: 1, pista: "Una vuelta completa se divide en tres intervalos iguales.",
    explicacion: "Las tres tensiones sinusoidales están separadas 120 grados eléctricos en un sistema equilibrado."
  },
  "motores-arranque": {
    etapa: "12 · Entender arranque", titulo: "Corriente de arranque",
    pregunta: "¿Por qué un motor de inducción suele demandar más corriente al arrancar que en régimen?",
    opciones: ["Porque al inicio aún no desarrolló fuerza contraelectromotriz suficiente", "Porque el cable cambia de sección", "Porque la frecuencia de red se duplica"],
    correcta: 0, pista: "Al arrancar, el rotor todavía no alcanzó velocidad.",
    explicacion: "La corriente de arranque depende del diseño y método de arranque. Debe considerarse al seleccionar protecciones y evaluar caída de tensión."
  },
  "compresor-diagnostico": {
    etapa: "13 · Diagnosticar motores", titulo: "Arranque del compresor",
    pregunta: "Ante un compresor monofásico que no arranca, ¿qué conviene hacer primero?",
    opciones: ["Cambiar el capacitor sin medir", "Verificar alimentación, conexiones y componentes según procedimiento seguro", "Puente artermal y probar"],
    correcta: 1, pista: "Primero observá y medí con un procedimiento seguro; no sustituyas piezas al azar.",
    explicacion: "El diagnóstico requiere identificar el circuito y verificar alimentación, protecciones, bobinados y componentes de arranque. Las pruebas deben realizarlas personas capacitadas."
  },
  selectividad: {
    etapa: "14 · Coordinar protecciones", titulo: "Que actúe la protección adecuada",
    pregunta: "¿Qué busca la selectividad entre protecciones en serie?",
    opciones: ["Que siempre disparen todas", "Que ante una falla actúe preferentemente la protección más cercana al defecto", "Que ninguna protección dispare"],
    correcta: 1, pista: "La idea es aislar el sector afectado y mantener el resto del servicio.",
    explicacion: "La selectividad busca limitar la interrupción al circuito afectado. Debe comprobarse con curvas, tablas del fabricante y niveles de cortocircuito."
  },
  "normativa-aea": {
    etapa: "15 · Aplicar normativa", titulo: "Antes de dimensionar",
    pregunta: "¿Qué corresponde hacer antes de aplicar una tabla de capacidad de corriente de conductores?",
    opciones: ["Usarla como valor universal", "Verificar norma vigente y condiciones de instalación y corrección", "Elegir el valor más alto disponible"],
    correcta: 1, pista: "La capacidad depende de más que la sección nominal.",
    explicacion: "Método de instalación, material, aislación, temperatura, agrupamiento y caída de tensión pueden modificar la selección. Consultá normativa vigente y documentación técnica."
  }
};

export function activarGuia(container, id) {
  const m = MISIONES[id];
  if (!m || container.querySelector(".mision-aprendizaje")) return;
  const figure = container.querySelector(".diagrama-card");
  const panel = document.createElement("section");
  panel.className = "mision-aprendizaje";
  panel.setAttribute("aria-labelledby", "mision-titulo");
  panel.innerHTML = `
    <div class="mision-topline"><span>${m.etapa}</span><span class="mision-duracion">2 min</span></div>
    <h3 id="mision-titulo">${m.titulo}</h3>
    <p class="mision-pregunta">${m.pregunta}</p>
    <div class="mision-opciones" role="group" aria-label="Respuestas posibles">
      ${m.opciones.map((o, i) => `<button type="button" class="mision-opcion" data-opcion="${i}">${o}</button>`).join("")}
    </div>
    <div class="mision-acciones">
      <button type="button" class="mision-pista">Ver una pista</button>
      <span class="mision-estado" role="status" aria-live="polite">Elegí una respuesta para comprobar tu comprensión.</span>
    </div>
    <p class="mision-ayuda" hidden></p>
    <p class="mision-explicacion" hidden></p>
  `;
  if (figure) figure.insertAdjacentElement("afterend", panel);
  else container.querySelector("section.sim")?.append(panel);
  const estado = panel.querySelector(".mision-estado");
  const ayuda = panel.querySelector(".mision-ayuda");
  const explicacion = panel.querySelector(".mision-explicacion");
  let seleccion = null;
  panel.querySelectorAll(".mision-opcion").forEach((btn) => {
    btn.addEventListener("click", () => {
      seleccion = Number(btn.dataset.opcion);
      panel.querySelectorAll(".mision-opcion").forEach((b) => {
        b.classList.toggle("is-selected", b === btn);
        b.classList.remove("is-correcta", "is-incorrecta");
      });
      ayuda.hidden = true;
      explicacion.hidden = true;
      estado.textContent = "Respuesta seleccionada. Volvé a tocarla para comprobar.";
      if (btn.dataset.confirmada === "si") {
        btn.dataset.confirmada = "no";
        estado.textContent = "Respuesta cambiada. Volvé a tocar para comprobar.";
      } else {
        btn.dataset.confirmada = "si";
      }
    });
  });
  panel.querySelectorAll(".mision-opcion").forEach((btn) => {
    btn.addEventListener("dblclick", () => comprobar());
  });
  function comprobar() {
    if (seleccion === null) {
      estado.textContent = "Primero elegí una opción.";
      return;
    }
    const correcta = seleccion === m.correcta;
    panel.querySelectorAll(".mision-opcion").forEach((b, i) => {
      b.classList.toggle("is-correcta", i === m.correcta);
      b.classList.toggle("is-incorrecta", i === seleccion && !correcta);
      b.setAttribute("aria-pressed", String(i === seleccion));
    });
    estado.textContent = correcta ? "¡Bien! Comprendiste el concepto." : "Todavía no. Revisá la explicación y probá otra vez.";
    explicacion.textContent = m.explicacion;
    explicacion.hidden = false;
  }
  const comprobarBtn = document.createElement("button");
  comprobarBtn.type = "button";
  comprobarBtn.className = "mision-comprobar";
  comprobarBtn.textContent = "Comprobar respuesta";
  comprobarBtn.addEventListener("click", comprobar);
  panel.querySelector(".mision-acciones").prepend(comprobarBtn);
  panel.querySelector(".mision-pista").addEventListener("click", () => {
    ayuda.textContent = m.pista;
    ayuda.hidden = false;
  });
}

export const IDS_MISIONES = Object.freeze(Object.keys(MISIONES));
export function obtenerMision(id) {
  return MISIONES[id] || null;
}

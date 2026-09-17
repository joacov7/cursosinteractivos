// Landing de venta del curso (página de inicio).
// Presenta la propuesta, el diferencial, qué incluye, el temario, los planes y
// preguntas frecuentes. Los CTA llevan a probar gratis y a los planes.
//
// PRECIOS Y TEXTOS EDITABLES: cambiá los valores de CONFIG abajo. Los precios se
// muestran tal cual; ajustalos al valor del momento (en Argentina, seguí el dólar).

import { CURRICULA } from "../data/curricula.js";

const CONFIG = {
  // Precio del curso completo. Editá moneda y montos según el momento.
  // Público principiante: precio accesible + cuotas (clave en Argentina).
  moneda: "$",
  precioLista: "24.900", // precio "regular" (anclaje, aparece tachado)
  precioLanzamiento: "14.900", // precio de lanzamiento destacado
  cuotas: "3 cuotas sin interés", // financiación (Mercado Pago)
  // Primer tema gratis para enganchar (ruta del simulador).
  ctaGratis: "#/sim/cable-termica",
  // A dónde manda "Comprar" (por ahora, ancla a planes; luego, checkout real).
  ctaComprar: "#planes",
};

const DIFERENCIALES = [
  { icono: "🌱", titulo: "Desde cero", texto: "No necesitás saber nada de electricidad. Arrancás por lo más simple y avanzás de a poco." },
  { icono: "🧪", titulo: "Aprendés haciendo", texto: "Probás combinaciones y ves qué falla en la pantalla, no en una instalación real." },
  { icono: "⚠️", titulo: "Seguridad primero", texto: "Cada simulación arranca con la regla de seguridad real y cierra recordando que la obra la hace un matriculado." },
  { icono: "📱", titulo: "A tu ritmo, desde el celu", texto: "100% online, sin horarios. Entrás cuando quieras desde el teléfono o la compu." },
];

const FAQS = [
  {
    q: "¿El certificado me habilita a trabajar de electricista?",
    a: "No. Es un certificado de capacitación con fines educativos. La habilitación profesional (matrícula) la otorga el organismo correspondiente de tu jurisdicción. Este curso te forma y te prepara, no reemplaza la matrícula.",
  },
  {
    q: "¿Necesito conocimientos previos?",
    a: "No, ninguno. El curso está pensado para quien nunca tocó electricidad: arranca desde lo más básico (la Ley de Ohm) y va subiendo de a poco, con explicaciones simples y simulaciones en cada tema.",
  },
  {
    q: "¿Para qué me sirve al terminar?",
    a: "Para entender de verdad cómo funciona una instalación eléctrica: dimensionar cables y protecciones, armar un tablero y trabajar con seguridad. Es una base sólida para seguir formándote en el oficio (la habilitación para ejercer la da la matrícula, aparte).",
  },
  {
    q: "¿Cómo se cursa?",
    a: "Es 100% online y a tu ritmo, sin horarios. Entrás desde el celular o la compu, hacés las simulaciones y rendís el quiz de cierre de cada tema. Al aprobar los tres niveles, obtenés el certificado.",
  },
  {
    q: "¿Puedo probar antes de pagar?",
    a: "Sí. El simulador de Cable + Térmica está abierto para que veas cómo funciona. El resto del curso se desbloquea con la compra.",
  },
  {
    q: "¿Vienen más oficios?",
    a: "Sí: plomería, refrigeración y mecánica están en camino. Quien compre ahora tendrá condiciones preferenciales cuando se sumen.",
  },
];

export function render(container) {
  const totalTemas = CURRICULA.flatMap((b) => b.temas).length;

  container.innerHTML = `
    <section class="landing">
      <!-- HERO -->
      <div class="hero">
        <span class="hero-badge">Curso online · Para principiantes · Norma argentina</span>
        <h1 class="hero-titulo">Aprendé electricidad desde cero, sin arriesgarte</h1>
        <p class="hero-sub">
          Sin saber nada de antes. Un curso con <strong>${totalTemas} simulaciones interactivas</strong>
          donde te equivocás en la pantalla, no en una instalación real. Empezás por lo más simple y
          terminás armando un tablero, con seguridad en cada paso y certificado al final.
        </p>
        <div class="hero-cta">
          <button type="button" class="btn-grande" data-scroll="planes">Ver planes y precios</button>
          <a class="btn-grande btn-grande--sec" href="${CONFIG.ctaGratis}">Probar gratis una simulación</a>
        </div>
        <p class="hero-nota">Sin conocimientos previos · A tu ritmo · Desde el celular</p>
      </div>

      <!-- DIFERENCIALES -->
      <div class="landing-seccion">
        <h2>Por qué es distinto a un video o un PDF</h2>
        <div class="dif-grid">
          ${DIFERENCIALES.map(
            (d) => `
            <div class="dif-card">
              <span class="dif-icono">${d.icono}</span>
              <h3>${d.titulo}</h3>
              <p>${d.texto}</p>
            </div>`
          ).join("")}
        </div>
      </div>

      <!-- NÚMEROS -->
      <div class="landing-seccion">
        <div class="nums">
          <div class="num"><strong>${totalTemas}</strong><span>simuladores interactivos</span></div>
          <div class="num"><strong>3</strong><span>niveles: básico a avanzado</span></div>
          <div class="num"><strong>64</strong><span>preguntas de repaso</span></div>
          <div class="num"><strong>1</strong><span>certificado de finalización</span></div>
        </div>
      </div>

      <!-- TEMARIO -->
      <div class="landing-seccion">
        <h2>Qué vas a aprender</h2>
        <div class="temario-cols">
          ${CURRICULA.map(
            (b) => `
            <div class="temario-col">
              <h3>${b.titulo}</h3>
              <ul>${b.temas.map((t) => `<li>${t.titulo}</li>`).join("")}</ul>
            </div>`
          ).join("")}
        </div>
      </div>

      <!-- PLANES -->
      <div class="landing-seccion" id="planes">
        <h2>Planes</h2>
        <div class="planes">
          <div class="plan">
            <h3>Prueba gratis</h3>
            <p class="plan-precio">${CONFIG.moneda}0</p>
            <ul class="plan-items">
              <li>✔ Simulador de Cable + Térmica</li>
              <li>✔ Acceso al catálogo de componentes</li>
              <li>✖ Resto de simuladores</li>
              <li>✖ Certificado</li>
            </ul>
            <a class="btn-grande btn-grande--sec" href="${CONFIG.ctaGratis}">Probar ahora</a>
          </div>

          <div class="plan plan--destacado">
            <span class="plan-tag">Más elegido</span>
            <h3>Curso completo de Electricidad</h3>
            <p class="plan-precio">
              <span class="plan-tachado">${CONFIG.moneda}${CONFIG.precioLista}</span>
              ${CONFIG.moneda}${CONFIG.precioLanzamiento}
            </p>
            <p class="plan-precio-nota">Pago único · ${CONFIG.cuotas} · acceso de por vida</p>
            <ul class="plan-items">
              <li>✔ Los ${totalTemas} simuladores (3 niveles)</li>
              <li>✔ Quiz de cierre por tema</li>
              <li>✔ Catálogo de componentes</li>
              <li>✔ Certificado de finalización</li>
            </ul>
            <a class="btn-grande" href="${CONFIG.ctaComprar}" data-comprar>Comprar</a>
          </div>

          <div class="plan">
            <h3>Todos los oficios</h3>
            <p class="plan-precio">Pronto</p>
            <ul class="plan-items">
              <li>✔ Electricidad</li>
              <li>· Plomería (en camino)</li>
              <li>· Refrigeración (en camino)</li>
              <li>· Mecánica (en camino)</li>
            </ul>
            <a class="btn-grande btn-grande--sec" href="#planes" data-aviso>Avisame cuando salga</a>
          </div>
        </div>
        <p class="planes-disclaimer">
          Certificado educativo, no habilita como matrícula profesional. Precios de referencia,
          ajustables al momento de la compra.
        </p>
      </div>

      <!-- FAQ -->
      <div class="landing-seccion">
        <h2>Preguntas frecuentes</h2>
        <div class="faqs">
          ${FAQS.map(
            (f) => `
            <details class="faq">
              <summary>${f.q}</summary>
              <p>${f.a}</p>
            </details>`
          ).join("")}
        </div>
      </div>

      <!-- CTA FINAL -->
      <div class="cta-final">
        <h2>Empezá hoy</h2>
        <p>Probá una simulación gratis y, si te gusta, desbloqueá el curso completo.</p>
        <div class="hero-cta">
          <a class="btn-grande" href="${CONFIG.ctaGratis}">Probar gratis</a>
          <button type="button" class="btn-grande btn-grande--sec" data-scroll="planes">Ver planes</button>
        </div>
      </div>
    </section>
  `;

  // Scroll suave a una sección de la propia landing (sin tocar el hash-router).
  container.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", () => {
      const destino = container.querySelector(`#${el.dataset.scroll}`);
      if (destino) destino.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Los botones de compra todavía no tienen checkout: avisamos con claridad en
  // vez de simular un pago. Cuando exista el paywall, se cambia por el flujo real.
  container.querySelectorAll("[data-comprar], [data-aviso]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      let aviso = container.querySelector("#compra-aviso");
      if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "compra-aviso";
        aviso.className = "aviso-seguridad";
        aviso.setAttribute("role", "note");
        el.closest(".plan").appendChild(aviso);
      }
      aviso.innerHTML = el.hasAttribute("data-aviso")
        ? "<strong>Anotado.</strong> El combo de todos los oficios está en preparación."
        : "<strong>Checkout en preparación.</strong> Acá irá el pago (Mercado Pago) y el desbloqueo del curso.";
    });
  });
}

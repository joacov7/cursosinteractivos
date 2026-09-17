// Certificado de finalización (spec sección 6).
// Se habilita cuando el alumno aprobó los quizzes de los tres niveles. Es un
// certificado EDUCATIVO / de capacitación, NO una matrícula habilitante.

import { CURRICULA } from "../data/curricula.js";
import { cursoCompleto, getNombre, setNombre } from "./progreso.js";

const OFICIO = "electricidad";

export function render(container, { onCambioProgreso } = {}) {
  const temaIds = CURRICULA.flatMap((b) => b.temas.map((t) => t.id));
  const completo = cursoCompleto(OFICIO, temaIds);

  if (!completo) {
    container.innerHTML = `
      <section class="sim">
        <h2>Certificado</h2>
        <div class="resultado resultado--falla">
          <div class="resultado-cabecera">
            <span class="badge">Aún no disponible</span>
            <p>El certificado se habilita al aprobar el quiz de cierre de <strong>los tres niveles</strong>
            (Básico, Intermedio y Avanzado). Completá los temas que te falten en el temario.</p>
          </div>
        </div>
      </section>`;
    return;
  }

  const nombre = getNombre();
  const fecha = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  container.innerHTML = `
    <section class="sim cert-wrap">
      <h2>Certificado de finalización</h2>
      <p class="sim-intro">
        ¡Completaste el curso! Ingresá tu nombre y descargá o imprimí tu certificado.
      </p>

      <div class="controles cert-controles">
        <label>
          Nombre y apellido
          <input type="text" id="cert-nombre" value="${nombre.replace(/"/g, "&quot;")}" placeholder="Tu nombre" />
        </label>
        <button type="button" id="cert-imprimir" class="btn-primario">Imprimir / Guardar PDF</button>
      </div>

      <article class="certificado" id="certificado">
        <div class="cert-borde">
          <p class="cert-encabezado">Cursos Interactivos · Módulo Electricidad</p>
          <p class="cert-titulo">Certificado de finalización</p>
          <p class="cert-otorga">Se certifica que</p>
          <p class="cert-alumno" id="cert-alumno">${nombre || "—"}</p>
          <p class="cert-detalle">
            completó satisfactoriamente el curso de <strong>Electricidad</strong>, aprobando los quizzes
            de los niveles <strong>Básico</strong>, <strong>Intermedio</strong> y <strong>Avanzado</strong>.
          </p>
          <p class="cert-fecha">Emitido el ${fecha}</p>
          <p class="cert-disclaimer">
            Certificado de capacitación con fines educativos. <strong>No constituye matrícula ni
            habilitación profesional.</strong> Las instalaciones reales las realiza o supervisa un
            electricista matriculado.
          </p>
        </div>
      </article>

      <p class="cierre-educativo">
        Este certificado acredita la finalización del curso educativo, no habilita para ejercer.
      </p>
    </section>
  `;

  const inputNombre = container.querySelector("#cert-nombre");
  const alumno = container.querySelector("#cert-alumno");

  inputNombre.addEventListener("input", () => {
    const v = inputNombre.value.trim();
    alumno.textContent = v || "—";
    setNombre(v);
    if (typeof onCambioProgreso === "function") onCambioProgreso();
  });

  container.querySelector("#cert-imprimir").addEventListener("click", () => {
    if (!inputNombre.value.trim()) {
      inputNombre.focus();
      return;
    }
    window.print();
  });
}

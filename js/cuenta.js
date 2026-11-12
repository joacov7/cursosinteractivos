import * as api from "./api-client.js";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

const money = (minor, currency = "ARS") => new Intl.NumberFormat("es-AR", {
  style: "currency", currency, maximumFractionDigits: 2,
}).format((minor || 0) / 100);

function notice(container, message, kind = "info") {
  const el = container.querySelector("[data-notice]");
  if (!el) return;
  el.className = `account-notice account-notice--${kind}`;
  el.textContent = message;
  el.hidden = false;
}

function layout(container, title, subtitle = "") {
  container.innerHTML = `
    <section class="account-page">
      <div class="account-heading">
        <div><p class="account-eyebrow">CURSOS INTERACTIVOS</p><h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(subtitle)}</p></div>
        <a class="account-back" href="#/">Volver al curso</a>
      </div>
      <div data-notice class="account-notice" role="status" hidden></div>
      <div data-account-content></div>
    </section>`;
  return container.querySelector("[data-account-content]");
}

function authForms(container, content) {
  content.innerHTML = `
    <div class="account-grid">
      <form class="account-card" id="account-login">
        <h3>Ya tengo cuenta</h3>
        <label>Correo electrónico<input name="email" type="email" autocomplete="email" required maxlength="320"></label>
        <label>Contraseña<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn-primario" type="submit">Ingresar</button>
        <button class="account-link" type="button" data-forgot>Olvidé mi contraseña</button>
      </form>
      <form class="account-card" id="account-register">
        <h3>Crear cuenta</h3>
        <label>Nombre y apellido<input name="full_name" autocomplete="name" required minlength="2" maxlength="160"></label>
        <label>Correo electrónico<input name="email" type="email" autocomplete="email" required maxlength="320"></label>
        <label>Contraseña<input name="password" type="password" autocomplete="new-password" required minlength="12" maxlength="128"><small>Al menos 12 caracteres.</small></label>
        <button class="btn-primario" type="submit">Crear cuenta</button>
        <p class="account-muted">Te enviaremos un correo para verificar tu dirección antes de ingresar.</p>
      </form>
    </div>`;

  content.querySelector("#account-login").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const data = new FormData(form);
      await api.login(data.get("email"), data.get("password"));
      await renderDashboard(container);
    } catch (error) {
      notice(container, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  content.querySelector("#account-register").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const data = new FormData(form);
      await api.register(data.get("full_name"), data.get("email"), data.get("password"));
      notice(container, "Cuenta creada. Revisá tu correo y abrí el enlace de verificación antes de ingresar.", "success");
      form.reset();
    } catch (error) {
      notice(container, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  content.querySelector("[data-forgot]").addEventListener("click", () => {
    const email = content.querySelector("#account-login [name=email]").value;
    const wrapper = document.createElement("form");
    wrapper.className = "account-card account-reset-request";
    wrapper.innerHTML = `
      <h3>Recuperar contraseña</h3>
      <p>Te enviaremos un enlace si existe una cuenta asociada a ese correo.</p>
      <label>Correo electrónico<input name="email" type="email" required value="${escapeHtml(email)}"></label>
      <button class="btn-primario" type="submit">Enviar instrucciones</button>`;
    content.replaceChildren(wrapper);
    wrapper.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = wrapper.querySelector("button");
      button.disabled = true;
      try {
        await api.requestPasswordReset(new FormData(wrapper).get("email"));
        notice(container, "Si la cuenta existe, recibirás instrucciones para restablecer la contraseña.", "success");
        wrapper.reset();
      } catch (error) {
        notice(container, error.message, "error");
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function renderDashboard(container) {
  const content = layout(container, "Mi aprendizaje", "Tus cursos, contenidos y avance quedan asociados a tu cuenta.");
  const user = api.getUser();
  content.innerHTML = `
    <div class="account-welcome">
      <div><span class="account-muted">Sesión iniciada</span><h3>${escapeHtml(user?.full_name || "Alumno")}</h3>
      <p>${escapeHtml(user?.email || "")}</p></div>
      <button type="button" class="account-logout" data-logout>Cerrar sesión</button>
    </div>
    <div class="account-courses" data-courses><p>Cargando tus cursos…</p></div>
    <h3 class="account-section-title">Catálogo disponible</h3>
    <div class="account-courses" data-catalog><p>Cargando catálogo…</p></div>`;

  content.querySelector("[data-logout]").addEventListener("click", async () => {
    try { await api.logout(); } catch { /* se limpia la sesión local igualmente */ }
    await renderAuth(container);
  });

  const [mineResult, catalogResult] = await Promise.allSettled([api.getMyCourses(), api.getCourses()]);
  const mine = content.querySelector("[data-courses]");
  if (mineResult.status === "fulfilled") {
    mine.innerHTML = mineResult.value.length
      ? mineResult.value.map((item) => courseCard(item.course, item.enrollment_source)).join("")
      : '<div class="account-empty"><strong>Todavía no tenés cursos habilitados.</strong><p>Cuando se publique un curso gratuito o se confirme una compra, aparecerá acá.</p></div>';
  } else {
    mine.innerHTML = `<p class="account-error">${escapeHtml(mineResult.reason.message)}</p>`;
  }

  const catalog = content.querySelector("[data-catalog]");
  if (catalogResult.status === "fulfilled") {
    catalog.innerHTML = catalogResult.value.length
      ? catalogResult.value.map((course) => courseCard(course, "catalog")).join("")
      : '<div class="account-empty"><strong>El catálogo se está preparando.</strong><p>Los cursos aparecerán acá cuando se publiquen desde la plataforma.</p></div>';
  } else {
    catalog.innerHTML = `<p class="account-error">${escapeHtml(catalogResult.reason.message)}</p>`;
  }

  content.querySelectorAll("[data-open-course]").forEach((button) => {
    button.addEventListener("click", () => openCourse(container, button.dataset.openCourse));
  });
}

function courseCard(course, source) {
  const description = course.description || "Curso interactivo con lecciones y simulaciones.";
  return `
    <article class="account-course-card">
      <div><span class="account-course-tag">${source === "catalog" ? "CATÁLOGO" : source === "free" ? "GRATUITO" : "HABILITADO"}</span>
      <h4>${escapeHtml(course.title)}</h4><p>${escapeHtml(description)}</p>
      <strong>${course.price_minor === 0 ? "Gratis" : money(course.price_minor, course.currency)}</strong></div>
      <button type="button" class="btn-primario" data-open-course="${escapeHtml(course.slug)}">Ver curso</button>
    </article>`;
}

async function openCourse(container, slug) {
  const content = layout(container, "Curso", "Consultando el contenido y tus permisos de acceso…");
  try {
    const course = await api.getCourse(slug);
    content.innerHTML = `
      <div class="account-course-intro"><span class="account-course-tag">${course.access_granted ? "ACCESO HABILITADO" : "VISTA PREVIA"}</span>
      <h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description || "")}</p>
      ${course.access_granted ? "" : '<p class="account-locked-note">Podés ver las clases de muestra. El resto se habilita con una inscripción activa.</p>'}</div>
      <div class="account-modules">${course.modules.map((module) => `
        <section class="account-module"><h4>${escapeHtml(module.title)}</h4>
          <ol>${module.lessons.map((lesson) => `
            <li class="account-lesson ${lesson.locked ? "account-lesson--locked" : ""}">
              <div><strong>${escapeHtml(lesson.title)}</strong>
                <span>${lesson.locked ? "Contenido bloqueado" : lesson.is_preview ? "Clase de muestra" : "Disponible"}</span>
              </div>
              ${lesson.locked ? '<span aria-label="Bloqueado">🔒</span>' : `
                <div class="account-lesson-actions">
                  ${lesson.simulator_key ? `<a href="#/sim/${encodeURIComponent(lesson.simulator_key)}">Abrir simulador</a>` : ""}
                  <button type="button" data-complete="${lesson.id}">Marcar completa</button>
                </div>
                ${lesson.content ? `<details><summary>Ver contenido</summary><p class="account-lesson-content">${escapeHtml(lesson.content)}</p></details>` : ""}
              `}
            </li>`).join("")}</ol>
        </section>`).join("")}</div>
      <button type="button" class="account-back-button" data-back>← Volver a mis cursos</button>`;

    content.querySelector("[data-back]").addEventListener("click", () => renderDashboard(container));
    content.querySelectorAll("[data-complete]").forEach((button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await api.saveProgress(button.dataset.complete);
          button.textContent = "✓ Completada";
          notice(container, "Avance guardado en tu cuenta.", "success");
        } catch (error) {
          notice(container, error.message, "error");
          button.disabled = false;
        }
      });
    });
  } catch (error) {
    notice(container, error.message, "error");
    content.innerHTML = '<button type="button" class="account-back-button" data-back>Volver a mi cuenta</button>';
    content.querySelector("[data-back]").addEventListener("click", () => renderDashboard(container));
  }
}

async function renderAuth(container) {
  const content = layout(container, "Ingresá o creá tu cuenta", "Guardá tu progreso y accedé a los cursos habilitados.");
  authForms(container, content);
}

export async function render(container, mode = {}) {
  if (mode.token && mode.action === "verify") {
    const content = layout(container, "Verificación de correo", "Confirmá tu dirección para habilitar el ingreso.");
    content.innerHTML = "<p>Verificando enlace…</p>";
    try {
      await api.verifyEmail(mode.token);
      content.innerHTML = '<div class="account-empty"><strong>Correo verificado correctamente.</strong><p>Ya podés ingresar a tu cuenta.</p><a class="btn-primario account-cta" href="#/cuenta">Ir a mi cuenta</a></div>';
    } catch (error) {
      content.innerHTML = `<p class="account-error">${escapeHtml(error.message)}</p><a href="#/cuenta">Volver a mi cuenta</a>`;
    }
    return;
  }

  if (mode.token && mode.action === "reset") {
    const content = layout(container, "Elegí una nueva contraseña", "El enlace es de un solo uso y tiene vencimiento.");
    content.innerHTML = `
      <form class="account-card account-reset-form">
        <label>Nueva contraseña<input name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></label>
        <label>Repetir contraseña<input name="confirm" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></label>
        <button class="btn-primario" type="submit">Actualizar contraseña</button>
      </form>`;
    content.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      if (data.get("password") !== data.get("confirm")) {
        notice(container, "Las contraseñas no coinciden.", "error");
        return;
      }
      try {
        await api.resetPassword(mode.token, data.get("password"));
        notice(container, "Contraseña actualizada. Ingresá con tu nueva contraseña.", "success");
        content.innerHTML = '<a class="btn-primario account-cta" href="#/cuenta">Ir a ingresar</a>';
      } catch (error) {
        notice(container, error.message, "error");
      }
    });
    return;
  }

  if (await api.refreshSession()) {
    await renderDashboard(container);
  } else {
    await renderAuth(container);
  }
}

const API_BASE_URL = (
  document.querySelector('meta[name="api-base-url"]')?.content || "http://localhost:8000"
).replace(/\/$/, "");

let accessToken = null;
let currentUser = null;

export function getUser() {
  return currentUser;
}

export function clearSession() {
  accessToken = null;
  currentUser = null;
}

async function request(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisá la dirección de la API y que esté en línea.");
  }

  if (response.status === 401 && retry && path !== "/api/v1/auth/refresh") {
    const refreshed = await refreshSession(false);
    if (refreshed) return request(path, options, false);
  }

  if (!response.ok) {
    let detail = "Ocurrió un error. Intentá nuevamente.";
    try {
      const data = await response.json();
      detail = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join(", ")
        : (data.detail || detail);
      if (response.status === 429) detail = "Demasiados intentos. Esperá un momento antes de volver a probar.";
    } catch { /* respuesta sin JSON */ }
    throw new Error(detail);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function login(email, password) {
  const data = await request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);
  accessToken = data.access_token;
  currentUser = data.user;
  return currentUser;
}

export async function register(fullName, email, password) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name: fullName, email, password }),
  }, false);
}

export async function refreshSession(throwOnError = false) {
  try {
    const data = await request("/api/v1/auth/refresh", { method: "POST" }, false);
    accessToken = data.access_token;
    currentUser = data.user;
    return true;
  } catch (error) {
    clearSession();
    if (throwOnError) throw error;
    return false;
  }
}

export async function logout() {
  try {
    await request("/api/v1/auth/logout", { method: "POST" }, false);
  } finally {
    clearSession();
  }
}

export async function verifyEmail(token) {
  return request("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  }, false);
}

export async function requestPasswordReset(email) {
  return request("/api/v1/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  }, false);
}

export async function resetPassword(token, newPassword) {
  return request("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  }, false);
}

export async function getCourses() {
  return request("/api/v1/courses");
}

export async function getMyCourses() {
  return request("/api/v1/me/courses");
}

export async function getCourse(slug) {
  return request(`/api/v1/courses/${encodeURIComponent(slug)}`);
}

export async function saveProgress(lessonId, status = "completed") {
  return request(`/api/v1/lessons/${encodeURIComponent(lessonId)}/progress`, {
    method: "PUT",
    body: JSON.stringify({
      status,
      progress_percent: status === "completed" ? 100 : 0,
    }),
  });
}

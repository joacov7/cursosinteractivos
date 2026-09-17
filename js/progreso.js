// Progreso del alumno por tema (aprobó el quiz de cierre).
// Se guarda en localStorage como conveniencia por-visitante. Es solo eso: para
// un curso vendible con certificado de valor, el progreso real debe validarse
// en un backend (ver README → "Pendiente / producto").
//
// Clave por tema para que el sistema sirva igual a los próximos oficios
// (plomería, refrigeración, mecánica): "electricidad:1.1", etc.

const KEY = "cursos-interactivos:progreso";

function leerTodo() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function guardarTodo(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {
    /* modo privado / storage bloqueado: el progreso no persiste, la app sigue */
  }
}

export function claveTema(oficio, temaId) {
  return `${oficio}:${temaId}`;
}

export function estaAprobado(oficio, temaId) {
  return Boolean(leerTodo()[claveTema(oficio, temaId)]);
}

export function marcarAprobado(oficio, temaId, puntaje) {
  const todo = leerTodo();
  todo[claveTema(oficio, temaId)] = { aprobado: true, puntaje, fecha: new Date().toISOString() };
  guardarTodo(todo);
}

// Devuelve { aprobados, total } para una lista de ids de tema de un oficio.
export function resumenNivel(oficio, temaIds) {
  const todo = leerTodo();
  const aprobados = temaIds.filter((id) => todo[claveTema(oficio, id)]).length;
  return { aprobados, total: temaIds.length };
}

// True si TODOS los temas del oficio están aprobados (habilita el certificado).
export function cursoCompleto(oficio, temaIds) {
  const { aprobados, total } = resumenNivel(oficio, temaIds);
  return total > 0 && aprobados === total;
}

// Nombre del alumno para el certificado (persistido como conveniencia).
const KEY_NOMBRE = "cursos-interactivos:nombre";
export function getNombre() {
  try {
    return localStorage.getItem(KEY_NOMBRE) || "";
  } catch {
    return "";
  }
}
export function setNombre(nombre) {
  try {
    localStorage.setItem(KEY_NOMBRE, nombre);
  } catch {
    /* storage bloqueado: el nombre no persiste */
  }
}

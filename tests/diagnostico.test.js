import test from "node:test";
import assert from "node:assert/strict";
import { CASOS_DIAGNOSTICO, evaluarRespuestaDiagnostico } from "../js/workbench/diagnostico.js";

test("cada falla disponible tiene tres pasos de diagnóstico", () => {
  for (const falla of ["conductor-abierto", "puente-termica", "corto-fase-neutro"]) {
    assert.equal(CASOS_DIAGNOSTICO[falla].pasos.length, 3);
    assert.ok(CASOS_DIAGNOSTICO[falla].pasos.every((p) => p.opciones.length === 3));
  }
});

test("el diagnóstico de conductor abierto prioriza desenergizar antes de continuidad", () => {
  const r = evaluarRespuestaDiagnostico("conductor-abierto", 0, 0);
  assert.equal(r.valida, true);
  assert.equal(r.correcta, true);
  assert.match(r.explicacion, /desenergizado/);
});

test("el diagnóstico rechaza continuidad con fuente conectada como práctica segura", () => {
  const r = evaluarRespuestaDiagnostico("conductor-abierto", 0, 1);
  assert.equal(r.valida, true);
  assert.equal(r.correcta, false);
});

test("el diagnóstico del puente identifica la térmica fuera de serie", () => {
  const r = evaluarRespuestaDiagnostico("puente-termica", 2, 0);
  assert.equal(r.correcta, true);
  assert.match(r.explicacion, /camino alternativo/);
});

test("el diagnóstico de corto no inventa Icc ni actuación de protección", () => {
  const r = evaluarRespuestaDiagnostico("corto-fase-neutro", 2, 0);
  assert.equal(r.correcta, true);
  assert.match(r.explicacion, /impedancia/);
});

test("un caso o paso inexistente no se considera una respuesta válida", () => {
  assert.equal(evaluarRespuestaDiagnostico("ninguna", 0, 0).valida, false);
  assert.equal(evaluarRespuestaDiagnostico("corto-fase-neutro", 99, 0).valida, false);
});

import test from "node:test";
import assert from "node:assert/strict";

import { CURRICULA, AVISO_EDUCATIVO } from "../data/curricula.js";
import { QUIZZES, UMBRAL_APROBACION } from "../data/quizzes.js";

import * as cableTermica from "../js/simuladores/cable-termica.js";
import * as ohmPotencia from "../js/simuladores/ohm-potencia.js";
import * as cortoSobrecarga from "../js/simuladores/corto-sobrecarga.js";
import * as puestaTierra from "../js/simuladores/puesta-tierra.js";
import * as polaridad from "../js/simuladores/polaridad.js";
import * as serieParalelo from "../js/simuladores/serie-paralelo.js";
import * as cargasAmbiente from "../js/simuladores/cargas-ambiente.js";
import * as diferencial from "../js/simuladores/diferencial.js";
import * as tablero from "../js/simuladores/tablero.js";
import * as iluminacion from "../js/simuladores/iluminacion.js";
import * as trifasica from "../js/simuladores/trifasica.js";
import * as motoresArranque from "../js/simuladores/motores-arranque.js";
import * as compresorDiagnostico from "../js/simuladores/compresor-diagnostico.js";
import * as selectividad from "../js/simuladores/selectividad.js";
import * as normativaAea from "../js/simuladores/normativa-aea.js";

const SIMULADORES = {
  "cable-termica": cableTermica,
  "ohm-potencia": ohmPotencia,
  "corto-sobrecarga": cortoSobrecarga,
  "puesta-tierra": puestaTierra,
  polaridad,
  "serie-paralelo": serieParalelo,
  "cargas-ambiente": cargasAmbiente,
  diferencial,
  tablero,
  iluminacion,
  trifasica,
  "motores-arranque": motoresArranque,
  "compresor-diagnostico": compresorDiagnostico,
  selectividad,
  "normativa-aea": normativaAea,
};

const temas = CURRICULA.flatMap((nivel) => nivel.temas);
const idsTemas = temas.map((tema) => tema.id);
const idsQuizzes = Object.keys(QUIZZES);

test("la currícula contiene 16 temas únicos en tres niveles", () => {
  assert.equal(CURRICULA.length, 3);
  assert.equal(temas.length, 16);
  assert.equal(new Set(idsTemas).size, idsTemas.length);
  assert.deepEqual(CURRICULA.map((nivel) => nivel.temas.length), [6, 5, 5]);
});

test("cada tema listo apunta a un simulador registrado y ejecutable", () => {
  for (const tema of temas) {
    assert.equal(tema.estado, "listo", `Tema ${tema.id} no está marcado como listo`);
    assert.ok(SIMULADORES[tema.sim], `Falta registrar el simulador ${tema.sim} del tema ${tema.id}`);
    assert.equal(typeof SIMULADORES[tema.sim].render, "function", `El simulador ${tema.sim} no exporta render()`);
  }
  assert.equal(new Set(temas.map((tema) => tema.sim)).size, 15);
});

test("cada tema tiene un quiz de cuatro preguntas bien formado", () => {
  assert.deepEqual(idsQuizzes.sort(), [...idsTemas].sort());
  for (const tema of temas) {
    const quiz = QUIZZES[tema.id];
    assert.ok(quiz.tema, `Falta el título del quiz ${tema.id}`);
    assert.equal(quiz.preguntas.length, 4, `El quiz ${tema.id} debe tener cuatro preguntas`);
    for (const [i, pregunta] of quiz.preguntas.entries()) {
      assert.ok(pregunta.q, `Pregunta ${i + 1} vacía en ${tema.id}`);
      assert.equal(pregunta.opciones.length, 4, `Opciones incorrectas en ${tema.id}, pregunta ${i + 1}`);
      assert.ok(Number.isInteger(pregunta.correcta));
      assert.ok(pregunta.correcta >= 0 && pregunta.correcta < pregunta.opciones.length);
      assert.ok(pregunta.explicacion, `Falta explicación en ${tema.id}, pregunta ${i + 1}`);
    }
  }
});

test("el umbral de aprobación y el aviso de seguridad están definidos", () => {
  assert.equal(UMBRAL_APROBACION, 0.7);
  assert.match(AVISO_EDUCATIVO, /simulación educativa/i);
  assert.match(AVISO_EDUCATIVO, /electricista matriculado/i);
});

test("el certificado inserta el nombre del alumno como texto, nunca como HTML", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../js/certificado.js", import.meta.url), "utf8");
  assert.match(source, /inputNombre\.value = nombre/);
  assert.match(source, /alumno\.textContent = nombre \|\| "—"/);
  assert.doesNotMatch(source, /id="cert-alumno">\$\{nombre/);
  assert.doesNotMatch(source, /id="cert-nombre"[^>]*value="\$\{nombre/);
});

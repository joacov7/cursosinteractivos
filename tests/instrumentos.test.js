import test from "node:test";
import assert from "node:assert/strict";
import { calcularLectura } from "../js/workbench/instrumentos.js";

const nodes = [{ tipo: "fuente" }, { tipo: "carga" }];
test("multímetro mide tensión nominal ideal en la fuente", () => {
  assert.equal(calcularLectura({ estado: "incompleto" }, "tension", "fuente", nodes).valor, "220,0 V~");
});
test("multímetro no muestra tensión en carga con circuito abierto", () => {
  assert.equal(calcularLectura({ estado: "incompleto" }, "tension", "carga", nodes).valor, "0,0 V~");
});
test("corriente indica cero cuando no hay camino", () => {
  assert.equal(calcularLectura({ estado: "incompleto", I: 0 }, "corriente", "circuito", nodes).valor, "0,0 A");
});
test("corriente muestra estimación del modelo cuando energizado", () => {
  assert.equal(calcularLectura({ estado: "seguro", I: 14 }, "corriente", "circuito", nodes).valor, "14,0 A");
});
test("continuidad distingue camino y circuito abierto", () => {
  assert.equal(calcularLectura({ estado: "seguro", edgesActivos: ["e1"] }, "continuidad", "circuito", nodes).valor, "CONTINUIDAD");
  assert.equal(calcularLectura({ estado: "incompleto", edgesActivos: [] }, "continuidad", "circuito", nodes).valor, "ABIERTO");
});
test("térmica disparada informa corriente previa y no tensión en carga", () => {
  const result = { estado: "salta", I: 20, edgesActivos: ["e1"] };
  assert.equal(calcularLectura(result, "corriente", "circuito", nodes).valor, "20,0 A");
  assert.equal(calcularLectura(result, "tension", "carga", nodes).valor, "0,0 V~");
});

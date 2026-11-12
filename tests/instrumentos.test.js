import test from "node:test";
import assert from "node:assert/strict";
import { calcularLectura, crearEscenarioFalla } from "../js/workbench/instrumentos.js";

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

test("inyectar conductor abierto corta el tramo activo sin modificar el original", () => {
  const nodes = [{ id: "f1", tipo: "fuente", props: {}, ports: [] }, { id: "c1", tipo: "carga", props: {}, ports: [] }];
  const edges = [{ id: "e1", desde: "f1:F", hasta: "c1:F", mm2: 2.5, capacidadA: 16 }];
  const escenario = crearEscenarioFalla(nodes, edges, "conductor-abierto", () => ({ edgesActivos: ["e1"] }));
  assert.equal(escenario.edges.length, 0);
  assert.equal(escenario.edgeAbierto, "e1");
  assert.equal(edges.length, 1);
});
test("inyectar puente agrega una derivación de fase sin alterar el circuito original", () => {
  const nodes = [{ id: "f1", tipo: "fuente", props: {}, ports: [] }, { id: "t1", tipo: "termica", props: {}, ports: [] }, { id: "c1", tipo: "carga", props: {}, ports: [] }];
  const edges = [{ id: "e1", desde: "f1:F", hasta: "t1:in", mm2: 2.5, capacidadA: 16 }];
  const escenario = crearEscenarioFalla(nodes, edges, "puente-termica", () => ({ edgesActivos: [] }));
  assert.equal(escenario.edges.length, 2);
  assert.equal(escenario.edges[1].desde, "f1:F");
  assert.equal(escenario.edges[1].hasta, "c1:F");
  assert.equal(edges.length, 1);
});

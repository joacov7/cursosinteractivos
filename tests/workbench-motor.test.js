import test from "node:test";
import assert from "node:assert/strict";
import { crearNodo, crearEdge, idGlobalPuerto } from "../js/workbench/modelo.js";
import { evaluarCircuito } from "../js/workbench/motor.js";
import { RETOS } from "../js/workbench/retos.js";

function armado({ potencia = 3080, cable = 2.5, breaker = 16, conTermica = true } = {}) {
  const fuente = crearNodo("fuente", 0, 0);
  const termica = conTermica ? crearNodo("termica", 200, 0) : null;
  const carga = crearNodo("carga", 400, 0);
  carga.props.potencia = potencia;
  const nodes = [fuente, ...(termica ? [termica] : []), carga];
  const edges = [];
  if (termica) {
    termica.props.corriente = breaker;
    edges.push(crearEdge(idGlobalPuerto(fuente.id, "F"), idGlobalPuerto(termica.id, "in"), cable));
    edges.push(crearEdge(idGlobalPuerto(termica.id, "out"), idGlobalPuerto(carga.id, "F"), cable));
  } else {
    edges.push(crearEdge(idGlobalPuerto(fuente.id, "F"), idGlobalPuerto(carga.id, "F"), cable));
  }
  edges.push(crearEdge(idGlobalPuerto(carga.id, "N"), idGlobalPuerto(fuente.id, "N"), cable));
  return { nodes, edges, fuente, termica, carga };
}

test("un circuito con térmica en serie y valores compatibles resulta seguro", () => {
  const { nodes, edges } = armado();
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "seguro");
  assert.equal(r.breaker, 16);
  assert.deepEqual(r.warnings, []);
});

test("un circuito sin térmica nunca se marca seguro", () => {
  const { nodes, edges } = armado({ conTermica: false });
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "inseguro");
  assert.equal(r.breaker, null);
  assert.ok(r.warnings.length);
});

test("un cable que puentea la térmica invalida la protección", () => {
  const { nodes, edges, fuente, carga } = armado();
  edges.push(crearEdge(idGlobalPuerto(fuente.id, "F"), idGlobalPuerto(carga.id, "F"), 2.5));
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "inseguro");
  assert.equal(r.breaker, null);
});

test("un cable desconectado no reduce la capacidad del circuito activo", () => {
  const { nodes, edges } = armado();
  const a = crearNodo("carga", 0, 300);
  const b = crearNodo("carga", 200, 300);
  nodes.push(a, b);
  edges.push(crearEdge(idGlobalPuerto(a.id, "F"), idGlobalPuerto(b.id, "F"), 1.5));
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "seguro");
  assert.equal(r.capCable, 16);
});

test("una carga que excede cable y protección insuficiente provoca sobrecarga", () => {
  const { nodes, edges } = armado({ potencia: 6600, cable: 2.5, breaker: 32 });
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "sobrecarga");
  assert.equal(r.capCable, 16);
});

test("una térmica correctamente ubicada abre ante una corriente superior a su nominal", () => {
  const { nodes, edges } = armado({ potencia: 6600, cable: 6, breaker: 16 });
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "salta");
  assert.equal(r.breaker, 16);
});


test("una térmica bipolar requiere fase y neutro atravesando sus dos polos", () => {
  const fuente = crearNodo("fuente", 0, 0);
  const termica = crearNodo("termica", 200, 0);
  termica.props.polos = 2;
  const carga = crearNodo("carga", 400, 0);
  carga.props.potencia = 3080;
  const nodes = [fuente, termica, carga];
  const edges = [
    crearEdge(idGlobalPuerto(fuente.id, "F"), idGlobalPuerto(termica.id, "in"), 2.5),
    crearEdge(idGlobalPuerto(termica.id, "out"), idGlobalPuerto(carga.id, "F"), 2.5),
    crearEdge(idGlobalPuerto(fuente.id, "N"), idGlobalPuerto(termica.id, "inN"), 2.5),
    crearEdge(idGlobalPuerto(termica.id, "outN"), idGlobalPuerto(carga.id, "N"), 2.5),
  ];
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "seguro");
  assert.equal(r.breaker, 16);
});

test("una térmica bipolar no se considera en serie si el neutro la puentea", () => {
  const fuente = crearNodo("fuente", 0, 0);
  const termica = crearNodo("termica", 200, 0);
  termica.props.polos = 2;
  const carga = crearNodo("carga", 400, 0);
  const nodes = [fuente, termica, carga];
  const edges = [
    crearEdge(idGlobalPuerto(fuente.id, "F"), idGlobalPuerto(termica.id, "in"), 2.5),
    crearEdge(idGlobalPuerto(termica.id, "out"), idGlobalPuerto(carga.id, "F"), 2.5),
    crearEdge(idGlobalPuerto(fuente.id, "N"), idGlobalPuerto(termica.id, "inN"), 2.5),
    crearEdge(idGlobalPuerto(termica.id, "outN"), idGlobalPuerto(carga.id, "N"), 2.5),
    crearEdge(idGlobalPuerto(fuente.id, "N"), idGlobalPuerto(carga.id, "N"), 2.5),
  ];
  const r = evaluarCircuito(nodes, edges);
  assert.equal(r.estado, "inseguro");
  assert.equal(r.breaker, null);
});

test("el primer reto no acepta un circuito sin protección", () => {
  const { nodes, edges } = armado({ conTermica: false });
  const r = evaluarCircuito(nodes, edges);
  assert.equal(RETOS[0].validar(r, nodes, edges), false);
});

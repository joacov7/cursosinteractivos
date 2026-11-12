import test from "node:test";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

import * as ohm from "../js/simuladores/ohm-potencia.js";
import * as cable from "../js/simuladores/cable-termica.js";
import * as fallas from "../js/simuladores/corto-sobrecarga.js";
import * as tierra from "../js/simuladores/puesta-tierra.js";
import * as polaridad from "../js/simuladores/polaridad.js";
import * as serieParalelo from "../js/simuladores/serie-paralelo.js";
import * as cargas from "../js/simuladores/cargas-ambiente.js";
import * as diferencial from "../js/simuladores/diferencial.js";
import * as tablero from "../js/simuladores/tablero.js";
import * as iluminacion from "../js/simuladores/iluminacion.js";
import * as trifasica from "../js/simuladores/trifasica.js";
import * as motores from "../js/simuladores/motores-arranque.js";
import { evaluarArranque } from "../js/simuladores/motores-arranque.js";
import * as compresor from "../js/simuladores/compresor-diagnostico.js";
import * as selectividad from "../js/simuladores/selectividad.js";
import { evaluarCoordinacionNominal } from "../js/simuladores/selectividad.js";
import * as normativa from "../js/simuladores/normativa-aea.js";

import {
  svgOhm, svgCableBreaker, svgFalla, svgTierra, svgPolaridad,
  svgSerieParalelo, svgCargas, svgDiferencial, svgTablero,
  svgIluminacion, svgTrifasica, svgMotor, svgCompresor,
  svgSelectividad, svgNormativa,
} from "../js/visuales.js";

test("los 15 simuladores cargan y exportan render", () => {
  const simuladores = [ohm, cable, fallas, tierra, polaridad, serieParalelo,
    cargas, diferencial, tablero, iluminacion, trifasica, motores,
    compresor, selectividad, normativa];
  assert.equal(simuladores.length, 15);
  for (const simulador of simuladores) assert.equal(typeof simulador.render, "function");
});

test("los 15 diagramas SVG tienen etiqueta accesible y viewBox", () => {
  const diagramas = [svgOhm(), svgCableBreaker(), svgFalla(), svgTierra(),
    svgPolaridad(), svgSerieParalelo(), svgCargas(), svgDiferencial(),
    svgTablero(), svgIluminacion(), svgTrifasica(), svgMotor(),
    svgCompresor(), svgSelectividad(), svgNormativa()];
  assert.equal(diagramas.length, 15);
  for (const svg of diagramas) {
    assert.match(svg, /<svg class="diagrama-svg"/);
    assert.match(svg, /role="img" aria-label="/);
    assert.match(svg, /viewBox="0 0 760 220"/);
    assert.match(svg, /<\/svg>/);
  }
});

import { IDS_MISIONES, obtenerMision } from "../js/guia-interactiva.js";

test("cada simulador tiene una misión didáctica válida", () => {
  assert.equal(IDS_MISIONES.length, 15);
  for (const id of IDS_MISIONES) {
    const m = obtenerMision(id);
    assert.ok(m.titulo && m.pregunta && m.explicacion && m.pista);
    assert.equal(m.opciones.length, 3);
    assert.ok(m.correcta >= 0 && m.correcta < m.opciones.length);
  }
});


test("los simuladores eléctricos explicitan límites del modelo", async () => {
  const [tablero, diferencial, fallas] = await Promise.all([
    readFile(new URL("../js/simuladores/tablero.js", import.meta.url), "utf8"),
    readFile(new URL("../js/simuladores/diferencial.js", import.meta.url), "utf8"),
    readFile(new URL("../js/simuladores/corto-sobrecarga.js", import.meta.url), "utf8"),
  ]);

  assert.match(tablero, /no define calibres|no define.*dimensionamiento/i);
  assert.doesNotMatch(tablero, /Protege el cable de 1\.5 mm²|Protege el cable de 2\.5 mm²|Protege el cable de 4 mm²/);
  assert.match(tablero, /no valida el dimensionamiento/i);

  assert.match(diferencial, /no calcula el tiempo real/i);
  assert.match(diferencial, /no.*permite concluir que.*persona/i);
  assert.doesNotMatch(diferencial, /protegió a la persona/);

  assert.match(fallas, /no representan corrientes/i);
  assert.match(fallas, /no tiempo de disparo/i);
  assert.doesNotMatch(fallas, /≈ 15 ms|< 20 ms|const pico = NOMINAL_A \* 50/);
});


test("el simulador de motores respeta bandas magnéticas y no inventa un disparo exacto", () => {
  const directoB = evaluarArranque("directo", "B");
  const directoC = evaluarArranque("directo", "C");
  const directoD = evaluarArranque("directo", "D");
  const estrellaB = evaluarArranque("estrella_triangulo", "B");

  assert.equal(directoB.estado, "encima");
  assert.equal(directoC.estado, "indeterminado");
  assert.equal(directoD.estado, "debajo");
  assert.equal(estrellaB.estado, "debajo");
  assert.equal(directoC.minimo, 50);
  assert.equal(directoC.maximo, 100);
  assert.throws(() => evaluarArranque("desconocido", "C"), TypeError);
});

test("los simuladores de cargas y trifásica no presentan supuestos como reglas de diseño", async () => {
  const [cargas, trifasica, polaridad] = await Promise.all([
    readFile(new URL("../js/simuladores/cargas-ambiente.js", import.meta.url), "utf8"),
    readFile(new URL("../js/simuladores/trifasica.js", import.meta.url), "utf8"),
    readFile(new URL("../js/simuladores/polaridad.js", import.meta.url), "utf8"),
  ]);
  assert.match(cargas, /no dimensiona una instalación real/i);
  assert.doesNotMatch(cargas, /Así se dimensiona una instalación/);
  assert.match(trifasica, /placa/i);
  assert.match(trifasica, /valores nominales/i);
  assert.match(polaridad, /verificá ausencia de tensión/i);
  assert.doesNotMatch(polaridad, /Cambiar la lámpara es seguro/);
});


test("el simulador de selectividad no confunde escalonamiento nominal con selectividad verificada", () => {
  const r = evaluarCoordinacionNominal(20, 40, 16);
  assert.equal(r.escalonamientoNominal, true);
  assert.equal(r.selectividadVerificada, false);
  assert.equal(r.seccionalSobreCarga, false);
  const sinEscalon = evaluarCoordinacionNominal(40, 40, 16);
  assert.equal(sinEscalon.escalonamientoNominal, false);
  assert.throws(() => evaluarCoordinacionNominal(0, 40, 10), TypeError);
});

test("los modelos de iluminación y serie/paralelo declaran sus simplificaciones", async () => {
  const [iluminacion, serie] = await Promise.all([
    readFile(new URL("../js/simuladores/iluminacion.js", import.meta.url), "utf8"),
    readFile(new URL("../js/simuladores/serie-paralelo.js", import.meta.url), "utf8"),
  ]);
  assert.match(iluminacion, /límite.*supuesto didáctico/i);
  assert.match(iluminacion, /lúmenes/i);
  assert.doesNotMatch(iluminacion, /la térmica de.*cortará/i);
  assert.match(serie, /abierto ? Infinity/);
  assert.match(serie, /Modelo resistivo ideal/);
});

import test from "node:test";
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
import * as compresor from "../js/simuladores/compresor-diagnostico.js";
import * as selectividad from "../js/simuladores/selectividad.js";
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

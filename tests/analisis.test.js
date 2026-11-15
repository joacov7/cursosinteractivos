import test from "node:test";
import assert from "node:assert/strict";
import { calcularCaidaTension, diagnosticarCargasConectadas, calcularConsumoEnergia, calcularDemandaSimultanea, compararSecciones } from "../js/workbench/analisis.js";

test("caída monofásica usa ida y vuelta y resistividad del cobre", () => {
  const r = calcularCaidaTension({ corrienteA:10, longitudM:20, seccionMm2:2.5, material:"cobre" });
  assert.equal(r.valida,true);
  assert.ok(Math.abs(r.caidaV - 2.8) < 1e-9);
  assert.ok(Math.abs(r.porcentaje - (2.8/220*100)) < 1e-9);
});
test("aluminio estima más caída que cobre en las mismas condiciones", () => {
  const args = { corrienteA:10, longitudM:20, seccionMm2:2.5 };
  assert.ok(calcularCaidaTension({...args,material:"aluminio"}).caidaV > calcularCaidaTension({...args,material:"cobre"}).caidaV);
});
test("caída rechaza longitud, sección y material inválidos", () => {
  assert.equal(calcularCaidaTension({corrienteA:10,longitudM:0,seccionMm2:2.5}).valida,false);
  assert.equal(calcularCaidaTension({corrienteA:10,longitudM:10,seccionMm2:0}).valida,false);
  assert.equal(calcularCaidaTension({corrienteA:10,longitudM:10,seccionMm2:2.5,material:"hierro"}).valida,false);
});
test("diagnóstico suma solo cargas con fase y neutro completos", () => {
  const nodes = [{id:"f",tipo:"fuente"},{id:"t",tipo:"termica"},{id:"c1",tipo:"carga",props:{nombre:"Luz",potencia:400}},{id:"c2",tipo:"carga",props:{nombre:"Horno",potencia:2000}}];
  const edges = [
    {desde:"f:F",hasta:"t:in"},{desde:"t:out",hasta:"c1:F"},{desde:"c1:N",hasta:"f:N"},
    {desde:"f:F",hasta:"c2:F"}
  ];
  const r = diagnosticarCargasConectadas(nodes,edges);
  assert.equal(r.cargas.length,1);
  assert.equal(r.potenciaTotalW,400);
  assert.ok(Math.abs(r.corrienteEstimadaA - 400/220) < 1e-9);
});
test("diagnóstico no cuenta cargas cuando falta fuente o retorno", () => {
  assert.equal(diagnosticarCargasConectadas([{id:"c",tipo:"carga",props:{potencia:500}}],[]).potenciaTotalW,0);
  const nodes=[{id:"f",tipo:"fuente"},{id:"c",tipo:"carga",props:{potencia:500}}];
  assert.equal(diagnosticarCargasConectadas(nodes,[{desde:"f:F",hasta:"c:F"}]).potenciaTotalW,0);
});
test("energía diaria convierte kW por horas", () => {
  assert.equal(calcularConsumoEnergia(2000,5),10);
  assert.equal(calcularConsumoEnergia(0,24),0);
  assert.equal(calcularConsumoEnergia(-1,5),null);
});


test("demanda simultánea aplica el porcentaje indicado sin exceder 100 %", () => {
  assert.equal(calcularDemandaSimultanea(3000,50),1500);
  assert.equal(calcularDemandaSimultanea(3000,100),3000);
  assert.equal(calcularDemandaSimultanea(3000,101),null);
});
test("comparación de secciones muestra menor caída al aumentar sección", () => {
  const rows = compararSecciones({corrienteA:10,longitudM:20,material:"cobre"});
  assert.equal(rows.length,6);
  assert.ok(rows[0].caidaV > rows[1].caidaV);
  assert.ok(rows[1].caidaV > rows[2].caidaV);
});

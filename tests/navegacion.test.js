import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, app, css] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../js/app.js", import.meta.url), "utf8"),
  readFile(new URL("../css/styles.css", import.meta.url), "utf8"),
]);

test("el botón del temario declara estado y región controlada", () => {
  assert.match(html, /id="nav-toggle"[^>]*aria-expanded="true"[^>]*aria-controls="nav-temario"/);
  assert.match(html, /<nav id="nav-temario" aria-label="Temario"><\/nav>/);
});
test("al elegir un tema en móvil el temario se pliega y sincroniza el estado accesible", () => {
  assert.match(app, /window\.matchMedia\?\.\("\(max-width: 760px\)"\)\.matches/);
  assert.match(app, /sidebar\.classList\.add\("sidebar--collapsed"\)/);
  assert.match(app, /navToggle\?\.setAttribute\("aria-expanded", "false"\)/);
});
test("la navegación informa el enlace de la página actual", () => {
  assert.match(app, /a\.setAttribute\("aria-current", "page"\)/);
  assert.match(app, /a\.removeAttribute\("aria-current"\)/);
});
test("el diseño móvil permite plegar el temario sin ocultarlo en escritorio", () => {
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.sidebar--collapsed #nav-temario \{ display: none; \}/);
  assert.match(css, /@media \(min-width: 761px\)[\s\S]*?\.nav-toggle \{ display: none; \}/);
});
test("los controles interactivos tienen foco visible y se respeta movimiento reducido", () => {
  assert.match(css, /:where\(a, button, select, input, summary, \[tabindex\]\):focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

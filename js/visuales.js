// Ilustraciones SVG didácticas compartidas por los simuladores.
// Son esquemas conceptuales, no planos de montaje ni documentación normativa.
const wrap = (label, body, viewBox = "0 0 760 220") =>
  '<figure class="diagrama-card"><svg class="diagrama-svg" viewBox="' + viewBox + '" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' +
  '<defs><pattern id="dv-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" opacity=".07"/></pattern></defs><rect width="100%" height="100%" fill="url(#dv-grid)"/>' + body + '</svg><figcaption class="diagrama-caption">Esquema conceptual · ' + label + '</figcaption></figure>';
const txt = (x,y,value,cls="dv-label") => '<text x="' + x + '" y="' + y + '" class="' + cls + '">' + value + '</text>';

export const svgOhm = () => wrap("Circuito resistivo con fuente, resistencia, tensión y corriente",
  '<path class="dv-wire" d="M90 105H220 M390 105H660V170H90V105"/>' +
  '<circle class="dv-device" cx="90" cy="105" r="30"/><path class="dv-phase" d="M73 105q8-17 17 0t17 0"/>' +
  '<path class="dv-device" d="M220 105l15-18 18 36 18-36 18 36 18-36 18 36 15-18"/>' +
  '<path class="dv-flow" d="M430 80h95m-12-8 12 8-12 8"/>' +
  txt(90,155,"FUENTE 24 V") + txt(305,65,"R = 12 Ω") + txt(470,65,"I = V / R") + txt(480,195,"P = V · I","dv-caption"));

export const svgCableBreaker = () => wrap("Cable eléctrico y protección termomagnética",
  '<rect class="dv-device" x="45" y="70" width="190" height="82" rx="16"/><circle class="dv-phase" cx="140" cy="111" r="25"/><circle class="dv-neutral" cx="140" cy="111" r="12"/>' +
  '<path class="dv-wire" d="M235 111H330"/><rect class="dv-device" x="330" y="70" width="125" height="82" rx="12"/><path class="dv-phase" d="M365 128l20-36 20 36"/>' +
  '<path class="dv-wire" d="M455 111H690"/>' +
  txt(140,178,"SECCIÓN DEL CABLE") + txt(392,178,"TÉRMICA") + txt(570,88,"La protección debe cuidar") + txt(570,108,"al conductor","dv-caption"));

export const svgFalla = () => wrap("Comparación entre sobrecarga térmica y cortocircuito magnético",
  '<rect class="dv-panel" x="25" y="28" width="340" height="165" rx="14"/><rect class="dv-panel" x="395" y="28" width="340" height="165" rx="14"/>' +
  '<path class="dv-wire" d="M55 150H335 M425 150H705"/><path class="dv-alert" d="M65 145C140 140 190 115 250 75S310 50 330 48"/>' +
  '<path class="dv-alert" d="M435 145L510 145 535 42 560 145 705 145"/>' +
  txt(55,55,"SOBRECARGA") + txt(55,178,"Aumento progresivo · disparo térmico","dv-caption") + txt(425,55,"CORTOCIRCUITO") + txt(425,178,"Corriente muy alta · disparo magnético","dv-caption"));

export const svgTierra = () => wrap("Falla de aislación, carcasa metálica y conductor de protección a tierra",
  '<rect class="dv-device" x="55" y="58" width="180" height="112" rx="14"/><rect class="dv-panel" x="83" y="82" width="125" height="62" rx="8"/><path class="dv-alert" d="M145 82l-13 23h17l-13 23"/>' +
  '<path class="dv-earth" d="M235 145H530V170 M505 170H555 M512 180H548 M520 190H540"/><path class="dv-flow" d="M255 145h150m-12-8 12 8-12 8"/>' +
  txt(145,48,"CARCASA METÁLICA") + txt(355,130,"Conductor PE") + txt(575,155,"Puesta a tierra","dv-caption"));

export const svgPolaridad = () => wrap("Tomacorriente 2P más tierra con fase, neutro y protección",
  '<rect class="dv-device" x="275" y="18" width="210" height="184" rx="28"/><circle class="dv-phase" cx="340" cy="108" r="13"/><circle class="dv-neutral" cx="420" cy="108" r="13"/><circle class="dv-earth" cx="380" cy="55" r="10"/>' +
  '<path class="dv-phase" d="M340 121v45h-95"/><path class="dv-neutral" d="M420 121v45h95"/><path class="dv-earth" d="M380 65v101"/>' +
  txt(205,180,"FASE") + txt(495,180,"NEUTRO") + txt(380,25,"TIERRA PE","dv-caption"));

export const svgSerieParalelo = () => wrap("Comparación de conexiones eléctricas en serie y en paralelo",
  '<rect class="dv-panel" x="20" y="20" width="350" height="180" rx="14"/><rect class="dv-panel" x="390" y="20" width="350" height="180" rx="14"/>' +
  '<path class="dv-wire" d="M55 90H95 M130 90H170 M205 90H245 M280 90H335V160H55V90"/><circle class="dv-good" cx="112" cy="90" r="13"/><circle class="dv-good" cx="187" cy="90" r="13"/><circle class="dv-good" cx="262" cy="90" r="13"/>' +
  '<path class="dv-wire" d="M425 65H705 M425 160H705 M465 65V160 M585 65V160 M675 65V160"/><circle class="dv-good" cx="465" cy="112" r="13"/><circle class="dv-good" cx="585" cy="112" r="13"/><circle class="dv-good" cx="675" cy="112" r="13"/>' +
  txt(45,48,"SERIE") + txt(415,48,"PARALELO") + txt(45,185,"Un solo camino","dv-caption") + txt(415,185,"Ramas independientes","dv-caption"));

export const svgCargas = () => wrap("Distribución de cargas de una vivienda en circuitos separados",
  '<path class="dv-wire" d="M380 30V75 M380 75H135V115 M380 75V115 M380 75H625V115"/><rect class="dv-device" x="300" y="15" width="160" height="45" rx="10"/>' +
  '<rect class="dv-panel" x="35" y="115" width="200" height="72" rx="12"/><rect class="dv-panel" x="280" y="115" width="200" height="72" rx="12"/><rect class="dv-panel" x="525" y="115" width="200" height="72" rx="12"/>' +
  txt(380,43,"TABLERO") + txt(135,145,"ILUMINACIÓN") + txt(135,168,"Luces · 10 A","dv-caption") + txt(380,145,"TOMACORRIENTES") + txt(380,168,"Uso general · 16 A","dv-caption") + txt(625,145,"ESPECIALES") + txt(625,168,"AC / cocina · 20 A","dv-caption"));

export const svgDiferencial = () => wrap("Disyuntor diferencial que compara corriente de fase y neutro y detecta fuga",
  '<rect class="dv-device" x="285" y="35" width="190" height="135" rx="16"/><circle class="dv-panel" cx="380" cy="102" r="43"/><path class="dv-phase" d="M50 80H337 M423 80H710"/><path class="dv-neutral" d="M710 135H423 M337 135H50"/>' +
  '<path class="dv-alert" d="M380 145V190H520"/><path class="dv-earth" d="M520 190v12m-25 0h50m-42 8h34m-26 8h18"/>' +
  txt(100,65,"FASE · ENTRA") + txt(100,165,"NEUTRO · VUELVE") + txt(380,25,"DIFERENCIAL") + txt(545,182,"FUGA A TIERRA","dv-caption"));

export const svgTablero = () => wrap("Esquema unifilar conceptual de un tablero eléctrico",
  '<path class="dv-wire" d="M380 18V45 M380 80V100 M380 135V155 M380 190V205"/><rect class="dv-device" x="300" y="45" width="160" height="35" rx="8"/><rect class="dv-device" x="300" y="100" width="160" height="35" rx="8"/>' +
  '<path class="dv-wire" d="M380 155H120V175 M380 155V175 M380 155H640V175"/><rect class="dv-panel" x="45" y="175" width="150" height="34" rx="8"/><rect class="dv-panel" x="305" y="175" width="150" height="34" rx="8"/><rect class="dv-panel" x="565" y="175" width="150" height="34" rx="8"/>' +
  txt(380,68,"LLAVE GENERAL") + txt(380,123,"DIFERENCIAL") + txt(120,198,"ILUMINACIÓN") + txt(380,198,"TOMAS") + txt(640,198,"ESPECIALES"));

export const svgIluminacion = () => wrap("Comparación conceptual de lámpara incandescente y LED",
  '<path class="dv-wire" d="M190 155V130 M570 155V130"/><path class="dv-device" d="M150 90a40 40 0 1 1 80 0c0 18-15 26-18 40h-44c-3-14-18-22-18-40z"/><path class="dv-good" d="M530 90a40 40 0 1 1 80 0c0 18-15 26-18 40h-44c-3-14-18-22-18-40z"/>' +
  '<path class="dv-wire" d="M170 140h40m-36 8h32m-28 8h24 M550 140h40m-36 8h32m-28 8h24"/>' +
  txt(190,35,"INCANDESCENTE") + txt(190,190,"Mayor consumo","dv-caption") + txt(570,35,"LED") + txt(570,190,"Menor consumo","dv-caption"));

export const svgTrifasica = () => wrap("Tres fases eléctricas desfasadas 120 grados",
  '<path class="dv-phase" d="M35 80C95 20 155 20 215 80S335 140 395 80S515 20 575 80S695 140 735 80"/><path class="dv-neutral" d="M35 110C95 170 155 170 215 110S335 50 395 110S515 170 575 110S695 50 735 110"/><path class="dv-earth" d="M35 140C95 80 155 80 215 140S335 200 395 140S515 80 575 140S695 200 735 140"/>' +
  txt(55,25,"L1") + txt(55,175,"L2") + txt(700,25,"L3") + txt(380,205,"120° entre fases","dv-caption"));

export const svgMotor = () => wrap("Curva de corriente de arranque y corriente nominal de un motor",
  '<path class="dv-wire" d="M75 25V180H700"/><path class="dv-phase" d="M78 45C105 45 115 135 180 145S380 150 680 150"/><path class="dv-good" d="M78 145H680"/>' +
  txt(85,18,"CORRIENTE") + txt(590,140,"Régimen","dv-caption") + txt(120,62,"Pico de arranque","dv-caption") + txt(350,205,"TIEMPO →","dv-caption"));

export const svgCompresor = () => wrap("Esquema conceptual de compresor monofásico con relé y capacitor de arranque",
  '<rect class="dv-device" x="500" y="55" width="180" height="110" rx="22"/><circle class="dv-panel" cx="590" cy="110" r="36"/><path class="dv-flow" d="M70 110H170 M245 110H330 M410 110H500"/><rect class="dv-panel" x="170" y="75" width="75" height="70" rx="8"/><rect class="dv-panel" x="330" y="75" width="80" height="70" rx="8"/>' +
  txt(207,105,"RELÉ") + txt(370,105,"CAPACITOR") + txt(590,115,"M","dv-label") + txt(590,190,"COMPRESOR","dv-caption"));

export const svgSelectividad = () => wrap("Selectividad: la protección de la rama afectada debe actuar primero",
  '<path class="dv-wire" d="M380 25V65 M380 100V125 M380 125H130V155 M380 125V155 M380 125H630V155"/><rect class="dv-device" x="315" y="65" width="130" height="35" rx="8"/><rect class="dv-panel" x="70" y="155" width="120" height="45" rx="8"/><rect class="dv-panel" x="320" y="155" width="120" height="45" rx="8"/><rect class="dv-panel" x="570" y="155" width="120" height="45" rx="8"/><path class="dv-alert" d="M630 155v-25l-10 10m10-10 10 10"/>' +
  txt(380,48,"GENERAL") + txt(130,182,"RAMA A") + txt(380,182,"RAMA B") + txt(630,182,"RAMA C") + txt(630,118,"FALLA","dv-caption"));

export const svgNormativa = () => wrap("Consulta técnica: verificar requisitos antes de ejecutar una instalación",
  '<rect class="dv-device" x="100" y="30" width="205" height="165" rx="12"/><path class="dv-wire" d="M135 70h135 M135 95h135 M135 120h100 M135 145h120"/><path class="dv-good" d="M370 65l12 12 25-28 M370 115l12 12 25-28 M370 165l12 12 25-28"/>' +
  txt(202,52,"REGLAMENTACIÓN") + txt(435,80,"Identificar el circuito") + txt(435,130,"Verificar protecciones") + txt(435,180,"Consultar edición vigente"));

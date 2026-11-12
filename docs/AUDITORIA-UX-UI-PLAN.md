# Auditoría UX/UI y plan de mejora — Cursos Interactivos

Fecha: 2026-11-11
Base auditada: `claude/new-session-gjpwc5`
Rama de trabajo: `improve/ux-visual-audit`

## Resumen ejecutivo

El módulo de Electricidad tiene una base educativa valiosa: 16 temas con simuladores, quizzes, catálogo, certificado imprimible y un banco de trabajo SVG con retos. La decisión de usar JavaScript nativo y SVG mantiene el proyecto liviano.

El producto todavía debe considerarse un prototipo educativo avanzado, no una plataforma comercial lista para cobrar. Antes de pulir la estética, hay que corregir la fidelidad del motor eléctrico, resolver los problemas de interacción móvil y separar con claridad la experiencia de aprendizaje del futuro flujo comercial.

Esta revisión fue estática, basada en el código del repositorio. No se ejecutó la aplicación en navegadores ni se corrieron pruebas automatizadas en esta auditoría.

## Equipo de revisión (comité multidisciplinario)

1. **Product lead / estrategia educativa:** define el recorrido del alumno, objetivos por nivel y qué significa completar el curso.
2. **UX researcher / instructional designer:** simplifica el aprendizaje para principiantes, reduce carga cognitiva y convierte cada simulación en una secuencia de aprender, probar, equivocarse y comprender.
3. **UI / visual designer:** define identidad visual, tipografía, color, iconografía, ilustraciones y jerarquía de pantallas.
4. **Interaction designer / especialista en simulaciones:** rediseña el banco de trabajo para mouse, touch y teclado, con estados y feedback comprensibles.
5. **Especialista electricista / revisor técnico:** valida fórmulas, tablas, protecciones, normativa argentina y mensajes de seguridad antes de publicar contenido técnico.
6. **Frontend engineer SVG / JavaScript:** implementa componentes visuales y lógica de interacción conservando una app liviana.
7. **QA / accesibilidad / mobile:** prueba dispositivos reales, tamaños de pantalla, navegación por teclado, contraste, lectores de pantalla y regresiones.

Este comité es una estructura de trabajo propuesta para orientar las decisiones; no representa contrataciones ni revisiones humanas externas ya realizadas.

## Diagnóstico

### Fortalezas

- Los 16 temas están conectados a simuladores concretos y a quizzes.
- El curso está dividido en básico, intermedio y avanzado.
- El aviso de seguridad aparece de forma transversal.
- El banco de trabajo es un diferencial: componentes arrastrables, conexiones por bornes, cálculo en vivo y retos guiados.
- El código está organizado en módulos pequeños y no depende de un framework pesado.
- El certificado aclara que es educativo y no habilita profesionalmente.

### Hallazgos críticos — corregir antes de ampliar el curso

1. **Motor del banco: circuito sin térmica puede terminar como “seguro”.** En `js/workbench/motor.js`, cuando no hay térmica se agrega un warning, pero si la corriente no supera la ampacidad el estado final puede ser `seguro`. El reto inicial valida solamente ese estado y puede aprobar sin protección.
2. **El cálculo de cable limitante toma todos los edges.** `Math.min(...edges.map(...))` incluye cables desconectados o ajenos al circuito energizado. Debe calcularse por tramo/camino eléctrico activo.
3. **Detección de térmica demasiado permisiva.** Se considera activa si sus bornes están en el mismo conjunto alcanzable desde fase; eso no prueba que esté realmente en serie protegiendo la carga. Debe validarse el camino de corriente y detectar bypass/ramales.
4. **Modelo eléctrico simplificado presentado como resultado concluyente.** Ampacidades fijas por sección no contemplan método de instalación, material, aislación, temperatura, agrupamiento, longitud, caída de tensión ni condiciones de protección. Deben mostrarse como valores didácticos de un escenario explícito, no como tabla universal para instalaciones reales.
5. **El simulador de tablero codifica asociaciones fijas** entre secciones y térmicas (por ejemplo, 4 mm²/20 A) sin modelar condiciones de instalación ni justificar el caso. Requiere revisión técnica antes de enseñar dimensionamiento.
6. **Simulador diferencial simplificado.** La comparación por umbral exacto y el mensaje de que el dispositivo “protegió a la persona” pueden inducir a una seguridad absoluta. Revisar comportamiento, alcance y redacción con especialista.

### Hallazgos altos — experiencia y producto

1. **Banco no adaptativo en móviles.** Los nodos del ejemplo se crean en coordenadas fijas (40, 260, 480 px) y el SVG no define un `viewBox` escalable. En pantallas angostas, parte del circuito puede quedar fuera de la zona visible.
2. **Navegación móvil poco eficiente.** A menos de 760 px, el menú lateral pasa arriba del contenido y puede ocupar demasiado espacio; conviene convertirlo en selector/menú plegable con progreso visible.
3. **Interacción del banco dependiente del puntero.** No se observa una alternativa equivalente de teclado para crear conexiones y editar nodos. Debe ofrecerse una modalidad accesible por botones/listas, además del drag-and-drop.
4. **Accesibilidad visual incompleta.** No se identificaron estilos globales claros de `:focus-visible`, estados de foco consistentes ni preferencia `prefers-reduced-motion`. Revisar contraste y tamaños de texto auxiliares.
5. **Landing y checkout no coinciden.** La landing publica precio, cuotas y “acceso de por vida”, pero el CTA de compra solo muestra “Checkout en preparación”. No hay pago, paywall ni desbloqueo efectivo.
6. **Certificado no verificable.** Nombre y progreso viven en `localStorage`; se pueden editar desde el navegador. Es un comprobante local imprimible, no una credencial verificable.
7. **No hay suite de pruebas ni pipeline de validación identificado.** No se encontraron tests, configuración de test runner ni scripts de build/lint. La auditoría no ejecutó pruebas en navegador.
8. **Mensajes y estados necesitan consistencia.** Algunos resultados dependen de textos y colores aislados; falta un sistema común para estado inicial, error, éxito, explicación, pista y siguiente paso.

### Hallazgos medios

- El estilo general es oscuro y funcional, pero se siente como una herramienta técnica interna. Falta una identidad educativa más cálida y visual.
- No hay assets gráficos dedicados; predominan emojis, bloques CSS y SVG dibujado en código.
- La pantalla inicial debe explicar con claridad qué aprenderá el alumno, cuánto lleva cada etapa y por dónde empezar.
- Falta un flujo de onboarding corto que enseñe a usar simuladores y el banco de trabajo.
- El progreso se registra al aprobar quizzes, pero no hay una vista de avance del curso suficientemente protagonista.
- El curso mezcla contenido introductorio con temas avanzados sin explicar prerrequisitos ni diferenciar “concepto”, “práctica guiada” y “aplicación real”.

## Dirección visual propuesta

**Concepto:** laboratorio eléctrico interactivo. Profesional, claro, cercano y didáctico; evitar tanto la estética industrial excesivamente oscura como una interfaz infantil.

- Fondo general claro/neutro y superficies blancas o gris cálido para lectura prolongada.
- Azul profundo para estructura y confianza; amarillo eléctrico reservado a acciones y energía; verde/rojo solo para estados, acompañados siempre por texto e iconos.
- Tipografía sans legible, escala tipográfica consistente y números/unidades con tratamiento monoespaciado cuando corresponda.
- Ilustraciones SVG propias, limpias y consistentes: tablero, conductores, protecciones, herramientas y circuitos.
- Tarjetas de tema con nivel, duración estimada, objetivo, estado y acción principal.
- Diagramas más grandes y explicativos, con leyenda persistente y animaciones discretas.
- No usar color como único indicador de fase, neutro, tierra o peligro: combinar color, etiqueta y forma.

## Dirección de usabilidad

### Recorrido del alumno

1. **Inicio:** “Qué vas a aprender”, progreso, continuar donde quedó y acceso al primer tema.
2. **Lección:** explicación breve con un objetivo de aprendizaje concreto.
3. **Simulación guiada:** escenario inicial, controles destacados, pista contextual y resultado explicado.
4. **Comprensión:** una pregunta de reflexión o comparación del resultado.
5. **Quiz:** evaluación corta con feedback por respuesta y opción de repaso.
6. **Cierre del tema:** aprendizaje logrado, tema siguiente y avance del nivel.

### Banco de trabajo

- Canvas con zoom/encuadre automático y coordenadas normalizadas; no depender de posiciones fijas en píxeles.
- En móvil, modo guiado por pasos y panel de componentes seleccionable; conservar drag-and-drop como opción.
- En escritorio, barra de componentes, lienzo amplio, inspector lateral y panel de diagnóstico.
- Conexiones con validación de bornes compatibles, prevención de duplicados y mensajes cuando el cableado no es válido.
- Simulación por estados claramente separados: incompleto, conectado sin protección, protegido, sobrecarga, disparo y falla de conexión.
- Mostrar por qué el motor llegó al resultado, qué tramo está evaluando y qué regla didáctica aplica.
- Botón deshacer/rehacer, reiniciar reto y restaurar ejemplo.
- Añadir alternativa de teclado y controles accesibles para crear/eliminar conexiones.

## Plan de trabajo priorizado

### Fase 0 — Confiabilidad pedagógica y eléctrica (bloqueante)
- Corregir el motor de topología: caminos activos, ramas, térmicas realmente en serie y cables desconectados.
- Reescribir validadores de retos para exigir todos los componentes y condiciones explícitas.
- Separar resultados “seguro dentro del modelo didáctico” de “instalación real segura”.
- Revisar tablas y ejemplos eléctricos con especialista; documentar supuestos y referencias técnicas.
- Añadir pruebas unitarias del motor y casos de regresión.

### Fase 1 — Sistema visual y navegación
- Definir tokens visuales, tipografía, botones, tarjetas, alertas y estados.
- Rediseñar header, navegación, home y tarjetas de tema.
- Implementar navegación móvil plegable.
- Normalizar iconos e ilustraciones SVG.

### Fase 2 — Simuladores y banco de trabajo
- Mejorar jerarquía de instrucciones, controles, resultado y explicación.
- Hacer el banco responsive con viewBox/encuadre, presets por dispositivo y modo guiado táctil.
- Añadir alternativa de teclado, foco, deshacer/rehacer y feedback contextual.
- Probar cada simulador en viewport móvil y escritorio.

### Fase 3 — Evaluación, progreso y accesibilidad
- Mejorar quizzes con feedback inmediato y explicación por concepto.
- Crear dashboard de progreso por nivel.
- Incorporar navegación por teclado, semántica, contraste y movimiento reducido.
- Automatizar pruebas de flujos principales y regresión visual.

### Fase 4 — Preparación comercial (no fingir funciones)
- Definir acceso gratuito y contenido pago.
- Integrar autenticación, backend de progreso y pagos antes de mostrar precios/planes como disponibles.
- Emitir certificados con identificador y página de verificación.
- Hasta entonces, rotular checkout y certificado como demostración/prototipo y evitar promesas de cuotas o acceso de por vida.

## Criterios de aceptación

- Ningún reto marca como correcto un circuito sin la protección exigida.
- Los cables desconectados no alteran el resultado del circuito activo.
- El motor identifica protección en serie y detecta bypass.
- Los 16 temas pueden completarse en anchos de 360, 390, 768 y 1440 px sin scroll horizontal involuntario.
- El banco puede usarse con touch y ofrece alternativa completa sin drag-and-drop.
- Todos los controles tienen foco visible y nombre accesible.
- Se respeta `prefers-reduced-motion`.
- Los resultados no usan solo color para comunicar estados.
- Hay pruebas automatizadas para el motor y los flujos de quiz/progreso.
- La landing no anuncia checkout, cuotas, acceso o certificados verificables que aún no existen.
- Los valores eléctricos y mensajes de seguridad tienen revisión técnica documentada.

## Orden recomendado de ejecución

No empezar por una reescritura total ni cambiar de framework. Primero corregir el motor y crear pruebas; después establecer el sistema visual y rehacer la experiencia móvil; finalmente integrar la capa comercial. Mantener JavaScript nativo y SVG mientras sigan siendo suficientes para el producto.


## Extensión del multímetro virtual: resistencia

Se incorporó una función de resistencia (Ω) al banco de trabajo. La medición se bloquea mientras la fuente está energizada. El cálculo se limita a la resistencia equivalente nominal ideal de una única carga cuya potencia está definida, usando R = V²/P a 220 V. No representa motores, electrónica, cargas variables ni redes serie/paralelo.

Resultados previstos:
- Valor en ohmios: solo entre F y N de una carga reconocida y sin camino externo que la puentee.
- OL: bornes válidos sin camino conductor entre ellos.
- NO MODELADA: red conectada, bornes no compatibles o topología que el modelo no resuelve.
- BLOQUEADO: fuente energizada.

Esta función es una simplificación educativa y no sustituye un óhmetro, procedimientos de trabajo seguro ni una evaluación profesional.


## Caída de tensión y diagnóstico de cargas (12-11-2026)

Se añadió al banco un estimador monofásico de caída de tensión para dos conductores, con longitud de ida, sección, corriente y material explícitos. Usa resistividad aproximada a 20 °C (cobre 0,0175 y aluminio 0,0282 Ω·mm²/m), calcula la ida y vuelta y presenta voltios, porcentaje y tensión estimada sobre 220 V. El umbral del 3 % aparece como advertencia orientativa, nunca como aprobación normativa.

El diagnóstico de potencia suma solo cargas con camino completo entre fase de fuente y borne de fase de carga, y entre neutro de carga y neutro de fuente. Muestra potencia nominal, corriente ideal y energía estimada a partir de horas ingresadas. No modela factor de potencia, arranque, simultaneidad real ni consumo medido.

La interfaz usa tarjetas y métricas adaptables; no se ha realizado aún una inspección visual manual en dispositivos físicos. Las estimaciones no sustituyen el cálculo conforme a reglamentación AEA ni la verificación profesional de la instalación.


## Comparativa de secciones y simultaneidad (12-11-2026)

El estimador muestra una tabla comparativa de secciones para la misma corriente, longitud y material, ordenada por las secciones didácticas disponibles. La tabla solo compara caída de tensión y no selecciona ni certifica una sección adecuada.

El análisis de cargas permite ingresar un porcentaje supuesto de simultaneidad, diferenciando potencia instalada de demanda simultánea estimada. La energía diaria proyectada utiliza esa demanda por las horas de uso ingresadas. El factor es editable y no se presenta como valor normativo o medición real.


## Navegación móvil y accesibilidad del índice (12-11-2026)

Al seleccionar un tema desde el temario en pantallas móviles, el índice se pliega automáticamente para devolver espacio a la lección. El botón sincroniza su etiqueta y aria-expanded, y los enlaces indican el destino activo mediante aria-current="page". Se agregaron pruebas de regresión para el control, su estado accesible, el breakpoint móvil, el foco visible y prefers-reduced-motion.

Estas pruebas verifican el contrato estático del código; no sustituyen pruebas manuales de interacción con lectores de pantalla ni recorridos reales en Android/iOS.


## Revisión de supuestos eléctricos en simuladores (12-11-2026)

Se ajustaron tres simuladores para evitar que una simplificación didáctica se interprete como dimensionamiento o garantía de seguridad:

- **Tablero:** el ejercicio ahora evalúa reconocimiento de componentes y orden funcional. Se retiraron las afirmaciones que asociaban automáticamente secciones de 1,5 / 2,5 / 4 mm² con térmicas concretas. Los valores de 10, 16 y 20 A quedan explícitamente como opciones del ejercicio, no como recomendación de dimensionamiento. La pantalla advierte que el diseño real debe considerar corriente de diseño, capacidad admisible corregida, método de instalación, agrupamiento, temperatura, caída de tensión y poder de corte.
- **Diferencial:** se reemplazó el mensaje de “protegió a la persona” por “actuación en el modelo”. La comparación de umbral se identifica como simplificación conceptual; se aclara que no calcula tiempos normalizados ni demuestra protección. También se distingue un dispositivo de 300 mA de uno de 30 mA de alta sensibilidad y se remite el test al manual del fabricante.
- **Cortocircuito y sobrecarga:** se eliminaron los valores ficticios de pico de corriente y tiempo de disparo. La animación conserva la diferencia conceptual entre respuesta térmica retardada y magnética rápida, sin mostrar magnitudes ni tiempos como si fueran mediciones o curvas reales.

Se agregaron pruebas de regresión que impiden reintroducir los mensajes concluyentes y los valores de disparo ficticios. GitHub Actions completó la ejecución del commit `a0ee4874e7ccaf5e493718761b33da40e9ffe633` con **53 pruebas aprobadas y 0 fallidas**.

Pendiente antes de considerar la versión educativa cerrada: revisión técnica externa de contenido y valores por electricista matriculado, además de pruebas visuales/manuales en navegadores y dispositivos reales. La suite automatizada no reemplaza esas validaciones.


## Revisión ampliada de modelos didácticos (12-11-2026)

Se completó otra pasada sobre motores, cargas, trifásica, polaridad, iluminación, serie/paralelo y selectividad:

- **Arranque de motores:** se sustituyó el disparo binario por un umbral único por curva por una comparación contra bandas magnéticas orientativas (B, C y D). Si el pico supuesto cae dentro de la banda, el simulador devuelve “indeterminado” y exige consultar la curva tiempo-corriente del fabricante. Se aclara que no dimensiona la protección térmica ni la coordinación completa del motor.
- **Selectividad:** se eliminó la regla incorrecta según la cual una térmica seccional de menor amperaje que la general garantiza que cortará primero. El ejercicio ahora distingue escalonamiento nominal de selectividad verificada y explica qué datos faltan: corriente de cortocircuito prevista, curvas tiempo-corriente y tablas de coordinación del fabricante.
- **Cargas por ambiente:** los límites de 10, 16 y 20 A quedan identificados como supuestos didácticos. Se retiró la asociación automática con secciones de cable y cualquier afirmación de que el ejercicio dimensiona una instalación.
- **Trifásica:** la clasificación se realiza a partir de la placa indicada en cada ejemplo, no por la categoría del artefacto. Los 220/380 V se identifican como valores nominales de referencia de la actividad.
- **Polaridad:** se retiró la afirmación de que cambiar una lámpara es seguro por el solo hecho de que el interruptor esté apagado. Ahora se indica cortar la alimentación y verificar ausencia de tensión antes de intervenir.
- **Iluminación:** se quitó la equivalencia universal de brillo LED/incandescente y se aclara que se compara potencia nominal, mientras que la equivalencia luminosa depende de lúmenes y eficacia. El límite de 10 A es solo didáctico y no implica una sección de conductor.
- **Serie/paralelo:** se corrigió la resistencia equivalente de un circuito serie abierto (infinita) y se documentó que el modelo mantiene resistencia constante, a diferencia del comportamiento térmico real de una lámpara incandescente.

Se añadieron pruebas unitarias y regresiones para bandas de arranque, escalonamiento nominal, supuestos de iluminación y resistencia equivalente en circuito abierto. GitHub Actions completó el commit `2b9965b0a3e0ff5cc16b8c1bd3a0270cd3ccbe3a` con **57 pruebas aprobadas y 0 fallidas**.

La revisión de código estática de los simuladores prioritarios quedó completada. Siguen pendientes la inspección visual manual en dispositivos/navegadores reales y una revisión profesional externa de los criterios eléctricos y normativos antes de declarar el material apto para formación técnica formal.

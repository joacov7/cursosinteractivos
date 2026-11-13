# Prueba manual de aceptación — Módulo Electricidad

## Objetivo

Comprobar navegación, legibilidad, interacción táctil y comportamiento básico antes de considerar una publicación. Esta prueba complementa los tests automatizados; no sustituye una revisión profesional de los contenidos eléctricos.

## Entornos

- iPhone con Safari actualizado, orientación vertical y horizontal.
- Computadora con Chrome, Firefox o Safari actualizado.
- Probar en una ventana normal y, si es posible, en una sesión privada para detectar diferencias de almacenamiento.
- Abrir la aplicación desde un servidor HTTP de prueba. No evaluar mediante apertura directa del archivo `index.html` (`file://`).

## Recorrido funcional

- [ ] La pantalla de inicio carga sin errores visibles.
- [ ] El temario muestra los 16 temas y los tres niveles.
- [ ] Se puede entrar y salir de cada simulador desde el temario y desde sus enlaces de navegación.
- [ ] Los 15 simuladores cargan sin pantalla en blanco ni errores de consola.
- [ ] Cada simulador muestra el aviso de uso educativo.
- [ ] Las misiones de aprendizaje permiten seleccionar, comprobar y consultar una pista.
- [ ] Los 16 quizzes muestran cuatro preguntas, permiten responder y corregir.
- [ ] Un quiz incompleto informa que faltan respuestas y no registra aprobación.
- [ ] Un resultado aprobado actualiza el progreso del tema y del nivel.
- [ ] Un resultado no aprobado permite reintentar.
- [ ] El progreso se conserva al recargar el sitio en el mismo navegador.
- [ ] El catálogo de componentes abre y permite volver al inicio.
- [ ] El certificado permanece bloqueado hasta aprobar todos los temas.
- [ ] El nombre del certificado se muestra como texto y el botón de impresión abre la vista de impresión.
- [ ] El certificado conserva claramente la leyenda de que no es matrícula ni habilitación profesional.

## Banco de trabajo — computadora

- [ ] Agregar fuente, térmica y carga.
- [ ] Arrastrar componentes sin que desaparezcan ni queden fuera del área visible.
- [ ] Conectar bornes compatibles; comprobar que conexiones incompatibles se rechazan.
- [ ] Seleccionar y eliminar un componente y un cable.
- [ ] Cambiar la corriente nominal de la térmica, la carga y la sección del cable.
- [ ] Cargar ejemplo y limpiar el circuito.
- [ ] Desconectar la fuente y verificar que resistencia y continuidad no se habiliten con la fuente conectada.
- [ ] Inyectar conductor abierto y puente sobre térmica; revisar diagnóstico y lecturas.
- [ ] Inyectar cortocircuito fase-neutro; confirmar que la fuente queda desconectada y no se puede reenergizar mientras persiste la falla.
- [ ] Comprobar que el modelo no presenta el resultado como cálculo de corriente de cortocircuito ni como garantía de actuación de una protección.
- [ ] Probar los cinco retos y el guardado de su progreso.

## Banco de trabajo — iPhone

- [ ] El área de trabajo se adapta al ancho de pantalla sin desplazar toda la página horizontalmente.
- [ ] Se pueden agregar, seleccionar y mover componentes con el dedo.
- [ ] Se puede crear una conexión arrastrando desde un borne hasta otro.
- [ ] La alternativa «Conectar sin arrastrar» permite completar la misma acción.
- [ ] Los controles se pueden tocar sin zoom accidental ni superposición.
- [ ] Los paneles de análisis, instrumentos, diagnóstico y retos se leen sin texto cortado.
- [ ] El botón de fuente, los selectores y el botón Limpiar responden correctamente.
- [ ] La navegación del temario se pliega al elegir un tema y puede volver a abrirse.
- [ ] La orientación horizontal no rompe el lienzo ni los controles.

## Accesibilidad y presentación

- [ ] Se puede navegar por enlaces, botones y controles con teclado en computadora.
- [ ] El foco de teclado es visible.
- [ ] Los estados importantes se anuncian o se muestran con texto, no solo con color.
- [ ] El contenido sigue siendo usable con movimiento reducido activado.
- [ ] No hay textos superpuestos, botones cortados, scroll horizontal inesperado ni elementos que tapen controles.

## Criterios de aceptación

La prueba se considera aprobada cuando todos los puntos funcionales y táctiles se completan sin bloqueos. Los defectos visuales menores se registran y priorizan; los fallos de navegación, cálculos, seguridad, almacenamiento o interacción bloquean la aceptación.

## Registro de incidencias

Para cada problema, registrar:

1. Dispositivo, sistema operativo y navegador.
2. Ruta o tema donde ocurrió.
3. Pasos exactos para reproducirlo.
4. Resultado esperado y resultado observado.
5. Captura de pantalla o grabación, si está disponible.

## Pendientes que esta prueba no cubre

- Revisión técnica por electricista matriculado de valores, supuestos, ejemplos, protecciones, normativa AEA/IRAM y advertencias.
- Validación de cálculos contra casos de referencia independientes.
- Pruebas de rendimiento y compatibilidad en una matriz más amplia de dispositivos.
- Revisión de privacidad y términos antes de incorporar analítica, cuentas o servicios externos.

**Importante:** completar esta lista no convierte el curso en una certificación habilitante ni valida una instalación eléctrica real.

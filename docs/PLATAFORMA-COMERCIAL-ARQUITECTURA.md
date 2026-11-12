# Plataforma comercial — arquitectura y plan de MVP

Estado: diseño inicial aprobado para implementación por etapas
Fecha: 12-11-2026
Base de código educativo: rama `improve/ux-visual-audit`
Rama de plataforma: `feat/commercial-platform-foundation`

## 1. Objetivo del producto

Convertir el curso interactivo de electricidad en una plataforma educativa que permita:

- Crear cuenta e iniciar sesión.
- Explorar cursos, módulos y lecciones con contenido gratuito y contenido con acceso pago.
- Comprar acceso de forma segura.
- Guardar progreso y resultados en servidor, no solo en el navegador.
- Emitir certificados con identificador único y página pública de verificación.
- Administrar cursos, contenidos, alumnos, pagos y certificados.

La primera entrega será un **MVP para un curso y un administrador**, no un LMS genérico ni un marketplace de instructores.

## 2. Principios de arquitectura

1. **Separación de responsabilidades:** el motor didáctico de simulaciones sigue siendo un módulo independiente del login, pagos y administración.
2. **Backend como autoridad:** el navegador nunca decide por sí solo si una persona pagó, tiene acceso o aprobó un curso.
3. **Pagos verificables:** el acceso se habilita únicamente después de validar la notificación del proveedor en servidor.
4. **Progreso persistente:** guardar avance, intentos y aprobaciones en PostgreSQL; permitir reanudar desde otro dispositivo.
5. **Certificados verificables:** cada certificado tiene un código aleatorio/UUID y una página pública que consulta el estado real.
6. **Seguridad por defecto:** roles mínimos, validación en servidor, políticas de acceso por fila, secretos fuera del frontend y registro de eventos críticos.
7. **Migración incremental:** conservar los simuladores actuales y envolverlos en una interfaz de plataforma; no reescribir los 15 simuladores de entrada.

## 3. Stack propuesto para el MVP

| Capa | Propuesta | Motivo |
|---|---|---|
| Frontend | React + TypeScript + Vite | Shell de plataforma, panel alumno y administración |
| UI | Tailwind CSS o sistema CSS existente | Mantener consistencia visual y responsive |
| Motor didáctico | JavaScript modular actual, aislado | Reutilizar simuladores probados |
| Base de datos | PostgreSQL administrado (Supabase) | Datos relacionales, backups y RLS |
| Autenticación | Supabase Auth | Email/password y recuperación de cuenta |
| API / lógica sensible | Servicio backend TypeScript o FastAPI | Pagos, permisos, progreso y certificados |
| Hosting frontend | Vercel | Deploy de frontend y previews |
| Pagos | Mercado Pago Checkout Pro | Medio de pago conocido en Argentina |
| Archivos | Storage privado para recursos y certificados | URLs firmadas y control de acceso |
| Correo | Proveedor transaccional por definir | Confirmación, recuperación y avisos |

**Decisión de diseño:** frontend en Vercel; PostgreSQL/Auth/Storage en Supabase; operaciones sensibles (webhooks, activación de compras, emisión de certificados) en backend server-side. No colocar access tokens ni credenciales privadas en Vite, variables `VITE_*` o código descargado por el navegador.

No se implementa todavía facturación AFIP, suscripción recurrente, app móvil nativa ni multi-tenant. Se evaluarán después de validar el MVP.

## 4. Módulos funcionales

### Alumno
- Registro, login, recuperación de contraseña y perfil.
- Catálogo de cursos.
- Vista de curso con módulos y lecciones.
- Vista previa gratuita y bloqueo de contenido pago.
- Reproductor/lector de lección que monta los simuladores actuales.
- Progreso por lección, módulo y curso.
- Historial de quizzes e intentos.
- Certificados obtenidos y enlace de verificación.

### Compra
- Orden de compra creada en backend.
- Checkout de Mercado Pago.
- Webhook validado en servidor.
- Procesamiento idempotente de eventos.
- Entitlement/acceso generado solo para pagos aprobados.
- Estados: pendiente, aprobado, rechazado, cancelado, reembolsado/contracargo.
- Reconciliación manual desde administración.

### Administración
- Panel de alumnos y estado de acceso.
- Gestión inicial de cursos, módulos, lecciones y orden.
- Publicar/despublicar contenido.
- Consulta de pagos y eventos de webhook.
- Emisión/revocación de certificados con auditoría.
- Métricas básicas: registros, compras aprobadas, finalización y abandono.

## 5. Modelo de datos inicial

- `profiles`: usuario, nombre visible, datos mínimos y rol.
- `courses`: slug, título, descripción, estado, precio/configuración comercial.
- `modules`: curso, título, orden.
- `lessons`: módulo, título, tipo, contenido/referencia al simulador, orden, preview.
- `enrollments`: usuario, curso, origen, estado y fechas de acceso.
- `lesson_progress`: usuario, lección, estado, porcentaje y última actividad.
- `quiz_attempts`: usuario, evaluación, puntaje, aprobado, respuestas resumidas y fecha.
- `orders`: usuario, curso/plan, importe, moneda, estado y referencia del proveedor.
- `payment_events`: proveedor, ID de evento, payload mínimo, estado de procesamiento y error; índice único para idempotencia.
- `certificates`: usuario, curso, código público aleatorio, fecha de emisión, estado y snapshot de datos acreditados.
- `admin_audit_log`: actor, acción, recurso, fecha y metadatos no sensibles.

Los nombres y relaciones se convertirán en migraciones SQL antes de implementar. No almacenar datos completos de tarjetas ni secretos de pago.

## 6. Reglas de autorización

- Un usuario solo puede leer y modificar su perfil y su propio progreso.
- El usuario no puede asignarse roles, compras, inscripciones ni certificados.
- El rol administrador se asigna solo desde una operación protegida.
- El contenido de preview es público; el contenido pago se entrega solo tras validar entitlement.
- Las operaciones de pago, activación, reembolso y certificados se ejecutan desde servidor.
- La verificación pública de certificado expone solo nombre visible, curso, fecha, estado y código; nunca email, teléfono, ID interno ni información de pago.
- Las políticas RLS se prueban con casos positivos y negativos antes de abrir registros.

## 7. Flujo de compra seguro

1. El frontend solicita iniciar compra para un curso.
2. El backend calcula el precio desde la base de datos; no confía en el importe enviado por el cliente.
3. El backend crea la orden y solicita la preferencia de Checkout Pro.
4. Mercado Pago devuelve al usuario al sitio, pero la URL de retorno no habilita acceso.
5. El webhook llega al backend; se valida autenticidad y se consulta el pago al proveedor cuando corresponda.
6. Se registra el evento con clave idempotente y se actualiza la orden.
7. Solo un pago confirmado como aprobado genera la inscripción/entitlement.
8. El usuario ve el curso desbloqueado al consultar nuevamente su estado desde servidor.

## 8. Certificado verificable

- Emitir únicamente al cumplir los criterios de finalización definidos por el curso.
- Generar un UUID/código aleatorio no secuencial.
- Crear una URL pública de verificación y QR.
- Mostrar nombre visible, curso, fecha de emisión, carga horaria si se define y estado vigente/revocado.
- Registrar quién emitió o revocó y por qué.
- Aclarar que es un certificado de finalización educativa; no habilita matrícula ni reemplaza una certificación profesional.

## 9. Plan de implementación por etapas

### Etapa A — Base técnica
- Crear estructura frontend y API.
- Configurar entornos local/staging/producción.
- Configurar PostgreSQL, migraciones y RLS.
- Auth, perfiles y roles.
- CI y pruebas automatizadas.

### Etapa B — Experiencia del alumno
- Catálogo y ficha de curso.
- Navegación de módulos/lecciones.
- Integración de los 15 simuladores existentes.
- Guardado de progreso y quizzes en servidor.
- Acceso gratuito/preview.

### Etapa C — Monetización
- Órdenes y Checkout Pro.
- Webhook seguro e idempotente.
- Entitlements.
- Pantalla de compras e historial.

### Etapa D — Certificados y administración
- Reglas de finalización.
- Certificado PDF con código y QR.
- Página pública de verificación.
- Panel administrativo y auditoría.

### Etapa E — Lanzamiento controlado
- Pruebas de seguridad y permisos.
- Pruebas de compra aprobada, rechazada, pendiente, duplicada y reembolso.
- Pruebas de recuperación de contraseña y progreso multi-dispositivo.
- Términos, privacidad, soporte y política de reembolso.
- Beta cerrada antes de habilitar publicidad.

## 10. Criterios de aceptación del MVP

- Un alumno puede registrarse, ingresar y recuperar su contraseña.
- Puede ver una clase gratuita y completar un simulador.
- El progreso y el resultado de un quiz persisten al cerrar sesión y volver a ingresar.
- Un alumno sin compra no puede consultar contenido pago desde API ni Storage.
- Un pago aprobado validado por webhook habilita el curso una sola vez.
- Reenviar el mismo webhook no duplica compras ni inscripciones.
- Una URL de retorno falsa no habilita contenido.
- Un certificado tiene código único y puede verificarse públicamente.
- Un certificado revocado aparece como no vigente.
- Un alumno no puede leer datos privados de otro alumno ni cambiar su propio rol.
- El panel administrativo registra acciones sensibles.

## 11. Decisiones comerciales pendientes (no bloquear la base técnica)

El esquema soporta distintas políticas, pero antes de configurar checkout hay que definir:

- Venta individual de por vida, acceso por tiempo o suscripción.
- Precio final y moneda.
- Qué lecciones quedan gratuitas.
- Si habrá cuotas ofrecidas por Mercado Pago y cómo se comunica su costo.
- Política de reembolso y soporte.
- Si el certificado está incluido o tiene condiciones adicionales.
- Si habrá cursos futuros y paquetes.

Hasta tener esas decisiones, no mostrar precios ni promesas comerciales en producción.

## 12. Riesgos y controles

- **Webhook falsificado o repetido:** validar firma/origen, consultar estado al proveedor e idempotencia.
- **Acceso pago manipulado en frontend:** entitlement validado por backend y RLS.
- **Certificados falsos:** código aleatorio, verificación pública y registro de revocación.
- **Pérdida de progreso:** backups, restricciones únicas y pruebas de concurrencia.
- **Exposición de datos:** minimización, RLS, logs sin secretos y revisión de privacidad.
- **Dependencia de proveedor:** mantener órdenes y pagos normalizados, con referencia externa separada.
- **Simuladores incompatibles con el shell:** integrar primero uno como prueba de concepto y luego generalizar el adaptador.

## 13. Primera tarea técnica recomendada

Antes de escribir pantallas, crear migraciones SQL y pruebas RLS para perfiles, cursos, lecciones, inscripciones y progreso. Luego integrar autenticación y un simulador existente como prueba vertical completa.

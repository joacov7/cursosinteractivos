# Plataforma comercial — arquitectura sin Supabase

Estado: arquitectura base aprobada para implementación incremental
Fecha: 12-11-2026

## Decisión de stack

- Frontend: React + TypeScript + Vite, publicado en Vercel.
- API: Python 3.12 + FastAPI, desplegada en un VPS o servicio de contenedores.
- Base de datos: PostgreSQL administrado en Neon.
- ORM y migraciones: SQLAlchemy 2 + Alembic.
- Validación/configuración: Pydantic Settings.
- Pagos: Mercado Pago Checkout Pro, integrado exclusivamente desde backend.
- Archivos: almacenamiento compatible con S3 o servicio privado equivalente.
- Repositorio: GitHub; secretos nunca se guardan en el código ni en variables VITE_.

## Diagrama lógico

```text
Alumno / Administrador
        |
        v
Frontend React (Vercel)
        |
        | HTTPS + token de sesión
        v
API FastAPI (VPS / contenedor)
        |
        +---- PostgreSQL (Neon)
        |
        +---- Mercado Pago (Checkout + Webhooks)
        |
        +---- Storage privado (recursos y certificados)
```

## Responsabilidades

### Vercel
Entrega la aplicación web, previews de ramas y despliegue desde GitHub. No alojará secretos privados, lógica de pagos ni conexiones directas del navegador a PostgreSQL.

### FastAPI
Es la autoridad para autenticación, autorización, catálogo, progreso, evaluaciones, órdenes, recepción y validación de webhooks, inscripción y certificados. El cliente nunca podrá declarar que pagó ni concederse acceso.

### Neon
Aloja PostgreSQL administrado. La API se conecta usando una URL de conexión guardada como secreto. En producción se utilizará TLS y el pooler recomendado por Neon cuando corresponda. Las migraciones se ejecutarán como tarea controlada, no desde cada instancia de la aplicación.

### Autenticación
Se implementará autenticación propia con contraseñas derivadas mediante Argon2id, tokens de acceso de vida corta y refresh tokens rotativos almacenados de forma segura. Cookies HttpOnly/Secure/SameSite se priorizarán para la aplicación web. Recuperación de contraseña requerirá proveedor de correo transaccional. No se almacenarán contraseñas en texto plano.

### Mercado Pago
La orden nace en FastAPI. El backend crea la preferencia de Checkout Pro. La URL de retorno del navegador no confirma un pago. Solo una notificación verificada consultando el recurso al proveedor puede actualizar el estado y conceder acceso. El procesamiento será idempotente.

## Entornos y secretos

- Desarrollo: PostgreSQL local en Docker o una base Neon de desarrollo separada.
- CI: PostgreSQL efímero para pruebas de migraciones.
- Producción: proyecto/base Neon separado de desarrollo.
- Secretos mínimos: DATABASE_URL, claves de firma de sesión, credenciales de Mercado Pago y credenciales del proveedor de correo.
- Nunca incluir secretos en GitHub, frontend, logs ni capturas.

## Modelo funcional del MVP

Un curso, un administrador y alumnos individuales. Incluye perfiles, cursos, módulos, lecciones, inscripciones, progreso, intentos de evaluación, órdenes, eventos de pago y certificados verificables. El motor de simulaciones actual permanece aislado y se integra progresivamente.

## Seguridad y operación

- Validación y autorización en backend para cada recurso.
- Límites de frecuencia en login, recuperación y endpoints sensibles.
- CORS limitado al dominio de producción y previews autorizadas.
- Protección CSRF cuando se utilicen cookies.
- Contraseñas con Argon2id; secretos rotables.
- Webhooks autenticados/verificados, idempotencia y auditoría.
- Backups y prueba periódica de restauración de PostgreSQL.
- No registrar tokens, contraseñas, datos completos de pago ni payloads sensibles.
- Certificados públicos muestran solo los datos mínimos necesarios.

## Etapas

1. Base de API, configuración y conexión PostgreSQL.
2. Migraciones y modelos de identidad/catálogo.
3. Registro, login, sesiones y recuperación.
4. Cursos, lecciones y progreso.
5. Checkout, webhooks e inscripciones.
6. Evaluaciones, certificados y administración.
7. Integración del frontend y pruebas end-to-end.
8. Despliegue controlado y observabilidad.

## Límites de esta etapa

La elección de Neon no implica crear una cuenta, proyecto o base de datos externa. No se han cargado credenciales ni desplegado servicios. La configuración real se hará cuando exista un proyecto Neon creado por el titular. No se hará merge ni deploy sin autorización explícita.


## Esquema PostgreSQL inicial

La primera migración Alembic vive en `backend/migrations/versions/20261112_0001_initial_platform.py`. Crea estas entidades: `users`, `courses`, `course_modules`, `lessons`, `enrollments`, `lesson_progress`, `quiz_attempts`, `orders`, `payment_events`, `certificates` y `admin_audit_log`.

La base guarda importes como enteros en unidad menor (`amount_minor` / `price_minor`) para evitar errores de punto flotante. Email tiene índice único insensible a mayúsculas. Los eventos de pago son idempotentes por proveedor e ID de evento. La migración se prueba en CI contra PostgreSQL 16, incluyendo upgrade, downgrade y upgrade.

Este esquema no crea usuarios ni cursos iniciales, no configura Neon real y no implementa todavía autenticación ni endpoints de negocio. Los roles y estados son restricciones de datos, no sustituyen la autorización que deberá aplicar FastAPI.


## Autenticación — primera implementación

La API expone registro de alumno, login, renovación rotativa de sesión, logout y perfil autenticado. Las contraseñas se almacenan con Argon2id. Los access tokens HS256 son breves y requieren un secreto de al menos 32 caracteres. Los refresh tokens son aleatorios, se entregan en cookie HttpOnly/SameSite=Lax y solo se almacena su hash; cada renovación revoca el token anterior. El backend consulta el usuario en PostgreSQL para validar que siga activo. El registro público siempre asigna rol `student`.

Pendiente antes de producción: verificación de email, recuperación de contraseña y entrega de correo, limitación de intentos, herramienta segura de bootstrap de administrador, política de CSRF/orígenes revisada con el dominio definitivo y pruebas de navegador.

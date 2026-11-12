import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = new URL("../supabase/migrations/202611120001_initial_schema.sql", import.meta.url);
const hardening = new URL("../supabase/migrations/202611120002_harden_rls.sql", import.meta.url);

test("el esquema inicial define entidades centrales del LMS", async () => {
  const sql = await readFile(migration, "utf8");
  for (const table of [
    "profiles", "courses", "modules", "lessons", "enrollments",
    "lesson_progress", "quiz_attempts", "orders", "payment_events",
    "certificates", "admin_audit_log",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}\\b`, "i"));
  }
  assert.match(sql, /create table if not exists public\.payment_events/i);
  assert.match(sql, /unique \(provider, provider_event_id\)/i);
  assert.match(sql, /verification_code uuid not null unique/i);
});

test("el esquema activa RLS y limita perfiles a su propietario o administración", async () => {
  const sql = await readFile(migration, "utf8");
  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /profiles_read_self_or_admin[\s\S]*?id = auth\.uid\(\) or public\.is_admin\(\)/i);
  assert.match(sql, /grant update \(display_name\) on public\.profiles to authenticated/i);
});

test("pagos y activación de inscripciones no son escrituras directas del navegador", async () => {
  const [sql, hardeningSql] = await Promise.all([
    readFile(migration, "utf8"),
    readFile(hardening, "utf8"),
  ]);
  assert.match(sql, /orders_read_self_or_admin/i);
  assert.match(sql, /revoke all on public\.payment_events from anon, authenticated/i);
  assert.match(hardeningSql, /revoke insert on public\.quiz_attempts from authenticated/i);
  assert.match(hardeningSql, /unique index if not exists idx_orders_unique_provider_payment/i);
  assert.match(sql, /unique \(provider, provider_event_id\)/i);
});

test("el acceso a lecciones y el progreso respetan preview, curso gratuito o inscripción activa", async () => {
  const hardeningSql = await readFile(hardening, "utf8");
  assert.match(hardeningSql, /c\.access_type = 'free'/i);
  assert.match(hardeningSql, /e\.status = 'active'/i);
  assert.match(hardeningSql, /e\.expires_at is null or e\.expires_at > now\(\)/i);
  assert.match(hardeningSql, /progress_update_self_accessible_lesson/i);
});

test("la verificación pública del certificado expone solo campos no sensibles", async () => {
  const sql = await readFile(migration, "utf8");
  const view = sql.match(/create or replace view public\.public_certificate_verification as[\s\S]*?from public\.certificates;/i)?.[0] ?? "";
  assert.ok(view);
  assert.match(view, /verification_code[\s\S]*student_name_snapshot[\s\S]*course_title_snapshot[\s\S]*issued_at[\s\S]*status/i);
  assert.doesNotMatch(view, /user_id|email|phone|payment/i);
});

test("la revocación de certificados exige fecha y el progreso del cliente no se considera autoridad", async () => {
  const hardeningSql = await readFile(hardening, "utf8");
  assert.match(hardeningSql, /status = 'revoked' and revoked_at is not null/i);
  assert.match(hardeningSql, /lesson_progress is learner-editable for UX/i);
  assert.match(hardeningSql, /server-validated quiz attempts/i);
});

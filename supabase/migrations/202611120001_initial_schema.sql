-- Initial schema for the commercial learning platform MVP.
-- Apply in a Supabase/PostgreSQL project only after reviewing the deployment environment.
-- Sensitive operations (orders, payment events, enrollments, certificate issuance)
-- must be performed by a trusted server/service role, never by the browser.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  access_type text not null default 'paid' check (access_type in ('free', 'paid')),
  price_amount numeric(12,2),
  currency text not null default 'ARS',
  access_duration_days integer check (access_duration_days is null or access_duration_days > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((access_type = 'free') or price_amount is null or price_amount >= 0)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  summary text not null default '',
  content_markdown text not null default '',
  simulator_key text,
  is_preview boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (module_id, sort_order)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  source text not null default 'manual' check (source in ('manual', 'payment', 'promotion', 'admin')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, course_id),
  check (expires_at is null or expires_at > starts_at)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  last_seen_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  lesson_id uuid references public.lessons(id) on delete set null,
  quiz_key text not null,
  score numeric(5,2) not null check (score between 0 and 100),
  passed boolean not null default false,
  answers_summary jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'ARS',
  provider text not null default 'mercado_pago',
  provider_preference_id text,
  provider_payment_id text,
  external_reference text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'chargeback')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  order_id uuid references public.orders(id) on delete set null,
  event_type text not null,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processed', 'ignored', 'failed')),
  payload_minimal jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  verification_code uuid not null unique default gen_random_uuid(),
  student_name_snapshot text not null,
  course_title_snapshot text not null,
  issued_at timestamptz not null default now(),
  status text not null default 'issued' check (status in ('issued', 'revoked')),
  revoked_at timestamptz,
  revocation_reason text,
  unique (user_id, course_id),
  check ((status = 'issued' and revoked_at is null) or status = 'revoked')
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_modules_course_order on public.modules(course_id, sort_order);
create index if not exists idx_lessons_module_order on public.lessons(module_id, sort_order);
create index if not exists idx_enrollments_user_status on public.enrollments(user_id, status);
create index if not exists idx_progress_user on public.lesson_progress(user_id);
create index if not exists idx_quiz_attempts_user_course on public.quiz_attempts(user_id, course_id, attempted_at desc);
create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create index if not exists idx_orders_provider_payment on public.orders(provider, provider_payment_id);
create index if not exists idx_certificates_user on public.certificates(user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.orders enable row level security;
alter table public.payment_events enable row level security;
alter table public.certificates enable row level security;
alter table public.admin_audit_log enable row level security;

-- Profiles: students can read their own profile and edit only their display name.
drop policy if exists profiles_read_self_or_admin on public.profiles;
create policy profiles_read_self_or_admin on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_manage on public.profiles;
create policy profiles_admin_manage on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Published course structure is visible; draft content is admin-only.
drop policy if exists courses_read_published on public.courses;
create policy courses_read_published on public.courses
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists courses_admin_manage on public.courses;
create policy courses_admin_manage on public.courses
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists modules_read_published_course on public.modules;
create policy modules_read_published_course on public.modules
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = modules.course_id and c.status = 'published'
    ) or public.is_admin()
  );

drop policy if exists modules_admin_manage on public.modules;
create policy modules_admin_manage on public.modules
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- A lesson is readable when it is a published preview, or the user has active access.
drop policy if exists lessons_read_preview_or_enrolled on public.lessons;
create policy lessons_read_preview_or_enrolled on public.lessons
  for select to authenticated
  using (
    published and (
      is_preview
      or public.is_admin()
      or exists (
        select 1
        from public.modules m
        join public.enrollments e on e.course_id = m.course_id
        where m.id = lessons.module_id
          and e.user_id = auth.uid()
          and e.status = 'active'
          and (e.expires_at is null or e.expires_at > now())
      )
    )
  );

drop policy if exists lessons_read_public_preview on public.lessons;
create policy lessons_read_public_preview on public.lessons
  for select to anon
  using (
    published and is_preview and exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.status = 'published'
    )
  );

drop policy if exists lessons_admin_manage on public.lessons;
create policy lessons_admin_manage on public.lessons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists enrollments_read_self_or_admin on public.enrollments;
create policy enrollments_read_self_or_admin on public.enrollments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists enrollments_admin_manage on public.enrollments;
create policy enrollments_admin_manage on public.enrollments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists progress_read_self_or_admin on public.lesson_progress;
create policy progress_read_self_or_admin on public.lesson_progress
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists progress_insert_accessible_lesson on public.lesson_progress;
create policy progress_insert_accessible_lesson on public.lesson_progress
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.id = lesson_id
        and l.published
        and c.status = 'published'
        and (
          l.is_preview
          or exists (
            select 1 from public.enrollments e
            where e.user_id = auth.uid()
              and e.course_id = c.id
              and e.status = 'active'
              and (e.expires_at is null or e.expires_at > now())
          )
        )
    )
  );

drop policy if exists progress_update_self on public.lesson_progress;
create policy progress_update_self on public.lesson_progress
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists quiz_attempts_read_self_or_admin on public.quiz_attempts;
create policy quiz_attempts_read_self_or_admin on public.quiz_attempts
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists quiz_attempts_insert_self on public.quiz_attempts;
create policy quiz_attempts_insert_self on public.quiz_attempts
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.courses c
      where c.id = course_id and c.status = 'published'
        and (
          c.access_type = 'free'
          or exists (
            select 1 from public.enrollments e
            where e.user_id = auth.uid()
              and e.course_id = c.id
              and e.status = 'active'
              and (e.expires_at is null or e.expires_at > now())
          )
        )
    )
  );

drop policy if exists orders_read_self_or_admin on public.orders;
create policy orders_read_self_or_admin on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists certificates_read_self_or_admin on public.certificates;
create policy certificates_read_self_or_admin on public.certificates
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists certificates_admin_manage on public.certificates;
create policy certificates_admin_manage on public.certificates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists audit_admin_read on public.admin_audit_log;
create policy audit_admin_read on public.admin_audit_log
  for select to authenticated
  using (public.is_admin());

drop policy if exists audit_admin_insert on public.admin_audit_log;
create policy audit_admin_insert on public.admin_audit_log
  for insert to authenticated
  with check (public.is_admin());

-- Public verification exposes only certificate-safe fields; the UUID is not sequential.
create or replace view public.public_certificate_verification as
select
  verification_code,
  student_name_snapshot,
  course_title_snapshot,
  issued_at,
  status
from public.certificates;

-- Explicit grants. In particular, role, orders, payment events and enrollments
-- are not writable by ordinary authenticated clients.
grant usage on schema public to anon, authenticated;
grant select on public.courses, public.modules to anon, authenticated;
grant select on public.lessons to anon, authenticated;
grant select on public.profiles, public.enrollments, public.lesson_progress,
  public.quiz_attempts, public.orders, public.certificates to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant insert, update on public.lesson_progress to authenticated;
grant insert on public.quiz_attempts to authenticated;
grant select on public.public_certificate_verification to anon, authenticated;
grant select, insert, update, delete on public.courses, public.modules, public.lessons,
  public.enrollments, public.certificates to authenticated;
grant select, insert on public.admin_audit_log to authenticated;

-- No client-side table grants for payment_events.
revoke all on public.payment_events from anon, authenticated;

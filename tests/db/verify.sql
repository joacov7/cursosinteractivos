\set ON_ERROR_STOP on

-- Seed data as the migration owner.
insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-4000-8000-000000000001', '{"display_name":"Alumna Uno"}'),
  ('00000000-0000-4000-8000-000000000002', '{"display_name":"Alumno Dos"}');

insert into public.courses (id, slug, title, status, access_type) values
  ('10000000-0000-4000-8000-000000000001', 'curso-gratis', 'Curso gratuito', 'published', 'free'),
  ('10000000-0000-4000-8000-000000000002', 'curso-pago', 'Curso pago', 'published', 'paid'),
  ('10000000-0000-4000-8000-000000000003', 'curso-borrador', 'Curso borrador', 'draft', 'paid');

insert into public.modules (id, course_id, title, sort_order) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Módulo gratis', 1),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Módulo pago', 1),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Módulo borrador', 1);

insert into public.lessons (id, module_id, title, is_preview, published, sort_order) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Lección gratis completa', false, true, 1),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Vista previa paga', true, true, 1),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'Lección paga cerrada', false, true, 2),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'Lección borrador', true, false, 1);

insert into public.enrollments (user_id, course_id, status, source) values
  ('00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'active', 'payment');

insert into public.certificates (
  user_id, course_id, verification_code, student_name_snapshot, course_title_snapshot, status
) values
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
   '40000000-0000-4000-8000-000000000001', 'Alumna Uno', 'Curso gratuito', 'issued'),
  ('00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
   '40000000-0000-4000-8000-000000000002', 'Alumno Dos', 'Curso pago', 'revoked', now());

-- Anonymous users see published catalog and previews, never paid lessons or drafts.
begin;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  if (select count(*) from public.courses where id = '10000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'anon cannot read published course';
  end if;
  if (select count(*) from public.courses where id = '10000000-0000-4000-8000-000000000003') <> 0 then
    raise exception 'anon can read draft course';
  end if;
  if (select count(*) from public.lessons where id = '30000000-0000-4000-8000-000000000002') <> 1 then
    raise exception 'anon cannot read preview lesson';
  end if;
  if (select count(*) from public.lessons where id = '30000000-0000-4000-8000-000000000003') <> 0 then
    raise exception 'anon can read paid lesson';
  end if;
  if (select count(*) from public.public_certificate_verification) <> 2 then
    raise exception 'public certificate verification view is not accessible';
  end if;
end $$;
rollback;

-- Student one sees free lessons and previews, but not paid lessons or another profile.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
do $$
begin
  if (select count(*) from public.profiles where id = '00000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'student cannot read own profile';
  end if;
  if (select count(*) from public.profiles where id = '00000000-0000-4000-8000-000000000002') <> 0 then
    raise exception 'student can read another profile';
  end if;
  if (select count(*) from public.lessons where id = '30000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'student cannot read free course lesson';
  end if;
  if (select count(*) from public.lessons where id = '30000000-0000-4000-8000-000000000002') <> 1 then
    raise exception 'student cannot read paid preview';
  end if;
  if (select count(*) from public.lessons where id = '30000000-0000-4000-8000-000000000003') <> 0 then
    raise exception 'student can read locked paid lesson';
  end if;
  if has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') then
    raise exception 'student can update own role';
  end if;
  if has_table_privilege('authenticated', 'public.orders', 'INSERT') then
    raise exception 'student can insert an order directly';
  end if;
  if has_table_privilege('authenticated', 'public.quiz_attempts', 'INSERT') then
    raise exception 'student can submit a trusted quiz result directly';
  end if;
  if has_table_privilege('authenticated', 'public.payment_events', 'INSERT') then
    raise exception 'student can write payment events';
  end if;
  insert into public.lesson_progress (user_id, lesson_id, status, progress_percent)
  values ('00000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'in_progress', 25);
end $$;
rollback;

-- Student two has a valid paid enrollment and can read the paid lesson.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
do $$
begin
  if (select count(*) from public.lessons where id = '30000000-0000-4000-8000-000000000003') <> 1 then
    raise exception 'active enrollment does not unlock paid lesson';
  end if;
  if (select count(*) from public.enrollments) <> 1 then
    raise exception 'student cannot read own enrollment';
  end if;
  if has_table_privilege('authenticated', 'public.enrollments', 'INSERT') then
    raise exception 'student has direct enrollment insert privilege';
  end if;
end $$;
rollback;

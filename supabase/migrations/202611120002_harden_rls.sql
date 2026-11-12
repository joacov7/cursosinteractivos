-- Hardening pass for the initial MVP schema.
-- Keep quiz scoring, payment state and certificate issuance server-authoritative.

-- The helper returns false for anonymous users; policies for public course reads call it.
grant execute on function public.is_admin() to anon, authenticated;

-- Administrators may inspect unpublished lessons; students may read previews or
-- lessons in free courses or active paid enrollments.
drop policy if exists lessons_read_preview_or_enrolled on public.lessons;
create policy lessons_read_preview_or_enrolled on public.lessons
  for select to authenticated
  using (
    public.is_admin()
    or (
      published
      and exists (
        select 1
        from public.modules m
        join public.courses c on c.id = m.course_id
        where m.id = lessons.module_id
          and c.status = 'published'
          and (
            c.access_type = 'free'
            or lessons.is_preview
            or exists (
              select 1 from public.enrollments e
              where e.course_id = c.id
                and e.user_id = auth.uid()
                and e.status = 'active'
                and (e.expires_at is null or e.expires_at > now())
            )
          )
      )
    )
  );

-- Free courses allow progress without a paid enrollment.
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
          c.access_type = 'free'
          or l.is_preview
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
create policy progress_update_self_accessible_lesson on public.lesson_progress
  for update to authenticated
  using (user_id = auth.uid())
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
          c.access_type = 'free'
          or l.is_preview
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

-- Quiz answers and scores are untrusted if submitted directly by the browser.
-- Only the backend/service role may create attempts after validating answers.
drop policy if exists quiz_attempts_insert_self on public.quiz_attempts;
revoke insert on public.quiz_attempts from authenticated;

-- Prevent one provider payment from being attached to multiple orders.
create unique index if not exists idx_orders_unique_provider_payment
  on public.orders(provider, provider_payment_id)
  where provider_payment_id is not null;

-- A revoked certificate must have a revocation timestamp.
alter table public.certificates
  drop constraint if exists certificates_check;
alter table public.certificates
  add constraint certificates_revocation_consistency
  check (
    (status = 'issued' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute procedure public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- IMPORTANT: lesson_progress is learner-editable for UX. Never issue certificates
-- from progress rows or client-submitted quiz data alone. The backend must recompute
-- completion from authoritative rules and server-validated quiz attempts.

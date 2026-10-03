-- ============================================================================
-- SEBAWEB — RLS DÜZELTME (v2)
-- ============================================================================
-- NEDEN v2: İlk betik çalıştırıldıktan sonra news korundu ama projects
-- korunmadı. Canlı API testi:
--     news     -> HTTP 401 / kod 42501  "new row violates row-level security policy"
--     projects -> HTTP 400 / kod 23502  "null value in column location ... not-null"
-- projects'te istek RLS kontrolünü geçip kısıtlamalara kadar gelmiş: yani orada
-- hâlâ anon yazmaya izin veren bir politika var.
--
-- Sebep: Postgres'te PERMISSIVE politikalar OR'lanır. Adı farklı eski bir
-- politikayı silmeden yalnızca yeni politika eklemek işe yaramaz; eski politika
-- izin vermeye devam eder.
--
-- ÇÖZÜM: projects ve news üzerindeki TÜM politikaları (adı ne olursa olsun)
--         kaldırıp doğru seti sıfırdan kurmak.
--
-- ÇALIŞTIRMA: Supabase Dashboard -> SQL Editor -> New query
--             tamamını yapıştır -> RUN. (Metin tekrar çalıştırılabilir.)
-- NOT: Bu betik yalnızca projects ve news tablolarına dokunur.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0) TEŞHİS — yeni politikalar kurulmadan ÖNCE mevcut durum
--    (bu sonucu bana iletirseniz kaynağı kesin teşhis edebilirim)
-- ---------------------------------------------------------------------------
select c.relname             as tablo,
       c.relrowsecurity      as rls_aktif,
       c.relforcerowsecurity as rls_zorunlu
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('projects', 'news');

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news')
order by tablename, cmd, policyname;


-- ---------------------------------------------------------------------------
-- 1) Her iki tablodaki TÜM politikaları kaldır (adı ne olursa olsun)
-- ---------------------------------------------------------------------------
do $$
declare p record;
begin
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('projects', 'news')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    raise notice 'kaldirildi: %.%', p.tablename, p.policyname;
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- 2) RLS'i etkinleştir
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.news     enable row level security;


-- ---------------------------------------------------------------------------
-- 3) OKUMA — herkese açık (site vitrini için gerekli)
-- ---------------------------------------------------------------------------
create policy "projects_public_read" on public.projects
  for select to anon, authenticated using (true);

create policy "news_public_read" on public.news
  for select to anon, authenticated using (true);


-- ---------------------------------------------------------------------------
-- 4) YAZMA — yalnızca giriş yapmış (authenticated) kullanıcı
-- ---------------------------------------------------------------------------
create policy "projects_admin_insert" on public.projects
  for insert to authenticated with check (true);

create policy "projects_admin_update" on public.projects
  for update to authenticated using (true) with check (true);

create policy "projects_admin_delete" on public.projects
  for delete to authenticated using (true);

create policy "news_admin_insert" on public.news
  for insert to authenticated with check (true);

create policy "news_admin_update" on public.news
  for update to authenticated using (true) with check (true);

create policy "news_admin_delete" on public.news
  for delete to authenticated using (true);


-- ---------------------------------------------------------------------------
-- 5) DOĞRULAMA — her iki tabloda rls_aktif = true olmalı ve toplam
--    8 politika görünmeli (2 SELECT + 6 yazma)
-- ---------------------------------------------------------------------------
select c.relname as tablo, c.relrowsecurity as rls_aktif
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('projects', 'news');

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news')
order by tablename, cmd;


-- ============================================================================
-- DAHA SIKI İSTERSENİZ (tek yönetici hesabı)
-- ============================================================================
-- 4. bölümdeki `to authenticated` ifadelerini şu kalıpla değiştirin
-- (kendi e-posta adresinizi yazın):
--   to authenticated
--   using ( (auth.jwt() ->> 'email') = 'SIZIN-EPOSTANIZ@ornek.com' )
--   with check ( (auth.jwt() ->> 'email') = 'SIZIN-EPOSTANIZ@ornek.com' )
-- ============================================================================

-- ============================================================================
-- SEBAWEB — Supabase Güvenlik Politikaları (RLS)
-- ============================================================================
-- NE İÇİN: Bu dosya çalıştırılmadan önce `projects` ve `news` tablolarına
-- sitenin herkese açık anon anahtarıyla YAZILABİLİYORDU. Yani anon anahtarını
-- gören herkes (anahtar JS paketinde ve GitHub workflow dosyasında açıkta)
-- proje/fotoğraf silebiliyor veya değiştirebiliyordu.
--
-- NASIL ÇALIŞTIRILIR:
--   Supabase Dashboard → SQL Editor → New query → bu dosyanın tamamını
--   yapıştır → RUN. Tekrar çalıştırılabilir (idempotent).
--
-- SONUÇ: Okuma herkese açık kalır (site vitrini çalışmaya devam eder),
--        yazma yalnızca giriş yapmış yöneticiye açılır.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1) RLS'i her iki tabloda etkinleştir
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.news     enable row level security;


-- ---------------------------------------------------------------------------
-- 2) Daha önce tanımlanmış olabilecek politikaları temizle
--    (tekrar çalıştırılabilirlik için)
-- ---------------------------------------------------------------------------
drop policy if exists "projects_public_read"  on public.projects;
drop policy if exists "projects_admin_insert" on public.projects;
drop policy if exists "projects_admin_update" on public.projects;
drop policy if exists "projects_admin_delete" on public.projects;

drop policy if exists "news_public_read"      on public.news;
drop policy if exists "news_admin_insert"     on public.news;
drop policy if exists "news_admin_update"     on public.news;
drop policy if exists "news_admin_delete"     on public.news;


-- ---------------------------------------------------------------------------
-- 3) OKUMA — herkese açık (site vitrininin içeriği göstermesi için gerekli)
-- ---------------------------------------------------------------------------
create policy "projects_public_read" on public.projects
  for select
  to anon, authenticated
  using (true);

create policy "news_public_read" on public.news
  for select
  to anon, authenticated
  using (true);


-- ---------------------------------------------------------------------------
-- 4) YAZMA — yalnızca giriş yapmış (authenticated) kullanıcı
--    Admin panelindeki ekle / düzenle / sil işlemleri buradan geçer.
-- ---------------------------------------------------------------------------
create policy "projects_admin_insert" on public.projects
  for insert
  to authenticated
  with check (true);

create policy "projects_admin_update" on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

create policy "projects_admin_delete" on public.projects
  for delete
  to authenticated
  using (true);

create policy "news_admin_insert" on public.news
  for insert
  to authenticated
  with check (true);

create policy "news_admin_update" on public.news
  for update
  to authenticated
  using (true)
  with check (true);

create policy "news_admin_delete" on public.news
  for delete
  to authenticated
  using (true);


-- ============================================================================
-- DAHA SIKI İSTERSENİZ (tek yönetici hesabı)
-- ============================================================================
-- Birden fazla Supabase kullanıcınız varsa ve yalnızca birinin yazmasını
-- istiyorsanız, 4. bölümdeki `to authenticated` ifadelerini şu kalıpla
-- değiştirin (kendi e-postanızı yazın):
--
--   to authenticated
--   using ( (auth.jwt() ->> 'email') = 'SIZIN-EPOSTANIZ@ornek.com' )
--   with check ( (auth.jwt() ->> 'email') = 'SIZIN-EPOSTANIZ@ornek.com' )
--
-- Bu daha güvenlidir: yönetici yetkisi verdiğiniz tek hesap dışında kimse
-- yazamaz. İleride ikinci bir yönetici eklerseniz bu politikayı güncellemeyi
-- unutmayın.
-- ============================================================================


-- ============================================================================
-- DOĞRULAMA — çalıştırdıktan sonra kontrol
-- ============================================================================
-- A) RLS açık mı?
select relname as tablo, relrowsecurity as rls_aktif
from pg_class
where relname in ('projects', 'news');
-- Beklenen: ikisi için de rls_aktif = true

-- B) Politikalar yerinde mi?
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news')
order by tablename, cmd;
-- Beklenen: her tablo için 1 SELECT (anon+authenticated) ve
--           3 INSERT/UPDATE/DELETE (authenticated)

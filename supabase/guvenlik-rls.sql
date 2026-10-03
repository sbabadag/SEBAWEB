-- ============================================================================
-- SEBAWEB — RLS DÜZELTME (v3) — AÇIK KAYIT AÇIĞINI KAPATIR
-- ============================================================================
-- NEDEN v3:
--   v2'de yazma politikaları `to authenticated` idi. Ancak Supabase projesinde
--   HERKESE AÇIK KAYIT (signup) AÇIK ve e-posta otomatik onaylı
--   (mailer_autoconfirm = true). Canlı test:
--       POST /auth/v1/signup -> 422 "Password should be at least 6 characters"
--   Yani istek "kayıt kapalı" diye reddedilmiyor, şifre doğrulamasına kadar
--   geliyor — uç nokta çalışıyor.
--
--   Sonuç: sitenin paketindeki herkese açık anon anahtarını alan biri kendine
--   hesap açıp `authenticated` rolü kazanabiliyor ve v2 politikalarıyla
--   projelere/haberlere YAZABİLİYORDU.
--
-- ÇÖZÜM: yazma politikalarını "her authenticated" yerine YALNIZCA belirli bir
--        yönetici e-postasına bağlamak.
--
-- ⚠️ ÇALIŞTIRMADAN ÖNCE: aşağıdaki 'ADMIN_EPOSTANIZ@ORNEK.COM' yerine kendi
--    yönetici e-posta adresinizi yazın (4. bölümde 6 yerde geçiyor).
--    Doğru adresi 0. bölümdeki sorgunun çıktısından kopyalayabilirsiniz.
--
-- ÇALIŞTIRMA: Supabase Dashboard -> SQL Editor -> New query
--             tamamını yapıştır -> RUN. (Tekrar çalıştırılabilir.)
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0) TEŞHİS — mevcut kullanıcılar ve politikalar
--    Yönetici e-postanızı buradan kopyalayın. Beklemediğiniz bir hesap varsa
--    (özellikle açık kayıt yüzünden oluşmuş olabilir) silin ve bana bildirin.
-- ---------------------------------------------------------------------------
select id, email, created_at, last_sign_in_at
from auth.users
order by created_at;

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
    where schemaname = 'public' and tablename in ('projects', 'news')
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
-- 3) OKUMA — herkese açık (site vitrini için gerekli, değişmiyor)
-- ---------------------------------------------------------------------------
create policy "projects_public_read" on public.projects
  for select to anon, authenticated using (true);

create policy "news_public_read" on public.news
  for select to anon, authenticated using (true);


-- ---------------------------------------------------------------------------
-- 4) YAZMA — YALNIZCA sizin yönetici hesabınız
--    ⬇️ 'ADMIN_EPOSTANIZ@ORNEK.COM' yerine kendi e-postanızı yazın (6 yerde)
-- ---------------------------------------------------------------------------
create policy "projects_admin_insert" on public.projects
  for insert to authenticated
  with check ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' );

create policy "projects_admin_update" on public.projects
  for update to authenticated
  using ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' )
  with check ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' );

create policy "projects_admin_delete" on public.projects
  for delete to authenticated
  using ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' );

create policy "news_admin_insert" on public.news
  for insert to authenticated
  with check ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' );

create policy "news_admin_update" on public.news
  for update to authenticated
  using ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' )
  with check ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' );

create policy "news_admin_delete" on public.news
  for delete to authenticated
  using ( (auth.jwt() ->> 'email') = 'ADMIN_EPOSTANIZ@ORNEK.COM' );


-- ---------------------------------------------------------------------------
-- 5) DOĞRULAMA
-- ---------------------------------------------------------------------------
select c.relname as tablo, c.relrowsecurity as rls_aktif
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('projects', 'news');

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news')
order by tablename, cmd;
-- Beklenen: 2 SELECT (anon+authenticated) + 6 yazma politikası; yazma
-- politikalarının qual / with_check alanlarında E-POSTANIZ görünmeli.
-- E-posta görünmüyorsa değiştirmeyi unutmuşsunuz demektir.


-- ============================================================================
-- EK ÖNERİ — HALKA AÇIK KAYDI KAPATIN (ikinci savunma hattı)
-- ============================================================================
-- Yukarıdaki e-posta kısıtı açığı kapatır. Yine de halka açık kaydı kapatmak
-- iyi olur:
--
--   Supabase Dashboard -> Authentication -> Sign In / Providers -> Email
--     -> "Allow new users to sign up"  -> KAPAT
--
-- Neden ikisi birden: e-posta kısıtı tek savunma hattı olarak kalırsa, e-posta
-- adresiniz değiştiğinde veya ikinci bir yönetici eklediğinizde politikayı
-- güncellemeyi unutursanız kendiniz kilitli kalırsınız. Kayıt kapalıyken ise
-- dışarıdan hesap açmak zaten mümkün olmaz.
-- ============================================================================

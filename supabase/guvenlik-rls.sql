-- ============================================================================
-- SEBAWEB — RLS DÜZELTME (v5) — YÖNETİCİYİ OTOMATİK BULUR
-- ============================================================================
-- NEDEN v5 (v4 neden çalışmadı):
--   v4'te politika metinlerini kurmak için ETIKETLI dolar tirmaklama
--   (q ile etiketlenmis bicim) kullandim. Supabase'in SQL düzenleyicisi bunu
--   çözümleyemiyor: betiği yanlış yerden bölüp
--   "syntax error at or near using" hatası veriyor.
--
--   Kanıt: v2 ve v3'ün blokları sizde sorunsuz çalıştı — onlarda yalnızca
--   çift-dolar ayracı ve içinde TEK TIRNAKLI metinler vardı. Sorun ilk kez
--   v4'te eklenen etiketli dolar tırnaklamaydı.
--
--   v5'te iç içe dolar tırnaklama YOK. Politika metni tek tırnaklı parçalar ve
--   quote_literal() ile kurulur. Ayrıca koşul tek yerde tanımlanıp 6 politikada
--   tekrar kullanılır — yazım hatası riski düşer.
--
-- ÇALIŞTIRMA: Supabase Dashboard -> SQL Editor -> New query
--             tamamını yapıştır -> RUN.  Tekrar çalıştırılabilir.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0) TEŞHİS — önce mevcut durumu görün
--    Çıktının tamamını bana gönderirseniz birlikte yorumlarız.
-- ---------------------------------------------------------------------------
select id, email, created_at, last_sign_in_at, email_confirmed_at
from auth.users
order by created_at;

select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news')
order by tablename, cmd;


-- ---------------------------------------------------------------------------
-- 1) DÜZELTME
--    Otomatik seçim yanlış olursa `elle` değişkenine kendi e-postanızı yazın.
-- ---------------------------------------------------------------------------
do $$
declare
  elle        text := null;      -- örn: 'ornek@eposta.com'
  admin_uid   uuid;
  admin_email text;
  kosul       text;
  n           int;
  p           record;
begin
  select count(*) into n from auth.users where email is not null;

  if n = 0 then
    raise exception 'auth.users icinde e-postali kullanici yok. Once Authentication > Users > Add user ile yonetici kullanicisi olusturun.';
  end if;

  if elle is not null then
    select u.id, lower(u.email) into admin_uid, admin_email
      from auth.users u
     where lower(u.email) = lower(elle)
     limit 1;
    if admin_uid is null then
      raise exception 'Verdiginiz e-posta (%) auth.users icinde yok.', elle;
    end if;
  else
    -- En son giriş yapan kullanıcıyı yönetici kabul et.
    select u.id, lower(u.email) into admin_uid, admin_email
      from auth.users u
     where u.email is not null
     order by (u.last_sign_in_at is null), u.last_sign_in_at desc nulls last, u.created_at
     limit 1;
  end if;

  raise notice '>> Yonetici olarak secilen: %  (uid: %)', admin_email, admin_uid;
  if elle is null and n > 1 then
    raise notice '>> UYARI: toplam % kullanici var. Yanlis secildiyse elle degiskenine dogru adresi yazip tekrar calistirin.', n;
  end if;

  -- (a) Her iki tablodaki TÜM politikaları kaldır (adı ne olursa olsun)
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('projects', 'news')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    raise notice '>> kaldirildi: %.%', p.tablename, p.policyname;
  end loop;

  -- (b) Koşulu TEK YERDE kur: uid VEYA e-posta eşleşmesi.
  --     İç içe dolar tırnaklama yok; quote_literal değeri güvenle tırnaklar.
  kosul := '( auth.uid() = ' || quote_literal(admin_uid::text) || '::uuid'
        || ' or lower(auth.jwt() ->> ''email'') = ' || quote_literal(admin_email) || ' )';

  -- (c) RLS etkinleştir
  execute 'alter table public.projects enable row level security';
  execute 'alter table public.news     enable row level security';

  -- (d) OKUMA — herkese açık (site vitrini bunu kullanıyor)
  execute 'create policy projects_public_read on public.projects for select to anon, authenticated using (true)';
  execute 'create policy news_public_read     on public.news     for select to anon, authenticated using (true)';

  -- (e) YAZMA — yalnızca yönetici
  execute 'create policy projects_admin_insert on public.projects for insert to authenticated'
       || ' with check ' || kosul;
  execute 'create policy projects_admin_update on public.projects for update to authenticated'
       || ' using ' || kosul || ' with check ' || kosul;
  execute 'create policy projects_admin_delete on public.projects for delete to authenticated'
       || ' using ' || kosul;

  execute 'create policy news_admin_insert on public.news for insert to authenticated'
       || ' with check ' || kosul;
  execute 'create policy news_admin_update on public.news for update to authenticated'
       || ' using ' || kosul || ' with check ' || kosul;
  execute 'create policy news_admin_delete on public.news for delete to authenticated'
       || ' using ' || kosul;

  raise notice '>> 8 politika kuruldu. Yonetici: %', admin_email;
  raise notice '>> kurulan kosul: %', kosul;
end $$;


-- ---------------------------------------------------------------------------
-- 2) DOĞRULAMA
--    Yazma politikalarının qual / with_check alanında yöneticinin uid'i ve
--    e-postası görünmeli. Görünmüyorsa çıktıyı bana gönderin.
-- ---------------------------------------------------------------------------
select c.relname as tablo, c.relrowsecurity as rls_aktif
from pg_class c
join pg_namespace n2 on n2.oid = c.relnamespace
where n2.nspname = 'public' and c.relname in ('projects', 'news');

select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news')
order by tablename, cmd;

select count(*)                                as toplam,
       count(*) filter (where cmd = 'SELECT')  as okuma,
       count(*) filter (where cmd <> 'SELECT') as yazma
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news');
-- Beklenen: toplam 8, okuma 2, yazma 6


-- ============================================================================
-- 3) AYNI ANDA: HALKA AÇIK KAYDI KAPATIN (dashboard)
-- ============================================================================
--   Supabase -> Authentication -> Sign In / Providers -> Email
--     -> "Allow new users to sign up"  -> KAPAT
--
--   Kayıt açıkken (ve mailer_autoconfirm = true iken) sitenin paketindeki anon
--   anahtarıyla dışarıdan hesap açılabilir. Yukarıdaki uid/e-posta kısıtı o
--   hesapların YAZMASINI engeller; kaydı kapatmak gereksiz hesap birikmesini
--   de önler.
-- ============================================================================


-- ============================================================================
-- 4) HÂLÂ AYNI HATA GELİRSE — sırayla bakılacaklar
-- ============================================================================
-- Panelde giriş yaptıktan sonra tarayıcı konsolunda:
--
--   const { data } = await supabase.auth.getSession();
--   console.log('uid  :', data.session?.user?.id);
--   console.log('email:', data.session?.user?.email);
--   console.log('jeton:', !!data.session?.access_token);
--
-- a) jeton false ise: panel giriş yapmamıştır -> hata RLS'ten degil, oturumun
--    kurulmamis olmasindan gelir.
-- b) uid, yukaridaki "Yonetici olarak secilen" satirindaki uid'den farkliysa:
--    yanlis kullanici secilmis -> `elle` degiskenine kendi e-postanizi yazip
--    tekrar calistirin.
-- c) uid ayni oldugu halde hata suruyorsa: 2. bolumun ciktisinda 6 yazma
--    politikasi gorunuyor mu diye bakin.
-- ============================================================================

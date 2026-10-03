-- ============================================================================
-- SEBAWEB — RLS DÜZELTME (v4) — YÖNETİCİYİ OTOMATİK BULUR
-- ============================================================================
-- NEDEN v4:
--   v3'te yönetici e-postasını 6 yere elle yazmak gerekiyordu. Bir yerde
--   atlanırsa politika 'ADMIN_EPOSTANIZ@ORNEK.COM' ile kalır ve panelden
--   haber eklenmeye çalışıldığında şu hata görülür:
--       new row violates row-level security policy for table "news"
--   Bu sürüm yöneticiyi auth.users tablosundan KENDİSİ bulur — yer tutucu yok.
--
--   İki iyileştirme:
--     * Karşılaştırma lower() ile (büyük/küçük harf farkını kapatır).
--     * Politika hem auth.uid() hem e-posta iddiası ile eşleşir; jeton'da
--       e-posta alanı bulunmasa bile yönetici kilitli kalmaz.
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
  n           int;
  p           record;
begin
  select count(*) into n from auth.users where email is not null;

  if n = 0 then
    raise exception
      'auth.users içinde e-postalı kullanıcı yok. Önce Authentication > Users > Add user ile yönetici kullanıcısı oluşturun.';
  end if;

  if elle is not null then
    select u.id, lower(u.email) into admin_uid, admin_email
      from auth.users u
     where lower(u.email) = lower(elle)
     limit 1;
    if admin_uid is null then
      raise exception 'Verdiğiniz e-posta (%) auth.users içinde yok.', elle;
    end if;
  else
    -- En son giriş yapan kullanıcıyı yönetici kabul et.
    select u.id, lower(u.email) into admin_uid, admin_email
      from auth.users u
     where u.email is not null
     order by (u.last_sign_in_at is null), u.last_sign_in_at desc nulls last, u.created_at
     limit 1;
  end if;

  raise notice '>> Yönetici olarak seçilen: %  (uid: %)', admin_email, admin_uid;
  if elle is null and n > 1 then
    raise notice '>> UYARI: toplam % kullanıcı var. Yanlış seçildiyse `elle` değişkenine doğru adresi yazıp tekrar çalıştırın.', n;
  end if;

  -- (a) Her iki tablodaki TÜM politikaları kaldır (adı ne olursa olsun)
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('projects', 'news')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    raise notice '>> kaldırıldı: %.%', p.tablename, p.policyname;
  end loop;

  -- (b) RLS etkinleştir
  execute 'alter table public.projects enable row level security';
  execute 'alter table public.news     enable row level security';

  -- (c) OKUMA — herkese açık (site vitrini bunu kullanıyor)
  execute 'create policy projects_public_read on public.projects for select to anon, authenticated using (true)';
  execute 'create policy news_public_read     on public.news     for select to anon, authenticated using (true)';

  -- (d) YAZMA — yalnızca yönetici (uid VEYA e-posta eşleşmesi)
  execute format($q$create policy projects_admin_insert on public.projects
      for insert to authenticated
      with check ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )$q$,
      admin_uid, admin_email);

  execute format($q$create policy projects_admin_update on public.projects
      for update to authenticated
      using      ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )
      with check ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )$q$,
      admin_uid, admin_email, admin_uid, admin_email);

  execute format($q$create policy projects_admin_delete on public.projects
      for delete to authenticated
      using ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )$q$,
      admin_uid, admin_email);

  execute format($q$create policy news_admin_insert on public.news
      for insert to authenticated
      with check ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )$q$,
      admin_uid, admin_email);

  execute format($q$create policy news_admin_update on public.news
      for update to authenticated
      using      ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )
      with check ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )$q$,
      admin_uid, admin_email, admin_uid, admin_email);

  execute format($q$create policy news_admin_delete on public.news
      for delete to authenticated
      using ( auth.uid() = %L::uuid or lower(auth.jwt() ->> 'email') = %L )$q$,
      admin_uid, admin_email);

  raise notice '>> 8 politika kuruldu. Yönetici: %', admin_email;
end $$;


-- ---------------------------------------------------------------------------
-- 2) DOĞRULAMA
--    Yazma politikalarının with_check alanında yöneticinin uid'i ve e-postası
--    görünmeli. Görünmüyorsa bir şey ters gitmiştir — çıktıyı bana gönderin.
-- ---------------------------------------------------------------------------
select c.relname as tablo, c.relrowsecurity as rls_aktif
from pg_class c
join pg_namespace n2 on n2.oid = c.relnamespace
where n2.nspname = 'public' and c.relname in ('projects', 'news');

select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('projects', 'news')
order by tablename, cmd;

select count(*)                                              as toplam,
       count(*) filter (where cmd = 'SELECT')                 as okuma,
       count(*) filter (where cmd <> 'SELECT')                as yazma
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
--   anahtarıyla dışarıdan hesap açılabilir. Yukarıdaki e-posta/uid kısıtı o
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
-- a) jeton false ise: panel giriş yapmamıştır → hata RLS'ten değil,
--    oturumun kurulmamış olmasından gelir.
-- b) uid, yukarıda "Yönetici olarak seçilen" satırındaki uid'den farklıysa:
--    yanlış kullanıcı seçilmiş → `elle` değişkenine kendi e-postanızı yazıp
--    tekrar çalıştırın.
-- c) uid aynı olduğu hâlde hata sürüyorsa: politika oluşmamıştır → 2. bölümün
--    çıktısında 6 yazma politikası görünüyor mu diye bakın.
-- ============================================================================

-- ============================================================================
-- SEBAWEB — YEDEK YOL: pg_net ile doğrudan tetikleyici
-- ============================================================================
-- NE ZAMAN KULLANILIR:
--   Panelden webhook oluştururken şu hata alınırsa:
--       ERROR: 3F000: schema "supabase_functions" does not exist
--   Önce şunu deneyin (doğru çözüm budur):
--       Dashboard → Integrations → Database Webhooks → Enable
--   Bu açıldıktan sonra panelden webhook normal şekilde oluşturulur.
--
--   Entegrasyon açılamıyorsa (buton yok / sağlama başarısız), panelden webhook
--   oluşturmak yerine bu dosyayı çalıştırın. Bu yol `supabase_functions`
--   şemasına hiç ihtiyaç duymaz; doğrudan pg_net kullanır.
--
-- NEDEN ELLE `create schema supabase_functions` YAZMIYORUZ:
--   Webhook fonksiyonu `supabase_functions_admin` sahipliğinde olmalı ve
--   proje seviyesindeki bir rolle bu sahiplik kurulamaz. Yarım bir şema
--   oluşturmak sorunu erteler, çözmez.
--
-- ÇALIŞTIRMA: SQL Editor → tamamını yapıştır → RUN
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1) Ayarlar tablosu — paylaşılan anahtar burada durur.
--    RLS açık + hiç politika yok + anon/authenticated yetkileri alınmış:
--    yani yalnızca tablo sahibi (ve SECURITY DEFINER fonksiyonumuz) okuyabilir.
-- ---------------------------------------------------------------------------
create table if not exists public.ayarlar (
  anahtar text primary key,
  deger   text not null
);

alter table public.ayarlar enable row level security;
revoke all on public.ayarlar from anon, authenticated;


-- ---------------------------------------------------------------------------
-- 2) Paylaşılan anahtarı yazın
--    ⚠️ 'BURAYA_GIZLI_METIN' yerine, Edge Function'daki BILDIRIM_ANAHTARI
--       gizli değeriyle AYNI metni yazın. İkisi birebir aynı olmalı.
-- ---------------------------------------------------------------------------
insert into public.ayarlar (anahtar, deger)
values ('bildirim_anahtari', 'BURAYA_GIZLI_METIN')
on conflict (anahtar) do update set deger = excluded.deger;


-- ---------------------------------------------------------------------------
-- 3) pg_net uzantısı
-- ---------------------------------------------------------------------------
create extension if not exists pg_net with schema extensions;


-- ---------------------------------------------------------------------------
-- 4) Tetikleyici fonksiyonu
-- ---------------------------------------------------------------------------
create or replace function public.iletisim_bildirim_tetikle()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net, pg_temp
as $$
declare
  istek_id bigint;
  gizli    text;
begin
  -- Not: tablo kolonu ile değişken adı çakışmasın diye takma ad kullanılıyor.
  -- 'select ... from public.ayarlar where anahtar = ...' yazılsaydı Postgres
  -- "column reference anahtar is ambiguous" hatası verirdi.
  select a.deger into gizli from public.ayarlar a where a.anahtar = 'bildirim_anahtari';

  select net.http_post(
    url     := 'https://djxgtphcvjshkeccnrvj.supabase.co/functions/v1/iletisim-bildirim',
    headers := jsonb_build_object(
                 'Content-Type',        'application/json',
                 -- ⚠️ ZORUNLU: Edge Function geçidi, Authorization (veya apikey)
                 -- başlığı olmayan isteği şu hatayla reddediyor:
                 --   {"code":"UNAUTHORIZED_NO_AUTH_HEADER"}
                 -- Aşağıdaki anahtar HERKESE AÇIK olan publishable anahtardır;
                 -- sitenin paketinde de görünür, gizli değildir. Geçidi geçmek
                 -- için yeterlidir; asıl koruma aşağıdaki x-bildirim-anahtari.
                 'Authorization',       'Bearer sb_publishable_21i-tIipjtLEvDhO8iu9JA_rgedvY6p',
                 'apikey',              'sb_publishable_21i-tIipjtLEvDhO8iu9JA_rgedvY6p',
                 'x-bildirim-anahtari', coalesce(gizli, '')
               ),
    body    := jsonb_build_object(
                 'type',   'INSERT',
                 'table',  'contact_messages',
                 'schema', 'public',
                 'record', jsonb_build_object(
                             'id',         new.id,
                             'name',       new.name,
                             'email',      new.email,
                             'message',    new.message,
                             'created_at', new.created_at
                           )
               ),
    timeout_milliseconds := 5000
  ) into istek_id;

  raise notice '>> bildirim istegi gonderildi, pg_net istek id: %', istek_id;
  return new;
end $$;


-- ---------------------------------------------------------------------------
-- 5) Tetikleyici — YALNIZCA INSERT
--    (UPDATE/DELETE de bağlanırsa okundu işaretleme her seferinde e-posta
--     gönderirdi; o yüzden sadece insert.)
-- ---------------------------------------------------------------------------
drop trigger if exists iletisim_bildirim_tetikleyici on public.contact_messages;

create trigger iletisim_bildirim_tetikleyici
  after insert on public.contact_messages
  for each row execute function public.iletisim_bildirim_tetikle();


-- ---------------------------------------------------------------------------
-- 6) DOĞRULAMA
-- ---------------------------------------------------------------------------
select proname, n.nspname as sema
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'http_post';
-- Beklenen: sema = net  (bu satır görünmezse Adım 4 çalışmaz — bana bildirin)

select tgname, tgenabled
from pg_trigger
where tgrelid = 'public.contact_messages'::regclass and not tgisinternal;
-- Beklenen: iletisim_bildirim_tetikleyici

select anahtar from public.ayarlar;
-- Beklenen: bildirim_anahtari  (değer gizli kalsın diye sadece adı listeleniyor)


-- ---------------------------------------------------------------------------
-- 7) TEST — tabloya elle bir satır ekleyip sonucu görün
-- ---------------------------------------------------------------------------
-- insert into public.contact_messages (name, email, message)
-- values ('TETIKLEYICI TESTI', 'test@selahattinbabadag.com', 'pg_net yolu denemesi');
--
-- Ardından sonucu okuyun (pg_net yanıtı birkaç saniye sonra düşer):
--
-- select id, status_code, left(content, 300) as yanit, error_msg, created
-- from net._http_response
-- order by created desc
-- limit 5;
--
-- Beklenen: status_code = 200
--   401 → x-bildirim-anahtari ile Edge Function'daki BILDIRIM_ANAHTARI
--         birbirini tutmuyor
--   500 → Edge Function'da RESEND_API_KEY tanımlı değil
--   502 → Resend reddetti; content alanındaki mesaj nedeni söyler
-- ---------------------------------------------------------------------------

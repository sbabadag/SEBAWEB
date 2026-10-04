// Yerel testler: Resend'e giden istek taklit edilir, gerçek e-posta gönderilmez.
import {
  epostaOlustur,
  handleRequest,
  mesajiCikar,
  type Mesaj,
} from './index.ts';

let gecti = 0;
let kaldi = 0;

function esit(gercek: unknown, beklenen: unknown, ad: string) {
  if (JSON.stringify(gercek) === JSON.stringify(beklenen)) {
    gecti++;
    console.log(`  ✅ ${ad}`);
  } else {
    kaldi++;
    console.log(`  ❌ ${ad}\n       beklenen: ${JSON.stringify(beklenen)}\n       gelen   : ${JSON.stringify(gercek)}`);
  }
}

function dogru(kosul: boolean, ad: string) {
  if (kosul) {
    gecti++;
    console.log(`  ✅ ${ad}`);
  } else {
    kaldi++;
    console.log(`  ❌ ${ad}`);
  }
}

// ---------------------------------------------------------------- 1) payload
console.log('\n1) Webhook gövdesini çözme');
const webhookGovdesi = {
  type: 'INSERT',
  table: 'contact_messages',
  schema: 'public',
  record: {
    id: 7,
    name: 'Ayşe Yılmaz',
    email: 'ayse@ornek.com',
    message: 'Teklif almak istiyorum.\nFabrika projesi, 1000 m2.',
    created_at: '2026-10-03T21:15:00.000Z',
  },
  old_record: null,
};

const m = mesajiCikar(webhookGovdesi);
esit(m?.name, 'Ayşe Yılmaz', 'webhook gövdesinden record çıkarıldı');
esit(m?.id, 7, 'id korundu');
esit(mesajiCikar({ name: 'a', message: 'b' })?.name, 'a', 'düz nesne de kabul edildi');
esit(mesajiCikar(null), null, 'null -> null');
esit(mesajiCikar([1, 2]), null, 'dizi -> null');
esit(mesajiCikar('metin'), null, 'metin -> null');

// ---------------------------------------------------------------- 2) e-posta
console.log('\n2) E-posta içeriği');
const e = epostaOlustur(m as Mesaj);
dogru(e.konu.includes('Ayşe Yılmaz'), 'konuda gönderenin adı var');
dogru(e.metin.includes('Teklif almak istiyorum'), 'düz metinde mesaj var');
dogru(e.metin.includes('ayse@ornek.com'), 'düz metinde e-posta var');
dogru(e.html.includes('ayse@ornek.com'), 'HTML içinde e-posta var');
dogru(e.html.includes('Fabrika projesi'), 'HTML içinde mesaj var');
dogru(e.html.includes('admin/dashboard'), 'HTML içinde panel bağlantısı var');
dogru(!e.html.includes('undefined'), 'HTML içinde "undefined" sızıntısı yok');

const tarihsiz = epostaOlustur({ name: 'X', email: 'x@y.com', message: 'z' });
dogru(!tarihsiz.metin.includes('undefined'), 'tarih yoksa da bozulmuyor');

// XSS kaçışı
const kotu = epostaOlustur({
  name: '<script>alert(1)</script>',
  email: 'x@y.com',
  message: '<img src=x onerror=alert(1)>',
});
dogru(!kotu.html.includes('<script>'), 'script etiketi kaçırıldı');
dogru(!kotu.html.includes('<img'), 'img etiketi kaçırıldı');
dogru(kotu.html.includes('&lt;script&gt;'), 'kaçış doğru biçimde (&lt;script&gt;)');

// ------------------------------------------------------- 3) handleRequest
console.log('\n3) HTTP davranışı (Resend taklit edilerek)');

const orijinalFetch = globalThis.fetch;
let sonIstek: { url: string; govde: any } | null = null;
let taklitDurum = 200;
let taklitGovde = '{"id":"abc-123"}';
let dbAnahtari: string | null = null; // public.ayarlar taklidi

globalThis.fetch = ((girdi: string | URL | Request, secenek?: RequestInit) => {
  const url = String(girdi);
  // public.ayarlar okuması taklit edilir (fonksiyon sırrı buradan da okuyor)
  if (url.includes('/rest/v1/ayarlar')) {
    return Promise.resolve(
      new Response(
        dbAnahtari === null ? '[]' : JSON.stringify([{ deger: dbAnahtari }]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
  }
  sonIstek = { url, govde: JSON.parse(String(secenek?.body ?? '{}')) };
  return Promise.resolve(
    new Response(taklitGovde, { status: taklitDurum, headers: { 'Content-Type': 'application/json' } }),
  );
}) as typeof fetch;

Deno.env.set('RESEND_API_KEY', 're_test_anahtar');
Deno.env.set('BILDIRIM_ALICI', 'info@selahattinbabadag.com');
Deno.env.set('SUPABASE_URL', 'https://ornek.supabase.co');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'sahte-servis-anahtari');

function postla(govde: unknown, ekBasliklar: Record<string, string> = {}) {
  return handleRequest(
    new Request('https://ornek.test/iletisim-bildirim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...ekBasliklar },
      body: typeof govde === 'string' ? govde : JSON.stringify(govde),
    }),
  );
}

// yöntem / CORS
esit((await handleRequest(new Request('https://x.test', { method: 'OPTIONS' }))).status, 204, 'OPTIONS -> 204');
esit((await handleRequest(new Request('https://x.test', { method: 'GET' }))).status, 405, 'GET -> 405');

// bozuk girdiler
esit((await postla('bu json degil')).status, 400, 'bozuk JSON -> 400');
esit((await postla({ type: 'INSERT', record: { name: 'x' } })).status, 400, 'mesajsız gövde -> 400');
esit((await postla({ record: { message: '   ' } })).status, 400, 'yalnızca boşluk mesaj -> 400');

// anahtar yoksa
Deno.env.delete('RESEND_API_KEY');
esit((await postla(webhookGovdesi)).status, 500, 'RESEND_API_KEY yoksa -> 500');
Deno.env.set('RESEND_API_KEY', 're_test_anahtar');

// mutlu yol
const iyi = await postla(webhookGovdesi);
esit(iyi.status, 200, 'geçerli mesaj -> 200');
esit((await iyi.json()).basarili, true, 'yanıt basarili:true');

console.log('\n   Resend\'e giden istek:');
esit(sonIstek?.url, 'https://api.resend.com/emails', '   doğru uç nokta');
esit(sonIstek?.govde.from.includes('onboarding@resend.dev'), true, '   gönderen varsayılanı kullanıldı');
esit(sonIstek?.govde.to, ['info@selahattinbabadag.com'], '   alıcı doğru');
esit(sonIstek?.govde.reply_to, 'ayse@ornek.com', '   reply_to mesaj sahibi');
dogru(String(sonIstek?.govde.subject).includes('Ayşe Yılmaz'), '   konu doğru');
dogru(String(sonIstek?.govde.html).includes('Fabrika projesi'), '   HTML gövde dolu');
dogru(String(sonIstek?.govde.text).includes('Fabrika projesi'), '   düz metin dolu');

// paylaşılan anahtar kontrolü
console.log('\n4) Paylaşılan anahtar (ortam değişkeni VEYA veritabanı)');
Deno.env.set('BILDIRIM_ANAHTARI', 'env-degeri');
dbAnahtari = null;
esit((await postla(webhookGovdesi)).status, 401, 'başlık yoksa -> 401');
esit((await postla(webhookGovdesi, { 'x-bildirim-anahtari': 'yanlis' })).status, 401, 'yanlış değer -> 401');
esit(
  (await postla(webhookGovdesi, { 'x-bildirim-anahtari': 'env-degeri' })).status,
  200,
  'ortam değişkeniyle eşleşti -> 200',
);

// ASIL SENARYO: ortam değişkeni farklı, veritabanı doğru
dbAnahtari = 'db-degeri';
Deno.env.set('BILDIRIM_ANAHTARI', 'env-baska-deger');
esit(
  (await postla(webhookGovdesi, { 'x-bildirim-anahtari': 'db-degeri' })).status,
  200,
  'DB doğru + env farklı -> 200  (asıl çözüm)',
);
esit(
  (await postla(webhookGovdesi, { 'x-bildirim-anahtari': 'env-baska-deger' })).status,
  200,
  'env doğru + DB farklı -> 200',
);
esit(
  (await postla(webhookGovdesi, { 'x-bildirim-anahtari': 'hicbiri' })).status,
  401,
  'ikisi de değil -> 401',
);

// hiç aday yoksa kontrol atlanır
Deno.env.delete('BILDIRIM_ANAHTARI');
dbAnahtari = null;
esit((await postla(webhookGovdesi)).status, 200, 'hiç sır tanımlı değilse kontrol atlanır -> 200');

// Resend hata verirse
taklitDurum = 500;
taklitGovde = '{"message":"internal error"}';
esit((await postla(webhookGovdesi)).status, 502, 'Resend 500 -> bizden 502');
taklitDurum = 401;
taklitGovde = '{"message":"API key is invalid"}';
esit((await postla(webhookGovdesi)).status, 502, 'Resend 401 -> bizden 502');
taklitDurum = 200;
taklitGovde = '{"id":"abc-123"}';

// ağ hatası
globalThis.fetch = (() => Promise.reject(new Error('ağ yok'))) as typeof fetch;
esit((await postla(webhookGovdesi)).status, 502, 'ağ hatası -> 502');

globalThis.fetch = orijinalFetch;

// ---------------------------------------------------------------- özet
console.log(`\n${'='.repeat(46)}`);
console.log(kaldi === 0 ? `TÜM TESTLER GEÇTİ ✅  (${gecti} test)` : `${kaldi} TEST BAŞARISIZ ⚠️  (${gecti} geçti)`);
console.log('='.repeat(46));

if (kaldi > 0) Deno.exit(1);

// ============================================================================
// SEBAWEB — İletişim formu yeni mesaj bildirimi (Supabase Edge Function)
// ============================================================================
// Ne yapar: contact_messages tablosuna yeni bir satır eklendiğinde
//           size e-posta gönderir (Resend üzerinden).
//
// Neden böyle: mesaj ÖNCE veritabanına yazılır, bildirim sonra denenir.
//              E-posta servisi çökse bile mesaj kaybolmaz; panelde durur.
//
// Nasıl tetiklenir: Supabase Database Webhook (contact_messages / INSERT)
//
// Gerekli ortam değişkenleri (Dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY    (zorunlu)  Resend API anahtarı
//   BILDIRIM_ALICI    (isteğe bağlı) varsayılan: info@selahattinbabadag.com
//   BILDIRIM_GONDEREN (isteğe bağlı) varsayılan: SEBAWEB <onboarding@resend.dev>
//   BILDIRIM_ANAHTARI (önerilir)  tanımlıysa istek bu değeri x-bildirim-anahtari
//                                 başlığında taşımak zorundadır (dışarıdan
//                                 tetiklenmeyi engeller)
//
// Deploy: Dashboard > Edge Functions > Deploy a new function > "Via Editor"
//         fonksiyon adı: iletisim-bildirim  ->  bu dosyanın içeriğini yapıştır
// ============================================================================

const VARSAYILAN_ALICI = 'info@selahattinbabadag.com';
const VARSAYILAN_GONDEREN = 'SEBAWEB <onboarding@resend.dev>';
const RESEND_URL = 'https://api.resend.com/emails';

export interface Mesaj {
  id?: number | string;
  name?: string;
  email?: string;
  message?: string;
  created_at?: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function yanit(govde: unknown, durum = 200): Response {
  return new Response(JSON.stringify(govde), {
    status: durum,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function kacir(deger: unknown): string {
  return String(deger ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Supabase Database Webhook gövdesi şu biçimdedir:
 *   { type: "INSERT", table: "contact_messages", schema: "public", record: {...}, old_record: null }
 * Düz bir nesne de gönderilebilir diye ikisini de kabul ediyoruz.
 */
export function mesajiCikar(govde: unknown): Mesaj | null {
  if (!govde || typeof govde !== 'object' || Array.isArray(govde)) return null;
  const g = govde as Record<string, unknown>;
  const kayit = (g.record ?? g) as unknown;
  if (!kayit || typeof kayit !== 'object' || Array.isArray(kayit)) return null;
  return kayit as Mesaj;
}

export function tarihYaz(deger?: string): string {
  const t = deger ? new Date(deger) : new Date();
  const gecerli = !isNaN(t.getTime()) ? t : new Date();
  return gecerli.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
}

export function epostaOlustur(m: Mesaj) {
  const ad = (m.name ?? '').trim() || '(isim yok)';
  const eposta = (m.email ?? '').trim() || '(e-posta yok)';
  const mesaj = (m.message ?? '').trim();
  const tarih = tarihYaz(m.created_at);

  const konu = `SEBAWEB - Yeni mesaj: ${ad}`;

  const metin = [
    'Sitenin iletisim formundan yeni bir mesaj geldi.',
    '',
    `Ad      : ${ad}`,
    `E-posta : ${eposta}`,
    `Tarih   : ${tarih}`,
    '',
    'Mesaj:',
    mesaj,
    '',
    '---',
    'Yanitlamak icin dogrudan yukaridaki adrese yazabilirsiniz.',
    'Tum mesajlar: https://selahattinbabadag.com/admin/dashboard',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#000;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
      <div style="font-size:18px;font-weight:bold;">SEBAWEB</div>
      <div style="font-size:13px;color:#d4d4d8;margin-top:4px;">Sitenin iletisim formundan yeni mesaj</div>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e4e4e7;border-top:0;border-radius:0 0 12px 12px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#71717a;width:90px;">Ad</td>
            <td style="padding:6px 0;font-weight:bold;color:#18181b;">${kacir(ad)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">E-posta</td>
            <td style="padding:6px 0;"><a href="mailto:${kacir(eposta)}" style="color:#18181b;">${kacir(eposta)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Tarih</td>
            <td style="padding:6px 0;color:#18181b;">${kacir(tarih)}</td></tr>
      </table>
      <hr style="border:0;border-top:1px solid #e4e4e7;margin:20px 0;">
      <div style="font-size:12px;color:#71717a;margin-bottom:8px;">MESAJ</div>
      <div style="font-size:15px;line-height:1.6;color:#18181b;white-space:pre-wrap;">${kacir(mesaj)}</div>
      <div style="margin-top:24px;">
        <a href="mailto:${kacir(eposta)}?subject=${encodeURIComponent('SEBA - Mesajınıza yanıt')}"
           style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;">Yanıtla</a>
        <a href="https://selahattinbabadag.com/admin/dashboard"
           style="display:inline-block;margin-left:8px;color:#18181b;text-decoration:underline;font-size:14px;">Panelde aç</a>
      </div>
    </div>
    <div style="text-align:center;font-size:12px;color:#a1a1aa;margin-top:16px;">
      Mesaj oncelikle veritabaniniza kaydedildi; bu e-posta yalnizca bildirimdir.
    </div>
  </div>
</body></html>`;

  return { konu, metin, html };
}

/**
 * Paylaşılan anahtarı veritabanındaki public.ayarlar tablosundan okur.
 * Amaç: sırrın iki ayrı yere elle yazılmasından doğan eşleşmeme sorununu
 * ortadan kaldırmak. Ortam değişkeni (BILDIRIM_ANAHTARI) veya bu tablodaki
 * değerden HANGİSİ doğruysa istek kabul edilir.
 * Servis anahtarı Supabase tarafından otomatik enjekte edilir; RLS'i baypas
 * ettiği için korumalı ayarlar tablosunu okuyabilir.
 */
async function ayarlardanOku(): Promise<string | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const anahtar = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anahtar) return null;
  try {
    const yanit = await fetch(
      `${url}/rest/v1/ayarlar?anahtar=eq.bildirim_anahtari&select=deger`,
      {
        headers: { apikey: anahtar, Authorization: `Bearer ${anahtar}` },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!yanit.ok) return null;
    const satirlar = await yanit.json();
    const deger = satirlar?.[0]?.deger;
    return typeof deger === 'string' && deger.trim() ? deger.trim() : null;
  } catch (e) {
    console.warn('ayarlar okunamadi:', e);
    return null;
  }
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return yanit({ hata: 'Yalnizca POST kabul edilir' }, 405);

  // Yetki: istek, paylaşılan anahtarı x-bildirim-anahtari başlığında taşımalı.
  // Kabul edilen değerler: ortam değişkeni (BILDIRIM_ANAHTARI) VE/VEYA
  // public.ayarlar tablosundaki değer. İkisinden biri eşleşirse yeterlidir;
  // böylece sır tek bir yere doğru yazılmış olsa da çalışır.
  const gelen = req.headers.get('x-bildirim-anahtari')?.trim() ?? '';
  const adaylar = [
    Deno.env.get('BILDIRIM_ANAHTARI')?.trim(),
    await ayarlardanOku(),
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);

  if (adaylar.length > 0 && !adaylar.includes(gelen)) {
    console.warn('Bildirim anahtari eslesmedi');
    return yanit({ hata: 'Yetkisiz' }, 401);
  }
  if (adaylar.length === 0) {
    console.warn('UYARI: paylasilan anahtar tanimli degil, istek dogrulanmadan isleniyor');
  }

  let govde: unknown;
  try {
    govde = await req.json();
  } catch {
    return yanit({ hata: 'Gecersiz JSON govdesi' }, 400);
  }

  const mesaj = mesajiCikar(govde);
  if (!mesaj || !(mesaj.message ?? '').trim()) {
    return yanit({ hata: 'Mesaj icerigi bulunamadi' }, 400);
  }

  const anahtar = Deno.env.get('RESEND_API_KEY');
  if (!anahtar) {
    console.error('RESEND_API_KEY tanimli degil');
    return yanit({ hata: 'RESEND_API_KEY tanimli degil' }, 500);
  }

  const alici = Deno.env.get('BILDIRIM_ALICI')?.trim() || VARSAYILAN_ALICI;
  const gonderen = Deno.env.get('BILDIRIM_GONDEREN')?.trim() || VARSAYILAN_GONDEREN;

  const { konu, metin, html } = epostaOlustur(mesaj);

  const govdeJson: Record<string, unknown> = {
    from: gonderen,
    to: [alici],
    subject: konu,
    html,
    text: metin,
  };
  // Yanıtla'ya basınca doğrudan mesaj sahibine gitsin
  if ((mesaj.email ?? '').trim()) govdeJson.reply_to = mesaj.email!.trim();

  let resendYanit: Response;
  try {
    resendYanit = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anahtar}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(govdeJson),
    });
  } catch (e) {
    console.error('Resend istegi basarisiz:', e);
    return yanit({ hata: 'Resend servisine ulasilamadi' }, 502);
  }

  const sonuc = await resendYanit.text();
  if (!resendYanit.ok) {
    console.error('Resend hatasi:', resendYanit.status, sonuc);
    return yanit({ hata: 'E-posta gonderilemedi', durum: resendYanit.status, ayrinti: sonuc }, 502);
  }

  console.log('Bildirim gonderildi:', sonuc);
  return yanit({ basarili: true, alici }, 200);
}

// Yerel testte sunucu baslamasin diye (deno test / import icin)
if (import.meta.main) {
  Deno.serve(handleRequest);
}

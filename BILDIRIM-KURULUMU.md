# Yeni Mesaj Bildirimi — Kurulum

Form mesajı **önce veritabanına** yazılır, sonra size e-posta gider.
E-posta servisi çökse bile mesaj kaybolmaz; yönetim panelinde durur.

```
Ziyaretçi → contact_messages tablosu → (Database Webhook) → Edge Function → Resend → info@selahattinbabadag.com
```

Kod: `supabase/functions/iletisim-bildirim/index.ts` — **bu repodaki kendi kodumuz.**

> ⚠️ Bu dosyada hiçbir sır yoktur ve **olmamalıdır** — depo herkese açık olabilir.
> Sırlar yalnızca Supabase panelindeki gizli değerler alanına girilir.

---

## Adım 1 — Resend hesabı ve API anahtarı

1. **https://resend.com** → ücretsiz kayıt
   **Hesabı `info@selahattinbabadag.com` ile açın.** Neden: alan adı doğrulanmadan
   Resend yalnızca `onboarding@resend.dev` adresinden gönderime izin verir ve o da
   **yalnızca hesap sahibinin kendi adresine** gönderir. Alıcımız bu adres olduğu
   için doğrulama gerekmez.
2. **https://resend.com/api-keys** → **Create API Key**
   - Name: `sebaweb iletisim`
   - Permission: **Sending access**
   - Oluşan `re_...` anahtarını kopyalayın (bir daha gösterilmez)

> **İleride daha profesyonel gönderen adresi isterseniz:** Resend'de
> `selahattinbabadag.com` alan adını doğrulayıp (DNS'e SPF + DKIM kaydı eklenir)
> göndereni `SEBAWEB <noreply@selahattinbabadag.com>` yapabilirsiniz — kodda
> değişiklik gerekmez, sadece `BILDIRIM_GONDEREN` gizli değerini değiştirirsiniz.

---

## Adım 2 — Edge Function'ı yükleyin

1. Supabase Dashboard → **Edge Functions** → **Deploy a new function**
2. **Via Editor** seçin (CLI gerekmez)
3. Fonksiyon adı: **`iletisim-bildirim`** (adı tam böyle olmalı)
4. `supabase/functions/iletisim-bildirim/index.ts` dosyasının **tamamını** yapıştırın
5. **Deploy**

> **JWT doğrulaması açık kalsın.** (Aşağıdaki webhook bir jeton gönderecek.)

---

## Adım 3 — Gizli değerler

Supabase Dashboard → **Project Settings → Edge Functions → Secrets**
(ya da fonksiyonun kendi sayfasındaki **Secrets** bölümü) → **Add new secret**

| Ad | Değer | Zorunlu |
|---|---|---|
| `RESEND_API_KEY` | Adım 1'deki `re_...` anahtarı | ✅ zorunlu |
| `BILDIRIM_ANAHTARI` | **Kendiniz uydurun:** 30+ karakterlik rastgele bir metin | önerilir |
| `BILDIRIM_ALICI` | `info@selahattinbabadag.com` | isteğe bağlı (varsayılan bu) |
| `BILDIRIM_GONDEREN` | `SEBAWEB <onboarding@resend.dev>` | isteğe bağlı (varsayılan bu) |

**`BILDIRIM_ANAHTARI` ne işe yarar:** fonksiyonun adresi proje referansından
tahmin edilebilir ve sitenin anahtarı herkese açıktır. Bu değer tanımlıysa
fonksiyon, isteğin bu anahtarı taşımasını şart koşar — dışarıdan biri çağırıp
adresinize e-posta yağdıramaz. **Adım 4'te aynı değeri webhook'a da yazacaksınız.**

---

## Adım 4 — Database Webhook

Supabase Dashboard → **Database → Webhooks → Create a new hook**

| Alan | Değer |
|---|---|
| Name | `iletisim-bildirim` |
| Table | `contact_messages` |
| Events | ☑️ **Insert** (yalnızca bu) |
| Type | **HTTP Request** |
| Method | **POST** |
| URL | `https://djxgtphcvjshkeccnrvj.supabase.co/functions/v1/iletisim-bildirim` |

**HTTP Headers** bölümüne iki satır ekleyin:

| Header | Değer |
|---|---|
| `Authorization` | `Bearer <SERVICE_ROLE_KEY>` |
| `x-bildirim-anahtari` | Adım 3'te uydurduğunuz **aynı** metin |

> `SERVICE_ROLE_KEY`: Project Settings → **API** → `service_role` anahtarı.
> JWT doğrulamasını geçmek için gerekir. **Bu anahtarı sohbete yazmayın;**
> yalnızca paneldeki bu alana girin.

**Create webhook** ile kaydedin.

---

## Adım 5 — Test

1. Siteden iletişim formunu doldurup gönderin
2. `info@selahattinbabadag.com` kutusuna bakın — konu: **`SEBAWEB - Yeni mesaj: <ad>`**
3. Mesaj ayrıca panelde **İletişim Mesajları** bölümünde görünür

Kontrol araçları:
- **Resend → Logs:** gönderim denemeleri ve hata nedenleri
- **Edge Functions → iletisim-bildirim → Logs:** fonksiyonun çıktısı
- **Database → Webhooks → hook → Logs:** webhook çağrıldı mı

---

## Sorun giderme

| Belirti | Sebep / çözüm |
|---|---|
| Panelde mesaj var, e-posta yok | Webhook veya fonksiyon çalışmadı. Panelde mesajın olması doğru davranış — mesaj kaydedilmiş. Webhook loglarına bakın. |
| Fonksiyon logu: `Yetkisiz` | `x-bildirim-anahtari` başlığı eksik/yanlış. Adım 4'teki değer, Adım 3'tekiyle birebir aynı olmalı. |
| Fonksiyon logu: `RESEND_API_KEY tanimli degil` | Adım 3'teki gizli değer eklenmemiş veya deploy'dan sonra eklenmiş (secrets eklendikten sonra fonksiyon otomatik yeniden başlar). |
| Resend hatası: `domain is not verified` | Gönderen `onboarding@resend.dev` değil ya da alıcı Resend hesabının kendi adresi değil. Adım 1'deki nota bakın. |
| Resend hatası: `API key is invalid` | Anahtar yanlış kopyalanmış ya da `Sending access` yerine başka yetkiyle üretilmiş. |
| Her şey çalışıyor ama e-posta spam'de | Gönderen `onboarding@resend.dev` olduğu için normal. Adım 1'deki alan adı doğrulaması bunu çözer. |

---

## Maliyet ve sınırlar

- **Resend ücretsiz katman:** ayda 3.000 e-posta, günde 100 — bu site için fazlasıyla yeterli
- **Supabase Edge Functions ücretsiz katman:** ayda 500.000 çağrı
- Yani bu kurulum **ücretsiz** çalışır.

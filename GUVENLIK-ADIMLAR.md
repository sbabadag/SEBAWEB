# SEBAWEB Güvenlik Düzeltmesi — Durum ve Kurulum

**Son güncelleme:** 03.10.2026
**Site:** https://selahattinbabadag.com
**Depo:** https://github.com/sbabadag/SEBAWEB

---

## Neydi sorun?

| # | Sorun | Kanıt | Durum |
|---|---|---|---|
| 1 | Yönetici şifresi **ön yüz kodunda sabit yazılıydı** ve derlenmiş pakete giriyordu | Canlı JS paketinde şifre birebir eşleşmeyle bulundu | ✅ KAPATILDI |
| 2 | Giriş ekranı şifreyi **ekranda yazıyordu** ("Varsayılan şifre: …") | `tr.json` / `en.json` → `defaultPassword` | ✅ KAPATILDI |
| 3 | Giriş kontrolü yalnızca tarayıcıdaki bir bayrağa bakıyordu | `localStorage.getItem('adminAuthenticated')` | ✅ KAPATILDI |
| 4 | Supabase tablolarına **herkese açık anahtarla yazılabiliyordu** | `projects` / `news` INSERT denemesi yetkilendirmeyi geçiyordu | ✅ KAPATILDI |

1–3 birlikte şu anlama geliyordu: **şifreyi hiç bilmeyen biri**, tarayıcı konsoluna
tek satır yazıp panele girebiliyor, oradan da sitenin içeriğini silebiliyordu.

---

## Yapılan değişiklikler

| Dosya | Değişiklik |
|---|---|
| `src/pages/AdminLogin.jsx` | Sabit şifre kaldırıldı → **Supabase Auth** ile e-posta + şifre girişi. Ekrandaki şifre yazısı kaldırıldı. |
| `src/pages/AdminDashboard.jsx` | `localStorage` bayrağı yerine **gerçek Supabase oturumu** kontrolü; oturum kapanınca otomatik çıkış; çıkış `signOut()` ile. |
| `src/translations/tr.json`, `en.json` | `defaultPassword` silindi; `email`, `enterEmail`, `loggingIn` eklendi. |
| `supabase/guvenlik-rls.sql` | RLS politikaları. **v2**: tablolardaki *tüm* politikaları kaldırıp doğru seti kurar. |
| `index.html` | **SPA yönlendirme betiği** eklendi — alt sayfalar artık doğrudan açılabiliyor. |

**İlgili commit'ler:** `1040ce9` (kod düzeltmesi), `8bf1775` (RLS v2)

---

## Doğrulanmış durum

Canlı API üzerinden test edildi (veriye dokunmayan yöntemle):

| Test | Sonuç |
|---|---|
| `projects`'e anon yazma | HTTP **401 / `42501`** — RLS engelliyor ✅ |
| `news`'e anon yazma | HTTP **401 / `42501`** — RLS engelliyor ✅ |
| Herkese açık okuma | HTTP 200 ✅ (vitrin çalışıyor) |
| Canlı JS paketinde şifre | Bulunamadı ✅ |
| Kayıt sayısı | projects 10 · news 2 — değişmedi ✅ |

> **Not:** INSERT doğrudan kanıtlandı. UPDATE ve DELETE veriye zarar vermeden
> ayırt edilemediği için doğrudan test edilmedi; aynı betikle oluşturulan
> politikalarla korunuyorlar ve RLS'in anon rolü için zorlandığı kanıtlı.

---

## ⏳ SİZİN YAPMANIZ GEREKEN — kalan tek adım

### Yönetici kullanıcısını oluşturun (panel girişi için)

https://supabase.com/dashboard/project/djxgtphcvjshkeccnrvj/auth/users

- **Add user** → **Create new user**
- **Email:** yönetici e-postanız
- **Password:** yeni yönetici şifreniz
- ☑️ **Auto Confirm User** — işaretlenmezse giriş yapamazsınız
- **Create user**

Ardından: **Authentication → Sign In / Providers → Email** → *"Confirm email"* **kapalı** olmalı.

> ⚠️ **Şifreyi sohbete, e-postaya veya repoya yazmayın.** Supabase şifreyi
> kendi tarafında hash'ler; başka hiçbir yere girmeniz gerekmez.

### Panele nasıl girilir

- **Adres:** https://selahattinbabadag.com/admin/login
  (SPA düzeltmesinden sonra doğrudan açılır; yer imine ekleyebilirsiniz)
- Alternatif: sitenin altbilgisindeki **"Yönetici"** linki

---

## Deploy

```bash
cd ~/sebaweb
npm run build
git push origin main     # GitHub Actions otomatik yayınlar
```

Workflow'da `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` tanımlı;
ek ayar gerekmiyor. Push, deploy anahtarıyla (`~/.ssh/sebaweb_deploy`) yapılabilir.

---

## Eski şifre hakkında

Eski şifre **yıllardır herkese açıktı**. Git geçmişinde, CDN önbelleklerinde ve
arşiv sitelerinde kalır — silinmesi mümkün değil.

- Eski şifreyi başka hiçbir yerde kullanmayın
- Yeni şifre de benzersiz olsun
- Mümkünse **2FA**'yı Supabase Auth ayarlarından açın

---

## Notlar

- **Anon anahtarı açıkta kalabilir.** Supabase'de herkese açık olmak üzere
  tasarlanmıştır; koruma RLS ile sağlanır. Asıl düzeltme bu yüzden kodda değil,
  veritabanı politikalarındadır.
- **Okuma tamamen açıktır** (vitrin için gerekli). Proje verileri — base64
  gömülü fotoğraflar dahil — internete açık okunabilir durumda.
- **İçerik verisi büyük:** `projects.images` fotoğrafları base64 olarak tutuyor
  (tek sorgu ~3 MB). Fotoğrafları Supabase Storage'a taşımak ilerideki
  iyileştirmedir.

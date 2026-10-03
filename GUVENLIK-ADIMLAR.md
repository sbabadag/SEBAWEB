# SEBAWEB Güvenlik Düzeltmesi — Kurulum Adımları

**Tarih:** 03.10.2026
**Kapsam:** Yönetici paneli kimlik doğrulaması + Supabase yazma koruması

---

## Neydi sorun?

| # | Sorun | Kanıt |
|---|---|---|
| 1 | Yönetici şifresi **ön yüz kodunda sabit yazılıydı** ve derlenmiş pakete giriyordu | Canlı JS paketinde şifre birebir eşleşmeyle bulundu |
| 2 | Giriş ekranı şifreyi **ekranda yazıyordu** ("Varsayılan şifre: …") | `tr.json` / `en.json` → `defaultPassword` |
| 3 | Giriş kontrolü yalnızca tarayıcıdaki bir bayrağa bakıyordu | `localStorage.getItem('adminAuthenticated')` |
| 4 | Supabase tablolarına **herkese açık anahtarla yazılabiliyordu** | `projects` ve `news` INSERT denemesi yetkilendirmeyi geçti |

3 ve 4 birlikte şu anlama geliyordu: **şifreyi hiç bilmeyen biri**, konsola tek satır yazıp panele girebiliyor, oradan da sitenin içeriğini silebiliyordu.

---

## Bu pakette değişen dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/pages/AdminLogin.jsx` | Sabit şifre kaldırıldı → **Supabase Auth** ile e-posta + şifre girişi. Ekrandaki şifre yazısı kaldırıldı. |
| `src/pages/AdminDashboard.jsx` | `localStorage` bayrağı yerine **gerçek Supabase oturumu** kontrolü; oturum kapanınca otomatik çıkış. Çıkış `signOut()` yapıyor. |
| `src/translations/tr.json`, `en.json` | `defaultPassword` silindi; `email`, `enterEmail`, `loggingIn` eklendi. |
| `supabase/guvenlik-rls.sql` | **YENİ** — RLS politikaları (asıl güvenlik düzeltmesi). |

---

## SİZİN YAPMANIZ GEREKEN ADIMLAR

### Adım 1 — Yönetici kullanıcısını oluşturun

Supabase Dashboard → **Authentication → Users → Add user → Create new user**

- **Email:** kendi yönetici e-postanız (örn. adınız@sebakonsultancy.com)
- **Password:** yeni yönetici şifreniz
- **Auto Confirm User** seçeneğini işaretleyin (yoksa giriş yapamazsınız)
- **Enable Email Confirmations** seçeneğini kapatın

> ⚠️ **Şifreyi bu sohbete, e-postaya veya repoya yazmayın.** Supabase şifreyi
> kendi tarafında hash'leyerek saklar; onu bir daha hiçbir yere girmeniz
> gerekmez. Panelden giriş yaparken kullanacaksınız.

### Adım 2 — RLS politikalarını çalıştırın

Supabase Dashboard → **SQL Editor → New query** → `supabase/guvenlik-rls.sql`
dosyasının tamamını yapıştırın → **RUN**

Bu adım atlanırsa **yazma tamamen kapanır** ve admin panelinden proje
ekleyemezsiniz. Dosyanın sonundaki doğrulama sorgularıyla kontrol edin.

### Adım 3 — Deploy edin

```bash
cd ~/sebaweb            # projenin bulunduğu klasör
npm run build           # derleme hatasız geçmeli
git push origin main    # GitHub Actions otomatik yayınlar
```

GitHub Actions workflow'unda `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY`
zaten tanımlı; ek bir şey gerekmiyor.

### Adım 4 — Eski şifreyi "yanmış" sayın

Eski şifre **yıllardır herkese açık** durumda. Git geçmişinde, CDN
önbelleklerinde ve arşiv sitelerinde kalır — silinmesi mümkün değil.

- Eski şifreyi başka hiçbir yerde kullanmadığınızdan emin olun
- Yeni şifreyi de başka bir yerde kullanmayın (farklı, benzersiz olsun)
- Mümkünse **iki adımlı doğrulamayı (2FA)** Supabase Auth ayarlarından açın

---

## Notlar

- **Anon anahtarı açıkta kalabilir.** Supabase'de bu anahtar herkese açık
  olmak üzere tasarlanmıştır; koruma RLS ile sağlanır. Asıl düzeltme bu yüzden
  kodda değil, veritabanı politikalarındadır.
- **İçerik verisi büyük.** `projects.images` alanı fotoğrafları base64 olarak
  tutuyor (tek sorgu ~3 MB döndü). Panel bir süre yavaşlarsa sebebi budur;
  fotoğrafları Supabase Storage'a taşımak ilerideki bir iyileştirmedir.
- **Repoda başka bekleyen değişiklikler var** (Header, Footer, Software,
  Home, VisitorCounter vb.). Bu güvenlik commit'i yalnızca yukarıdaki
  tabloda listelenen dosyaları içerir; diğer çalışmalar ayrı commit edilmeli.

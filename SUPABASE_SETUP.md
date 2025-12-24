# Supabase Kurulum Rehberi

Bu rehber, SEBA Engineering web sitesi için Supabase veritabanı kurulumunu açıklar.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. Yeni bir proje oluşturun:
   - **Name**: SEBA Engineering (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre seçin (kaydedin!)
   - **Region**: Size en yakın bölgeyi seçin
   - **Pricing Plan**: Free tier yeterli

## 2. Database Tablosu Oluşturma

Supabase Dashboard'da **SQL Editor**'a gidin ve aşağıdaki SQL'i çalıştırın:

```sql
-- Projects tablosu oluştur
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  year TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index ekle (performans için)
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_category ON projects(category);

-- RLS (Row Level Security) ayarları
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Herkesin okuyabilmesi için policy
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

-- Sadece authenticated kullanıcılar yazabilir (opsiyonel - şimdilik herkes yazabilir)
CREATE POLICY "Anyone can insert projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update projects"
  ON projects FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete projects"
  ON projects FOR DELETE
  USING (true);

-- News tablosu oluştur
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index ekle (performans için)
CREATE INDEX idx_news_created_at ON news(created_at DESC);
CREATE INDEX idx_news_date ON news(date DESC);

-- RLS (Row Level Security) ayarları
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Herkesin okuyabilmesi için policy
CREATE POLICY "News are viewable by everyone"
  ON news FOR SELECT
  USING (true);

-- Sadece authenticated kullanıcılar yazabilir (opsiyonel - şimdilik herkes yazabilir)
CREATE POLICY "Anyone can insert news"
  ON news FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update news"
  ON news FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete news"
  ON news FOR DELETE
  USING (true);
```

## 3. API Keys Alma

1. Supabase Dashboard'da **Settings** > **API**'ye gidin
2. Şu bilgileri kopyalayın:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key (anon key)

## 4. Environment Variables Ayarlama

Proje kök dizininde `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayın):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**ÖNEMLİ**: `.env` dosyasını `.gitignore`'a ekleyin (zaten ekli olmalı)

## 5. Test Etme

1. Development server'ı başlatın: `npm run dev`
2. Admin paneline gidin: `/admin/dashboard`
3. Yeni bir proje ekleyin
4. Projeler sayfasına gidin: `/projects`
5. Eklediğiniz projenin göründüğünü kontrol edin

## 6. Production Deployment

GitHub Pages'e deploy ederken, environment variables'ları GitHub Secrets olarak eklemeniz gerekir:

1. GitHub repository'nize gidin
2. **Settings** > **Secrets and variables** > **Actions**
3. Şu secrets'ları ekleyin:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

GitHub Actions workflow'unu güncelleyin (`.github/workflows/deploy.yml`):

```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## Sorun Giderme

### "Supabase credentials not found" hatası
- `.env` dosyasının proje kök dizininde olduğundan emin olun
- Environment variable'ların doğru yazıldığından emin olun
- Development server'ı yeniden başlatın

### "relation 'projects' does not exist" hatası
- SQL script'i Supabase SQL Editor'da çalıştırdığınızdan emin olun
- Tablo adının doğru olduğundan emin olun

### "new row violates row-level security policy" hatası
- RLS policy'lerini kontrol edin
- Policy'lerin doğru ayarlandığından emin olun

## Notlar

- Free tier'da 500MB database storage ve 2GB bandwidth limiti var
- Resimler base64 olarak saklanıyor (Supabase Storage kullanmak daha iyi olur)
- Production'da RLS policy'lerini daha sıkı yapabilirsiniz (authentication ekleyerek)



import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ONBELLEK = { sayi: null };

/**
 * Sayfada görünen ziyaret sayacı (GoatCounter).
 *
 * NOT: GoatCounter'ın "TOTAL" özel yolu doğrudan URL ile çağrıldığında 0
 * dönüyor (test edildi). Bu yüzden site toplamı, sitenin herkese açık
 * sayfalarının sayaçları toplanarak bulunur. Yeni bir sayfa eklenirse
 * aşağıdaki SAYFALAR listesine yolunu ekleyin.
 *
 * Uç nokta: https://KOD.goatcounter.com/counter/<yol>.json -> { "count": "12" }
 * Kurulum : index.html içinde  window.__GOATCOUNTER_CODE__ = 'selahattinbabadag'
 *           GoatCounter > Settings > "Allow adding visitor counts on your website" AÇIK
 *
 * ÖNEMLİ: bu uç noktanın yanıtları GoatCounter tarafında 4 saate kadar
 * önbelleklenir; sayı anlık değildir (panel 10 saniyede güncellenir).
 * Kod tanımsızsa veya istek başarısız olursa sayaç gösterilmez.
 */
const SAYFALAR = ['/', '/projects'];

const sayiya = (d) => {
  if (!d || !d.count) return 0;
  // "1.234" / "1,234" gibi biçimli gelebilir -> sadece rakamları al
  return parseInt(String(d.count).replace(/[^0-9]/g, ''), 10) || 0;
};

const VisitorCounter = () => {
  const { language } = useLanguage();
  const [count, setCount] = useState(ONBELLEK.sayi);

  useEffect(() => {
    const kod = typeof window !== 'undefined' ? window.__GOATCOUNTER_CODE__ : null;
    if (!kod || String(kod).indexOf('BURAYA') === 0) return;
    if (ONBELLEK.sayi) return;                       // zaten çekildi (StrictMode çift mount'ına dayanıklı)

    let iptal = false;
    Promise.all(
      SAYFALAR.map((p) =>
        fetch(`https://${kod}.goatcounter.com/counter/${encodeURIComponent(p)}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    )
      .then((sonuclar) => {
        const toplam = sonuclar.reduce((t, d) => t + sayiya(d), 0);
        if (toplam > 0) {
          ONBELLEK.sayi = toplam;                    // sonucu önbelleğe al
          if (!iptal) setCount(toplam);
        }
      })
      .catch(() => {
        /* sessizce yok say: sayaç gösterilmez */
      });

    return () => {
      iptal = true;
    };
  }, []);

  if (!count) return null;

  const etiket = language === 'en' ? 'visits' : 'ziyaret';
  const bicimli = count.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR');

  return (
    <span
      className="inline-flex items-center gap-2 font-poppins text-gray-400 text-xs md:text-sm leading-normal"
      title={language === 'en' ? 'Total visits (GoatCounter)' : 'Toplam ziyaret (GoatCounter)'}
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>
        {bicimli} {etiket}
      </span>
    </span>
  );
};

export default VisitorCounter;

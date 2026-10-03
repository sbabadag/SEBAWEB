import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ONBELLEK = { sayi: null };

/**
 * Sayfada görünen ziyaret sayacı (GoatCounter).
 *
 * Toplam ziyaret sayısını GoatCounter'ın herkese açık uç noktasından çeker:
 *   https://KOD.goatcounter.com/counter/TOTAL.json  ->  { "count": "1.234" }
 *
 * Kurulum index.html içinde: window.__GOATCOUNTER_CODE__ = 'seba'
 * ve GoatCounter panelinde "Allow adding visitor counts on your website" AÇIK olmalı.
 *
 * Kod tanımlı değilse veya istek başarısız olursa hiçbir şey göstermez
 * (site bozulmaz, boşa trafik gitmez).
 */
const VisitorCounter = () => {
  const { language } = useLanguage();
  const [count, setCount] = useState(ONBELLEK.sayi);

  useEffect(() => {
    const kod = typeof window !== 'undefined' ? window.__GOATCOUNTER_CODE__ : null;
    if (!kod || String(kod).indexOf('BURAYA') === 0) return;
    if (ONBELLEK.sayi) return;                       // zaten çekildi (StrictMode çift mount'ına dayanıklı)

    let iptal = false;
    fetch(`https://${kod}.goatcounter.com/counter/TOTAL.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.count) {
          ONBELLEK.sayi = String(d.count);           // sonucu önbelleğe al
          if (!iptal) setCount(ONBELLEK.sayi);
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
        {count} {etiket}
      </span>
    </span>
  );
};

export default VisitorCounter;

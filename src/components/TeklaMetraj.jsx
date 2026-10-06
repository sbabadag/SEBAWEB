import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * TeklaMetraj — Tekla çelik metraj çıkarıcı ürün bölümü.
 *
 * İndirme dosyası sitenin KENDİ alan adında barındırılır (public/indir/),
 * GitHub Pages onu doğrudan servis eder. Varlık adı SABİT tutulur
 * (sürüm numarası dosya adında YOK) — yeni sürümde dosyayı değiştirmek
 * yeterlidir, site kodu değişmez.
 */
const DOWNLOAD_URL = '/indir/TeklaMetraj-Setup-win-x64.exe';

const TeklaMetraj = () => {
  const { t } = useLanguage();

  const features = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
  const steps = ['how1', 'how2', 'how3'];

  return (
    <section
      id="teklametraj"
      className="relative w-full py-20 md:py-32 px-4 md:px-8 lg:px-16 xl:px-24 flex flex-col items-center bg-black overflow-hidden"
    >
      {/* Arka plan */}
      <div className="absolute inset-0 w-full h-full opacity-10">
        <img
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt=""
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Bölüm başlığı */}
        <div className="w-full flex flex-col items-center text-center space-y-4 mb-14 md:mb-20">
          <span className="font-poppins font-semibold text-gray-400 text-xs md:text-sm tracking-[0.35em] uppercase">
            {t('teklametraj.eyebrow')}
          </span>
          <h2 className="font-poppins font-bold text-white text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-lg">
            {t('teklametraj.title')}
          </h2>
          <div className="w-24 h-1 bg-white"></div>
          <p className="font-poppins text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed max-w-3xl">
            {t('teklametraj.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Sol: tanıtım */}
          <div className="lg:col-span-2 bg-black/80 backdrop-blur-sm border-2 border-white rounded-2xl shadow-2xl p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="font-poppins font-bold text-white text-2xl md:text-3xl leading-tight">
                {t('teklametraj.name')}
              </h3>
              <span className="font-poppins font-semibold text-black bg-white text-xs md:text-sm px-3 py-1 rounded-full">
                {t('teklametraj.version')}
              </span>
            </div>

            <p className="font-poppins text-gray-300 text-sm md:text-base leading-relaxed mb-8">
              {t('teklametraj.lead')}
            </p>

            {/* Özellikler */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-10">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 mt-0.5 shrink-0 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="font-poppins text-gray-200 text-sm md:text-base leading-snug">
                    {t(`teklametraj.${f}`)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Kurulum adımları */}
            <div className="border-t-2 border-white/20 pt-8">
              <p className="font-poppins font-semibold text-white text-sm md:text-base mb-4 uppercase tracking-wider">
                {t('teklametraj.howTitle')}
              </p>
              <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((s, i) => (
                  <li
                    key={s}
                    className="flex items-start gap-3 bg-white/5 border border-white/25 rounded-xl p-4"
                  >
                    <span className="font-poppins font-bold text-black bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-poppins text-gray-200 text-sm leading-snug">
                      {t(`teklametraj.${s}`)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sağ: indirme kartı */}
          <div className="bg-white text-black rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col">
            <p className="font-poppins font-semibold text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
              {t('teklametraj.downloadLabel')}
            </p>
            <p className="font-poppins font-bold text-3xl md:text-4xl leading-none mb-1">
              {t('teklametraj.sizeValue')}
            </p>
            <p className="font-poppins text-gray-600 text-sm leading-relaxed mb-6">
              {t('teklametraj.reqValue')}
            </p>

            <a
              href={DOWNLOAD_URL}
              download
              className="w-full bg-black text-white font-poppins font-semibold text-base rounded-full px-6 py-4 flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg hover:scale-[1.02] mb-6"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              {t('teklametraj.download')}
            </a>

            <ul className="space-y-2 border-t border-gray-300 pt-5 mt-auto">
              <li className="font-poppins text-gray-700 text-xs md:text-sm leading-snug">
                {t('teklametraj.manual')}
              </li>
              <li className="font-poppins text-gray-700 text-xs md:text-sm leading-snug">
                {t('teklametraj.verified')}
              </li>
              <li className="font-poppins text-gray-500 text-xs leading-snug">
                {t('teklametraj.note')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeklaMetraj;

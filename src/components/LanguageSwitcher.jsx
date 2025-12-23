import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`font-poppins font-semibold text-[14px] px-3 py-1 rounded-[8px] transition-colors ${
          language === 'en'
            ? 'bg-white text-black shadow-md'
            : 'text-white hover:text-gray-300 bg-black border border-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('tr')}
        className={`font-poppins font-semibold text-[14px] px-3 py-1 rounded-[8px] transition-colors ${
          language === 'tr'
            ? 'bg-white text-black shadow-md'
            : 'text-white hover:text-gray-300 bg-black border border-white'
        }`}
      >
        TR
      </button>
    </div>
  );
};

export default LanguageSwitcher;


import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-black min-h-[128px] w-full overflow-hidden relative border-t-2 border-white py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-start md:items-center gap-2">
          <p className="font-poppins text-gray-300 text-sm md:text-base leading-normal text-center md:text-left">
            {t('footer.copyright')}
          </p>
          <p className="font-poppins text-gray-400 text-xs md:text-sm leading-normal text-center md:text-left">
            {t('footer.owner')}
          </p>
        </div>
        <Link 
          to="/admin/login"
          className="font-poppins text-gray-300 text-xs md:text-sm leading-normal hover:text-white transition-colors"
        >
          {t('common.admin')}
        </Link>
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home first
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="bg-black backdrop-blur-md h-[85px] w-full border-b-2 border-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 h-full flex items-center justify-between max-w-[1440px]">
        <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="h-[60px] md:h-[70px] w-auto relative">
            <img 
              alt="SEBA Engineering Construction & Consultancy Logo" 
              className="h-full w-auto object-contain mix-blend-screen" 
              src={`${import.meta.env.BASE_URL}assets/seba-logo.png`}
              style={{
                filter: 'brightness(1.1) contrast(1.1)',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 lg:gap-12 xl:gap-16">
          <button 
            onClick={() => scrollToSection('services')}
            className="font-poppins font-semibold text-white text-sm lg:text-base leading-normal hover:text-gray-300 transition-colors relative group"
          >
            {t('nav.services')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </button>
          <Link 
            to="/projects"
            className="font-poppins font-semibold text-white text-sm lg:text-base leading-normal hover:text-gray-300 transition-colors relative group"
          >
            {t('nav.projects')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </Link>
          <button 
            onClick={() => scrollToSection('about')}
            className="font-poppins font-semibold text-white text-sm lg:text-base leading-normal hover:text-gray-300 transition-colors relative group"
          >
            {t('nav.about')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="bg-white text-black border-2 border-white rounded-full px-4 lg:px-6 py-2 lg:py-3 flex items-center justify-center hover:bg-gray-200 transition-all shadow-lg hover:scale-105"
          >
            <p className="font-poppins font-semibold text-black text-sm lg:text-base leading-normal">
              {t('nav.contact')}
            </p>
          </button>
          <LanguageSwitcher />
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;


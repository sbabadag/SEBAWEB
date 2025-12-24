import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="md:hidden flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t-2 border-white">
          <nav className="container mx-auto px-4 py-4 max-w-[1440px] flex flex-col gap-4">
            <button
              onClick={() => {
                scrollToSection('services');
                setIsMobileMenuOpen(false);
              }}
              className="font-poppins font-semibold text-white text-base py-3 text-left hover:text-gray-300 transition-colors border-b border-white/20"
            >
              {t('nav.services')}
            </button>
            <Link
              to="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-poppins font-semibold text-white text-base py-3 text-left hover:text-gray-300 transition-colors border-b border-white/20"
            >
              {t('nav.projects')}
            </Link>
            <button
              onClick={() => {
                scrollToSection('about');
                setIsMobileMenuOpen(false);
              }}
              className="font-poppins font-semibold text-white text-base py-3 text-left hover:text-gray-300 transition-colors border-b border-white/20"
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => {
                scrollToSection('contact');
                setIsMobileMenuOpen(false);
              }}
              className="bg-white text-black border-2 border-white rounded-full px-6 py-3 flex items-center justify-center hover:bg-gray-200 transition-all shadow-lg mt-2"
            >
              <p className="font-poppins font-semibold text-black text-base leading-normal">
                {t('nav.contact')}
              </p>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;


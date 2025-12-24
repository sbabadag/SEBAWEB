import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  return (
    <section className="relative w-full flex flex-col gap-12 md:gap-16 items-center py-16 md:py-24 lg:py-32 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Engineering team background"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
          <h2 className="font-poppins font-bold text-white text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-lg">
            {t('about.title')}
          </h2>
          <div className="w-24 h-1 bg-white"></div>
        </div>
      </div>

      {/* Content Grid - Photography Portfolio Style */}
      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="flex flex-col items-start justify-center space-y-6 order-2 lg:order-1">
            <p className="font-poppins text-gray-300 text-base md:text-lg leading-relaxed">
              {t('about.description')}
            </p>
          </div>
          
          {/* Image Content */}
          <div className="relative group order-1 lg:order-2">
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden rounded-2xl shadow-2xl">
              <img 
                alt="About SEBA Engineering" 
                className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105" 
                src={`${import.meta.env.BASE_URL}assets/about-image-7994a8.png`} 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;


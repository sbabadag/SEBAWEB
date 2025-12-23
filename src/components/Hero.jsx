import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  const featureCards = [
    { icon: "/assets/icon-unity.svg", text: "100% Happy Clients" },
    { icon: "/assets/icon-office.svg", text: "On-Time Delivery" },
    { icon: "/assets/icon-appstore.svg", text: "Quality Assured" },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          alt="Construction site" 
          className="absolute inset-0 w-full h-full object-cover object-center grayscale animate-fade-in" 
          src="/assets/hero-background.png" 
        />
        {/* Steel Construction Background Layer */}
        <img 
          alt="Steel construction background" 
          className="absolute inset-0 w-full h-full object-cover object-center grayscale opacity-40" 
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-8 md:px-16 lg:px-24 h-full relative z-10 flex items-center max-w-[1440px]">
        {/* Left Side - Main Content */}
        <div className="flex flex-col justify-center gap-8 w-full md:w-2/3 lg:w-1/2 animate-slide-up">
          <div className="space-y-6">
            <h1 className="font-poppins font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight text-white drop-shadow-2xl">
              {t('hero.title')}<br />
              <span className="block mt-2">{t('hero.subtitle')}</span>
            </h1>
            <p className="font-poppins text-gray-300 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-2xl">
              {t('hero.description')}
            </p>
          </div>
          <button className="group bg-white text-black rounded-full h-14 md:h-16 w-auto px-8 md:px-10 flex items-center justify-center gap-3 hover:bg-gray-200 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105">
            <p className="font-poppins font-semibold text-black text-base md:text-lg leading-normal">
              {t('hero.callUs')}
            </p>
            <div className="w-8 h-8 md:w-10 md:h-10 relative transform group-hover:translate-x-1 transition-transform">
              <img 
                alt="Phone icon" 
                className="w-full h-full invert" 
                src="/assets/icon-call.svg" 
              />
            </div>
          </button>
        </div>

        {/* Right Side - Feature Cards */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4 w-40">
          {featureCards.slice(0, 3).map((card, index) => (
            <div 
              key={index} 
              className="group backdrop-blur-md bg-black/40 border border-white/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 h-32 hover:scale-105 hover:bg-black/60 transition-all duration-300 shadow-xl cursor-pointer"
            >
              <div className="w-12 h-12 relative transform group-hover:scale-110 transition-transform">
                <img alt={card.text} className="w-full h-full invert" src={card.icon} />
              </div>
              <p className="font-poppins font-semibold text-white text-xs text-center tracking-wide leading-tight">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;


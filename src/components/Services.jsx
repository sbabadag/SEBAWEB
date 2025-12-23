import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();
  const baseUrl = import.meta.env.BASE_URL;
  
  const services = [
    {
      icon: `${baseUrl}assets/icon-building-construction.svg`,
      titleKey: "services.projectManagement"
    },
    {
      icon: `${baseUrl}assets/icon-blueprints.svg`,
      titleKey: "services.designDrawing"
    },
    {
      icon: `${baseUrl}assets/icon-analyse.svg`,
      titleKey: "services.healthSafety"
    },
    {
      icon: `${baseUrl}assets/icon-new-constructions.svg`,
      titleKey: "services.siteServices"
    },
    {
      icon: `${baseUrl}assets/icon-commercial.svg`,
      titleKey: "services.manufacturing"
    },
    {
      icon: `${baseUrl}assets/icon-multi-family.svg`,
      titleKey: "services.structuralSteel"
    },
    {
      icon: `${baseUrl}assets/icon-corrosion.svg`,
      titleKey: "services.pressureVessels"
    },
    {
      icon: `${baseUrl}assets/icon-add-home.svg`,
      titleKey: "services.chimneysFlues"
    },
    {
      icon: `${baseUrl}assets/icon-building-construction.svg`,
      titleKey: "services.heavyFabrication"
    },
  ];

  return (
    <section className="relative w-full py-20 md:py-32 px-4 md:px-8 lg:px-16 xl:px-24 flex flex-col items-center gap-16 md:gap-20 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Construction services background"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl">
        {/* Section Header */}
        <div className="w-full flex flex-col items-center text-center space-y-4 mb-16 md:mb-20">
          <h2 className="font-poppins font-bold text-white text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-lg">
            {t('services.title')}
          </h2>
          <div className="w-24 h-1 bg-white"></div>
        </div>

        {/* Services Grid - Photography Portfolio Style */}
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group relative bg-black/80 backdrop-blur-sm border-2 border-white flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500"></div>
                
                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <img 
                    alt={t(service.titleKey)} 
                    className="w-full h-full invert" 
                    src={service.icon} 
                  />
                </div>
                <p className="relative z-10 font-poppins font-medium text-white text-sm md:text-base text-center leading-tight group-hover:text-gray-300 transition-colors duration-300">
                  {t(service.titleKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;


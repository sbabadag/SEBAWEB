import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Gallery = () => {
  const { t } = useLanguage();
  return (
    <section className="relative bg-black w-full py-20 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80" 
          alt="Construction projects gallery background"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Section Header */}
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 mb-12 md:mb-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="font-poppins font-bold text-white text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-2xl">
              {t('gallery.title')}
            </h2>
            <div className="w-24 h-1 bg-white"></div>
            <p className="font-poppins text-gray-300 text-base md:text-lg max-w-2xl mt-4 drop-shadow-lg">
              {t('gallery.description')}
            </p>
          </div>
        </div>

        {/* Photography Portfolio Style Grid */}
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Large Featured Image */}
          <div className="md:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer">
            <div className="aspect-[4/3] md:aspect-auto md:h-[600px] relative">
              <img 
                alt="Gallery image 1" 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                src="/assets/gallery-1.png" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-poppins font-semibold text-white text-lg">Construction Project</p>
              </div>
            </div>
          </div>

          {/* Medium Image */}
          <div className="group relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer">
            <div className="aspect-[3/4] md:h-[300px] relative">
              <img 
                alt="Gallery image 2" 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                src="/assets/gallery-2.png" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-poppins font-semibold text-white text-base">Site Work</p>
              </div>
            </div>
          </div>

          {/* Small Image */}
          <div className="group relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer">
            <div className="aspect-[3/4] md:h-[300px] relative">
              <img 
                alt="Gallery image 3" 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                src="/assets/gallery-3-29b6d9.png" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-poppins font-semibold text-white text-base">Detail Work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default Gallery;


import React, { useState } from 'react';

const ProjectGallery = ({ project, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !project) return null;

  const images = Array.isArray(project.images) ? project.images : 
                 project.image ? [project.image] : [];

  if (images.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[95vw] md:max-w-7xl w-full max-h-[95vh] md:max-h-[90vh] bg-black border-2 border-white rounded-[20px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 md:top-6 right-4 md:right-6 z-30 bg-white text-black w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all shadow-xl hover:scale-110"
        >
          <span className="text-3xl md:text-4xl font-light">×</span>
        </button>

        {/* Main Image */}
        <div className="relative h-[60vh] md:h-[75vh] lg:h-[80vh] bg-black">
          <img
            src={images[currentImageIndex]}
            alt={`${project.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white text-black w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all shadow-xl hover:scale-110 z-20"
              >
                <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white text-black w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all shadow-xl hover:scale-110 z-20"
              >
                <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-5 md:px-6 py-2 md:py-3 rounded-full shadow-xl">
              <span className="font-poppins font-semibold text-sm md:text-base">
                {currentImageIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="bg-black p-6 md:p-8 lg:p-10 border-t-2 border-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 md:mb-6 gap-4">
            <div className="flex-1">
              <h2 className="font-poppins font-bold text-white text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4">
                {project.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-300">
                <span className="font-poppins text-sm md:text-base lg:text-lg">📍 {project.location}</span>
                <span className="font-poppins text-sm md:text-base lg:text-lg">📅 {project.year}</span>
                <span className="bg-white text-black px-3 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl font-poppins font-semibold text-xs md:text-sm lg:text-base shadow-md">
                  {project.category}
                </span>
              </div>
            </div>
          </div>
          <p className="font-poppins text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="bg-black p-4 md:p-6 border-t-2 border-white">
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-white scale-110 shadow-xl ring-2 ring-white'
                      : 'border-gray-600 opacity-60 hover:opacity-100 hover:border-white hover:scale-105'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectGallery;


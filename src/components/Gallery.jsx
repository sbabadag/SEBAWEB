import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../config/supabase';

const Gallery = () => {
  const { t } = useLanguage();
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  // Fisher-Yates shuffle algorithm for randomizing array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadGalleryImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) {
        console.error('Error loading projects:', error);
        // Fallback to localStorage if Supabase fails
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
          try {
            const parsedProjects = JSON.parse(storedProjects);
            const projectsArray = Array.isArray(parsedProjects) ? parsedProjects : [];
            extractAndShuffleImages(projectsArray);
          } catch (parseError) {
            console.error('Error parsing projects from localStorage:', parseError);
            setGalleryImages([]);
          }
        } else {
          setGalleryImages([]);
        }
      } else {
        extractAndShuffleImages(data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to localStorage
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const parsedProjects = JSON.parse(storedProjects);
          const projectsArray = Array.isArray(parsedProjects) ? parsedProjects : [];
          extractAndShuffleImages(projectsArray);
        } catch (parseError) {
          console.error('Error parsing projects from localStorage:', parseError);
          setGalleryImages([]);
        }
      } else {
        setGalleryImages([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const extractAndShuffleImages = (projects) => {
    // Extract all images from all projects
    const allImages = [];
    projects.forEach((project) => {
      const projectImages = project.images || (project.image ? [project.image] : []);
      projectImages.forEach((image) => {
        allImages.push({
          image,
          projectTitle: project.title,
          projectLocation: project.location
        });
      });
    });

    // Shuffle and take first 6 images for gallery
    const shuffled = shuffleArray(allImages);
    setGalleryImages(shuffled.slice(0, 6));
  };

  // Grid layout configurations for different image positions
  const getGridClass = (index) => {
    if (index === 0) {
      return 'md:col-span-2 lg:row-span-2';
    }
    return '';
  };

  const getAspectClass = (index) => {
    if (index === 0) {
      return 'aspect-[4/3] md:aspect-auto md:h-[600px]';
    }
    return 'aspect-[3/4] md:h-[300px]';
  };

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
          {isLoading ? (
            <div className="text-center py-16">
              <p className="font-poppins text-gray-400 text-lg">
                {t('gallery.loading') || 'Yükleniyor...'}
              </p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-poppins text-gray-400 text-lg">
                {t('gallery.noImages') || 'Henüz resim eklenmemiş.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {galleryImages.map((item, index) => (
                <div
                  key={index}
                  className={`${getGridClass(index)} group relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer`}
                >
                  <div className={`${getAspectClass(index)} relative`}>
                    <img 
                      alt={item.projectTitle || `Gallery image ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-90 transition-all duration-700 group-hover:scale-110" 
                      src={item.image} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <p className="font-poppins font-semibold text-white text-base md:text-lg">
                        {item.projectTitle || 'Construction Project'}
                      </p>
                      {item.projectLocation && (
                        <p className="font-poppins text-gray-300 text-sm mt-1">
                          📍 {item.projectLocation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;


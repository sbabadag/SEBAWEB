import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ProjectGallery from '../components/ProjectGallery';
import { supabase } from '../config/supabase';

const Projects = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = import.meta.env.BASE_URL;

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        // Fallback to localStorage if Supabase fails
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
          try {
            const parsedProjects = JSON.parse(storedProjects);
            setProjects(Array.isArray(parsedProjects) ? parsedProjects : []);
          } catch (parseError) {
            console.error('Error parsing projects from localStorage:', parseError);
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to localStorage
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const parsedProjects = JSON.parse(storedProjects);
          setProjects(Array.isArray(parsedProjects) ? parsedProjects : []);
        } catch (parseError) {
          console.error('Error parsing projects from localStorage:', parseError);
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen w-full">
      {/* Hero Section for Projects Page */}
      <div className="bg-black h-[300px] w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-poppins font-bold text-[64px] leading-normal text-white mb-4 drop-shadow-2xl">
            {t('projects.title')}
          </h1>
          <p className="font-poppins text-gray-300 text-[20px] leading-normal max-w-[800px]">
            {t('projects.subtitle')}
          </p>
        </div>
      </div>

      {/* Projects Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="mb-12 md:mb-16">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="font-poppins font-bold text-white text-3xl md:text-4xl lg:text-5xl leading-tight">
                {t('projects.sectionTitle')}
              </h2>
              <div className="w-24 h-1 bg-white"></div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <p className="font-poppins text-gray-400 text-lg">
                {t('projects.loading') || 'Yükleniyor...'}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && (
            <div className="text-center py-16">
              <p className="font-poppins text-gray-400 text-lg mb-4">
                {t('projects.noProjects') || 'Henüz proje eklenmemiş.'}
              </p>
              <p className="font-poppins text-gray-500 text-sm">
                {t('projects.addFromAdmin') || 'Admin panelinden proje ekleyebilirsiniz.'}
              </p>
            </div>
          )}

          {/* Scattered/Distributed Projects Layout - Grid on mobile, scattered on desktop */}
          {!isLoading && projects.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:hidden gap-6 mb-8">
                {projects.map((project, index) => {
              const projectImages = project.images || (project.image ? [project.image] : []);
              const mainImage = projectImages[0] || project.image;
              const imageCount = projectImages.length;

              return (
                <div 
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsGalleryOpen(true);
                  }}
                  className="group relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer transition-all duration-500 hover:scale-105 h-[400px]"
                >
                  <img 
                    alt={project.title}
                    src={mainImage}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-xl z-10">
                    <span className="font-poppins font-semibold text-black text-sm">{project.category}</span>
                  </div>
                  {imageCount > 1 && (
                    <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm border-2 border-white px-4 py-2 rounded-full shadow-xl z-10">
                      <span className="font-poppins font-semibold text-white text-sm">📷 {imageCount} {t('projects.photos')}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/98 via-black/80 to-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-poppins font-bold text-white text-lg">{project.title}</h3>
                      <span className="font-poppins text-gray-300 text-sm">{project.year}</span>
                    </div>
                    <p className="font-poppins text-gray-300 text-sm">📍 {project.location}</p>
                  </div>
                </div>
              );
            })}
              </div>

              {/* Desktop Scattered Layout */}
              <div className="hidden md:block relative min-h-[2500px] lg:min-h-[3000px] w-full">
            {projects.map((project, index) => {
              // Support both old format (image) and new format (images array)
              const projectImages = project.images || (project.image ? [project.image] : []);
              const mainImage = projectImages[0] || project.image;
              const imageCount = projectImages.length;
              
              // Create varied sizes and positions for scattered effect
              const sizes = [
                { w: 'w-[280px] md:w-[350px] lg:w-[400px]', h: 'h-[350px] md:h-[450px] lg:h-[500px]' },
                { w: 'w-[250px] md:w-[320px] lg:w-[380px]', h: 'h-[300px] md:h-[400px] lg:h-[450px]' },
                { w: 'w-[300px] md:w-[380px] lg:w-[450px]', h: 'h-[380px] md:h-[480px] lg:h-[550px]' },
                { w: 'w-[260px] md:w-[340px] lg:w-[420px]', h: 'h-[320px] md:h-[420px] lg:h-[480px]' },
                { w: 'w-[280px] md:w-[360px] lg:w-[400px]', h: 'h-[360px] md:h-[460px] lg:h-[520px]' },
                { w: 'w-[270px] md:w-[350px] lg:w-[410px]', h: 'h-[340px] md:h-[440px] lg:h-[500px]' },
              ];
              
              const positions = [
                { top: 'top-[50px]', left: 'left-[10%] md:left-[8%] lg:left-[5%]' },
                { top: 'top-[200px]', left: 'left-[55%] md:left-[55%] lg:left-[50%]' },
                { top: 'top-[400px]', left: 'left-[15%] md:left-[12%] lg:left-[10%]' },
                { top: 'top-[600px]', left: 'left-[50%] md:left-[50%] lg:left-[45%]' },
                { top: 'top-[800px]', left: 'left-[12%] md:left-[10%] lg:left-[8%]' },
                { top: 'top-[1000px]', left: 'left-[57%] md:left-[58%] lg:left-[52%]' },
              ];
              
              const rotations = [
                'rotate-[-2deg]',
                'rotate-[1.5deg]',
                'rotate-[-1deg]',
                'rotate-[2deg]',
                'rotate-[-1.5deg]',
                'rotate-[1deg]',
              ];
              
              const sizeIndex = index % sizes.length;
              const posIndex = index % positions.length;
              const rotIndex = index % rotations.length;
              
              const size = sizes[sizeIndex];
              const position = positions[posIndex];
              const rotation = rotations[rotIndex];

              return (
                <div 
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsGalleryOpen(true);
                  }}
                  className={`group absolute ${position.top} ${position.left} ${size.w} ${size.h} ${rotation} cursor-pointer transition-all duration-500 hover:scale-110 hover:z-30 hover:rotate-0 hover:shadow-3xl`}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-3xl border-2 border-neutral-70 hover:border-primary-20 transition-all duration-500">
                    <img 
                      alt={project.title}
                      src={mainImage}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-xl z-10">
                      <span className="font-poppins font-semibold text-black text-xs md:text-sm">
                        {project.category}
                      </span>
                    </div>
                    
                    {/* Photo Count Badge - Shows if multiple images */}
                    {imageCount > 1 && (
                      <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-black/90 backdrop-blur-sm border-2 border-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-xl z-10">
                        <span className="font-poppins font-semibold text-white text-xs md:text-sm">
                          📷 {imageCount} {t('projects.photos')}
                        </span>
                      </div>
                    )}
                    
                    {/* Click Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                      <div className="bg-white px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl">
                        <span className="font-poppins font-bold text-black text-sm md:text-base">
                          {t('projects.viewGallery')} →
                        </span>
                      </div>
                    </div>
                    
                    {/* Project Info - Always visible at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-poppins font-bold text-white text-base md:text-lg lg:text-xl leading-tight line-clamp-1">
                            {project.title}
                          </h3>
                          <span className="font-poppins text-gray-300 text-xs md:text-sm flex-shrink-0 ml-2">
                            {project.year}
                          </span>
                        </div>
                        <p className="font-poppins text-gray-300 text-xs md:text-sm line-clamp-1">
                          📍 {project.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </>
          )}

          {/* Project Gallery Modal */}
          <ProjectGallery
            project={selectedProject}
            isOpen={isGalleryOpen}
            onClose={() => {
              setIsGalleryOpen(false);
              setSelectedProject(null);
            }}
          />

          {/* Stats Section */}
          <div className="mt-16 md:mt-20 lg:mt-24 w-full">
            <div className="bg-gradient-to-br from-neutral-90 via-neutral-80 to-neutral-90 rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 border border-neutral-70 shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <h3 className="font-poppins font-bold text-primary-10 text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-4">
                    50+
                  </h3>
                  <p className="font-poppins text-primary-20 text-sm md:text-base lg:text-lg leading-tight">
                    {t('projects.stats.completed')}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h3 className="font-poppins font-bold text-primary-10 text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-4">
                    15+
                  </h3>
                  <p className="font-poppins text-primary-20 text-sm md:text-base lg:text-lg leading-tight">
                    {t('projects.stats.experience')}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h3 className="font-poppins font-bold text-primary-10 text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-4">
                    100%
                  </h3>
                  <p className="font-poppins text-primary-20 text-sm md:text-base lg:text-lg leading-tight">
                    {t('projects.stats.satisfaction')}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h3 className="font-poppins font-bold text-primary-10 text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-4">
                    200+
                  </h3>
                  <p className="font-poppins text-primary-20 text-sm md:text-base lg:text-lg leading-tight">
                    {t('projects.stats.team')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;


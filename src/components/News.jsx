import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../config/supabase';

const News = () => {
  const { t } = useLanguage();
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading news:', error);
        setNewsItems([]);
      } else {
        // Duplicate items for seamless infinite scroll
        setNewsItems(data ? [...data, ...data] : []);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || newsItems.length === 0) {
    return null; // Don't show if loading or no news
  }

  // Calculate animation duration based on number of items
  const animationDuration = newsItems.length > 0 ? (newsItems.length / 2) * 8 : 20; // Divide by 2 because we duplicated items

  return (
    <div className="hidden md:block fixed left-0 top-0 h-full w-[280px] lg:w-[320px] z-40 pointer-events-none">
      {/* Transparent Panel */}
      <div className="h-full w-full bg-black/30 backdrop-blur-md border-r-2 border-white/20 shadow-2xl pointer-events-auto">
        {/* Title */}
        <div className="p-4 border-b-2 border-white/20 bg-black/40">
          <h3 className="font-poppins font-bold text-white text-lg lg:text-xl text-center">
            {t('news.title') || 'Haberler'}
          </h3>
        </div>

        {/* Scrolling News Container */}
        <div className="h-[calc(100%-80px)] overflow-hidden relative">
          <div 
            className="news-scroll-container"
            style={{
              animation: `scrollNews ${animationDuration}s linear infinite`
            }}
          >
            {newsItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="p-4 border-b border-white/10 hover:bg-black/20 transition-colors cursor-pointer group min-h-[200px]"
              >
                {item.image && (
                  <div className="relative h-32 mb-3 overflow-hidden rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                )}
                <div className="space-y-2">
                  {item.date && (
                    <p className="font-poppins text-gray-400 text-xs">
                      {new Date(item.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  <h4 className="font-poppins font-bold text-white text-sm lg:text-base line-clamp-2 group-hover:text-gray-200 transition-colors">
                    {item.title}
                  </h4>
                  <p className="font-poppins text-gray-300 text-xs lg:text-sm line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;


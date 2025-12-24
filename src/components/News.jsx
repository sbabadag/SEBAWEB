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
        .order('created_at', { ascending: false })
        .limit(6); // Show latest 6 news items

      if (error) {
        console.error('Error loading news:', error);
        setNewsItems([]);
      } else {
        setNewsItems(data || []);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="bg-black py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 max-w-[1440px]">
          <div className="text-center">
            <p className="font-poppins text-white text-lg">{t('news.loading') || 'Yükleniyor...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (newsItems.length === 0) {
    return null; // Don't show section if no news
  }

  return (
    <section id="news" className="bg-black py-16 md:py-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80"
          alt="News background"
          className="w-full h-full object-cover grayscale opacity-20"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 relative z-10 max-w-[1440px]">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            {t('news.title') || 'Haberler'}
          </h2>
          <p className="font-poppins text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            {t('news.subtitle') || 'Son haberler ve güncellemeler'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="bg-black/80 backdrop-blur-sm border-2 border-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
            >
              {item.image && (
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                </div>
              )}
              <div className="p-6">
                {item.date && (
                  <p className="font-poppins text-gray-400 text-sm mb-2">
                    {new Date(item.date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                <h3 className="font-poppins font-bold text-white text-xl md:text-2xl mb-3 line-clamp-2">
                  {item.title}
                </h3>
                <p className="font-poppins text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;


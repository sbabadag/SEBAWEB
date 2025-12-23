import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Initialize EmailJS on component mount
  useEffect(() => {
    emailjs.init('0XNFlUSr3dJW4nl0t');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    // EmailJS configuration
    const SERVICE_ID = 'service_kty7xh8';
    const TEMPLATE_ID = 'template_idpnv0n';
    const PUBLIC_KEY = '0XNFlUSr3dJW4nl0t';
    
    // EmailJS template parameters
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      to_email: 'sbabadag@gmail.com',
      subject: `İletişim Formu - ${formData.name}`
    };
    
    try {
      // Send email using EmailJS
      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
      
      if (response.status === 200) {
        // Success
        setFormData({
          name: '',
          email: '',
          message: ''
        });
        setSubmitStatus('success');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Email gönderme hatası:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };
  
  const baseUrl = import.meta.env.BASE_URL;
  const contactInfo = [
    {
      icon: `${baseUrl}assets/icon-phone.svg`,
      labelKey: "contact.phone",
      value: "+90 XXX XXX XX XX"
    },
    {
      icon: `${baseUrl}assets/icon-address.svg`,
      labelKey: "contact.address",
      value: "SEBA Engineering Construction & Consultancy"
    },
    {
      icon: `${baseUrl}assets/icon-address.svg`,
      labelKey: "contact.email",
      value: "info@sebaengineering.com"
    },
  ];

  return (
    <section id="contact" className="relative w-full flex flex-col gap-12 md:gap-16 items-center py-16 md:py-24 lg:py-32 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
          alt="Contact office background"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
          <h2 className="font-poppins font-bold text-white text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-lg">
            {t('contact.title')}
          </h2>
          <div className="w-24 h-1 bg-white"></div>
        </div>
      </div>

      {/* Contact Content Grid */}
      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 md:p-8 bg-black border-2 border-white rounded-2xl shadow-xl">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('contact.name') || "Name"}
                className="bg-black border-2 border-white rounded-xl p-4 w-full font-poppins font-medium text-white text-base leading-normal focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all placeholder-gray-500"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('contact.email')}
                className="bg-black border-2 border-white rounded-xl p-4 w-full font-poppins font-medium text-white text-base leading-normal focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all placeholder-gray-500"
                required
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t('contact.message')}
                rows={6}
                className="bg-black border-2 border-white rounded-xl px-4 py-4 w-full font-poppins font-medium text-white text-base leading-normal resize-none focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all placeholder-gray-500"
                required
              />
              {submitStatus === 'success' && (
                <div className="bg-black border-2 border-white text-white px-4 py-3 rounded-xl text-sm">
                  {t('contact.successMessage') || 'Mesajınız başarıyla gönderildi!'}
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="bg-black border-2 border-white text-white px-4 py-3 rounded-xl text-sm">
                  {t('contact.errorMessage') || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'}
                </div>
              )}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black flex items-center justify-center gap-2 h-14 md:h-16 px-6 md:px-8 rounded-full hover:bg-gray-200 transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-poppins font-semibold text-black text-base md:text-lg text-center leading-normal">
                  {isSubmitting ? (t('contact.sending') || 'Gönderiliyor...') : t('contact.send')}
                </p>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="w-full flex flex-col justify-center gap-6 md:gap-8">
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div 
                  key={index}
                  className="flex gap-4 items-start p-4 bg-black border-2 border-white rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 relative overflow-hidden flex-shrink-0">
                    <img alt={t(info.labelKey)} className="w-full h-full invert" src={info.icon} />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <p className="font-poppins font-semibold text-white text-base md:text-lg leading-normal">
                      {t(info.labelKey)}
                    </p>
                    <p className="font-poppins font-medium text-gray-300 text-sm md:text-base leading-normal">
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;


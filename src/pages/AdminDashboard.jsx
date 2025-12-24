import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../config/supabase';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    year: new Date().getFullYear().toString(),
    description: '',
    category: 'Commercial',
    images: [],
    imagePreviews: []
  });
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // News state
  const [newsItems, setNewsItems] = useState([]);
  const [newsFormData, setNewsFormData] = useState({
    title: '',
    content: '',
    image: '',
    imagePreview: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingNewsId, setEditingNewsId] = useState(null);

  useEffect(() => {
    // Check authentication
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
      navigate('/admin/login');
      return;
    }

    // Load projects and news
    loadProjects();
    loadNews();
  }, [navigate]);

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
          setProjects(JSON.parse(storedProjects));
        }
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to localStorage
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Compress and resize image
  const compressImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        // Compress all images
        const compressedImages = await Promise.all(
          files.map(file => compressImage(file))
        );

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...files],
          imagePreviews: [...prev.imagePreviews, ...compressedImages]
        }));
      } catch (error) {
        console.error('Error processing images:', error);
        alert('Resim işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      
      // Reset input to allow selecting the same file again
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Use the imagePreviews from form (which includes existing images when editing)
    // If editing, imagePreviews already contains existing images from handleEdit
    // If adding new, imagePreviews contains only new images
    const allImages = formData.imagePreviews.length > 0 ? formData.imagePreviews : [];
    
    const projectData = {
      title: formData.title,
      location: formData.location,
      year: formData.year,
      description: formData.description,
      category: formData.category,
      images: allImages,
      image: allImages[0] || '', // Keep for backward compatibility
    };

    try {
      if (editingId) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingId)
          .select();

        if (error) {
          throw error;
        }

        setProjects(projects.map(p => p.id === editingId ? data[0] : p));
        setEditingId(null);
        setSuccessMessage(t('admin.dashboard.successUpdate'));
      } else {
        // Insert new project
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select();

        if (error) {
          throw error;
        }

        setProjects([data[0], ...projects]);
        setSuccessMessage(t('admin.dashboard.successAdd'));
      }

      // Reset form
      setFormData({
        title: '',
        location: '',
        year: new Date().getFullYear().toString(),
        description: '',
        category: 'Commercial',
        images: [],
        imagePreviews: []
      });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Proje kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      
      // Fallback to localStorage if Supabase fails
      try {
        const projectDataWithId = {
          id: editingId || Date.now(),
          ...projectData,
          created_at: editingId ? projects.find(p => p.id === editingId)?.created_at : new Date().toISOString()
        };

        let updatedProjects;
        if (editingId) {
          updatedProjects = projects.map(p => p.id === editingId ? projectDataWithId : p);
          setEditingId(null);
        } else {
          updatedProjects = [...projects, projectDataWithId];
        }

        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
        setSuccessMessage(editingId ? t('admin.dashboard.successUpdate') : t('admin.dashboard.successAdd'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project) => {
    // Support both old format (image) and new format (images array)
    const projectImages = project.images || (project.image ? [project.image] : []);
    
    setFormData({
      title: project.title,
      location: project.location,
      year: project.year,
      description: project.description,
      category: project.category,
      images: [],
      imagePreviews: projectImages
    });
    setEditingId(project.id);
    
    // Reset file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.dashboard.deleteConfirm'))) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        setProjects(projects.filter(p => p.id !== id));
        setSuccessMessage(t('admin.dashboard.successDelete'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Proje silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        
        // Fallback to localStorage
        const updatedProjects = projects.filter(p => p.id !== id);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
        setSuccessMessage(t('admin.dashboard.successDelete'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  // News functions
  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading news:', error);
        setNewsItems([]);
      } else {
        setNewsItems(data || []);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItems([]);
    }
  };

  const handleNewsInputChange = (e) => {
    const { name, value } = e.target;
    setNewsFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewsImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        setNewsFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: compressedImage
        }));
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Resim işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      e.target.value = '';
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newsData = {
      title: newsFormData.title,
      content: newsFormData.content,
      image: newsFormData.imagePreview || '',
      date: newsFormData.date || new Date().toISOString().split('T')[0]
    };

    try {
      if (editingNewsId) {
        const { data, error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNewsId)
          .select();

        if (error) throw error;

        setNewsItems(newsItems.map(n => n.id === editingNewsId ? data[0] : n));
        setEditingNewsId(null);
        setSuccessMessage(t('news.successUpdate'));
      } else {
        const { data, error } = await supabase
          .from('news')
          .insert([newsData])
          .select();

        if (error) throw error;

        setNewsItems([data[0], ...newsItems]);
        setSuccessMessage(t('news.successAdd'));
      }

      setNewsFormData({
        title: '',
        content: '',
        image: '',
        imagePreview: '',
        date: new Date().toISOString().split('T')[0]
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Haber kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsEdit = (news) => {
    setNewsFormData({
      title: news.title,
      content: news.content,
      image: '',
      imagePreview: news.image || '',
      date: news.date || new Date().toISOString().split('T')[0]
    });
    setEditingNewsId(news.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsDelete = async (id) => {
    if (window.confirm(t('news.deleteConfirm'))) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('news')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setNewsItems(newsItems.filter(n => n.id !== id));
        setSuccessMessage(t('news.successDelete'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Haber silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const categories = ['Commercial', 'Residential', 'Industrial', 'Restoration', 'Mixed-Use', 'Institutional'];

  return (
    <div className="bg-gradient-to-b from-neutral-100 via-neutral-90 to-neutral-100 min-h-screen w-full py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="bg-black border-2 border-white rounded-[20px] p-6 mb-8 flex items-center justify-between shadow-xl">
          <div>
            <h1 className="font-poppins font-bold text-white text-[32px] mb-2">
              {t('admin.dashboard.title')}
            </h1>
            <p className="font-poppins text-gray-300 text-[14px]">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-black font-poppins font-semibold text-[14px] px-6 py-2 rounded-[12px] hover:bg-gray-200 transition-all shadow-lg"
          >
            {t('admin.dashboard.logout')}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-[12px] mb-6">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add/Edit Project Form */}
          <div className="bg-black border-2 border-white rounded-[20px] p-6 shadow-[0px_8px_16px_0px_rgba(255,255,255,0.2)]">
            <h2 className="font-poppins font-bold text-white text-[24px] mb-6">
              {editingId ? t('admin.dashboard.editProject') : t('admin.dashboard.addProject')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                  {t('admin.dashboard.projectTitle')} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                  {t('admin.dashboard.location')} *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                    {t('admin.dashboard.year')} *
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                    {t('admin.dashboard.category')} *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                  {t('admin.dashboard.description')} *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white resize-none placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                  {t('admin.dashboard.photos')} {formData.imagePreviews.length > 0 && `(${formData.imagePreviews.length} seçili)`}
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
                  required={formData.imagePreviews.length === 0}
                />
                <p className="font-poppins text-gray-400 text-[12px] mt-2">
                  Birden fazla resim seçebilirsiniz. Seçilen resimler aşağıda görünecektir.
                </p>
                {formData.imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="font-poppins text-gray-300 text-[12px] mb-2">
                      {formData.imagePreviews.length} {t('admin.dashboard.photosSelected')}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-[100px] object-cover rounded-[8px]"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[12px] hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-white text-black font-poppins font-semibold text-[16px] py-3 rounded-[12px] hover:bg-gray-200 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (t('admin.dashboard.saving') || 'Kaydediliyor...') : (editingId ? t('admin.dashboard.updateProject') : t('admin.dashboard.addProject'))}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: '',
                        location: '',
                        year: new Date().getFullYear().toString(),
                        description: '',
                        category: 'Commercial',
                        images: [],
                        imagePreviews: []
                      });
                    }}
                    className="flex-1 bg-gray-800 text-white border-2 border-white font-poppins font-semibold text-[16px] py-3 rounded-[12px] hover:bg-gray-700 transition-all"
                  >
                    {t('admin.dashboard.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Projects List */}
          <div className="bg-black border-2 border-white rounded-[20px] p-6 shadow-[0px_8px_16px_0px_rgba(255,255,255,0.2)]">
            <h2 className="font-poppins font-bold text-white text-[24px] mb-6">
              {t('admin.dashboard.existingProjects')} ({projects.length})
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-center font-poppins text-gray-300 py-8">
                  {t('admin.dashboard.noProjects')}
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-black rounded-[12px] p-4 border-2 border-white"
                  >
                    <div className="flex gap-4">
                      {(project.images?.[0] || project.image) && (
                        <div className="relative">
                          <img
                            src={project.images?.[0] || project.image}
                            alt={project.title}
                            className="w-[100px] h-[100px] object-cover rounded-[8px] grayscale"
                          />
                          {(project.images?.length > 1 || (project.images && project.images.length > 0)) && (
                            <div className="absolute bottom-1 right-1 bg-white text-black px-2 py-1 rounded-[4px] text-[10px] font-poppins font-semibold shadow-md">
                              +{((project.images?.length || 1) - 1)}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-poppins font-semibold text-white text-[16px] mb-1">
                          {project.title}
                        </h3>
                        <p className="font-poppins text-gray-300 text-[12px] mb-2">
                          {project.location} • {project.year} • {project.category}
                        </p>
                        <p className="font-poppins text-gray-400 text-[14px] line-clamp-2">
                          {project.description}
                        </p>
                        {project.images && project.images.length > 0 && (
                          <p className="font-poppins text-gray-300 text-[12px] mt-1">
                            📷 {project.images.length} photo(s)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(project)}
                        className="flex-1 bg-white text-black font-poppins font-semibold text-[12px] py-2 rounded-[8px] hover:bg-gray-200 transition-all shadow-md"
                      >
                        {t('admin.dashboard.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex-1 bg-black text-white border-2 border-white font-poppins font-semibold text-[12px] py-2 rounded-[8px] hover:bg-gray-900 transition-all shadow-md"
                      >
                        {t('admin.dashboard.delete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* News Management Section */}
        <div className="mt-12">
          <h2 className="font-poppins font-bold text-white text-[28px] mb-6 text-center">
            {t('news.title') || 'Haber Yönetimi'}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add/Edit News Form */}
            <div className="bg-black border-2 border-white rounded-[20px] p-6 shadow-[0px_8px_16px_0px_rgba(255,255,255,0.2)]">
              <h3 className="font-poppins font-bold text-white text-[24px] mb-6">
                {editingNewsId ? t('news.editNews') : t('news.addNews')}
              </h3>

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div>
                  <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                    {t('news.newsTitle')} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newsFormData.title}
                    onChange={handleNewsInputChange}
                    className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                    {t('news.newsContent')} *
                  </label>
                  <textarea
                    name="content"
                    value={newsFormData.content}
                    onChange={handleNewsInputChange}
                    rows={6}
                    className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white resize-none placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                    {t('news.newsDate')} *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newsFormData.date}
                    onChange={handleNewsInputChange}
                    className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
                    {t('news.newsImage')}
                  </label>
                  <input
                    type="file"
                    id="news-image-upload"
                    accept="image/*"
                    onChange={handleNewsImageChange}
                    className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-2 font-poppins text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
                  />
                  {newsFormData.imagePreview && (
                    <div className="mt-4">
                      <img
                        src={newsFormData.imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-[8px]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-white text-black font-poppins font-semibold text-[16px] py-3 rounded-[12px] hover:bg-gray-200 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (t('admin.dashboard.saving') || 'Kaydediliyor...') : (editingNewsId ? t('news.updateNewsButton') : t('news.addNewsButton'))}
                  </button>
                  {editingNewsId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNewsId(null);
                        setNewsFormData({
                          title: '',
                          content: '',
                          image: '',
                          imagePreview: '',
                          date: new Date().toISOString().split('T')[0]
                        });
                      }}
                      className="flex-1 bg-gray-800 text-white border-2 border-white font-poppins font-semibold text-[16px] py-3 rounded-[12px] hover:bg-gray-700 transition-all"
                    >
                      {t('admin.dashboard.cancel')}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* News List */}
            <div className="bg-black border-2 border-white rounded-[20px] p-6 shadow-[0px_8px_16px_0px_rgba(255,255,255,0.2)]">
              <h3 className="font-poppins font-bold text-white text-[24px] mb-6">
                {t('news.existingNews')} ({newsItems.length})
              </h3>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {newsItems.length === 0 ? (
                  <p className="text-center font-poppins text-gray-300 py-8">
                    {t('news.noNews')}
                  </p>
                ) : (
                  newsItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-black rounded-[12px] p-4 border-2 border-white"
                    >
                      <div className="flex gap-4">
                        {item.image && (
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-[100px] h-[100px] object-cover rounded-[8px] grayscale"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-poppins font-semibold text-white text-[16px] mb-1">
                            {item.title}
                          </h4>
                          <p className="font-poppins text-gray-300 text-[12px] mb-2">
                            {item.date ? new Date(item.date).toLocaleDateString('tr-TR') : 'Tarih yok'}
                          </p>
                          <p className="font-poppins text-gray-400 text-[14px] line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleNewsEdit(item)}
                          className="flex-1 bg-white text-black font-poppins font-semibold text-[12px] py-2 rounded-[8px] hover:bg-gray-200 transition-all shadow-md"
                        >
                          {t('admin.dashboard.edit')}
                        </button>
                        <button
                          onClick={() => handleNewsDelete(item.id)}
                          className="flex-1 bg-black text-white border-2 border-white font-poppins font-semibold text-[12px] py-2 rounded-[8px] hover:bg-gray-900 transition-all shadow-md"
                        >
                          {t('admin.dashboard.delete')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


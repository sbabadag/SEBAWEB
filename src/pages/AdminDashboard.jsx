import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

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

  useEffect(() => {
    // Check authentication
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
      navigate('/admin/login');
      return;
    }

    // Load projects from localStorage
    loadProjects();
  }, [navigate]);

  const loadProjects = () => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(previews => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...files],
          imagePreviews: [...prev.imagePreviews, ...previews]
        }));
      }).catch(error => {
        console.error('Error reading files:', error);
        alert('Resim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      });
      
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use the imagePreviews from form (which includes existing images when editing)
    // If editing, imagePreviews already contains existing images from handleEdit
    // If adding new, imagePreviews contains only new images
    const allImages = formData.imagePreviews.length > 0 ? formData.imagePreviews : [];
    
    const projectData = {
      id: editingId || Date.now(),
      title: formData.title,
      location: formData.location,
      year: formData.year,
      description: formData.description,
      category: formData.category,
      images: allImages,
      image: allImages[0] || '', // Keep for backward compatibility
      createdAt: editingId ? projects.find(p => p.id === editingId)?.createdAt : new Date().toISOString()
    };

    let updatedProjects;
    if (editingId) {
      updatedProjects = projects.map(p => p.id === editingId ? projectData : p);
      setEditingId(null);
    } else {
      updatedProjects = [...projects, projectData];
    }

    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    
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

    setSuccessMessage(editingId ? t('admin.dashboard.successUpdate') : t('admin.dashboard.successAdd'));
    setTimeout(() => setSuccessMessage(''), 3000);
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

  const handleDelete = (id) => {
    if (window.confirm(t('admin.dashboard.deleteConfirm'))) {
      const updatedProjects = projects.filter(p => p.id !== id);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      setSuccessMessage(t('admin.dashboard.successDelete'));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
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
                  className="flex-1 bg-white text-black font-poppins font-semibold text-[16px] py-3 rounded-[12px] hover:bg-gray-200 transition-all shadow-lg"
                >
                  {editingId ? t('admin.dashboard.updateProject') : t('admin.dashboard.addProject')}
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
      </div>
    </div>
  );
};

export default AdminDashboard;


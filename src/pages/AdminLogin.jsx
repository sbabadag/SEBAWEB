import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const AdminLogin = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Default admin password - in production, this should be handled securely
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuthenticated', 'true');
      navigate('/admin/dashboard');
    } else {
      setError(t('common.incorrectPassword'));
      setPassword('');
    }
  };

  return (
    <div className="bg-black min-h-screen w-full flex items-center justify-center">
      <div className="bg-black border-2 border-white rounded-[20px] p-8 w-full max-w-[400px] shadow-[0px_8px_16px_0px_rgba(255,255,255,0.2)]">
        <div className="text-center mb-8">
          <h1 className="font-poppins font-bold text-white text-[32px] mb-2">
            {t('admin.login.title')}
          </h1>
          <p className="font-poppins text-gray-300 text-[14px]">
            {t('admin.login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-poppins font-semibold text-white text-[14px] mb-2">
              {t('admin.login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-3 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
              placeholder={t('admin.login.enterPassword')}
              required
            />
          </div>

          {error && (
            <div className="bg-black border-2 border-white text-white px-4 py-3 rounded-[12px] text-[14px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black font-poppins font-semibold text-[16px] py-3 rounded-[12px] hover:bg-gray-200 transition-all shadow-lg"
          >
            {t('admin.login.login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-poppins text-gray-300 text-[12px]">
            {t('admin.login.defaultPassword')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;


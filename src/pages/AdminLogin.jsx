import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../config/supabase';

const AdminLogin = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Kimlik doğrulama Supabase Auth ile SUNUCU tarafında yapılır.
  // Şifre bu dosyada, pakette veya repoda tutulmaz; kullanıcı adı/şifre
  // Supabase dashboard'dan yönetilir ve veritabanında hash'lenmiş saklanır.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(t('common.incorrectPassword'));
      setPassword('');
      return;
    }

    navigate('/admin/dashboard');
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
              {t('admin.login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              autoComplete="username"
              className="w-full bg-black border-2 border-white rounded-[12px] px-4 py-3 font-poppins text-white text-[16px] focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-500"
              placeholder={t('admin.login.enterEmail')}
              required
            />
          </div>

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
              autoComplete="current-password"
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
            disabled={isLoading}
            className="w-full bg-white text-black font-poppins font-semibold text-[16px] py-3 rounded-[12px] hover:bg-gray-200 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? t('admin.login.loggingIn') : t('admin.login.login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

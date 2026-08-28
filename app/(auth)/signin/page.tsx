"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/src/api/auth';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type LoginError = {
  response?: { status?: number; data?: { message?: string } };
};

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/exams/8bcb5815-143b-489d-852c-aaa9134a7cd3/introduction';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);

      // Simpan token ke cookie
      if (response.token) {
        Cookies.set('token', response.token, { expires: 1, path: '/', sameSite: 'Lax' });
        
        if (response.user) {
          const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || 'elobright_secret_key';
          // Enkripsi data user
          const encryptedUser = CryptoJS.AES.encrypt(JSON.stringify(response.user), secretKey).toString();
          
          // Simpan data user yang sudah dienkripsi ke cookie
          Cookies.set('userData', encryptedUser, { expires: 1, path: '/', sameSite: 'Lax' });
          
          if (response.user.id) {
            Cookies.set('userId', response.user.id.toString(), { expires: 1, path: '/', sameSite: 'Lax' });
          }

        }

        // Tetap simpan di localStorage jika aplikasi masih membutuhkan
        localStorage.setItem('token', response.token);
        
        if (response.user) {
          const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || 'elobright_secret_key';
          const encryptedUser = CryptoJS.AES.encrypt(JSON.stringify(response.user), secretKey).toString();
          
          localStorage.setItem('userData', encryptedUser);
          
          if (response.user.id) {
            localStorage.setItem('userId', response.user.id.toString());
          }
        }
      }

      // Redirect berdasarkan role
      const adminRoles = ['admin', 'superadmin', 'reviewer', 'moderator'];
      if (response.user && adminRoles.includes(response.user.role)) {
        router.push('/admin/exams');
      } else {
        router.push(callbackUrl);
      }
    } catch (err: unknown) {
      const loginError = err as LoginError;
      const status = loginError.response?.status;
      const errorMessage = loginError.response?.data?.message || 'Login failed. Please check your credentials.';
      
      if (status === 403 || errorMessage.toLowerCase().includes('not verified')) {
        setError('Email not verified. Please verify your email first.');
        setUnverifiedEmail(formData.email);
      } else if (status === 401 || errorMessage.toLowerCase().includes('invalid email or password')) {
        setError('Email or password is incorrect.');
        setUnverifiedEmail('');
      } else {
        setError(errorMessage);
        setUnverifiedEmail('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 md:mb-10 text-left">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500 mb-2">Sign in to Elobright</h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">Welcome back! Please sign in to continue.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 md:p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-medium flex flex-col gap-2">
            <span>{error}</span>
            {unverifiedEmail && (
              <button 
                type="button" 
                onClick={() => router.push(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`)}
                className="text-left font-bold underline hover:text-red-800"
              >
                Verify Email Now
              </button>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              required
              className="w-full pl-11 pr-4 py-3 md:py-3.5 text-sm md:text-base text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs md:text-sm font-semibold text-slate-700">Password</label>
            <Link href="/forgot-password" className="text-xs md:text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              required
              className="w-full pl-11 pr-12 py-3 md:py-3.5 text-sm md:text-base text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400"
            />
            <div 
              className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 md:py-4 text-sm md:text-base text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-blue-300 disabled:to-blue-400 font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:active:scale-100"
          >
            {loading ? 'Signing in...' : 'Masuk'}
          </button>
        </div>
      </form>

      <p className="text-center mt-8 text-slate-500 font-medium text-sm md:text-base">
        Belum punya akun? <a href="/signup" className="text-blue-500 font-bold hover:text-blue-600 transition-colors">Daftar</a>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

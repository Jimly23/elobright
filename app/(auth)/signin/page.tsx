"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/src/api/auth';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);
      console.log('Login Response:', response);

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

          // Dekripsi kembali data untuk membuktikan bahwa di sisi frontend data dapat kembali seperti semula
          const decryptedBytes = CryptoJS.AES.decrypt(encryptedUser, secretKey);
          const decryptedUser = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
          console.log("Decrypted User Data dari Cookie:", decryptedUser);
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

      // Redirect ke callbackUrl jika ada, atau ke halaman utama
      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-1 md:mb-2">Sign in to Elobright</h1>
        <p className="text-slate-400 font-medium text-sm md:text-base">Welcome back! Please sign in to continue</p>
      </div>

      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-2.5 md:p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Email address</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
            className="w-full px-3.5 md:px-4 py-2.5 md:py-3.5 text-sm md:text-base text-black rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5 md:mb-2">
            <label className="block text-xs md:text-sm font-bold text-slate-700">Password</label>
          </div>
          <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="w-full px-3.5 md:px-4 py-2.5 md:py-3.5 text-sm md:text-base rounded-xl border text-black border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-2.5 md:space-y-3">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 md:py-4 text-sm md:text-base bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:active:scale-100"
          >
            {loading ? 'Signing in...' : 'Continue'}
          </button>
          {/* <button 
            type="button" 
            className="w-full py-3 md:py-4 text-sm md:text-base bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Continue with google
          </button> */}
        </div>

        <div className="flex items-center justify-between text-xs md:text-sm">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Stay signed in
          </label>
          <a href="#" className="text-slate-400 font-medium hover:text-blue-600 transition-colors">Forgot password?</a>
        </div>
      </form>

      <p className="text-center mt-6 md:mt-10 text-slate-500 font-medium text-sm md:text-base">
        Don&apos;t have an account? <a href="/signup" className="text-slate-900 font-bold hover:underline">Sign up</a>
      </p>
    </>
  );
}
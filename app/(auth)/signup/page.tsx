"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/src/api/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    role: 'user',
    type: 'student',
    student_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pastikan backend Anda siap menerima firstName & telp
      await authService.register({
        ...formData,
        type: formData.type as 'user' | 'student'
      });
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 md:mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500 mb-2">Create your account</h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">Welcome! Please fill in the details to get started.</p>
      </div>

      <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 md:p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        {/* Grid untuk Full Name & Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Full name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input 
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="w-full pl-10 pr-3 py-2.5 md:py-3 text-sm md:text-base text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input 
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0823-XXXX-XXXX"
                required
                className="w-full pl-10 pr-3 py-2.5 md:py-3 text-sm md:text-base text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">NIM</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <input 
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              placeholder="Enter your NIM"
              required
              className="w-full pl-11 pr-4 py-3 text-sm md:text-base text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              className="w-full pl-11 pr-4 py-3 text-sm md:text-base text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full pl-11 pr-12 py-3 text-sm md:text-base text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400"
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
            {loading ? 'Creating account...' : 'Daftar'}
          </button>
        </div>
      </form>

      <p className="text-center mt-6 md:mt-8 text-slate-500 font-medium text-sm md:text-base">
        Sudah punya akun? <a href="/signin" className="text-blue-500 font-bold hover:text-blue-600 transition-colors">Masuk</a>
      </p>
    </div>
  );
}
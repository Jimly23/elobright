"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/src/api/auth';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pastikan backend Anda siap menerima firstName & telp
      await authService.register(formData);
      router.push('/signin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center lg:text-left mb-5 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-1 md:mb-2">Create your account</h1>
        <p className="text-slate-400 font-medium text-xs md:text-base">Welcome! Please fill in the details to get started</p>
      </div>

      <form className="space-y-3.5 md:space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-2.5 md:p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        {/* Grid untuk Full Name & Phone Number */}
        <div className="grid grid-cols-2 gap-2.5 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Full name</label>
            <input 
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full name"
              required
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-black"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Phone Number</label>
            <input 
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="0823-XXXX-XXXX"
              required
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">NIM</label>
          <input 
            type="text"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            placeholder="Enter your NIM"
            required
            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-black"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Email address</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-black"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1 md:mb-2">Password</label>
          <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-black"
          />
        </div>

        <div className="pt-1 md:pt-2 space-y-2.5 md:space-y-3">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2.5 md:py-4 text-sm md:text-base bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:active:scale-100"
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
          
          {/* <button 
            type="button" 
            className="w-full py-2.5 md:py-4 text-sm md:text-base bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Continue with google
          </button> */}
        </div>
      </form>

      <p className="text-center mt-5 md:mt-8 text-slate-500 font-medium text-sm md:text-base">
        Already have an account? <a href="/signin" className="text-slate-900 font-bold hover:underline">Sign in</a>
      </p>
    </>
  );
}
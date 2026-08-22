"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/src/api/auth';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailParam) {
      setError('Email is missing.');
      return;
    }
    if (code.length !== 6) {
      setError('Code must be 6 digits.');
      return;
    }
    
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await authService.verifyEmail({ email: emailParam, code });
      setSuccessMsg('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailParam) return;
    setError('');
    setSuccessMsg('');
    setResendLoading(true);

    try {
      await authService.resendVerification({ email: emailParam });
      setSuccessMsg('Verification code has been resent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500 mb-2">Verify your email</h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">
          We have sent a 6-digit code to <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500 font-bold">{emailParam || 'your email'}</span>
        </p>
      </div>

      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 md:p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="p-3 md:p-4 rounded-xl bg-green-50 border border-green-200 text-green-600 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {successMsg}
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Verification Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <input 
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              required
              className="w-full pl-11 pr-4 py-3 md:py-3.5 text-center tracking-widest text-lg md:text-xl font-bold text-slate-700 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#292275] focus:ring-4 focus:ring-[#292275]/10 outline-none transition-all placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm md:placeholder:text-base placeholder:text-left"
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={loading || code.length !== 6 || !emailParam}
            className="w-full py-3.5 md:py-4 text-sm md:text-base text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-blue-300 disabled:to-blue-400 font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:active:scale-100"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm md:text-base font-medium mb-3">
          Didn't receive the email?
        </p>
        <button 
          onClick={handleResend}
          disabled={resendLoading || !emailParam}
          className="text-blue-500 font-bold hover:text-blue-600 disabled:text-slate-400 transition-colors"
        >
          {resendLoading ? 'Sending...' : 'Resend Code'}
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => router.push('/signin')}
          className="text-slate-400 font-medium hover:text-slate-600 transition-colors text-sm"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

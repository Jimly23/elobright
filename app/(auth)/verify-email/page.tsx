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
    <>
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-1 md:mb-2">Verify your email</h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">
          We have sent a 6-digit code to <br />
          <span className="text-slate-800 font-bold">{emailParam || 'your email'}</span>
        </p>
      </div>

      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-2.5 md:p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="p-2.5 md:p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {successMsg}
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Verification Code</label>
          <input 
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            required
            className="w-full px-3.5 md:px-4 py-2.5 md:py-3.5 text-center tracking-widest text-lg md:text-xl font-bold text-black rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal"
          />
        </div>

        <div className="space-y-2.5 md:space-y-3 pt-2">
          <button 
            type="submit"
            disabled={loading || code.length !== 6 || !emailParam}
            className="w-full py-3 md:py-4 text-sm md:text-base bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:active:scale-100"
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
          className="text-blue-600 font-bold hover:text-blue-700 disabled:text-slate-400 transition-colors"
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
    </>
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

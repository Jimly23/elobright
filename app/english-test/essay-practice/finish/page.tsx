"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, PenTool } from 'lucide-react';
import { exam } from '@/src/api/exam';
import EnglishTestNavbar from '@/src/components/EnglishTest/EnglishTestNavbar';
import { ESSAY_PRACTICE_ROUTES } from '@/src/constants/essayPractice';

export default function FinishEssayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const finishCalledRef = useRef(false);

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    if (finishCalledRef.current) return;
    finishCalledRef.current = true;

    const finishExamAndGetResult = async () => {
      try {
        const sessionId = localStorage.getItem('currentExamSessionId');
        const token = getCookie('token') || '';

        if (!sessionId) {
          setError('No active essay session found.');
          setLoading(false);
          return;
        }

        const response = await exam.finishExam(sessionId, token);
        setResult(response.session);
        
        localStorage.removeItem('currentExamSessionId');
      } catch (e: any) {
        const message = e?.response?.data?.message || e?.response?.data?.error;
        console.error('Error finishing essay practice:', e?.response?.data || e);
        setError(message || 'Failed to submit the essay. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    finishExamAndGetResult();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-white">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
          }}
        />
      </div>

      {/* Header Navigation */}
      <EnglishTestNavbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-8">
        {error ? (
          <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl p-10 text-center border border-white">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <span className="text-4xl font-bold">!</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">Submission Error</h2>
            <p className="text-slate-500 mb-8">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all"
            >
              Return Home
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white rounded-[28px] shadow-lg p-10 md:p-14 border border-slate-200 text-center">
            
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <PenTool size={40} className="text-blue-600" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
              Essay Complete!
            </h1>
            <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Great job finishing your essay practice! Your submission is complete and will be reviewed shortly.
            </p>

            {/* Review Status Card */}
            <div className="bg-white rounded-2xl p-8 mb-10 border border-slate-200">
              <div className="flex flex-col items-center">
                <span className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-3">Submission Status</span>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 size={26} className="text-emerald-400" />
                  <span className="text-2xl font-black tracking-tight text-slate-800">Submitted</span>
                </div>
                <p className="text-slate-600 text-sm text-center max-w-md">
                  Your essay has been sent successfully and is now waiting for review.
                </p>
                
                <div className="w-full h-px bg-slate-200 my-6" />
                
                <div className="flex justify-between w-full max-w-sm px-4">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status</span>
                    <span className="font-semibold text-emerald-400">Under Review</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Duration</span>
                    <span className="font-semibold text-slate-700">
                      {result?.startedAt && result?.submittedAt ? 
                        `${Math.round((new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime()) / 60000)} min` 
                      : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push(ESSAY_PRACTICE_ROUTES.home)}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Practice Again
              </button>
              <button 
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
              >
                Back to Home
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 mt-auto flex justify-center">
        <div className="bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm">
          <p className="text-slate-400 text-[11px] font-medium tracking-tight">
            © 2026 Elobright. All rights reserved
          </p>
        </div>
      </footer>
      
    </div>
  );
}
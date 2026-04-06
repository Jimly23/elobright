"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';
import { exam } from '@/src/api/exam';
import EnglishTestNavbar from '@/src/components/EnglishTest/EnglishTestNavbar';

export default function FinishTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    const finishExamAndGetResult = async () => {
      try {
        const sessionId = localStorage.getItem('currentExamSessionId');
        const token = getCookie('token') || '';

        if (!sessionId) {
          setError('No active exam session found.');
          setLoading(false);
          return;
        }

        // Call the finish API
        const response = await exam.finishExam(sessionId, token);
        setResult(response.session);
        
        // Bersihkan session ID dari localStorage
        localStorage.removeItem('currentExamSessionId');
      } catch (e: any) {
        console.error('Error finishing exam:', e);
        setError('Failed to submit the exam or retrieve results. Please contact support.');
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
      {/* Background Layer: Premium Glassmorphism Look */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-emerald-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-blob animation-delay-4000" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
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
          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-2xl shadow-blue-900/10 p-10 md:p-14 border border-white text-center transform transition-all duration-700 hover:scale-[1.01]">
            
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce-slow">
                <CheckCircle size={48} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/40">
                <Star size={16} className="text-white fill-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
              Exam Complete!
            </h1>
            <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Congratulations on finishing the TOEFL test! Your answers have been successfully submitted and recorded.
            </p>

            {/* Score Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-10 text-white relative overflow-hidden shadow-2xl border border-slate-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-blue-300 text-sm font-bold tracking-widest uppercase mb-2">Total Score</span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
                    {result?.totalScore || 0}
                  </span>
                  <span className="text-xl text-slate-400 font-medium">pts</span>
                </div>
                
                <div className="w-full h-px bg-white/10 my-6" />
                
                <div className="flex justify-between w-full max-w-sm px-4">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status</span>
                    <span className="font-semibold text-emerald-400 capitalize">{result?.status || 'Submitted'}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Duration</span>
                    <span className="font-semibold text-white">
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
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                View Dashboard
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
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}} />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { PenTool, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EnglishTestNavbar from '@/src/components/EnglishTest/EnglishTestNavbar';
import { exam } from '@/src/api/exam';

const TOEFL_ID = '11111111-0000-4000-8000-000000000001';

export default function WritingTestPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const wordTarget = 45;
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = getCookie('token') || '';
        const sections = await exam.sectionByExamId(TOEFL_ID, token);
        const writingSection = sections.find((s: any) => s.title.toLowerCase().includes('writing')) || sections.find((s:any) => s.orderIndex === 3) || sections[2];
        
        if (writingSection) {
          const qs = await exam.questionBySectionId(writingSection.id, token);
          setQuestions(qs);
        }
      } catch(e) {
        console.error('Failed to fetch writing questions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleContinue = async () => {
    if (!text.trim()) return; // Harus diisi
    setSubmitting(true);
    
    try {
      const sessionId = localStorage.getItem('currentExamSessionId');
      const token = getCookie('token') || '';
      
      if (sessionId && questions[currentQuestionIndex]) {
        await exam.recordAnswerEssay(sessionId, {
          questionId: questions[currentQuestionIndex].id,
          textResponse: text
        }, token);
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setText("");
      } else {
        router.push('/english-test/toefl/speaking');
      }
    } catch(e) {
      console.error('Error submitting answer:', e);
      // Pindah juga jika error terjadi untuk testing
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setText("");
      } else {
        router.push('/english-test/toefl/speaking');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Hitung jumlah kata sederhana
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const progressPercentage = Math.min((wordCount / wordTarget) * 100, 100);

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-white">
      {/* Background Layer: Gradient & Grid (Konsisten dengan tema Elobright) */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-white" />
        <div className="relative h-1/2 w-full bg-gradient-to-t from-blue-400 to-transparent">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      </div>

      {/* Header Navigation */}
      <EnglishTestNavbar 
        sectionName="Writing"
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 p-8 md:p-16 border border-slate-50">
          
          {/* Question Badge */}
          <div className="flex justify-center mb-10">
            <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-blue-100">
              Question {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-medium text-slate-700 text-center leading-relaxed mb-12">
            {loading ? 'Loading question...' : (questions[currentQuestionIndex]?.questionText || 'No question found.')}
          </h2>

          {/* Writing Area */}
          <div className="relative mb-6">
            <textarea
              className="w-full h-64 p-6 rounded-2xl border-2 border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-600 leading-relaxed resize-none"
              placeholder="Start writing your answer here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading || submitting}
            />
          </div>

          {/* Word Count Progress Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-700 text-sm font-bold">Target : {wordTarget} words</span>
              <span className="text-slate-400 text-sm font-medium">{wordCount} words</span>
            </div>
            {/* Progress Bar Kuning (Sesuai Gambar) */}
            <div className="w-full h-3 bg-orange-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button 
              onClick={handleContinue}
              disabled={!text.trim() || submitting || questions.length === 0}
              className="px-16 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:active:scale-100"
            >
              {submitting ? 'Submitting...' : 'Continue'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 flex justify-center">
        <div className="bg-white/90 backdrop-blur-md px-8 py-2 rounded-full border border-white/50 shadow-sm">
          <p className="text-slate-400 text-[11px] font-medium tracking-tight">
            © 2026 Elobright. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
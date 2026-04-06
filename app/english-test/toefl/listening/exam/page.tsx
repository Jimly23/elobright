"use client";

import React, { useState, useEffect } from 'react';
import { Headphones, Clock, Play, Pause, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EnglishTestNavbar from '@/src/components/EnglishTest/EnglishTestNavbar';
import { exam } from '@/src/api/exam';

const TOEFL_ID = '11111111-0000-4000-8000-000000000001';

export default function Page() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(48); // Timer mockup
  const totalDuration = 105; 

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        const listeningSection = sections.find((s: any) => s.title.toLowerCase().includes('listening')) || sections.find((s:any) => s.orderIndex === 2) || sections[1];
        
        if (listeningSection) {
          const qs = await exam.questionBySectionId(listeningSection.id, token);
          setQuestions(qs);
        }
      } catch(e) {
        console.error('Failed to fetch listening questions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      if (questions.length === 0) return;
      const q = questions[currentQuestionIndex];
      if (q) {
        if (q.options && q.options.length > 0) {
          setOptions(q.options);
        } else {
          try {
            const token = getCookie('token') || '';
            const opts = await exam.getOptionsByQuestionIdAttempt(q.id, token);
            setOptions(opts);
          } catch(e) {
            console.error('Failed to fetch options', e);
          }
        }
      }
    };
    fetchOptions();
  }, [currentQuestionIndex, questions]);

  const handleContinue = async () => {
    if (!selectedOption) return; // Harus pilih jawaban
    setSubmitting(true);
    
    try {
      const sessionId = localStorage.getItem('currentExamSessionId');
      const token = getCookie('token') || '';
      
      if (sessionId && questions[currentQuestionIndex]) {
        await exam.recordAnswerMCQ(sessionId, {
          questionId: questions[currentQuestionIndex].id,
          selectedOptionId: selectedOption
        }, token);
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        router.push('/english-test/toefl/writing');
      }
    } catch(e) {
      console.error('Error submitting answer:', e);
      // Pindah juga jika error terjadi untuk testing
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        router.push('/english-test/toefl/writing');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-white">
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="relative top-0 bottom-0 bg-gradient-to-b from-blue-50/50 to-white" />

        <div className="relative h-full w-full bg-gradient-to-t from-blue-300 to-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(147,197,253,0.3)_100%)]" />
        </div>
      </div>

      {/* Header Navigation */}
      <EnglishTestNavbar />

      {/* Main Content */}
      <main className="relative mt-20 z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 border border-slate-50 flex flex-col md:flex-row overflow-hidden min-h-[500px]">

          {/* Left Side: Audio Player & Instruction */}
          <div className="flex-1 p-8 md:p-12 border-r border-slate-100 flex flex-col justify-center">
            <div className="mb-8">
              <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-blue-100">
                Question {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1}
              </span>
            </div>

            <p className="text-xl text-slate-700 leading-relaxed mb-10 font-bold">
              {loading ? 'Loading question...' : (questions[currentQuestionIndex]?.questionText || 'No question found.')}
            </p>

            <p className="text-slate-500 font-medium mb-10 text-sm">
              Please listen to the audio carefully and select the best answer from the options on the right.
            </p>

            {/* Custom Audio Player Interface */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full border-4 border-blue-100 flex items-center justify-center text-blue-500 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
              </button>
              <div>
                <p className="text-slate-400 text-xs font-bold mb-1">Plays left : 1</p>
                <p className="text-slate-800 font-black text-lg">
                  {formatTime(progress)} / {formatTime(totalDuration)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Answer Section */}
          <div className="flex-1 p-8 md:p-12 bg-slate-50/30 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-slate-500 font-bold text-sm mb-4">Select an option</h4>
              {!loading && options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-100'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="listening-test"
                    className="hidden"
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                  />
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                     selectedOption === option.id ? 'border-white bg-white text-blue-500' : 'border-slate-300 bg-white'
                  }`}>
                    {selectedOption === option.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>

                  <span className={`text-lg font-bold ${selectedOption === option.id ? 'text-white' : 'text-slate-600'}`}>
                    {option.optionText || option.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-12 flex justify-end">
              <button 
                onClick={handleContinue}
                disabled={!selectedOption || submitting}
                className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:active:scale-100"
              >
                {submitting ? 'Submitting...' : 'Continue'}
              </button>
            </div>
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
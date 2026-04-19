"use client";

import React, { useState } from 'react';
import { exam } from '@/src/api/exam';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface EssayQuestionDisplayProps {
  question: any;
  currentIndex: number;
  onNext: () => void;
}

export default function EssayQuestionDisplay({ question, currentIndex, onNext }: EssayQuestionDisplayProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wordTarget = 45; // Match old layout constraint

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    
    try {
      const sessionId = localStorage.getItem('currentExamSessionId');
      const token = getCookie('token') || '';
      
      if (sessionId) {
        await exam.recordAnswerEssay(sessionId, {
          questionId: question.id,
          textResponse: text
        }, token);
      }
      onNext();
    } catch (e) {
      console.error('Error submitting answer:', e);
      onNext(); // Progress visually
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const progressPercentage = Math.min((wordCount / wordTarget) * 100, 100);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full">
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 p-8 md:p-16 border border-slate-50 mt-10">
        
        {/* Question Badge */}
        <div className="flex justify-center mb-10">
          <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-blue-100">
            Question {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-medium text-slate-700 text-center leading-relaxed mb-12">
          {question.questionText || 'No question found.'}
        </h2>

        {/* Writing Area */}
        <div className="relative mb-6">
          <textarea
            className="w-full h-64 p-6 rounded-2xl border-2 border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-600 leading-relaxed resize-none"
            placeholder="Start writing your answer here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Word Count Progress Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-700 text-sm font-bold">Target : {wordTarget} words</span>
            <span className="text-slate-400 text-sm font-medium">{wordCount} words</span>
          </div>
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
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="px-16 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:active:scale-100"
          >
            {submitting ? 'Submitting...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

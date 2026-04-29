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

interface LikertQuestionDisplayProps {
  question: any;
  currentIndex: number;
  onNext: () => void;
  onPrev?: () => void;
  isLastQuestion?: boolean;
  finishing?: boolean;
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Sangat Tidak Setuju', shortLabel: '1', emoji: '😞' },
  { value: 2, label: 'Tidak Setuju', shortLabel: '2', emoji: '😕' },
  { value: 3, label: 'Netral', shortLabel: '3', emoji: '😐' },
  { value: 4, label: 'Setuju', shortLabel: '4', emoji: '😊' },
  { value: 5, label: 'Sangat Setuju', shortLabel: '5', emoji: '😄' },
];

export default function LikertQuestionDisplay({
  question,
  currentIndex,
  onNext,
  onPrev,
  isLastQuestion,
  finishing,
}: LikertQuestionDisplayProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedValue === null) return;
    setSubmitting(true);

    try {
      const sectionSessionId = localStorage.getItem('currentSectionSessionId');
      const token = getCookie('token') || '';

      if (sectionSessionId) {
        // Submit as essay/text response with the Likert scale value
        await exam.recordAnswerEssay(sectionSessionId, {
          questionId: question.id,
          textResponse: String(selectedValue),
        }, token);
      }
      setSelectedValue(null);
      onNext();
    } catch (e) {
      console.error('Error submitting feedback:', e);
      setSelectedValue(null);
      onNext(); // Proceed anyway for resilience
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 mt-20 relative z-10 w-full">
      <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl shadow-teal-200/40 p-8 md:p-14 border border-slate-200">

        {/* Section badge */}
        <div className="mb-5">
          <span className="bg-teal-50 text-teal-600 text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-[0.15em] border border-teal-100">
            Pertanyaan {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
          </span>
        </div>

        {/* Question text */}
        <h2 className="text-lg md:text-xl font-medium text-slate-700 leading-relaxed mb-8 text-left">
          {question.questionText || 'No question found.'}
        </h2>

        {/* Likert Scale Options */}
        <div className="mb-8">
          {/* Desktop: Horizontal scale */}
          <div className="hidden md:flex items-stretch justify-between gap-3">
            {LIKERT_OPTIONS.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedValue(option.value)}
                  className={`flex-1 flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-200 scale-[1.05]'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/50 hover:scale-[1.02]'
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-300 ${isSelected ? 'scale-125' : ''}`}>
                    {option.emoji}
                  </span>
                  <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {option.value}
                  </span>
                  <span className={`text-[10px] font-bold leading-tight text-center ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile: Vertical list */}
          <div className="md:hidden space-y-3">
            {LIKERT_OPTIONS.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedValue(option.value)}
                  className={`w-full flex items-center gap-4 py-4 px-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-200'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/50'
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    isSelected ? 'border-white bg-white text-teal-500' : 'border-slate-300 text-slate-500'
                  }`}>
                    {option.value}
                  </div>
                  <span className={`font-bold text-sm text-left ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          {onPrev ? (
            <button
              onClick={onPrev}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-95"
            >
              ← Sebelumnya
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleSubmit}
            disabled={selectedValue === null || submitting || finishing}
            className="px-16 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:active:scale-100"
          >
            {submitting || finishing
              ? 'Mengirim...'
              : isLastQuestion
                ? 'Kirim & Lihat Hasil'
                : 'Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
}

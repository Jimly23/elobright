"use client";

import React, { useState, useEffect } from 'react';
import { exam } from '@/src/api/exam';
import QuestionFeaturedResources from '@/src/components/Exams/QuestionFeaturedResources';
import ExamCard from '@/src/components/Exams/ExamCard';
import { getCachedAnswer, setCachedAnswer } from '@/src/lib/examAnswerCache';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface McqQuestionDisplayProps {
  question: any;
  currentIndex: number;
  onNext: () => void;
  onPrev?: () => void;
  isLastQuestion?: boolean;
  finishing?: boolean;
  disabled?: boolean;
}

export default function McqQuestionDisplay({ question, currentIndex, onNext, onPrev, disabled }: McqQuestionDisplayProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch options if they aren't embedded in the question
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      if (question.options && question.options.length > 0) {
        setOptions(question.options);
        setLoading(false);
      } else {
        try {
          const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';
          const opts = await exam.getOptionsByQuestionIdAttempt(question.id, token);
          setOptions(opts);
        } catch (e) {
          console.error('Failed to fetch options', e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOptions();
    const sectionSessionId = localStorage.getItem('currentSectionSessionId') || '';
    setSelectedOption(getCachedAnswer(sectionSessionId, question.id)?.selectedOptionId ?? null);
  }, [question.id]);

  const handleSubmit = async () => {
    if (!selectedOption) return;
    setSubmitting(true);

    try {
      const sectionSessionId = localStorage.getItem('currentSectionSessionId');
      const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';

      if (sectionSessionId) {
        setCachedAnswer(sectionSessionId, question.id, { selectedOptionId: selectedOption });
        await exam.recordAnswerMCQ(sectionSessionId, {
          questionId: question.id,
          selectedOptionId: selectedOption
        }, token);
      }
      onNext();
    } catch (e) {
      console.error('Error submitting answer:', e);
      onNext(); // Proceed anyway for resilience / test mock
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-6 pt-[72px] md:pt-20 relative z-10 w-full">
      <ExamCard className="max-w-4xl flex-1 md:flex-none" contentClassName="p-6 md:p-16">

        <div className="mb-5 shrink-0">
          <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-[0.15em] border border-blue-100">
            Question {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
          </span>
        </div>

        <QuestionFeaturedResources imageUrl={question.imageUrl} narrativeText={question.narrativeText} />

        <h2 className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed mb-5 text-left shrink-0">
          {question.questionText || 'No question found.'}
        </h2>

        <div className="space-y-4 mb-5">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[56px] w-full bg-slate-100/70 rounded-2xl" />
              ))}
            </div>
          ) : (
            options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-4 py-3 px-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedOption === option.id
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-100'
                  : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="radio"
                  name="mcq-test"
                  className="hidden"
                  checked={selectedOption === option.id}
                  onChange={() => !disabled && setSelectedOption(option.id)}
                  disabled={disabled}
                />

                <div className={`w-6 h-6 min-w-6 min-h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedOption === option.id ? 'border-white bg-white text-blue-500' : 'border-slate-300 bg-white'
                  }`}>
                  {selectedOption === option.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                </div>

                <span className={`font-bold text-left ${selectedOption === option.id ? 'text-white' : 'text-slate-600'}`}>
                  {option.optionText || option.label}
                </span>
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-10 shrink-0">
          {onPrev ? (
            <button
              onClick={onPrev}
              className="px-4 py-2.5 text-xs md:px-8 md:py-4 md:text-base bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg md:rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-95"
            >
              ← Previous
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || submitting || loading || disabled}
            className="px-8 py-2.5 text-xs md:px-16 md:py-4 md:text-base bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg md:rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:active:scale-100"
          >
            {submitting ? 'Submitting...' : 'Continue'}
          </button>
        </div>
      </ExamCard>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { exam } from '@/src/api/exam';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface ListeningQuestionDisplayProps {
  question: any;
  currentIndex: number;
  onNext: () => void;
}

export default function ListeningQuestionDisplay({ question, currentIndex, onNext }: ListeningQuestionDisplayProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Audio Playback mockup states (To mirror the original exact look and feel)
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(48); // Timer mockup
  const totalDuration = 105;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      if (question.options && question.options.length > 0) {
        setOptions(question.options);
        setLoading(false);
      } else {
        try {
          const token = getCookie('token') || '';
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
    setSelectedOption(null);
    setIsPlaying(false);
  }, [question.id]);

  const handleSubmit = async () => {
    if (!selectedOption) return;
    setSubmitting(true);

    try {
      const sessionId = localStorage.getItem('currentExamSessionId');
      const token = getCookie('token') || '';

      if (sessionId) {
        await exam.recordAnswerMCQ(sessionId, {
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
    <div className="flex-1 flex items-center justify-center p-6 mt-20 relative z-10 w-full">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 border border-slate-50 flex flex-col md:flex-row overflow-hidden min-h-[500px]">

        {/* Left Side: Audio Player & Instruction */}
        <div className="flex-1 p-8 md:p-12 border-r border-slate-100 flex flex-col justify-center">
          <div className="mb-8">
            <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-blue-100">
              Question {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
            </span>
          </div>

          <p className="text-xl text-slate-700 leading-relaxed mb-10 font-bold">
            {question.questionText || 'No question found.'}
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
            {loading ? (
              <div className="text-slate-400">Loading options...</div>
            ) : (
              options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedOption === option.id
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

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === option.id ? 'border-white bg-white text-blue-500' : 'border-slate-300 bg-white'
                    }`}>
                    {selectedOption === option.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>

                  <span className={`text-lg font-bold ${selectedOption === option.id ? 'text-white' : 'text-slate-600'}`}>
                    {option.optionText || option.label}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-12 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || submitting || loading}
              className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:active:scale-100"
            >
              {submitting ? 'Submitting...' : 'Continue'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

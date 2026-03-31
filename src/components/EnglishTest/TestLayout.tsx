"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Headphones, PenTool, Mic2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Option {
  id: string;
  label: string;
}

export interface TestQuestion {
  id: string;
  questionText: string;
  questionType: string;
  narrativeText?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  points: number;
}

interface TestLayoutProps {
  sectionName: string;
  sectionColor: string;
  sectionIcon: React.ReactNode;
  questions: TestQuestion[];
  durationMinutes: number;
  nextRoute: string;         // where to go after finishing this section
  nextSectionName?: string;  // for the "Finished" card
  onFinish?: () => void;
}

const SECTION_BAR_ICONS: Record<string, React.ReactNode> = {
  Reading:   <BookOpen size={20} />,
  Listening: <Headphones size={20} />,
  Writing:   <PenTool size={20} />,
  Speaking:  <Mic2 size={20} />,
};

const COLOR_MAP: Record<string, string> = {
  Reading:   'text-blue-600',
  Listening: 'text-indigo-600',
  Writing:   'text-violet-600',
  Speaking:  'text-purple-600',
};

const BG_MAP: Record<string, string> = {
  Reading:   'bg-blue-500',
  Listening: 'bg-indigo-500',
  Writing:   'bg-violet-500',
  Speaking:  'bg-purple-500',
};

const SHADOW_MAP: Record<string, string> = {
  Reading:   'shadow-blue-200',
  Listening: 'shadow-indigo-200',
  Writing:   'shadow-violet-200',
  Speaking:  'shadow-purple-200',
};

function generateOptions(question: TestQuestion): Option[] {
  // For demo MCQ options based on question index (replace with real options from API when available)
  const base = [
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B' },
    { id: 'c', label: 'Option C' },
    { id: 'd', label: 'Option D' },
  ];
  return base;
}

export default function TestLayout({
  sectionName,
  questions,
  durationMinutes,
  nextRoute,
  nextSectionName,
}: TestLayoutProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // in seconds

  const colorClass = COLOR_MAP[sectionName] ?? 'text-blue-600';
  const bgClass = BG_MAP[sectionName] ?? 'bg-blue-500';
  const shadowClass = SHADOW_MAP[sectionName] ?? 'shadow-blue-200';

  // Timer countdown
  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const options = currentQuestion ? generateOptions(currentQuestion) : [];

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, questions.length]);

  // ── Finished card ──────────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white font-sans px-4">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-blue-100 p-12 flex flex-col items-center text-center">
          <div className={`w-20 h-20 ${bgClass} text-white rounded-full flex items-center justify-center mb-6 shadow-xl ${shadowClass}`}>
            {SECTION_BAR_ICONS[sectionName]}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{sectionName} Complete!</h2>
          <p className="text-slate-400 text-sm mb-8">
            {nextSectionName
              ? `Great job! Next up is the ${nextSectionName} section.`
              : 'You have completed all sections. Congratulations!'}
          </p>
          <button
            onClick={() => router.push(nextRoute)}
            className={`w-full py-4 ${bgClass} hover:opacity-90 text-white font-bold rounded-2xl shadow-lg ${shadowClass} transition-all active:scale-[0.98] text-lg`}
          >
            {nextSectionName ? `Continue to ${nextSectionName}` : 'View Results'}
          </button>
        </div>
        <footer className="mt-8 py-2 px-6 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
          <p className="text-slate-400 text-xs font-medium">© 2026 Elobright. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // ── No questions fallback ──────────────────────────────────────────────────
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">No questions found for this section.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-white" />
        <div className="relative h-1/2 w-full bg-gradient-to-t from-blue-400 to-transparent">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Section label */}
          <div className="flex items-center gap-3">
            <div className={colorClass}>{SECTION_BAR_ICONS[sectionName]}</div>
            <span className="font-bold text-slate-800">{sectionName}</span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 max-w-2xl mx-12 flex items-center gap-4">
            <div className="flex-1 h-3 bg-blue-50 rounded-full overflow-hidden">
              <div
                className={`h-full ${bgClass} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
              {currentIndex + 1}/{questions.length}
            </span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3 border-l pl-8 border-slate-200">
            <div className={timeLeft < 60 ? 'text-red-500' : colorClass}>
              <Clock size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 leading-none">{formatTime(timeLeft)}</span>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">time left</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-blue-100/50 p-10 md:p-16">

          {/* Narrative / passage text */}
          {currentQuestion.narrativeText && (
            <div className="mb-8 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 text-sm leading-relaxed italic">
              {currentQuestion.narrativeText}
            </div>
          )}

          {/* Audio */}
          {currentQuestion.audioUrl && (
            <div className="mb-8">
              <audio controls src={currentQuestion.audioUrl} className="w-full rounded-xl" />
            </div>
          )}

          {/* Image */}
          {currentQuestion.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentQuestion.imageUrl} alt="question visual" className="w-full rounded-2xl mb-8 object-cover max-h-60" />
          )}

          {/* Question label */}
          <div className="mb-6">
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${bgClass} text-white border-transparent`}>
              Question {currentIndex + 1}
            </span>
          </div>

          {/* Question text */}
          <p className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed mb-10">
            {currentQuestion.questionText}
          </p>

          {/* MCQ Options */}
          {currentQuestion.questionType === 'mcq' && (
            <div className="space-y-4 mb-10">
              {options.map(option => {
                const isSelected = selectedOptions[currentIndex] === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? `border-transparent ${bgClass} text-white shadow-lg ${shadowClass}`
                        : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentIndex}`}
                      className="hidden"
                      checked={isSelected}
                      onChange={() =>
                        setSelectedOptions(prev => ({ ...prev, [currentIndex]: option.id }))
                      }
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'border-white bg-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className={`w-2.5 h-2.5 ${bgClass} rounded-full`} />}
                    </div>
                    <span className="font-semibold capitalize">{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Essay / speaking placeholder */}
          {(currentQuestion.questionType === 'essay' || currentQuestion.questionType === 'speaking') && (
            <textarea
              className="w-full border-2 border-slate-100 rounded-2xl p-5 text-slate-700 resize-none h-36 mb-10 focus:outline-none focus:border-blue-300 transition-colors"
              placeholder={currentQuestion.questionType === 'speaking' ? 'Type your spoken response here...' : 'Write your answer here...'}
            />
          )}

          {/* Next / Continue button */}
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className={`px-16 py-4 ${bgClass} hover:opacity-90 text-white font-bold rounded-2xl shadow-xl ${shadowClass} transition-all active:scale-95`}
            >
              {currentIndex < questions.length - 1 ? 'Next' : 'Finish Section'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mb-8 flex justify-center">
        <div className="bg-white/90 backdrop-blur-md px-8 py-2 rounded-full border border-white shadow-sm">
          <p className="text-slate-400 text-[11px] font-medium">© 2026 Elobright. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

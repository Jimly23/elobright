"use client";

import React from 'react';
import { BookOpen, Headphones, PenTool, Mic2 } from 'lucide-react';

interface SectionIntroPageProps {
  sectionName: string;
  duration: string;
  questionCount: number;
  onStart: () => void;
}

const SECTION_META: Record<string, { icon: React.ReactNode; color: string; shadow: string }> = {
  Reading:   { icon: <BookOpen size={32} />,   color: 'bg-blue-500',   shadow: 'shadow-blue-200' },
  Listening: { icon: <Headphones size={32} />, color: 'bg-indigo-500', shadow: 'shadow-indigo-200' },
  Writing:   { icon: <PenTool size={32} />,    color: 'bg-violet-500', shadow: 'shadow-violet-200' },
  Speaking:  { icon: <Mic2 size={32} />,       color: 'bg-purple-500', shadow: 'shadow-purple-200' },
};

export default function SectionIntroPage({ sectionName, duration, questionCount, onStart }: SectionIntroPageProps) {
  const meta = SECTION_META[sectionName] ?? SECTION_META['Reading'];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-gradient-to-b from-blue-50/50 to-white" />
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

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6">
        {/* Header */}
        <div className="pt-10 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-6">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]" />
          <h1 className="text-3xl font-bold text-slate-900 relative z-10">Get Ready</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm relative z-10">Next section is starting</p>
        </div>

        <div className="p-10 flex flex-col items-center">
          {/* Section icon */}
          <div className={`w-20 h-20 ${meta.color} text-white rounded-full flex items-center justify-center mb-4 shadow-xl ${meta.shadow}`}>
            {meta.icon}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1">{sectionName}</h2>
          <p className="text-slate-400 text-sm mb-1">{duration}</p>
          <p className="text-slate-400 text-sm mb-10">
            {questionCount > 0 ? `${questionCount} questions` : 'Loading questions…'}
          </p>

          {/* Tips */}
          <ul className="space-y-2.5 w-full mb-10">
            {[
              "Read each question carefully before answering.",
              "You cannot go back once you submit an answer.",
              "Make sure your environment is quiet and distraction-free.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-slate-500 text-[12px] leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>

          <button
            onClick={onStart}
            className={`w-full py-4 ${meta.color} hover:opacity-90 text-white font-bold rounded-2xl shadow-lg ${meta.shadow} transition-all active:scale-[0.98] text-lg`}
          >
            Start {sectionName}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-8 py-2 px-6 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
        <p className="text-slate-400 text-xs font-medium">© 2026 Elobright. All rights reserved.</p>
      </footer>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { BookOpen, Clock, Check } from 'lucide-react';

export default function Page() {
  const [selectedOption, setSelectedOption] = useState<string | null>('stunning');

  const options = [
    { id: 'suitable', label: 'suitable' },
    { id: 'stunning', label: 'stunning' },
    { id: 'marvelous', label: 'marvelous' },
    { id: 'miraculous', label: 'miraculous' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-white">
      {/* Background Layer: Gradient & Grid (Konsisten dengan desain Elobright) */}
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

      {/* Header / Test Navigation Bar */}
      <header className="relative z-10 bg-white border-b border-slate-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Section Info */}
          <div className="flex items-center gap-3">
            <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-slate-800">Reading</span>
          </div>

          {/* Progress Bar Group */}
          <div className="flex-1 max-w-2xl mx-8 flex items-center gap-4">
            <div className="flex-1 h-2.5 bg-blue-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: '45.7%' }} 
              />
            </div>
            <span className="text-sm font-bold text-slate-500 whitespace-nowrap">16/35</span>
          </div>

          {/* Timer Group */}
          <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
            <div className="text-blue-500">
              <Clock size={24} />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-base font-black text-slate-800">16.43 min</span>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">time left</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 p-8 md:p-16 border border-slate-50">
          
          {/* Question Number Badge */}
          <div className="mb-10">
            <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-[0.15em] border border-blue-100">
              Question 01
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed mb-12">
            She is a ______ best grades of her class. student who always has the She is a best grades of her class. student who always has the
          </h2>

          {/* Options Grid */}
          <div className="space-y-4 mb-12">
            {options.map((option) => (
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
                  name="reading-test"
                  className="hidden"
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                />
                
                {/* Custom Radio Circle */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                   selectedOption === option.id ? 'border-white bg-white text-blue-500' : 'border-slate-300 bg-white'
                }`}>
                  {selectedOption === option.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                </div>

                <span className={`text-lg font-bold ${selectedOption === option.id ? 'text-white' : 'text-slate-600'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button className="px-16 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300">
              Continue
            </button>
          </div>
        </div>
      </main>

      {/* Floating Footer Footer */}
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
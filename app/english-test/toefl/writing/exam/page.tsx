"use client";

import React, { useState, useEffect } from 'react';
import { PenTool, Clock } from 'lucide-react';
import EnglishTestNavbar from '@/src/components/EnglishTest/EnglishTestNavbar';

export default function WritingTestPage() {
  const [text, setText] = useState("");
  const wordTarget = 45;
  
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
      <EnglishTestNavbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 p-8 md:p-16 border border-slate-50">
          
          {/* Question Badge */}
          <div className="flex justify-center mb-10">
            <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-blue-100">
              Question 03
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-medium text-slate-700 text-center leading-relaxed mb-12">
            She is a best grades of her class. student who always has the She is a best grades of her class. student who always has the
          </h2>

          {/* Writing Area */}
          <div className="relative mb-6">
            <textarea
              className="w-full h-64 p-6 rounded-2xl border-2 border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-600 leading-relaxed resize-none"
              placeholder="Start writing your answer here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
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
            <button className="px-16 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95">
              Continue
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
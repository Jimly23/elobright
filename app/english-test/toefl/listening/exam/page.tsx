"use client";

import React, { useState } from 'react';
import { Headphones, Clock, Play, Pause, ChevronDown } from 'lucide-react';

export default function Page() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(48); // Detik saat ini (00:48)
  const totalDuration = 105; // Total 01:45 dalam detik

  // Format waktu ke MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-white">
      {/* Background Layer: Gradient & Grid (Konsisten dengan Elobright) */}
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
      <header className="relative z-10 bg-white border-b border-slate-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
              <Headphones size={20} />
            </div>
            <span className="font-bold text-slate-800">Listening</span>
          </div>

          <div className="flex-1 max-w-2xl mx-8 flex items-center gap-4">
            <div className="flex-1 h-2.5 bg-blue-50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[45.7%]" />
            </div>
            <span className="text-sm font-bold text-slate-500">16/35</span>
          </div>

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

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 border border-slate-50 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
          
          {/* Left Side: Audio Player & Instruction */}
          <div className="flex-1 p-8 md:p-12 border-r border-slate-100">
            <div className="mb-8">
              <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-blue-100">
                Question 06
              </span>
            </div>

            <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
              You will hear 6 different recorded announcements from an electric company. 
              Read the 8 options and decide which one matches each announcement.
            </p>
            
            <p className="text-slate-900 font-bold mb-10">
              You can play the recording TWO times.
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
            <div className="space-y-8">
              {/* Announcement Item 2 (Selected State) */}
              <div>
                <h4 className="text-slate-500 font-bold text-sm mb-3">Announcement 2</h4>
                <div className="bg-white rounded-xl border border-blue-200 shadow-lg shadow-blue-100 overflow-hidden">
                  <div className="p-4 text-slate-400 text-sm border-b border-slate-50">choose an option</div>
                  <div className="p-4 bg-blue-500 text-white text-sm font-bold flex justify-between items-center">
                    choose an option
                    <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 text-slate-400 text-sm">choose an option</div>
                </div>
              </div>

              {/* Announcement Item 3 (Default State) */}
              <div>
                <h4 className="text-slate-500 font-bold text-sm mb-3">Announcement 3</h4>
                <div className="w-full p-4 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-slate-400 text-sm cursor-pointer hover:border-blue-300 transition-colors">
                  choose an option
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-12 flex justify-end">
              <button className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95">
                Continue
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
"use client";

import { useState } from 'react';
import { BookOpen, Headphones, Timer } from 'lucide-react';
import Link from 'next/link';

export default function Page({ onStart }: { onStart: () => void }) {
  return (
    <div className='flex justify-center items-center min-h-screen'>
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

      <div className="relative z-10 w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6">
        <div className="pt-10 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-6">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]" />
          <h1 className="text-3xl font-bold text-slate-900 relative z-10">Get Ready</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm relative z-10">Next section is starting</p>
        </div>

        <div className="p-10 flex flex-col items-center">
          <div className={`w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-blue-100`}>
            <BookOpen size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Listening</h2>
          <p className="text-slate-400 text-sm mb-1">15 mins</p>
          <p className="text-slate-400 text-sm mb-10">10 questions</p>

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

          <Link href="/english-test/toefl/listening/exam" className='w-full'>
            <button
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] text-lg"
            >
              Start
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

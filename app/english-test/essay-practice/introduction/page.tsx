import React from 'react';
import { PenTool } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden pt-10">
      {/* Background Gradient & Grid */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-gradient-to-b from-blue-50/50 to-white" />
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

      {/* Welcome Card */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-[40px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6">
        {/* Sky Header Image */}
        <div className="pt-10 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-4">
           <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]" />
           <h1 className="text-4xl font-bold text-slate-900 relative z-10">Welcome</h1>
           <p className="text-slate-500 font-medium mt-2 relative z-10">You are about to start the essay practice</p>
        </div>

        <div className="p-10 md:p-14">
          {/* Test Icon */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-violet-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-violet-200">
                <PenTool size={28} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Essay Writing</h3>
              <p className="text-slate-400 text-sm">60 mins</p>
            </div>
          </div>

          {/* Instructions List */}
          <ul className="space-y-3 mb-12">
            {[
              "Check you will have enough time to complete the essay before you begin. Once you begin, you cannot pause or restart.",
              "You can practice as many times as you like. There is no limit on attempts.",
              "Write at least 250 words for each essay. A word count indicator is provided.",
              "Once you submit an essay, you cannot go back to change it.",
              "Take your time to plan, write, and revise your essay before submitting."
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-slate-600 text-[13px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 bg-slate-900 rounded-full flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          {/* Continue Button */}
          <Link href={'/english-test/essay-practice/writing'}>
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
              Continue
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="relative z-10 mt-8 py-2 px-6 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
        <p className="text-slate-400 text-xs font-medium">© 2026 Elobright. All rights reserved.</p>
      </footer>
    </div>
  );
}
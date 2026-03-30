import React from 'react';
import { ArrowRight } from 'lucide-react';

const testCards = [
  {
    title: 'TOEFL Test',
    description: 'Our Most Complete English Test Reading, Writing, Listening & Speaking',
    type: 'TOEFL',
  },
  {
    title: 'IELTS Test',
    description: 'Certify Your English Test Reading, Writing, & Listening Skills',
    type: 'IELTS',
  },
];

export default function FeaturedSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Badge & Title */}
        <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100 shadow-sm">
          Featured English Test
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-16 tracking-tight">
          Test your English now
        </h2>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {testCards.map((test) => (
            <div
              key={test.type}
              className="relative group p-10 md:p-14 rounded-[40px] bg-gradient-to-b from-blue-400 to-white/10 flex flex-col items-center overflow-hidden border border-blue-50/50 shadow-[0_20px_50px_rgba(186,230,253,0.3)] transition-transform hover:-translate-y-2"
            >
              {/* Background Illustration (Document Icons) */}
              <div className="relative w-full h-48 mb-10 flex justify-center items-end">
                {/* Secondary paper (left) */}
                <div className="absolute left-1/2 -translate-x-[110%] bottom-2 w-32 h-44 bg-white/60 rounded-2xl rotate-[-8deg]" />
                {/* Secondary paper (right) */}
                <div className="absolute left-1/2 translate-x-[10%] bottom-2 w-32 h-44 bg-white/60 rounded-2xl rotate-[8deg]" />
                {/* Main Paper */}
                <div className="relative z-10 w-40 h-56 bg-white rounded-2xl shadow-xl flex flex-col p-6 text-left">
                  <span className="text-gray-100 font-black text-3xl mb-4 italic tracking-widest">
                    {test.type}
                  </span>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-gray-50 rounded-full" />
                    <div className="h-2 w-5/6 bg-gray-50 rounded-full" />
                    <div className="h-2 w-full bg-gray-50 rounded-full" />
                    <div className="h-2 w-4/6 bg-gray-50 rounded-full" />
                    <div className="h-2 w-full bg-gray-50 rounded-full" />
                    <div className="h-2 w-3/4 bg-gray-50 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                {test.title}
              </h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-[280px]">
                {test.description}
              </p>

              {/* Black Button */}
              <button className="flex items-center gap-2 px-8 py-3 bg-[#222] hover:bg-black text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95">
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
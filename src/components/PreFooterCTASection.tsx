import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PreFooterCTASection() {
  return (
    <section className="relative pt-24 pb-0 px-6 bg-white overflow-hidden text-center">
      {/* Container Teks */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight tracking-tight mb-8">
          Start your first <br />
          <span className="relative inline-block">
            {/* Blue Highlight Overlay */}
            <span className="absolute hidden md:block inset-x-[-15px] inset-y-1 bg-blue-50 rounded-2xl -rotate-1" />
            <span className="relative">English test Now!</span>
            {/* Blue Tag 'Eloo' */}
            <span className="absolute hidden md:block -right-10 -top-4 bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-md font-black rotate-12 shadow-sm">
              Eloo
            </span>
          </span>
        </h2>

        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Take this 20-question practice test to familiarize yourself with the EF SET format and prepare for a certifying test.
        </p>

        {/* Action Button */}
        {/* <div className="flex justify-center mb-20">
          <button className="group flex items-center gap-3 px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95">
            Get Access 
            <Sparkles size={20} className="group-hover:animate-pulse" />
          </button>
        </div> */}
      </div>

      {/* Maskot / Image Section */}
      <div className="relative w-full max-w-3xl mx-auto mt-10">
        {/* Efek Glow di belakang maskot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Maskot Image Placeholder */}
        <div className="relative z-10 flex justify-center">
          <img 
            src="/logo/maskot.png"
            alt="Elobright Mascot" 
            className="w-full h-auto object-contain max-h-[400px]"
          />
        </div>
      </div>
    </section>
  );
}
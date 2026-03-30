import React from 'react';
import { Zap } from 'lucide-react';

export default function NeedMoreTimeSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Heading */}
        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight">
          Need More Time?
        </h2>

        {/* Description */}
        <p className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Test only your reading and listening skills and earn an EF SET <br className="hidden md:block" />
          certificate in less than an hour
        </p>

        {/* Dark Glassy CTA Button */}
        <div className="flex justify-center">
          <button className="group flex items-center gap-3 px-10 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
            Get Access 
            <Zap size={18} fill="currentColor" className="text-white group-hover:animate-pulse" />
          </button>
        </div>
      </div>

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
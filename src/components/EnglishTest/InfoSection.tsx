import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function InfoSection({url}: {url: string}) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Side: Illustration Placeholder */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square rounded-[40px] bg-gradient-to-br from-blue-400 to-blue-50 overflow-hidden shadow-2xl shadow-blue-100 flex items-center justify-center p-12">
              {/* Decorative Paper Elements */}
              <div className="relative w-full h-full bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-inner flex flex-col p-8 space-y-4">
                <div className="text-blue-200 font-black text-6xl tracking-tighter opacity-50">TOEFL</div>
                <div className="h-2 w-3/4 bg-blue-100/50 rounded-full" />
                <div className="h-2 w-full bg-blue-100/50 rounded-full" />
                <div className="h-2 w-5/6 bg-blue-100/50 rounded-full" />
                <div className="h-2 w-2/3 bg-blue-100/50 rounded-full" />
              </div>
              
              {/* Floating Badge (Optional decorative) */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100 shadow-sm">
                TOEFL English Test
              </span>
              <h2 className="text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                Free TOEFL English <br />
                certification test
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                Certify all your English skills at once: speaking, writing, listening and reading. 
                All four skills will be shown on your Elobright certificate.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-5">
              {[
                "Get A Complete Diagnostic Of Your English Skills",
                "Instantly Get A Personalized Elobright Certificate That Proves Your Level",
                "Like All Our Tests, This One Is 100% Free"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="mt-1">
                    <Check size={18} className="text-slate-900 group-hover:text-blue-500 transition-colors" strokeWidth={3} />
                  </div>
                  <span className="text-slate-700 font-bold text-[15px] leading-snug">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link href={url}>
                <button className="group flex items-center gap-3 px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95">
                  Start Test
                  <Sparkles size={20} fill="currentColor" className="group-hover:animate-pulse" />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
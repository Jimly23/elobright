import React from 'react';
import { BookOpen, Headphones, PenTool, Mic2 } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  const testSections = [
    { icon: <BookOpen size={24} />, title: 'Reading', duration: '20 mins' },
    { icon: <Headphones size={24} />, title: 'Listening', duration: '20 mins' },
    { icon: <PenTool size={24} />, title: 'Writing', duration: '20 mins' },
  ];

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
           {/* Simulasi Awan (Bisa diganti dengan file image awan Anda) */}
           <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]" />
           <h1 className="text-4xl font-bold text-slate-900 relative z-10">Welcome</h1>
           <p className="text-slate-500 font-medium mt-2 relative z-10">You are about to start the test</p>
        </div>

        <div className="p-10 md:p-14">
          {/* Test Icons */}
          <div className="grid grid-cols-3 gap-3 mb-12">
            {testSections.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">{item.title}</h3>
                <p className="text-slate-400 text-[10px] md:text-xs">{item.duration}</p>
              </div>
            ))}
          </div>

          {/* Instructions List */}
          <ul className="space-y-3 mb-12">
            {[
              "Check you will have enough time to complete the whole test before you begin. Once you begin the test, you cannot pause the timer or restart the test. You can take very short breaks between test sections if needed. These breaks are also timed.",
              "You can only take the test once. You cannot repeat the test to practice.",
              "If your internet connection isn't stable, you may not be able to complete the test. Partial tests are not saved.",
              "You will receive points for every correct answer.",
              "Once you submit an exercise, you cannot go back."
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-slate-600 text-[13px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 bg-slate-900 rounded-full flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          {/* Continue Button */}
          <Link href={'/english-test/toefl/reading'}>
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
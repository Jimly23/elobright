"use client";

import { useState } from 'react';
import { BookOpen, Timer } from 'lucide-react';
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
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Reading</h2>
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


          <Link href="/english-test/toefl/reading/exam" className='w-full'>
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

function ReadingTest() {
  const [selected, setSelected] = useState<string | null>('stunning');

  const options = [
    { id: 'suitable', label: 'suitable' },
    { id: 'stunning', label: 'stunning' },
    { id: 'marvelous', label: 'marvelous' },
    { id: 'miraculous', label: 'miraculous' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-blue-50 overflow-x-hidden">
      {/* Background */}
      {/* <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-white" />
        <div className="relative h-1/2 w-full bg-gradient-to-t from-[#89C0FF] to-blue-50/20">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      </div> */}

      {/* Header */}
      <header className="relative z-10 bg-white border-b-[3px] border-[#0080FF] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Section info */}
          <div className="flex items-center gap-3 w-48">
            <div className="text-[#0080FF]">
              <BookOpen size={24} />
            </div>
            <span className="font-bold text-slate-800 text-lg">Reading</span>
          </div>

          {/* Progress bar centered */}
          <div className="flex-1 flex items-center justify-center gap-6">
            <div className="w-full max-w-xl h-2.5 bg-[#E5F0FF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4080FF] rounded-full transition-all duration-500"
                style={{ width: `${(16 / 35) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
              16/35
            </span>
          </div>

          {/* Timer right */}
          <div className="flex items-center justify-end gap-3 border-l px-6 border-slate-200 w-48">
            <div className="text-[#0080FF]">
              <Timer size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 leading-none">16.43 min</span>
              <span className="text-[9px] text-red-500 font-bold tracking-tight self-end mt-0.5">time left</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 mt-4">
        <div className="w-full max-w-[52rem] bg-white rounded-3xl shadow-2xl shadow-blue-200/50 p-12 md:px-14 md:py-12">

          {/* Question Tag */}
          <div className="mb-6">
            <span className="text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider bg-[#E5F0FF] text-[#0080FF]">
              QUESTION 01
            </span>
          </div>

          {/* Question Text */}
          <p className="text-lg md:text-[20px] font-medium text-slate-700 leading-relaxed mb-10 w-11/12">
            She is a _____ best grades of her class. student who always has the She is a best grades of her class. student who always has the
          </p>

          {/* Options */}
          <div className="space-y-4 mb-12">
            {options.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-[#4080FF] bg-[#4080FF] text-white shadow-md'
                    : 'border-slate-100 bg-white text-slate-700 hover:border-blue-200 relative z-10'
                    }`}
                >
                  <input
                    type="radio"
                    name="question"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setSelected(opt.id)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-white' : 'border-slate-400'
                    }`}>
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                  <span className="font-semibold text-[15px]">{opt.label}</span>
                </label>
              );
            })}
          </div>

          <Link href="/english-test/toefl/reading/exam">
            <div className="flex justify-center mt-6">
              <button className="px-24 py-3.5 bg-[#0088FF] hover:bg-blue-600 text-white font-medium text-[16px] rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                Continue
              </button>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-6 flex justify-center mt-[-10px]">
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm shadow-blue-100/30">
          <p className="text-slate-600 text-xs font-medium">© 2025 Elobright. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

// export default function ReadingPage() {
//   const [isStarted, setIsStarted] = useState(false);

//   return (
//     <>
//       {!isStarted ? (
//         <IntroductionPage onStart={() => setIsStarted(true)} />
//       ) : (
//         <ReadingTest />
//       )}
//     </>
//   );
// }
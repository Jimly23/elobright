"use client";

import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface ExamData {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
}

interface EnglishTestHeroProps {
  title?: string;
  url: string;
  examData?: ExamData | null;
}

const EnglishTestHero = ({ title = 'TOEFL', url, examData }: EnglishTestHeroProps) => {
  const router = useRouter();
  const duration = examData ? `${examData.durationMinutes} mins` : '120 mins';

  const handleStartTest = () => {
    const token = Cookies.get('token');
    if (!token) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(url)}`);
    } else {
      router.push(url);
    }
  };

  return (
    <section className="relative min-h-[600px] w-full bg-[#f8fbff] overflow-hidden py-20">
      {/* Background Decor (Sky & Clouds effect) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-blue-50 to-transparent blur-2xl opacity-80" />
        {/* Simulating Clouds with subtle circles */}
        <div className="absolute top-20 right-[10%] w-64 h-32 bg-white/80 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
              <div className="relative ps-[60px] inline-flex items-center gap-2 px-3 py-2 mb-8 bg-[#111] rounded-full border border-gray-800 shadow-2xl">
                <div className="absolute left-0 -bottom-[1px] flex items-center justify-center">
                  <Image
                    src="/logo/maskot.png"
                    alt="Logo"
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <span className="text-white text-[11px] font-bold tracking-wide uppercase pr-1">
                  Advanced English Test
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight text-center">
                 <span className="relative inline-block">
                  <span className="text-3xl hidden md:block md:text-7xl absolute inset-x-[-10px] inset-y-2 bg-blue-100 rounded -z-10" />
                  {title}
                  {/* Eloo Tag */}
                  <span className="absolute hidden md:block -right-8 -top-4 bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-md font-black shadow-sm">
                    Eloo
                  </span>
                </span> <br />
                certification
              </h1>

              {/* Sub-description */}
              <p className="text-slate-700 md:text-xl font-semibold max-w-2xl mx-auto leading-relaxed mt-5">
                Certify all your English skills at once: speaking, writing, listening and reading
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center mt-10">
                <button
                  onClick={handleStartTest}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Start Test <Sparkles size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
          

          {/* Right Content: Test Preview Card */}
          <div className="relative group">
            <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-blue-100 border border-blue-50/50 relative overflow-hidden">
              {/* Card Background (Sky) */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-200/40 to-white -z-10" />

              {/* Welcome Header */}
              <div className="text-center mb-10 mt-4">
                <h3 className="text-3xl font-black text-slate-800 mb-2">Welcome</h3>
                <p className="text-sm text-slate-500 font-bold italic">You are about to start the test</p>
              </div>

              {/* Skills Icons */}
              <div className="flex justify-center gap-8 mb-12">
                <SkillIcon label="Listening" duration={duration} color="bg-blue-500" />
                <SkillIcon label="Structure" duration={duration} color="bg-blue-400" active />
                <SkillIcon label="Reading" duration={duration} color="bg-blue-500" />
              </div>

              {/* Play Button */}
              <div className="flex justify-center mb-8">
                <button className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200 hover:scale-110 transition-transform">
                  <Play size={32} fill="currentColor" className="ml-1" />
                </button>
              </div>

              {/* Test Guidelines */}
              <ul className="space-y-3 text-[11px] text-slate-500 font-bold leading-tight list-disc pl-4">
                <li>Check you will have enough time to complete the whole test before you begin.</li>
                <li>You can take very short breaks between sections, if needed.</li>
                <li>Your internet connection isn't stable, you may not be able to complete the test.</li>
                <li>You will not lose points for wrong answers.</li>
              </ul>
            </div>

            {/* Small Brand Tag Overlay */}
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center ">
              <Image
                src="/logo/logo-fixx.png"
                alt="Logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const SkillIcon = ({ label, duration, color, active = false }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white shadow-lg`}>
      {/* Simple adaptive icons */}
      {label === 'Listening' && <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
      {label === 'Structure' && <div className="w-5 h-5 bg-white/20 rounded-md rotate-45 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full -rotate-45" /></div>}
      {label === 'Reading' && <div className="w-5 h-3 border-2 border-white rounded-sm" />}
    </div>
    <div className="text-center">
      <div className="text-[10px] font-black text-slate-800 uppercase">{label}</div>
      <div className="text-[9px] text-slate-400 font-bold">{duration}</div>
    </div>
  </div>
);

export default EnglishTestHero;
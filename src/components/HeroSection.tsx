import { BookOpen, Check, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const HeroSection = () => {
  return (
    <section className="relative pt-16 pb-24 px-4 overflow-hidden bg-white">
      {/* Decorative Background Blurs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-0 translate-x-1/3 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
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

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
          Online English <br />
          <span className="relative inline-block mt-3">
            <span className="absolute hidden md:block inset-x-[-10px] inset-y-0 bg-blue-100 rounded -rotate-1" />
            <span className="relative px-2">Certification Test</span>
            <span className="absolute hidden md:block -right-8 -top-2 bg-blue-500 text-[10px] text-white px-1.5 py-0.5 rounded-md font-black rotate-12 shadow-sm">
              Elo
            </span>
          </span>
        </h1>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {['Reliable', 'Accessible', 'Free'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-slate-500 text-sm md:text-base">
              <Check size={20} className="text-blue-500 stroke-[3px]" />
              <span className="font-medium">It's <span className="text-slate-900 font-bold">{item}</span></span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/signup">
            <button className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">
              Get Access <Sparkles size={18} className="group-hover:animate-pulse" />
            </button>
          </Link>
          {/* <Link href="/sertification/english-test">
            <button className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl border border-gray-200 shadow-sm transition-all">
              Try Now
            </button>
          </Link> */}
        </div>

        {/* App Mockup UI */}
        <div className="relative max-w-5xl mx-auto group -mb-[150px]">
          <div className="absolute -inset-1 bg-[#edf2f7] rounded-[40px] blur-sm px-1" />
          <div className="relative bg-[#edf2f7] backdrop-blur-xl border border-white rounded-[32px] p-4 md:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Mockup Header */}
            <div className="flex items-center justify-between mb-10 bg-white p-3 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <BookOpen size={24} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-800">Reading</span>
                  <div className="w-24 md:w-48 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="w-1/3 h-full bg-blue-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                <span>01/35</span>
                <div className="hidden sm:block h-6 w-[1px] bg-gray-200" />
                <span className="hidden sm:block text-blue-500">15:43 min</span>
              </div>
            </div>

            {/* Mockup Question Area */}
            <div className="bg-white rounded-3xl p-6 md:p-10 text-left relative">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg mb-6 tracking-widest uppercase">Question 01</span>
              <p className="text-xl md:text-2xl font-bold text-slate-800 mb-10 max-w-2xl leading-relaxed">
                She always wakes up early and finishes her homework before school. She is a <span className="text-blue-500 underline decoration-2 underline-offset-4">____</span> student
              </p>

              {/* Play Button Overlay */}
              <div className="absolute z-10 inset-0 flex items-center justify-center pointer-events-none">
                <button className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-300 pointer-events-auto transform hover:scale-110 transition-transform">
                  <div className="ml-1 w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent" />
                </button>
              </div>

              {/* Options List */}
              <div className="grid gap-4 max-w-md opacity-40">
                {['lazy', 'careless', 'responsible'].map((opt) => (
                  <div key={opt} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
                    <span className="font-semibold text-slate-600 uppercase tracking-wide text-sm">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-0 right-0 h-[800px] bottom-0 bg-gradient-to-t from-blue-300 to-transparent">
        <Image
          src="/assets/awan.png"
          alt="Logo"
          width={600}
          height={600}
          className="object-contain absolute bottom-0 right-0"
        />
        <Image
          src="/assets/awan.png"
          alt="Logo"
          width={600}
          height={600}
          className="object-contain absolute bottom-0 -left-20"
        />
      </div>
    </section>
  )
}

export default HeroSection
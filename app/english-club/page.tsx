import Navbar from "@/src/components/Navbar";
import FooterSection from "@/src/components/FooterSection";
import Image from "next/image";
import { Check, Mic, Video, Mail, MonitorUp, PhoneOff, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import InfoSection from "@/src/components/EnglishTest/InfoSection";
import NeedMoreTimeSection from "@/src/components/EnglishTest/NeedMoreTimeSection";

const testOptions = [
  {
    title: "TOEFL test certificate",
    description: "When You Finish The Test, You'll Instantly Get An Official EF SET Certificate Showcasing All Your English Skills: Reading, Listening, Writing And Speaking.",
  },
  {
    title: "IELTS test certificate",
    description: "Our Adaptive Test Design And The Power Of AI Means You Can Accurately Measure Your Level From A1 To C2 On The CEFR Scale.",
  },
  {
    title: "Preparation test certificate",
    description: "Preparing For TOEFL, IELTS Or Another Exam? EF SET Results Align To The CEFR So You Can Use Them To Estimate Your Score On Other English Tests.",
  },
];

export default function EnglishClubPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center pt-20 overflow-hidden font-sans">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 flex flex-col">
          <div className="h-[60%] bg-white" />
          <div className="relative h-[40%] w-full bg-gradient-to-t from-blue-500 to-transparent">
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
          </div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">

          {/* Badge: Advanced English Test */}
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
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
            Connect <span className="inline-flex items-center -space-x-3 mx-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 md:w-12 md:h-12 bg-slate-300 rounded-full border-4 border-white shadow-sm" />
              ))}
            </span> Learning <br />
            Anytime & Anywhere
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl text-slate-500 text-lg md:text-xl font-medium mb-10 leading-relaxed">
            Certify all your English skills at once: speaking, writing, listening and reading
          </p>

          {/* Email Input Group */}
          <div className="w-full max-w-lg bg-white p-2 rounded-full border border-slate-200 shadow-2xl flex items-center mb-16 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent px-6 py-2 outline-none text-slate-700 placeholder:text-slate-400"
            />
            <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
              Join Now
              <span className="text-xs">✦</span>
            </button>
          </div>

          {/* Video Mockup Frame */}
          <div className="relative w-full max-w-5xl aspect-video bg-white rounded-[32px] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100">
            {/* Card Float Effect */}
            <div className="absolute -left-10 top-10 w-48 h-32 bg-white rounded-2xl shadow-2xl border border-slate-50 z-20 hidden md:block animate-bounce-slow" />

            {/* Inner Video Layout Simulation */}
            <div className="w-full h-full bg-slate-200 rounded-[24px] flex gap-4 p-4 overflow-hidden">
              <div className="flex-[3] bg-slate-400 rounded-2xl relative flex items-end justify-center p-6">
                {/* Video Controls Bar */}
                <div className="w-fit bg-white/20 backdrop-blur-md rounded-full px-6 py-3 flex gap-4">
                  <div className="w-8 h-8 bg-white/30 rounded-full" />
                  <div className="w-8 h-8 bg-white/30 rounded-full" />
                  <div className="w-8 h-8 bg-white/30 rounded-full" />
                  <div className="w-8 h-8 bg-red-400 rounded-full" />
                </div>
              </div>
              <div className="flex-1 hidden md:flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 bg-slate-300 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <InfoSection url="/english-test/toefl/introduction" />

      <section className="py-24 bg-white mb-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
              All Our Test
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Test Your English Now
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testOptions.map((option, index) => (
              <div
                key={index}
                className="group p-10 rounded-[40px] bg-gradient-to-b from-blue-50/80 to-white border border-blue-50/50 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-100/40 flex flex-col items-center text-center"
              >
                {/* Icon Container */}
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" fill="currentColor" />
                </div>

                {/* Content */}
                <div className="flex-grow flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                      {option.title}
                    </h3>
                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Black Pill Button */}
                  {/* <div className="pt-6">
                    <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95">
                      Find Out More <ArrowRight size={16} strokeWidth={3} />
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <NeedMoreTimeSection />
      <FooterSection />
    </div>
  );
}

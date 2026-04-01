import Navbar from "@/src/components/Navbar";
import FooterSection from "@/src/components/FooterSection";
import Image from "next/image";
import { Check, Mic, Video, Mail, MonitorUp, PhoneOff, Sparkles, ArrowRight } from "lucide-react";

export default function EnglishClubPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
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
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full mb-8 shadow-xl">
            <div className="w-6 h-6 relative">
              <Image src="/logo/maskot.png" alt="Mascot" fill className="object-contain" />
            </div>
            <span className="text-xs font-bold tracking-wide">Advanced English Test</span>
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
      <section className="max-w-6xl mx-auto px-6 py-16 pb-32">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Visual Placeholder */}
          <div className="aspect-square md:aspect-[4/3] rounded-[48px] bg-gradient-to-br from-[#adddff] via-[#e5f4ff] to-white shadow-[0_30px_60px_-15px_rgba(173,221,255,0.4)]" />

          {/* Right Text */}
          <div className="max-w-xl">
            <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100 shadow-sm">
              Join English Club
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Free TOEFL English certification test
            </h2>
            <p className="text-slate-600 font-semibold mb-10 text-lg leading-relaxed">
              Certify all your English skills at once: speaking, writing, listening and reading. All four skills will be shown on
            </p>

            <ul className="space-y-5 mb-12">
              <li className="flex items-start gap-4">
                <Check size={22} strokeWidth={3} className="text-slate-900 mt-0.5 shrink-0" />
                <span className="text-slate-800 font-bold text-base tracking-tight leading-snug">Get A Complete Diagnostic Of Your English Skills.</span>
              </li>
              <li className="flex items-start gap-4">
                <Check size={22} strokeWidth={3} className="text-slate-900 mt-0.5 shrink-0" />
                <span className="text-slate-800 font-bold text-base tracking-tight leading-snug">Instantly Get A Personalized English Certificate That Proves Your Level</span>
              </li>
              <li className="flex items-start gap-4">
                <Check size={22} strokeWidth={3} className="text-slate-900 mt-0.5 shrink-0" />
                <span className="text-slate-800 font-bold text-base tracking-tight leading-snug">Like All Our Tests, This One Is 100% Free</span>
              </li>
            </ul>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-blue-500/30 text-base">
              Join Now <Sparkles size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-white py-20 pb-40">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 text-blue-500 text-xs font-black rounded-full shadow-sm">
            Featured English Test
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-20 tracking-tight leading-tight">
            Test your English now
          </h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 text-left">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="group relative h-[450px] rounded-[36px] overflow-hidden bg-gradient-to-b from-[#6fb4fe] via-blue-100 to-slate-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-blue-50"
              >
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent pt-32">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                    Lorem ipsum<br />dolor sit amet
                  </h3>
                  <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                    Our Most Complete English Test Reading, Writing, Listening & Speaking
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative pt-32 pb-48 text-center bg-gradient-to-b from-white via-[#dcf0fc] to-[#a6dbf8] overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[60vh] min-h-[400px] pointer-events-none">
          <Image
            src="/assets/awan.png"
            alt="Clouds Background"
            fill
            className="object-cover object-bottom mix-blend-normal"
            priority
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-slate-900 mb-8 tracking-tight leading-none text-center">
            Need More Time?
          </h2>
          <p className="text-slate-800 font-bold mb-14 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Test only your reading and listening skills and earn an EF SET
            certificate in less than an hour
          </p>
          <button className="bg-[#1a1a1a] hover:bg-black text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-black/20 text-lg">
            Get Access <Sparkles size={20} fill="currentColor" />
          </button>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

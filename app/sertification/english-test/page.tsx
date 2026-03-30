import React from 'react'
import Navbar from '@/src/components/Navbar'
import { CheckCircle2 } from 'lucide-react';
import { BookOpen, ArrowRight } from 'lucide-react';
import FooterSection from '@/src/components/FooterSection';
import HeroSection from '@/src/components/Sertification/HeroSection';

const certificateFeatures = [
  { text: "Get A Personalized English Certificate URL", subtext: "(View Example)" },
  { text: "Available For PDF Download", subtext: "(View Sample)" },
  { text: "Easily Add Your Certificate To LinkedIn Profile", subtext: "(View Instructions)" },
  { text: "Results Aligned With CEFR Levels", subtext: null },
  { text: "100% Free", subtext: null },
];
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

const page = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left Side: Certificate Preview Placeholder */}
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/3] rounded-[40px] bg-gradient-to-br from-blue-400/80 via-blue-200 to-blue-50 overflow-hidden shadow-2xl shadow-blue-100 flex items-center justify-center border border-blue-50">
                {/* Decorative Glass Sheet to simulate a certificate */}
                <div className="w-[80%] h-[75%] bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-2xl relative overflow-hidden flex flex-col p-8 justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg" />
                    <div className="h-4 w-1/2 bg-blue-500/10 rounded-full" />
                    <div className="h-3 w-3/4 bg-slate-200/50 rounded-full" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="h-10 w-32 bg-slate-200/50 rounded-lg" />
                    <div className="h-16 w-16 bg-blue-500/10 rounded-full border-4 border-dashed border-blue-200" />
                  </div>
                </div>

                {/* Sky/Cloud background texture simulation */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white blur-[100px] rounded-full" />
                </div>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100">
                  Elogright English Certification
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                  Get an internationally <br />
                  recognized English certificate
                </h2>
              </div>

              {/* Features List */}
              <div className="space-y-6">
                {certificateFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-0.5">
                      <CheckCircle2
                        size={28}
                        className="text-blue-500 fill-blue-50"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-slate-800 font-bold text-lg leading-tight">
                        {feature.text}
                      </p>
                      {feature.subtext && (
                        <button className="text-slate-400 text-sm font-bold hover:text-blue-500 transition-colors">
                          {feature.subtext}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
              All Our Test
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Your test options
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
                  <div className="pt-6">
                    <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95">
                      Find Out More <ArrowRight size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FooterSection />
    </>
  )
}

export default page
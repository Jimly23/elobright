import React from 'react';
import { Check } from 'lucide-react';

const EloClubSection = () => {
  const benefits = [
    "Cuts Labor Costs By Over 90%",
    "Scales Instantly Without Adding Staff",
    "Cuts Costs By 20% In Year One.",
    "Improves Customer Experience With Personalization",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Sub-header Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100 shadow-sm">
            Our English Club
          </span>
        </div>

        {/* Main Title */}
        <h2 className="text-5xl md:text-6xl font-bold text-center text-slate-900 mb-16 tracking-tight">
          Join our Elo Club
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content: Text & Benefits */}
          <div className="space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              <span className="relative inline-block">
                {/* Blue Highlight Effect */}
                <span className="absolute inset-x-0 bottom-1 h-3 bg-blue-100 -z-10" />
                With EloBright Club,
              </span>{" "}
              add English assessment to your hiring process or staff training program by day
            </h3>

            <div className="space-y-4">
              {benefits.map((text, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 bg-blue-500 text-white rounded-full shadow-md shadow-blue-100 transition-transform hover:scale-105 w-fit"
                >
                  <div className="bg-white/20 p-1 rounded-full">
                    <Check size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-bold pr-4">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content: Video/Image Mockup */}
          <div className="relative group">
            <div className="bg-gray-50 rounded-[40px] p-4 shadow-xl border border-gray-100">
              {/* Main Gray Placeholder Area */}
              <div className="aspect-video bg-[#C4C4C4] rounded-[32px] flex items-center justify-center relative overflow-hidden">
                {/* Play Button Overlay (Optional) */}
                <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                </div>
              </div>

              {/* Bottom Info Bar inside Card */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-2xl">
                   <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center text-[10px]">👤</div>
                   <span className="text-xs font-bold text-slate-600">Cuts Labor Costs By Over 90%</span>
                </div>
                <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl shadow-lg transition-all active:scale-95">
                  Join Club Now
                </button>
              </div>
            </div>

            {/* Decorative element (Eloo Tag) */}
            <div className="absolute -top-4 left-10 bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-md font-black shadow-sm z-20">
              Eloo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EloClubSection;
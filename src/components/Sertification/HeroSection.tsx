import Image from 'next/image'
import React from 'react'

const HeroSection = () => {
  return (
    <section className="relative w-full py-20 overflow-hidden bg-white">
      {/* <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-gradient-to-b from-blue-50/50 to-white" />

        <div className="relative h-1/2 w-full bg-gradient-to-t from-blue-300 to-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(147,197,253,0.3)_100%)]" />
        </div>
      </div> */}

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
        <div className="space-y-2 mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tight leading-none">
            Elobright English
          </h1>
          <div className="relative inline-block mt-2">
            {/* Blue Highlight Overlay */}
            <div className="absolute inset-x-[-15px] inset-y-1 bg-blue-100 rounded-2xl -z-10" />
            <h2 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tight leading-none px-2">
              Courses
            </h2>
            {/* Eloo Tag */}
            <div className="absolute -right-8 -top-4 bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-md font-black shadow-md">
              Eloo
            </div>
          </div>
        </div>

        {/* Sub-description */}
        <p className="text-slate-700 text-xl md:text-2xl font-semibold max-w-2xl mx-auto leading-relaxed">
          Certify all your English skills at once: speaking, writing, listening and reading
        </p>
      </div>
    </section>
  )
}

export default HeroSection
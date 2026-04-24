"use client";

import { useParams } from 'next/navigation';
import Navbar from '@/src/components/Navbar'
import FooterSection from '@/src/components/FooterSection'
import { ArrowRight } from 'lucide-react';
import FeaturedSection from '@/src/components/FeaturedSection';
import NeedMoreTimeSection from '../../src/components/EnglishTest/NeedMoreTimeSection';
import HeroSection from '@/src/components/About/HeroSection';


const Page = () => {

  return (
    <>
      <Navbar />
      <HeroSection />
      <section className="bg-white py-24 font-sans">
        <div className="max-w-3xl mx-auto px-6">
          {/* Section 1: Overview */}
          <div className="mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
              Overview
            </h2>
            <div className="space-y-6">
              <p className="text-slate-600 text-lg leading-relaxed">
                Elobright adalah platform kursus bahasa Inggris online yang dirancang untuk membantu Anda menguasai bahasa Inggris dengan cara yang efektif, fleksibel, dan menyenangkan. Dengan kurikulum yang terstruktur dan didampingi oleh instruktur berpengalaman, Elobright hadir untuk semua level — mulai dari pemula hingga tingkat lanjut. Setiap materi pembelajaran dirancang secara khusus agar mudah dipahami dan langsung dapat dipraktikkan dalam kehidupan sehari-hari maupun dunia profesional.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Selain program kursus bahasa Inggris reguler, Elobright juga menyediakan layanan persiapan ujian TOEFL dan IELTS yang komprehensif. Dengan modul latihan soal, simulasi tes resmi, serta bimbingan intensif dari instruktur tersertifikasi, Elobright siap membantu Anda meraih skor terbaik untuk mendukung impian akademik maupun karier internasional Anda. Bergabunglah bersama ribuan pelajar yang telah membuktikan kemajuan mereka bersama Elobright — karena setiap langkah menuju kemahiran bahasa Inggris dimulai dari sini.
              </p>
            </div>
          </div>

          {/* Section 2: EF SET powers... */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
              EF SET powers the EF EPI research
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              The <span className="underline decoration-slate-400 underline-offset-4 cursor-pointer hover:text-blue-600 transition-colors">EF English Proficiency Index</span> (EF EPI) Is The World's Largest Ranking Of
              Countries/Regions By Adult English Skills. Published Annually, The EF EPI Is An
              Important International Benchmark For Adult English Proficiency. The EF EPI Reports
              Identify The Most Common Pitfalls And Highlight The Most Effective Strategies For
              Improving English Proficiency. The EF EPI Calculates A Country's/Region's Average
              Adult English Skill Level Using Data From Three Different Versions Of The EF SET.
            </p>

            {/* Dark Button */}
            <button className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#222] text-white font-bold rounded-xl transition-all hover:bg-black hover:shadow-xl active:scale-95">
              Get Started
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <FeaturedSection />
      <NeedMoreTimeSection />
      <FooterSection />
    </>
  )
}

export default Page
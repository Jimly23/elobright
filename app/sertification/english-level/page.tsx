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

const comparisonData = [
  { cefr: "pre-A1", elobright: "0-20", toefl: "n/a", ielts: "n/a", color: "bg-slate-50" },
  { cefr: "A1 Beginner", elobright: "21-30", toefl: "n/a", ielts: "n/a", color: "bg-orange-50", border: "border-l-orange-400" },
  { cefr: "A2 Elementary", elobright: "31-40", toefl: "n/a", ielts: "n/a", color: "bg-yellow-50", border: "border-l-yellow-400" },
  { cefr: "B1 Intermediate", elobright: "41-50", toefl: "42-71", ielts: "4.0 - 5.0", color: "bg-green-50", border: "border-l-green-400" },
  { cefr: "B2 Upper Intermediate", elobright: "51-60", toefl: "72-94", ielts: "5.5 - 6.5", color: "bg-blue-50", border: "border-l-blue-400" },
  { cefr: "C1 Advanced", elobright: "61-70", toefl: "95-120", ielts: "7.0 - 8.0", color: "bg-sky-50", border: "border-l-sky-400" },
  { cefr: "C2 Proficient", elobright: "71-100", toefl: "n/a", ielts: "8.5 - 9.0", color: "bg-purple-50", border: "border-l-purple-400" },
];

const page = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-10 tracking-tight">
            Elobright Score
          </h2>

          {/* Content Body */}
          <div className="space-y-8 text-slate-600 leading-relaxed text-lg">
            <p>
              The Most Reliable Way To Find Out Your English Level Is To Take A Well-Designed
              Assessment Test. There Are Many Tests To Choose From, But Taking The EF SET Is A
              Good Place To Start. You Can Use Your EF SET Score As An English Level Certification
              On Your CV And On LinkedIn. The EF SET (50 Min) Is Currently The Only
              Standardized English Test That Reliably Measures All Skill Levels, Beginner To
              Proficient, In Alignment With The Internationally Recognized Standard, The Common
              European Framework Of Reference (CEFR). Other Standardized English Tests Are Able
              To Assess Some Proficiency Levels, But Not The Entire CEFR Scale. Using The EF SET
              To Track Your English Level Over Months Or Years Gives You A Standardized Way To
              Evaluate Your Own Progress.
            </p>

            <p>
              English Level Certification Is Required In Applying For Many University Programs And
              Visas. In The Job Market, Although There Are Rarely Official Requirements, Certifying
              Your English Level Makes You Stand Out From The Crowd. But In A Broader Sense,
              Measuring Your English Level Reliably, And Being Able To Track Your Level Change
              Over Time, Is Important For Any English Learner — How Else Will You Know If Your
              English Is Improving?
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Converting from one English <br /> level to another
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Although It Is Notoriously Hard To Map One Leveling System To Another, The Table Below Gives You A Good Approximation.
              If You've Taken One Of These Tests, This Table Gives You An Idea What Type Of Score You Might Be Able To Get On Another One.
            </p>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                  <th className="px-8 py-5 text-sm font-bold text-slate-900">CEFR ¹</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-900 text-center">Elobright</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-900 text-center">TOEFL iBT ²</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-900 text-center">IELTS ³</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className={`${row.color} transition-colors`}>
                    <td className={`px-8 py-4 text-[13px] font-bold text-slate-700 border-l-4 ${row.border || 'border-l-transparent'}`}>
                      {row.cefr}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-bold text-slate-600 text-center">
                      {row.elobright}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-medium text-slate-400 text-center italic">
                      {row.toefl}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-medium text-slate-400 text-center italic">
                      {row.ielts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footnotes */}
          <div className="mt-8 space-y-2">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1. The Classification Levels (A1-Beginner Through C2-Proficient) Are From The CEFR. Score Comparisons Are Based On Individual Test Provider's Websites Using The CEFR As The Main Benchmark For Comparison.
            </p>
            <p className="text-[11px] text-slate-400">
              2. Compare TOEFL® Scores: <span className="underline cursor-pointer">https://www.ets.org/toefl/institutions/scores/compare/</span>
            </p>
            <p className="text-[11px] text-slate-400">
              3. IELTS And The CEFR: <span className="underline cursor-pointer">https://www.ielts.org/ielts-for-organisations/common-european-framework</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-10 tracking-tight">
            Why it's important to know <br />your English level
          </h2>

          {/* Content Body */}
          <div className="space-y-8 text-slate-600 leading-relaxed text-lg">
            <p>
              The English level system you use to describe your English skills is usually imposed on you from the outside. An employer, a school, a teacher, or an immigration authority asks you to take a particular English test, so you do, and then you describe your English level using that test's system. Depending on your goals and location, you are likely to be more familiar with one system of English levels than another. For example, if you're applying to university in the USA, you probably know what a TOEFL score of 100 means, whereas if you're trying to get a visa to move to the UK, you're more likely to be familiar with the CEFR level B1.
            </p>
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
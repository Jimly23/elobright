import React from 'react';
import { Award, BarChart3, FileText } from 'lucide-react';

const benefits = [
  {
    title: "Get a free certificate",
    description: "When You Finish The Test, You'll Instantly Get An Official EF SET Certificate Showcasing All Your English Skills: Reading, Listening, Writing And Speaking.",
    icon: <Award className="w-6 h-6 text-white" />,
  },
  {
    title: "Know your English level",
    description: "Our Adaptive Test Design And The Power Of AI Means You Can Accurately Measure Your Level From A1 To C2 On The CEFR Scale.",
    icon: <BarChart3 className="w-6 h-6 text-white" />,
  },
  {
    title: "Exam preparation",
    description: "Preparing For TOEFL, IELTS Or Another Exam? EF SET Results Align To The CEFR So You Can Use Them To Estimate Your Score On Other English Tests.",
    icon: <FileText className="w-6 h-6 text-white" />,
  },
];

export default function TakeTestSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100">
            All Our Benefits
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Why take this English test?
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="relative p-10 rounded-[32px] bg-gradient-to-b from-blue-50/50 to-white border border-blue-50 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-100/50 group"
            >
              {/* Icon Container */}
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  {benefit.title}
                </h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
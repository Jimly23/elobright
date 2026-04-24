"use client";

import { BookOpen, Headphones, PenTool, Mic2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGeneralExamContext } from '@/src/context/GeneralExamContext';
import { useSectionContext } from '@/src/context/SectionContext';

export default function SectionOnboardingPage() {
  const params = useParams();
  const examId = params.examId as string;
  const sectionId = params.sectionId as string;

  const { sections, getNextSectionId } = useGeneralExamContext();
  const { questions } = useSectionContext();

  const currentSection = sections.find(s => s.id === sectionId);
  const title = currentSection?.title || 'Section';
  const t = title.toLowerCase();

  const getSectionIcon = () => {
    if (t.includes('listen')) return <Headphones size={28} />;
    if (t.includes('writ')) return <PenTool size={28} />;
    if (t.includes('speak')) return <Mic2 size={28} />;
    return <BookOpen size={28} />;
  };

  // Use actual durationMinutes from API
  const getDuration = () => {
    if (currentSection?.durationMinutes) {
      return `${currentSection.durationMinutes} mins`;
    }
    return '-- mins';
  };

  const getCustomInstructions = () => {
    if (t.includes('listen')) {
      return [
        "Please listen to the audio carefully.",
        "You cannot go back once you submit an answer.",
        "Make sure your environment is quiet and distraction-free."
      ];
    } else if (t.includes('read')) {
      return [
        "Read each passage carefully before answering.",
        "You cannot go back once you submit an answer."
      ];
    } else if (t.includes('speak')) {
      return [
        "Make sure your microphone is working.",
        "Speak clearly after the beep.",
        "You cannot re-record your answer."
      ];
    } else if (t.includes('writ')) {
      return [
        "Write your essay clearly and concisely.",
        "Pay attention to the word count target.",
        "You cannot edit your essay after submission."
      ];
    }
    return [
      "Read each question carefully before answering.",
      "You cannot go back once you submit an answer."
    ];
  };

  const instructions = currentSection?.instructions 
    ? [currentSection.instructions] 
    : getCustomInstructions();

  // If questions are present, navigate to the first question, otherwise try jumping to the next section or finish.
  const nextSectionId = getNextSectionId(sectionId);
  const nextTarget = questions.length > 0 
    ? `/exams/${examId}/section/${sectionId}/question/${questions[0].id}`
    : (nextSectionId ? `/exams/${examId}/section/${nextSectionId}` : `/exams/${examId}/finish`);

  return (
    <div className='flex justify-center items-center min-h-screen'>
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="relative top-0 bottom-0 bg-gradient-to-b from-blue-50/50 to-white" />

        <div className="relative h-full w-full bg-gradient-to-t from-blue-300 to-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(147,197,253,0.3)_100%)]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6">
        <div className="pt-10 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-6">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]" />
          <h1 className="text-3xl font-bold text-slate-900 relative z-10">Get Ready</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm relative z-10">Next section is starting</p>
        </div>

        <div className="p-10 flex flex-col items-center">
          <div className={`w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-blue-100`}>
            {getSectionIcon()}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1 capitalize">{title}</h2>
          <p className="text-slate-400 text-sm mb-1">{getDuration()}</p>
          <p className="text-slate-400 text-sm mb-10">{questions.length} questions</p>

          <ul className="space-y-2.5 w-full mb-10">
            {instructions.map((tip, i) => (
              <li key={i} className="flex gap-3 text-slate-500 text-[12px] leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>

          <Link href={nextTarget} className='w-full'>
            <button
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] text-lg disabled:bg-slate-300 disabled:shadow-none"
            >
              Start
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

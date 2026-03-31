"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, Headphones, PenTool, Mic2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { exam } from '@/src/api/exam';
import { useExam, Section, Question } from '@/src/context/ExamContext';
import Link from 'next/link';

const TOEFL_ID = '11111111-0000-0000-0000-000000000001';

// ── Section metadata map ──────────────────────────────────────────────────────
const SECTION_META: Record<string, { icon: React.ReactNode; color: string; route: string }> = {
  Reading:   { icon: <BookOpen size={28} />,    color: 'bg-blue-500',   route: '/english-test/toefl/reading' },
  Listening: { icon: <Headphones size={28} />,  color: 'bg-indigo-500', route: '/english-test/toefl/listening' },
  Writing:   { icon: <PenTool size={28} />,     color: 'bg-violet-500', route: '/english-test/toefl/writing' },
  Speaking:  { icon: <Mic2 size={28} />,        color: 'bg-purple-500', route: '/english-test/toefl/speaking' },
};

// Urutan section
const SECTION_ORDER = ['Reading', 'Listening', 'Writing', 'Speaking'];

type Phase = 'welcome' | 'section-intro' | 'done';

// ── Background decoration ─────────────────────────────────────────────────────
function Background() {
  return (
    <div className="absolute inset-0 z-0 flex flex-col">
      <div className="h-1/2 bg-gradient-to-b from-blue-50/50 to-white" />
      <div className="relative h-1/2 w-full bg-gradient-to-t from-blue-400 to-transparent">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 mt-8 py-2 px-6 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
      <p className="text-slate-400 text-xs font-medium">© 2026 Elobright. All rights reserved.</p>
    </footer>
  );
}

// ── Welcome Card (tampilkan semua 4 section) ──────────────────────────────────
function WelcomeCard({ sections, onContinue }: { sections: Section[]; onContinue: () => void }) {
  const allSections = SECTION_ORDER.map(name => {
    const s = sections.find(sec => sec.name === name);
    const meta = SECTION_META[name];
    return { name, duration: s ? `${s.durationMinutes} mins` : '—', meta };
  });

  return (
    <div className="relative z-10 w-full max-w-xl bg-white rounded-[40px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6">
      <div className="pt-10 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-4">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]" />
        <h1 className="text-4xl font-bold text-slate-900 relative z-10">Welcome</h1>
        <p className="text-slate-500 font-medium mt-2 relative z-10">You are about to start the TOEFL test</p>
      </div>

      <div className="p-10 md:p-14">
        {/* Section icons */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {allSections.map(({ name, duration, meta }) => (
            <div key={name} className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 ${meta.color} text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-100`}>
                {meta.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{name}</h3>
              <p className="text-slate-400 text-[10px]">{duration}</p>
            </div>
          ))}
        </div>

        {/* Rules */}
        <ul className="space-y-3 mb-12">
          {[
            "Check you will have enough time to complete the whole test before you begin. Once you begin, you cannot pause the timer or restart the test.",
            "You can only take the test once. You cannot repeat the test to practice.",
            "If your internet connection isn't stable, you may not be able to complete the test.",
            "You will receive points for every correct answer.",
            "Once you submit an exercise, you cannot go back.",
          ].map((text, i) => (
            <li key={i} className="flex gap-3 text-slate-600 text-[13px] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 bg-slate-900 rounded-full flex-shrink-0" />
              {text}
            </li>
          ))}
        </ul>

         <Link href="/english-test/toefl/reading">
        <button
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
        >
          Continue
        </button>
        </Link>
      </div>
    </div>
  );
}

// ── Section Intro Card (hanya tampilkan 1 section icon) ───────────────────────
function SectionIntroCard({
  sectionName,
  duration,
  questionCount,
  onStart,
}: {
  sectionName: string;
  duration: string;
  questionCount: number;
  onStart: () => void;
}) {
  const meta = SECTION_META[sectionName];

  return (
    <div className="relative z-10 w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6">
      <div className="pt-10 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-6">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]" />
        <h1 className="text-3xl font-bold text-slate-900 relative z-10">Get Ready</h1>
        <p className="text-slate-500 font-medium mt-1 text-sm relative z-10">Next section is starting</p>
      </div>

      <div className="p-10 flex flex-col items-center">
        {/* Single section icon */}
        <div className={`w-20 h-20 ${meta.color} text-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-blue-100`}>
          {meta.icon}
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-1">{sectionName}</h2>
        <p className="text-slate-400 text-sm mb-1">{duration}</p>
        <p className="text-slate-400 text-sm mb-10">{questionCount} questions</p>

        <ul className="space-y-2.5 w-full mb-10">
          {[
            "Read each question carefully before answering.",
            "You cannot go back once you submit an answer.",
            "Make sure your environment is quiet and distraction-free.",
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 text-slate-500 text-[12px] leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>

        <button
          onClick={onStart}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] text-lg"
        >
          Start {sectionName}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IntroductionPage() {
  const router = useRouter();
  const { setSections, setQuestionsForSection, setExamId } = useExam();

  const [phase, setPhase] = useState<Phase>('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Simpan sections secara lokal agar tidak bergantung pada timing state context
  const [localSections, setLocalSections] = useState<Section[]>([]);

  // Sort sections by SECTION_ORDER (pakai localSections agar selalu sinkron)
  const sortedSections = SECTION_ORDER
    .map(name => localSections.find(s => s.name === name))
    .filter(Boolean) as Section[];

  const currentSection = sortedSections[currentSectionIndex];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setExamId(TOEFL_ID);

        // 1. Fetch sections
        const sectionsData: Section[] = await exam.sectionByExamId(TOEFL_ID);
        console.log('sectionByExamId (TOEFL introduction) response:', sectionsData);
        setSections(sectionsData);   // update context
        setLocalSections(sectionsData); // update state lokal (sinkron & pasti tersedia)

        // 2. Fetch questions for every section in parallel
        await Promise.all(
          sectionsData.map(async (section) => {
            const questions: Question[] = await exam.questionBySectionId(section.id);
            console.log(`questionBySectionId [${section.name}] response:`, questions);
            setQuestionsForSection(section.id, questions);
          })
        );
      } catch (err) {
        console.error('Failed to load exam data:', err);
        setError('Gagal memuat data ujian. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleWelcomeContinue = () => {
    setCurrentSectionIndex(0);
    setPhase('section-intro');
  };

  const handleSectionStart = () => {
    if (!currentSection) return;
    const meta = SECTION_META[currentSection.name];
    router.push(meta.route);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading exam data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden pt-10 pb-10">
      <Background />

      {phase === 'welcome' && (
        <WelcomeCard sections={localSections} onContinue={handleWelcomeContinue} />
      )}

      {phase === 'section-intro' && currentSection && (
        <SectionIntroCardWrapper
          section={currentSection}
          onStart={handleSectionStart}
        />
      )}

      <Footer />
    </div>
  );
}

// Wrapper agar bisa ambil questionCount dari context
function SectionIntroCardWrapper({ section, onStart }: { section: Section; onStart: () => void }) {
  const { questionsBySection } = useExam();
  const questions = questionsBySection[section.id] ?? [];

  return (
    <SectionIntroCard
      sectionName={section.name}
      duration={`${section.durationMinutes} mins`}
      questionCount={questions.length}
      onStart={onStart}
    />
  );
}
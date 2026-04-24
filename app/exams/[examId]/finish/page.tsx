"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Target, Brain, BarChart, CheckCircle2, BookOpen, Headphones, Edit3, Mic } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { exam } from "@/src/api/exam";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

const getSectionIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('listen')) return <Headphones size={18} />;
  if (t.includes('read')) return <BookOpen size={18} />;
  if (t.includes('writ')) return <Edit3 size={18} />;
  if (t.includes('speak')) return <Mic size={18} />;
  return <Brain size={18} />;
};

export default function ExamFinishPage() {
  const [finishData, setFinishData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const finishAttempt = useRef(false);

  useEffect(() => {
    if (finishAttempt.current) return;
    
    const finishExam = async () => {
      finishAttempt.current = true;
      try {
        const sessionId = localStorage.getItem("currentExamSessionId");
        const token = getCookie("token") || "";

        if (sessionId) {
          const data = await exam.finishExam(sessionId, token);
          console.log('finishExam response:', data);
          setFinishData(data);
        }
      } catch (error) {
        console.error("Failed to finish exam", error);
      } finally {
        setLoading(false);
        // Clean up localStorage
        localStorage.removeItem("currentExamSessionId");
        localStorage.removeItem("currentSectionSessionId");
        localStorage.removeItem("currentSectionEndTimeLimit");
        localStorage.removeItem("examCheckpoint");
      }
    };
    finishExam();
  }, []);

  // Build score details from the actual API response
  const sectionSubmissions = finishData?.sectionSubmissions || [];
  
  const scoreDetails = sectionSubmissions.map((sub: any) => {
    const sectionTitle = sub.section?.title || 'Section';
    const isPending = sub.totalScore === 0 && (sectionTitle.toLowerCase().includes('speak') || sectionTitle.toLowerCase().includes('writ'));
    
    return {
      label: sectionTitle,
      max: sub.allScore || 0,
      achieved: isPending ? 'pending' : sub.totalScore || 0,
      icon: getSectionIcon(sectionTitle),
    };
  });

  // Calculate total score
  const totalScore = sectionSubmissions.reduce((sum: number, sub: any) => sum + (sub.totalScore || 0), 0);
  const totalMax = sectionSubmissions.reduce((sum: number, sub: any) => sum + (sub.allScore || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="relative top-0 bottom-0 bg-gradient-to-b from-blue-50/50 to-white" />
        <div className="relative h-full w-full bg-gradient-to-t from-blue-300 to-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(147,197,253,0.3)_100%)]" />
        </div>
      </div>

      {/* Header / Logo */}
      <header className="absolute top-8 left-8 z-20">
        <div className="w-10 h-10 bg-white p-1 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Image
            src={"/logo/logo-icon.jpg"}
            width={100}
            height={100}
            alt="logo"
            className="w-10"
          />
        </div>
      </header>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-[40px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6 mt-10">
        {/* Card Header */}
        <div className="pt-12 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-8">
          <div
            className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]"
            style={{
              backgroundRepeat: "repeat-x",
              backgroundPosition: "center",
            }}
          />
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200 relative z-10">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="text-4xl font-extrabold text-slate-800 relative z-10">
            Test Finished!
          </h1>
          <p className="text-slate-500 font-medium mt-2 relative z-10">
            Great job! Here is your preliminary result
          </p>
        </div>

        {/* Card Content Area (Scores) */}
        <div className="p-10 pt-4">
          {/* Total Score Highlight */}
          <div className="bg-blue-50/50 border-2 border-blue-100 rounded-3xl p-6 flex flex-col items-center mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award size={100} />
            </div>
            <span className="text-blue-500 font-bold uppercase tracking-wider text-xs mb-2 relative z-10">
              Estimated Score
            </span>
            <div className="text-5xl font-black text-blue-600 relative z-10">
              {totalScore}
            </div>
            <span className="text-slate-400 text-xs mt-2 relative z-10">
              / {totalMax} Total
            </span>
          </div>

          {/* Section Breakdown Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {scoreDetails.map((s: any, idx: number) => {
              const isPending = s.achieved === "pending";
              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-slate-500 mb-3 relative z-10">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm text-blue-500">
                      {s.icon}
                    </div>
                    <span className="font-bold text-xs p-1">{s.label}</span>
                  </div>

                  <div className="flex items-baseline gap-1 relative z-10 p-1">
                    {isPending ? (
                      <span className="text-sm font-bold text-orange-400">
                        Under Review
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-slate-800">
                          {s.achieved}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          / {s.max}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/dashboard" className="block w-full">
            <button className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] outline-none">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>

      <footer className="relative z-10 mt-10 py-2.5 px-8 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm mb-10">
        <p className="text-slate-400 text-xs font-medium">
          © 2026 Elobright. Scores may adjust after human review.
        </p>
      </footer>
    </div>
  );
}

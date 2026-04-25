"use client";

import { useEffect, useState } from "react";
import { exam } from "@/src/api/exam";
import Link from "next/link";
import {
  Trophy,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  Brain,
  Loader2,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

const getSectionIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("listen")) return <Headphones size={18} />;
  if (t.includes("read")) return <BookOpen size={18} />;
  if (t.includes("writ")) return <Edit3 size={18} />;
  if (t.includes("speak")) return <Mic size={18} />;
  return <Brain size={18} />;
};

// Check if a section is under review (Writing/Speaking with score 0)
const isSectionUnderReview = (title: string, totalScore: number) => {
  const t = title.toLowerCase();
  return totalScore === 0 && (t.includes("speak") || t.includes("writ"));
};

interface SectionScore {
  title: string;
  totalScore: number;
  isUnderReview: boolean;
}

interface LatestExam {
  id: string;
  examTitle: string;
  submittedAt: string | null;
  totalScore: number;
  sectionScores: SectionScore[];
  hasReviewSections: boolean;
}

export default function UserDashboard() {
  const [latestExam, setLatestExam] = useState<LatestExam | null>(null);
  const [totalExams, setTotalExams] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie("token") || "";
        const data = await exam.getExamHistory(token);

        if (Array.isArray(data) && data.length > 0) {
          setTotalExams(data.length);

          // Get the most recent exam
          const latest = data[0];
          const sectionScores: SectionScore[] = (
            latest.examSectionSubmissions || []
          ).map((ss: any) => {
            const title = ss.section?.title || "Section";
            const totalScore = ss.totalScore || 0;
            return {
              title,
              totalScore,
              isUnderReview: isSectionUnderReview(title, totalScore),
            };
          });

          const totalScore = sectionScores.reduce(
            (sum, s) => sum + (s.isUnderReview ? 0 : s.totalScore),
            0,
          );

          setLatestExam({
            id: latest.id,
            examTitle: latest.exam?.title || "Exam",
            submittedAt: latest.submittedAt,
            totalScore,
            sectionScores,
            hasReviewSections: sectionScores.some((s) => s.isUnderReview),
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome to your personal dashboard.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Exams Taken</span>
          <span className="text-3xl font-bold text-gray-900">{totalExams}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Latest Score</span>
          <span className="text-3xl font-bold text-gray-900">
            {latestExam ? latestExam.totalScore : "—"}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Sections Under Review</span>
          <span className="text-3xl font-bold text-gray-900">
            {latestExam
              ? latestExam.sectionScores.filter((s) => s.isUnderReview).length
              : 0}
          </span>
        </div>
      </div>

      {/* Latest Exam Result Card — styled like the finish page */}
      {latestExam ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <CheckCircle2 size={20} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {latestExam.examTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest result •{" "}
                  {latestExam.submittedAt
                    ? new Date(latestExam.submittedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : "—"}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/scores"
              className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="p-6">
            {/* Total Score Highlight */}
            <div className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-5 flex flex-col items-center mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy size={80} />
              </div>
              <span className="text-blue-500 font-bold uppercase tracking-wider text-[10px] mb-1 relative z-10">
                Estimated Score
              </span>
              <div className="text-4xl font-black text-blue-600 relative z-10">
                {latestExam.totalScore}
              </div>
              {latestExam.hasReviewSections && (
                <span className="text-orange-500 text-[11px] font-bold mt-1 relative z-10">
                  Some sections still under review
                </span>
              )}
            </div>

            {/* Section Breakdown Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {latestExam.sectionScores.map((section, idx) => {
                const t = section.title.toLowerCase();
                let color = {
                  bg: "bg-slate-50",
                  text: "text-slate-600",
                  border: "border-slate-100",
                };
                if (t.includes("listen"))
                  color = {
                    bg: "bg-purple-50",
                    text: "text-purple-600",
                    border: "border-purple-100",
                  };
                else if (t.includes("read"))
                  color = {
                    bg: "bg-blue-50",
                    text: "text-blue-600",
                    border: "border-blue-100",
                  };
                else if (t.includes("writ"))
                  color = {
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                    border: "border-amber-100",
                  };
                else if (t.includes("speak"))
                  color = {
                    bg: "bg-emerald-50",
                    text: "text-emerald-600",
                    border: "border-emerald-100",
                  };

                return (
                  <div
                    key={idx}
                    className={`${color.bg} border ${color.border} rounded-xl p-4`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`p-1.5 bg-white rounded-lg shadow-sm ${color.text}`}
                      >
                        {getSectionIcon(section.title)}
                      </div>
                      <span className="font-bold text-xs text-slate-600">
                        {section.title}
                      </span>
                    </div>

                    {section.isUnderReview ? (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-400" />
                        <span className="text-sm font-bold text-orange-500">
                          Under Review
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800">
                          {section.totalScore}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          pts
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            No recent activity to display
          </div>
        </div>
      )}
    </div>
  );
}

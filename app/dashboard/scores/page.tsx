"use client";

import { useEffect, useState } from "react";
import { exam } from "@/src/api/exam";
import {
  Trophy,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileX2,
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

const getSectionColor = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("listen")) return { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", bar: "bg-purple-500" };
  if (t.includes("read")) return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", bar: "bg-blue-500" };
  if (t.includes("writ")) return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", bar: "bg-amber-500" };
  if (t.includes("speak")) return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", bar: "bg-emerald-500" };
  return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", bar: "bg-slate-500" };
};

interface SectionScore {
  title: string;
  totalScore: number;
  allScore: number;
  status: string;
}

interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  totalScore: number;
  maxScore: number;
  sectionScores: SectionScore[];
}

export default function ScoresPage() {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = getCookie("token") || "";
        const data = await exam.getMySubmissions(token);
        console.log("My submissions:", data);

        // Map API response to our interface
        if (Array.isArray(data)) {
          const mapped: ExamSubmission[] = data.map((sub: any) => {
            const sectionScores: SectionScore[] = (sub.sectionSubmissions || []).map((ss: any) => ({
              title: ss.section?.title || ss.examSection?.title || "Section",
              totalScore: ss.totalScore || 0,
              allScore: ss.allScore || 0,
              status: ss.status || "unknown",
            }));

            const totalScore = sectionScores.reduce((sum, s) => sum + s.totalScore, 0);
            const maxScore = sectionScores.reduce((sum, s) => sum + s.allScore, 0);

            return {
              id: sub.id,
              examId: sub.examId,
              examTitle: sub.exam?.title || "Exam",
              status: sub.status || "unknown",
              startedAt: sub.startedAt,
              submittedAt: sub.submittedAt,
              totalScore,
              maxScore,
              sectionScores,
            };
          });
          setSubmissions(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
      case "finished":
        return (
          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">
            Completed
          </span>
        );
      case "ongoing":
        return (
          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading your scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Trophy size={22} className="text-blue-600" />
            </div>
            My Scores
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            View your exam results and section breakdowns
          </p>
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <FileX2 size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Scores Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            You haven't completed any exams yet. Start an exam to see your scores here.
          </p>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((sub) => {
          const isExpanded = expandedId === sub.id;
          const scorePercentage = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Summary Row */}
              <button
                onClick={() => toggleExpand(sub.id)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Score Circle */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                      <circle
                        cx="28" cy="28" r="24" fill="none"
                        stroke={scorePercentage >= 70 ? "#22c55e" : scorePercentage >= 40 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${(scorePercentage / 100) * 150.8} 150.8`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black text-slate-800">{scorePercentage}%</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{sub.examTitle}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-400 font-medium">{formatDate(sub.submittedAt || sub.startedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Total Score */}
                  <div className="text-right hidden sm:block">
                    <p className="text-xl font-black text-slate-800">{sub.totalScore}</p>
                    <p className="text-[11px] text-slate-400 font-bold">/ {sub.maxScore}</p>
                  </div>

                  {getStatusBadge(sub.status)}

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </button>

              {/* Expanded Section Breakdown */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Section Breakdown
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {sub.sectionScores.map((section, idx) => {
                      const color = getSectionColor(section.title);
                      const isPending =
                        section.totalScore === 0 &&
                        (section.title.toLowerCase().includes("speak") ||
                          section.title.toLowerCase().includes("writ"));
                      const pct =
                        section.allScore > 0
                          ? Math.round((section.totalScore / section.allScore) * 100)
                          : 0;

                      return (
                        <div
                          key={idx}
                          className={`${color.bg} border ${color.border} rounded-xl p-4`}
                        >
                          {/* Section Header */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 bg-white rounded-lg shadow-sm ${color.text}`}>
                              {getSectionIcon(section.title)}
                            </div>
                            <span className="font-bold text-sm text-slate-700">
                              {section.title}
                            </span>
                          </div>

                          {/* Score */}
                          {isPending ? (
                            <p className="text-sm font-bold text-orange-500">Under Review</p>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-2xl font-black text-slate-800">
                                  {section.totalScore}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                  / {section.allScore}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

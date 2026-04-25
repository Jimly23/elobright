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
  CheckCircle2,
  Clock,
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
  if (t.includes("listen"))
    return {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      bar: "bg-purple-500",
      iconBg: "bg-purple-100",
    };
  if (t.includes("read"))
    return {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      bar: "bg-blue-500",
      iconBg: "bg-blue-100",
    };
  if (t.includes("writ"))
    return {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      bar: "bg-amber-500",
      iconBg: "bg-amber-100",
    };
  if (t.includes("speak"))
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      bar: "bg-emerald-500",
      iconBg: "bg-emerald-100",
    };
  return {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-100",
    bar: "bg-slate-500",
    iconBg: "bg-slate-100",
  };
};

// Check if a section is under review (Writing/Speaking with score 0)
const isSectionUnderReview = (title: string, totalScore: number) => {
  const t = title.toLowerCase();
  return totalScore === 0 && (t.includes("speak") || t.includes("writ"));
};

interface SectionScore {
  title: string;
  totalScore: number;
  status: string;
  isUnderReview: boolean;
}

interface ExamHistory {
  id: string;
  examId: string;
  examTitle: string;
  examType: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  totalScore: number;
  sectionScores: SectionScore[];
}

export default function ScoresPage() {
  const [history, setHistory] = useState<ExamHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = getCookie("token") || "";
        const data = await exam.getExamHistory(token);
        console.log("Exam history:", data);

        if (Array.isArray(data)) {
          const mapped: ExamHistory[] = data.map((session: any) => {
            const sectionScores: SectionScore[] = (
              session.examSectionSubmissions || []
            ).map((ss: any) => {
              const title = ss.section?.title || "Section";
              const totalScore = ss.totalScore || 0;
              return {
                title,
                totalScore,
                status: ss.status || "unknown",
                isUnderReview: isSectionUnderReview(title, totalScore),
              };
            });

            // Only sum scores from non-review sections
            const totalScore = sectionScores.reduce(
              (sum, s) => sum + (s.isUnderReview ? 0 : s.totalScore),
              0,
            );

            return {
              id: session.id,
              examId: session.examId,
              examTitle: session.exam?.title || "Exam",
              examType: session.exam?.type || "SIMULATION",
              status: session.status || "unknown",
              startedAt: session.startedAt,
              submittedAt: session.submittedAt,
              totalScore,
              sectionScores,
            };
          });
          setHistory(mapped);

          // Auto-expand first item
          if (mapped.length > 0) {
            setExpandedId(mapped[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch exam history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
            <Clock size={12} />
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
          <p className="text-slate-400 text-sm font-medium">
            Loading your scores...
          </p>
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
      {history.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <FileX2 size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            No Scores Yet
          </h3>
          <p className="text-slate-400 text-sm max-w-sm">
            You haven&apos;t completed any exams yet. Start an exam to see your
            scores here.
          </p>
        </div>
      )}

      {/* History List */}
      <div className="space-y-4">
        {history.map((item) => {
          const isExpanded = expandedId === item.id;
          const reviewCount = item.sectionScores.filter(
            (s) => s.isUnderReview,
          ).length;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Summary Row */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Score Circle */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50">
                      <span className="text-lg font-black text-white">
                        {item.totalScore}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">
                      {item.examTitle}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">
                          {formatDate(item.submittedAt || item.startedAt)}
                        </span>
                      </div>
                      {reviewCount > 0 && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                          {reviewCount} section{reviewCount > 1 ? "s" : ""}{" "}
                          under review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {getStatusBadge(item.status)}
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Section Breakdown — styled like the finish page */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                  {/* Estimated Score Banner */}
                  <div className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-5 flex flex-col items-center mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Trophy size={80} />
                    </div>
                    <span className="text-blue-500 font-bold uppercase tracking-wider text-[10px] mb-1 relative z-10">
                      Estimated Score
                    </span>
                    <div className="text-4xl font-black text-blue-600 relative z-10">
                      {item.totalScore}
                    </div>
                    <span className="text-slate-400 text-[11px] mt-1 relative z-10">
                      {reviewCount > 0
                        ? `${reviewCount} section${reviewCount > 1 ? "s" : ""} still under review`
                        : "Final Score"}
                    </span>
                  </div>

                  {/* Section Breakdown Grid */}
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Section Breakdown
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {item.sectionScores.map((section, idx) => {
                      const color = getSectionColor(section.title);

                      return (
                        <div
                          key={idx}
                          className={`${color.bg} border ${color.border} rounded-xl p-4 relative overflow-hidden`}
                        >
                          {/* Section Header */}
                          <div className="flex items-center gap-2 mb-3 relative z-10">
                            <div
                              className={`p-1.5 bg-white rounded-lg shadow-sm ${color.text}`}
                            >
                              {getSectionIcon(section.title)}
                            </div>
                            <span className="font-bold text-xs text-slate-600">
                              {section.title}
                            </span>
                          </div>

                          {/* Score */}
                          <div className="relative z-10">
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

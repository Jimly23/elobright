"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Award, Search, Pencil, Mail, Download, X, Save, AlertTriangle, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import Cookies from 'js-cookie';
import { certificationService, CertificationScore, CertificationAdditionalScore } from '@/src/api/certification';
import { examService } from '@/src/api/exam';

export default function CertificationPage() {
  const [scores, setScores] = useState<CertificationScore[]>([]);
  const [additionalScoreDefs, setAdditionalScoreDefs] = useState<CertificationAdditionalScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterSubmissionId, setFilterSubmissionId] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');

  // Edit modal state
  const [editingScore, setEditingScore] = useState<CertificationScore | null>(null);
  const [editForm, setEditForm] = useState<{
    additionalScores: Record<string, string>;
    examScoreOverride: string;
    useOverride: boolean;
  }>({ additionalScores: {}, examScoreOverride: '', useOverride: false });
  const [editLoading, setEditLoading] = useState(false);

  // Email state
  const [emailConfirmId, setEmailConfirmId] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<{ to: string; fullName: string; downloadUrl: string } | null>(null);

  const token = Cookies.get('token');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [scoresData, defsData, reportData] = await Promise.all([
        certificationService.getAllScores(token, appliedFilter || undefined),
        certificationService.getAllAdditionalScores(token),
        examService.getReport(token).catch(() => ({ data: [] })),
      ]);

      const reportMap = new Map();
      if (reportData?.data) {
        reportData.data.forEach((user: any) => {
          if (user.exams) {
            user.exams.forEach((exam: any) => {
               reportMap.set(exam.submissionId, {
                  name: user.nama || user.email,
                  email: user.email,
                  examTitle: exam.examTitle,
                  rawScore: exam.totalScore,
               });
            });
          }
        });
      }

      const rawScores = Array.isArray(scoresData) ? scoresData : [];
      const mappedScores = rawScores.map((score: any) => {
        const reportInfo = reportMap.get(score.examSubmissionId);
        if (reportInfo) {
           return {
             ...score,
             user: {
               ...score.user,
               id: score.userId,
               fullName: reportInfo.name,
               email: reportInfo.email,
             },
             examSubmission: {
               ...score.examSubmission,
               exam: {
                 ...score.examSubmission?.exam,
                 title: reportInfo.examTitle,
               }
             },
             rawExamScore: reportInfo.rawScore
           }
        }
        return score;
      });

      setScores(mappedScores);
      setAdditionalScoreDefs(Array.isArray(defsData) ? defsData : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load certification data.');
    } finally {
      setLoading(false);
    }
  }, [token, appliedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilter(filterSubmissionId.trim());
  };

  const handleClearFilter = () => {
    setFilterSubmissionId('');
    setAppliedFilter('');
  };

  // --- Edit ---
  const openEditModal = (score: CertificationScore) => {
    const additionalScores: Record<string, string> = {};
    additionalScoreDefs.forEach(def => {
      additionalScores[def.scoreName] = score.additionalScore?.[def.scoreName]?.toString() || '';
    });

    setEditingScore(score);
    setEditForm({
      additionalScores,
      examScoreOverride: score.examScoreOverride?.toString() || '',
      useOverride: score.examScoreOverride !== null && score.examScoreOverride !== undefined,
    });
    setError('');
    setSuccessMsg('');
  };

  const computePreviewScore = () => {
    if (!editingScore) return null;

    const examScore = editForm.useOverride && editForm.examScoreOverride
      ? parseFloat(editForm.examScoreOverride)
      : null;

    if (examScore === null) return 'Using auto-calculated exam score';

    const totalAdditionalWeight = additionalScoreDefs.reduce((sum, def) => sum + def.weight, 0);
    const examWeight = Math.max(0, 1 - totalAdditionalWeight);

    let finalScore = examScore * examWeight;
    additionalScoreDefs.forEach(def => {
      const val = parseFloat(editForm.additionalScores[def.scoreName] || '0');
      if (!isNaN(val)) {
        finalScore += val * def.weight;
      }
    });

    return finalScore.toFixed(1);
  };

  const handleSaveEdit = async () => {
    if (!editingScore) return;
    setEditLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const additionalScore: Record<string, number> = {};
      let hasAdditional = false;
      additionalScoreDefs.forEach(def => {
        const val = editForm.additionalScores[def.scoreName];
        if (val !== '' && val !== undefined) {
          additionalScore[def.scoreName] = parseFloat(val);
          hasAdditional = true;
        }
      });

      await certificationService.updateScore(editingScore.id, {
        additional_score: additionalScore,
        exam_score_override: editForm.useOverride && editForm.examScoreOverride
          ? parseFloat(editForm.examScoreOverride)
          : null,
      }, token);

      setSuccessMsg('Certification score updated successfully.');
      setEditingScore(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update score.');
    } finally {
      setEditLoading(false);
    }
  };

  // --- Email ---
  const handleSendEmail = async (score: CertificationScore) => {
    setEmailLoading(true);
    setError('');
    setSuccessMsg('');
    setEmailResult(null);

    try {
      const result = await certificationService.blastEmail({
        exam_submission_id: score.examSubmissionId,
      }, token);
      setEmailResult({ to: result.to, fullName: result.fullName, downloadUrl: result.downloadUrl });
      setSuccessMsg(`Certificate email sent to ${result.to}`);
      setEmailConfirmId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send certificate email.');
      setEmailConfirmId(null);
    } finally {
      setEmailLoading(false);
    }
  };

  // --- Download ---
  const handleDownload = (id: string) => {
    const url = certificationService.getDownloadUrl(id);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading certification scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Award size={22} className="text-blue-600" />
          </div>
          Certification Scores
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage certification scores, edit additional scores, and send certificate emails.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Email Result */}
      {emailResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5">
          <h3 className="text-sm font-bold text-green-700 mb-3">Email Sent Successfully</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">To</p>
              <p className="text-slate-900 font-medium mt-0.5">{emailResult.to}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Name</p>
              <p className="text-slate-900 font-medium mt-0.5">{emailResult.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Download URL</p>
              <a href={emailResult.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium mt-0.5 hover:underline flex items-center gap-1">
                Open <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <button onClick={() => setEmailResult(null)} className="mt-3 text-xs text-slate-400 hover:text-slate-600">Dismiss</button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter by Exam Submission ID</label>
            <input
              type="text"
              value={filterSubmissionId}
              onChange={(e) => setFilterSubmissionId(e.target.value)}
              placeholder="Enter exam submission UUID..."
              className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all"
            >
              <Search size={16} />
              Filter
            </button>
            {appliedFilter && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Scores Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {scores.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Award size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Certification Scores</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              {appliedFilter
                ? 'No scores found for this submission ID. Try a different filter.'
                : 'Certification scores will appear here after users complete exams.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Exam Submission</th>
                  <th className="px-6 py-3.5">Raw Exam Score</th>
                  <th className="px-6 py-3.5">Additional Scores</th>
                  <th className="px-6 py-3.5">Exam Override</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scores.map((score) => (
                  <tr key={score.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{score.user?.fullName || `User #${score.userId}`}</p>
                        <p className="text-xs text-slate-400">{score.user?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-700 text-xs font-mono truncate max-w-[180px]" title={score.examSubmissionId}>
                          {score.examSubmissionId}
                        </p>
                        {score.examSubmission?.exam?.title && (
                          <p className="text-xs text-slate-400 mt-0.5">{score.examSubmission.exam.title}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                        {score.rawExamScore !== undefined ? score.rawExamScore : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {score.additionalScore && Object.keys(score.additionalScore).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(score.additionalScore).map(([key, val]) => (
                            <span key={key} className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {score.examScoreOverride !== null && score.examScoreOverride !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg">
                          {score.examScoreOverride}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">Auto</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(score)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Scores"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(score.id)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        {emailConfirmId === score.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSendEmail(score)}
                              disabled={emailLoading}
                              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg transition-all"
                            >
                              {emailLoading ? 'Sending...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setEmailConfirmId(null)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEmailConfirmId(score.id)}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                            title="Send Certificate Email"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingScore && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Certification Score</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingScore.user?.fullName || `User #${editingScore.userId}`}</p>
              </div>
              <button onClick={() => setEditingScore(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Additional Scores */}
              {additionalScoreDefs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Additional Scores</p>
                  <div className="space-y-3">
                    {additionalScoreDefs.map(def => (
                      <div key={def.id} className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-700 flex-1 min-w-0">
                          <span className="truncate block">{def.scoreName}</span>
                          <span className="text-[10px] text-slate-400">weight: {def.weight}</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={editForm.additionalScores[def.scoreName] || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            additionalScores: { ...editForm.additionalScores, [def.scoreName]: e.target.value }
                          })}
                          placeholder="0-100"
                          className="w-28 px-3 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Score Override */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Exam Score Override</p>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.useOverride}
                      onChange={(e) => setEditForm({ ...editForm, useOverride: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 font-medium">Use manual override</span>
                  </label>
                </div>
                {editForm.useOverride && (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editForm.examScoreOverride}
                    onChange={(e) => setEditForm({ ...editForm, examScoreOverride: e.target.value })}
                    placeholder="0-100"
                    className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                  />
                )}
                {!editForm.useOverride && (
                  <p className="text-xs text-slate-400 italic">Using auto-calculated exam score from submission.</p>
                )}
              </div>

              {/* Preview */}
              <div className="bg-blue-50/50 border-2 border-blue-100 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Preview Final Score</p>
                <p className="text-3xl font-black text-blue-600">
                  {computePreviewScore() || '—'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingScore(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl transition-all"
              >
                {editLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

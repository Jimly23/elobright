import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, UserPlus, X } from 'lucide-react';
import Cookies from 'js-cookie';
import {
  certificationService,
  CertificationAdditionalScore,
  CertificationScore,
  ManualScorePayload,
} from '@/src/api/certification';
import { examService } from '@/src/api/exam';

export interface ManualScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: [string, string][]; // [id, title]
  definitions: CertificationAdditionalScore[];
  onComplete: () => void;
}

interface ExamSection {
  id: string;
  title: string;
}

type ModalStatus = 'idle' | 'submitting' | 'success' | 'error';

type ApiError = { response?: { data?: { error?: string; message?: string; details?: Array<{ message: string }> } }; message?: string };

const getError = (err: unknown, fallback: string): string => {
  const data = (err as ApiError)?.response?.data;
  if (data?.details && data.details.length > 0) {
    return data.details.map((d) => d.message).join('\n');
  }
  return data?.error ?? data?.message ?? (err as ApiError)?.message ?? fallback;
};

export function ManualScoreModal({
  isOpen,
  onClose,
  exams,
  definitions,
  onComplete,
}: ManualScoreModalProps) {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [examId, setExamId] = useState('');
  const [groupNumber, setGroupNumber] = useState('');

  // Dynamic sections from selected exam
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionValues, setSectionValues] = useState<Record<string, string>>({});

  // Additional score values
  const [additionalValues, setAdditionalValues] = useState<Record<string, string>>({});

  // Status
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [error, setError] = useState('');
  const [resultScore, setResultScore] = useState<CertificationScore | null>(null);

  // Set initial exam when modal opens
  useEffect(() => {
    if (isOpen && exams.length > 0 && !examId) {
      setExamId(exams[0][0]);
    }
  }, [isOpen, exams, examId]);

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setStudentId('');
      setDegreeProgram('');
      setExamId(exams.length > 0 ? exams[0][0] : '');
      setGroupNumber('');
      setSections([]);
      setSectionValues({});
      setAdditionalValues({});
      setStatus('idle');
      setError('');
      setResultScore(null);
    }
  }, [isOpen, exams]);

  // Fetch sections when exam changes
  const loadSections = useCallback(async (selectedExamId: string) => {
    if (!selectedExamId) {
      setSections([]);
      setSectionValues({});
      return;
    }

    const token = Cookies.get('token');
    try {
      setSectionsLoading(true);
      const data = await examService.getSectionsByExamId(selectedExamId, token);
      const sectionList: ExamSection[] = Array.isArray(data)
        ? data.map((s: { id: string; title?: string; name?: string }) => ({
            id: s.id,
            title: s.title ?? s.name ?? s.id,
          }))
        : [];
      setSections(sectionList);
      setSectionValues({});
    } catch {
      setSections([]);
      setSectionValues({});
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && examId) {
      void loadSections(examId);
    }
  }, [isOpen, examId, loadSections]);

  const handleExamChange = (newExamId: string) => {
    setExamId(newExamId);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!fullName.trim()) { setError('Nama lengkap wajib diisi.'); return; }
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    if (!studentId.trim()) { setError('NIM wajib diisi.'); return; }
    if (!examId) { setError('Pilih ujian terlebih dahulu.'); return; }

    // Build payload — strict, no extra fields
    const payload: ManualScorePayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      studentId: studentId.trim(),
      examId,
    };

    if (phoneNumber.trim()) payload.phoneNumber = phoneNumber.trim();
    if (degreeProgram.trim()) payload.degreeProgram = degreeProgram.trim();
    if (groupNumber.trim()) payload.groupNumber = groupNumber.trim();

    // Build examScoreOverride from non-empty section values
    const overrides: Record<string, number> = {};
    for (const section of sections) {
      const val = (sectionValues[section.id] ?? '').trim();
      if (!val) continue;
      const num = Number(val);
      if (!Number.isFinite(num) || num < 0 || num > 100) {
        setError(`Nilai ${section.title} harus berupa angka 0–100.`);
        return;
      }
      overrides[section.title] = num;
    }
    if (Object.keys(overrides).length > 0) {
      payload.examScoreOverride = overrides;
    }

    // Build additionalScore from non-empty values
    const additional: Record<string, number> = {};
    for (const def of definitions) {
      const val = (additionalValues[def.id] ?? '').trim();
      if (!val) continue;
      const num = Number(val);
      if (!Number.isFinite(num) || num < 0 || num > 100) {
        setError(`Nilai ${def.scoreName} harus berupa angka 0–100.`);
        return;
      }
      additional[def.scoreName] = num;
    }
    if (Object.keys(additional).length > 0) {
      payload.additionalScore = additional;
    }

    const token = Cookies.get('token');
    try {
      setStatus('submitting');
      const result = await certificationService.createManualScore(payload, token);
      setResultScore(result.score);
      setStatus('success');
    } catch (err: unknown) {
      setError(getError(err, 'Gagal membuat skor sertifikasi manual.'));
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  const isFormDisabled = status === 'submitting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Entri Manual Skor</h2>
              <p className="text-xs text-slate-500">Buat skor sertifikasi tanpa ujian</p>
            </div>
          </div>
          <button
            onClick={() => { if (status === 'success') onComplete(); onClose(); }}
            disabled={isFormDisabled}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* === SUCCESS === */}
          {status === 'success' && resultScore && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-800">Skor Berhasil Dibuat!</h3>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Nama</p>
                    <p className="font-bold text-slate-800">{resultScore.user?.fullName ?? fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-bold text-slate-800">{resultScore.user?.email ?? email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">NIM</p>
                    <p className="font-bold text-slate-800">{resultScore.student?.studentId ?? studentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ujian</p>
                    <p className="font-bold text-slate-800">{resultScore.exam?.title ?? 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Nilai Ujian (Original)</p>
                      <p className="font-bold text-slate-800">
                        {Number.isFinite(resultScore.originalExamScore)
                          ? resultScore.originalExamScore.toFixed(1)
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Score</p>
                      <p className="text-lg font-black text-emerald-600">
                        {Number.isFinite(resultScore.totalScore)
                          ? resultScore.totalScore.toFixed(1)
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => { onComplete(); onClose(); }}
                  className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600"
                >
                  Selesai &amp; Muat Ulang
                </button>
              </div>
            </div>
          )}

          {/* === FORM (idle / submitting / error) === */}
          {status !== 'success' && (
            <form id="manual-score-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
              {/* Data User */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Data User</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isFormDisabled}
                      placeholder="Budi Santoso"
                      maxLength={255}
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isFormDisabled}
                      placeholder="budi@example.com"
                      maxLength={255}
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700">
                      NIM <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={isFormDisabled}
                      placeholder="23SA21A045"
                      maxLength={50}
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700">Telepon</span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isFormDisabled}
                      placeholder="08123456789"
                      maxLength={50}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-bold text-slate-700">Program Studi</span>
                    <input
                      type="text"
                      value={degreeProgram}
                      onChange={(e) => setDegreeProgram(e.target.value)}
                      disabled={isFormDisabled}
                      placeholder="Teknik Informatika"
                      maxLength={255}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>

              {/* Data Ujian */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Data Ujian</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700">
                      Ujian <span className="text-red-500">*</span>
                    </span>
                    <select
                      value={examId}
                      onChange={(e) => handleExamChange(e.target.value)}
                      disabled={isFormDisabled}
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="" disabled>-- Pilih Ujian --</option>
                      {exams.map(([id, title]) => (
                        <option key={id} value={id}>{title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700">Nomor Kelompok</span>
                    <input
                      type="text"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      disabled={isFormDisabled}
                      placeholder="G5"
                      maxLength={50}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>

              {/* Override Nilai Section (dinamis) */}
              <div>
                <h3 className="text-sm font-bold text-slate-800">Override Nilai Section</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Nilai per section ujian (0–100). Kosongkan jika tidak ingin mengisi override.
                </p>
                {sectionsLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    Memuat section ujian...
                  </div>
                ) : sections.length > 0 ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {sections.map((section) => (
                      <label key={section.id} className="rounded-xl border border-slate-200 p-3">
                        <span className="block text-xs font-bold text-slate-700">{section.title}</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={sectionValues[section.id] ?? ''}
                          onChange={(e) =>
                            setSectionValues((prev) => ({
                              ...prev,
                              [section.id]: e.target.value,
                            }))
                          }
                          disabled={isFormDisabled}
                          placeholder="0–100"
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                        />
                      </label>
                    ))}
                  </div>
                ) : examId ? (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    Ujian ini tidak memiliki section.
                  </p>
                ) : null}
              </div>

              {/* Skor Tambahan (dari definitions) */}
              <div>
                <h3 className="text-sm font-bold text-slate-800">Skor Tambahan</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Nilai tambahan (0–100). Kosongkan jika tidak ingin mengisi.
                </p>
                {definitions.length > 0 ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {definitions.map((def) => (
                      <label key={def.id} className="rounded-xl border border-slate-200 p-3">
                        <span className="block text-xs font-bold text-slate-700">{def.scoreName}</span>
                        <span className="block text-[11px] text-slate-400">Bobot: {def.weight}</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={additionalValues[def.id] ?? ''}
                          onChange={(e) =>
                            setAdditionalValues((prev) => ({
                              ...prev,
                              [def.id]: e.target.value,
                            }))
                          }
                          disabled={isFormDisabled}
                          placeholder="0–100"
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-300 focus:border-blue-500 disabled:opacity-50"
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    Belum ada definisi skor tambahan.
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="whitespace-pre-line flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {status !== 'success' && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isFormDisabled}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="manual-score-form"
              disabled={isFormDisabled}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isFormDisabled ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {isFormDisabled ? 'Menyimpan...' : 'Buat Skor Manual'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Archive, CheckCircle2, Download, Loader2, X, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import Cookies from 'js-cookie';
import {
  triggerMassDownload,
  streamExportProgress,
  pollExportProgress,
  requestDownloadToken,
  triggerBrowserDownload,
  ExportUiState,
  SseEvent,
  CertificationScoreWithUser,
} from '@/src/api/certification/massDownload';

export interface MassDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: [string, string][]; // [id, title]
}

/** Format remaining time from milliseconds to human-readable string */
function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Kedaluwarsa';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function MassDownloadModal({ isOpen, onClose, exams }: MassDownloadModalProps) {
  const [examId, setExamId] = useState(exams.length > 0 ? exams[0][0] : '');
  const [state, setState] = useState<ExportUiState>({ kind: 'idle' });
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const abortRef = useRef<(() => void) | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync exam selection when exams list changes
  useEffect(() => {
    if (exams.length > 0 && !examId) setExamId(exams[0][0]);
  }, [exams, examId]);

  // Cleanup all timers/streams on unmount or modal close
  const cleanup = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Start countdown timer when export is done
  useEffect(() => {
    if (state.kind === 'done') {
      const tick = () => {
        const r = state.expiresAt - Date.now();
        setRemaining(r > 0 ? r : 0);
      };
      tick();
      countdownRef.current = setInterval(tick, 1000);
      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      };
    } else {
      setRemaining(null);
    }
  }, [state]);

  // Reset state on modal close
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setState({ kind: 'idle' });
      setDownloadBusy(false);
      setDownloadError(null);
    }
  }, [isOpen, cleanup]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  /** Start polling as SSE fallback */
  const startPolling = useCallback((exportId: string, examIdForState: string, token: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const data = await pollExportProgress(exportId, token);

        if (data.state === 'completed' && data.downloadUrl && data.expiresAt) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setState({
            kind: 'done',
            exportId,
            downloadUrl: data.downloadUrl,
            expiresAt: data.expiresAt,
            total: data.total,
          });
        } else if (data.state === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setState({
            kind: 'error',
            message: data.failedReason ?? 'Export gagal',
          });
        } else {
          setState({
            kind: 'running',
            exportId,
            examId: examIdForState,
            generated: data.generated,
            total: data.total,
            percentage: data.percentage,
            current: data.current,
            phase: data.state === 'archiving' ? 'archiving' : 'generating',
          });
        }
      } catch (err: unknown) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Koneksi polling terputus',
        });
      }
    }, 3000);
  }, []);

  /** Handle SSE event */
  const handleSseEvent = useCallback((ev: SseEvent, exportId: string, examIdForState: string) => {
    if (ev.event === 'init' || ev.event === 'progress') {
      setState({
        kind: 'running',
        exportId: ev.exportId,
        examId: examIdForState,
        generated: ev.generated,
        total: ev.total,
        percentage: ev.percentage,
        current: ev.current as CertificationScoreWithUser | null,
        phase: ev.state === 'archiving' ? 'archiving' : 'generating',
      });
    } else if (ev.event === 'completed') {
      setState({
        kind: 'done',
        exportId: ev.exportId,
        downloadUrl: ev.downloadUrl,
        expiresAt: ev.expiresAt,
        total: ev.total,
      });
    } else if (ev.event === 'failed') {
      setState({
        kind: 'error',
        message: ev.failedReason ?? 'Export gagal',
      });
    } else if (ev.event === 'not_found') {
      setState({
        kind: 'error',
        message: 'Export tidak ditemukan',
      });
    }
  }, []);

  /** Main trigger function */
  const startExport = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      setState({ kind: 'error', message: 'Token autentikasi tidak ditemukan. Silakan login ulang.' });
      return;
    }
    if (!examId) {
      setState({ kind: 'error', message: 'Pilih ujian terlebih dahulu.' });
      return;
    }

    setState({ kind: 'triggering' });
    setDownloadError(null);

    try {
      const { exportId } = await triggerMassDownload(examId, token);

      setState({
        kind: 'running',
        exportId,
        examId,
        generated: 0,
        total: 0,
        percentage: 0,
        current: null,
        phase: 'generating',
      });

      // Cleanup previous streams
      abortRef.current?.();

      // Start SSE stream
      abortRef.current = streamExportProgress(
        exportId,
        token,
        (ev) => handleSseEvent(ev, exportId, examId),
        (err) => {
          // SSE failed — fallback to polling
          console.warn('SSE gagal, fallback ke polling:', err.message);
          startPolling(exportId, examId, token);
        },
      );
    } catch (e: unknown) {
      const err = e as Error & { status?: number };
      if (err.status === 409) {
        setState({
          kind: 'error',
          message: 'Export lain sedang berjalan. Harap tunggu hingga selesai sebelum memulai export baru.',
        });
      } else {
        setState({
          kind: 'error',
          message: err.message ?? 'Gagal memulai export',
        });
      }
    }
  }, [examId, handleSseEvent, startPolling]);

  /** Handle download button click */
  const handleDownload = useCallback(async () => {
    if (state.kind !== 'done') return;

    const token = Cookies.get('token');
    if (!token) {
      setDownloadError('Token autentikasi tidak ditemukan. Silakan login ulang.');
      return;
    }

    setDownloadBusy(true);
    setDownloadError(null);

    try {
      const { downloadUrl } = await requestDownloadToken(state.exportId, token);
      triggerBrowserDownload(downloadUrl, `certificates-${state.exportId}.zip`);
    } catch (e: unknown) {
      const err = e as Error;
      setDownloadError(err.message ?? 'Gagal meminta token download');
    } finally {
      setDownloadBusy(false);
    }
  }, [state]);

  if (!isOpen) return null;

  const isExpired = remaining !== null && remaining <= 0;
  const isRunning = state.kind === 'running' || state.kind === 'triggering';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <Archive size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Export Sertifikat Massal</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* === IDLE / TRIGGERING === */}
          {(state.kind === 'idle' || state.kind === 'triggering') && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Pilih Ujian</label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  disabled={state.kind === 'triggering'}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
                >
                  <option value="" disabled>-- Pilih Ujian --</option>
                  {exams.map(([id, title]) => (
                    <option key={id} value={id}>{title}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs text-amber-800">
                  <strong>Catatan:</strong> Proses ini akan membuat sertifikat PDF untuk semua peserta ujian terpilih,
                  mengarsipkannya ke file ZIP, dan menyediakan link download yang berlaku selama 1 jam.
                  Hanya satu export yang bisa berjalan pada satu waktu.
                </p>
              </div>
            </div>
          )}

          {/* === RUNNING === */}
          {state.kind === 'running' && (
            <div className="space-y-6">
              <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-4 animate-spin text-blue-500" />
                <h3 className="text-lg font-bold text-slate-800">
                  {state.phase === 'archiving' ? 'Mengarsipkan ZIP...' : 'Membuat Sertifikat...'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {state.phase === 'archiving'
                    ? 'Semua sertifikat selesai dibuat, sedang mengarsipkan ke ZIP...'
                    : `${state.generated} dari ${state.total} sertifikat selesai`}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{state.percentage}%</span>
                  <span>{state.generated} / {state.total}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${state.percentage}%` }}
                  />
                </div>
              </div>

              {/* Current item being processed */}
              {state.current && state.phase === 'generating' && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-700">Sedang memproses:</p>
                  <p className="mt-1 text-sm text-blue-900">
                    {state.current.user?.fullName ?? `User #${state.current.userId}`}
                    {state.current.student?.studentId && (
                      <span className="ml-2 text-xs text-blue-600">
                        ({state.current.student.studentId})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* === DONE === */}
          {state.kind === 'done' && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-800">Export Selesai!</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {state.total} sertifikat berhasil dibuat dan diarsipkan.
                </p>
              </div>

              {/* Expiry countdown */}
              <div className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm ${
                isExpired
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <Clock size={16} />
                {isExpired
                  ? 'Link download telah kedaluwarsa. Silakan export ulang.'
                  : `Link download berlaku selama: ${formatRemaining(remaining ?? 0)}`}
              </div>

              {/* Download button */}
              <div className="text-center space-y-3">
                <button
                  disabled={downloadBusy || isExpired}
                  onClick={() => void handleDownload()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {downloadBusy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {downloadBusy ? 'Menyiapkan download...' : 'Download ZIP'}
                </button>

                {downloadError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>{downloadError}</p>
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Token download berlaku 30 detik dan hanya bisa dipakai sekali.
                  Klik lagi untuk meminta token baru.
                </p>
              </div>
            </div>
          )}

          {/* === ERROR === */}
          {state.kind === 'error' && (
            <div className="space-y-6">
              <div className="text-center">
                <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-bold text-slate-800">Export Gagal</h3>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {state.message}
              </div>
              <div className="text-center">
                <button
                  onClick={() => setState({ kind: 'idle' })}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer — only show action button during idle/triggering */}
        {(state.kind === 'idle' || state.kind === 'triggering') && (
          <div className="border-t border-slate-100 bg-slate-50 p-4 text-right">
            <button
              onClick={() => void startExport()}
              disabled={!examId || state.kind === 'triggering'}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.kind === 'triggering' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memulai Export...
                </>
              ) : (
                <>
                  <Archive size={16} />
                  Mulai Export
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

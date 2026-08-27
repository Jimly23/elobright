import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';

export interface ImportScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: [string, string][]; // [id, title]
  onComplete: () => void;
}

export function ImportScoreModal({ isOpen, onClose, exams, onComplete }: ImportScoreModalProps) {
  const [examId, setExamId] = useState(exams.length > 0 ? exams[0][0] : '');
  const [file, setFile] = useState<File | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  
  // States
  const [status, setStatus] = useState<'idle' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    if (exams.length > 0 && !examId) setExamId(exams[0][0]);
  }, [exams]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  const reset = () => {
    setFile(null);
    setImportId(null);
    setStatus('idle');
    setProgress(null);
    setWarnings([]);
    setError('');
    setResult(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleUpload = async () => {
    if (!file || !examId) return;
    
    try {
      setStatus('uploading');
      setError('');
      setWarnings([]);
      
      const formData = new FormData();
      formData.append('examId', examId);
      formData.append('file', file);
      
      const token = Cookies.get('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/$/, '') || 'http://localhost:3001';
      
      const response = await fetch(`${baseUrl}/api/certification-scores/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Gagal mengunggah file.');
      }
      
      setImportId(data.importId);
      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }
      
      setStatus('queued');
      startSSE(data.importId, baseUrl, token || '');
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setStatus('failed');
    }
  };

  const startSSE = (id: string, baseUrl: string, token: string) => {
    // We cannot easily pass Auth header to standard EventSource.
    // As a workaround for this codebase, we will poll instead if SSE requires headers.
    // The backend instruction mentions "fetch SSE polyfill karena EventSource tidak support header",
    // but since we don't want to install new dependencies like @microsoft/fetch-event-source, 
    // we will use the polling fallback as recommended in the backend guide.
    startPolling(id, baseUrl, token);
  };

  const startPolling = (id: string, baseUrl: string, token: string) => {
    setStatus('processing');
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${baseUrl}/api/certification-scores/import/${id}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Gagal mendapatkan progress');
        }
        
        setProgress(data.progress);
        
        if (data.state === 'completed') {
          clearInterval(interval);
          setStatus('completed');
          setResult(data.returnvalue);
        } else if (data.state === 'failed') {
          clearInterval(interval);
          setStatus('failed');
          setError(data.failedReason || 'Proses import gagal');
        }
      } catch (err: any) {
        clearInterval(interval);
        setStatus('failed');
        setError(err.message || 'Koneksi terputus saat polling progress.');
      }
    }, 1500);
    
    // Save interval to ref if needed to cleanup on unmount
    (window as any)._importPollInterval = interval;
  };
  
  useEffect(() => {
    return () => {
      if ((window as any)._importPollInterval) {
        clearInterval((window as any)._importPollInterval);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Import Nilai Sertifikasi</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {status === 'idle' || status === 'uploading' ? (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Pilih Ujian</label>
                <select
                  value={examId}
                  onChange={e => setExamId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="" disabled>-- Pilih Ujian --</option>
                  {exams.map(([id, title]) => (
                    <option key={id} value={id}>{title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">File Excel/CSV</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-slate-500">Maks. 5 MB. Wajib memiliki kolom <b>NIM</b>.</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                {status === 'processing' || status === 'queued' ? (
                  <Loader2 size={48} className="mx-auto mb-4 animate-spin text-blue-500" />
                ) : status === 'completed' ? (
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                ) : (
                  <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
                )}
                <h3 className="text-lg font-bold text-slate-800">
                  {status === 'queued' ? 'Menunggu Antrean...' : 
                   status === 'processing' ? 'Memproses Import...' : 
                   status === 'completed' ? 'Import Selesai!' : 'Import Gagal'}
                </h3>
              </div>

              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{progress.percent}% Selesai</span>
                    <span>{progress.processed} / {progress.total} Baris</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div 
                      className={`h-full transition-all duration-300 ${status === 'completed' ? 'bg-emerald-500' : status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <p className="text-slate-500">Total</p>
                      <p className="font-bold text-slate-800">{progress.total}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-100">
                      <p className="text-emerald-700">Berhasil</p>
                      <p className="font-bold text-emerald-800">{progress.success}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2 border border-red-100">
                      <p className="text-red-700">Gagal</p>
                      <p className="font-bold text-red-800">{progress.failed}</p>
                    </div>
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-2 text-xs font-bold text-amber-800">Peringatan dari Sistem:</p>
                  <ul className="list-disc pl-4 text-xs text-amber-700 space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {status === 'completed' && result && (
                <div className="text-center">
                  <button onClick={() => { onClose(); onComplete(); }} className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600">
                    Selesai & Muat Ulang
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {(status === 'idle' || status === 'uploading') && (
          <div className="border-t border-slate-100 bg-slate-50 p-4 text-right">
            <button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {status === 'uploading' ? (
                <><Loader2 size={16} className="animate-spin" /> Mengunggah...</>
              ) : (
                <><Upload size={16} /> Mulai Import</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

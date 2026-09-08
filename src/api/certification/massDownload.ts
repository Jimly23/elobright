// Mass Certificate Download API Service
// Uses fetch directly (not axios) because SSE streaming requires res.body.getReader()

// --- Types ---

export interface CertificationScoreWithUser {
  id: string;
  userId: number;
  examSubmissionId: string;
  additionalScore: Record<string, number> | null;
  examScoreOverride?: Record<string, number> | null;
  user?: {
    id: number;
    email: string;
    fullName: string | null;
    role: string;
    phoneNumber: string | null;
  };
  originalExamScore?: number;
  totalScore?: number;
  exam?: { id: string; title: string; type: string; isOnce: boolean };
  student?: { studentId: string; degreeProgram?: string | null } | null;
  scores?: { sectionId: string; sectionName: string; correctPoints: number; fullPoints: number; scaledScore: number }[];
  overrides?: { sectionId: string; sectionName: string; overriddenScore: number }[];
  groupNumber?: string | null;
  degreeProgram?: string | null;
}

export type ExportUiState =
  | { kind: 'idle' }
  | { kind: 'triggering' }
  | {
      kind: 'running';
      exportId: string;
      examId: string;
      generated: number;
      total: number;
      percentage: number;
      current: CertificationScoreWithUser | null;
      phase: 'generating' | 'archiving';
    }
  | { kind: 'done'; exportId: string; downloadUrl: string; expiresAt: number; total: number }
  | { kind: 'error'; message: string };

export type SseEvent =
  | { event: 'init'; exportId: string; state: string; generated: number; total: number; percentage: number; current: CertificationScoreWithUser | null }
  | { event: 'progress'; exportId: string; state: string; generated: number; total: number; percentage: number; current: CertificationScoreWithUser | null }
  | { event: 'completed'; exportId: string; state: 'completed'; generated: number; total: number; percentage: 100; current: null; downloadUrl: string; expiresAt: number; returnvalue?: unknown }
  | { event: 'failed'; exportId: string; failedReason: string }
  | { event: 'not_found'; exportId: string };

export interface ExportProgressResponse {
  exportId: string;
  state: 'generating' | 'archiving' | 'completed' | 'failed';
  generated: number;
  total: number;
  percentage: number;
  current: CertificationScoreWithUser | null;
  downloadUrl?: string;
  expiresAt?: number;
  failedReason?: string;
}

export interface DownloadTokenResponse {
  downloadUrl: string;
  expiresAt: number;
  expiresInSeconds: number;
}

// --- Helpers ---

const getBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/$/, '') || '';
  return configured;
};

const BASE = '/api/certification-scores/mass-download';

const getFullUrl = (path: string) => `${getBaseUrl()}${path}`;

// --- API Functions ---

/**
 * Trigger a mass certificate download job for a given exam.
 * Returns the exportId used to track progress.
 */
export async function triggerMassDownload(
  examId: string,
  token: string,
): Promise<{ exportId: string; examId: string; message: string }> {
  const res = await fetch(getFullUrl(BASE), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ examId }),
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 409) {
    throw Object.assign(new Error(body.error ?? 'Export lain sedang berjalan'), { status: 409 });
  }
  if (!res.ok) {
    throw new Error(body.error ?? `Gagal memicu export (${res.status})`);
  }

  return body as { exportId: string; examId: string; message: string };
}

/**
 * Stream export progress via authenticated SSE (fetch + ReadableStream).
 * Cannot use EventSource because it doesn't support Authorization headers.
 * Returns a cleanup function to abort the stream.
 */
export function streamExportProgress(
  exportId: string,
  token: string,
  onEvent: (ev: SseEvent) => void,
  onError: (e: Error) => void,
): () => void {
  const ac = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  (async () => {
    const res = await fetch(getFullUrl(`${BASE}/${exportId}/stream`), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      signal: ac.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(new Error(body.error ?? `SSE gagal (${res.status})`));
      return;
    }

    if (!res.body) {
      onError(new Error('Tidak ada body pada respons SSE'));
      return;
    }

    reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });

      // SSE frames are delimited by \n\n
      let idx: number;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        for (const line of frame.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as SseEvent;
            onEvent(ev);

            // Terminal events — close connection
            if (ev.event === 'completed' || ev.event === 'failed' || ev.event === 'not_found') {
              ac.abort();
            }
          } catch {
            // Ignore malformed JSON frames
          }
        }
      }
    }
  })().catch((e) => {
    if ((e as Error).name !== 'AbortError') {
      onError(e as Error);
    }
  });

  return () => {
    ac.abort();
    try {
      reader?.cancel();
    } catch {
      // Ignore cancel errors
    }
  };
}

/**
 * Poll export progress (fallback when SSE fails).
 */
export async function pollExportProgress(
  exportId: string,
  token: string,
): Promise<ExportProgressResponse> {
  const res = await fetch(getFullUrl(`${BASE}/${exportId}/progress`), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error ?? `Gagal mendapatkan progress (${res.status})`);
  }

  return body as ExportProgressResponse;
}

/**
 * Request a short-lived download token (30 seconds, single-use).
 * Must be called with Bearer auth. The returned downloadUrl contains ?token=...
 * which can be used without auth headers.
 */
export async function requestDownloadToken(
  exportId: string,
  token: string,
): Promise<DownloadTokenResponse> {
  const res = await fetch(getFullUrl(`${BASE}/${exportId}/request-download`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error ?? `Gagal meminta token download (${res.status})`);
  }

  return body as DownloadTokenResponse;
}

/**
 * Trigger a browser-native file download using a tokenized URL.
 * Creates a temporary <a> element and clicks it programmatically.
 * No Bearer header needed — the token in the URL is the auth.
 */
export function triggerBrowserDownload(downloadUrl: string, filename?: string) {
  // downloadUrl is a relative path — prepend base URL
  const fullUrl = getFullUrl(downloadUrl);
  const a = document.createElement('a');
  a.href = fullUrl;
  if (filename) a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

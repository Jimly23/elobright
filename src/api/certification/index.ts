import api from "@/src/lib/axios";

// Helper to create config with optional token
const getConfig = (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return Object.keys(headers).length ? { headers } : undefined;
};

// --- Types ---

export interface CertificationAdditionalScore {
  id: string;
  scoreName: string;
  weight: number;
}

export interface CertificationScore {
  id: string;
  userId: number;
  examSubmissionId: string;
  additionalScore: Record<string, number> | null;
  examScoreOverride: number | null;
  originalExamScore?: number;
  finalScore?: number;
  rawExamScore?: number;
  sectionScores?: Record<string, number>;
  // Populated fields from backend (if included)
  user?: {
    id: number;
    email: string;
    fullName: string;
    studentId?: string;
    student_id?: string;
    nim?: string;
    degreeProgram?: string | null;
  };
  exam?: {
    title: string;
  };
  examSubmission?: {
    id: string;
    examId: string;
    startedAt?: string;
    exam?: {
      title: string;
    };
  };
}

export interface BlastEmailResponse {
  message: string;
  to: string;
  fullName: string;
  downloadUrl: string;
}

// --- Service ---

export const certificationService = {
  // === Additional Scores (Score Definitions) ===

  getAllAdditionalScores: async (token?: string): Promise<CertificationAdditionalScore[]> => {
    const response = await api.get('/certification-additional-scores', getConfig(token));
    return response.data;
  },

  getAdditionalScoreById: async (id: string, token?: string): Promise<CertificationAdditionalScore> => {
    const response = await api.get(`/certification-additional-scores/${id}`, getConfig(token));
    return response.data;
  },

  createAdditionalScore: async (
    data: { scoreName: string; weight: number },
    token?: string
  ): Promise<{ message: string; score: CertificationAdditionalScore }> => {
    const response = await api.post('/certification-additional-scores', data, getConfig(token));
    return response.data;
  },

  updateAdditionalScore: async (
    id: string,
    data: { scoreName?: string; weight?: number },
    token?: string
  ): Promise<{ message: string; score: CertificationAdditionalScore }> => {
    const response = await api.patch(`/certification-additional-scores/${id}`, data, getConfig(token));
    return response.data;
  },

  deleteAdditionalScore: async (
    id: string,
    token?: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/certification-additional-scores/${id}`, getConfig(token));
    return response.data;
  },

  // === Certification Scores ===

  getAllScores: async (token?: string, examSubmissionId?: string): Promise<CertificationScore[]> => {
    const params = examSubmissionId ? `?exam_submission_id=${examSubmissionId}` : '';
    const response = await api.get(`/certification-scores${params}`, getConfig(token));
    return response.data;
  },

  updateScore: async (
    id: string,
    data: {
      additional_score?: Record<string, number> | null;
      exam_score_override?: number | null;
    },
    token?: string
  ): Promise<{ message: string; score: CertificationScore }> => {
    const response = await api.patch(`/certification-scores/${id}`, data, getConfig(token));
    return response.data;
  },

  blastEmail: async (
    data: { exam_submission_id: string },
    token?: string
  ): Promise<BlastEmailResponse> => {
    const response = await api.post('/certification-scores/blast-email', data, getConfig(token));
    return response.data;
  },

  getDownloadUrl: (id: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/$/, '') || '';
    return `${baseUrl}/api/certification-scores/${id}/download`;
  },
};

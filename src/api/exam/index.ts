import api from "@/src/lib/axios"

// Helper to create config with optional token and content-type
const getConfig = (token?: string, isFormData: boolean = false) => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isFormData) headers['Content-Type'] = 'multipart/form-data';
  return Object.keys(headers).length ? { headers } : undefined;
};

export const examService = {
  // --- EXAMS ---
  createExam: async (data: any, token?: string) => {
    const response = await api.post('/exams', data, getConfig(token));
    return response.data;
  },
  getAllExams: async (token?: string) => {
    const response = await api.get('/exams', getConfig(token));
    return response.data;
  },
  getExamById: async (id: string, token?: string) => {
    const response = await api.get(`/exams/${id}`, getConfig(token));
    return response.data;
  },
  updateExam: async (id: string, data: any, token?: string) => {
    const response = await api.patch(`/exams/${id}`, data, getConfig(token));
    return response.data;
  },
  deleteExam: async (id: string, token?: string) => {
    const response = await api.delete(`/exams/${id}`, getConfig(token));
    return response.data;
  },

  // --- EXAM SECTIONS ---
  createSection: async (data: any, token?: string) => {
    const response = await api.post('/exam-sections', data, getConfig(token));
    return response.data;
  },
  getSectionsByExamId: async (examId: string, token?: string) => {
    const response = await api.get(`/exam-sections/exam/${examId}`, getConfig(token));
    return response.data;
  },
  getSectionById: async (id: string, token?: string) => {
    const response = await api.get(`/exam-sections/${id}`, getConfig(token));
    return response.data;
  },
  updateSection: async (id: string, data: any, token?: string) => {
    const response = await api.patch(`/exam-sections/${id}`, data, getConfig(token));
    return response.data;
  },
  reorderSection: async (id: string, direction: 'up' | 'down', token?: string) => {
    const response = await api.patch(`/exam-sections/${id}/reorder`, { direction }, getConfig(token));
    return response.data;
  },
  deleteSection: async (id: string, token?: string) => {
    const response = await api.delete(`/exam-sections/${id}`, getConfig(token));
    return response.data;
  },

  // --- QUESTIONS ---
  createQuestion: async (formData: FormData, token?: string) => {
    const response = await api.post('/questions', formData, getConfig(token, true));
    return response.data;
  },
  getQuestionsBySectionId: async (sectionId: string, token?: string) => {
    const response = await api.get(`/questions/section/${sectionId}`, getConfig(token));
    return response.data;
  },
  getQuestionById: async (id: string, token?: string) => {
    const response = await api.get(`/questions/${id}`, getConfig(token));
    return response.data;
  },
  updateQuestion: async (id: string, formData: FormData, token?: string) => {
    const response = await api.patch(`/questions/${id}`, formData, getConfig(token, true));
    return response.data;
  },
  deleteQuestion: async (id: string, token?: string) => {
    const response = await api.delete(`/questions/${id}`, getConfig(token));
    return response.data;
  },

  // --- QUESTION OPTIONS ---
  createOption: async (data: any, token?: string) => {
    const response = await api.post('/question-options', data, getConfig(token));
    return response.data;
  },
  getOptionsByQuestionId: async (questionId: string, token?: string) => {
    const response = await api.get(`/question-options/question/${questionId}`, getConfig(token));
    return response.data;
  },
  getOptionsByQuestionIdAttempt: async (questionId: string, token?: string) => {
    const response = await api.get(`/question-options/question/${questionId}/attempt`, getConfig(token));
    return response.data;
  },
  getOptionById: async (id: string, token?: string) => {
    const response = await api.get(`/question-options/${id}`, getConfig(token));
    return response.data;
  },
  updateOption: async (id: string, data: any, token?: string) => {
    const response = await api.patch(`/question-options/${id}`, data, getConfig(token));
    return response.data;
  },
  deleteOption: async (id: string, token?: string) => {
    const response = await api.delete(`/question-options/${id}`, getConfig(token));
    return response.data;
  },

  // --- EXAM SESSIONS ---
  startExam: async (data: { userId: number | string; examId: string; timezone?: string }, token?: string) => {
    const response = await api.post('/exam-sessions/start', data, getConfig(token));
    return response.data;
  },
  recordAnswerMCQ: async (sectionSessionId: string, data: { questionId: string; selectedOptionId: string }, token?: string) => {
    const response = await api.post(`/exam-sessions/${sectionSessionId}/answers`, data, getConfig(token));
    return response.data;
  },
  recordAnswerEssay: async (sectionSessionId: string, data: { questionId: string; textResponse: string }, token?: string) => {
    const response = await api.post(`/exam-sessions/${sectionSessionId}/answers`, data, getConfig(token));
    return response.data;
  },
  recordAnswerSpeaking: async (sectionSessionId: string, formData: FormData, token?: string) => {
    const response = await api.post(`/exam-sessions/${sectionSessionId}/answers`, formData, getConfig(token, true));
    return response.data;
  },
  finishSection: async (examSectionSessionId: string, token?: string) => {
    const response = await api.post(`/exam-sessions/sections/${examSectionSessionId}/finish`, {}, getConfig(token));
    return response.data;
  },
  finishExam: async (sessionId: string, token?: string) => {
    const response = await api.post(`/exam-sessions/${sessionId}/finish`, {}, getConfig(token));
    return response.data;
  },
  getMySubmissions: async (token?: string) => {
    const response = await api.get('/exam-sessions/my-submissions', getConfig(token));
    return response.data;
  },
};

// Aliases untuk backward compatibility dengan kode lama
export const exam = {
  allExam: examService.getAllExams,
  examById: examService.getExamById,
  sectionByExamId: examService.getSectionsByExamId,
  questionBySectionId: examService.getQuestionsBySectionId,
  ...examService
};
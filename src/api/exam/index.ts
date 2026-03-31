import api from "@/src/lib/axios"

export const exam = {
  allExam: async () => {
    const response = await api.get('/exams');
    return response.data;
  },

  examById  : async (id: string) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },
  
  sectionByExamId  : async (id: string) => {
    const response = await api.get(`exam-sections/exam/${id}`);
    return response.data;
  },

  questionBySectionId: async (id: string) => {
    const response = await api.get(`questions/section/${id}`);
    return response.data;
  }
};
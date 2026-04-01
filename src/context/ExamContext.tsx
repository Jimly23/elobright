"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Question {
  id: string;
  sectionId: string;
  audioUrl: string | null;
  imageUrl: string | null;
  narrativeText: string | null;
  questionText: string;
  questionType: string;
  points: number;
}

export interface Section {
  id: string;
  examId: string;
  name: string;
  type: string;
  order: number;
  durationMinutes: number;
}

interface ExamContextType {
  sections: Section[];
  setSections: (s: Section[]) => void;
  questionsBySection: Record<string, Question[]>;
  setQuestionsForSection: (sectionId: string, questions: Question[]) => void;
  examId: string;
  setExamId: (id: string) => void;
}

const ExamContext = createContext<ExamContextType | null>(null);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [questionsBySection, setQuestionsBySection] = useState<Record<string, Question[]>>({});
  const [examId, setExamId] = useState('');

  const setQuestionsForSection = (sectionId: string, questions: Question[]) => {
    setQuestionsBySection(prev => ({ ...prev, [sectionId]: questions }));
  };

  return (
    <ExamContext.Provider value={{ sections, setSections, questionsBySection, setQuestionsForSection, examId, setExamId }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExam must be used within ExamProvider');
  return ctx;
}

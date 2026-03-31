"use client";

import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import TestLayout from '@/src/components/EnglishTest/TestLayout';
import SectionIntroPage from '@/src/components/EnglishTest/SectionIntroPage';
import { useExam } from '@/src/context/ExamContext';

export default function WritingPage() {
  const { sections, questionsBySection } = useExam();
  const [started, setStarted] = useState(false);

  const section = sections.find(s => s.name === 'Writing');
  const questions = section ? (questionsBySection[section.id] ?? []) : [];

  if (!started) {
    return (
      <SectionIntroPage
        sectionName="Writing"
        duration={section ? `${section.durationMinutes} mins` : '20 mins'}
        questionCount={questions.length}
        onStart={() => setStarted(true)}
      />
    );
  }

  return (
    <TestLayout
      sectionName="Writing"
      sectionColor="bg-violet-500"
      sectionIcon={<PenTool size={28} />}
      questions={questions}
      durationMinutes={section?.durationMinutes ?? 20}
      nextRoute="/english-test/toefl/speaking"
      nextSectionName="Speaking"
    />
  );
}

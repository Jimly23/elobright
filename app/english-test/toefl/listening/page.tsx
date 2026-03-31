"use client";

import React, { useState } from 'react';
import { Headphones } from 'lucide-react';
import TestLayout from '@/src/components/EnglishTest/TestLayout';
import SectionIntroPage from '@/src/components/EnglishTest/SectionIntroPage';
import { useExam } from '@/src/context/ExamContext';

export default function ListeningPage() {
  const { sections, questionsBySection } = useExam();
  const [started, setStarted] = useState(false);

  const section = sections.find(s => s.name === 'Listening');
  const questions = section ? (questionsBySection[section.id] ?? []) : [];

  if (!started) {
    return (
      <SectionIntroPage
        sectionName="Listening"
        duration={section ? `${section.durationMinutes} mins` : '20 mins'}
        questionCount={questions.length}
        onStart={() => setStarted(true)}
      />
    );
  }

  return (
    <TestLayout
      sectionName="Listening"
      sectionColor="bg-indigo-500"
      sectionIcon={<Headphones size={28} />}
      questions={questions}
      durationMinutes={section?.durationMinutes ?? 20}
      nextRoute="/english-test/toefl/writing"
      nextSectionName="Writing"
    />
  );
}

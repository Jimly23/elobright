"use client";

import { useRouter } from 'next/navigation';
import SectionIntroPage from '@/src/components/EnglishTest/SectionIntroPage';
import { exam } from '@/src/api/exam';

const ESSAY_PRACTICE_ID = '11111111-0000-4000-8000-000000000003';

export default function WritingSectionPage() {
  const router = useRouter();

  const handleStart = async () => {
    try {
      const tokenStr = document.cookie.split('; ').find(row => row.startsWith('token='));
      const token = tokenStr ? tokenStr.split('=')[1] : undefined;

      const sections = await exam.sectionByExamId(ESSAY_PRACTICE_ID, token);
      const writingSection = sections.find((s: any) => s.title.toLowerCase().includes('writing'));

      if (writingSection) {
        const questions = await exam.questionBySectionId(writingSection.id, token);
        const session = await exam.startExam(ESSAY_PRACTICE_ID, token);
        localStorage.setItem('currentExamSessionId', session.id);
        router.push('/english-test/essay-practice/writing/exam');
      }
    } catch (e) {
      console.error('Failed to start essay practice:', e);
    }
  };

  return (
    <SectionIntroPage
      sectionName="Writing"
      duration="60 mins"
      questionCount={3}
      onStart={handleStart}
    />
  );
}
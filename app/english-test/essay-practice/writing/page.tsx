"use client";

import { useRouter } from 'next/navigation';
import SectionIntroPage from '@/src/components/EnglishTest/SectionIntroPage';
import { exam } from '@/src/api/exam';
import { ESSAY_PRACTICE_ID, ESSAY_PRACTICE_ROUTES } from '@/src/constants/essayPractice';

export default function WritingSectionPage() {
  const router = useRouter();

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const resolveUserId = (token: string) => {
    const rawUserId = getCookie('userId') || localStorage.getItem('userId');
    const parsedUserId = rawUserId ? parseInt(rawUserId, 10) : NaN;
    let userId = Number.isFinite(parsedUserId) && parsedUserId > 0 ? parsedUserId : 1;

    if (token && !rawUserId) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          const tokenUserId = Number(payload.userId);
          if (Number.isFinite(tokenUserId) && tokenUserId > 0) {
            userId = tokenUserId;
          }
        }
      } catch {
        // Fallback userId is already set above.
      }
    }

    return userId;
  };

  const handleStart = async () => {
    try {
      const token = getCookie('token') || '';
      const userId = resolveUserId(token);

      const sections = await exam.sectionByExamId(ESSAY_PRACTICE_ID, token);
      const writingSection = sections.find((s: any) => s.title.toLowerCase().includes('writing'));

      if (writingSection) {
        await exam.questionBySectionId(writingSection.id, token);
        const session = await exam.startExam({
          userId,
          examId: ESSAY_PRACTICE_ID,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
        }, token);
        if (session?.id) {
          localStorage.setItem('currentExamSessionId', session.id);
          router.push(ESSAY_PRACTICE_ROUTES.exam);
        }
      }
    } catch (e: any) {
      const existingSessionId = e?.response?.data?.session?.id;
      if (e?.response?.status === 400 && e?.response?.data?.message === 'Ongoing session already exists' && existingSessionId) {
        localStorage.setItem('currentExamSessionId', existingSessionId);
        router.push(ESSAY_PRACTICE_ROUTES.exam);
        return;
      }

      console.error('Failed to start essay practice:', e?.response?.data || e);
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
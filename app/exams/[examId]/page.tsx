"use client";

import Navbar from '@/src/components/Navbar';
import FooterSection from '@/src/components/FooterSection';
import EnglishTestHero from '@/src/components/EnglishTest/EnglishTestHero';
import InfoSection from '@/src/components/EnglishTest/InfoSection';
import TakeTestSection from '@/src/components/EnglishTest/TakeTestSection';
import NeedMoreTimeSection from '@/src/components/EnglishTest/NeedMoreTimeSection';
import { useGeneralExamContext } from '@/src/context/GeneralExamContext';
import { useParams } from 'next/navigation';

export default function ExamLandingPage() {
  const { examData } = useGeneralExamContext();
  const params = useParams();
  const examId = params.examId as string;

  return (
    <>
      <Navbar />
      <EnglishTestHero title={examData?.title || 'English Test'} examData={examData} />
      <InfoSection url={`/exams/${examId}/introduction`} />
      <TakeTestSection />
      <NeedMoreTimeSection />
      <FooterSection />
    </>
  );
}

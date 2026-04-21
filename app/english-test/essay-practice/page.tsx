import { redirect } from 'next/navigation';
import { ESSAY_PRACTICE_ROUTES } from '@/src/constants/essayPractice';

export default function Page() {
  redirect(ESSAY_PRACTICE_ROUTES.start);
}
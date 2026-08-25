type CachedAnswer = {
  selectedOptionId?: string;
  textResponse?: string;
};

const getCacheKey = (sectionSessionId: string, questionId: string) => (
  `exam-answer:${sectionSessionId}:${questionId}`
);

export function getCachedAnswer(sectionSessionId: string, questionId: string): CachedAnswer | null {
  if (!sectionSessionId || typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(getCacheKey(sectionSessionId, questionId));
    return value ? JSON.parse(value) as CachedAnswer : null;
  } catch {
    return null;
  }
}

export function setCachedAnswer(sectionSessionId: string, questionId: string, answer: CachedAnswer) {
  if (!sectionSessionId || typeof window === 'undefined') return;
  localStorage.setItem(getCacheKey(sectionSessionId, questionId), JSON.stringify(answer));
}

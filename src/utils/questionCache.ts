import type { QuestionItem } from '@/types/questionType';

const questionCache = new Map<string, QuestionItem>();

export const setQuestionsToCache = (questions: QuestionItem[]) => {
  questions.forEach((question) => {
    questionCache.set(question.id, question);
  });
};

export const getQuestionById = (id: string): QuestionItem | undefined => {
  return questionCache.get(id);
};

export const getQuestionsByIds = (ids: string[]): QuestionItem[] => {
  return ids.map((id) => questionCache.get(id)).filter((question): question is QuestionItem => !!question);
};

export const clearQuestionCache = () => {
  questionCache.clear();
};

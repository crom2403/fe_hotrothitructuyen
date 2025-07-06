import type { DifficultyLevel } from '@/types/difficultyLevelType';
import type { QuestionType } from '@/types/questionType';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Subject } from '@/types/subjectType';
import type { Year } from '@/types/year_semesterType';
import type { VideoPopupConfig } from '@/types/questionFormTypes';

interface AppStore {
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
  questionTypes: QuestionType[];
  setQuestionTypes: (questionTypes: QuestionType[]) => void;
  difficultyLevels: DifficultyLevel[];
  setDifficultyLevels: (difficultyLevels: DifficultyLevel[]) => void;
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  academicYears: Year[];
  setAcademicYears: (academicYears: Year[]) => void;
  videoPopupQuestions: string[];
  setVideoPopupQuestions: (questions: string[]) => void;
  videoPopupConfig?: VideoPopupConfig;
  setVideoPopupConfig: (config: VideoPopupConfig | undefined) => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      openSidebar: true,
      setOpenSidebar: (state: boolean) => {
        set({
          openSidebar: state,
        });
      },
      questionTypes: [],
      setQuestionTypes: (questionTypes: QuestionType[]) => {
        set({ questionTypes });
      },
      difficultyLevels: [],
      setDifficultyLevels: (difficultyLevels: DifficultyLevel[]) => {
        set({ difficultyLevels });
      },
      subjects: [],
      setSubjects: (subjects: Subject[]) => {
        set({ subjects });
      },
      academicYears: [],
      setAcademicYears: (academicYears: Year[]) => {
        set({ academicYears });
      },
      videoPopupQuestions: [], // Khởi tạo mảng rỗng cho các câu hỏi
      setVideoPopupQuestions: (questions: string[]) => {
        set({ videoPopupQuestions: questions });
      },
      videoPopupConfig: undefined, // Khởi tạo không có cấu hình ban đầu
      setVideoPopupConfig: (config: VideoPopupConfig | undefined) => {
        set({ videoPopupConfig: config });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
);

export default useAppStore;
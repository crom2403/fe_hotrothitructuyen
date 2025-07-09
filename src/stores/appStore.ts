import type { DifficultyLevel } from '@/types/difficultyLevelType';
import type { QuestionType } from '@/types/questionType';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Subject } from '@/types/subjectType';
import type { Year } from '@/types/year_semesterType';

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

  examId: string;
  setExamId: (examId: string) => void;
  studyGroupId: string;
  setStudyGroupId: (studyGroupId: string) => void;
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
      examId: '',
      setExamId: (examId: string) => {
        set({ examId });
      },
      studyGroupId: '',
      setStudyGroupId: (studyGroupId: string) => {
        set({ studyGroupId });
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
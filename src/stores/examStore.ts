import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ExamTab1 {
  name: string;
  subject: string;
  study_group: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_questions: number;
  pass_points: number;
  point_scale: string;
  type: boolean;
}

export interface ExamTab2 {
  exam_type: string;
  list_questions: { question_id: string; order_index: number }[] | [];
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface ExamTab3 {
  is_shuffled_questions: boolean;
  is_shuffled_answer: boolean;
  allow_review: boolean;
  allow_review_point: boolean;
  show_correct_answer: boolean;
}

export interface CommonProps {
  point_scale_name: string;
}

interface ExamStore {
  tab1Data: ExamTab1;
  tab2Data: ExamTab2;
  tab3Data: ExamTab3;
  commonProps: CommonProps;

  setTab1Name: (name: string) => void;
  setTab1Subject: (subject: string) => void;
  setTab1Group: (group: string) => void;
  setTab1Description: (desc: string) => void;
  setTab1StartTime: (start: string) => void;
  setTab1EndTime: (end: string) => void;
  setTab1Duration: (minutes: number) => void;
  setTab1TotalQuestions: (count: number) => void;
  setTab1PassPoints: (points: number) => void;
  setTab1PointScale: (scale: string) => void;
  setTab1Type: (type: boolean) => void;

  setExamType: (type: string) => void;
  setListQuestions: (questions: { question_id: string; order_index: number }[]) => void;
  setDifficulty: (difficulty: { easy: number; medium: number; hard: number }) => void;

  setIsShuffledQuestions: (value: boolean) => void;
  setIsShuffledAnswer: (value: boolean) => void;
  setAllowReview: (value: boolean) => void;
  setAllowReviewPoint: (value: boolean) => void;
  setShowCorrectAnswer: (value: boolean) => void;

  setPointScaleName: (name: string) => void;

  resetExamData: () => void;
}

const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      tab1Data: {
        name: "",
        subject: "",
        study_group: "",
        description: "",
        start_time: "",
        end_time: "",
        duration_minutes: 0,
        total_questions: 0,
        pass_points: 0,
        point_scale: "",
        type: false,
      },
      tab2Data: {
        exam_type: "",
        list_questions: [],
        difficulty: {
          easy: 0,
          medium: 0,
          hard: 0,
        },
      },
      tab3Data: {
        is_shuffled_questions: false,
        is_shuffled_answer: false,
        allow_review: false,
        allow_review_point: false,
        show_correct_answer: false,
      },
      commonProps: {
        point_scale_name: "",
      },
      setTab1Name: (name) => set({ tab1Data: { ...get().tab1Data, name } }),
      setTab1Subject: (subject) => set({ tab1Data: { ...get().tab1Data, subject } }),
      setTab1Group: (study_group) => set({ tab1Data: { ...get().tab1Data, study_group } }),
      setTab1Description: (description) => set({ tab1Data: { ...get().tab1Data, description } }),
      setTab1StartTime: (start_time) => set({ tab1Data: { ...get().tab1Data, start_time } }),
      setTab1EndTime: (end_time) => set({ tab1Data: { ...get().tab1Data, end_time } }),
      setTab1Duration: (duration_minutes) => set({ tab1Data: { ...get().tab1Data, duration_minutes } }),
      setTab1TotalQuestions: (total_questions) => set({ tab1Data: { ...get().tab1Data, total_questions } }),
      setTab1PassPoints: (pass_points) => set({ tab1Data: { ...get().tab1Data, pass_points } }),
      setTab1PointScale: (point_scale) => set({ tab1Data: { ...get().tab1Data, point_scale } }),
      setTab1Type: (type) => set({ tab1Data: { ...get().tab1Data, type } }),

      setExamType: (exam_type) => set({ tab2Data: { ...get().tab2Data, exam_type } }),
      setListQuestions: (list_questions) => set({ tab2Data: { ...get().tab2Data, list_questions } }),
      setDifficulty: (difficulty) =>
        set({
          tab2Data: {
            ...get().tab2Data,
            difficulty: {
              easy: difficulty.easy ?? 0,
              medium: difficulty.medium ?? 0,
              hard: difficulty.hard ?? 0,
            },
          },
        }),

      setIsShuffledQuestions: (value) => set({ tab3Data: { ...get().tab3Data, is_shuffled_questions: value } }),
      setIsShuffledAnswer: (value) => set({ tab3Data: { ...get().tab3Data, is_shuffled_answer: value } }),
      setAllowReview: (value) => set({ tab3Data: { ...get().tab3Data, allow_review: value } }),
      setAllowReviewPoint: (value) => set({ tab3Data: { ...get().tab3Data, allow_review_point: value } }),
      setShowCorrectAnswer: (value) => set({ tab3Data: { ...get().tab3Data, show_correct_answer: value } }),

      setPointScaleName: (name) => set({ commonProps: { ...get().commonProps, point_scale_name: name } }),

      resetExamData: () =>
        set({
          tab1Data: {
            name: "",
            subject: "",
            study_group: "",
            description: "",
            start_time: "",
            end_time: "",
            duration_minutes: 0,
            total_questions: 0,
            pass_points: 0,
            point_scale: "",
            type: false,
          },
          tab2Data: {
            exam_type: "",
            list_questions: [],
            difficulty: {
              easy: 0,
              medium: 0,
              hard: 0,
            },
          },
          tab3Data: {
            is_shuffled_questions: false,
            is_shuffled_answer: false,
            allow_review: false,
            allow_review_point: false,
            show_correct_answer: false,
          },
          commonProps: {
            point_scale_name: "",
          },
        }),
    }),
    {
      name: "exam-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useExamStore;
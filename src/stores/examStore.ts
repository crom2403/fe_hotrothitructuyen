import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface ExamTab1 {
  name: string,
  subject: string,
  study_group: string,
  description?: string,
  start_time: string,
  end_time: string,
  duration_minutes: number,
  total_questions: number,
  pass_points: number,
  point_scale: string,
  type: boolean,
}

export interface ExamTab2 {
  exam_type: string,
  list_questions: {
    question_id: string,
    order_index: number,
  }[] | [],
}

export interface ExamTab3 {
  is_shuffled_questions: boolean,
  is_shuffled_answer: boolean,
  allow_review: boolean,
  allow_review_point: boolean,
  show_correct_answer: boolean,
}


interface ExamStore {
  tab1Data: ExamTab1;
  tab2Data: ExamTab2;
  tab3Data: ExamTab3;

  // Tab 1 setters
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

  // Tab 2 setters
  setExamType: (type: string) => void;
  setListQuestions: (questions: { question_id: string; order_index: number }[]) => void;

  // Tab 3 setters
  setIsShuffledQuestions: (value: boolean) => void;
  setIsShuffledAnswer: (value: boolean) => void;
  setAllowReview: (value: boolean) => void;
  setAllowReviewPoint: (value: boolean) => void;
  setShowCorrectAnswer: (value: boolean) => void;

  // Reset
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
      },
      tab3Data: {
        is_shuffled_questions: false,
        is_shuffled_answer: false,
        allow_review: true,
        allow_review_point: true,
        show_correct_answer: false,
      },

      // Tab 1
      setTab1Name: (name) =>
        set({ tab1Data: { ...get().tab1Data, name } }),

      setTab1Subject: (subject) =>
        set({ tab1Data: { ...get().tab1Data, subject } }),

      setTab1Group: (study_group) =>
        set({ tab1Data: { ...get().tab1Data, study_group } }),

      setTab1Description: (description) =>
        set({ tab1Data: { ...get().tab1Data, description } }),

      setTab1StartTime: (start_time) =>
        set({ tab1Data: { ...get().tab1Data, start_time } }),

      setTab1EndTime: (end_time) =>
        set({ tab1Data: { ...get().tab1Data, end_time } }),

      setTab1Duration: (duration_minutes) =>
        set({ tab1Data: { ...get().tab1Data, duration_minutes } }),

      setTab1TotalQuestions: (total_questions) =>
        set({ tab1Data: { ...get().tab1Data, total_questions } }),

      setTab1PassPoints: (pass_points) =>
        set({ tab1Data: { ...get().tab1Data, pass_points } }),

      setTab1PointScale: (point_scale) =>
        set({ tab1Data: { ...get().tab1Data, point_scale } }),

      setTab1Type: (type) =>
        set({ tab1Data: { ...get().tab1Data, type } }),

      // Tab 2
      setExamType: (exam_type) =>
        set({ tab2Data: { ...get().tab2Data, exam_type } }),

      setListQuestions: (list_questions) =>
        set({ tab2Data: { ...get().tab2Data, list_questions } }),

      // Tab 3
      setIsShuffledQuestions: (value) =>
        set({ tab3Data: { ...get().tab3Data, is_shuffled_questions: value } }),

      setIsShuffledAnswer: (value) =>
        set({ tab3Data: { ...get().tab3Data, is_shuffled_answer: value } }),

      setAllowReview: (value) =>
        set({ tab3Data: { ...get().tab3Data, allow_review: value } }),

      setAllowReviewPoint: (value) =>
        set({ tab3Data: { ...get().tab3Data, allow_review_point: value } }),

      setShowCorrectAnswer: (value) =>
        set({ tab3Data: { ...get().tab3Data, show_correct_answer: value } }),

      // Reset toàn bộ
      resetExamData: () => set({
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
        },
        tab3Data: {
          is_shuffled_questions: false,
          is_shuffled_answer: false,
          allow_review: true,
          allow_review_point: true,
          show_correct_answer: false,
        },
      }),
    }),
    {
      name: "exam-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useExamStore
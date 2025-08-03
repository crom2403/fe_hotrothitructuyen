import { create } from 'zustand';
import type { QuestionItem } from '@/types/questionType';
import { instruction_example } from '@/utils/instruction';

export interface ExamTab1 {
  name: string;
  subject: string;
  study_groups: string[];
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_questions: number;
  pass_points: number;
  point_scale: string;
  type: 'exercise' | 'midterm' | 'final';
  max_tab_switch: number;
}

export interface ExamTab2 {
  exam_type: 'manual' | 'auto';
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
  instruction: string;
}

export interface CommonProps {
  point_scale_name: string;
  subject_name: string;
  study_group_name: string;
  list_questions: QuestionItem[];
}

interface UpdateExamStore {
  tab1Data: ExamTab1;
  tab2Data: ExamTab2;
  tab3Data: ExamTab3;
  commonProps: CommonProps;

  setTab1Name: (name: string) => void;
  setTab1Subject: (subject: string) => void;
  setTab1Groups: (groups: string[]) => void;
  setTab1Description: (desc: string) => void;
  setTab1StartTime: (start: string) => void;
  setTab1EndTime: (end: string) => void;
  setTab1Duration: (minutes: number) => void;
  setTab1TotalQuestions: (count: number) => void;
  setTab1PassPoints: (points: number) => void;
  setTab1PointScale: (scale: string) => void;
  setTab1Type: (type: 'exercise' | 'midterm' | 'final') => void;
  setTab1MaxTabSwitch: (max_tab_switch: number) => void;

  setExamType: (type: 'manual' | 'auto') => void;
  setListQuestions: (questions: { question_id: string; order_index: number }[]) => void;
  setDifficulty: (difficulty: { easy: number; medium: number; hard: number }) => void;

  setIsShuffledQuestions: (value: boolean) => void;
  setIsShuffledAnswer: (value: boolean) => void;
  setAllowReview: (value: boolean) => void;
  setAllowReviewPoint: (value: boolean) => void;
  setShowCorrectAnswer: (value: boolean) => void;
  setInstruction: (instruction: string) => void;

  setPointScaleName: (name: string) => void;
  setSubjectName: (name: string) => void;
  setStudyGroupName: (name: string) => void;
  setListQuestionsFull: (questions: QuestionItem[]) => void;

  resetExamData: () => void;
}

const useUpdateExamStore = create<UpdateExamStore>((set, get) => ({
  tab1Data: {
    name: '',
    subject: '',
    study_groups: [],
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    total_questions: 0,
    pass_points: 5,
    point_scale: '',
    type: 'exercise',
    max_tab_switch: 3,
  },
  tab2Data: {
    exam_type: 'manual',
    list_questions: [],
    difficulty: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
  },
  tab3Data: {
    is_shuffled_questions: true,
    is_shuffled_answer: true,
    allow_review: true,
    allow_review_point: true,
    show_correct_answer: false,
    instruction: instruction_example,
  },
  commonProps: {
    point_scale_name: '',
    subject_name: '',
    study_group_name: '',
    list_questions: [],
  },
  setTab1Name: (name) => set({ tab1Data: { ...get().tab1Data, name } }),
  setTab1Subject: (subject) => set({ tab1Data: { ...get().tab1Data, subject } }),
  setTab1Groups: (study_groups) => set({ tab1Data: { ...get().tab1Data, study_groups } }),
  setTab1Description: (description) => set({ tab1Data: { ...get().tab1Data, description } }),
  setTab1StartTime: (start_time) => set({ tab1Data: { ...get().tab1Data, start_time } }),
  setTab1EndTime: (end_time) => set({ tab1Data: { ...get().tab1Data, end_time } }),
  setTab1Duration: (duration_minutes) => set({ tab1Data: { ...get().tab1Data, duration_minutes } }),
  setTab1TotalQuestions: (total_questions) => set({ tab1Data: { ...get().tab1Data, total_questions } }),
  setTab1PassPoints: (pass_points) => set({ tab1Data: { ...get().tab1Data, pass_points } }),
  setTab1PointScale: (point_scale) => set({ tab1Data: { ...get().tab1Data, point_scale } }),
  setTab1Type: (type) => set({ tab1Data: { ...get().tab1Data, type } }),
  setTab1MaxTabSwitch: (max_tab_switch) => set({ tab1Data: { ...get().tab1Data, max_tab_switch } }),

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
  setInstruction: (instruction) => set({ tab3Data: { ...get().tab3Data, instruction } }),

  setPointScaleName: (name) => set({ commonProps: { ...get().commonProps, point_scale_name: name } }),
  setSubjectName: (name) => set({ commonProps: { ...get().commonProps, subject_name: name } }),
  setStudyGroupName: (name) => set({ commonProps: { ...get().commonProps, study_group_name: name } }),
  setListQuestionsFull: (list_questions) => set({ commonProps: { ...get().commonProps, list_questions } }),

  resetExamData: () =>
    set({
      tab1Data: {
        name: '',
        subject: '',
        study_groups: [],
        description: '',
        start_time: '',
        end_time: '',
        duration_minutes: 60,
        total_questions: 0,
        pass_points: 5,
        point_scale: '',
        type: 'exercise',
        max_tab_switch: 3,
      },
      tab2Data: {
        exam_type: 'manual',
        list_questions: [],
        difficulty: {
          easy: 0,
          medium: 0,
          hard: 0,
        },
      },
      tab3Data: {
        is_shuffled_questions: true,
        is_shuffled_answer: true,
        allow_review: true,
        allow_review_point: true,
        show_correct_answer: false,
        instruction: instruction_example,
      },
      commonProps: {
        point_scale_name: '',
        subject_name: '',
        study_group_name: '',
        list_questions: [],
      },
    }),
}));

export default useUpdateExamStore;

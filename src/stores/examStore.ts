import type { QuestionItem } from "@/types/questionType";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  type: "exercise" | "midterm" | "final";
  max_tab_switch: number;
}

export interface ExamTab2 {
  exam_type: "manual" | "auto" | "ai";
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

interface ExamStore {
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
  setTab1Type: (type: "exercise" | "midterm" | "final") => void;
  setTab1MaxTabSwitch: (max_tab_switch: number) => void;

  setExamType: (type: "manual" | "auto" | "ai") => void;
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

const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      tab1Data: {
        name: "",
        subject: "",
        study_groups: [],
        description: "",
        start_time: "",
        end_time: "",
        duration_minutes: 0,
        total_questions: 0,
        pass_points: 0,
        point_scale: "",
        type: "exercise",
        max_tab_switch: 3,
      },
      tab2Data: {
        exam_type: "manual",
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
        instruction: `
          <p>Chào bạn, trước khi bắt đầu bài thi, vui lòng đọc kỹ các hướng dẫn và nội quy sau:</p>
          <ul>
            <li>Thời gian làm bài: [xx] phút | Số câu hỏi: [xx] câu | Hình thức: Trắc nghiệm online.</li>
            <li>Khi hết giờ, hệ thống tự động nộp bài. Bạn cũng có thể chủ động nộp bài khi hoàn thành.</li>
            <li>Không được thoát trang, tải lại trình duyệt, hoặc sử dụng phần mềm hỗ trợ/tham khảo khác.</li>
            <li>Mọi hành vi gian lận, thi hộ, hoặc sao chép bài làm sẽ bị hủy kết quả và xử lý theo quy định.</li>
            <li>Đảm bảo thiết bị hoạt động tốt, kết nối internet ổn định và không bị làm phiền khi đang thi.</li>
          </ul>
          <p>👉 Bấm "Bắt đầu làm bài" để bắt đầu phần thi. Chúc bạn làm bài tốt!</p>
        `,
      },
      commonProps: {
        point_scale_name: "",
        subject_name: "",
        study_group_name: "",
        list_questions: [],
      },
      setTab1Name: (name) => set({ tab1Data: { ...get().tab1Data, name } }),
      setTab1Subject: (subject) => set({ tab1Data: { ...get().tab1Data, subject } }),
      setTab1Groups: (study_groups) => set({ tab1Data: { ...get().tab1Data, study_groups: study_groups } }),
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
      setListQuestionsFull: (list_questions) => set({ commonProps: { ...get().commonProps, list_questions: list_questions } }),

      resetExamData: () =>
        set({
          tab1Data: {
            name: "",
            subject: "",
            study_groups: [],
            description: "",
            start_time: "",
            end_time: "",
            duration_minutes: 0,
            total_questions: 0,
            pass_points: 0,
            point_scale: "",
            type: "exercise",
            max_tab_switch: 3,
          },
          tab2Data: {
            exam_type: "manual",
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
            instruction: `
              <p>Chào bạn, trước khi bắt đầu bài thi, vui lòng đọc kỹ các hướng dẫn và nội quy sau:</p>
              <ul>
                <li>Thời gian làm bài: [xx] phút | Số câu hỏi: [xx] câu | Hình thức: Trắc nghiệm online.</li>
                <li>Khi hết giờ, hệ thống tự động nộp bài. Bạn cũng có thể chủ động nộp bài khi hoàn thành.</li>
                <li>Không được thoát trang, tải lại trình duyệt, hoặc sử dụng phần mềm hỗ trợ/tham khảo khác.</li>
                <li>Mọi hành vi gian lận, thi hộ, hoặc sao chép bài làm sẽ bị hủy kết quả và xử lý theo quy định.</li>
                <li>Đảm bảo thiết bị hoạt động tốt, kết nối internet ổn định và không bị làm phiền khi đang thi.</li>
              </ul>
              <p>👉 Bấm "Bắt đầu làm bài" để bắt đầu phần thi. Chúc bạn làm bài tốt!</p>
            `,
          },
          commonProps: {
            point_scale_name: "",
            subject_name: "",
            study_group_name: "",
            list_questions: [],
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

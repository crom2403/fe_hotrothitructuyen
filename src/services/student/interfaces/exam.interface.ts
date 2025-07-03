// Trắc nghiệm chọn một đáp án
export interface SingleChoiceConfig {
  options_count: number;
  correct: string;
}

// Trắc nghiệm chọn nhiều đáp án
export interface MultipleChoiceConfig {
  options_count: number;
  correct: string[];
}

// Kéo thả
export interface DragDropConfig {
  zones: string[];
  correct: { id: string; zone: string }[];
}

// Nối cột
export interface MatchingConfig {
  pairs: { left: string; right: string }[];
  correct: { left: string; right: string }[];
}

// Sắp xếp
export interface OrderingConfig {
  items_count: number;
  correct: { id: string; order: number }[];
}

// Câu hỏi video popup
export interface VideoPopupConfig {
  video_id: string;
  url: string;
  popup_times: Array<{
    time: number;
    question: string;
    options: string[];
    correct: string;
  }>;
}

export type AnswerConfig = SingleChoiceConfig | MultipleChoiceConfig | DragDropConfig | MatchingConfig | OrderingConfig | VideoPopupConfig;

// export type QuestionType = 'single' | 'multiple' | 'drag-drop' | 'matching' | 'ordering' | 'video-popup';

// Định nghĩa kiểu cho nội dung câu trả lời
interface AnswerContent {
  text: string;
  value?: string;
  left?: string; // Dùng cho câu hỏi matching
  right?: string; // Dùng cho câu hỏi matching
}

// Định nghĩa câu trả lời
export interface Answer {
  id: string;
  content: AnswerContent;
  order_index: number;
}

// Định nghĩa loại câu hỏi
export interface QuestionType {
  code: string; // Ví dụ: video_popup, ordering, matching, drag_drop, multiple_select, single_choice
}

// Định nghĩa câu hỏi
export interface Question {
  id: string;
  content: string;
  answers: Answer[];
  question_type: QuestionType;
}

// Định nghĩa câu hỏi trong bài kiểm tra
interface ExamQuestion {
  id: string;
  question: Question;
}

// Định nghĩa môn học
interface Subject {
  id: string;
  name: string;
}

// Định nghĩa người tạo bài kiểm tra
interface CreatedBy {
  id: string;
  full_name: string;
}

// Định nghĩa thang điểm
interface PointScale {
  id: string;
  name: string;
}

// Định nghĩa loại bài thi
interface ExamType {
  id: string;
  name: string;
}

// Định nghĩa bài kiểm tra
export interface IExam {
  id: string;
  created_at: string;
  updated_at: string | null;
  name: string;
  description: string;
  instructions: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_shuffled_question: boolean;
  is_shuffled_answer: boolean;
  allow_review: boolean;
  allow_review_point: boolean;
  show_correct_answer: boolean;
  max_tab_switch: number;
  total_points: number;
  pass_points: number;
  test_type: string;
  subject: Subject;
  created_by: CreatedBy;
  exam_configs: any[]; // Có thể định nghĩa chi tiết hơn nếu cần
  point_scale: PointScale;
  exam_questions: ExamQuestion[];
  exam_type: ExamType;
}

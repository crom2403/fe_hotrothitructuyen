export interface ExamStudyGroup {
  id: string;
  name: string;
  subject_id: string;
  subject_name: string;
  study_group_id: string;
  study_group_name: string;
  test_type: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  attempt_count: number;
  student_count: number;
  average_score: number;
  opening_status: string;
  pass_points: number;
  processing_percent: number
}

export interface ExamStudyGroupResponse {
  data: ExamStudyGroup[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

export interface ExamResult {
  exam_attempt_id: string;
  exam_attempt_score: number;
  exam_attempt_submitted_at: string;
  exam_attempt_duration_seconds: number;
  exam_attempt_handle_status: string;
  student_id: string;
  student_code: string;
  student_full_name: string;
  student_email: string;
  study_group_id: string;
  exam_id: string;
}

interface Question {
  question_id: string;
  is_correct: boolean;
  content: string;
  question_type: string;
  answer_data: string;
  order_index: number;
  answer_config?: any;
  answers: any[];
}

export interface StudentExamResult {
  exam_name: string;
  subject_name: string;
  test_type: string;
  student_name: string;
  submitted_at: string;
  duration_seconds: number;
  tab_switch_count: number;
  score: number;
  total_answered_questions: number;
  questions: Question[];
}

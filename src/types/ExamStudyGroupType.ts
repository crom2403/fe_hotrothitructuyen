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

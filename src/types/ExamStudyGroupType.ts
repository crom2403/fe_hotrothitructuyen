interface ExamStudyGroup {
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
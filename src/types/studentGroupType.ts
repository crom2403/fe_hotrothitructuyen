export interface IStudentGroup {
  study_group_id: string;
  study_group_is_active: number;
  study_group_name: string;
  study_group_code: string;
  study_group_invite_code: string;
  study_group_max_students: number;
  study_group_description: string;
  student_count: string;
  teacher_id: string;
  teacher_code: string;
  teacher_full_name: string;
  teacher_avatar: string;
  subject_id: string;
  subject_name: string;
  semester_id: string;
  semester_code: string;
  semester_name: string;
  semester_is_current: boolean;
  academic_year_id: string;
  academic_year_code: string;
}

export interface IStudentGroupDetail {
  code: string;
  created_at: string;
  description: string;
  id: string;
  invite_code: string;
  max_students: number;
  name: string;
  semester: {
    code: string;
    end_date: string;
    id: string;
    is_current: boolean;
    name: string;
    start_date: string;
    academic_year: {
      id: string;
      code: string;
    };
  };
  subject: {
    code: string;
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    code: string;
    email: string;
    full_name: string;
    avatar: string;
    role: {
      id: string;
      code: string;
      name: string;
    };
  };
  students: {
    id: string;
    joined_at: string;
    student: {
      id: string;
      code: string;
      email: string;
      full_name: string;
      avatar: string;
      role: {
        id: string;
        code: string;
        name: string;
      };
    };
  }[];
}

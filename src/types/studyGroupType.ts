export type StudyGroupFormData = {
  name: string;
  description?: string;
  academic_year: string;
  semester_id: string;
  subject_id: string;
  teacher_id: string;
  max_students: number;
};

export type StudyGroupInfo = {
  study_group_id: string;
  study_group_is_active: boolean;
  study_group_name: string;
  study_group_code: string;
  study_group_invite_code: string;
  study_group_max_students: number;
  study_group_description: string;
  teacher_id: string;
  teacher_code: string;
  teacher_full_name: string;
  subject_id: string;
  subject_name: string;
  semester_id: string;
  semester_code: string;
  semester_name: string;
  academic_year_id: string;
  academic_year_code: string;
  student_count: string;
};

export type StudyGroupResponse = {
  data: StudyGroupInfo[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
};

interface StudentItem {
  id: string;
  joined_at: string;
  student: {
    id: string;
    code: string;
    email: string | null;
    full_name: string;
    role: { name: string };
  };
}

export type StudyGroupDetail = {
  id: string;
  created_at: string;
  name: string;
  code: string;
  invite_code: string;
  max_students: number;
  description: string;
  teacher: {
    id: string;
    code: string;
    email: string;
    full_name: string;
  };
  subject: {
    id: string;
    code: string;
    name: string;
  };
  semester: {
    id: string;
    code: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    academic_year: {
      id: string;
      code: string;
    };
  };
  students: StudentItem[];
};

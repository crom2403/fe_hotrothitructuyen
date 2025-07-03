export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  description?: string;
  theory_hours: number;
  practice_hours: number;
  is_active: boolean;
}

export interface SubjectFormData {
  code: string;
  name: string;
  description?: string;
  theory_hours?: number;
  practice_hours?: number;
  credits: number;
}

export interface SubjectResponse {
  data: Subject[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

export interface AssignedSubject {
  id: string;
  assigned_at: string;
  subject: {
    id: string;
    code: string;
    name: string;
  };
  teacher: {
    id: string;
    code: string;
    full_name: string;
  };
  assigned_by: {
    id: string;
    code: string;
    full_name: string;
  };
}

export interface AssignedSubjectResponse {
  data: AssignedSubject[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

export interface AssignedSubjectByTeacher {
  id: string;
  assigned_at: string;
  subject: {
    id: string;
    code: string;
    name: string;
  };
}

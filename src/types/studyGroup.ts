export type StudyGroup = {
  id: string
  name: string
  code: string
  description: string
  semester_name: string
  subject_name: string
  teacher_name: string
  invite_code: string
  max_students: number
  is_active: boolean
  academic_year: string
}

export type StudyGroupFormData = {
  name: string
  code: string
  description?: string
  academic_year: string
  semester_id: string
  subject_id: string
  teacher_id: string
  max_students: number
}
export interface Subject {
  id: string
  code: string
  name: string
  credits: number
  description?: string
  theory_hours: number
  practice_hours: number
  is_active: boolean
}

export interface SubjectFormData {
  code: string
  name: string
  description?: string
  theory_hours?: number
  practice_hours?: number
  credits: number
}

export interface Subject {
  id: string
  code: string
  name: string
  credits: number
  description?: string
  theoryHours: number
  practiceHours: number
  status: boolean
  createdAt: string
}

export interface SubjectFormData {
  code: string
  name: string
  credits: number
  description?: string
  theoryHours: number
  practiceHours: number
}

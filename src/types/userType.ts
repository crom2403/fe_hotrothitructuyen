export interface User {
  code: string
  email: string
  fullName: string
  role: "admin" | "teacher" | "student"
  avatar?: string
  phone?: string
  birthDate?: Date
  gender?: "male" | "female"
  isActive: boolean
  createdAt: string
}

export type UserFormData = {
  code: string;
  email: string;
  fullName: string;
  role: "admin" | "teacher" | "student";
  phone?: string;
  birthDate: Date;
  gender: "male" | "female";
};
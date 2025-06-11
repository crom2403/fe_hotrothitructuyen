export interface User {
  code: string
  username: string
  email: string
  fullName: string
  role: "admin" | "teacher" | "student"
  avatar?: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export type UserFormData = {
  code: string;
  email: string;
  fullName: string;
  role: "admin" | "teacher" | "student";
  phone?: string;
};
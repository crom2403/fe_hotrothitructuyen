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

export interface UserInfoResponse {
  id: string
  code: string
  name: string
  email: string
  role_code: string
  role_name: string
  is_active: boolean
}

export type UserFormData = {
  code: string;
  full_name: string;
  role: "admin" | "teacher" | "student";
  phone?: string;
  date_of_birth: Date;
  gender: "male" | "female";
};

export interface UserResponse {
  data: UserInfoResponse[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

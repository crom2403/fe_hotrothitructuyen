export interface User {
  id: string
  created_at: string
  is_active: boolean
  code: string
  email: string
  full_name: string
  phone: string
  gender: string
  date_of_birth: string
  role: {
    id: string
    name: string
  }
}

export interface UserInfo {
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
  role_code: "admin" | "teacher" | "student";
  phone_number?: string;
  date_of_birth: Date;
  gender: "male" | "female";
  password: string;
};

export interface UserResponse {
  data: UserInfo[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

export interface QuestionRequest {
  id: string;
  content: string;
  type_id: string; 
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard"; // code
  answers: {
    content: string;
    is_correct: boolean;
    order_index: number;
  }[];
  explanation?: string;
  is_public?: boolean;
}

export interface Answer {
  id: string;
  content: string;
  is_correct: number; // có thể dùng boolean nếu backend chuẩn
  order_index: number;
}

export interface QuestionItem {
  id: string;
  content: string;
  created_at: string;
  review_status: "pending" | "approved" | "rejected";
  is_public: number; // 0 hoặc 1
  subject: {
    id: string;
    name: string;
  };
  question_type: {
    id: string;
    name: string;
  };
  difficulty_level: {
    id: string;
    name: string;
  };
  created_by: {
    id: string;
    full_name: string;
  };
  answers: Answer[];
}

export interface QuestionListResponse {
  data: QuestionItem[];
  total: number;
  size: number;
  page: number;
  last_page: number;
}


export type QuestionFormData = {
  content: string;
  type_id: string;
  subject_id: string;
  difficulty_level_id: string;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
  is_public?: boolean;
};

export interface QuestionType {
  id: string;
  code: string;
  name: string;
  description: string;
  config_template: {
    options?: number;
    correct_max?: number;
    correct_min?: number;
    items?: any[];
    targets?: any[];
    left_column?: any[];
    right_column?: any[];
    hint?: boolean;
    blanks?: number;
    ordered?: boolean;
    image?: string | null;
    hotspots?: any[];
    questions?: any[];
    video_url?: string | null;
  };
  is_active: boolean;
}

export interface QuestionTypeResponse {
  data: QuestionType[];
}
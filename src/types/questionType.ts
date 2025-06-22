export interface Question {
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
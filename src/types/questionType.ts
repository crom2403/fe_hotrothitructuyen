export interface QuestionRequest {
  id: string;
  content: string;
  type_id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: {
    content: string;
    is_correct: boolean;
    order_index: number;
  }[];
  explanation?: string;
  is_public?: boolean;
}

export interface QuestionItem {
  id: string;
  content: string;
  created_at: string;
  review_status: 'pending' | 'approved' | 'rejected';
  is_public: boolean;
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

export interface AnswerConfig {
  correct?: string[] | { left: string; right: string }[];
  options_count?: number;
  pairs?: { left: string; right: string }[];
}

export interface AnswerContent {
  text: string;
  value?: string;
  left?: string;
  right?: string;
}

export interface Answer {
  id: string;
  content: AnswerContent | null;
  order_index: number;
  match_pair?: string | null;
  hotspot_coords?: string | null;
  drag_drop_zone?: string | null;
}

export interface QuestionItem {
  id: string;
  content: string;
  created_at: string;
  review_status: 'pending' | 'approved' | 'rejected';
  is_public: boolean;
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
  answer_config?: AnswerConfig;
}

export interface QuestionListResponse {
  data: QuestionItem[];
  metadata: {
    total: number;
    size: number;
    page: number;
    last_page: number;
  };
}

export type OrderingItem = {
  id: string;
  content: string;
  order: number;
};

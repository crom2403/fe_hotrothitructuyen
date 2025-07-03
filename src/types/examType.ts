export type Question = {
  id: string;
  content: string;
  type: 'single' | 'multiple' | 'matching' | 'drag-drop';
  options?: string[];
  correctAnswers?: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
  points: number;
  matchingPairs?: { left: string; right: string }[];
  dragDropItems?: { id: string; content: string; correctPosition: number }[];
  explanation?: string;
};

export type ExamTemplate = {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  allowReview: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  timeLimit: boolean;
  questionTypes: {
    single: number;
    multiple: number;
    boolean: number;
    matching: number;
    dragDrop: number;
  };
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  topics: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
};

export type ExamFormData = {
  name: string;
  description?: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  allow_review: boolean;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_results: boolean;
  time_limit: boolean;
};

export type QuestionFormData = {
  content: string;
  type: 'single' | 'multiple' | 'matching' | 'drag-drop';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  options?: string[];
  correctAnswers?: number[];
  explanation?: string;
  matchingPairs?: { left: string; right: string }[];
  dragDropItems?: { id: string; content: string; correctPosition: number }[];
};

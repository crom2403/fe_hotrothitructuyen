// Base types for answer content and items
export type AnswerContent = { text: string; value?: string } | { left: string; right: string };

export interface AnswerItem {
  id: string;
  content: AnswerContent;
  order_index: number;
}

// Single Choice Types
export interface SingleChoiceConfig {
  kind: 'single_choice';
  options_count: number;
  correct: string;
}

// Multiple Select Types
export interface MultipleSelectConfig {
  kind: 'multiple_select';
  options_count: number;
  correct: string[];
}

// Drag Drop Types
export interface DragDropConfig {
  kind: 'drag_drop';
  zones: { text: string; value: string }[];
  correct: { id: string; zone: string; value: string }[];
}

// Matching Types
export interface MatchingConfig {
  kind: 'matching';
  pairs: { left: string; right: string }[];
  correct: { left: string; right: string }[];
}

// Ordering Types
export interface OrderingConfig {
  kind: 'ordering';
  items_count: number;
  correct: { id: string; value: string; order: number }[];
}

// Video Popup Types
export interface VideoPopupConfig {
  kind: 'video_popup';
  video_id: string;
  url: string;
  popup_times: {
    id: string;
    time: number;
    question: string;
    options: string[];
    correct: string;
  }[];
}

// Union type for all answer configurations
export type AnswerConfig = SingleChoiceConfig | MultipleSelectConfig | DragDropConfig | MatchingConfig | OrderingConfig | VideoPopupConfig;

// Type guards for each configuration type
export function isSingleChoiceConfig(config: AnswerConfig): config is SingleChoiceConfig {
  return config.kind === 'single_choice';
}

export function isMultipleSelectConfig(config: AnswerConfig): config is MultipleSelectConfig {
  return config.kind === 'multiple_select';
}

export function isDragDropConfig(config: AnswerConfig): config is DragDropConfig {
  return config.kind === 'drag_drop';
}

export function isMatchingConfig(config: AnswerConfig): config is MatchingConfig {
  return config.kind === 'matching';
}

export function isOrderingConfig(config: AnswerConfig): config is OrderingConfig {
  return config.kind === 'ordering';
}

export function isVideoPopupConfig(config: AnswerConfig): config is VideoPopupConfig {
  return config.kind === 'video_popup';
}

// Main form data type
export interface QuestionFormData {
  content: string;
  type_id: string;
  subject_id: string;
  difficulty_level_id: string;
  answers: AnswerItem[];
  answer_config: AnswerConfig;
  explanation?: string;
  is_public?: boolean;
}

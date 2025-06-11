export interface Question {
  id: string;
  content: string;
  type: "single" | "multiple" | "boolean" | "matching" | "drag-drop";
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}
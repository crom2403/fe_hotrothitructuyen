import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import QuestionForm from "./QuestionForm";
import type { QuestionFormData, QuestionType } from "@/types/questionType";
import type { UseFormReturn } from "react-hook-form";
import type { QuestionRequest } from "@/types/questionType";
import type { DifficultyLevel } from "@/types/difficultyLevelType";
import type { Subject } from "@/types/subjectType";

interface QuestionDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingQuestion: QuestionRequest | null;
  setEditingQuestion: (question: QuestionRequest | null) => void;
  form: UseFormReturn<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void;
  isLoading: boolean;
  questionType: string;
  questionTypes: QuestionType[];
  isLoadingQuestionTypes: boolean;
  difficultyLevels: DifficultyLevel[];
  isLoadingDifficultyLevels: boolean;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, value: string) => void;
  toggleCorrectAnswer: (index: number) => void;
  subjects: Subject[];
  isLoadingSubjects: boolean;
}

const QuestionDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  editingQuestion,
  setEditingQuestion,
  form,
  onSubmit,
  isLoading,
  questionType,
  questionTypes,
  isLoadingQuestionTypes,
  difficultyLevels,
  isLoadingDifficultyLevels,
  addOption,
  removeOption,
  updateOption,
  toggleCorrectAnswer,
  subjects,
  isLoadingSubjects,
}: QuestionDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
    }}>
      <DialogTrigger>
        <Button
          className="bg-black hover:bg-black/80"
          onClick={() => {
            setEditingQuestion(null);
            form.reset();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm câu hỏi
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70vw] max-w-[1200px] max-h-[90vh] overflow-y-auto bg-white p-6">
        <DialogHeader>
          <DialogTitle>{editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</DialogTitle>
          <DialogDescription>
            {editingQuestion ? "Cập nhật thông tin câu hỏi" : "Tạo câu hỏi mới cho ngân hàng"}
          </DialogDescription>
        </DialogHeader>
        <QuestionForm
          form={form}
          onSubmit={onSubmit} 
          editingQuestion={editingQuestion}
          isLoading={isLoading}
          isLoadingQuestionTypes={isLoadingQuestionTypes}
          questionType={questionType}
          questionTypes={questionTypes}
          addOption={addOption}
          removeOption={removeOption}
          updateOption={updateOption}
          toggleCorrectAnswer={toggleCorrectAnswer}
          difficultyLevels={difficultyLevels}
          isLoadingDifficultyLevels={isLoadingDifficultyLevels}
          subjects={subjects}
          isLoadingSubjects={isLoadingSubjects}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDialog;
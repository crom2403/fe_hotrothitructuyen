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
import type { Question, QuestionFormData } from "@/features/teacher/QuestionBank";
import type { UseFormReturn } from "react-hook-form";

interface QuestionDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingQuestion: Question | null;
  setEditingQuestion: (question: Question | null) => void;
  form: UseFormReturn<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void;
  isLoading: boolean;
  questionType: string;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, value: string) => void;
  toggleCorrectAnswer: (index: number) => void;
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
  addOption,
  removeOption,
  updateOption,
  toggleCorrectAnswer,
}: QuestionDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setEditingQuestion(null);
            form.reset();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm câu hỏi
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70vw] max-w-[1200px] min-h-[90vh] overflow-y-auto bg-white p-6">
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
          questionType={questionType}
          addOption={addOption}
          removeOption={removeOption}
          updateOption={updateOption}
          toggleCorrectAnswer={toggleCorrectAnswer}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDialog;
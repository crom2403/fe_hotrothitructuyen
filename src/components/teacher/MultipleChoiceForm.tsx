import type { QuestionFormData } from "@/features/teacher/QuestionBank";
import type { UseFormReturn } from "react-hook-form";

interface MultipleChoiceFormProps {
  form: UseFormReturn<QuestionFormData>;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, value: string) => void;
  toggleCorrectAnswer: (index: number) => void;
}

const MultipleChoiceForm = ({ form, addOption, removeOption, updateOption, toggleCorrectAnswer }: MultipleChoiceFormProps) => {
  return (
    <div>MultipleChoiceForm</div>
  )
}

export default MultipleChoiceForm
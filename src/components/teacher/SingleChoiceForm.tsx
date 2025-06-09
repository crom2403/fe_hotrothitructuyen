import type { QuestionFormData } from "@/features/teacher/QuestionBank"
import type { UseFormReturn } from "react-hook-form"

interface SingleChoiceFormProps {
  form: UseFormReturn<QuestionFormData>
  addOption: () => void                                                                                
  removeOption: (index: number) => void
  updateOption: (index: number, value: string) => void
  toggleCorrectAnswer: (index: number) => void
}
const SingleChoiceForm = ({ form, addOption, removeOption, updateOption, toggleCorrectAnswer }: SingleChoiceFormProps) => {
  return (
    <div>SingleChoiceForm</div>
  )
}

export default SingleChoiceForm
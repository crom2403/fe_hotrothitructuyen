import { Badge } from "@/components/ui/badge";
import type { QuestionItem } from "@/types/questionType";

interface MultipleChoiceDetailProps {
  question: QuestionItem | null;
}

const MultipleChoiceDetail = ({ question }: MultipleChoiceDetailProps) => {
  const correctAnswers = question?.answer_config.correct || [];
  const answers = question?.answers || [];

  return (
    <div className="space-y-2">
      <p className="font-semibold">Các phương án:</p>
      {
        answers.map((answer, index) => (
          <div
            key={answer.id}
            className={`p-3 border rounded-md ${correctAnswers.includes(answer.content.value) ? 'bg-green-50 border-green-500' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {String.fromCharCode(65 + index)}: {answer.content.text}
              </span>
              {
                correctAnswers.includes(answer.content.value) && (
                  <Badge className="bg-green-600 text-white">Đúng</Badge>
                )
              }
            </div>
          </div>
        ))
      }
    </div>
  )
}

export default MultipleChoiceDetail
import { Badge } from "@/components/ui/badge";
import type { QuestionItem } from "@/types/questionType";

interface SingleChoiceDetailProps {
  question: QuestionItem | null;
}

const SingleChoiceDetail = ({ question }: SingleChoiceDetailProps) => {

  const correctAnswer = question?.answer_config.correct;
  const answers = question?.answers || [];

  const orderAnswers = answers.sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-2">
      <p className="font-semibold">Các phương án:</p>
      {
        orderAnswers.map((answer, index) => (
          <div key={answer.id} className={`p-3 border rounded-md ${answer.content.value === correctAnswer ? 'bg-green-50 border-green-500' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {String.fromCharCode(65 + index)}: {answer.content.text}
              </span>
              {
                answer.content.value === correctAnswer && (
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

export default SingleChoiceDetail
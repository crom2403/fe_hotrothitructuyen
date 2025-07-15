
import type { QuestionItem } from "@/types/questionType";

interface OrderingDetailProps {
  question: QuestionItem | null;
}

const OrderingDetail = ({ question }: OrderingDetailProps) => {
  const correctOrder = question?.answer_config.correct || [];
  const answers = question?.answers || [];

  return (
    <div className="space-y-2">
      <p className="font-semibold">Thư tự đúng:</p>
      {
        correctOrder.map((correct, index) => {
          const answer = answers.find((a) => a.content.value === correct.value);
          return (
            <div key={correct?.id} className="p-3 border rounded-md bg-green-50 border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  Bước {index + 1}: {answer?.content.text || 'N/A'}
                </span>
              </div>
            </div>
          )
        })
      }
      {/* <p className="font-semibold mt-4">Các phương án:</p>
      {answers.map((answer, index) => {
        const isCorrectOrder = correctOrder.find((c) => c.value === answer.content.value)?.order === answer.order_index;
        return (
          <div
            key={answer.id}
            className={`p-3 border rounded-md ${isCorrectOrder ? 'bg-green-50 border-green-500' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                Đáp án {String.fromCharCode(65 + index)} ({answer.content.value}): {answer.content.text}
              </span>
              {isCorrectOrder && <Badge className="bg-green-600 text-white">Đúng</Badge>}
            </div>
          </div>
        );
      })} */}
    </div>
  )
}

export default OrderingDetail
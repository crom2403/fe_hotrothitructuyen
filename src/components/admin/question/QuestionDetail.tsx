import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { QuestionItem } from "@/types/questionType"
import parse from "html-react-parser"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface QuestionDetailProps {
  question: QuestionItem | null
}

const QuestionDetail = ({ question }: QuestionDetailProps) => {
  const getDifficultyColor = (difficultyName: string) => {
    switch (difficultyName) {
      case "Dễ": return "bg-green-100 text-green-800";
      case "Trung bình": return "bg-yellow-100 text-yellow-800";
      case "Khó": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ duyệt";
      case "approved": return "Đã duyệt";
      case "rejected": return "Từ chối";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500";
      case "approved": return "text-green-500";
      case "rejected": return " text-red-500";
      default: return " text-gray-500";
    }
  };
  if (!question) return null

  return (
    <DialogContent className="min-w-[47vw] max-w-[1200px] min-h-[60vh] overflow-y-auto bg-white p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">
          Chi tiết câu hỏi
        </DialogTitle>
      </DialogHeader>

      <ScrollArea className="h-[70vh] pr-2">
        <div className="space-y-4 text-sm text-gray-700">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Môn học:</span> {question.subject.name}
            </div>
            <div>
              <span className="font-semibold">Loại câu hỏi:</span> {question.question_type.name}
            </div>
            <div>
              <span className="font-semibold">Độ khó:</span>{" "}
              <Badge className={getDifficultyColor(question.difficulty_level.name)}>{question.difficulty_level.name}</Badge>
            </div>
            <div>
              <span className="font-semibold">Người tạo:</span>{" "}
              {question.created_by.full_name}
            </div>
            <div>
              <span className="font-semibold">Trạng thái duyệt:</span>{" "}
              <Badge
                variant="outline"
                className={getStatusColor(question.review_status)}
              >
                {getStatusText(question.review_status)}
              </Badge>
            </div>
            <div>
              <span className="font-semibold">Ngày tạo:</span>{" "}
              {new Date(question.created_at).toLocaleString("vi-VN")}
            </div>
          </div>

          <Separator />

          <div>
            <span className="font-semibold">Nội dung câu hỏi:</span>
            <div className="mt-2 p-3 border rounded-md bg-gray-50">
              {parse(question.content)}
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Các phương án:</p>
            {question.answers.map((answer, index) => (
              <div
                key={answer.id}
                className={`p-3 border rounded-md ${answer.is_correct ? "bg-green-50 border-green-500" : "bg-white"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Đáp án {index + 1}:</span>
                  {answer.is_correct && (
                    <Badge className="bg-green-600 text-white">Đúng</Badge>
                  )}
                </div>
                <div className="mt-1">{answer.content}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default QuestionDetail
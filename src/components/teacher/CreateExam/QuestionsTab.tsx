import { useState } from "react";
import ExamModeSelector from "./ExamModeSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SelectedQuestions from "./SelectedQuestions";
import type { QuestionItem, QuestionListResponse } from "@/types/questionType";
import QuestionList from "./QuestionList";
import useExamStore from "@/stores/examStore";

interface QuestionTabProps {}

const QuestionsTab = () => {
  const [examMode, setExamMode] = useState<"manual" | "auto" | "AI">("manual");
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionItem[]>([]);
  const { tab2Data, setListQuestions } = useExamStore();

  const addQuestionToExam = (question: QuestionItem) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      const updatedQuestions = [...selectedQuestions, question];
      setSelectedQuestions(updatedQuestions);
      setListQuestions(
        updatedQuestions.map((q, index) => ({
          question_id: q.id,
          order_index: index + 1,
        }))
      );
    }
  };

  const removeQuestionFromExam = (questionId: string) => {
    const updatedQuestions = selectedQuestions.filter((q) => q.id !== questionId);
    setSelectedQuestions(updatedQuestions);
    setListQuestions(
      updatedQuestions.map((q, index) => ({
        question_id: q.id,
        order_index: index + 1,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {examMode === "manual" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Phương thức tạo đề</CardTitle>
                <CardDescription>Chọn cách thức tạo câu hỏi cho đề thi</CardDescription>
              </CardHeader>
              <CardContent>
                <ExamModeSelector examMode={examMode} setExamMode={setExamMode} />
              </CardContent>
            </Card>
            <QuestionList selectedQuestions={selectedQuestions} addQuestionToExam={addQuestionToExam} />
          </div>
          <SelectedQuestions
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
            removeQuestionFromExam={removeQuestionFromExam}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;

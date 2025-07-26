import { useEffect, useState } from "react";
import ExamModeSelector from "./ExamModeSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SelectedQuestions from "./SelectedQuestions";
import type { QuestionItem } from "@/types/questionType";
import QuestionList from "./QuestionList";
import useExamStore from "@/stores/examStore";
import AutoMode from "./AutoMode";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { apiGetRandomQuestions } from "@/services/teacher/createExam";

interface QuestionTabProps {
  selectedSubjectId: string;
}

interface RandomQuestion {
  data: QuestionItem[];
}

const QuestionsTab = ({ selectedSubjectId }: QuestionTabProps) => {
  const { tab2Data, setListQuestions, setListQuestionsFull, commonProps } = useExamStore();
  const [isLoading, setIsLoading] = useState(false);

  const examMode = tab2Data.exam_type as "manual" | "auto";

  useEffect(() => {
    setListQuestions(
      commonProps.list_questions.map((q, index) => ({
        question_id: q.id,
        order_index: index + 1,
      })),
    );
    setListQuestionsFull(commonProps.list_questions);
  }, [commonProps.list_questions, setListQuestions, setListQuestionsFull]);

  const addQuestionToExam = (question: QuestionItem) => {
    if (!commonProps.list_questions.find((q) => q.id === question.id)) {
      const updatedQuestions = [...commonProps.list_questions, question];
      setListQuestionsFull(updatedQuestions);
      setListQuestions(
        updatedQuestions.map((q, index) => ({
          question_id: q.id,
          order_index: index + 1,
        })),
      );
    }
  };

  const removeQuestionFromExam = (questionId: string) => {
    const updatedQuestions = commonProps.list_questions.filter((q) => q.id !== questionId);
    setListQuestionsFull(updatedQuestions);
    setListQuestions(
      updatedQuestions.map((q, index) => ({
        question_id: q.id,
        order_index: index + 1,
      })),
    );
  };

  const generateAutoExam = async () => {
    setIsLoading(true);
    try{
      const response = await apiGetRandomQuestions(selectedSubjectId, tab2Data.difficulty.easy, tab2Data.difficulty.medium, tab2Data.difficulty.hard);
      if (response.status === 200) {
        if (response.status === 200) {
          const questions = response.data || []; // Xử lý nếu data.data là undefined
          console.log(questions);
          if (!Array.isArray(questions)) {
            throw new Error("Dữ liệu câu hỏi không hợp lệ từ API");
          }
          setListQuestionsFull(questions);
          setListQuestions(
            questions.map((q, index) => ({
              question_id: q.id,
              order_index: index + 1,
            })),
          );
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
                <ExamModeSelector examMode={examMode} setExamMode={(mode) => useExamStore.getState().setExamType(mode)} />
              </CardContent>
            </Card>
            <QuestionList
              selectedQuestions={commonProps.list_questions}
              addQuestionToExam={addQuestionToExam}
              selectedSubjectId={selectedSubjectId}
            />
          </div>
          <SelectedQuestions
            selectedQuestions={commonProps.list_questions}
            setSelectedQuestions={(questions) => setListQuestionsFull(questions)}
            removeQuestionFromExam={removeQuestionFromExam}
          />
        </div>
      )}

      {examMode === "auto" && (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Phương thức tạo đề</CardTitle>
                <CardDescription>Chọn cách thức tạo câu hỏi cho đề thi</CardDescription>
              </CardHeader>
              <CardContent>
                <ExamModeSelector examMode={examMode} setExamMode={(mode) => useExamStore.getState().setExamType(mode)} />
              </CardContent>
            </Card>
            <AutoMode examMode={examMode} isLoading={isLoading} generateAutoExam={generateAutoExam} />
            <SelectedQuestions
              selectedQuestions={commonProps.list_questions}
              setSelectedQuestions={(questions) => setListQuestionsFull(questions)}
              removeQuestionFromExam={removeQuestionFromExam}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;
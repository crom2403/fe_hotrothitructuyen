import { useEffect, useState } from "react";
import ExamModeSelector from "./ExamModeSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SelectedQuestions from "./SelectedQuestions";
import type { QuestionItem } from "@/types/questionType";
import QuestionList from "./QuestionList";
import useExamStore from "@/stores/examStore";
import AutoMode from "./AutoMode";
import { setQuestionsToCache } from "@/utils/questionCache";

interface QuestionTabProps {
  selectedSubjectId: string;
}

const QuestionsTab = ({ selectedSubjectId }: QuestionTabProps) => {
  const [examMode, setExamMode] = useState<'manual' | 'auto' | 'ai'>('manual');
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionItem[]>([]);
  const { tab2Data, setListQuestions, setListQuestionsFull, commonProps } = useExamStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tab2Data.exam_type && tab2Data.exam_type !== examMode) {
      setExamMode(tab2Data.exam_type as 'manual' | 'auto' | 'ai');
    }
  }, [tab2Data.exam_type, examMode]);

  useEffect(() => {
    setSelectedQuestions(commonProps.list_questions);
  }, [commonProps.list_questions]);



  const addQuestionToExam = (question: QuestionItem) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      const updatedQuestions = [...selectedQuestions, question];
      setSelectedQuestions(updatedQuestions);
      setListQuestions(
        updatedQuestions.map((q, index) => ({
          question_id: q.id,
          order_index: index + 1,
        })),
      );
      setQuestionsToCache([question]);
      setListQuestionsFull(
        updatedQuestions
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
      })),
    );
    setQuestionsToCache(updatedQuestions);
    setListQuestionsFull(
      updatedQuestions
    );
  };

  return (
    <div className="space-y-6">
      {examMode === 'manual' && (
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
            <QuestionList selectedQuestions={selectedQuestions} addQuestionToExam={addQuestionToExam} selectedSubjectId={selectedSubjectId} />
          </div>
          <SelectedQuestions selectedQuestions={selectedQuestions} setSelectedQuestions={setSelectedQuestions} removeQuestionFromExam={removeQuestionFromExam} />
        </div>
      )}

      {examMode === 'auto' && (
        <div className="grid grid-cols-1 gap-4">
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
            <AutoMode examMode={examMode} isLoading={isLoading} />
          </div>
        </div>
      )}
      {examMode === 'ai' && (
        <div className="grid grid-cols-1 gap-4">
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
            <AutoMode examMode={examMode} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;

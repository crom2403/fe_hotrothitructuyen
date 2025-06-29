import { useEffect, useState } from "react";
import ExamModeSelector from "./ExamModeSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SelectedQuestions from "./SelectedQuestions";
import type { QuestionItem } from "@/types/questionType";
import QuestionList from "./QuestionList";
import useExamStore from "@/stores/examStore";
import AutoMode from "./AutoMode";
import { getQuestionsByIds, setQuestionsToCache } from "@/utils/questionCache";
import { apiGetQuestionById } from "@/services/teacher/question";

interface QuestionTabProps {
  selectedSubjectId: string;
}

const QuestionsTab = ({ selectedSubjectId }: QuestionTabProps) => {
  const [examMode, setExamMode] = useState<"manual" | "auto" | "ai">("manual");
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionItem[]>([]);
  const { tab2Data, setListQuestions } = useExamStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tab2Data.exam_type && tab2Data.exam_type !== examMode) {
      setExamMode(tab2Data.exam_type as "manual" | "auto" | "ai");
    }
  }, [tab2Data.exam_type, examMode]);

  useEffect(() => {
    const loadSelectedQuestions = async () => {
      setIsLoading(true);
      try {
        const questionIds = tab2Data.list_questions.map((q) => q.question_id);
        if (questionIds.length > 0) {
          const promises = questionIds.map((id) => apiGetQuestionById(id));
          const questions = await Promise.all(promises);
          setQuestionsToCache(questions.map((q) => q.data));
          setSelectedQuestions(getQuestionsByIds(questionIds));
        } else {
          setSelectedQuestions([]);
        }
      } catch (error) {
        console.error("Failed to load selected questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSelectedQuestions();
  }, [tab2Data.list_questions, selectedSubjectId]);

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
      setQuestionsToCache([question]);
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
    setQuestionsToCache(updatedQuestions);
  };

  const generateAutoExam = () => {
    // setIsLoading(true);
    // try {
    //   const response = await apiGetQuestionBank(1, "", selectedSubjectId, "all", "all", 100);
    //   const questions = response.data.data;
    //   const selected = questions
    //     .sort(() => 0.5 - Math.random()) // Random selection
    //     .slice(0, 10); // Lấy 10 câu hỏi (có thể điều chỉnh)
    //   setQuestionsToCache(selected);
    //   setSelectedQuestions(selected);
    //   setListQuestions(
    //     selected.map((q, index) => ({
    //       question_id: q.id,
    //       order_index: index + 1,
    //     }))
    //   );
    // } catch (error) {
    //   console.error("Failed to generate auto exam:", error);
    // } finally {
    //   setIsLoading(false);
    // }
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
            <QuestionList selectedQuestions={selectedQuestions} addQuestionToExam={addQuestionToExam} selectedSubjectId={selectedSubjectId} />
          </div>
          <SelectedQuestions
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
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
                <ExamModeSelector examMode={examMode} setExamMode={setExamMode} />
              </CardContent>
            </Card>
            <AutoMode examMode={examMode} isLoading={isLoading} generateAutoExam={generateAutoExam} />
          </div>
        </div>
      )}
      {examMode === "ai" && (
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
            <AutoMode examMode={examMode} isLoading={isLoading} generateAutoExam={generateAutoExam} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import useExamStore from "@/stores/examStore";
import type { QuestionItem } from "@/types/questionType";
import { useState } from "react";
import parse from "html-react-parser";

interface ExamPreviewProps {
  selectedQuestions: QuestionItem[];
}

const ExamPreview = ({ selectedQuestions }: ExamPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { tab1Data, tab2Data, tab3Data, commonProps } = useExamStore();

  const getDifficultyDistribution = () => {
    const total = selectedQuestions.length;
    if (total === 0) return { easy: 0, medium: 0, hard: 0 };

    const easy = selectedQuestions.filter((q) => q.difficulty_level?.name === "Dễ").length;
    const medium = selectedQuestions.filter((q) => q.difficulty_level?.name === "Trung bình").length;
    const hard = selectedQuestions.filter((q) => q.difficulty_level?.name === "Khó").length;

    return {
      easy: Math.round((easy / total) * 100),
      medium: Math.round((medium / total) * 100),
      hard: Math.round((hard / total) * 100),
    };
  };

  const distribution = getDifficultyDistribution();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Xem chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Chi tiết đề thi</DialogTitle>
        </DialogHeader>
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl">Thông tin đề thi</CardTitle>
            <CardDescription className="text-gray-600">Xem chi tiết cấu trúc và nội dung đề thi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tên đề thi</Label>
                <p className="text-sm text-gray-900">{tab1Data.name || "Chưa nhập"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Môn học</Label>
                <p className="text-sm text-gray-900">{commonProps.subject_name || tab1Data.subject || "Chưa chọn"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nhóm học</Label>
                <p className="text-sm text-gray-900">{commonProps.study_group_name || tab1Data.study_group || "Chưa chọn"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Thời gian</Label>
                <p className="text-sm text-gray-900">{tab1Data.duration_minutes} phút</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Số câu hỏi</Label>
                <p className="text-sm text-gray-900">{selectedQuestions.length} câu</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Điểm đậu</Label>
                <p className="text-sm text-gray-900">{tab1Data.pass_points}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Thang điểm</Label>
                <p className="text-sm text-gray-900">{commonProps.point_scale_name || tab1Data.point_scale || "Chưa đặt"}</p>
              </div>
            </div>
            <Separator className="bg-gray-200" />
            <div>
              <Label className="text-sm font-medium text-gray-700">Danh sách câu hỏi</Label>
              <div className="mt-4 space-y-6 max-h-[500px] overflow-y-auto">
                {selectedQuestions.map((question, index) => (
                  <Card key={question.id} className="border-gray-200 shadow-sm">
                    <CardHeader className="bg-white">
                      <CardTitle className="text-lg font-semibold">
                        Câu {index + 1}: {parse(question.content)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {question.answers?.map((option, optIndex) => {
                          const isCorrect = option.is_correct;
                          return (
                            <div
                              key={optIndex}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-150
                                ${isCorrect && "bg-green-50 border border-green-500"}
                              `}
                            >
                              <span className="font-medium text-gray-800">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className="text-gray-700 flex-1">{option.content}</span>
                              {isCorrect && (
                                <CheckCircle className="text-green-600 w-4 h-4" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {selectedQuestions.length === 0 && (
                  <p className="text-gray-500 text-center">Chưa có câu hỏi nào được chọn.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export default ExamPreview
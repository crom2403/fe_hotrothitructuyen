import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import useExamStore from "@/stores/examStore";
import type { QuestionItem } from "@/types/questionType";
import useUpdateExamStore from "@/stores/updateExamStore";

interface PreviewTabProps {
  selectedQuestions: QuestionItem[];
  mode: 'create' | 'update';
}

export function PreviewTab({ selectedQuestions, mode }: PreviewTabProps) {
  const store = mode === 'create' ? useExamStore : useUpdateExamStore;
  const { tab1Data, tab3Data, commonProps } = store();

  const getDifficultyDistribution = () => {
    const total = selectedQuestions.length;
    if (total === 0) return { easy: 0, medium: 0, hard: 0 };

    const easy = selectedQuestions.filter((q) => q.difficulty_level.name === "Dễ").length;
    const medium = selectedQuestions.filter((q) => q.difficulty_level.name === "Trung bình").length;
    const hard = selectedQuestions.filter((q) => q.difficulty_level.name === "Khó").length;

    return {
      easy: Math.round((easy / total) * 100),
      medium: Math.round((medium / total) * 100),
      hard: Math.round((hard / total) * 100),
    };
  };

  const distribution = getDifficultyDistribution();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem trước đề thi</CardTitle>
        <CardDescription>Kiểm tra thông tin đề thi trước khi lưu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Tên đề thi</Label>
            <p className="text-sm text-gray-600">{tab1Data.name || "Chưa nhập"}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Thời gian</Label>
            <p className="text-sm text-gray-600">{tab1Data.duration_minutes} phút</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Số câu hỏi</Label>
            <p className="text-sm text-gray-600">{selectedQuestions.length} câu</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Tổng điểm</Label>
            <p className="text-sm text-gray-600">10 điểm</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Điểm đậu</Label>
            <p className="text-sm text-gray-600">{tab1Data.pass_points} điểm</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Số lần chuyển tab</Label>
            <p className="text-sm text-gray-600">{tab1Data.max_tab_switch}</p>
          </div>
        </div>
        <Separator />
        <div>
          <Label className="text-sm font-medium">Phân bố độ khó</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dễ</span>
              <span className="text-sm">{distribution.easy}%</span>
            </div>
            <Progress value={distribution.easy} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm">Trung bình</span>
              <span className="text-sm">{distribution.medium}%</span>
            </div>
            <Progress value={distribution.medium} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm">Khó</span>
              <span className="text-sm">{distribution.hard}%</span>
            </div>
            <Progress value={distribution.hard} className="h-2" />
          </div>
        </div>
        <Separator />
        <div>
          <Label className="text-sm font-medium">Cài đặt</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`h-4 w-4 ${tab3Data.allow_review ? "text-green-600" : "text-gray-400"}`}
              />
              <span>Cho phép xem lại</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`h-4 w-4 ${tab3Data.allow_review_point ? "text-green-600" : "text-gray-400"}`}
              />
              <span>Cho phép xem điểm</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`h-4 w-4 ${tab3Data.is_shuffled_questions ? "text-green-600" : "text-gray-400"}`}
              />
              <span>Xáo trộn câu hỏi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`h-4 w-4 ${tab3Data.is_shuffled_answer ? "text-green-600" : "text-gray-400"}`}
              />
              <span>Xáo trộn phương án</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`h-4 w-4 ${tab3Data.show_correct_answer ? "text-green-600" : "text-gray-400"}`}
              />
              <span>Hiển thị đáp án đúng</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
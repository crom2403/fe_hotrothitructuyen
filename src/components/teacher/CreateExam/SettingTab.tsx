import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useExamStore from "@/stores/examStore";

export function SettingsTab() {
  const {
    tab3Data,
    setIsShuffledQuestions,
    setIsShuffledAnswer,
    setAllowReview,
    setAllowReviewPoint,
    setShowCorrectAnswer,
  } = useExamStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt đề thi</CardTitle>
        <CardDescription>Cấu hình các tùy chọn cho đề thi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cho phép xem lại bài</Label>
              <p className="text-sm text-gray-500">Sinh viên có thể xem lại bài sau khi nộp</p>
            </div>
            <Switch checked={tab3Data.allow_review} onCheckedChange={setAllowReview} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cho phép xem điểm</Label>
              <p className="text-sm text-gray-500">Sinh viên có thể xem điểm chi tiết</p>
            </div>
            <Switch checked={tab3Data.allow_review_point} onCheckedChange={setAllowReviewPoint} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Xáo trộn câu hỏi</Label>
              <p className="text-sm text-gray-500">Thứ tự câu hỏi sẽ được xáo trộn cho mỗi sinh viên</p>
            </div>
            <Switch checked={tab3Data.is_shuffled_questions} onCheckedChange={setIsShuffledQuestions} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Xáo trộn phương án</Label>
              <p className="text-sm text-gray-500">Thứ tự các phương án trả lời sẽ được xáo trộn</p>
            </div>
            <Switch checked={tab3Data.is_shuffled_answer} onCheckedChange={setIsShuffledAnswer} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hiển thị đáp án đúng</Label>
              <p className="text-sm text-gray-500">Hiển thị đáp án đúng sau khi nộp bài</p>
            </div>
            <Switch checked={tab3Data.show_correct_answer} onCheckedChange={setShowCorrectAnswer} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

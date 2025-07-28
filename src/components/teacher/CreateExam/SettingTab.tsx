import QuillEditor from "@/components/common/QuillEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useExamStore from "@/stores/examStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useUpdateExamStore from "@/stores/updateExamStore";

const formSchema = z.object({
  instruction: z.string().min(10, "Hướng dẫn phải có ít nhất 10 ký tự"),
});

export function SettingsTab({ mode }: { mode: 'create' | 'update' }) {
  const store = mode === 'create' ? useExamStore : useUpdateExamStore;
  const {
    tab1Data,
    tab3Data,
    setIsShuffledQuestions,
    setIsShuffledAnswer,
    setAllowReview,
    setAllowReviewPoint,
    setShowCorrectAnswer,
    setInstruction,
  } = store();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instruction: tab3Data.instruction || `
        <p>Chào bạn, trước khi bắt đầu bài thi, vui lòng đọc kỹ các hướng dẫn và nội quy sau:</p>
        <ul>
          <li>Thời gian làm bài: [xx] phút | Số câu hỏi: [xx] câu | Hình thức: Trắc nghiệm online.</li>
          <li>Khi hết giờ, hệ thống tự động nộp bài. Bạn cũng có thể chủ động nộp bài khi hoàn thành.</li>
          <li>Không được thoát trang, tải lại trình duyệt, hoặc sử dụng phần mềm hỗ trợ/tham khảo khác.</li>
          <li>Mọi hành vi gian lận, thi hộ, hoặc sao chép bài làm sẽ bị hủy kết quả và xử lý theo quy định.</li>
          <li>Đảm bảo thiết bị hoạt động tốt, kết nối internet ổn định và không bị làm phiền khi đang thi.</li>
        </ul>
        <p>👉 Bấm "Bắt đầu làm bài" để bắt đầu phần thi. Chúc bạn làm bài tốt!</p>
      `,
    },
  });

  // Cập nhật nội dung động khi tab1Data thay đổi
  useEffect(() => {
    const updateInstruction = (content: string) => {
      const duration = tab1Data.duration_minutes || "[xx]";
      const totalQuestions = tab1Data.total_questions || "[xx]";
      return content
        .replace("[xx] phút", `${duration} phút`)
        .replace("[xx] câu", `${totalQuestions} câu`);
    };

    const currentInstruction = form.getValues("instruction");
    const updatedInstruction = updateInstruction(currentInstruction);
    if (currentInstruction !== updatedInstruction) {
      form.setValue("instruction", updatedInstruction);
      setInstruction(updatedInstruction); // Cập nhật store nếu có thay đổi
    }
  }, [tab1Data.duration_minutes, tab1Data.total_questions, form, setInstruction]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setInstruction(values.instruction);
    toast.success("Cập nhật hướng dẫn thành công");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Cài đặt đề thi</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quy định thi</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="instruction"
                render={({ field }) => (
                  <div className="space-y-2">
                    <QuillEditor
                      form={form}
                      name={field.name}
                      label=""
                      placeholder="Nhập nội dung quy định thi..."
                    />
                  </div>
                )}
              />
              <Button type="submit" className="bg-black text-white hover:bg-black/80 float-right">
                Lưu hướng dẫn
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
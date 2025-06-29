import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
import type { QuestionFormData, QuestionItem, QuestionTypeResponse } from "@/types/questionType";
import { useForm } from "react-hook-form";
import type { DifficultyLevel } from "@/types/difficultyLevelType";
import type { AssignedSubjectByTeacher, SubjectResponse } from "@/types/subjectType";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { useEffect, useState } from "react";
import { useApiCall } from "@/hooks/useApiCall";
import { apiGetAssignedSubjectByTeacher, apiGetSubjects } from "@/services/admin/subject";
import { apiCreateQuestion, apiGetDifficultyLevels, apiGetQuestionTypes } from "@/services/teacher/question";
import QuillEditor from "../common/QuillEditor";
import { SingleChoiceForm } from "./SingleChoiceForm";
import MultipleChoiceForm from "./MultipleChoiceForm";
import InfoPopup from "../common/InfoPopup";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import useAuthStore from "@/stores/authStore";

const questionSchema = z.object({
  content: z.string().min(1, "Nội dung câu hỏi không được để trống"),
  type_id: z.string().min(1, "Vui lòng chọn loại câu hỏi"),
  subject_id: z.string().min(1, "Vui lòng chọn môn học"),
  difficulty_level_id: z.string().min(1, "Vui lòng chọn độ khó"),
  options: z.array(z.string()).min(2, "Phải có ít nhất 2 phương án"),
  correctAnswers: z.array(z.number()).min(1, "Phải có ít nhất 1 đáp án đúng"),
  explanation: z.string().optional(),
  is_public: z.boolean().default(false),
});

interface QuestionFormDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingQuestion?: QuestionItem | null;
  setEditingQuestion?: (question: QuestionItem | null) => void;
  refetchQuestionsPrivate?: () => void;
}

const QuestionFormDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  editingQuestion,
  setEditingQuestion,
  refetchQuestionsPrivate,
}: QuestionFormDialogProps) => {
  const { data: questionTypes, isLoading: isLoadingQuestionTypes, refetch: refetchQuestionTypes } = useApiCall<QuestionTypeResponse>(() => apiGetQuestionTypes());
  const { data: difficultyLevels, isLoading: isLoadingDifficultyLevels, refetch: refetchDifficultyLevels } = useApiCall<{ data: DifficultyLevel[] }>(() => apiGetDifficultyLevels());

  const [open, setOpen] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const { currentUser } = useAuthStore();
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubjectByTeacher[]>([]);
  const [isLoadingAssignedSubjects, setIsLoadingAssignedSubjects] = useState(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: "",
      type_id: "",
      subject_id: "",
      difficulty_level_id: "",
      options: ["", ""],
      correctAnswers: [],
      explanation: "",
      is_public: false,
    },
  });

  const handleGetAssignedSubjects = async () => {
    setIsLoadingAssignedSubjects(true);
    try {
      const response = await apiGetAssignedSubjectByTeacher(currentUser?.id || "");
      setAssignedSubjects(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingAssignedSubjects(false);
    }
  }
  useEffect(() => {
    refetchQuestionTypes();
    refetchDifficultyLevels();
    handleGetAssignedSubjects();
  }, []);

  useEffect(() => {
    if (editingQuestion) {
      const sortedAnswers = [...editingQuestion.answers].sort((a, b) => a.order_index - b.order_index);
      form.reset({
        content: editingQuestion.content,
        type_id: editingQuestion.question_type.id,
        subject_id: editingQuestion.subject.id,
        difficulty_level_id: editingQuestion.difficulty_level.id,
        options: sortedAnswers.map((answer) => answer.content),
        correctAnswers: sortedAnswers
          .filter((answer) => answer.is_correct)
          .map((answer) => answer.order_index),
        is_public: editingQuestion.is_public,
      });
    } else {
      form.reset({
        content: "",
        type_id: "",
        subject_id: "",
        difficulty_level_id: "",
        options: ["", ""],
        correctAnswers: [],
        explanation: "",
        is_public: false,
      });
    }
  }, [editingQuestion, form]);

  const typeId = form.watch("type_id");
  const questionType = questionTypes?.data.find((type) => type.id === typeId)?.code || "";

  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      form.setValue("options", newOptions);
      const correctAnswers = form.getValues("correctAnswers");
      const newCorrectAnswers = correctAnswers
        .filter((answer) => answer !== index)
        .map((answer) => (answer > index ? answer - 1 : answer));
      form.setValue("correctAnswers", newCorrectAnswers);
    }
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = form.getValues("options");
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    form.setValue("options", newOptions);
  };

  const toggleCorrectAnswer = (index: number) => {
    const correctAnswers = form.getValues("correctAnswers");
    const questionTypeId = form.getValues("type_id");
    const selectedType = questionTypes?.data.find((type) => type.id === questionTypeId);

    if (selectedType?.code === "single_choice") {
      form.setValue("correctAnswers", [index]);
    } else {
      const newCorrectAnswers = correctAnswers.includes(index)
        ? correctAnswers.filter((answer) => answer !== index)
        : [...correctAnswers, index];
      form.setValue("correctAnswers", newCorrectAnswers);
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    setIsLoadingSubmit(true);
    if (editingQuestion === null) {
      try {
        const apiData = {
          subject_id: data.subject_id,
          type_id: data.type_id,
          difficulty_level_id: data.difficulty_level_id,
          content: data.content,
          is_public: data.is_public,
          explanation: data.explanation,
          answers: data.options.map((content, index) => ({
            content,
            is_correct: data.correctAnswers.includes(index),
            order_index: index,
          })),
        };
        const response = await apiCreateQuestion(apiData);
        if (response.status === 201) {
          toast.success("Tạo câu hỏi thành công");
          setIsDialogOpen(false);
          refetchQuestionsPrivate?.();
        } else {
          toast.error("Tạo câu hỏi thất bại");
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string, error: string }>;
        const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
        toast.error(errorMessage);
      } finally {
        setIsLoadingSubmit(false);
      }
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
    }}>
      <DialogTrigger>
        <Button
          className="bg-black hover:bg-black/80"
          onClick={() => {
            setEditingQuestion?.(null);
            setIsDialogOpen(true);
            form.reset();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm câu hỏi
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70vw] max-w-[1200px] max-h-[90vh] overflow-y-auto bg-white p-6">
        <DialogHeader>
          <DialogTitle>{editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</DialogTitle>
          <DialogDescription>
            {editingQuestion ? "Cập nhật thông tin câu hỏi" : "Tạo câu hỏi mới cho ngân hàng"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Môn học</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingAssignedSubjects}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingAssignedSubjects ? "Đang tải môn học..." : "Chọn môn học"} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.subject.id}>
                              {subject.subject.code} - {subject.subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại câu hỏi</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingQuestionTypes}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingQuestionTypes ? "Đang tải loại câu hỏi..." : "Chọn loại câu hỏi"} />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes?.data.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty_level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ khó</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDifficultyLevels}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingDifficultyLevels ? "Đang tải độ khó..." : "Chọn độ khó"} />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels?.data.map((difficulty) => (
                            <SelectItem key={difficulty.id} value={difficulty.id}>
                              {difficulty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <QuillEditor
                    form={form}
                    name="content"
                    label="Nội dung câu hỏi"
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                )}
              />
            </div>

            {/* Dạng câu hỏi */}
            {questionType === "single_choice" && (
              <SingleChoiceForm
                form={form}
                addOption={addOption}
                removeOption={removeOption}
                updateOption={updateOption}
                toggleCorrectAnswer={toggleCorrectAnswer}
              />
            )}
            {questionType === "multiple_choice" && (
              <MultipleChoiceForm
                form={form}
                addOption={addOption}
                removeOption={removeOption}
                updateOption={updateOption}
                toggleCorrectAnswer={toggleCorrectAnswer}
              />
            )}

            <div className="space-y-2">
              <FormLabel>Giải thích (tùy chọn)</FormLabel>
              <Textarea
                id="explanation"
                rows={2}
                {...form.register("explanation")}
                placeholder="Giải thích đáp án đúng..."
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-md font-medium">Lưu vào ngân hàng câu hỏi?</FormLabel>
                          <InfoPopup text="Khi lưu vào ngân hàng câu hỏi cần phải qua sự kiểm duyệt của quản trị viên" open={open} setOpen={setOpen} />
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=unchecked]:bg-gray-300 cursor-pointer"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                setIsDialogOpen(false);
              }}>
                Hủy
              </Button>
              <Button type="submit" className="bg-black hover:bg-black/80" disabled={isLoadingSubmit}>
                {isLoadingSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingQuestion ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : editingQuestion ? (
                  "Cập nhật"
                ) : (
                  "Tạo câu hỏi"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormDialog;
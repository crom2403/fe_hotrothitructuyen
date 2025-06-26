import QuestionDialog from "@/components/teacher/QuestionDialog";
import QuestionTable from "@/components/teacher/QuestionTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { apiGetSubjects } from "@/services/admin/subject";
import { apiCreateQuestion, apiGetDifficultyLevels, apiGetQuestionBank, apiGetQuestionPrivate, apiGetQuestionTypes } from "@/services/teacher/question";
import type { DifficultyLevel } from "@/types/difficultyLevelType";
import type { QuestionFormData, QuestionTypeResponse, QuestionListResponse, QuestionItem } from "@/types/questionType";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import type { SubjectResponse } from "@/types/subjectType";
import { useApiCall } from "@/hooks/useApiCall";

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

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState("private_question");
  const [searchTermBank, setSearchTermBank] = useState("");
  const [searchTermPrivate, setSearchTermPrivate] = useState("");
  const [subjectFilterBank, setSubjectFilterBank] = useState<string>("all");
  const [subjectFilterPrivate, setSubjectFilterPrivate] = useState<string>("all");
  const [difficultyFilterBank, setDifficultyFilterBank] = useState<string>("all");
  const [difficultyFilterPrivate, setDifficultyFilterPrivate] = useState<string>("all");
  const [typeFilterBank, setTypeFilterBank] = useState<string>("all");
  const [typeFilterPrivate, setTypeFilterPrivate] = useState<string>("all");
  const [pageBank, setPageBank] = useState(1);
  const [pagePrivate, setPagePrivate] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

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

  const getQuestionsBank = useCallback(() => apiGetQuestionBank(pageBank, searchTermBank, subjectFilterBank, typeFilterBank, difficultyFilterBank), [
    pageBank,
    subjectFilterBank,
    typeFilterBank,
    difficultyFilterBank,
  ]);

  const getQuestionsPrivate = useCallback(() => apiGetQuestionPrivate(pagePrivate, searchTermPrivate, subjectFilterPrivate, typeFilterPrivate, difficultyFilterPrivate), [
    pagePrivate,
    subjectFilterPrivate,
    typeFilterPrivate,
    difficultyFilterPrivate,
  ]);

  const { data: questionsBank, isLoading: isLoadingBank, refetch: refetchQuestionsBank, error: bankError } = useApiCall<QuestionListResponse>(getQuestionsBank);
  const { data: questionsPrivate, isLoading: isLoadingPrivate, refetch: refetchQuestionsPrivate, error: privateError } = useApiCall<QuestionListResponse>(getQuestionsPrivate);
  const { data: questionTypes, isLoading: isLoadingQuestionTypes, refetch: refetchQuestionTypes } = useApiCall<QuestionTypeResponse>(() => apiGetQuestionTypes());
  const { data: difficultyLevels, isLoading: isLoadingDifficultyLevels, refetch: refetchDifficultyLevels } = useApiCall<{ data: DifficultyLevel[] }>(() => apiGetDifficultyLevels());
  const { data: subjects, isLoading: isLoadingSubjects, refetch: refetchSubjects } = useApiCall<SubjectResponse>(() => apiGetSubjects(1, "active", "", 100));

  useEffect(() => {
    if (activeTab === "private_question") {
      refetchQuestionsPrivate();
    } else if (activeTab === "question_bank") {
      refetchQuestionsBank();
    }
  }, [activeTab, refetchQuestionsPrivate, refetchQuestionsBank]);

  useEffect(() => {
    if (isDialogOpen) {
      refetchQuestionTypes();
      refetchDifficultyLevels();
      refetchSubjects();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (isDialogOpen) {
      form.reset();
      setEditingQuestion(null);
    }
  }, [isDialogOpen, form]);

  const typeId = form.watch("type_id");
  const questionType = questionTypes?.data.find((type) => type.id === typeId)?.code || "";

  const onSubmit = async (data: QuestionFormData) => {
    setIsLoadingSubmit(true);
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
        refetchQuestionsPrivate(); // Cập nhật private sau khi tạo
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
  };

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
    const questionType = form.getValues("type_id");

    if (questionType === "single") {
      form.setValue("correctAnswers", [index]);
    } else {
      const newCorrectAnswers = correctAnswers.includes(index)
        ? correctAnswers.filter((answer) => answer !== index)
        : [...correctAnswers, index];
      form.setValue("correctAnswers", newCorrectAnswers);
    }
  };

  const handleEdit = (question: QuestionItem) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
    // TODO: Implement form reset with question data
  };

  const handleDelete = (questionId: string) => {
    // TODO: Implement delete logic
  };

  const handlePageClickBank = (page: number) => setPageBank(page);
  const handlePageClickPrivate = (page: number) => setPagePrivate(page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý các câu hỏi của bạn</h1>
          <p className="text-gray-500">Quản lý và tạo các câu hỏi cho bài thi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <QuestionDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            editingQuestion={editingQuestion}
            setEditingQuestion={setEditingQuestion}
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoadingSubmit}
            questionType={questionType}
            difficultyLevels={difficultyLevels?.data || []}
            isLoadingDifficultyLevels={isLoadingDifficultyLevels}
            questionTypes={questionTypes?.data || []}
            isLoadingQuestionTypes={isLoadingQuestionTypes}
            addOption={addOption}
            removeOption={removeOption}
            updateOption={updateOption}
            toggleCorrectAnswer={toggleCorrectAnswer}
            subjects={subjects?.data || []}
            isLoadingSubjects={isLoadingSubjects}
          />
        </div>
      </div>

      <Tabs defaultValue="private_question" onValueChange={setActiveTab}>
        <TabsList className="w-full space-x-4">
          <TabsTrigger value="private_question">Câu hỏi riêng</TabsTrigger>
          <TabsTrigger value="question_bank">Ngân hàng câu hỏi</TabsTrigger>
        </TabsList>

        <TabsContent value="private_question">
          <QuestionTable
            questions={questionsPrivate?.data || []}
            searchTerm={searchTermPrivate}
            setSearchTerm={setSearchTermPrivate}
            subjectFilter={subjectFilterPrivate}
            setSubjectFilter={setSubjectFilterPrivate}
            typeFilter={typeFilterPrivate}
            setTypeFilter={setTypeFilterPrivate}
            difficultyFilter={difficultyFilterPrivate}
            setDifficultyFilter={setDifficultyFilterPrivate}
            page={pagePrivate}
            totalPages={questionsPrivate?.metadata.last_page || 1}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePageClick={handlePageClickPrivate}
            isLoading={isLoadingPrivate}
          />
        </TabsContent>

        <TabsContent value="question_bank">
          <QuestionTable
            questions={questionsBank?.data || []}
            searchTerm={searchTermBank}
            setSearchTerm={setSearchTermBank}
            subjectFilter={subjectFilterBank}
            setSubjectFilter={setSubjectFilterBank}
            typeFilter={typeFilterBank}
            setTypeFilter={setTypeFilterBank}
            difficultyFilter={difficultyFilterBank}
            setDifficultyFilter={setDifficultyFilterBank}
            page={pageBank}
            totalPages={questionsBank?.metadata.last_page || 1}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePageClick={handlePageClickBank}
            isLoading={isLoadingBank}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionBank;
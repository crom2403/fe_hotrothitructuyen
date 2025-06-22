import QuestionDialog from "@/components/teacher/QuestionDialog";
import QuestionTable from "@/components/teacher/QuestionTable";
import { Button } from "@/components/ui/button"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { apiGetSubjects } from "@/services/admin/subject";
import { apiCreateQuestion, apiGetDifficultyLevels, apiGetQuestionTypes } from "@/services/teacher/question";
import type { DifficultyLevel } from "@/types/difficultyLevelType";
import type { Question, QuestionFormData, QuestionTypeResponse } from "@/types/questionType";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Upload } from "lucide-react"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import type { SubjectResponse } from "../admin/SubjectManagement";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestionTypes, setIsLoadingQuestionTypes] = useState(false);
  const [isLoadingDifficultyLevels, setIsLoadingDifficultyLevels] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [page, setPage] = useState(1);
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeResponse | null>(null);
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse | null>(null);

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

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      content: "<p>React là gì?</p>",
      type_id: "a883bd65-4b9b-11f0-8936-862ccfb06bcd",
      subject: "web",
      topic: "React Basics",
      difficulty: "easy",
      answers: [
        { content: "Thư viện JavaScript", is_correct: true, order_index: 0 },
        { content: "Framework PHP", is_correct: false, order_index: 1 },
        { content: "Ngôn ngữ lập trình", is_correct: false, order_index: 2 },
        { content: "Cơ sở dữ liệu", is_correct: false, order_index: 3 },
      ],
      explanation: "<p>React là một thư viện JavaScript để xây dựng giao diện người dùng.</p>",
      is_public: false,
    },
    {
      id: "2",
      content: "<p>Những công nghệ nào sau đây thuộc về Frontend?</p>",
      type_id: "a883b649-4b9b-11f0-8936-862ccfb06bcd",
      subject: "network",
      topic: "Frontend Technologies",
      difficulty: "medium",
      answers: [
        { content: "HTML", is_correct: true, order_index: 0 },
        { content: "CSS", is_correct: true, order_index: 1 },
        { content: "JavaScript", is_correct: true, order_index: 2 },
        { content: "MySQL", is_correct: false, order_index: 3 },
        { content: "React", is_correct: true, order_index: 4 },
        { content: "Node.js", is_correct: false, order_index: 5 },
      ],
      is_public: false,
    },
    {
      id: "3",
      content: "<p>Những công nghệ nào sau đây thuộc về Backend?</p>",
      type_id: "a883b649-4b9b-11f0-8936-862ccfb06bcd",
      subject: "web",
      topic: "Backend Technologies",
      difficulty: "medium",
      answers: [
        { content: "HTML", is_correct: false, order_index: 0 },
        { content: "CSS", is_correct: false, order_index: 1 },
        { content: "JavaScript", is_correct: false, order_index: 2 },
        { content: "MySQL", is_correct: true, order_index: 3 },
        { content: "React", is_correct: false, order_index: 4 },
        { content: "Node.js", is_correct: true, order_index: 5 },
      ],
      is_public: false,
    },
  ]);

  const handleGetQuestionTypes = async () => {
    setIsLoadingQuestionTypes(true);
    try {
      const response = await apiGetQuestionTypes();
      setQuestionTypes(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingQuestionTypes(false);
    }
  }

  const handleGetDifficultyLevels = async () => {
    setIsLoadingDifficultyLevels(true);
    try {
      const response = await apiGetDifficultyLevels();
      setDifficultyLevels(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingDifficultyLevels(false);
    }
  }

  const handleGetSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const response = await apiGetSubjects(1, "active", "", 100);
      setSubjects(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubjects(false);
    }
  }
  useEffect(() => {
    if (isDialogOpen) {
      handleGetQuestionTypes();
      handleGetDifficultyLevels();
      handleGetSubjects();
    }
  }, [isDialogOpen]);

  const typeId = form.watch("type_id");
  const questionType = questionTypes?.data.find((type) => type.id === typeId)?.code || "";

  const onSubmit = async (data: QuestionFormData) => {
    setIsLoading(true);
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
        setEditingQuestion(null);
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
      } else {
        toast.error("Tạo câu hỏi thất bại");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  }

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
  }

  const updateOption = (index: number, value: string) => {
    const currentOptions = form.getValues("options");
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    form.setValue("options", newOptions);
  }

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

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    // form.reset({
    //   content: question.content,
    //   type: question.type,
    //   subject: question.subject,
    //   topic: question.topic,
    //   difficulty: question.difficulty,
    //   points: question.points,
    //   options: question.options,
    //   correctAnswers: question.correctAnswers,
    //   explanation: question.explanation || "",
    //   is_private: question.is_private || false,
    // });
    setIsDialogOpen(true);
  }

  const handleDelete = (questionId: string) => {
    // setQuestions(questions.filter((question) => question.id !== questionId));
  }

  const handlePageClick = (page: number) => {
    setPage(page);
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý các câu hỏi của bạn</h1>
          <p className="text-gray-500">Quản lý và tạo các câu hỏi cho bài thi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" >
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
            isLoading={isLoading}
            questionType={questionType}
            difficultyLevels={difficultyLevels}
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

      <Tabs defaultValue="question_bank">
        <TabsList className="w-full space-x-4">
          <TabsTrigger value="private_question">Câu hỏi riêng</TabsTrigger>
          <TabsTrigger value="question_bank">Ngân hàng câu hỏi</TabsTrigger>
        </TabsList>

        <TabsContent value="private_question">
          <QuestionTable
            questions={questions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            subjectFilter={subjectFilter}
            setSubjectFilter={setSubjectFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
            page={page}
            setPage={setPage}
            totalPages={100}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePageClick={handlePageClick}
          />
        </TabsContent>

        <TabsContent value="question_bank">
          <QuestionTable
            questions={questions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            subjectFilter={subjectFilter}
            setSubjectFilter={setSubjectFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
            page={page}
            setPage={setPage}
            totalPages={100}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePageClick={handlePageClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default QuestionBank
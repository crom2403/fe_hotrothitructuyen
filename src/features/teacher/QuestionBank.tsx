import QuestionDialog from "@/components/teacher/QuestionDialog";
import QuestionTable from "@/components/teacher/QuestionTable";
import { Button } from "@/components/ui/button"
import type { Question } from "@/types/questionType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react"
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export type QuestionFormData = {
  content: string;
  type: "single" | "multiple" | "matching" | "drag-drop";
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
};

const questionSchema = z.object({
  content: z.string().min(1, "Nội dung câu hỏi không được để trống"),
  type: z.enum(["single", "multiple", "matching", "drag-drop"]),
  subject: z.string().min(1, "Vui lòng chọn môn học"),
  topic: z.string().min(1, "Chủ đề không được để trống"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number().min(0.1, "Điểm phải lớn hơn 0"),
  options: z.array(z.string()).min(2, "Phải có ít nhất 2 phương án"),
  correctAnswers: z.array(z.number()).min(1, "Phải có ít nhất 1 đáp án đúng"),
  explanation: z.string().optional(),
});

const QuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: "",
      type: "single",
      subject: "",
      topic: "",
      difficulty: "easy",
      points: 1,
      options: ["", ""],
      correctAnswers: [],
      explanation: "",
    },
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      content: "React là gì?",
      type: "single",
      options: ["Thư viện JavaScript", "Framework PHP", "Ngôn ngữ lập trình", "Cơ sở dữ liệu"],
      correctAnswers: [0],
      difficulty: "easy",
      subject: "Lập trình Web",
      topic: "React Basics",
      points: 1,
      explanation: "React là một thư viện JavaScript để xây dựng giao diện người dùng",
    },
    {
      id: "2",
      content: "Những công nghệ nào sau đây thuộc về Frontend?",
      type: "multiple",
      options: ["HTML", "CSS", "JavaScript", "MySQL", "React", "Node.js"],
      correctAnswers: [0, 1, 2, 4],
      difficulty: "medium",
      subject: "Mạng máy tính",
      topic: "Frontend Technologies",
      points: 2,
    },
    {
      id: "3",
      content: "Những công nghệ nào sau đây thuộc về Backend?",
      type: "multiple",
      options: ["HTML", "CSS", "JavaScript", "MySQL", "React", "Node.js"],
      correctAnswers: [0, 1, 2, 4],
      difficulty: "medium",
      subject: "Lập trình Web",
      topic: "Backend Technologies",
      points: 2,
    }
  ]);

  const questionType = form.watch("type");
  
  const onSubmit = (data: QuestionFormData) => {
    console.log(data);
    setIsDialogOpen(false);
    setEditingQuestion(null);
    form.reset();
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
    const questionType = form.getValues("type");

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
    setIsDialogOpen(true);
  }

  const handleDelete = (questionId: string) => {
    setQuestions(questions.filter((question) => question.id !== questionId));
  }

  const handlePageClick = (page: number) => {
    setPage(page);
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ngân hàng câu hỏi</h1>
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
            addOption={addOption}
            removeOption={removeOption}
            updateOption={updateOption}
            toggleCorrectAnswer={toggleCorrectAnswer}
          />
        </div>
      </div>
      <div>
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
      </div>
    </div>
  )
}

export default QuestionBank
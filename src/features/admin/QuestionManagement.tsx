import QuestionTable from "@/components/admin/question/QuestionTable"
import type { QuestionListResponse } from "@/types/questionType";
import { useEffect, useState } from "react";
import { apiApproveQuestion, apiGetQuestionList } from "@/services/admin/question";
import { toast } from "sonner";
import type { AxiosError } from "axios";

const QuestionManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const handleGetQuestionList = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetQuestionList(page, statusFilter);
      if (response.status === 200) {
        setQuestions(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    handleGetQuestionList();
  }, [page, statusFilter]);

  const handleApprove = async (questionId: string) => {
    try {
      const response = await apiApproveQuestion(questionId, { review_status: "approved" });
      if (response.status === 200) {
        handleGetQuestionList();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    }
  }

  const handleReject = async (questionId: string) => {
    try {
      const response = await apiApproveQuestion(questionId, { review_status: "rejected" });
      if (response.status === 200) {
        handleGetQuestionList();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    }
  }

  const handlePageClick = (page: number) => {
    setPage(page);
  }

  return (
    <div className="space-y-6 md:w-full w-[380px] overflow-x-scroll">
      <div>
        <h1 className="text-2xl font-bold">Quản lý câu hỏi</h1>
        <p className="text-gray-500">Kiểm duyệt các câu hỏi trong hệ thống</p>
      </div>
      <div>
        <QuestionTable
          questions={questions?.data || []}
          statusFilter={statusFilter}
          isLoading={isLoading}
          setStatusFilter={setStatusFilter}
          page={page}
          totalPages={questions?.metadata.last_page || 1}
          handleApprove={handleApprove}
          handleReject={handleReject}
          handlePageClick={handlePageClick}
        />
      </div>
    </div>
  )
}

export default QuestionManagement
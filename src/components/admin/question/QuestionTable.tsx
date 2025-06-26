import type { QuestionItem, QuestionListResponse } from "@/types/questionType"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Eye, Loader2, MoreHorizontal, X } from "lucide-react"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Paginate from "@/components/common/Pagination"
import { formatDate } from "date-fns"
import { useState } from "react"
import { Dialog } from "@radix-ui/react-dialog"
import QuestionDetail from "./QuestionDetail"

interface QuestionTableProps {
  questions: QuestionItem[],
  statusFilter: string,
  isLoading: boolean,
  setStatusFilter: (status: string) => void,
  page: number,
  totalPages: number,
  handleApprove: (questionId: string) => void,
  handleReject: (questionId: string) => void,
  handlePageClick: (page: number) => void,
}

const QuestionTable = ({ questions, statusFilter, isLoading, setStatusFilter, page, totalPages, handleApprove, handleReject, handlePageClick }: QuestionTableProps) => {
  const [openDetail, setOpenDetail] = useState(false)
  const [questionDetail, setQuestionDetail] = useState<QuestionItem | null>(null)

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Dễ";
      case "medium": return "Trung bình";
      case "hard": return "Khó";
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficultyName: string) => {
    switch (difficultyName) {
      case "Dễ": return "bg-green-100 text-green-800";
      case "Trung bình": return "bg-yellow-100 text-yellow-800";
      case "Khó": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ duyệt";
      case "approved": return "Đã duyệt";
      case "rejected": return "Từ chối";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500";
      case "approved": return "text-green-500";
      case "rejected": return " text-red-500";
      default: return " text-gray-500";
    }
  };

  const handleOpenDetail = (question: QuestionItem) => {
    setQuestionDetail(question)
    setOpenDetail(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách các câu hỏi</CardTitle>
        <CardDescription>Tổng cộng {questions.length} câu hỏi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end space-x-4 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Môn học</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-10 h-10 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate" dangerouslySetInnerHTML={{ __html: question.content }} />
                  </TableCell>
                  <TableCell>{question.subject.name}</TableCell>
                  <TableCell>{question.question_type.name}</TableCell>
                  <TableCell >
                    <Badge className={getDifficultyColor(question.difficulty_level.name)}>
                      {question.difficulty_level.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.created_by.full_name}</TableCell>
                  <TableCell>{formatDate(question.created_at, "HH:mm dd/MM/yyyy")}</TableCell>
                  <TableCell className={getStatusColor(question.review_status)}>{getStatusText(question.review_status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDetail(question)}>
                          <Eye className="mr-2 h-4 w-4 text-primary" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {question.review_status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(question.id)}>
                              <Check className="mr-2 h-4 w-4 text-primary" />
                              Duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(question.id)}>
                              <X className="mr-2 h-4 w-4 text-red-600" />
                              Từ chối
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {questions.length === 0 && isLoading === false && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">Không tìm thấy câu hỏi nào</TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </CardContent>
      <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <QuestionDetail question={questionDetail} />
      </Dialog>
    </Card>
  )
}

export default QuestionTable
import Loading from "@/components/common/Loading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiGetQuestionPending } from "@/services/teacher/question"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Check, MoreHorizontal, Search } from "lucide-react"
import { X } from "lucide-react"
import { Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import useAppStore from "@/stores/appStore"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Paginate from "@/components/common/Pagination"
import { Dialog } from "@/components/ui/dialog"
import QuestionDetail from "@/components/shared/QuestionDetail"
import { AlertDialog } from "@/components/ui/alert-dialog"
import CommonDialog from "@/components/common/CommonDialog"
import { apiApproveQuestion } from "@/services/admin/question"
import { useDebounce } from "@/utils/functions"
import { formatDate } from "date-fns"

interface QuestionPendingProps {
  data: {
    question_id: string,
    question_content: string,
    question_review_status: string,
    question_created_at: string,
    subject_id: string,
    subject_name: string,
    question_type_id: string,
    question_type_name: string,
    difficulty_level_id: string,
    difficulty_level_name: string
    created_by_full_name: string
  }[],
  total: number,
  size: number,
  page: number,
  last_page: number
}

const ReviewQuestion = () => {
  const { subjects, questionTypes, difficultyLevels } = useAppStore()

  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState<QuestionPendingProps | null>(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [openDetail, setOpenDetail] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [questionId, setQuestionId] = useState<string>(null)
  const [questionType, setQuestionType] = useState<string>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const handleGetQuestionPending = async () => {
    setIsLoading(true)
    try {
      const response = await apiGetQuestionPending(page, debouncedSearchTerm, subjectFilter, difficultyFilter, typeFilter, statusFilter)
      if (response.status === 200) {
        setQuestions(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleGetQuestionPending()
  }, [page, statusFilter, debouncedSearchTerm, subjectFilter, difficultyFilter, typeFilter])

  const handleOpenDetail = (questionId: string, questionType: string) => {
    setQuestionId(questionId)
    setQuestionType(questionType)
    setOpenDetail(true)
  }
  
  const handleApprove = async (questionId: string) => {
    try {
      const response = await apiApproveQuestion(questionId, { review_status: "approved" });
      if (response.status === 200) {
        handleGetQuestionPending();
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
        handleGetQuestionPending();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ':
        return 'bg-green-100 text-green-800';
      case 'Trung bình':
        return 'bg-yellow-100 text-yellow-800';
      case 'Khó':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
    
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt'
      case 'approved':
        return 'Đã duyệt'
      case 'rejected':
        return 'Từ chối'
      default:
        return 'Chờ duyệt'
    }
  }

  const handlePageClick = (page: number) => {
    setPage(page)
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 md:w-full w-[380px] overflow-x-scroll">
      <div>
        <h1 className="text-2xl font-bold">Duyệt các câu hỏi</h1>
        <p className="text-sm text-gray-500">Kiểm duyệt các câu hỏi được tạo bởi các giáo viên khác</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách các câu hỏi</CardTitle>
          <CardDescription>Tổng cộng {questions?.total} câu hỏi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Tìm kiếm câu hỏi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {difficultyLevels.map((difficultyLevel) => (
                  <SelectItem key={difficultyLevel.id} value={difficultyLevel.id}>
                    {difficultyLevel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Loại câu hỏi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {questionTypes.map((questionType) => (
                  <SelectItem key={questionType.id} value={questionType.id}>
                    {questionType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
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
                      <Loading />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                questions?.data.map((question) => (
                  <TableRow key={question.question_id}>
                    <TableCell className="max-w-xs">
                      <div className="truncate" dangerouslySetInnerHTML={{ __html: question.question_content }} />
                    </TableCell>
                    <TableCell>{question.subject_name}</TableCell>
                    <TableCell>{question.question_type_name}</TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(question.difficulty_level_name)}>{question.difficulty_level_name}</Badge>
                    </TableCell>
                    <TableCell>{question.created_by_full_name}</TableCell>
                    <TableCell>{formatDate(new Date(question.question_created_at), 'HH:mm dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(question.question_review_status)}>{getStatusText(question.question_review_status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDetail(question.question_id, question.question_type_name)}>
                            <Eye className="mr-2 h-4 w-4 text-primary" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {question.question_review_status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(question.question_id)}>
                                <Check className="mr-2 h-4 w-4 text-primary" />
                                Duyệt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(question.question_id)}>
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
            {questions?.data.length === 0 && isLoading === false && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Không tìm thấy câu hỏi nào
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </CardContent>
        <Paginate page={page} totalPages={questions?.last_page} onPageChange={handlePageClick} />

        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <QuestionDetail id={questionId} type={questionType} />
        </Dialog>

        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <CommonDialog title='từ chối' itemName='câu hỏi' id={questionId || ''} onDelete={handleReject} />
        </AlertDialog>
      </Card>
    </div>
  )
}

export default ReviewQuestion
import Loading from "@/components/common/Loading"
import Pagination from "@/components/common/Pagination"
import StatCard from "@/components/common/StatCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiApproveExam, apiGetExamDashBoard, apiGetExamList } from "@/services/admin/exam"
import useAppStore from "@/stores/appStore"
import path from "@/utils/path"
import type { AxiosError } from "axios"
import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock, Eye, FileText, Filter, Loader2, MessageSquare, MoreVertical, Search, User, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

interface Exam {
  id: string;
  created_at: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  test_type: string;
  approval_at: string | null;
  reason_reject: string | null;
  subject: {
    code: string;
    name: string;
  };
  created_by: {
    code: string;
    full_name: string;
    avatar: string;
  };
  approved_by: {
    code: string;
    full_name: string;
  };
  exam_questions: {
    id: string;
  }[];
}

export interface ExamListResponse {
  data: Exam[];
  total: number;
  size: number;
  page: number;
  last_page: number;
}

interface ExamDashboard {
  total_exam: number,
  total_pending: number,
  total_approved: number,
  total_rejected: number
}

const ExamManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const { subjects } = useAppStore()
  const [examsList, setExamsList] = useState<ExamListResponse | null>(null)
  const [examDashboard, setExamDashboard] = useState<ExamDashboard>()
  const [page, setPage] = useState(1)
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [actionNote, setActionNote] = useState("")
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [isLoadingAction, setIsLoadingAction] = useState(false)
  const [isActionPopupOpen, setIsActionPopupOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Bị từ chối
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleGetExamList = async () => {
    setLoading(true)
    try {
      const response = await apiGetExamList(page, searchTerm, statusFilter, subjectFilter)
      setExamsList(response.data)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  const handleGetExamDashboard = async () => {
    setLoading(true)
    try {
      const response = await apiGetExamDashBoard()
      setExamDashboard(response.data)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (exam: Exam, action: "approved" | "rejected") => {
    setActionType(action)
    setSelectedExam(exam)
    setActionNote("")
    setIsActionDialogOpen(true)
  }

  const handlePageChange = (page: number) => {
    setPage(page)
  }

  const confirmAction = async () => {
    setIsLoadingAction(true)
    try {
      const data = {
        approval_status: actionType === "approved" ? "approved" : "rejected",
        ...(actionType === "rejected" && { reason_reject: actionNote })
      }
      const response = await apiApproveExam(selectedExam?.id, data)
      if (response.status === 200) {
        toast.success("Đã duyệt đề thi thành công")
        handleGetExamList()
        handleGetExamDashboard()
      } else {
        toast.error("Đã có lỗi xảy ra")
      }
      setIsActionDialogOpen(false)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false)
    }
  }

  useEffect(() => {
    handleGetExamDashboard()
  }, [])

  useEffect(() => {
    handleGetExamList()
  }, [page, searchTerm, statusFilter, subjectFilter])

  return (
    <div className="space-y-4 md:w-full w-[380px] overflow-x-scroll">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="text-gray-600 mt-1">Duyệt và quản lý các đề thi từ giảng viên</p>
        </div>
      </div>

      {
        loading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Tổng đề thi"
                value={examDashboard?.total_exam}
                description="Tất cả các đề thi"
                icon={<BookOpen className="w-6 h-6" />}
                color="text-blue-500"
              />
              <StatCard
                title="Chờ duyệt"
                value={examDashboard?.total_pending}
                description="Cần xem xét"
                icon={<AlertCircle className="w-6 h-6" />}
                color="text-yellow-500"
              />
              <StatCard
                title="Đã duyệt"
                value={examDashboard?.total_approved}
                description="Đã phê duyệt"
                icon={<CheckCircle className="w-6 h-6" />}
                color="text-green-500"
              />
              <StatCard
                title="Bị từ chối"
                value={examDashboard?.total_rejected}
                description="Cần chỉnh sửa"
                icon={<XCircle className="w-6 h-6" />}
                color="text-red-500"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Danh sách đề thi</CardTitle>
                <CardDescription>Quản lý và duyệt các đề thi từ giảng viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm theo tên đề thi, mã môn học, giảng viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Bị từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả môn học</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {
                    examsList?.data.map((exam) => (
                      <Card key={exam.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={exam.created_by.avatar || "/placeholder.svg"} alt={exam.created_by.full_name} />
                                  <AvatarFallback>
                                    <User className="w-6 h-6" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">{exam.name}</h3>
                                    {getStatusBadge(exam.approval_at === null ? "pending" : exam.approval_at ? "approved" : "rejected")}
                                  </div>
                                  <p className="text-gray-600 mb-2">
                                    {exam.subject.code} - {exam.subject.name}
                                  </p>
                                  <p className="text-sm text-gray-500 mb-3">Giảng viên: {exam.created_by.full_name}</p>
                                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{exam.description}</p>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span>Ngày thi: {new Date(exam.start_time).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                      <span>Thời gian: {exam.duration_minutes} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-muted-foreground" />
                                      <span>Câu hỏi: {exam.exam_questions.length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Điểm:</span>
                                      <span className="font-semibold">10</span>
                                    </div>
                                  </div>

                                  <div className="mt-3 text-xs text-gray-500">
                                    Nộp lúc: {new Date(exam.created_at).toLocaleString("vi-VN")}
                                    {exam.approval_at && (
                                      <span className="ml-4">
                                        Duyệt lúc: {new Date(exam.approval_at).toLocaleString("vi-VN")} bởi {exam.approved_by.full_name}
                                      </span>
                                    )}
                                    {exam.reason_reject && (
                                      <span className="ml-4">
                                        {/* Từ chối lúc: {new Date(exam.approval_at).toLocaleString("vi-VN")} bởi {exam.approved_by.full_name} */}
                                        Từ chối bởi {exam.approved_by.full_name}
                                      </span>
                                    )}
                                  </div>

                                  {exam.reason_reject && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                      <div className="flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 text-red-600 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-medium text-red-800">Lý do từ chối:</p>
                                          <p className="text-sm text-red-700">{exam.reason_reject}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              {/* Ẩn các nút trên mobile (dưới md) và hiển thị nút MoreVertical */}
                              <div className="md:hidden">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedExam(exam)
                                    setIsActionPopupOpen(true)
                                  }}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>
                              {/* Hiển thị các nút trên web (trên md) */}
                              <div className="hidden md:flex md:flex-col gap-2">
                                <Link to={`${path.EXAM_DETAIL.replace(':exam_id', exam.id)}`} state={{ exam: exam }}>
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem chi tiết
                                  </Button>
                                </Link>
                                {exam.approval_at === null && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 w-full"
                                      onClick={() => handleAction(exam, "approved")}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Duyệt
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="w-full"
                                      onClick={() => handleAction(exam, "rejected")}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Từ chối
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
                {examsList?.data.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Không tìm thấy đề thi nào cần duyệt</p>
                    <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Pagination
                  page={page}
                  totalPages={examsList?.last_page || 1}
                  onPageChange={handlePageChange}
                />
              </CardFooter>
            </Card>

            {/* Popup hành động trên mobile */}
            <Dialog open={isActionPopupOpen} onOpenChange={setIsActionPopupOpen}>
              <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                  <DialogTitle>Hành động</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  {selectedExam && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsActionPopupOpen(false)
                          window.location.href = `${path.EXAM_DETAIL.replace(':exam_id', selectedExam.id)}?exam=${encodeURIComponent(JSON.stringify(selectedExam))}` // Điều hướng thủ công
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      {selectedExam.approval_at === null && (
                        <>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              handleAction(selectedExam, "approved")
                              setIsActionPopupOpen(false)
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Duyệt
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => {
                              handleAction(selectedExam, "rejected")
                              setIsActionPopupOpen(false)
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{actionType === "approved" ? "Duyệt đề thi" : "Từ chối đề thi"}</DialogTitle>
                  <DialogDescription>
                    {actionType === "approved"
                      ? "Bạn có chắc chắn muốn duyệt đề thi này?"
                      : "Vui lòng nhập lý do từ chối đề thi"}
                  </DialogDescription>
                </DialogHeader>
                {selectedExam && (
                  <div className="py-4">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold">{selectedExam.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedExam.subject.code} - {selectedExam.subject.name}
                      </p>
                      <p className="text-sm text-gray-600">Giảng viên: {selectedExam.created_by.full_name}</p>
                    </div>
                    {actionType === "rejected" && (
                      <div className="space-y-2">
                        <label htmlFor="rejection-reason" className="text-sm font-medium">
                          Lý do từ chối <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Nhập lý do từ chối đề thi..."
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={isLoadingAction}>
                    Hủy
                  </Button>
                  <Button
                    onClick={confirmAction}
                    className={actionType === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    disabled={actionType === "rejected" && !actionNote.trim() || isLoadingAction}
                  >
                    {isLoadingAction ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" /> : actionType === "approved" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )
      }
    </div>
  )
}

export default ExamManagement
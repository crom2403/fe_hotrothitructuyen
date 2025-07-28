import Loading from "@/components/common/Loading"
import Pagination from "@/components/common/Pagination"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiGetExamList } from "@/services/teacher/exam"
import { apiGetStudyGroup } from "@/services/teacher/studyGroup"
import useAppStore from "@/stores/appStore"
import type { StudyGroupResponse } from "@/types/studyGroupType"
import { useDebounce } from "@/utils/functions"
import path from "@/utils/path"
import type { AxiosError } from "axios"
import { Calendar, Check, Clock, Edit, Eye, FileText, MoreHorizontal, Play, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface Exam {
  data: {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    test_type: string;
    approval_status: string;
    reason_reject: string | null;
    subject_id: string;
    subject_name: string;
    study_group_id: string;
    study_group_name: string;
  }[],
  metadata: {
    total: number;
    size: number;
    page: number;
    last_page: number;
  }
}

const ExamManagement = () => {
  const { setExamId, setStudyGroupId } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [studyGroupFilter, setStudyGroupFilter] = useState("all")
  const [exams, setExams] = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStudyGroupLoading, setIsStudyGroupLoading] = useState(false)
  const [studyGroups, setStudyGroups] = useState<StudyGroupResponse | null>(null)
  const [page, setPage] = useState(1)
  const searchDebounce = useDebounce(searchTerm, 500)
  const navigate = useNavigate()

  const handleGetStatus = (start_time: Date, end_time: Date) => {
    const now = new Date();
    if (now < start_time) {
      return 'pending';
    } else if (now > start_time && now < end_time) {
      return 'opening';
    } else {
      return 'closed';
    }
  };

  const handleGetStudyGroup = async () => {
    setIsStudyGroupLoading(true)
    try {
      const response = await apiGetStudyGroup(1, "", "", "", 100)
      if (response.status === 200) {
        setStudyGroups(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsStudyGroupLoading(false)
    }
  }

  const handleGetExams = async () => {
    setIsLoading(true)
    try {
      const response = await apiGetExamList(page, studyGroupFilter, searchDebounce, statusFilter)
      if (response.status === 200) {
        setExams(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getExamStatusBadge = (status: string) => {
    switch (status) {
      case "opening":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đang mở</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sắp diễn ra</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Đã đóng</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getApprovalStatusBadge = (status: string, examType: string, rejectionReason: string | null) => {
    if (examType !== "final") {
      return <span className="text-sm text-muted-foreground">-</span>
    }
    switch (status) {
      case "approved":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đã duyệt</Badge>
            <Check className="w-4 h-4 text-green-600" />
          </div>
        )
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ duyệt</Badge>
      case "rejected":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Từ chối</Badge>
            {rejectionReason && (
              <Popover>
                <PopoverTrigger>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4 text-red-600 cursor-pointer" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Lý do từ chối:</h4>
                    <p className="text-sm text-gray-600">{rejectionReason}</p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getExamTypeName = (examType: string) => {
    switch (examType) {
      case "exercise":
        return "Kiểm tra"
      case "midterm":
        return "Giữa kỳ"
      case "final":
        return "Cuối kỳ"
      default:
        return "Khác"
    }
  }

  const getExamTypeColor = (examType: string) => {
    switch (examType) {
      case "exercise":
        return "bg-green-100 text-green-800"
      case "midterm":
        return "bg-blue-100 text-blue-800"
      case "final":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }


  useEffect(() => {
    handleGetStudyGroup()
  }, [])

  useEffect(() => {
    handleGetExams()
  }, [page, searchDebounce, statusFilter, studyGroupFilter])

  const handleViewDetail = (exam: any) => {
    const path1 = path.EXAM_DETAIL.replace(":exam_id", exam.id);
    navigate(path1, { state: { exam } });
  };

  const handleEnterExamRoom = (examId: string, studyGroupId: string) => {
    setExamId(examId);
    setStudyGroupId(studyGroupId);
    navigate(path.TEACHER.EXAM_ROOM_TEACHER);
  };

  const handleUpdateExam = (examId: string) => {
    const path1 = path.TEACHER.EXAM_UPDATE.replace(":exam_id", examId);
    navigate(path1);
  };

  return (
    <div className="space-y-6 mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Quản lý đề thi</h1>
        <p className="text-muted-foreground">Quản lý các đề thi bạn đã tạo</p>
      </div>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="space-y-2 md:col-span-6">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  className="w-full pl-10"
                  placeholder="Tên đề thi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="status">Trạng thái duyệt</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="subject">Lớp học phần</Label>
              <Select value={studyGroupFilter} onValueChange={setStudyGroupFilter}>
                <SelectTrigger className="w-full" disabled={isStudyGroupLoading}>
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {isStudyGroupLoading ? (
                    <SelectItem value="loading">Đang tải...</SelectItem>
                  ) : (
                    studyGroups?.data.map((studyGroup) => (
                      <SelectItem key={studyGroup.study_group_id} value={studyGroup.study_group_id}>{studyGroup.study_group_name} - {studyGroup.subject_name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {
        isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đề thi ({exams?.metadata.total})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên đề thi</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Loại đề</TableHead>
                      <TableHead>Trạng thái duyệt</TableHead>
                      <TableHead>Trạng thái đề</TableHead>
                      <TableHead>Ngày thi</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams?.data.map((exam) => {
                      const examStatus = handleGetStatus(new Date(exam.start_time), new Date(exam.end_time))

                      return (
                        <TableRow key={exam.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="font-medium">{exam.name}</div>
                          </TableCell>
                          <TableCell>{exam.subject_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getExamTypeColor(exam.test_type)}`}>
                              {getExamTypeName(exam.test_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>{getApprovalStatusBadge(exam.approval_status, exam.test_type, exam.reason_reject)}</TableCell>
                          <TableCell>{getExamStatusBadge(examStatus)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-4 h-4" />
                              <div>
                                <div>
                                  {new Date(exam.start_time).toLocaleDateString("vi-VN")}
                                </div>
                                <div>
                                  {new Date(exam.end_time).toLocaleDateString("vi-VN")}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-4 h-4" />
                              {exam.duration_minutes}p
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {examStatus === "opening" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleEnterExamRoom(exam.id, exam.study_group_id)}>
                                  <Play className="w-4 h-4 mr-1" />
                                  Vào phòng
                                </Button>
                              )}
                              {
                                examStatus !== "opening" && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onSelect={() => handleViewDetail(exam)}>
                                        <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                        Xem chi tiết
                                      </DropdownMenuItem>
                                      {(exam.approval_status === "rejected" || examStatus === "pending") && (
                                        <DropdownMenuItem onSelect={() => handleUpdateExam(exam.id)}>
                                          <Edit className="w-4 h-4 mr-2 text-blue-600" />
                                          Chỉnh sửa
                                        </DropdownMenuItem>
                                      )}
                                      {(exam.approval_status === "rejected" || examStatus === "pending") && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                              <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                                              Xóa đề thi
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Xác nhận xóa đề thi</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Bạn có chắc chắn muốn xóa đề thi "{exam.name}"? Hành động này không thể hoàn tác.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <Pagination page={page} totalPages={exams?.metadata.last_page || 1} onPageChange={setPage} />
              </div>

              {exams?.data.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy đề thi nào phù hợp với tiêu chí tìm kiếm.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      }
    </div>
  )
}

export default ExamManagement
import Loading from "@/components/common/Loading"
import StatCard from "@/components/common/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiGetExamStudyGroupList } from "@/services/teacher/exam"
import useAppStore from "@/stores/appStore"
import type { ExamStudyGroupResponse } from "@/types/ExamStudyGroupType"
import { useDebounce } from "@/utils/functions"
import path from "@/utils/path"
import type { AxiosError } from "axios"
import { BookOpen, Calendar, CheckCircle, Clock, Eye, Search, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

const ExamResultManagement = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const { subjects } = useAppStore()
  const [examList, setExamList] = useState<ExamStudyGroupResponse | null>(null)
  const searchDebound = useDebounce(searchTerm, 500)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleGetExamList = async () => {
    setIsLoading(true)
    try {
      const response = await apiGetExamStudyGroupList(page, subjectFilter, statusFilter, searchDebound, typeFilter)
      if (response.status === 200) {
        setExamList(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleGetExamList()
  }, [page, searchDebound, subjectFilter, statusFilter, typeFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Đã kết thúc</Badge>
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Đang diễn ra</Badge>
      case "pending":
        return <Badge className="bg-green-100 text-green-800">Sắp diễn ra</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "midterm":
        return <Badge className="bg-purple-100 text-purple-800">Giữa kỳ</Badge>
      case "final":
        return <Badge className="bg-red-100 text-red-800">Cuối kỳ</Badge>
      case "exercise":
        return <Badge className="bg-yellow-100 text-yellow-800">Bài tập</Badge>
    }
  }

  // const getCompletionRate = (completed: number, total: number) => {
  //   if (total === 0) return 0;
  //   return Math.round((completed / total) * 100);
  // }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài thi</h1>
          <p className="text-gray-600 mt-1">Danh sách các bài thi và kết quả của sinh viên</p>
        </div>
      </div>
      {
        isLoading ? (
          <div className="flex justify-center items-center h-32 col-span-full">
            <Loading />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Tổng bài thi" value={examList?.total} description="Tổng số bài thi đã tạo" icon={<BookOpen className="w-4 h-4" />} color="text-blue-500" />
              <StatCard title="Đã hoàn thành" value={examList?.data.filter((e) => e.opening_status === "finished").length} description="Bài thi đã kết thúc" icon={<CheckCircle className="w-4 h-4" />} color="text-green-500" />
              <StatCard title="Đang diễn ra" value={examList?.data.filter((e) => e.opening_status === "open").length} description="Bài thi đang mở" icon={<Clock className="w-4 h-4" />} color="text-yellow-500" />
              <StatCard title="Sắp tới" value={examList?.data.filter((e) => e.opening_status === "pending").length} description="Bài thi sắp diễn ra" icon={<Calendar className="w-4 h-4" />} color="text-red-500" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Danh sách bài thi</CardTitle>
                <CardDescription>Quản lý và xem kết quả các bài thi của sinh viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm theo tên bài thi, mã môn học..."
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
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="finished">Đã kết thúc</SelectItem>
                      <SelectItem value="open">Đang diễn ra</SelectItem>
                      <SelectItem value="pending">Sắp diễn ra</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Loại bài thi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="midterm">Giữa kỳ</SelectItem>
                      <SelectItem value="final">Cuối kỳ</SelectItem>
                      <SelectItem value="exercise">Bài tập</SelectItem>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {
                    examList?.data.map((exam) => (
                      <Card key={exam.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2">{exam.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {exam.subject_name} - {exam.study_group_name}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 ml-2">
                              {getStatusBadge(exam.opening_status)}
                              {getTypeBadge(exam.test_type)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(exam.start_time).toLocaleDateString("vi-VN")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{exam.duration_minutes}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {exam.attempt_count}/{exam.student_count}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Điểm TB:</span>
                              <span className="font-semibold">{exam.average_score > 0 ? exam.average_score.toFixed(2) : "N/A"}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Tỷ lệ hoàn thành</span>
                              <span>{exam.processing_percent}%</span>
                            </div>
                            <Progress value={exam.processing_percent} />
                          </div>

                          {
                            exam.opening_status !== "pending" && (
                              <div className="flex gap-2 pt-2">
                                <Link to={path.TEACHER.EXAM_RESULT_DETAIL.replace(':exam_id', exam.id).replace(':study_group_id', exam.study_group_id)}
                                  state={{ exam }}
                                  className="flex-1"
                                >
                                  <Button className="w-full" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem chi tiết
                                  </Button>
                                </Link>
                              </div>
                            )
                          }
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </>
        )
      }
    </div >
  )
}

export default ExamResultManagement
import Loading from '@/components/common/Loading';
import StatCard from '@/components/common/StatCard';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Select } from '@/components/ui/select';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/ui/table';
import { apiExportAllExamAttemptToExcel, apiExportExamAttemptToWord, apiGetDetailExamAttempt, apiGetExamDetail } from '@/services/teacher/exam';
import type { ExamResult, ExamStudyGroup, StudentExamResult } from '@/types/ExamStudyGroupType';
import path from '@/utils/path';
import type { AxiosError } from 'axios';
import { formatDate } from 'date-fns';
import { ArrowLeft, Award, BookOpen, Calendar, Clock, Download, Eye, Filter, MoreHorizontal, Search, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import StudentExamResultDialog from './StudentExamResultDialog';

const ExamResultDetail = () => {
  const { exam_id, study_group_id } = useParams();
  const [examResult, setExamResult] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation();
  const exam = location.state?.exam as ExamStudyGroup | undefined;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentExamResult, setStudentExamResult] = useState<StudentExamResult | null>(null); // Thay đổi thành null để tránh undefined
  const [isStudentExamResultLoading, setIsStudentExamResultLoading] = useState<boolean>(false);
  const [isStudentExamResultOpen, setIsStudentExamResultOpen] = useState<boolean>(false);

  const handleDownloadWord = async (exam_attempt_id: string) => {
    try {
      const response = await apiExportExamAttemptToWord(exam_attempt_id);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Bai-thi.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Word file:', error);
      toast.error('Đã xảy ra lỗi khi tải file Word');
    }
  };

  const handleViewExam = async (exam_attempt_id: string) => {
    setIsStudentExamResultLoading(true); 
    setIsStudentExamResultOpen(true);
    try {
      const response = await apiGetDetailExamAttempt(exam_attempt_id);
      console.log(response.data);
      setStudentExamResult(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
      setIsStudentExamResultOpen(false); 
    } finally {
      setIsStudentExamResultLoading(false);
    }
  };

  const handleExportExcel = async (exam_id: string, study_group_id: string) => {
    try {
      const response = await apiExportAllExamAttemptToExcel(exam_id, study_group_id);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Tat-ca-bai-thi.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      toast.error('Đã xảy ra lỗi khi tải file Excel');
    }
  };

  useEffect(() => {
    console.log(exam_id, ' - ', study_group_id);
    handleGetExamDetail();
  }, []);

  const handleGetExamDetail = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetExamDetail(exam_id, study_group_id);
      setExamResult(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finished':
        return <Badge className="bg-gray-100 text-gray-800">Đã kết thúc</Badge>;
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Đang diễn ra</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800">Sắp diễn ra</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'midterm':
        return <Badge className="bg-purple-100 text-purple-800">Giữa kỳ</Badge>;
      case 'final':
        return <Badge className="bg-red-100 text-red-800">Cuối kỳ</Badge>;
      case 'exercise':
        return <Badge className="bg-yellow-100 text-yellow-800">Bài tập</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (!score) {
      return <Badge variant="secondary">Chưa có kết quả</Badge>;
    }
    if (score >= exam.pass_points) {
      return <Badge className="bg-green-100 text-green-800">Đậu</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Rớt</Badge>;
    }
  };

  const filteredResults = examResult.filter((result) => {
    const searchLower = searchTerm.toLowerCase();
    const isSearchMatch = result.student_code.toLowerCase().includes(searchLower) || result.student_full_name.toLowerCase().includes(searchLower);

    const isStatusMatch =
      statusFilter === 'all' || (statusFilter === 'completed' && result.exam_attempt_submitted_at !== null) || (statusFilter === 'pending' && result.exam_attempt_submitted_at === null);

    return isSearchMatch && isStatusMatch;
  });

  const totalStudents = examResult.length;
  const completedStudents = examResult.filter((r) => r.exam_attempt_submitted_at !== null).length;
  const averageScore = examResult.length > 0 ? (examResult.reduce((sum, r) => sum + (r.exam_attempt_score || 0), 0) / examResult.length).toFixed(2) : 0;
  const passRate = examResult.length > 0 ? ((examResult.filter((r) => (r.exam_attempt_score || 0) >= exam.pass_points).length / examResult.length) * 100).toFixed(0) : 0;
  const completionRate = totalStudents > 0 ? ((completedStudents / totalStudents) * 100).toFixed(0) : 0;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loading />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={path.TEACHER.EXAM_RESULT}>Danh sách bài thi</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{exam.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link to={path.TEACHER.EXAM_RESULT}>
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại
                    </Button>
                  </Link>
                  {getStatusBadge(exam.opening_status)}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{exam.name}</h1>
                <p className="text-gray-600 mt-1">
                  {exam.subject_name} - {exam.study_group_name}
                </p>
                <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(exam.start_time).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration_minutes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{getTypeBadge(exam.test_type)}</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleExportExcel(exam_id, study_group_id)} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Tổng sinh viên" value={totalStudents} description={`${completedStudents} đã hoàn thành`} icon={<Users className="w-4 h-4" />} color="text-blue-500" />
            <StatCard title="Điểm trung bình" value={Number(averageScore).toFixed(2)} description={`Thang điểm 10`} icon={<TrendingUp className="w-4 h-4" />} color="text-green-500" />
            <StatCard title="Tỷ lệ đậu" value={`${passRate}%`} description={`Điểm ≥ ${exam.pass_points}`} icon={<Award className="w-4 h-4" />} color="text-red-500" />
            <StatCard title="Tỷ lệ hoàn thành" value={`${completionRate}%`} description={`Sinh viên đã thi`} icon={<Clock className="w-4 h-4" />} color="text-yellow-500" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kết quả chi tiết</CardTitle>
              <CardDescription>Danh sách kết quả thi của sinh viên trong lớp học phần</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm theo tên hoặc mã sinh viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="pending">Chưa thi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã SV</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead className="text-center">Điểm</TableHead>
                      <TableHead className="text-center">Xếp loại</TableHead>
                      <TableHead className="text-center">Thời gian</TableHead>
                      <TableHead className="text-center">Hoàn thành</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.exam_attempt_id}>
                        <TableCell className="font-medium">{result.student_code}</TableCell>
                        <TableCell>{result.student_full_name}</TableCell>
                        <TableCell className="text-center font-semibold">{result.exam_attempt_score > 0 ? result.exam_attempt_score.toFixed(2) : '-'}</TableCell>
                        <TableCell className="text-center">{getScoreBadge(result.exam_attempt_score)}</TableCell>
                        <TableCell className="text-center">{result.exam_attempt_duration_seconds ? result.exam_attempt_duration_seconds : '-'}</TableCell>
                        <TableCell className="text-center">{result.exam_attempt_submitted_at ? formatDate(result.exam_attempt_submitted_at, 'dd/MM/yyyy HH:mm:ss') : '-'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={result.exam_attempt_submitted_at === null ? 'secondary' : 'default'}>{result.exam_attempt_submitted_at === null ? 'Chưa thi' : 'Đã thi'}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {result.exam_attempt_id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleViewExam(result.exam_attempt_id)}>
                                  <Eye className="mr-2 h-4 w-4 text-green-500" />
                                  Xem bài thi
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadWord(result.exam_attempt_id)}>
                                  <Download className="mr-2 h-4 w-4 text-blue-500" />
                                  Xuất Word
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredResults.length === 0 && <div className="text-center py-8 text-muted-foreground">Không tìm thấy kết quả nào phù hợp với bộ lọc</div>}
            </CardContent>
          </Card>
        </div>
      )}
      <Dialog open={isStudentExamResultOpen} onOpenChange={setIsStudentExamResultOpen}>
        <StudentExamResultDialog studentExamResult={studentExamResult || undefined} isLoading={isStudentExamResultLoading} isTeacher={true} />
      </Dialog>
    </>
  );
};

export default ExamResultDetail;
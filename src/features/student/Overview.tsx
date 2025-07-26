import Loading from '@/components/common/Loading';
import StatCard from '@/components/common/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiCreateExamAttempt, apiGetExamResultList, apiGetListExams } from '@/services/student/exam';
import { apiGetDashboardStats } from '@/services/student/overview';
import useAppStore from '@/stores/appStore';
import path from '@/utils/path';
import { BookOpen, TrendingUp, Clock, Trophy, Play, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { apiGetDetailExamAttempt } from '@/services/teacher/exam';
import { Dialog } from '@/components/ui/dialog';
import StudentExamResultDialog from '@/components/teacher/Exam/StudentExamResultDialog';
import type { StudentExamResult } from '@/types/ExamStudyGroupType';

interface OverviewProps {
  totalExercises: number;
  totalTests: number;
  totalScore: number;
  totalStudyGroups: number;
}

interface Exam {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: string;
  test_type: string;
  exam_question_count: string;
  subject_name: string;
  exam_attempts: string[];
}

interface Subject {
  id: string;
  name: string;
}

interface DataReposne {
  id: string;
  name: string;
  code: string;
  semester: string;
  academic_year: string;
  exams: Exam[];
}

interface ExamResult {
  id: string;
  exam_name: string;
  exam_subject: string;
  created_at: string;
  duration_seconds: number;
  question_count: number;
  answered_questions: number;
  correct_answers: number;
  score: number;
  exam_pass_point: number;
}


const Overview = () => {
  const [stats, setStats] = useState<OverviewProps>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [studyGroupExams, setStudyGroupExams] = useState<DataReposne[]>([]);
  const [loadingExamAttempts, setLoadingExamAttempts] = useState<Record<string, boolean>>({});
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isExamResultDetailLoading, setIsExamResultDetailLoading] = useState(false);
  const [isExamResultOpen, setIsExamResultOpen] = useState(false);
  const [examResultDetail, setExamResultDetail] = useState<StudentExamResult | null>(null);
  const navigate = useNavigate();
  const { setExamId, setStudyGroupId } = useAppStore();

  const handleGetListExams = async (currentPage: number = 1) => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        size: 3,
      }

      const response = await apiGetListExams(params);

      if (response.data?.length > 0) {
        setStudyGroupExams(response.data);
      } else {
        setStudyGroupExams([])
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách kỳ thi:', err);
      setStudyGroupExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetListExams();
  }, []);

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

  const recentResults = [
    {
      id: 1,
      title: 'Kiểm tra - Hệ điều hành',
      subject: 'Hệ điều hành',
      score: 8.5,
      maxScore: 10,
      completedAt: '2024-12-01',
      status: 'Đạt',
    },
    {
      id: 2,
      title: 'Bài tập - Thuật toán',
      subject: 'Thuật toán',
      score: 7.2,
      maxScore: 10,
      completedAt: '2024-11-28',
      status: 'Đạt',
    },
    {
      id: 3,
      title: 'Thực hành - Java',
      subject: 'Lập trình Java',
      score: 9.1,
      maxScore: 10,
      completedAt: '2024-11-25',
      status: 'Đạt',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'opening':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'Đã kết thúc':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 65) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGetStats = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetDashboardStats();
      if (res.status === 200) {
        setStats(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGetExamResults = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetExamResultList();
      setExamResults(response.data);
      console.log(examResults)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetStats();
    handleGetExamResults();
  }, []);

  const getTestTypeLabel = (test_type: string) => {
    switch (test_type) {
      case 'exercise':
        return 'Bài tập';
      case 'midterm':
        return 'Kiểm tra giữa kỳ';
      case 'final':
        return 'Bài thi cuối kỳ';
      default:
        return 'Không xác định';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Sắp diễn ra';
      case 'opening':
        return 'Đang diễn ra';
      case 'closed':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const handleCreateExamAttempt = async (exam_id: string, study_group_id: string): Promise<void> => {
    const key = `${exam_id}_${study_group_id}`;
    setLoadingExamAttempts((prev) => ({ ...prev, [key]: true }));
    try {
      await apiCreateExamAttempt(exam_id, study_group_id);
    } catch (error) {
      console.error('Error creating exam attempt:', error);
    } finally {
      setLoadingExamAttempts((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleJoinExamRoom = async (examId: string, studyGroupId: string) => {
    await handleCreateExamAttempt(examId, studyGroupId);
    setExamId(examId);
    setStudyGroupId(studyGroupId);
    navigate(path.STUDENT.EXAM_ROOM_STUDENT);
  };

  const getStudentGradeColor = (exam_pass_point: number, score: number) => {
    if (score >= exam_pass_point) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getStudentStatusColor = (exam_pass_point: number, score: number) => {
    if (score >= exam_pass_point) {
      return 'bg-primary';
    } else {
      return 'bg-destructive';
    }
  };

  const handleViewExam = async (exam_attempt_id: string) => {
    setIsExamResultDetailLoading(true);
    setIsExamResultOpen(true);
    try {
      const response = await apiGetDetailExamAttempt(exam_attempt_id);
      setExamResultDetail(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsExamResultDetailLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trang chủ sinh viên</h1>
        <p className="text-gray-500">Theo dõi bài thi và kết quả học tập</p>
      </div>
      {
        isLoading ? (
          <div className="flex justify-center items-center h-screen col-span-full">
            <Loading />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Số bài tập" value={stats?.totalExercises} description="Tổng số bài tập" icon={<TrendingUp className="w-4 h-4" />} color="text-blue-600" />
              <StatCard title="Số bài thi" value={stats?.totalTests} description="Tổng số bài thi đã tham gia" icon={<Clock className="w-4 h-4" />} color="text-orange-600" />
              <StatCard title="Số lớp học phần" value={stats?.totalStudyGroups} description="Lớp học phần đã đăng ký" icon={<Trophy className="w-4 h-4" />} color="text-green-600" />
              <StatCard title="Điểm trung bình" value={stats?.totalScore.toFixed(2)} description="Tổng số điểm trung bình các bài thi" icon={<BookOpen className="w-4 h-4" />} color="text-purple-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Exams */}
              <Card>
                <CardHeader>
                  <CardTitle>Bài thi sắp tới</CardTitle>
                  <CardDescription>Danh sách bài thi bạn có thể tham gia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studyGroupExams?.map((studyGroup) => (
                      studyGroup.exams?.slice(0, 3).map((exam) => (
                        <div key={exam.id} className="flex justify-between items-center p-6 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <h4 className="font-medium">{exam.name} - {getTestTypeLabel(exam.test_type)}</h4>
                            <p className="text-sm text-gray-600">{exam.subject_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(exam.start_time)} • {exam.duration_minutes} phút
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(handleGetStatus(new Date(exam.start_time), new Date(exam.end_time)))}>
                                {getStatusText(handleGetStatus(new Date(exam.start_time), new Date(exam.end_time)))}
                              </Badge>
                              {handleGetStatus(new Date(exam.start_time), new Date(exam.end_time)) === 'opening' && (
                                <Button size="sm" className="bg-black"
                                  onClick={() => handleJoinExamRoom(exam.id, studyGroup.id)}
                                >
                                  <Play className="mr-1 h-3 w-3" />
                                  Vào thi
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Recent Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả gần đây</CardTitle>
                  <CardDescription>Điểm số các bài thi đã hoàn thành</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="flex justify-between items-center p-6 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h4 className="font-medium">{result.exam_name}</h4>
                          <p className="text-sm text-gray-600">{result.exam_subject}</p>
                          <p className="text-xs text-gray-500">Hoàn thành: {new Date(result.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className={`font-bold ${getScoreColor(result.score, 10)}`}>
                              {result.score === 10 || result.score === 0 ? result.score : result.score.toFixed(2)}/{10}
                            </p>
                            <Badge className={getStudentStatusColor(result.exam_pass_point, result.score)}>
                              {getStudentGradeColor(result.exam_pass_point, result.score) === 'bg-green-100 text-green-800' ? 'Đạt' : 'Không đạt'}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm"
                            onClick={() => handleViewExam(result.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
      <Dialog open={isExamResultOpen} onOpenChange={setIsExamResultOpen}>
        <StudentExamResultDialog studentExamResult={examResultDetail || undefined} isLoading={isExamResultDetailLoading} isTeacher={false} />
      </Dialog>
    </div>
  );
};

export default Overview;

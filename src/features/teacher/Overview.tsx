import StatCard from '@/components/common/StatCard';
import QuickActionButton from '@/components/teacher/QuickActionButton';
import RecentExamCard from '@/components/teacher/RecentExamCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGetSubjects } from '@/services/admin/subject';
import { apiGetDifficultyLevels, apiGetQuestionTypes } from '@/services/teacher/question';
import { BarChart3, BookOpen, Clock, Eye, FileText, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import useAppStore from '@/stores/appStore';
import { apiGetAcademicYears } from '@/services/admin/yearSemester';
import { apiGetDashboardStats } from '@/services/teacher/overview';
import Loading from '@/components/common/Loading';
import { toast } from 'sonner';
import type { ExamStudyGroupResponse } from '@/types/ExamStudyGroupType';
import { apiGetExamStudyGroupList } from '@/services/teacher/exam';
import type { AxiosError } from 'axios';
import QuestionFormDialog from '@/components/teacher/QuestionFormDialog';
import { useNavigate } from 'react-router-dom';
import path from '@/utils/path';

interface StatResponse {
  totalQuestions: number;
  totalExams: number;
  totalStudyGroups: number;
  totalSubjects: number;
}

const Overview = () => {
  const { setQuestionTypes, setDifficultyLevels, setSubjects, setAcademicYears, setExamId, setStudyGroupId } = useAppStore();
  const navigate = useNavigate()
  const [stats, setStats] = useState<StatResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [examList, setExamList] = useState<ExamStudyGroupResponse | null>(null)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)

  const handleGetDefaultData = async () => {
    const [resType, resDifficultyLevel, resSubject, resAcademicYear] = await Promise.all([
      apiGetQuestionTypes(),
      apiGetDifficultyLevels(),
      apiGetSubjects(1, '', '', 100),
      apiGetAcademicYears()
    ]);

    // console.log(resType, resDifficultyLevel, resSubject, resAcademicYear);
    if (resType.status === 200) {
      setQuestionTypes(resType.data.data);
    }
    if (resDifficultyLevel.status === 200) {
      setDifficultyLevels(resDifficultyLevel.data.data);
    }
    if (resSubject.status === 200) {
      setSubjects(resSubject.data.data);
    }
    if (resAcademicYear.status === 200) {
      setAcademicYears(resAcademicYear.data.data);
    }
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

  const handleGetExamList = async () => {
    setIsExamLoading(true)
    try {
      const response = await apiGetExamStudyGroupList(1, "", "", "", "")
      if (response.status === 200) {
        setExamList(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsExamLoading(false)
    }
  }

  useEffect(() => {
    handleGetDefaultData();
    handleGetStats();
    handleGetExamList();
  }, []);

  const quickActions = [
    {
      title: 'Tạo câu hỏi mới',
      description: 'Thêm câu hỏi vào ngân hàng',
      icon: Plus,
      action: 'questions',
    },
    {
      title: 'Tạo đề thi',
      description: 'Tạo đề thi từ NHCH',
      icon: FileText,
      action: 'exams',
    },
    {
      title: 'Xem kết quả',
      description: 'Thống kê và báo cáo',
      icon: BarChart3,
      action: 'results',
    },
    {
      title: 'Quản lý phòng thi',
      description: 'Giám sát bài thi',
      icon: Eye,
      action: 'exam-rooms',
    },
  ];

  const normalizeStatus = (status: string) => {
    if(status === 'open') return 'Đang diễn ra'
    if(status === 'pending') return 'Sắp diễn ra'
    if(status === 'closed') return 'Đã kết thúc'
    return 'Chưa xác định'
  };

  const handleQuickAction = (action: string) => {
    if (action === 'questions') {
      setIsQuestionDialogOpen(true)
    }
    if (action === 'exams') {
      navigate(path.TEACHER.EXAM)
    }
    if (action === 'results') {
      navigate(path.TEACHER.EXAM_RESULT)
    }
    if (action === 'study-group') {
      navigate(path.TEACHER.STUDY_GROUP)
    }
  };

  const handleJoinRoom = (examId: string, studyGroupId: string) => {
    setExamId(examId);
    setStudyGroupId(studyGroupId);
    navigate(path.TEACHER.EXAM_ROOM_TEACHER);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan giảng dạy</h1>
        <p className="text-gray-500">Quản lý bài thi và theo dõi kết quả học tập</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {
          isLoading ? (
            <div className="flex justify-center items-center h-screen col-span-full">
              <Loading />
            </div>
          ) : (
            <>
              <StatCard title="Số câu hỏi" value={stats?.totalQuestions} description="Tổng số câu hỏi đã tạo" icon={<FileText className="w-4 h-4" />} color="text-blue-600" />
              <StatCard title="Số đề thi" value={stats?.totalExams} description="Tổng số đề thi đã tạo" icon={<FileText className="w-4 h-4" />} color="text-orange-600" />
              <StatCard title="Số lớp học phần" value={stats?.totalStudyGroups} description="Lớp học phần được phân công" icon={<Users className="w-4 h-4" />} color="text-green-600" />
              <StatCard title="Số môn học" value={stats?.totalSubjects} description="Tổng số môn học giảng day" icon={<BookOpen className="w-4 h-4" />} color="text-purple-600" />
            </>
          )
        }
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Bài thi gần nhất</CardTitle>
              <CardDescription>Danh sách bài thi đã tạo và trạng thái</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isExamLoading ? (
                  <div className="flex justify-center items-center">
                    <Loading />
                  </div>
                ) : examList?.data.length === 0 ? (
                  <p className="text-gray-500 text-center">Không có bài thi nào</p>
                ) : (
                  <div className="space-y-4">
                    {examList?.data.slice(0, 3).map((exam) => (
                      <RecentExamCard 
                        key={exam.id} 
                        id={exam.id} 
                        title={exam.name} 
                        subject={exam.subject_name} 
                        student={exam.student_count} 
                        status={normalizeStatus(exam.opening_status)} 
                        endTime={exam.end_time}
                        test_type={exam.test_type}
                        handleJoinRoom={() => handleJoinRoom(exam.id, exam.study_group_id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Thao tác nhanh</CardTitle>
              <CardDescription>Các chức năng thường sử dụng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton icon={<Plus />} label="Tạo câu hỏi mới" onClick={() => handleQuickAction('questions')} />
                <QuickActionButton icon={<FileText />} label="Tạo đề thi" onClick={() => handleQuickAction('exams')} />
                <QuickActionButton icon={<BarChart3 />} label="Xem kết quả" onClick={() => handleQuickAction('results')} />
                <QuickActionButton icon={<Eye />} label="Xem lớp" onClick={() => handleQuickAction('study-group')} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <QuestionFormDialog isDialogOpen={isQuestionDialogOpen} setIsDialogOpen={setIsQuestionDialogOpen} hide={true} />
    </div>
  );
};

export default Overview;

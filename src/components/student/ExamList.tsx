import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Clock, Users, BookOpen, Check, Loader2 } from 'lucide-react';
import { apiCreateExamAttempt, apiGetListExams } from '@/services/student/exam';
import Loading from '@/components/common/Loading';
import path from '@/utils/path';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@/stores/appStore';
import Empty from '../../../public/images/png/empty.png';

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

const ExamList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [studyGroupExams, setStudyGroupExams] = useState<DataReposne[]>([]);
  const [subjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCreateExamAttempt, setIsCreateExamAttempt] = useState<boolean>(false);
  // const [page, setPage] = useState(1);
  const { setExamId, setStudyGroupId } = useAppStore();

  const navigate = useNavigate();

  const handleGetListExams = async (currentPage: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        size: 10,
      };

      if (searchTerm) {
        params['q'] = searchTerm;
      }

      if (subjectFilter !== 'all') {
        params['subject_id'] = subjectFilter;
      }

      if (statusFilter !== 'all') {
        params['handle_exam_status'] = statusFilter;
      }

      const response = await apiGetListExams(params);

      if (response.data?.length > 0) {
        setStudyGroupExams(response.data);
      } else {
        setStudyGroupExams([]);
        setError('Không tìm thấy bài thi nào.');
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách kỳ thi:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách kỳ thi.');
      setStudyGroupExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExamAttempt = async (exam_id: string): Promise<void> => {
    try {
      setIsCreateExamAttempt(true);
      await apiCreateExamAttempt(exam_id);
    } catch (error) {
      console.error('Error creating exam attempt:', error);
    }
    setIsCreateExamAttempt(false);
  };

  const handleJoinExamRoom = async (examId: string, studyGroupId: string) => {
    await handleCreateExamAttempt(examId);
    setExamId(examId);
    setStudyGroupId(studyGroupId);
    navigate(path.STUDENT.EXAM_ROOM_STUDENT);
  };

  useEffect(() => {
    handleGetListExams();
  }, [searchTerm, subjectFilter, statusFilter]);

  const getTestTypeColor = (test_type: string) => {
    switch (test_type) {
      case 'exercise':
        return 'bg-green-100 text-green-800';
      case 'midterm':
        return 'bg-yellow-100 text-yellow-800';
      case 'final':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const handleGetButton = (status: string, examId: string, groupId: string, is_taking: boolean) => {
    if (is_taking) {
      return (
        <Button className="w-full" variant="default">
          Đã nộp bài
        </Button>
      );
    }
    switch (status) {
      case 'opening':
        return (
          <Button onClick={() => handleJoinExamRoom(examId, groupId)} className="w-full bg-green-500 hover:bg-green-600 cursor-pointer" variant="default">
            Đang mở
          </Button>
        );
      case 'closed':
        return (
          <Button className="w-full bg-orange-500 hover:bg-orange-500" variant="default">
            Đã quá hạn
          </Button>
        );
      case 'pending':
        return (
          <Button className="w-full bg-yellow-500 hover:bg-yellow-500" variant="default">
            <Clock className="h-4 w-4 ml-2" />
            Chưa mở
          </Button>
        );
    }
  };

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

  if (error && !studyGroupExams.length) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Tìm kiếm bài thi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="opening">Đang mở</SelectItem>
                <SelectItem value="pending">Chưa mở</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {studyGroupExams.map((group: DataReposne) => (
              <div key={group.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  <span className="text-sm text-gray-600">
                    ({group.code} - {group.semester} - {group.academic_year})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.exams.length === 0 && (
                    <div className="flex flex-col items-center text-center p-4 text-gray-600">
                      <img src={Empty} alt="" className="object-contain w-20 h-20" />
                      <p>Chưa có bài thi nào</p>
                    </div>
                  )}
                  {group.exams.map((exam: Exam) => (
                    <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="">
                            <CardTitle className="text-lg">{exam.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <BookOpen className="h-4 w-4" />
                              <span>{exam.subject_name}</span>
                            </div>
                            <Badge className={getTestTypeColor(exam.test_type)}>{getTestTypeLabel(exam.test_type)}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{exam.duration_minutes} phút</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{exam.exam_question_count} câu</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Thời gian bắt đầu: </span>
                          <span className="font-medium">
                            {new Date(exam.start_time).toLocaleDateString('vi-VN')} {new Date(exam.start_time).toLocaleTimeString('vi-VN').slice(0, 5)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Thời gian kết thúc: </span>
                          <span className="font-medium">
                            {new Date(exam.end_time).toLocaleDateString('vi-VN')} {new Date(exam.end_time).toLocaleTimeString('vi-VN').slice(0, 5)}
                          </span>
                        </div>
                        <div className="mt-6">
                          {isLoadingCreateExamAttempt ? (
                            <Button disabled className="w-full">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </Button>
                          ) : (
                            handleGetButton(handleGetStatus(new Date(exam.start_time), new Date(exam.end_time)), exam.id, group.id, exam.exam_attempts.length > 0 ? true : false)
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {studyGroupExams.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài thi</h3>
            <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamList;

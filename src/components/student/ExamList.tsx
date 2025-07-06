import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Clock, Users, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiGetListExams } from '@/services/student/exam';
import Loading from '@/components/common/Loading';
import path from '@/utils/path';
import { Link } from 'react-router-dom';

interface Exam {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  test_type: string;
  subject_id: string;
  subject_name: string;
  question_count: number;
  is_taked: boolean;
  opening_status: string; // Thay opening_status bằng handle_exam_status
  study_group_id: string;
}

interface Subject {
  id: string;
  name: string;
}

interface PaginationMetadata {
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

const ExamList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState<PaginationMetadata>({ total: 0, page: 1, size: 10, total_pages: 1 });

  const handleGetSubjects = async () => {
    // try {
    //   const response: any = await apiGetSubjects();
    //   const subjectsData = response.data?.data || [];
    //   setSubjects(subjectsData);
    // } catch (err) {
    //   console.error('Lỗi khi lấy danh sách môn học:', err);
    //   toast.error('Không thể tải danh sách môn học.');
    // }
  };

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
        params['handle_exam_status'] = statusFilter; // Đồng bộ với backend
      }

      const response: any = await apiGetListExams(params);
      const { data, metadata } = response.data;

      console.log(data);

      if (data?.length > 0) {
        setExams(data);
        setMetadata(metadata);
      } else {
        setExams([]);
        setMetadata({ total: 0, page: currentPage, size: 10, total_pages: 1 });
        setError('Không tìm thấy bài thi nào.');
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách kỳ thi:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách kỳ thi.');
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinExamRoom = (examId: string, studyGroupId: string) => {
    localStorage.setItem('currentExam', JSON.stringify({ examId, studyGroupId }));
  };

  useEffect(() => {
    handleGetSubjects();
    handleGetListExams();
  }, [searchTerm, subjectFilter, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleGetListExams(newPage);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'opening':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'opening':
        return 'Đang mở';
      case 'closed':
        return 'Đã đóng';
      case 'pending':
        return 'Chưa mở';
      default:
        return 'Không xác định';
    }
  };

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

  if (error && !exams.length) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài thi</CardTitle>
          <CardDescription>Tìm kiếm và lọc các bài thi có sẵn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{exam.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{exam.subject_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(exam.opening_status)}>{getStatusLabel(exam.opening_status)}</Badge>
                      <Badge className={getTestTypeColor(exam.test_type)}>{getTestTypeLabel(exam.test_type)}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{exam.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{exam.duration_minutes} phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{exam.question_count} câu</span>
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
                  {exam.is_taked ? (
                    <Button className="w-full" disabled={exam.is_taked || exam.opening_status !== 'opening'} variant={exam.is_taked ? 'secondary' : 'default'}>
                      Đã làm
                      <Play className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Link to={`${path.STUDENT.EXAM_ROOM_STUDENT}`} onClick={() => handleJoinExamRoom(exam.id, exam.study_group_id)}>
                      <Button className="w-full" disabled={exam.is_taked || exam.opening_status !== 'opening'} variant={exam.is_taked ? 'secondary' : 'default'}>
                        Bắt đầu thi
                        <Play className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {exams.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài thi</h3>
            <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </CardContent>
        </Card>
      )}

      {exams.length > 0 && metadata.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button disabled={page === 1} onClick={() => handlePageChange(page - 1)} variant="outline">
            Trang trước
          </Button>
          <span className="self-center">
            Trang {page} / {metadata.total_pages}
          </span>
          <Button disabled={page === metadata.total_pages} onClick={() => handlePageChange(page + 1)} variant="outline">
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamList;

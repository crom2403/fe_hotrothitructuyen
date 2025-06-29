import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Clock, Users, BookOpen } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  totalQuestions: number;
  attempts: number;
  maxAttempts: number;
  status: 'available' | 'completed' | 'locked' | 'in-progress';
  dueDate: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Kiểm tra HTML & CSS',
    subject: 'Lập trình Web',
    description: 'Kiểm tra kiến thức cơ bản về HTML và CSS',
    duration: 60,
    totalQuestions: 20,
    attempts: 0,
    maxAttempts: 2,
    status: 'available',
    dueDate: '2025-01-15',
    difficulty: 'easy',
  },
  {
    id: '2',
    title: 'Bài thi JavaScript',
    subject: 'Lập trình Web',
    description: 'Kiểm tra kiến thức về JavaScript và DOM',
    duration: 90,
    totalQuestions: 30,
    attempts: 1,
    maxAttempts: 2,
    status: 'available',
    dueDate: '2025-01-20',
    difficulty: 'medium',
  },
  {
    id: '3',
    title: 'Thi cuối kỳ SQL',
    subject: 'Cơ sở dữ liệu',
    description: 'Thi cuối kỳ về SQL và thiết kế cơ sở dữ liệu',
    duration: 120,
    totalQuestions: 40,
    attempts: 2,
    maxAttempts: 2,
    status: 'completed',
    dueDate: '2025-01-10',
    difficulty: 'hard',
  },
  {
    id: '4',
    title: 'Kiểm tra Logic',
    subject: 'Toán rời rạc',
    description: 'Kiểm tra về logic mệnh đề và logic vị từ',
    duration: 45,
    totalQuestions: 15,
    attempts: 0,
    maxAttempts: 1,
    status: 'locked',
    dueDate: '2025-01-25',
    difficulty: 'medium',
  },
];

const ExamList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || exam.subject === subjectFilter;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có thể làm';
      case 'completed':
        return 'Đã hoàn thành';
      case 'locked':
        return 'Chưa mở';
      case 'in-progress':
        return 'Đang làm';
      default:
        return 'Không xác định';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return 'Không xác định';
    }
  };

  const subjects = [...new Set(mockExams.map((exam) => exam.subject))];

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
                <SelectItem value="available">Có thể làm</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
                <SelectItem value="locked">Chưa mở</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{exam.subject}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(exam.status)}>{getStatusLabel(exam.status)}</Badge>
                  <Badge className={getDifficultyColor(exam.difficulty)}>{getDifficultyLabel(exam.difficulty)}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{exam.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{exam.duration} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{exam.totalQuestions} câu</span>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-600">Lần thử: </span>
                <span className="font-medium">
                  {exam.attempts}/{exam.maxAttempts}
                </span>
              </div>

              <div className="text-sm">
                <span className="text-gray-600">Hạn nộp: </span>
                <span className="font-medium">{new Date(exam.dueDate).toLocaleDateString('vi-VN')}</span>
              </div>

              <Button className="w-full" disabled={exam.status === 'locked' || exam.status === 'completed'} variant={exam.status === 'available' ? 'default' : 'secondary'}>
                <Play className="h-4 w-4 mr-2" />
                {exam.status === 'available' ? 'Bắt đầu thi' : exam.status === 'completed' ? 'Đã hoàn thành' : exam.status === 'locked' ? 'Chưa mở' : 'Tiếp tục'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
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

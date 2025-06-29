import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Eye, Calendar, Clock, Target } from 'lucide-react';

interface ExamResult {
  id: string;
  examTitle: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  duration: string;
  correctAnswers: number;
  totalQuestions: number;
  grade: string;
  rank: number;
  totalStudents: number;
}

const mockResults: ExamResult[] = [
  {
    id: '1',
    examTitle: 'Kiểm tra HTML & CSS',
    subject: 'Lập trình Web',
    score: 85,
    maxScore: 100,
    percentage: 85,
    completedAt: '2025-01-10T14:30:00',
    duration: '45 phút',
    correctAnswers: 17,
    totalQuestions: 20,
    grade: 'A',
    rank: 5,
    totalStudents: 45,
  },
  {
    id: '2',
    examTitle: 'Bài thi JavaScript',
    subject: 'Lập trình Web',
    score: 92,
    maxScore: 100,
    percentage: 92,
    completedAt: '2025-01-08T16:15:00',
    duration: '75 phút',
    correctAnswers: 28,
    totalQuestions: 30,
    grade: 'A+',
    rank: 2,
    totalStudents: 45,
  },
  {
    id: '3',
    examTitle: 'Kiểm tra SQL cơ bản',
    subject: 'Cơ sở dữ liệu',
    score: 78,
    maxScore: 100,
    percentage: 78,
    completedAt: '2025-01-05T10:45:00',
    duration: '60 phút',
    correctAnswers: 23,
    totalQuestions: 25,
    grade: 'B+',
    rank: 12,
    totalStudents: 38,
  },
];

const ExamResults = () => {
  const averageScore = mockResults.reduce((sum, result) => sum + result.percentage, 0) / mockResults.length;
  const totalExams = mockResults.length;
  const excellentGrades = mockResults.filter((result) => result.percentage >= 90).length;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-green-100 text-green-800';
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
        return 'bg-blue-100 text-blue-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
        return 'bg-yellow-100 text-yellow-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Điểm trung bình</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{totalExams}</p>
                <p className="text-sm text-gray-600">Bài thi đã làm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{excellentGrades}</p>
                <p className="text-sm text-gray-600">Điểm xuất sắc</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round((excellentGrades / totalExams) * 100)}%</p>
                <p className="text-sm text-gray-600">Tỷ lệ xuất sắc</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Kết quả chi tiết</CardTitle>
          <CardDescription>Danh sách kết quả các bài thi đã hoàn thành</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{result.examTitle}</h3>
                    <p className="text-sm text-gray-600">{result.subject}</p>
                  </div>
                  <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Điểm số</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(result.percentage)}`}>
                      {result.score}/{result.maxScore}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Tỷ lệ đúng</p>
                    <p className="text-lg font-semibold">
                      {result.correctAnswers}/{result.totalQuestions}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Xếp hạng</p>
                    <p className="text-lg font-semibold">
                      {result.rank}/{result.totalStudents}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{result.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ hoàn thành</span>
                    <span className={getPerformanceColor(result.percentage)}>{result.percentage}%</span>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Hoàn thành: {new Date(result.completedAt).toLocaleString('vi-VN')}</span>
                  </div>

                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {mockResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kết quả thi</h3>
            <p className="text-gray-600">Hoàn thành các bài thi để xem kết quả tại đây</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamResults;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Eye, Calendar, Clock, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGetExamResultList } from '@/services/student/exam';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import Loading from '../common/Loading';

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

const ExamResults = () => {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const averageScore = examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length;
  const totalExams = examResults.length;
  const excellentGrades = examResults.filter((result) => result.score >= 8.5).length;

  useEffect(() => {
    handleGetExamResults();
  }, []);

  const handleGetExamResults = async () => {
    setIsLoading(true);
    try{
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

  const getStudentGradeColor = (exam_pass_point: number, score: number) => {
    if (score >= exam_pass_point) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 8) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    isLoading ? <div className="flex justify-center items-center h-screen">
      <Loading />
    </div> :
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{averageScore.toFixed(2)}</p>
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
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {examResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{result.exam_name}</h3>
                    <p className="text-sm text-gray-600">{result.exam_subject}</p>
                  </div>
                  <Badge className={getStudentGradeColor(result.exam_pass_point, result.score)}>{result.score > result.exam_pass_point ? 'Đậu' : 'Rớt'}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Điểm số</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(Number(result.score.toFixed(2)))}`}>{result.score.toFixed(2)}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Tỷ lệ đúng</p>
                    <p className="text-lg font-semibold">
                      {result.correct_answers}/{result.question_count}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{result.duration_seconds}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ hoàn thành</span>
                    <span >{result.score !== null ? 100   : 'N/A'}%</span>
                  </div>
                  <Progress value={result.score !== null ? 100 : 0} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Hoàn thành: {new Date(result.created_at).toLocaleString('vi-VN')}</span>
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

      {examResults.length === 0 && (
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

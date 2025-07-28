import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Award, Calendar, CheckCircle, Clock, Eye, FileText, Home, TrendingUp, User, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Dialog } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import type { StudentExamResult } from '@/types/ExamStudyGroupType';
import { apiGetDetailExamAttempt } from '@/services/teacher/exam';
import { toast } from 'sonner';
import StudentExamResultDialog from '@/components/teacher/Exam/StudentExamResultDialog';
import path from '@/utils/path';
import type { QuestionItem } from '@/types/questionType';
import { apiGetResultSummary } from '@/services/student/exam';
import Loading from '@/components/common/Loading';

const examResult = {
  examInfo: {
    title: 'Kiểm tra giữa kỳ - Toán học lớp 10',
    subject: 'Toán học',
    grade: 'Lớp 10',
    teacher: 'Nguyễn Văn A',
    examDate: '2024-01-26',
    examTime: '14:00',
    duration: 90, // phút
  },
  studentInfo: {
    name: 'Trần Thị B',
    studentId: 'SV001',
    class: '10A1',
  },
  result: {
    score: 8.5,
    maxScore: 10,
    passed: true,
    passScore: 5.0,
    timeSpent: 75, // phút
    totalQuestions: 30,
    answeredQuestions: 28,
    correctAnswers: 25,
    wrongAnswers: 3,
    skippedQuestions: 2,
    submittedAt: '2024-01-26T15:15:00',
  },
};

interface ResultSummary {
  exam_name: string;
  exam_id: string;
  exam_is_shuffled_question: boolean;
  exam_is_shuffled_answer: boolean;
  exam_allow_review: boolean;
  exam_allow_review_point: boolean;
  exam_show_correct_answer: boolean;
  exam_total_questions: number;
  exam_pass_points: number;
  subject_name: string;
  test_type: string;
  student_id: string;
  student_name: string;
  submitted_at: string;
  duration_seconds: number;
  tab_switch_count: number;
  score: number;
  total_questions: number;
  questions: QuestionItem[];
}

const ResultSummary = () => {
  // const { examInfo, studentInfo, result } = examResult
  const navigate = useNavigate();
  const { exam_attempt_id } = useParams();
  const [isExamResultOpen, setIsExamResultOpen] = useState(false);
  const [examResultDetail, setExamResultDetail] = useState<StudentExamResult | null>(null);
  const [isExamResultDetailLoading, setIsExamResultDetailLoading] = useState(false);
  const [examResult, setExamResult] = useState<ResultSummary | null>(null);
  const [isExamResultLoading, setIsExamResultLoading] = useState(false);

  const handleGetExamResult = async () => {
    setIsExamResultLoading(true);
    try {
      const response = await apiGetResultSummary(exam_attempt_id || '');
      setExamResult(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsExamResultLoading(false);
    }
  };

  useEffect(() => {
    handleGetExamResult();
  }, [exam_attempt_id]);

  const getResultStatus = (score: number, passScore: number) => {
    return score >= passScore ? 'passed' : 'failed';
  };

  const resultStatus = getResultStatus(examResult?.score || 0, examResult?.exam_pass_points || 0);

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 65) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 9) return 'Xuất sắc';
    if (score >= 8) return 'Giỏi';
    if (score >= 7) return 'Khá';
    if (score >= 5) return 'Trung bình';
    return 'Yếu';
  };

  const handleViewExam = async (exam_attempt_id: string) => {
    if (!exam_attempt_id) {
      toast.error('Không tìm thấy ID bài thi!');
      return;
    }
    setIsExamResultOpen(true);
    setIsExamResultDetailLoading(true);
    try {
      const response = await apiGetDetailExamAttempt(exam_attempt_id);
      setExamResultDetail(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
      setIsExamResultOpen(false);
    } finally {
      setIsExamResultDetailLoading(false);
    }
  };

  const skippedQuestions = examResult?.exam_total_questions - examResult?.total_questions;

  const handleSecondToMinute = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds} giây`;
  };

  if (isExamResultLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loading />
      </div>
    );
  }

  if (!examResult) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600">Không tìm thấy kết quả bài thi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Kết quả bài thi</h1>
          {/* <p className="text-gray-600">Chúc mừng bạn đã hoàn thành bài thi</p> */}
        </div>
      </div>
      <Card className="border-0 shadow-lg max-w-3xl mx-auto mt-10">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {resultStatus === 'passed' ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">
            {resultStatus === 'passed' ? <span className="text-green-600">Chúc mừng! Bạn đã đậu</span> : <span className="text-red-600">Rất tiếc! Bạn chưa đậu</span>}
          </CardTitle>
          <CardDescription className="text-sm">{examResult?.exam_name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(examResult?.score || 0, examResult?.exam_total_questions || 0)}`}>
                {examResult?.score.toFixed(2)}
                <span className="text-xl text-gray-500">/{examResult?.exam_total_questions}</span>
              </div>
              <Badge variant="outline" className={`text-lg px-4 py-1 ${resultStatus === 'passed' ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
                {getScoreGrade(examResult?.score || 0)}
              </Badge>
            </div>
          </div>
          <Separator />

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Thống kê chi tiết
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Thời gian làm bài</span>
                  </div>
                  <span className="font-semibold text-blue-600">{handleSecondToMinute(examResult?.duration_seconds || 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Câu đã làm</span>
                  </div>
                  <span className="font-semibold text-green-600">{examResult?.total_questions} câu</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Câu bỏ qua</span>
                  </div>
                  <span className="font-semibold text-gray-600">{skippedQuestions} câu</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Thông tin bài thi
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Thông tin sinh viên</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Họ tên:</span> {examResult?.student_name}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Thông tin đề thi</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Môn học:</span> {examResult?.subject_name}
                    </p>
                    <p>
                      <span className="font-medium">Nộp bài lúc:</span> {new Date(examResult?.submitted_at || '').toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {examResult?.exam_allow_review && (
              <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={() => handleViewExam(exam_attempt_id || '')}>
                <Eye className="w-4 h-4" />
                Xem chi tiết bài làm
              </Button>
            )}
            <Button className="flex items-center gap-2" onClick={() => navigate(path.STUDENT.OVERVIEW)}>
              <Home className="w-4 h-4" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm max-w-3xl mx-auto mt-3">
        <CardContent className="text-center py-1">
          {resultStatus === 'passed' ? (
            <div className="text-green-700">
              <p className="font-medium">🎉 Chúc mừng bạn đã vượt qua bài thi!</p>
              <p className="text-sm mt-1">Hãy tiếp tục phát huy và học tập chăm chỉ.</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p className="font-medium">💪 Đừng nản lòng! Hãy cố gắng hơn nữa.</p>
              <p className="text-sm mt-1">Bạn có thể liên hệ giáo viên để được hỗ trợ thêm.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isExamResultOpen} onOpenChange={setIsExamResultOpen}>
        <StudentExamResultDialog studentExamResult={examResultDetail || undefined} isLoading={isExamResultDetailLoading} isTeacher={false} />
      </Dialog>
    </div>
  );
};

export default ResultSummary;

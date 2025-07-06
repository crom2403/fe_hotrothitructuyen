import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, AlertTriangle } from 'lucide-react';
import type { IExam, Question } from '@/services/student/interfaces/exam.interface';
import { apiGetDetailExam } from '@/services/student/exam';
import SingleChoiceQuestion from './Exam/SingleChoiceQuestion';
import MultipleSelectQuestion from './Exam/MultipleSelectQuestion';
import DragDropQuestion from './Exam/DragDropQuestion';
import MatchingQuestion from './Exam/MatchingQuestion';
import OrderingQuestion from './Exam/OrderingQuestion';
import VideoPopupQuestion from './Exam/VideoPopupQuestion';
import Loading from '@/components/common/Loading';
import { useParams } from 'react-router-dom';

// Định nghĩa cấu trúc dữ liệu từ API
interface Answer {
  id: string;
  content: {
    text?: string;
    value?: string;
    left?: string;
    right?: string;
  };
  order_index: number;
}

interface ExamData {
  id: string;
  name: string;
  subject: {
    name: string;
  };
  duration_minutes: number;
  exam_questions: Array<{
    id: string;
    question: Question;
  }>;
  settings: {
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    allowReview: boolean;
    maxTabSwitch: number;
  };
}

// Component chính ExamTaking
export default function ExamTaking() {
  // const { examId: examIdFromParams, studyGroupId: studyGroupIdFromParams } = useParams();
  const { examId, studyGroupId } = JSON.parse(localStorage.getItem('currentExam') || '{}');

  console.log(examId, studyGroupId);
  const [exam, setExam] = useState<IExam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const handleGetExam = async () => {
    try {
      // const exam = await apiGetDetailExam('ed830f51-2eab-4d3f-ae45-edf5d75b3bfb');
      const exam = await apiGetDetailExam(examId as string);
      if (exam) {
        console.log('Exam data:', JSON.stringify(exam.data, null, 2));
        setExam(exam.data);
        setTimeLeft(exam.data.duration_minutes * 60);
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
    }
  };

  useEffect(() => {
    handleGetExam();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted && exam) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= exam.max_tab_switch) {
            alert('Bạn đã chuyển tab quá nhiều lần. Bài thi sẽ được nộp tự động.');
            handleSubmit();
          }
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted, exam]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    // Chuẩn bị dữ liệu nộp bài
    const submissionData = {
      exam_id: exam?.id,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer_content: answer,
      })),
      time_spent: exam ? exam.duration_minutes * 60 - timeLeft : 0,
      tab_switches: tabSwitchCount,
    };

    console.log('=== SUBMISSION DATA ===');
    console.log('Exam ID:', submissionData.exam_id);
    console.log('Time spent:', Math.floor(submissionData.time_spent / 60), 'minutes', submissionData.time_spent % 60, 'seconds');
    console.log('Tab switches:', submissionData.tab_switches);
    console.log('Total questions:', exam?.exam_questions.length);
    console.log('Answered questions:', submissionData.answers.length);
    console.log('Detailed answers:', submissionData.answers);
    console.log('=== END SUBMISSION ===');
  };

  const getProgress = () => {
    if (!exam) return 0;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / exam.exam_questions.length) * 100;
  };

  if (!exam) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  const currentQ = exam.exam_questions[currentQuestion]?.question;
  if (!currentQ) {
    return <div>Không tìm thấy câu hỏi</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{exam.name}</CardTitle>
              <CardDescription>{exam.subject.name}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-gray-700'}`}>{formatTime(timeLeft)}</span>
              </div>
              {timeLeft < 300 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sắp hết giờ
                </Badge>
              )}
              {tabSwitchCount > 0 && (
                <Badge variant="outline" className="text-orange-600">
                  Chuyển tab: {tabSwitchCount}/{exam.max_tab_switch}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tiến độ hoàn thành</span>
              <span>
                {Object.keys(answers).length}/{exam.exam_questions.length} câu
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Câu {currentQuestion + 1}</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleFlag(currentQ.id)} className={flaggedQuestions.has(currentQ.id) ? 'bg-yellow-50 border-yellow-300' : ''}>
                <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQ.id) ? 'text-yellow-500' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium" dangerouslySetInnerHTML={{ __html: currentQ.content }} />

            {currentQ.question_type.code === 'single_choice' && (
              <SingleChoiceQuestion question={currentQ} selectedAnswer={answers[currentQ.id] || ''} onAnswerChange={(value) => handleAnswerChange(currentQ.id, value)} />
            )}

            {currentQ.question_type.code === 'multiple_select' && (
              <MultipleSelectQuestion question={currentQ} selectedAnswers={answers[currentQ.id] || []} onAnswerChange={(value) => handleAnswerChange(currentQ.id, value)} />
            )}

            {currentQ.question_type.code === 'drag_drop' && (
              <DragDropQuestion question={currentQ} answers={answers[currentQ.id] || {}} onAnswerChange={(value) => handleAnswerChange(currentQ.id, value)} />
            )}

            {currentQ.question_type.code === 'matching' && (
              <MatchingQuestion
                question={currentQ}
                connections={answers[currentQ.id] || {}}
                onConnect={(leftId, rightId) => {
                  const currentConnections = answers[currentQ.id] || {};
                  if (leftId === '' && rightId === '') {
                    handleAnswerChange(currentQ.id, {});
                  } else {
                    const newConnections = { ...currentConnections };
                    delete newConnections[leftId];
                    Object.keys(newConnections).forEach((key) => {
                      if (newConnections[key] === rightId) {
                        delete newConnections[key];
                      }
                    });
                    if (leftId && rightId) {
                      newConnections[leftId] = rightId;
                    }
                    handleAnswerChange(currentQ.id, newConnections);
                  }
                }}
              />
            )}

            {currentQ.question_type.code === 'ordering' && (
              <OrderingQuestion question={currentQ} answers={answers[currentQ.id] || {}} onAnswerChange={(value) => handleAnswerChange(currentQ.id, value)} />
            )}

            {currentQ.question_type.code === 'video_popup' && (
              <VideoPopupQuestion
                question={currentQ}
                answers={answers[currentQ.id] || {}}
                onAnswerChange={(timeIndex, answer) => {
                  const currentAnswers = answers[currentQ.id] || {};
                  handleAnswerChange(currentQ.id, { ...currentAnswers, [timeIndex]: answer });
                }}
              />
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Câu trước
              </Button>
              <div className="flex gap-2">
                {currentQuestion === exam.exam_questions.length - 1 ? (
                  <AlertDialog>
                    <Button onClick={handleSubmit}>
                      <Send className="h-4 w-4 mr-2" />
                      Nộp bài
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời.
                          <br />
                          <br />
                          Số câu đã trả lời: {Object.keys(answers).length}/{exam.exam_questions.length}
                          <br />
                          Thời gian còn lại: {formatTime(timeLeft)}
                          <br />
                          Số lần chuyển tab: {tabSwitchCount}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Nộp bài</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button onClick={() => setCurrentQuestion(Math.min(exam.exam_questions.length - 1, currentQuestion + 1))}>
                    Câu tiếp
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Danh sách câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
              {exam.exam_questions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={currentQuestion === index ? 'default' : answers[q.question.id] ? 'secondary' : 'outline'}
                  size="sm"
                  className={`relative ${flaggedQuestions.has(q.question.id) ? 'ring-2 ring-yellow-400' : ''}`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                  {flaggedQuestions.has(q.question.id) && <Flag className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />}
                </Button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Câu hiện tại</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded"></div>
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-300 rounded"></div>
                <span>Chưa trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-yellow-500" />
                <span>Đã đánh dấu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, AlertTriangle } from 'lucide-react';
import type { IExam } from '@/services/student/interfaces/exam.interface';
import { apiGetDetailExam, apiGetExamAttemptId, apiSubmitExam } from '@/services/student/exam';
import SingleChoiceQuestion from './Exam/SingleChoiceQuestion';
import MultipleSelectQuestion from './Exam/MultipleSelectQuestion';
import DragDropQuestion from './Exam/DragDropQuestion';
import MatchingQuestion from './Exam/MatchingQuestion';
import OrderingQuestion from './Exam/OrderingQuestion';
import VideoPopupQuestion, { type VideoPopupAnswerType, type VideoPopupQuestionType } from './Exam/VideoPopupQuestion';
import Loading from '@/components/common/Loading';
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import path from '@/utils/path';
import useAppStore from '@/stores/appStore';
import useCommonStore from '@/stores/commonStore';

export default function ExamRoomStudent() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { examId, studyGroupId } = useAppStore();
  const { exam_attempt_id, setExamAttemptId } = useCommonStore();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [exam, setExam] = useState<IExam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [examOpened, setExamOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSession, setIsValidSession] = useState(true);

  // Sử dụng ref để lưu trữ giá trị mới nhất của các state quan trọng
  const answersRef = useRef(answers);
  const timeLeftRef = useRef(timeLeft);
  const tabSwitchCountRef = useRef(tabSwitchCount);
  const isSubmittedRef = useRef(isSubmitted);
  const examRef = useRef(exam);

  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    tabSwitchCountRef.current = tabSwitchCount;
  }, [tabSwitchCount]);

  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  useEffect(() => {
    examRef.current = exam;
  }, [exam]);

  // Kiểm tra điều kiện hợp lệ và điều hướng nếu cần
  useEffect(() => {
    if (!examId || !studyGroupId || !currentUser?.id) {
      setIsValidSession(false);
      toast.error('Thông tin kỳ thi hoặc tài khoản không hợp lệ');
      navigate('/student/study-groups');
    }
  }, [examId, studyGroupId, currentUser?.id, navigate]);

  // Tạo hàm submit với useCallback để tránh tạo lại function không cần thiết
  const handleSubmit = useCallback(
    async (reason: 'manual' | 'timeout' | 'tab_switch' = 'manual') => {
      // Sử dụng ref để lấy giá trị mới nhất
      if (isSubmittedRef.current) {
        console.log('Exam already submitted, skipping...');
        return;
      }

      const currentExam = examRef.current;
      if (!socket || !currentExam || !isValidSession) {
        console.log('Missing required data for submission:', {
          hasSocket: !!socket,
          hasExam: !!currentExam,
          isValidSession,
        });
        return;
      }

      console.log(`Submitting exam due to: ${reason}`);
      console.log('Current answers:', answersRef.current);
      console.log('Current time left:', timeLeftRef.current);
      console.log('Current tab switches:', tabSwitchCountRef.current);

      setIsSubmitting(true);
      setIsSubmitted(true); // Đặt trạng thái submitted ngay lập tức để tránh submit nhiều lần

      const submissionData = {
        answers: Object.entries(answersRef.current).map(([questionId, answer], index) => {
          const question = currentExam.exam_questions.find((q) => q.question.id === questionId);

          if (question?.question.question_type.code === 'matching') {
            const formattedAnswer = Object.entries(answer || {}).map(([leftId, rightId]) => ({
              left: question?.question.answers.find((a) => a.id === leftId)?.content.left,
              right: question?.question.answers.find((a) => a.id === rightId)?.content.right,
            }));

            return {
              question_id: questionId,
              question_type: question?.question.question_type.code,
              order_index: index + 1,
              answer_content: formattedAnswer,
            };
          }

          if (question?.question.question_type.code === 'video_popup') {
            // Format answer as { "popup-0": "A", "popup-1": "B", ... }
            const config = question.question.answer_config as unknown as VideoPopupQuestionType;
            const formattedAnswer = Object.entries((answer as Record<string, VideoPopupAnswerType>) || {}).reduce<Record<string, string>>((acc, [timeIndex, ans]) => {
              const popupId = config.popup_times[parseInt(timeIndex)]?.id;
              if (popupId && ans?.content?.value) {
                acc[popupId] = ans.content.value;
              }
              return acc;
            }, {});

            return {
              question_id: questionId,
              question_type: question?.question.question_type.code,
              order_index: index + 1,
              answer_content: formattedAnswer,
            };
          }

          return {
            question_id: questionId,
            question_type: question?.question.question_type.code,
            order_index: index + 1,
            answer_content: answer,
          };
        }),
        time_spent: currentExam.duration_minutes * 60 - timeLeftRef.current,
        tab_switches: tabSwitchCountRef.current,
      };

      // console.log('Dữ liệu exam:', JSON.stringify(currentExam, null, 2));
      // console.log('Dữ liệu bài làm của sinh viên:', JSON.stringify(submissionData, null, 2));

      try {
        socket.emit('submitExam', {
          examId,
          studyGroupId,
          studentId: currentUser?.id,
        });

        const res = await apiSubmitExam(exam_attempt_id, submissionData);

        if (res.status === 200 && exam_attempt_id && currentExam.allow_review_point === true) {
          toast.success('Nộp bài thi thành công');
          const path1 = path.STUDENT.RESULT_SUMMARY.replace(':exam_attempt_id', exam_attempt_id || '');
          navigate(path1);
        } else {
          toast.success('Nộp bài thi thành công');
          navigate(path.STUDENT.EXAM_LIST);
        }

        console.log('Submission response:', res);
      } catch (error) {
        console.error('Error submitting exam:', error);
        toast.error('Lỗi khi nộp bài thi');
        navigate(path.STUDENT.EXAM_LIST);
      } finally {
        setIsSubmitting(false);
      }
    },
    [socket, isValidSession, examId, studyGroupId, currentUser?.id, exam_attempt_id, navigate],
  );

  // Khởi tạo Socket và xử lý các sự kiện
  useEffect(() => {
    if (!isValidSession) return;

    const socketInstance = io(path.SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.emit('joinExam', {
      examId,
      studyGroupId,
      studentId: currentUser?.id,
      name: currentUser?.full_name,
      code: currentUser?.code,
      avatar: currentUser?.avatar,
      tab_count: 1,
      status: 'waiting',
    });

    socketInstance.on('joinExam', () => {
      toast.success(`Đã tham gia phòng thi ${exam?.name || ''}`);
    });

    socketInstance.on('openExam', () => {
      setExamOpened(true);
      socketInstance.emit('tabIn', {
        examId,
        studyGroupId,
        studentId: currentUser?.id,
        status: 'taking_exam',
      });
      toast.success('Đề thi đã được mở! Bạn có thể bắt đầu làm bài.');
    });

    socketInstance.on('pauseExam', () => {
      setExamOpened(false);
      toast.info('Đề thi đã bị tạm dừng.');

      socketInstance.emit('tabIn', {
        examId,
        studyGroupId,
        studentId: currentUser?.id,
        status: 'waiting',
      });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Lỗi kết nối tới máy chủ');
    });

    return () => {
      if (socketInstance) {
        socketInstance.emit('leaveExam', {
          examId,
          studyGroupId,
          studentId: currentUser?.id,
        });
        socketInstance.disconnect();
      }
    };
  }, [examId, studyGroupId, currentUser?.id, isValidSession, exam?.name]);

  // Xử lý sự kiện chuyển tab - Sử dụng useCallback để tránh tạo lại function
  const handleVisibilityChange = useCallback(() => {
    if (!socket || !examRef.current || isSubmittedRef.current) return;

    if (document.hidden) {
      socket.emit('tabOut', {
        examId,
        studyGroupId,
        studentId: currentUser?.id,
        status: 'out_of_exam',
      });

      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        const maxTabSwitch = examRef.current?.max_tab_switch || 999;

        console.log(`Tab switch detected: ${newCount}/${maxTabSwitch}`);

        if (newCount >= maxTabSwitch) {
          toast.error('Bạn đã chuyển tab quá nhiều lần. Bài thi sẽ được nộp tự động.');
          // Sử dụng setTimeout để đảm bảo state được cập nhật trước khi submit
          setTimeout(() => {
            handleSubmit('tab_switch');
          }, 100);
        } else {
          toast.warning(`Cảnh báo: Bạn đã chuyển tab ${newCount} lần!`);
        }
        return newCount;
      });
    } else {
      if (examOpened) {
        socket.emit('tabIn', {
          examId,
          studyGroupId,
          studentId: currentUser?.id,
          status: 'taking_exam',
        });
      } else {
        socket.emit('tabIn', {
          examId,
          studyGroupId,
          studentId: currentUser?.id,
          status: 'waiting',
        });
      }
    }
  }, [socket, examId, studyGroupId, currentUser?.id, examOpened, handleSubmit]);

  useEffect(() => {
    if (!isValidSession || !exam || isSubmitted) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isValidSession, exam, isSubmitted, handleVisibilityChange]);

  // Quản lý thời gian
  useEffect(() => {
    if (!isValidSession || timeLeft <= 0 || isSubmitted || !examOpened) return;

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [isValidSession, timeLeft, isSubmitted, examOpened]);

  // Tải dữ liệu kỳ thi
  useEffect(() => {
    if (!isValidSession) return;

    const handleGetExam = async () => {
      try {
        setIsLoading(true);
        const [examResponse, attemptResponse] = await Promise.all([apiGetDetailExam(examId), apiGetExamAttemptId(examId, studyGroupId)]);

        if (examResponse?.data) {
          setExam(examResponse.data);
          setTimeLeft(examResponse.data.duration_minutes * 60);
          if (examResponse.data.test_type === 'exercise') {
            setExamOpened(true);
          }
        } else {
          toast.error('Không tìm thấy thông tin kỳ thi');
          setIsValidSession(false);
          navigate('/student/exam_list');
          return;
        }

        if (attemptResponse?.data) {
          setExamAttemptId(attemptResponse?.data?.id);
          if (attemptResponse?.data?.handle_status === 'submitted') {
            navigate('/student/exam_list');
          }
        } else {
          toast.error('Không tìm thấy ID bài thi');
          setIsValidSession(false);
          navigate('/student/exam_list');
          return;
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Lỗi khi tải thông tin kỳ thi');
        setIsValidSession(false);
        navigate('/student/exam_list');
      } finally {
        setIsLoading(false);
      }
    };

    handleGetExam();
  }, [examId, studyGroupId, isValidSession, navigate, setExamAttemptId]);

  // Tự động nộp bài khi hết giờ
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && examOpened && isValidSession) {
      handleSubmit('timeout');
    }
  }, [timeLeft, isSubmitted, examOpened, isValidSession, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    console.log('Answer changed for question:', questionId, 'Answer:', answer);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const getProgress = () => {
    if (!exam) return 0;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / exam.exam_questions.length) * 100;
  };

  if (!isValidSession) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Không tìm thấy kỳ thi</h3>
          <p className="text-gray-500">Vui lòng kiểm tra lại mã kỳ thi hoặc liên hệ giáo viên.</p>
        </div>
      </div>
    );
  }

  const currentQ = exam.exam_questions[currentQuestion]?.question;
  if (!currentQ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Không tìm thấy câu hỏi</h3>
          <p className="text-gray-500">Đã xảy ra lỗi khi tải câu hỏi. Vui lòng thử lại.</p>
        </div>
      </div>
    );
  }

  if (!examOpened && exam.test_type !== 'exercise') {
    return (
      <Drawer open={!examOpened && exam.test_type !== 'exercise'}>
        <DrawerContent>
          <div className="flex flex-col gap-4 items-center justify-center text-center h-full py-8">
            <h2 className="text-xl font-bold">Thông báo</h2>
            <p className="text-sm text-gray-500">{examOpened ? 'Đề thi đã bị tạm dừng. Vui lòng chờ giáo viên mở lại đề thi.' : 'Đề thi chưa được mở. Vui lòng chờ giáo viên bắt đầu kỳ thi.'}</p>
            {exam.instructions && <div className="text-left max-w-md mx-auto" dangerouslySetInnerHTML={{ __html: exam.instructions }} />}
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" disabled>
                  Đang chờ...
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 h-screen">
      {isSubmitting && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 bg-opacity-50 flex justify-center items-center h-screen z-50">
          <Loading />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{exam.name}</CardTitle>
              <CardDescription>{exam.subject.name}</CardDescription>
            </div>
            <div className="flex items-center md:gap-4 gap-1 flex-col-reverse md:flex-row">
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

      <div className="lg:grid lg:grid-cols-4 gap-6 flex flex-col-reverse">
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
              <DragDropQuestion
                question={{
                  ...currentQ,
                  answer_config: currentQ.answer_config as unknown as { zones: { text: string; value: string }[]; correct?: { id: string; zone: string; value: string }[] },
                  answers: currentQ.answers.map((a) => ({
                    content: { text: a.content.text || '', value: a.content.value || '' },
                    order_index: a.order_index,
                  })) as unknown as VideoPopupAnswerType[],
                }}
                answers={answers[currentQ.id] || {}}
                onAnswerChange={(value) => handleAnswerChange(currentQ.id, value)}
              />
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
                question={{
                  id: currentQ.id,
                  content: currentQ.content,
                  answer_config: currentQ.answer_config as unknown as VideoPopupQuestionType,
                  answers: currentQ.answers as unknown as VideoPopupAnswerType[],
                }}
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
                    <AlertDialogTrigger asChild>
                      <Button>
                        <Send className="h-4 w-4 mr-2" />
                        Nộp bài
                      </Button>
                    </AlertDialogTrigger>
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
                        <AlertDialogAction onClick={() => handleSubmit('manual')}>Nộp bài</AlertDialogAction>
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
            <div className="mt-4 space-y-2 text-xs grid grid-cols-2 md:grid-cols-1">
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

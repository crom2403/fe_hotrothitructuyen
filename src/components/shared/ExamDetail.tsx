import { apiApproveExam, apiGetExamDetail } from '@/services/admin/exam';
import type { QuestionItem } from '@/types/questionType';
import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Loading from '../common/Loading';
import { Badge } from '../ui/badge';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, FileText, Loader2, Target, User, XCircle } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import path from '@/utils/path';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import OrderingDetail from './QuestionTypeDetail/OrderingDetail';
import SingleChoiceDetail from './QuestionTypeDetail/SingleChoiceDetail';
import MultipleChoiceDetail from './QuestionTypeDetail/MultipleChoiceDetail';
import MatchingDetail from './QuestionTypeDetail/MatchingDetail';
import DragDropDetail from './QuestionTypeDetail/DragDropDetail';
import VideoPopupDetail from './QuestionTypeDetail/VideoPopupDetail';
import { DialogContent, DialogDescription, DialogTitle, DialogHeader, Dialog, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

interface ExamDetailResponse {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  instructions: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_shuffled_question: boolean;
  is_shuffled_answer: boolean;
  is_shuffled_answer_option: boolean;
  allow_review: boolean;
  allow_review_point: boolean;
  show_correct_answer: boolean;
  max_tab_switch: number;
  total_points: number;
  pass_points: number;
  test_type: string;
  subject: {
    id: string;
    name: string;
  };
  created_by: {
    id: string;
    full_name: string;
  };
  exam_configs: any[];
  point_scale: {
    name: string;
  };
  questions:  QuestionItem[];
  exam_type: {
    name: string;
  };
}

const ExamDetail = () => {
  const { exam_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state?.exam;
  const [examDetail, setExamDetail] = useState<ExamDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const handleGetExamDetail = async () => {
    if (!exam_id) return;
    setIsLoading(true);
    try {
      const response = await apiGetExamDetail(exam_id);
      if (response.status === 200) {
        // console.log('Exam detail loaded:', response.data);
        if (!response.data?.questions?.length) {
          console.error('No exam questions found in response');
        }
        setExamDetail(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetExamDetail();
  }, [exam_id]);

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'bg-green-100 text-green-800';
      case 'multiple_select':
        return 'bg-blue-100 text-blue-800';
      case 'drag_drop':
        return 'bg-purple-100 text-purple-800';
      case 'matching':
        return 'bg-yellow-100 text-yellow-800';
      case 'ordering':
        return 'bg-red-100 text-red-800';
      case 'video_popup':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'Trắc nghiệm 1 đáp án';
      case 'multiple_select':
        return 'Trắc nghiệm nhiều đáp án';
      case 'drag_drop':
        return 'Kéo thả';
      case 'matching':
        return 'Nối cột';
      case 'ordering':
        return 'Sắp xếp';
      case 'video_popup':
        return 'Video có câu hỏi';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Chờ duyệt':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
      case 'Đã duyệt':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case 'Bị từ chối':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Bị từ chối
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderQuestionType = (questionObj: QuestionItem, type: string) => {
    if (!questionObj) {
      console.error('Question object is undefined:', questionObj);
      return <div>Không thể tải dữ liệu câu hỏi</div>;
    }

    if (!type) {
      console.error('Question type is undefined for question:', questionObj);
      return <div>Loại câu hỏi không xác định</div>;
    }

    switch (type) {
      case 'ordering':
        return <OrderingDetail question={questionObj} />;
      case 'single_choice':
        return <SingleChoiceDetail question={questionObj} />;
      case 'multiple_select':
        return <MultipleChoiceDetail question={questionObj} />;
      case 'matching':
        return <MatchingDetail question={questionObj} key={Date.now()} />;
      case 'drag_drop':
        return <DragDropDetail question={questionObj} />;
      case 'video_popup':
        return <VideoPopupDetail question={questionObj} />;
      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  const handleAction = (type: 'approved' | 'rejected') => {
    setActionType(type);
    setActionNote('');
    setIsActionDialogOpen(true);
  };

  const confirmAction = async () => {
    setIsLoadingAction(true)
    try {
      const data = {
        approval_status: actionType === "approved" ? "approved" : "rejected",
      ...(actionType === "rejected" && { reason_reject: actionNote })
      }
      const response = await apiApproveExam(exam_id, data)
      if (response.status === 200) {
        toast.success("Đã duyệt đề thi thành công")
        navigate(path.ADMIN.EXAM)
      } else {
        toast.error("Đã có lỗi xảy ra")
      }
      setIsActionDialogOpen(false)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false)
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={path.ADMIN.EXAM}>Quản lý đề thi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{exam?.name || examDetail?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Link to={path.ADMIN.EXAM}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
              {getStatusBadge(
                exam?.approval_at === null
                  ? 'Chờ duyệt'
                  : exam?.approval_at
                    ? 'Đã duyệt'
                    : 'Bị từ chối'
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{examDetail?.name || exam?.name}</h1>
            <p className="text-gray-600 mb-4">
              {examDetail?.subject.name || exam?.subject.name}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={exam?.created_by.avatar || '/placeholder.svg'} alt={exam?.created_by.full_name} />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{exam?.created_by.full_name}</p>
                <p className="text-sm text-gray-600">{exam?.created_by.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Ngày thi: {new Date(exam?.start_time || '').toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Thời gian: {exam?.duration_minutes} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Câu hỏi: {exam?.exam_questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span>Tổng điểm: 10 điểm</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Nộp lúc: {new Date(examDetail?.created_at || exam?.created_at || '').toLocaleString('vi-VN')}
            </div>
          </div>

          {(exam?.approval_at === null || exam?.approval_at === null) && (
            <div className="flex gap-2 ml-4">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('approved')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Duyệt đề thi
              </Button>
              <Button variant="destructive" onClick={() => handleAction('rejected')}>
                <XCircle className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-25rem)]">
          <Loading />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Mô tả đề thi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{examDetail?.description || exam?.description}</p>
                {examDetail?.instructions && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn làm bài:</h4>
                    <p className="text-blue-800" dangerouslySetInnerHTML={{ __html: examDetail?.instructions }} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danh sách câu hỏi ({examDetail?.questions.length || 0} câu)</CardTitle>
                <CardDescription>Chi tiết các câu hỏi trong đề thi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(examDetail?.questions || []).map((questionObj, index) => {
                  if (!questionObj?.question_type?.code) {
                    console.error('Invalid question object:', questionObj);
                    return (
                      <div key={questionObj.id || index} className="p-4 border border-red-200 rounded-md">
                        <p className="text-red-500">Lỗi: Không thể tải thông tin câu hỏi</p>
                      </div>
                    );
                  }
                  return (
                    <div key={questionObj.id}>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">Câu {index + 1}: </p>
                        <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: questionObj?.content || '' }} />
                      </div>
                      {renderQuestionType(questionObj, questionObj.question_type?.code || '')}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê đề thi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Loại đề thi:</span>
                  <span className="font-semibold">{examDetail?.exam_type.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng điểm:</span>
                  <span className="font-semibold">{examDetail?.total_points} điểm</span>
                </div>
                <div className="flex justify-between">
                  <span>Trắc nghiệm 1 đáp án:</span>
                  <span className="font-semibold">
                    {examDetail?.questions.filter((q) => q.question_type?.code === "single_choice").length} câu
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trắc nghiệm nhiều đáp án:</span>
                  <span className="font-semibold">{examDetail?.questions.filter((q) => q.question_type?.code === "multiple_select").length} câu</span>
                </div>
                <div className="flex justify-between">
                  <span>Kéo thả:</span>
                  <span className="font-semibold">{examDetail?.questions.filter((q) => q.question_type?.code === "drag_drop").length} câu</span>
                </div>
                <div className="flex justify-between">
                  <span>Nối cột:</span>
                  <span className="font-semibold">{examDetail?.questions.filter((q) => q.question_type?.code === "matching").length} câu</span>
                </div>
                <div className="flex justify-between">
                  <span>Sắp xếp:</span>
                  <span className="font-semibold">{examDetail?.questions.filter((q) => q.question_type?.code === "ordering").length} câu</span>
                </div>
                <div className="flex justify-between">
                  <span>Video có câu hỏi:</span>
                  <span className="font-semibold">{examDetail?.questions.filter((q) => q.question_type?.code === "video_popup").length} câu</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{actionType === "approved" ? "Duyệt đề thi" : "Từ chối đề thi"}</DialogTitle>
            <DialogDescription>
              {actionType === "approved"
                ? "Bạn có chắc chắn muốn duyệt đề thi này?"
                : "Vui lòng nhập lý do từ chối đề thi"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold">{examDetail?.name || exam?.name}</h4>
              <p className="text-sm text-gray-600">
                {examDetail?.subject.name || exam?.subject.name}
              </p>
              <p className="text-sm text-gray-600">Giảng viên: {examDetail?.created_by.full_name || exam?.created_by.full_name}</p>
            </div>
            {actionType === "rejected" && (
              <div className="space-y-2">
                <label htmlFor="rejection-reason" className="text-sm font-medium">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Nhập lý do từ chối đề thi..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={isLoadingAction}>
              Hủy 
            </Button>
            <Button
              onClick={confirmAction}
              className={actionType === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              disabled={actionType === "rejected" && !actionNote.trim() || isLoadingAction}
            >
              {isLoadingAction ? <Loader2 className="w-4 h-4 text-center animate-spin" /> : actionType === "approved" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamDetail;
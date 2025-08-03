import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import useExamStore from '@/stores/examStore';
import type { QuestionItem } from '@/types/questionType';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import SingleChoiceDetail from '@/components/shared/QuestionTypeDetail/SingleChoiceDetail';
import MultipleChoiceDetail from '@/components/shared/QuestionTypeDetail/MultipleChoiceDetail';
import DragDropDetail from '@/components/shared/QuestionTypeDetail/DragDropDetail';
import MatchingDetail from '@/components/shared/QuestionTypeDetail/MatchingDetail';
import OrderingDetail from '@/components/shared/QuestionTypeDetail/OrderingDetail';
import VideoPopupDetail from '@/components/shared/QuestionTypeDetail/VideoPopupDetail';
import useUpdateExamStore from '@/stores/updateExamStore';

interface ExamPreviewProps {
  selectedQuestions: QuestionItem[];
  mode: 'create' | 'update';
}

const ExamPreview = ({ selectedQuestions, mode }: ExamPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const store = mode === 'create' ? useExamStore : useUpdateExamStore;
  const { tab1Data, tab2Data, tab3Data, commonProps } = store();

  const getDifficultyDistribution = () => {
    const questions = selectedQuestions || [];
    const total = questions.length;
    if (total === 0) return { easy: 0, medium: 0, hard: 0 };

    const easy = questions.filter((q) => q.difficulty_level?.name === 'Dễ').length;
    const medium = questions.filter((q) => q.difficulty_level?.name === 'Trung bình').length;
    const hard = questions.filter((q) => q.difficulty_level?.name === 'Khó').length;

    return {
      easy: Math.round((easy / total) * 100),
      medium: Math.round((medium / total) * 100),
      hard: Math.round((hard / total) * 100),
    };
  };

  const distribution = getDifficultyDistribution();

  const renderQuestionDetail = (question: QuestionItem) => {
    switch (question.question_type.name) {
      case 'Trắc nghiệm 1 đáp án':
        return <SingleChoiceDetail question={question} />;
      case 'Trắc nghiệm nhiều đáp án':
        return <MultipleChoiceDetail question={question} />;
      case 'Kéo thả':
        return <DragDropDetail question={question} />;
      case 'Nối cột':
        return <MatchingDetail question={question} key={Date.now()} />;
      case 'Sắp xếp':
        return <OrderingDetail question={question} />;
      case 'Video có câu hỏi':
        return <VideoPopupDetail question={question} />;
      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-full md:w-auto">
        <Button variant="outline" className="w-full md:w-auto">
          <Eye className="mr-2 h-4 w-4" />
          Xem chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Chi tiết đề thi</DialogTitle>
          <DialogDescription className="text-gray-600 text-center">Xem chi tiết cấu trúc và nội dung đề thi</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tên đề thi</Label>
              <p className="text-sm text-gray-900">{tab1Data.name || 'Chưa nhập'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Môn học</Label>
              <p className="text-sm text-gray-900">{commonProps.subject_name || tab1Data.subject || 'Chưa chọn'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Nhóm học</Label>
              <p className="text-sm text-gray-900">{commonProps.study_group_name || tab1Data.study_groups || 'Chưa chọn'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Thời gian</Label>
              <p className="text-sm text-gray-900">{tab1Data.duration_minutes} phút</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Số câu hỏi</Label>
              <p className="text-sm text-gray-900">{selectedQuestions.length} câu</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Điểm đậu</Label>
              <p className="text-sm text-gray-900">{tab1Data.pass_points}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Thang điểm</Label>
              <p className="text-sm text-gray-900">{commonProps.point_scale_name || tab1Data.point_scale || 'Chưa đặt'}</p>
            </div>
          </div>
          <Separator className="bg-gray-200" />
          <div>
            <Label className="text-sm font-medium text-gray-700">Danh sách câu hỏi</Label>
            <div className="mt-4 space-y-6 max-h-[500px] overflow-y-auto">
              {selectedQuestions.map((question, index) => (
                <Card key={question.id} className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-lg font-semibold">
                      Câu {index + 1}: {parse(question.content)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">{renderQuestionDetail(question)}</div>
                  </CardContent>
                </Card>
              ))}
              {selectedQuestions.length === 0 && <p className="text-gray-500 text-center">Chưa có câu hỏi nào được chọn.</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamPreview;

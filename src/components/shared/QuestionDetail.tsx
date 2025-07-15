import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { apiGetQuestionDetail } from '@/services/teacher/question';
import CommonInfo from './QuestionTypeDetail/CommonInfo';
import SingleChoiceDetail from './QuestionTypeDetail/SingleChoiceDetail';
import Loading from '@/components/common/Loading';
import MultipleChoiceDetail from './QuestionTypeDetail/MultipleChoiceDetail';
import OrderingDetail from './QuestionTypeDetail/OrderingDetail';
import MatchingDetail from './QuestionTypeDetail/MatchingDetail';
import DragDropDetail from './QuestionTypeDetail/DragDropDetail';
import VideoPopupDetail from './QuestionTypeDetail/VideoPopupDetail';
import type { QuestionItem } from '@/types/questionType';

interface QuestionDetailProps {
  id: string,
  type: string,
}

const QuestionDetail = ({ id, type }: QuestionDetailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [questionDetail, setQuestionDetail] = useState<QuestionItem | null>(null);

  const handleGetQuestionDetail = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetQuestionDetail(id);
      setQuestionDetail(response.data);
    } catch (error) {
      console.error('Error fetching question detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetQuestionDetail();
  }, [id]);

  const renderQuestionType = () => {
    switch (type) {
      case 'Sắp xếp':
        return <OrderingDetail question={questionDetail} />;
      case 'Trắc nghiệm 1 đáp án':
        return <SingleChoiceDetail question={questionDetail} />;
      case 'Trắc nghiệm nhiều đáp án':
        return <MultipleChoiceDetail question={questionDetail} />;
      case 'Nối cột':
        return <MatchingDetail question={questionDetail} key={Date.now()} />;
      case 'Kéo thả':
        return <DragDropDetail question={questionDetail} />;
      case 'Video có câu hỏi':
        return <VideoPopupDetail question={questionDetail} />;
      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  return (
    <DialogContent className="min-w-[47vw] max-w-[1200px] min-h-[60vh] overflow-y-auto bg-white p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">Chi tiết câu hỏi</DialogTitle>
      </DialogHeader>

      <ScrollArea className="h-[70vh] pr-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : questionDetail ? (
          <>
            <CommonInfo questionDetail={questionDetail} />
            {renderQuestionType()}
          </>
        ) : (
          <div className="text-center text-gray-500">Không tìm thấy câu hỏi</div>
        )}
      </ScrollArea>
    </DialogContent>
  );
};

export default QuestionDetail;
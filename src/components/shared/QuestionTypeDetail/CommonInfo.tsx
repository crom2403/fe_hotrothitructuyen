import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import parse from 'html-react-parser';

const CommonInfo = ({ questionDetail }: { questionDetail: any | null }) => {
  const getDifficultyColor = (difficultyName: string) => {
    switch (difficultyName) {
      case 'Dễ':
        return 'bg-green-100 text-green-800';
      case 'Trung bình':
        return 'bg-yellow-100 text-yellow-800';
      case 'Khó':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-semibold">Môn học:</span> {questionDetail?.subject.name || 'N/A'}
        </div>
        <div>
          <span className="font-semibold">Loại câu hỏi:</span> {questionDetail?.question_type.name || 'N/A'}
        </div>
        <div>
          <span className="font-semibold">Độ khó:</span> <Badge className={getDifficultyColor(questionDetail?.difficulty_level.name || 'N/A')}>{questionDetail?.difficulty_level.name || 'N/A'}</Badge>
        </div>
        <div>
          <span className="font-semibold">Người tạo:</span> {questionDetail?.created_by.full_name || 'N/A'}
        </div>
        <div>
          <span className="font-semibold">Trạng thái duyệt:</span>{' '}
          <Badge variant="outline" className={getStatusColor(questionDetail?.review_status)}>
            {getStatusText(questionDetail?.review_status)}
          </Badge>
        </div>
        <div>
          <span className="font-semibold">Ngày tạo:</span> {questionDetail?.created_at ? new Date(questionDetail.created_at).toLocaleString('vi-VN') : 'N/A'}
        </div>
      </div>

      <Separator />

      <div>
        <span className="font-semibold">Nội dung câu hỏi:</span>
        <div className="mt-2 mb-2 p-3 border rounded-md bg-gray-50">{parse(questionDetail?.content || '')}</div>
      </div>
    </div>
  );
};

export default CommonInfo;

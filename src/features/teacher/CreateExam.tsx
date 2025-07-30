import BasicInfoTab from '@/components/teacher/CreateExam/BasicInfoTab';
import QuestionsTab from '@/components/teacher/CreateExam/QuestionsTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import useExamStore from '@/stores/examStore';
import { SettingsTab } from '@/components/teacher/CreateExam/SettingTab';
import { PreviewTab } from '@/components/teacher/CreateExam/PreviewTab';
import ExamPreview from '@/components/teacher/CreateExam/ExamPreview';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { apiCreateExam } from '@/services/teacher/createExam';
import { useNavigate } from 'react-router-dom';
import path from '@/utils/path';

const CreateExam = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { tab1Data, tab2Data, tab3Data, resetExamData, commonProps } = useExamStore();

  const isSubjectSelected = !!tab1Data.subject;

  const validateTime = (start: string, end: string): boolean => {
    if (!start || !end) {
      toast.error('Vui lòng nhập cả thời gian bắt đầu và kết thúc!');
      return false;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('Thời gian không hợp lệ!');
      return false;
    }

    if (endDate <= startDate) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu!');
      return false;
    }

    return true;
  };

  const handleSaveExam = async () => {
    if (!validateTime(tab1Data.start_time, tab1Data.end_time)) {
      setIsLoading(false);
      return;
    }
    if (tab1Data.total_questions === 0) {
      toast.error('Số câu hỏi không được bằng 0!');
      return;
    }
    if (tab1Data.total_questions !== tab2Data.list_questions.length) {
      toast.error('Số câu hỏi không khớp!');
      return;
    }
  
    setIsLoading(true);
    try {
      const examData = {
        name: tab1Data.name,
        subject_id: tab1Data.subject,
        description: tab1Data.description,
        start_time: tab1Data.start_time,
        end_time: tab1Data.end_time,
        duration_minutes: tab1Data.duration_minutes,
        total_questions: tab1Data.total_questions,
        pass_points: tab1Data.pass_points,
        instructions: tab3Data.instruction,
        max_tab_switch: tab1Data.max_tab_switch,
        test_type: tab1Data.type,
        exam_type: tab2Data.exam_type,
        point_scale_id: tab1Data.point_scale,
        is_shuffled_questions: tab3Data.is_shuffled_questions,
        is_shuffled_answer: tab3Data.is_shuffled_answer,
        allow_review_point: tab3Data.allow_review_point,
        show_correct_answer: tab3Data.show_correct_answer,
        allow_review: tab3Data.allow_review,
        questions: tab2Data.list_questions,
        difficulty: tab2Data.difficulty,
        study_groups: tab1Data.study_groups,
      };

      console.log(examData);
      const response = await apiCreateExam(examData);
      if (response.status === 201) {
        toast.success('Tạo đề thi thành công');
        resetExamData();
        navigate(path.TEACHER.EXAM_MANAGEMENT);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tạo đề thi</h1>
          <p className="text-gray-500">Tạo đề thi từ ngân hàng câu hỏi hoặc tự động bằng AI</p>
        </div>
        <div className="space-x-2">
          <ExamPreview selectedQuestions={commonProps.list_questions} mode="create" />
          <Button onClick={handleSaveExam} className="bg-primary hover:bg-primary/90 cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu đề thi
              </>
            )}
          </Button>
        </div>
      </div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="questions" disabled={!isSubjectSelected}>
              Chọn câu hỏi
            </TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab mode="create" />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionsTab selectedSubjectId={tab1Data.subject} mode="create" />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab mode="create" />
          </TabsContent>
          <TabsContent value="preview">
            <PreviewTab selectedQuestions={commonProps.list_questions} mode="create" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateExam;

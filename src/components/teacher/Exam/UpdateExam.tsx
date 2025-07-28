import type { ExamDetailResponse } from "@/components/shared/ExamDetail";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGetExamDetail } from "@/services/admin/exam";
import type { AxiosError } from "axios";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import useUpdateExamStore from "@/stores/updateExamStore";
import type { StudyGroupResponse } from "@/types/studyGroupType";
import Loading from "@/components/common/Loading";
import { useDebounce } from "@/utils/functions";
import { apiUpdateExam } from "@/services/teacher/exam";
import path from "@/utils/path";
import QuestionsTab from "../CreateExam/QuestionsTab";
import { SettingsTab } from "../CreateExam/SettingTab";
import { PreviewTab } from "../CreateExam/PreviewTab";
import ExamPreview from "../CreateExam/ExamPreview";
import BasicInfoTab from "../CreateExam/BasicInfoTab";

const UpdateExam = () => {
  const { exam_id } = useParams();
  const {
    tab1Data,
    tab2Data,
    tab3Data,
    commonProps,
    setTab1Name,
    setTab1Subject,
    setTab1Groups,
    setTab1Description,
    setTab1StartTime,
    setTab1EndTime,
    setTab1Duration,
    setTab1TotalQuestions,
    setTab1PassPoints,
    setTab1PointScale,
    setTab1Type,
    setTab1MaxTabSwitch,
    setExamType,
    setListQuestions,
    setDifficulty,
    setIsShuffledQuestions,
    setIsShuffledAnswer,
    setAllowReview,
    setAllowReviewPoint,
    setShowCorrectAnswer,
    setInstruction,
    setPointScaleName,
    setSubjectName,
    setStudyGroupName,
    setListQuestionsFull,
    resetExamData,
  } = useUpdateExamStore();
  const navigate = useNavigate();
  const [examDetail, setExamDetail] = useState<ExamDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [openStudyGroup, setOpenStudyGroup] = useState(false);
  const [searchStudyGroup, setSearchStudyGroup] = useState("");
  const [isLoadingStudyGroups, setIsLoadingStudyGroups] = useState(false);
  const [studyGroups, setStudyGroups] = useState<StudyGroupResponse | null>(null);
  const [selectedStudyGroups, setSelectedStudyGroups] = useState<string[]>(tab1Data.study_groups || []);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);
  const [questionCountError, setQuestionCountError] = useState<string | null>(null);
  const [passPointsError, setPassPointsError] = useState<string | null>(null);
  const [maxTabSwitchError, setMaxTabSwitchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [openMaxTabSwitch, setOpenMaxTabSwitch] = useState(false);

  const searchStudyGroupDebounce = useDebounce(searchStudyGroup, 500);

  // Định dạng thời gian cho input datetime-local
  const formatDateTime = (dateStr: string | undefined): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16); // Định dạng YYYY-MM-DDTHH:mm
  };

  const handleGetExamDetail = async () => {
    if (!exam_id) return;
    setIsLoading(true);
    try {
      const response = await apiGetExamDetail(exam_id);
      if (response.status === 200) {
        const data = response.data;
        setExamDetail(data);
        setTab1Name(data.name || "");
        setTab1Subject(data.subject.id || "");
        const studyGroupIds = data.study_groups.map((group: { id: string }) => group.id);
        setTab1Groups(studyGroupIds);
        setSelectedStudyGroups(studyGroupIds);
        setTab1Description(data.description || "");
        setTab1StartTime(formatDateTime(data.start_time) || "");
        setTab1EndTime(formatDateTime(data.end_time) || "");
        setTab1Duration(data.duration_minutes || 0);
        setTab1TotalQuestions(data.questions.length || 0);
        setTab1PassPoints(data.pass_points || 0);
        setTab1PointScale(data.point_scale.id || "");
        setTab1Type(data.test_type || "exercise");
        setTab1MaxTabSwitch(data.max_tab_switch || 3);
        setInstruction(data.instructions || "");
        setIsShuffledQuestions(data.is_shuffled_question || false);
        setIsShuffledAnswer(data.is_shuffled_answer || false);
        setAllowReview(data.allow_review || false);
        setAllowReviewPoint(data.allow_review_point || false);
        setShowCorrectAnswer(data.show_correct_answer || false);
        setListQuestionsFull(data.questions || []);
        setSubjectName(data.subject.name || "");
        setPointScaleName(data.point_scale.name || "");
        setExamType(data.exam_type.code || "");
        setListQuestions(data.questions || []);
        setStudyGroupName(
          data.study_groups
            ?.map((id) => data.questions.find((q) => q.study_group_id === id)?.study_group_name || "")
            .filter((name) => name)
            .join(", ") || ""
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetExamDetail();
  }, [exam_id]);

  const handleUpdateExam = async () => {
    if (!exam_id) return;
    setIsLoadingUpdate(true);
    try {
      const data = {
        name: tab1Data.name,
        subject_id: tab1Data.subject,
        description: tab1Data.description,
        start_time: tab1Data.start_time,
        end_time: tab1Data.end_time,
        duration_minutes: tab1Data.duration_minutes,
        total_questions: tab1Data.total_questions,
        pass_points: tab1Data.pass_points,
        point_scale_id: tab1Data.point_scale,
        test_type: tab1Data.type,
        max_tab_switch: tab1Data.max_tab_switch,
        instructions: tab3Data.instruction,
        is_shuffled_questions: tab3Data.is_shuffled_questions,
        is_shuffled_answer: tab3Data.is_shuffled_answer,
        allow_review: tab3Data.allow_review,
        allow_review_point: tab3Data.allow_review_point,
        show_correct_answer: tab3Data.show_correct_answer,
        study_groups: tab1Data.study_groups,
        difficulty: tab2Data.difficulty,
        questions: tab2Data.list_questions,
        exam_type: tab2Data.exam_type,
      }
      const res = await apiUpdateExam(exam_id, data);
      if (res.status === 200) {
        toast.success("Cập nhật đề thi thành công");
        resetExamData();
        navigate(path.TEACHER.EXAM_MANAGEMENT);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingUpdate(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cập nhật đề thi</h1>
          <p className="text-gray-500">Chỉnh sửa đề thi đã tạo cho phù hợp với nhu cầu</p>
        </div>
        <div className="space-x-2">
          <ExamPreview selectedQuestions={commonProps.list_questions} mode="update" />
          <Button
            onClick={handleUpdateExam}
            className="bg-primary hover:bg-primary/90 cursor-pointer"
            disabled={isLoadingUpdate}
          >
            {isLoadingUpdate ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Cập nhật
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="questions">Chọn câu hỏi</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <BasicInfoTab mode="update" />
        </TabsContent>

        <TabsContent value="questions">
          <QuestionsTab selectedSubjectId={tab1Data.subject} mode="update" />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab mode="update" />
        </TabsContent>

        <TabsContent value="preview">
          <PreviewTab selectedQuestions={commonProps.list_questions} mode="update" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UpdateExam;
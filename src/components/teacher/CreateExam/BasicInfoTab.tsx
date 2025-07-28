import InfoPopup from '@/components/common/InfoPopup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { apiGetAssignedSubjectByTeacher } from '@/services/admin/subject';
import { apiGetPointScales } from '@/services/teacher/createExam';
import { apiGetStudyGroup } from '@/services/teacher/studyGroup';
import useExamStore from '@/stores/examStore';
import type { PointScale } from '@/types/pointScaleType';
import type { StudyGroupResponse } from '@/types/studyGroupType';
import type { AssignedSubjectByTeacher } from '@/types/subjectType';
import type { AxiosError } from 'axios';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/authStore';
import useUpdateExamStore from '@/stores/updateExamStore';

const BasicInfoTab = ({ mode }: { mode: 'create' | 'update' }) => {
  const store = mode === 'create' ? useExamStore : useUpdateExamStore;
  const {
    tab1Data,
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
    setPointScaleName,
    setStudyGroupName,
    setSubjectName,
    setTab1MaxTabSwitch,
  } = store();
  const { currentUser } = useAuthStore();
  const [subjectsAssigned, setSubjectsAssigned] = useState<AssignedSubjectByTeacher[]>([]);
  const [pointScales, setPointScales] = useState<PointScale[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroupResponse | null>(null);
  const [isLoadingAssignedSubjects, setIsLoadingAssignedSubjects] = useState(false);
  const [isLoadingPointScales, setIsLoadingPointScales] = useState(false);
  const [isLoadingStudyGroups, setIsLoadingStudyGroups] = useState(false);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [openMaxTabSwitch, setOpenMaxTabSwitch] = useState(false);
  const [selectedStudyGroups, setSelectedStudyGroups] = useState<string[]>(tab1Data.study_groups || []);
  const [openStudyGroup, setOpenStudyGroup] = useState(false);
  const [searchStudyGroup, setSearchStudyGroup] = useState('');
  const [questionCountError, setQuestionCountError] = useState<string | null>(null);
  const [passPointsError, setPassPointsError] = useState<string | null>(null);
  const [maxTabSwitchError, setMaxTabSwitchError] = useState<string | null>(null);

  const validateAndSetDuration = (start: Date, end: Date) => {
    setStartTimeError(null);
    setEndTimeError(null);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    if (end <= start) {
      setEndTimeError('Giờ kết thúc phải sau giờ bắt đầu');
      setTab1Duration(0);
      return;
    }
  };

  const handleStartTimeChange = (value: string) => {
    setTab1StartTime(value);
    const start = new Date(value);
    const end = new Date(tab1Data.end_time);

    if (tab1Data.end_time) {
      validateAndSetDuration(start, end);
    }
  };

  const handleEndTimeChange = (value: string) => {
    setTab1EndTime(value);
    const start = new Date(tab1Data.start_time);
    const end = new Date(value);

    if (tab1Data.start_time) {
      validateAndSetDuration(start, end);
    }
  };

  const validateInput = (value: number, field: string, max: number, setError: (error: string) => void) => {
    if (value <= 0) {
      setError(`${field} không được âm hoặc bằng 0!`);
      return false;
    }
    if (value > max) {
      setError(`${field} không được vượt quá ${max}!`);
      return false;
    }
    return true;
  };

  const handleTotalQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (validateInput(value, 'Số câu hỏi', 1000, setQuestionCountError)) {
      setTab1TotalQuestions(value);
    } else {
      setQuestionCountError('Số câu hỏi không được vượt quá 1000!');
    }
  };

  const handlePassPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (validateInput(value, 'Điểm đậu', 10, setPassPointsError)) {
      setTab1PassPoints(value);
    } else {
      setPassPointsError('Điểm đậu không được vượt quá 10!');
    }
  };

  const handleMaxTabSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (validateInput(value, 'Số lần chuyển tab', 100, setMaxTabSwitchError)) {
      setTab1MaxTabSwitch(value);
    } else {
      setMaxTabSwitchError('Số lần chuyển tab không được vượt quá 100!');
    }
  };

  const handleGetSubjects = async () => {
    setIsLoadingAssignedSubjects(true);
    try {
      const response = await apiGetAssignedSubjectByTeacher(currentUser?.id || '');
      if (response.status === 200) {
        setSubjectsAssigned(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAssignedSubjects(false);
    }
  };

  const handleGetStudyGroups = async () => {
    if (!tab1Data.subject) return;
    setIsLoadingStudyGroups(true);
    try {
      const response = await apiGetStudyGroup(1, searchStudyGroup, tab1Data.subject, '', 100);
      if (response.status === 200) {
        setStudyGroups(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingStudyGroups(false);
    }
  };

  const handleGetPointScales = async () => {
    setIsLoadingPointScales(true);
    try {
      const response = await apiGetPointScales();
      if (response.status === 200) {
        setPointScales(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingPointScales(false);
    }
  };

  useEffect(() => {
    handleGetSubjects();
    handleGetPointScales();
  }, []);

  useEffect(() => {
    handleGetStudyGroups();
  }, [tab1Data.subject, searchStudyGroup]);

  useEffect(() => {
    setTab1Groups(selectedStudyGroups);
    const names = selectedStudyGroups
      .map((id) => studyGroups?.data.find((sg) => sg.study_group_id === id)?.study_group_name || '')
      .filter((name) => name)
      .join(', ');
    setStudyGroupName(names);
  }, [selectedStudyGroups, setTab1Groups, studyGroups]);

  const handleToggleStudyGroup = (studyGroupId: string) => {
    setSelectedStudyGroups((prev) => (prev.includes(studyGroupId) ? prev.filter((id) => id !== studyGroupId) : [...prev, studyGroupId]));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Thông tin đề thi</CardTitle>
        <CardDescription>Nhập thông tin cơ bản cho đề thi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên đề thi</Label>
            <Input id="name" value={tab1Data.name} onChange={(e) => setTab1Name(e.target.value)} placeholder="Nhập tên đề thi" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Môn học</Label>
            <Select
              value={tab1Data.subject}
              onValueChange={(value) => {
                setTab1Subject(value);
                setSubjectName(subjectsAssigned.find((subject) => subject.subject.id === value)?.subject.name || '');
              }}
              disabled={mode === 'update'}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingAssignedSubjects ? (
                  <SelectItem value="loading">Đang tải môn học...</SelectItem>
                ) : (
                  subjectsAssigned.map((subject) => (
                    <SelectItem key={subject.id} value={subject.subject.id}>
                      {subject.subject.code} - {subject.subject.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group">Nhóm học phần</Label>
            {tab1Data.subject && (
              <Popover open={openStudyGroup} onOpenChange={setOpenStudyGroup}>
                <PopoverTrigger className="w-full">
                  <Button variant="outline" className="w-full justify-between" disabled={isLoadingStudyGroups || !tab1Data.subject}>
                    {selectedStudyGroups.length > 0 ? `${selectedStudyGroups.length} nhóm học phần được chọn` : 'Chọn nhóm học phần'}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-[350px] p-2">
                  <div className="relative flex-1 mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input type="text" placeholder="Tìm kiếm theo mã hoặc tên..." value={searchStudyGroup} onChange={(e) => setSearchStudyGroup(e.target.value)} className="pl-10" />
                  </div>
                  {isLoadingStudyGroups ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500 mt-2" />
                    </div>
                  ) : (
                    <ScrollArea className="h-40 w-full">
                      {studyGroups?.data && studyGroups.data.length > 0 ? (
                        studyGroups.data
                          .filter((sg) => (sg.study_group_code + sg.study_group_name).toLowerCase().includes(searchStudyGroup.toLowerCase()))
                          .map((studyGroup) => (
                            <div
                              key={studyGroup.study_group_id}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center"
                              onClick={() => handleToggleStudyGroup(studyGroup.study_group_id)}
                            >
                              <input type="checkbox" checked={selectedStudyGroups.includes(studyGroup.study_group_id)} onChange={() => {}} className="mr-2" />
                              {`${studyGroup.study_group_code} - ${studyGroup.study_group_name}`}
                            </div>
                          ))
                      ) : (
                        <div className="p-2 text-gray-500 text-center">Không tìm thấy nhóm học phần</div>
                      )}
                    </ScrollArea>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Thời gian bắt đầu</Label>
            <Input id="start_time" type="datetime-local" value={tab1Data.start_time} onChange={(e) => handleStartTimeChange(e.target.value)} className="w-fit" />
            {startTimeError && <p className="text-sm text-red-500">{startTimeError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_time">Thời gian kết thúc</Label>
            <Input id="end_time" type="datetime-local" value={tab1Data.end_time} onChange={(e) => handleEndTimeChange(e.target.value)} className="w-fit" />
            {endTimeError && <p className="text-sm text-red-500">{endTimeError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Thời gian làm bài (phút)</Label>
            <Input id="duration" type="number" value={tab1Data.duration_minutes}
              defaultValue={60}
              onChange={(e) => setTab1Duration(Number(e.target.value))} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_questions">Số câu hỏi</Label>
            <Input id="total_questions" type="number" value={tab1Data.total_questions} onChange={(e) => handleTotalQuestionsChange(e)} />
            {questionCountError && <p className="text-sm text-red-500">{questionCountError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass_points">Điểm đậu</Label>
            <Input id="pass_points" type="number" value={tab1Data.pass_points} onChange={(e) => handlePassPointsChange(e)} />
            {passPointsError && <p className="text-sm text-red-500">{passPointsError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="point_scale">Thang điểm</Label>
            <Select
              value={tab1Data.point_scale}
              onValueChange={(value) => {
                setTab1PointScale(value);
                setPointScaleName(pointScales.find((pointScale) => pointScale.id === value)?.name || '');
              }}
              disabled={mode === 'update'}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn thang điểm" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPointScales ? (
                  <SelectItem value="loading">Đang tải thang điểm...</SelectItem>
                ) : (
                  pointScales.map((pointScale) => (
                    <SelectItem key={pointScale.id} value={pointScale.id}>
                      {pointScale.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea id="description" value={tab1Data.description} onChange={(e) => setTab1Description(e.target.value)} placeholder="Mô tả về nội dung và yêu cầu đề thi..." className="resize-none" />
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="type">Loại đề</Label>
                <InfoPopup text="Đề thi cuối kỳ và giữa kỳ sẽ do giảng viên mở để. Sinh viên cần phải vào đúng giờ để làm đề thi." _open={open} _setOpen={setOpen} />
              </div>
              <Select value={tab1Data.type} onValueChange={(value) => setTab1Type(value as 'exercise' | 'midterm' | 'final')} disabled={mode === 'update'}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại đề thi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="choose">Chọn loại đề</SelectItem>
                    <SelectItem value="exercise">Bài kiểm tra</SelectItem>
                    <SelectItem value="midterm">Đề thi giữa kỳ</SelectItem>
                    <SelectItem value="final">Đề thi cuối kỳ</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="max_tab_switch">Số lần chuyển tab</Label>
                <InfoPopup
                  text="Số lần chuyển tab là số lần sinh viên có thể chuyển tab để làm đề thi. Nếu sinh viên chuyển tab quá số lần cho phép, đề thi sẽ tự động kết thúc."
                  _open={openMaxTabSwitch}
                  _setOpen={setOpenMaxTabSwitch}
                />
              </div>
              <Input id="max_tab_switch" type="number" value={tab1Data.max_tab_switch} defaultValue={3} onChange={(e) => handleMaxTabSwitchChange(e)} />
              {maxTabSwitchError && <p className="text-sm text-red-500">{maxTabSwitchError}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoTab;

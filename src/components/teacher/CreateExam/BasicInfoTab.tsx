import InfoPopup from "@/components/common/InfoPopup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { apiGetSubjects } from "@/services/admin/subject"
import { apiGetPointScales } from "@/services/teacher/createExam"
import { apiGetStudyGroup } from "@/services/teacher/studyGroup"
import useExamStore from "@/stores/examStore"
import type { PointScale } from "@/types/pointScaleType"
import type { StudyGroupResponse } from "@/types/studyGroupType"
import type { SubjectResponse } from "@/types/subjectType"
import type { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const BasicInfoTab = () => {
  const { tab1Data, setTab1Name, setTab1Subject, setTab1Group, setTab1Description, setTab1StartTime, setTab1EndTime, setTab1Duration, setTab1TotalQuestions, setTab1PassPoints, setTab1PointScale, setTab1Type } = useExamStore()
  const [subjects, setSubjects] = useState<SubjectResponse | null>(null)
  const [pointScales, setPointScales] = useState<PointScale[]>([])
  const [studyGroups, setStudyGroups] = useState<StudyGroupResponse | null>(null)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [isLoadingPointScales, setIsLoadingPointScales] = useState(false)
  const [isLoadingStudyGroups, setIsLoadingStudyGroups] = useState(false)
  const [startTimeError, setStartTimeError] = useState<string | null>(null)
  const [endTimeError, setEndTimeError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target
  //   setTab1Name(value)
  // }

  const validateAndSetDuration = (start: Date, end: Date) => {
    setStartTimeError(null)
    setEndTimeError(null)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    if (startDate !== endDate) {
      setEndTimeError("Ngày bắt đầu và kết thúc phải cùng ngày");
      setTab1Duration(0);
      return;
    }

    if (end <= start) {
      setEndTimeError("Giờ kết thúc phải sau giờ bắt đầu");
      setTab1Duration(0);
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    setTab1Duration(diffMinutes);
  };

  const handleStartTimeChange = (value: string) => {
    setTab1StartTime(value)
    const start = new Date(value)
    const end = new Date(tab1Data.end_time)

    if (tab1Data.end_time) {
      validateAndSetDuration(start, end)
    }
  }

  const handleEndTimeChange = (value: string) => {
    setTab1EndTime(value)
    const start = new Date(tab1Data.start_time)
    const end = new Date(value)

    if (tab1Data.start_time) {
      validateAndSetDuration(start, end)
    }
  }


  const handleGetSubjects = async () => {
    setIsLoadingSubjects(true)
    try {
      const response = await apiGetSubjects(1, "", "", 100)
      if (response.status === 200) {
        setSubjects(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  const handleGetStudyGroups = async () => {
    setIsLoadingStudyGroups(true)
    try {
      const response = await apiGetStudyGroup(1, "", tab1Data.subject, "", 100)
      if (response.status === 200) {
        setStudyGroups(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingStudyGroups(false)
    }
  }

  const handleGetPointScales = async () => {
    setIsLoadingPointScales(true)
    try {
      const response = await apiGetPointScales()
      if (response.status === 200) {
        setPointScales(response.data.data)
      }
    }
    catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    }
    finally {
      setIsLoadingPointScales(false)
    }
  }

  useEffect(() => {
    handleGetSubjects()
    handleGetPointScales()
    handleGetStudyGroups()
  }, [])

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
            <Input
              id="name"
              value={tab1Data.name}
              onChange={(e) => setTab1Name(e.target.value)}
              placeholder="Nhập tên đề thi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Môn học</Label>
            <Select value={tab1Data.subject} onValueChange={setTab1Subject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSubjects ? (
                  <SelectItem value="loading">Đang tải môn học...</SelectItem>
                ) : (
                  subjects?.data.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group">Nhóm học phần</Label>
            <Select value={tab1Data.study_group} onValueChange={setTab1Group}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nhóm học phần" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStudyGroups ? (
                  <SelectItem value="loading">Đang tải nhóm học phần...</SelectItem>
                ) : (
                  studyGroups?.data.map((studyGroup) => (
                    <SelectItem key={studyGroup.study_group_id} value={studyGroup.study_group_id}>{studyGroup.study_group_code} - {studyGroup.study_group_name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Thời gian bắt đầu</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={tab1Data.start_time}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-fit"
            />
            {startTimeError && (
              <p className="text-sm text-red-500">{startTimeError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_time">Thời gian kết thúc</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={tab1Data.end_time}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="w-fit"
            />
            {endTimeError && (
              <p className="text-sm text-red-500">{endTimeError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Thời gian (phút)</Label>
            <Input
              id="duration"
              type="number"
              value={tab1Data.duration_minutes}
              onChange={(e) => setTab1Duration(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_questions">Số câu hỏi</Label>
            <Input
              id="total_questions"
              type="number"
              value={tab1Data.total_questions}
              onChange={(e) => setTab1TotalQuestions(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass_points">Điểm đậu</Label>
            <Input
              id="pass_points"
              type="number"
              value={tab1Data.pass_points}
              onChange={(e) => setTab1PassPoints(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="point_scale">Thang điểm</Label>
            <Select value={tab1Data.point_scale} onValueChange={setTab1PointScale}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn thang điểm" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPointScales ? (
                  <SelectItem value="loading">Đang tải thang điểm...</SelectItem>
                ) : (
                  pointScales.map((pointScale) => (
                    <SelectItem key={pointScale.id} value={pointScale.id}>{pointScale.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={tab1Data.description}
            onChange={(e) => setTab1Description(e.target.value)}
            placeholder="Mô tả về nội dung và yêu cầu đề thi..."
            className="resize-none"
          />
        </div>
        <div className="space-y-2 flex items-center justify-between">
          <div className="flex items-center gap-2 justify-center">
            <Label htmlFor="type">Đề thi cuối kỳ?</Label>
            <InfoPopup text="Đề thi cuối kỳ sẽ được kiểm duyệt bởi quản trị viên" open={open} setOpen={setOpen} />
          </div>
          <Switch className="cursor-pointer data-[state=unchecked]:bg-gray-300" id="type" checked={tab1Data.type} onCheckedChange={setTab1Type} />
        </div>
      </CardContent>
    </Card >
  )
}

export default BasicInfoTab
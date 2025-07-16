import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Search, Users, Clock, CheckCircle, AlertTriangle, Filter, BarChart3, Maximize2, Monitor, GraduationCap, Play, Pause, LogOut } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { FlipReveal, FlipRevealItem } from '@/components/ui/flip-reveal';
import path from '@/utils/path';
import { apiGetDetailExam } from '@/services/student/exam';
import { toast } from 'sonner';
import useAppStore from '@/stores/appStore';
import { useNavigate } from 'react-router-dom';

export interface Student {
  studentId: string;
  name: string;
  code: string;
  avatar: string;
  status: 'taking_exam' | 'out_of_exam' | 'submitted' | 'waiting';
  tab_count: number;
  last_seen?: string;
  exam_progress?: number;
  suspicious_activity?: number;
  warnings?: string[];
}

interface ExamStats {
  total: number;
  taking_exam: number;
  out_of_exam: number;
  submitted: number;
  waiting: number;
}

export default function ExamRoomTeacher() {
  const { examId, studyGroupId } = useAppStore();
  // const { examId, studyGroupId } = { examId: '6275f090-144c-4f97-b447-d0dc2d65cd16', studyGroupId: '29bc0455-ba05-4f1f-9ca6-81042ccbf86a' };

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState<ExamStats>({ total: 0, taking_exam: 0, out_of_exam: 0, submitted: 0, waiting: 0 });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [examOpened, setExamOpened] = useState(false);
  const navigate = useNavigate();

  const handleGetExam = async () => {
    try {
      const response = await apiGetDetailExam(examId);
      console.log('Exam data:', response.data);
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast.error('Không thể tải thông tin kỳ thi');
    }
  };

  useEffect(() => {
    const socketInstance = io(path.SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.emit('joinTeacher', { examId, studyGroupId });

    socketInstance.on('examMatrix', (data: Student[]) => {
      console.log('data', data);
      setStudents(data);
      setFilteredStudents(data);
      setIsLoading(false);
      setLastUpdate(new Date());
      calculateStats(data);
    });

    socketInstance.on('openExam', () => {
      setExamOpened(true);
      // toast.success('Đề thi đã được mở!');
    });

    socketInstance.on('pauseExam', () => {
      setExamOpened(false);
      // toast.info('Đề thi đã bị tạm dừng.');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsLoading(false);
      toast.error('Lỗi kết nối tới máy chủ');
    });

    return () => {
      socketInstance.emit('leave', `teacher_exam:${examId}_study_group:${studyGroupId}`);
      socketInstance.disconnect();
    };
  }, [examId, studyGroupId]);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter]);

  const calculateStats = (studentsData: Student[]) => {
    const newStats = {
      total: studentsData.length,
      taking_exam: studentsData.filter((s) => s.status === 'taking_exam').length,
      out_of_exam: studentsData.filter((s) => s.status === 'out_of_exam').length,
      submitted: studentsData.filter((s) => s.status === 'submitted').length,
      waiting: studentsData.filter((s) => s.status === 'waiting').length,
    };
    setStats(newStats);
  };

  useEffect(() => {
    handleGetExam();
  }, [examId]);

  const handleOpenExam = () => {
    if (socket) {
      socket.emit('openExam', { examId, studyGroupId });
    }
  };

  const handlePauseExam = () => {
    if (socket) {
      socket.emit('pauseExam', { examId, studyGroupId });
    }
  };

  const renderStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium';

    switch (status) {
      case 'taking_exam':
        return (
          <Badge className={`${baseClasses} bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0`}>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Đang thi
          </Badge>
        );
      case 'out_of_exam':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-700 border border-red-200 text-[10px] px-2 py-0`}>
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Thoát tab
          </Badge>
        );
      case 'waiting':
        return (
          <Badge className={`${baseClasses} bg-amber-100 text-amber-700 border border-amber-200 text-[10px] px-2 py-0`}>
            <Clock className="w-1.5 h-1.5" />
            Chờ
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className={`${baseClasses} bg-blue-100 text-blue-700 border border-blue-200 text-[10px] px-2 py-0`}>
            <CheckCircle className="w-1.5 h-1.5" />
            Đã nộp bài
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-200 text-[10px] px-2 py-0`}>
            <Users className="w-1.5 h-1.5" />
            Không xác định
          </Badge>
        );
    }
  };

  const getSuspiciousActivityLevel = (count: number | undefined) => {
    if (!count) return 'none';
    if (count >= 5) return 'high';
    if (count >= 3) return 'medium';
    if (count >= 1) return 'low';
    return 'none';
  };

  const refreshData = () => {
    if (socket) {
      socket.emit('refreshExamMatrix', { examId, studyGroupId });
    }
  };

  const handleGetOutRoom = () => {
    navigate(path.TEACHER.EXAM_RESULT);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center space-y-4">
            <div className="relative">
              <Monitor className="h-16 w-16 text-blue-600 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">Đang kết nối phòng thi...</h3>
            <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <GraduationCap className="h-12 w-12 text-blue-200" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Phòng Thi</h1>
                <p className="text-blue-200 text-sm">Hệ thống giám sát trực tuyến</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="text-xs text-blue-200">Mã kỳ thi</div>
                <div className="font-semibold text-xs">{examId}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="text-xs text-blue-200">Nhóm học</div>
                <div className="font-semibold text-xs">{studyGroupId}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="text-xs text-blue-200">Trạng thái đề thi</div>
                <div className="font-semibold text-xs">{examOpened ? 'Đang mở' : 'Đã tạm dừng'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="text-xs text-blue-200">Thời gian thi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm sinh viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white border-gray-300">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="waiting">Chờ</SelectItem>
              <SelectItem value="taking_exam">Đang thi</SelectItem>
              <SelectItem value="out_of_exam">Rời khỏi phòng thi</SelectItem>
              <SelectItem value="submitted">Đã nộp bài</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-md">
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-md">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={handleOpenExam} disabled={examOpened} variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Mở đề thi
          </Button>

          <Button onClick={handlePauseExam} disabled={!examOpened} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
            <Pause className="w-4 h-4 mr-2" />
            Tạm dừng đề thi
          </Button>

          <Button onClick={handleGetOutRoom} variant="outline" size="sm" className="bg-white border-gray-300 hover:bg-gray-50 hover:text-red-500">
            <LogOut className="w-4 h-4 mr-2" />
            Ra khỏi phòng
          </Button>
        </div>

        <div className="flex gap-2 py-4">
          <div className="flex-1/4 border border-gray-200 rounded-md p-4 bg-white">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Tổng số sinh viên</p>
                <p className="text-sm text-gray-500">{stats.total}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Đang thi</p>
                <p className="text-sm text-gray-500">{stats.taking_exam}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Rời khỏi phòng thi</p>
                <p className="text-sm text-gray-500">{stats.out_of_exam}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Đã nộp bài</p>
                <p className="text-sm text-gray-500">{stats.submitted}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Chờ</p>
                <p className="text-sm text-gray-500">{stats.waiting}</p>
              </div>
            </div>
          </div>
          <div className="flex-3/4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Monitor className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Phòng thi trống</h3>
                <p className="text-gray-500">{searchTerm || statusFilter !== 'all' ? 'Không tìm thấy sinh viên phù hợp với bộ lọc' : 'Chưa có sinh viên tham gia kỳ thi'}</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="flex min-h-[480px] flex-col items-center gap-8">
                <FlipReveal className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4" keys={[statusFilter]} showClass="flex" hideClass="hidden">
                  {filteredStudents.map((student) => (
                    <FlipRevealItem flipKey={student.studentId} key={student.studentId}>
                      <div className="flex items-center justify-center w-[100px] h-[100px] border rounded-md shadow bg-white">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-col items-center justify-center">
                              <Avatar className="shadow-lg size-12">
                                <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">{student?.name?.charAt(0) || ''}</AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-center truncate w-full mt-1">{student.name}</p>
                              <div className="flex items-center justify-center mt-1">{renderStatusBadge(student.status)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-gray-800 border border-gray-200 shadow-xl p-4">
                            <p>
                              <span className="font-semibold">ID:</span> {student.code}
                            </p>
                            <p>
                              <span className="font-semibold">Họ và tên:</span> {student.name}
                            </p>
                            <p>
                              <span className="font-semibold">Trạng thái:</span> {student.status}
                            </p>
                            <p>
                              <span className="font-semibold">Số tab mở:</span> {student.tab_count}
                            </p>
                            {student.exam_progress !== undefined && (
                              <p>
                                <span className="font-semibold">Tiến độ bài thi:</span> {student.exam_progress}%
                              </p>
                            )}
                            {student.suspicious_activity !== undefined && (
                              <p>
                                <span className="font-semibold">Hoạt động đáng nghi:</span> {student.suspicious_activity}
                              </p>
                            )}
                            {student.last_seen && (
                              <p>
                                <span className="font-semibold">Lần cuối online:</span> {student.last_seen}
                              </p>
                            )}
                            {student.warnings?.length && (
                              <p>
                                <span className="font-semibold">Cảnh báo:</span> {student.warnings.join(', ')}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </FlipRevealItem>
                  ))}
                </FlipReveal>
              </div>
            ) : (
              <div className="space-y-4 max-h-[560px] overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-200"
                  >
                    <Popover>
                      <Tooltip>
                        <TooltipTrigger>
                          <PopoverTrigger asChild>
                            <div className="flex items-center gap-4 cursor-pointer flex-1">
                              <div className="relative">
                                <Avatar className="w-12 h-12 ring-2 ring-blue-200">
                                  <AvatarImage src={student.avatar} alt={student.name} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div
                                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    student.status === 'taking_exam' ? 'bg-emerald-500' : student.status === 'submitted' ? 'bg-blue-500' : student.status === 'waiting' ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.code}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                {renderStatusBadge(student.status)}
                                {student.suspicious_activity && student.suspicious_activity > 0 && (
                                  <AlertTriangle
                                    className={`w-5 h-5 ${
                                      getSuspiciousActivityLevel(student.suspicious_activity) === 'high'
                                        ? 'text-red-500'
                                        : getSuspiciousActivityLevel(student.suspicious_activity) === 'medium'
                                        ? 'text-amber-500'
                                        : 'text-orange-500'
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-gray-800 border border-gray-200 shadow-xl">
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.code}</p>
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent className="w-80 p-0 bg-white shadow-2xl rounded-xl border border-gray-100" side="top" align="center">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-6">
                            <Avatar className="w-16 h-16 ring-4 ring-blue-100">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg">{student?.name?.charAt(0) || ''}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                              <p className="text-gray-600">{student.code}</p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Trạng thái:</span>
                              {renderStatusBadge(student.status)}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Số tab mở:</span>
                              <Badge variant={student.tab_count > 1 ? 'destructive' : 'secondary'} className="font-semibold">
                                {student.tab_count} tab{student.tab_count > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            {student.exam_progress !== undefined && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-700">Tiến độ bài thi:</span>
                                  <span className="text-gray-600 font-semibold">{student.exam_progress}%</span>
                                </div>
                                <Progress value={student.exam_progress} className="h-3" />
                              </div>
                            )}
                            {student.suspicious_activity !== undefined && student.suspicious_activity > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Hoạt động đáng nghi:</span>
                                <Badge variant="destructive" className="gap-1 font-semibold">
                                  <AlertTriangle className="w-3 h-3" />
                                  {student.suspicious_activity}
                                </Badge>
                              </div>
                            )}
                            {student.last_seen && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Lần cuối online:</span>
                                <span className="text-gray-600">{student.last_seen}</span>
                              </div>
                            )}
                            {student.warnings && student.warnings.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700 block mb-2">Cảnh báo:</span>
                                <div className="space-y-2">
                                  {student.warnings.map((warning, index) => (
                                    <div key={index} className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                      {warning}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

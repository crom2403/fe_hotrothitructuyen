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
import { Search, Users, UserCheck, UserX, Clock, CheckCircle, AlertTriangle, Filter, BarChart3, RefreshCw, Maximize2, Monitor, GraduationCap } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { FlipReveal, FlipRevealItem } from '@/components/ui/flip-reveal';
import path from '@/utils/path';

export interface Student {
  studentId: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'late' | 'submitted';
  tab_count: number;
  last_seen?: string;
  exam_progress?: number;
  suspicious_activity?: number;
  warnings?: string[];
}

interface ExamStats {
  total: number;
  online: number;
  offline: number;
  submitted: number;
  late: number;
}

export default function ExamRoomTeacher({ examId, studyGroupId }: { examId: string; studyGroupId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState<ExamStats>({ total: 0, online: 0, offline: 0, submitted: 0, late: 0 });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const socketInstance = io(path.SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.emit('joinTeacher', { examId, studyGroupId });

    socketInstance.on('examMatrix', (data: Student[]) => {
      setStudents(data);
      setIsLoading(false);
      setLastUpdate(new Date());
      calculateStats(data);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsLoading(false);
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
      online: studentsData.filter((s) => s.status === 'online').length,
      offline: studentsData.filter((s) => s.status === 'offline').length,
      submitted: studentsData.filter((s) => s.status === 'submitted').length,
      late: studentsData.filter((s) => s.status === 'late').length,
    };
    setStats(newStats);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <UserCheck className="w-4 h-4" />;
      case 'offline':
        return <UserX className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium';

    switch (status) {
      case 'online':
        return (
          <Badge className={`${baseClasses} bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0`}>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Đang thi
          </Badge>
        );
      case 'offline':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-700 border border-red-200`}>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            Ngắt kết nối
          </Badge>
        );
      case 'late':
        return (
          <Badge className={`${baseClasses} bg-amber-100 text-amber-700 border border-amber-200`}>
            <Clock className="w-3 h-3" />
            Trễ
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className={`${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`}>
            <CheckCircle className="w-3 h-3" />
            Đã nộp bài
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`}>
            <Users className="w-3 h-3" />
            Không xác định
          </Badge>
        );
    }
  };

  const getSuspiciousActivityLevel = (count: number) => {
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
                <div className="text-xs text-blue-200">Cập nhật lúc</div>
                <div className="font-semibold text-xs">{lastUpdate.toLocaleTimeString()}</div>
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
              <SelectItem value="online">Đang thi</SelectItem>
              <SelectItem value="offline">Ngắt kết nối</SelectItem>
              <SelectItem value="submitted">Đã nộp bài</SelectItem>
              <SelectItem value="late">Trễ</SelectItem>
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

          <Button onClick={refreshData} variant="outline" size="sm" className="bg-white border-gray-300 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>

        <div className="flex gap-2 py-4">
          <div className="flex-1/4 border border-gray-200 rounded-md p-4 bg-white">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Tổng số sinh viên</p>
                <p className="text-sm text-gray-500">{stats.total}</p>
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
              <div className="flex min-h-120 flex-col items-center gap-8 ">
                <FlipReveal className="grid grid-cols-6 gap-3 sm:gap-4" keys={[statusFilter]} showClass="flex" hideClass="hidden">
                  {filteredStudents.map((student) => (
                    <FlipRevealItem flipKey={student.studentId}>
                      <div className="flex items-center justify-center w-[100px] h-[100px] border rounded-md shadow bg-white">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-col items-center justify-center">
                              <div className="flex items-center justify-center">
                                <Avatar className="shadow-lg size-12">
                                  <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">{student?.name?.charAt(0) || ''}</AvatarFallback>
                                </Avatar>
                              </div>
                              <p className="text-xs">{student.name}</p>
                              <div className="flex items-center justify-between">{renderStatusBadge(student.status)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="w-full h-full bg-white text-gray-800 border border-gray-200 shadow-xl">
                            <p>
                              <span className="font-semibold">ID:</span>
                              {student.studentId}
                            </p>
                            <p>
                              <span className="font-semibold">Họ và tên:</span>
                              {student.name}
                            </p>
                            <p>
                              <span className="font-semibold">Trạng thái:</span>
                              {student.status}
                            </p>
                            <p>
                              <span className="font-semibold">Số tab mở:</span>
                              {student.tab_count}
                            </p>
                            <p>
                              <span className="font-semibold">Tiến độ bài thi:</span>
                              {student.exam_progress}%
                            </p>
                            <p>
                              <span className="font-semibold">Hoạt động đáng nghi:</span>
                              {student.suspicious_activity}
                            </p>
                            <p>
                              <span className="font-semibold">Lần cuối online:</span>
                              {student.last_seen}
                            </p>
                            <p>
                              <span className="font-semibold">Cảnh báo:</span>
                              {student.warnings?.join(', ')}
                            </p>
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
                                    student.status === 'online' ? 'bg-emerald-500' : student.status === 'submitted' ? 'bg-blue-500' : student.status === 'late' ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                />
                              </div>

                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.studentId}</div>
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
                          <p className="text-sm text-gray-500">{student.studentId}</p>
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
                              <p className="text-gray-600">{student.studentId}</p>
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

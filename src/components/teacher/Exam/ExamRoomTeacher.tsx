import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Search, Users, UserCheck, UserX, Clock, CheckCircle, AlertTriangle, Eye, Filter, BarChart3, RefreshCw, Maximize2, Monitor, BookOpen, GraduationCap, Laptop } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Student {
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
    const socketInstance = io('http://localhost:3000/events', {
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
          <Badge className={`${baseClasses} bg-emerald-100 text-emerald-700 border border-emerald-200`}>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
      {/* Classroom Header - Resembling a real classroom */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container mx-auto px-2 py-2 ">
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
        {/* Classroom Statistics Dashboard */}
        {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-6 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{stats.total}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Tổng sinh viên</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Laptop className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-6 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mb-1">{stats.online}</div>
              <div className="text-sm text-gray-600">Đang thi</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-1">{stats.submitted}</div>
              <div className="text-sm text-gray-600">Đã nộp bài</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-6 w-3 h-3 bg-amber-400 rounded-full animate-bounce" />
              </div>
              <div className="text-2xl font-bold text-amber-700 mb-1">{stats.late}</div>
              <div className="text-sm text-gray-600">Trễ</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserX className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-700 mb-1">{stats.offline}</div>
              <div className="text-sm text-gray-600">Ngắt kết nối</div>
            </CardContent>
          </Card>
        </div> */}

        {/* Classroom Control Panel */}

        {/* Virtual Classroom - Student Seating */}

        <div className="p-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Monitor className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Phòng thi trống</h3>
              <p className="text-gray-500">{searchTerm || statusFilter !== 'all' ? 'Không tìm thấy sinh viên phù hợp với bộ lọc' : 'Chưa có sinh viên tham gia kỳ thi'}</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6' : 'space-y-4'}>
              {filteredStudents.map((student) => (
                <div
                  key={student.studentId}
                  className={
                    viewMode === 'grid'
                      ? 'relative group'
                      : 'flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-200'
                  }
                >
                  <Popover>
                    <Tooltip>
                      <TooltipTrigger>
                        <PopoverTrigger asChild>
                          {viewMode === 'grid' ? (
                            <div className="relative cursor-pointer transform transition-all duration-300 hover:scale-105">
                              <div className="max-w-20 min-w-20 h-24 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg border-2 border-amber-300 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-amber-50 to-amber-100 rounded-t-lg" />

                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                                  <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                                    <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">{student.name.charAt(0)}</AvatarFallback>
                                  </Avatar>

                                  <div
                                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                      student.status === 'online'
                                        ? 'bg-emerald-500 animate-pulse'
                                        : student.status === 'submitted'
                                        ? 'bg-blue-500'
                                        : student.status === 'late'
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                    }`}
                                  />

                                  {/* Suspicious Activity Alert */}
                                  {student.suspicious_activity && student.suspicious_activity > 0 && (
                                    <div className="absolute -top-2 -left-2">
                                      <AlertTriangle
                                        className={`w-4 h-4 ${
                                          getSuspiciousActivityLevel(student.suspicious_activity) === 'high'
                                            ? 'text-red-500 animate-bounce'
                                            : getSuspiciousActivityLevel(student.suspicious_activity) === 'medium'
                                            ? 'text-amber-500 animate-pulse'
                                            : 'text-orange-500'
                                        }`}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                  <div className="w-6 h-4 bg-gray-800 rounded-sm">
                                    <div className="w-full h-2 bg-gray-700 rounded-t-sm" />
                
                                    <div className={`w-full h-2 rounded-b-sm ${student.status === 'online' ? 'bg-green-400' : student.status === 'submitted' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                                  </div>
                                </div> */}
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                  <div className="w-6 h-4 bg-gray-800 rounded-sm">
                                    <div className="w-full h-2 bg-gray-700 rounded-t-sm" />
                                    <Badge>{student.status}</Badge>
                                    <div className={`w-full h-2 rounded-b-sm ${student.status === 'online' ? 'bg-green-400' : student.status === 'submitted' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 text-center">
                                <p className="text-xs font-medium text-gray-700 max-w-20 truncate">{student.name}</p>
                              </div>

                              {/* Progress Bar */}
                              {student.exam_progress !== undefined && (
                                <div className="mt-1 w-full">
                                  <Progress value={student.exam_progress} className="h-1" />
                                </div>
                              )}
                            </div>
                          ) : (
                            // List View
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
                          )}
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
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg">{student.name.charAt(0)}</AvatarFallback>
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
  );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, Calendar, Clock, UserPlus, MessageCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { IStudentGroup, IStudentGroupDetail } from '@/types/studentGroupType';
import { apiGetStudentGroups, apiGetStudentGroupById, apiJoinGroup } from '@/services/student/student-group';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Loading from '@/components/common/Loading';

const StudentGroup = () => {
  const [listGroups, setListGroups] = useState<IStudentGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [studyGroupDetail, setStudyGroupDetail] = useState<IStudentGroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpenJoin, setIsDialogOpenJoin] = useState(false);
  const [code, setCode] = useState<string>('');

  const handleJoinGroup = async () => {
    try {
      const response: any = await apiJoinGroup(code);
      setIsDialogOpenJoin(false);
      handleGetListGroups();
      console.log(response);

      if (response.status !== 200) {
        toast.error(response.data.message);
      }
    } catch (err: any) {
      console.error('Lỗi khi tham gia nhóm:', err);
      toast.error(err.response.data.message);
    } finally {
      setIsDialogOpenJoin(false);
    }
  };

  const handleGetListGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await apiGetStudentGroups();
      const groups = response?.data?.data;
      if (groups?.length > 0) {
        setListGroups(groups);
      } else {
        setError('Không có nhóm học phần nào để hiển thị.');
        setListGroups([]);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhóm:', err);
      setError('Đã xảy ra lỗi khi tải danh sách nhóm học phần.');
      setListGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetGroupDetail = async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setError(null);
      const response: any = await apiGetStudentGroupById(id);
      const groupDetail = response.data as IStudentGroupDetail;
      console.log(groupDetail);
      if (groupDetail) {
        setStudyGroupDetail(groupDetail);
      } else {
        setError('Không tìm thấy thông tin chi tiết nhóm học phần.');
        setStudyGroupDetail(null);
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết nhóm:', err);
      setError('Đã xảy ra lỗi khi tải chi tiết nhóm học phần.');
      setStudyGroupDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    handleGetListGroups();
  }, []);

  const getStatusColor = (isCurrent: boolean) => {
    return isCurrent ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusLabel = (isCurrent: boolean) => {
    return isCurrent ? 'Đang học' : 'Đã hoàn thành';
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'teacher':
        return 'bg-purple-100 text-purple-800';
      case 'student':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error && !listGroups.length) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh sách nhóm học phần</h1>
        <Dialog open={isDialogOpenJoin} onOpenChange={setIsDialogOpenJoin}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4" />
              Tham gia nhóm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tham gia nhóm</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <div className="flex flex-col gap-2">
                <Input type="text" placeholder="Nhập mã nhóm" value={code} onChange={(e) => setCode(e.target.value)} />
                <Button onClick={handleJoinGroup}>Tham gia</Button>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {listGroups.map((group) => (
              <Card
                key={group.study_group_id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedGroup(group.study_group_id);
                  setIsDialogOpen(true);
                  handleGetGroupDetail(group.study_group_id);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{group.subject_name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{group.subject_name}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(group.semester_is_current)}>{getStatusLabel(group.semester_is_current)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.teacher_avatar || '/placeholder.svg'} />
                      <AvatarFallback>{group.teacher_full_name?.charAt(0) || 'N/A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{group.teacher_full_name}</p>
                      <p className="text-xs text-gray-600">{group.semester_name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{group.study_group_description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>
                        {group.student_count}/{group.study_group_max_students}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết nhóm học phần</DialogTitle>
            <div>{studyGroupDetail?.name}</div>
          </DialogHeader>
          {isLoadingDetail ? (
            <Loading />
          ) : error && !studyGroupDetail ? (
            <div className="text-center p-4 text-red-600">{error}</div>
          ) : studyGroupDetail ? (
            <Tabs defaultValue="info" className="w-full max-h-[400px] overflow-y-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="members">Thành viên</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Môn học: </span>
                          <span className="font-medium">{studyGroupDetail.subject?.name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Giảng viên: </span>
                          <span className="font-medium">{studyGroupDetail.teacher?.full_name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Học kỳ: </span>
                          <span className="font-medium">{studyGroupDetail.semester?.name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Mã nhóm: </span>
                          <span className="font-medium">{studyGroupDetail.code || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Thống kê</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Số sinh viên: </span>
                          <span className="font-medium">
                            {studyGroupDetail.students?.length || 0}/{studyGroupDetail.max_students || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Ngày bắt đầu: </span>
                          <span className="font-medium">{studyGroupDetail.semester?.start_date ? new Date(studyGroupDetail.semester.start_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Ngày kết thúc: </span>
                          <span className="font-medium">{studyGroupDetail.semester?.end_date ? new Date(studyGroupDetail.semester.end_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Mã tham gia: </span>
                          <span className="font-medium">{studyGroupDetail.invite_code || ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
                    <p className="text-gray-600">{studyGroupDetail.description || 'Không có mô tả'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div key={studyGroupDetail.teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={studyGroupDetail.teacher.avatar || '/placeholder.svg'} />
                          <AvatarFallback>{studyGroupDetail.teacher.full_name?.charAt(0) || 'N/A'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{studyGroupDetail.teacher.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{studyGroupDetail.teacher.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(studyGroupDetail.teacher.role?.code || '')}>{studyGroupDetail.teacher.role?.name || 'Không xác định'}</Badge>
                      </div>
                    </div>
                    {studyGroupDetail.students?.length > 0 ? (
                      studyGroupDetail.students.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.student.avatar || '/placeholder.svg'} />
                              <AvatarFallback>{member.student.full_name?.charAt(0) || 'N/A'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.student.full_name || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{member.student.email || 'Chưa liên kết email'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRoleColor(member.student.role?.code || '')}>{member.student.role?.name || 'Không xác định'}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">Không có thành viên nào.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-red-600">Không tìm thấy thông tin nhóm học phần.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentGroup;

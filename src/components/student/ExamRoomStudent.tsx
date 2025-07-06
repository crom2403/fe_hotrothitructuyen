import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import useAuthStore from '@/stores/authStore';

interface StudentInfo {
  studentId: string;
  name: string;
  avatar: string;
}
import { listAvatar } from '@/components/profile/ChooseAvatarDialog';
import path from '@/utils/path';
import { useParams } from 'react-router-dom';

export default function ExamRoomStudent() {
  // const { examId, studyGroupId } = useParams();
  const { examId, studyGroupId } = { examId: 'da98c8e1-7e7c-47e6-898b-d57277a4fc8f', studyGroupId: '29bc0455-ba05-4f1f-9ca6-81042ccbf86a' };

  console.log(examId, studyGroupId);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    studentId: '',
    name: '',
    avatar: listAvatar[Math.floor(Math.random() * listAvatar.length)].image,
  });
  const { currentUser } = useAuthStore();

  useEffect(() => {
    // Kết nối tới WebSocket server
    const socketInstance = io(path.SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(socketInstance);

    // Xử lý lỗi kết nối
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Lỗi kết nối');
    });

    // Cleanup khi component unmount
    return () => {
      if (socketInstance) {
        socketInstance.emit('leaveExam', {
          examId,
          studyGroupId,
          studentId: studentInfo.studentId,
        });
        socketInstance.disconnect();
      }
    };
  }, [examId, studyGroupId, studentInfo.studentId, toast]);

  const handleJoinExam = () => {
    if (!studentInfo.studentId || !studentInfo.name) {
      toast.error('Vui lòng nhập đầy đủ mã sinh viên và tên.');
      return;
    }

    if (!socket) {
      toast.error('Không thể kết nối tới server.');
      return;
    }

    setIsLoading(true);

    // Gửi sự kiện joinExam tới server
    // socket.emit('joinExam', {
    //   examId,
    //   studyGroupId,
    //   studentId: currentUser?.id,
    //   name: currentUser?.full_name,
    //   avatar: currentUser?.avatar,
    //   tab_count: 1, // Giả lập số tab đang mở
    //   status: 'online',
    // });

    socket.emit('joinExam', {
      examId,
      studyGroupId,
      studentId: Math.floor(Math.random() * 1000000).toString(),
      name: 'John Doe',
      avatar: listAvatar[Math.floor(Math.random() * listAvatar.length)].image,
      tab_count: 1, // Giả lập số tab đang mở
      status: 'waiting',
    });

    // Lắng nghe phản hồi từ server
    socket.on('joinExam', (data) => {
      setIsLoading(false);
      toast.success(`Đã tham gia phòng thi ${examId} - Nhóm ${studyGroupId}`);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tham gia phòng thi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentId">Mã sinh viên</Label>
              <Input
                id="studentId"
                value={studentInfo.studentId}
                onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                placeholder="Nhập mã sinh viên"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" value={studentInfo.name} onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })} placeholder="Nhập họ và tên" disabled={isLoading} />
            </div>
            <Button onClick={handleJoinExam} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tham gia...
                </>
              ) : (
                'Tham gia phòng thi'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

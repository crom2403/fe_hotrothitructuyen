import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, CheckCircle, Info, X, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'exam' | 'result' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'exam',
    title: 'Bài thi sắp bắt đầu',
    message: "Bài thi 'Kiểm tra HTML & CSS' sẽ bắt đầu trong 30 phút. Hãy chuẩn bị sẵn sàng!",
    timestamp: '2025-01-15T07:30:00',
    isRead: false,
    priority: 'high',
  },
  {
    id: '2',
    type: 'result',
    title: 'Kết quả thi đã có',
    message: "Kết quả bài thi 'JavaScript cơ bản' đã được công bố. Điểm của bạn: 92/100",
    timestamp: '2025-01-14T16:00:00',
    isRead: false,
    priority: 'medium',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Nhắc nhở nộp bài tập',
    message: "Bài tập 'Thiết kế responsive' sẽ hết hạn vào ngày mai. Đừng quên nộp bài!",
    timestamp: '2025-01-14T10:00:00',
    isRead: true,
    priority: 'medium',
  },
  {
    id: '4',
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống sẽ bảo trì từ 23:00 - 01:00 đêm nay. Vui lòng hoàn thành bài thi trước thời gian này.',
    timestamp: '2025-01-13T18:00:00',
    isRead: true,
    priority: 'low',
  },
  {
    id: '5',
    type: 'exam',
    title: 'Lịch thi thay đổi',
    message: "Bài thi 'Cơ sở dữ liệu' đã được dời từ 14:00 sang 15:30 ngày 20/01.",
    timestamp: '2025-01-13T14:30:00',
    isRead: false,
    priority: 'high',
  },
  {
    id: '6',
    type: 'result',
    title: 'Điểm bài tập đã cập nhật',
    message: "Điểm bài tập 'CSS Flexbox' đã được cập nhật: 8.5/10. Xem chi tiết phản hồi từ giảng viên.",
    timestamp: '2025-01-12T11:20:00',
    isRead: true,
    priority: 'low',
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'exam' | 'result' | 'reminder' | 'system'>('all');

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <Clock className="h-4 w-4" />;
      case 'result':
        return <CheckCircle className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-blue-100 text-blue-800';
      case 'result':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam':
        return 'Thi cử';
      case 'result':
        return 'Kết quả';
      case 'reminder':
        return 'Nhắc nhở';
      case 'system':
        return 'Hệ thống';
      default:
        return 'Khác';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Thông báo
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Quản lý thông báo và nhắc nhở</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
              <TabsTrigger value="exam">Thi cử</TabsTrigger>
              <TabsTrigger value="result">Kết quả</TabsTrigger>
              <TabsTrigger value="reminder">Nhắc nhở</TabsTrigger>
              <TabsTrigger value="system">Hệ thống</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 border-l-4 ${getPriorityColor(notification.priority)} ${!notification.isRead ? 'bg-blue-50' : 'bg-white'} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getTypeColor(notification.type)}>
                              {getTypeIcon(notification.type)}
                              <span className="ml-1">{getTypeLabel(notification.type)}</span>
                            </Badge>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            <span className="text-sm text-gray-500">{new Date(notification.timestamp).toLocaleString('vi-VN')}</span>
                          </div>

                          <h3 className="font-semibold text-lg mb-1">{notification.title}</h3>
                          <p className="text-gray-600 mb-3">{notification.message}</p>

                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                                Đánh dấu đã đọc
                              </Button>
                            )}
                            {notification.actionUrl && <Button size="sm">Xem chi tiết</Button>}
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)} className="text-gray-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
                    <p className="text-gray-600">{filter === 'unread' ? 'Bạn đã đọc hết tất cả thông báo' : 'Chưa có thông báo nào trong danh mục này'}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

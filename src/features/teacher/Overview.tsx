import StatCard from "@/components/common/StatCard"
import QuickActionButton from "@/components/teacher/QuickActionButton"
import RecentExamCard from "@/components/teacher/RecentExamCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Clock, Eye, FileText, Plus, Users } from "lucide-react"

const Overview = () => {
  const stats = [
    {
      title: "Câu hỏi trong NHCH",
      value: 245,
      description: "15 câu mới tuần này",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Đề thi đã tạo",
      value: 12,
      description: "3 đề thi đang hoạt động",
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Sinh viên tham gia",
      value: 156,
      description: "Trong tất cả lớp học",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Điểm trung bình",
      value: 7.8,
      description: "+0.3 so với kỳ trước",
      icon: BarChart3,
      color: "text-orange-600",
    },
  ]

  const recentExams = [
    {
      id: 1,
      title: "Kiểm tra giữa kỳ - Lập trình Web",
      subject: "Lập trình Web",
      students: 45,
      status: "Đang diễn ra",
      endTime: "14:30 hôm nay",
    },
    {
      id: 2,
      title: "Bài tập lớn - Cơ sở dữ liệu",
      subject: "Cơ sở dữ liệu",
      students: 38,
      status: "Sắp diễn ra",
      endTime: "09:00 ngày mai",
    },
    {
      id: 3,
      title: "Thi cuối kỳ - Mạng máy tính",
      subject: "Mạng máy tính",
      students: 52,
      status: "Đã kết thúc",
      endTime: "2 ngày trước",
    },
  ]

  const quickActions = [
    {
      title: "Tạo câu hỏi mới",
      description: "Thêm câu hỏi vào ngân hàng",
      icon: Plus,
      action: "questions",
    },
    {
      title: "Tạo đề thi",
      description: "Tạo đề thi từ NHCH",
      icon: FileText,
      action: "exams",
    },
    {
      title: "Xem kết quả",
      description: "Thống kê và báo cáo",
      icon: BarChart3,
      action: "results",
    },
    {
      title: "Quản lý phòng thi",
      description: "Giám sát bài thi",
      icon: Eye,
      action: "exam-rooms",
    },
  ]

  const normalizeStatus = (status: string): "Đang diễn ra" | "Sắp diễn ra" | "Đã kết thúc" => {
    if (status.toLowerCase().includes("đang")) return "Đang diễn ra";
    if (status.toLowerCase().includes("sắp")) return "Sắp diễn ra";
    return "Đã kết thúc";
  }

  const handleQuickAction = (action: string) => {
    console.log(action)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan giảng dạy</h1>
        <p className="text-gray-500">Quản lý bài thi và theo dõi kết quả học tập</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} description={stat.description} icon={<stat.icon />} color={stat.color} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Bài thi gần nhất</CardTitle>
              <CardDescription>Danh sách bài thi đã tạo và trạng thái</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {
                  recentExams.map((exam) => (
                    <RecentExamCard key={exam.id} id={exam.id} title={exam.title} subject={exam.subject} student={exam.students} status={normalizeStatus(exam.status)} endTime={exam.endTime} />
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Thao tác nhanh</CardTitle>
              <CardDescription>Các chức năng thường sử dụng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {
                  quickActions.map((action) => (
                    <QuickActionButton key={action.title} icon={<action.icon />} label={action.title} onClick={() => handleQuickAction(action.action)} />
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Overview
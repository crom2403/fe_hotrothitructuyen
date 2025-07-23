import Loading from "@/components/common/Loading";
import StatCard from "@/components/common/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGetDashboardStats } from "@/services/admin/overview";
import { BookOpen, FileText, GraduationCap, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StatResponse {
  totalUsers: number;
  totalSubjects: number;
  totalStudyGroups: number;
  totalExams: number;
  totalExamResults: number;
  totalExamAttempts: number;
  totalExamAttemptScores: number;
}

const Overview = () => {
  const [stats, setStats] = useState<StatResponse>();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Lỗi khi lấy dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    handleGetStats();
  }, []);

  // const stats = [  
  //   {
  //     title: "Tổng người dùng",
  //     value: 1234,
  //     description: "+12% so với tháng trước",
  //     icon: Users,
  //     color: "text-blue-600",
  //   },
  //   {
  //     title: "Môn học",
  //     value: 45,
  //     description: "3 môn mới tuần này",
  //     icon: BookOpen,
  //     color: "text-green-600",
  //   },
  //   {
  //     title: "Lớp học phần",
  //     value: 128,
  //     description: "Học kỳ hiện tại",
  //     icon: GraduationCap,
  //     color: "text-purple-600",
  //   },
  //   {
  //     title: "Bài thi",
  //     value: 89,
  //     description: "15 bài thi tuần này",
  //     icon: FileText,
  //     color: "text-orange-600",
  //   },
  // ]

  const recentActivities = [
    {
      id: 1,
      action: "Tạo tài khoản mới",
      user: "Nguyễn Văn A",
      time: "2 phút trước",
      type: "user",
    },
    {
      id: 2,
      action: "Cập nhật môn học",
      user: "Trần Thị B",
      time: "15 phút trước",
      type: "subject",
    },
    {
      id: 3,
      action: "Tạo lớp học phần mới",
      user: "Lê Văn C",
      time: "1 giờ trước",
      type: "class",
    },
    {
      id: 4,
      action: "Xuất bản bài thi",
      user: "Phạm Thị D",
      time: "2 giờ trước",
      type: "exam",
    },
  ]

  return (
    <>
      {
        isLoading ? (
          <div className="flex justify-center items-center h-screen col-span-full">
            <Loading />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
                <p>Thống kê và hoạt động gần đây</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Tổng người dùng" value={stats?.totalUsers} description="Tổng số người dùng trong hệ thống" icon={<Users className="w-4 h-4" />} color="text-blue-600" />
                <StatCard title="Môn học" value={stats?.totalSubjects} description="Tổng số môn học trong hệ thống" icon={<BookOpen className="w-4 h-4" />} color="text-green-600" />
                <StatCard title="Lớp học phần" value={stats?.totalStudyGroups} description="Tổng số lớp học phần trong hệ thống" icon={<GraduationCap className="w-4 h-4" />} color="text-purple-600" />
                <StatCard title="Bài thi" value={stats?.totalExams} description="Tổng số bài thi trong hệ thống" icon={<FileText className="w-4 h-4" />} color="text-orange-600" />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Hoạt động gần đây
                    </CardTitle>
                    <CardDescription>Các thay đổi mới nhất trong hệ thống</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">
                              {activity.user} • {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )
      }
    </>
  )
}

export default Overview
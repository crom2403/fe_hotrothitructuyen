import Loading from "@/components/common/Loading";
import StatCard from "@/components/common/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGetDashboardStats, apiGetExamsOverview, apiGetUsersOverview } from "@/services/admin/overview";
import type { UserResponse } from "@/types/userType";
import { BookOpen, FileText, GraduationCap, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ExamListResponse } from "./ExamManagement";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface StatResponse {
  totalUsers: number;
  totalSubjects: number;
  totalStudyGroups: number;
  totalExams: number;
  totalExamResults: number;
  totalExamAttempts: number;
  totalExamAttemptScores: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Overview = () => {
  const [stats, setStats] = useState<StatResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [examData, setExamData] = useState<ExamListResponse | null>(null)

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const [examResponse, userResponse] = await Promise.all([apiGetExamsOverview(), apiGetUsersOverview()]);
      setExamData(examResponse.data);
      setUserData(userResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi lấy dữ liệu thống kê");
      setExamData(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

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
    handleGetData();
  }, []);

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

  const examTypeData = examData
    ? [
      {
        name: "Bài tập",
        value: examData.data.filter((exam) => exam.test_type === "exercise").length,
        color: COLORS[0],
      },
      {
        name: "Giữa kỳ",
        value: examData.data.filter((exam) => exam.test_type === "midterm").length,
        color: COLORS[1],
      },
      {
        name: "Cuối kỳ",
        value: examData.data.filter((exam) => exam.test_type === "final").length,
        color: COLORS[2],
      },
    ].filter((item) => item.value > 0)
    : [];

  const userRoleData = userData
    ? [
      {
        name: "Quản trị viên",
        value: userData.data.filter((user) => user.role_code === "admin").length,
        color: COLORS[0],
      },
      {
        name: "Giảng viên",
        value: userData.data.filter((user) => user.role_code === "teacher").length,
        color: COLORS[1],
      },
      {
        name: "Sinh viên",
        value: userData.data.filter((user) => user.role_code === "student").length,
        color: COLORS[2],
      },
    ].filter((item) => item.value > 0)
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen col-span-full">
        <Loading />
      </div>
    );
  }

  return (
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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Phân bổ loại đề thi
            </CardTitle>
            <CardDescription>Số lượng bài tập, giữa kỳ và cuối kỳ</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={examTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {examTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} bài`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Phân bổ vai trò người dùng
            </CardTitle>
            <CardDescription>Số lượng quản trị viên, giảng viên và sinh viên</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} người`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Overview
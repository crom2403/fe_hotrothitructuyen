import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp, Clock, Trophy, Play, Eye } from "lucide-react"

const Overview = () => {

  const stats = [
    {
      title: "Bài thi đã hoàn thành",
      value: "8",
      description: "Trong học kỳ này",
      icon: Trophy,
      color: "text-blue-600",
    },
    {
      title: "Điểm trung bình",
      value: "8.2",
      description: "+0.5 so với kỳ trước",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Môn học đăng ký",
      value: "6",
      description: "24 tín chỉ",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Bài thi sắp tới",
      value: "3",
      description: "Trong tuần này",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  const upcomingExams = [
    {
      id: 1,
      title: "Kiểm tra giữa kỳ - Lập trình Web",
      subject: "Lập trình Web",
      startTime: "2024-12-08 09:00",
      duration: 90,
      status: "Sắp diễn ra",
      canJoin: false,
    },
    {
      id: 2,
      title: "Bài tập lớn - Cơ sở dữ liệu",
      subject: "Cơ sở dữ liệu",
      startTime: "2024-12-07 14:00",
      duration: 120,
      status: "Có thể vào thi",
      canJoin: true,
    },
    {
      id: 3,
      title: "Thực hành - Mạng máy tính",
      subject: "Mạng máy tính",
      startTime: "2024-12-10 10:00",
      duration: 60,
      status: "Sắp diễn ra",
      canJoin: false,
    },
  ]

  const recentResults = [
    {
      id: 1,
      title: "Kiểm tra - Hệ điều hành",
      subject: "Hệ điều hành",
      score: 8.5,
      maxScore: 10,
      completedAt: "2024-12-01",
      status: "Đạt",
    },
    {
      id: 2,
      title: "Bài tập - Thuật toán",
      subject: "Thuật toán",
      score: 7.2,
      maxScore: 10,
      completedAt: "2024-11-28",
      status: "Đạt",
    },
    {
      id: 3,
      title: "Thực hành - Java",
      subject: "Lập trình Java",
      score: 9.1,
      maxScore: 10,
      completedAt: "2024-11-25",
      status: "Đạt",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Có thể vào thi":
        return "bg-green-100 text-green-800"
      case "Sắp diễn ra":
        return "bg-blue-100 text-blue-800"
      case "Đã kết thúc":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 65) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trang chủ sinh viên</h1>
        <p className="text-gray-500">
          Theo dõi bài thi và kết quả học tập
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{stat.title}</h3>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Bài thi sắp tới</CardTitle>
            <CardDescription>Danh sách bài thi bạn có thể tham gia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex justify-between items-center p-6 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-medium">{exam.title}</h4>
                    <p className="text-sm text-gray-600">{exam.subject}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(exam.startTime)} • {exam.duration} phút
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>
                      {exam.canJoin && (
                        <Button size="sm" className="bg-black">
                          <Play className="mr-1 h-3 w-3" />
                          Vào thi
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Kết quả gần đây</CardTitle>
            <CardDescription>Điểm số các bài thi đã hoàn thành</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.id} className="flex justify-between items-center p-6 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-medium">{result.title}</h4>
                    <p className="text-sm text-gray-600">{result.subject}</p>
                    <p className="text-xs text-gray-500">
                      Hoàn thành: {new Date(result.completedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className={`font-bold ${getScoreColor(result.score, result.maxScore)}`}>
                        {result.score}/{result.maxScore}
                      </p>
                      <Badge variant={result.status === "Đạt" ? "default" : "destructive"} className="bg-black rounded-full">{result.status}</Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Overview
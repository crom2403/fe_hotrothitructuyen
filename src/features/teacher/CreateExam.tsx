import BasicInfoTab from "@/components/teacher/CreateExam/BasicInfoTab"
import QuestionsTab from "@/components/teacher/CreateExam/QuestionsTab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Loader2, Save } from "lucide-react"
import { useState } from "react"

const CreateExam = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tạo đề thi</h1>
          <p className="text-gray-500">Tạo đề thi từ ngân hàng câu hỏi hoặc tự động bằng AI</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
          <Button onClick={() => { }} className="bg-black hover:bg-black/80 " disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu đề thi
              </>
            )}
          </Button>
        </div>
      </div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="questions">Chọn câu hỏi</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default CreateExam
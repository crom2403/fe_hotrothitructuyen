import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface RecentExamProps {
  id: string;
  title: string;
  subject: string;
  student: number;
  status: string;
  endTime: string;
  test_type: string;
  handleJoinRoom: () => void;
}
const RecentExamCard = ({ id, title, subject, student, status, endTime, test_type, handleJoinRoom }: RecentExamProps) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div>
        <h4 className="text-lg font-bold">{title}</h4>
        <p className="text-sm text-gray-500">{subject}</p>
        <p className="text-xs text-gray-500">
          {student} sinh viên • {endTime}
        </p>
      </div>
      <div>
        {status === "Đang diễn ra" && (
          <div className="flex items-center">
            <Badge className="bg-green-200 text-green-800 rounded-2xl">Đang diễn ra</Badge>
            {(test_type === "final" || test_type === "midterm") && (
              <Button 
                onClick={() =>handleJoinRoom()}
                variant="outline" size="sm" className="ml-2 bg-primary text-white">
                Vào phòng thi
              </Button>
            )}
          </div>
        )}
        {status === "Sắp diễn ra" && <Badge className="bg-blue-100 text-blue-800 rounded-2xl">Sắp diễn ra</Badge>}
        {status === "Đã kết thúc" && <Badge className="bg-gray-200 text-gray-800 rounded-2xl">Đã kết thúc</Badge>}
      </div>
    </div>
  )
}

export default RecentExamCard
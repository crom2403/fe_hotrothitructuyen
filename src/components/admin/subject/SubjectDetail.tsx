import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Subject } from "@/types/subjectType";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import Info from "@/components/common/Info";

interface SubjectDetailProps {
  subject: Subject | null;
}

const SubjectDetail = ({ subject }: SubjectDetailProps) => {
  if (!subject) return null;

  return (
    <DialogContent className="min-w-[50vw] max-w-[1200px] min-h-[60vh] overflow-y-auto bg-white p-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">
          Chi tiết môn học
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Mã môn học" value={subject.code} />
        <Info label="Tên môn học" value={subject.name} />
        <Info label="Số tín chỉ" value={subject.credits.toString()} />
        <Info label="Giờ lý thuyết" value={subject.theory_hours?.toString() || "0"} />
        <Info label="Giờ thực hành" value={subject.practice_hours?.toString() || "0"} />
        <Info
          label="Trạng thái"
          value={
            subject.is_active ? (
              <Badge className="bg-green-500">
                <CheckCircle className="w-4 h-4 mr-1" /> Hoạt động
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-4 h-4 mr-1" /> Không hoạt động
              </Badge>
            )
          }
        />
        {/* <Info
          label="Ngày tạo"
          value={format(new Date(subject.created_at), "dd/MM/yyyy", {
            locale: vi,
          })}
        /> */}
        <div className="col-span-full">
          <span className="text-muted-foreground font-medium">Mô tả:</span>
          <p className="mt-1 text-gray-700">
            {subject.description || "Không có mô tả"}
          </p>
        </div>
      </div>
    </DialogContent>
  );
};

export default SubjectDetail;



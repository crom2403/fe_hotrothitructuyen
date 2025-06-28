import AssignSubjectTable from "@/components/admin/assign_subject/AssignSubjectTable"

const AssignSubject = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phân công môn học</h1>
        <p className="text-gray-500">Quản lý việc giảng dạy môn học cho giảng viên</p>
      </div>
      <div>
        <AssignSubjectTable />
      </div>
    </div>
  )
}

export default AssignSubject
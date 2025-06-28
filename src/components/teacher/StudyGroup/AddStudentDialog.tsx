import { Button } from '@/components/ui/button'
import { DialogHeader } from '@/components/ui/dialog'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { apiGetUsers } from '@/services/admin/user'
import { apiAddStudentToStudyGroup, apiGetStudyGroup } from '@/services/teacher/studyGroup'
import type { StudyGroupInfo, StudyGroupResponse } from '@/types/studyGroupType'
import type { UserInfo, UserResponse } from '@/types/userType'
import type { AxiosError } from 'axios'
import { Import, Loader2, Search, UserPlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleGetStudyGroup: () => void
}

const AddStudentDialog = ({ open, onOpenChange, handleGetStudyGroup }: AddStudentDialogProps) => {
  const [studyGroup, setStudyGroup] = useState<StudyGroupResponse | null>(null)
  const [student, setStudent] = useState<UserResponse | null>(null)
  const [searchStudyGroup, setSearchStudyGroup] = useState('')
  const [selectedStudyGroup, setSelectedStudyGroup] = useState<StudyGroupInfo | null>(null)
  const [isLoadingStudyGroup, setIsLoadingStudyGroup] = useState(false)
  const [openStudyGroup, setOpenStudyGroup] = useState(false)
  const [searchStudent, setSearchStudent] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<UserInfo[]>([])
  const [isLoadingStudent, setIsLoadingStudent] = useState(false)
  const [openStudent, setOpenStudent] = useState(false)
  const [isLoadingAddStudent, setIsLoadingAddStudent] = useState(false)
  

  const handleGetStudyGroups = async () => {
    setIsLoadingStudyGroup(true)
    try {
      const response = await apiGetStudyGroup(1, searchStudyGroup, '', '', 100)
      if (response.status === 200) {
        setStudyGroup(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoadingStudyGroup(false)
    }
  }

  const handleGetStudent = async () => {
    setIsLoadingStudent(true)
    try {
      const response = await apiGetUsers(1, 'student', searchStudent, 100)
      if (response.status === 200) {
        setStudent(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoadingStudent(false)
    }
  }

  useEffect(() => {
    if (openStudyGroup) {
      handleGetStudyGroups()
    }
  }, [openStudyGroup, searchStudyGroup])

  useEffect(() => {
    if (openStudent) {
      handleGetStudent()
    }
  }, [openStudent, searchStudent])

  const handleSelectStudyGroup = (studyGroup: StudyGroupInfo) => {
    setSelectedStudyGroup(studyGroup)
    setSearchStudyGroup(`${studyGroup.study_group_name}` || '')
    setOpenStudyGroup(false)
  }

  const handleToggleStudent = (student: UserInfo) => {
    setSelectedStudents((prev) => {
      const isSelected = prev.some((s) => s.code === student.code)
      if (isSelected) {
        return prev.filter((s) => s.code !== student.code)
      } else {
        return [...prev, student]
      }
    })
  }


  const handleAddStudent = async () => {
    setIsLoadingAddStudent(true)
    try {
      if (selectedStudyGroup && selectedStudents.length > 0) {
        const studentCodes = selectedStudents.map((student) => student.code)
        const response = await apiAddStudentToStudyGroup(selectedStudyGroup?.study_group_id || '', {
          student_codes: studentCodes
        })
        if (response.status === 201) {
          toast.success(`Đã thêm ${selectedStudents.length} sinh viên vào lớp ${selectedStudyGroup.study_group_code}`)
          onOpenChange(false)
          setSelectedStudents([])
          setSelectedStudyGroup(null)
          setSearchStudyGroup('')
          setSearchStudent('')
          setOpenStudyGroup(false)
          setOpenStudent(false)
          handleGetStudyGroup()
        }
      } else if (!selectedStudyGroup) {
        toast.error('Vui lòng chọn một lớp học trước khi thêm sinh viên')
      } else {
        toast.error('Vui lòng chọn ít nhất một sinh viên')
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoadingAddStudent(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className='bg-black hover:bg-black/80'>
          <UserPlus className="w-4 h-4" />
          Thêm sinh viên
        </Button>
      </DialogTrigger>
      <DialogContent className='space-y-5'>
        <DialogHeader>
          <DialogTitle className='text-center'>Thêm sinh viên vào lớp</DialogTitle>
        </DialogHeader>
        <div className='space-y-5'>
          <div className='space-y-2'>
            <p className='text-sm font-medium'>Chọn lớp</p>
            <Popover open={openStudyGroup} onOpenChange={(open) => {
              setOpenStudyGroup(open)
              if (!open) {
                setSearchStudyGroup('')
              }
            }}>
              <PopoverTrigger className='w-full'>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={isLoadingStudyGroup}
                >
                  {selectedStudyGroup
                    ? `${selectedStudyGroup.study_group_code} - ${selectedStudyGroup.study_group_name}`
                    : 'Chọn lớp học phần'}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[450px] p-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên, mã lớp hoặc giáo viên..."
                    value={searchStudyGroup}
                    onChange={(e) => setSearchStudyGroup(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isLoadingStudyGroup ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500 mt-2" />
                  </div>
                ) : (
                  <ScrollArea className="h-40 w-full">
                    {studyGroup?.data && studyGroup.data.length > 0 ? (
                      studyGroup.data
                        .map((group) => (
                          <div
                            key={group.study_group_id}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                            onClick={() => handleSelectStudyGroup(group)}
                          >
                            {`${group.study_group_code} - ${group.study_group_name}`}
                          </div>
                        ))
                    ) : (
                      <div className="p-2 text-gray-500 text-center">Không tìm thấy lớp học phần</div>
                    )}
                  </ScrollArea>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div className='space-y-2'>
            <p className='text-sm font-medium'>Chọn sinh viên</p>
            <Popover open={openStudent && selectedStudyGroup !== null} onOpenChange={(open) => {
              setOpenStudent(open)
            }}>
              <PopoverTrigger className='w-full'>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={isLoadingStudent || !selectedStudyGroup}
                >
                  {selectedStudents.length > 0
                    ? `${selectedStudents.length} sinh viên được chọn`
                    : 'Chọn sinh viên'}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[450px] p-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên, mã hoặc email..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isLoadingStudent ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500 mt-2" />
                  </div>
                ) : (
                  <ScrollArea className="h-40 w-full">
                    {student?.data && student.data.length > 0 ? (
                      student.data.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center"
                          onClick={() => handleToggleStudent(user)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.some((s) => s.code === user.code)}
                            onChange={() => handleToggleStudent(user)}
                            className="mr-2"
                          />
                          {`${user.code} - ${user.name}`}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500 text-center">Không tìm thấy sinh viên</div>
                    )}
                  </ScrollArea>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className='flex justify-between space-x-2'>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <div className='flex space-x-2'>
            <Button
              type='button'
              variant="outline"
              onClick={() => setSelectedStudents([])}
            >
              <Import className='w-4 h-4' />
              Import
            </Button>
            <Button
              type='button'
              className="bg-black hover:bg-black/80"
              onClick={handleAddStudent}
              disabled={!selectedStudyGroup || isLoadingAddStudent}
            >
              {isLoadingAddStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Thêm sinh viên'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
}

export default AddStudentDialog
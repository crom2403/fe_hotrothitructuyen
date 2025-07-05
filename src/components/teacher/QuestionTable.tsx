import type { QuestionItem } from "@/types/questionType"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Edit, Eye, Loader2, MoreHorizontal, Search, Trash2 } from "lucide-react"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import Paginate from "../common/Pagination"
import parse from "html-react-parser"
import { useEffect, useState } from "react"
import { Dialog } from "../ui/dialog"
import QuestionDetail from "../admin/question/QuestionDetail"
import useAppStore from "@/stores/appStore"

interface QuestionTableProps {
  questions: QuestionItem[],
  searchTerm: string,
  setSearchTerm: (term: string) => void,
  subjectFilter: string,
  setSubjectFilter: (subject: string) => void,
  typeFilter: string,
  setTypeFilter: (type: string) => void,
  difficultyFilter: string,
  setDifficultyFilter: (difficulty: string) => void,
  page: number,
  totalPages: number,
  handleEdit?: (question: QuestionItem) => void,
  handleDelete?: (questionId: string) => void,
  handlePageClick: (page: number) => void,
  isLoading: boolean,
}

const QuestionTable = ({ questions, searchTerm, setSearchTerm, subjectFilter, setSubjectFilter, typeFilter, setTypeFilter, difficultyFilter, setDifficultyFilter, page, totalPages, handleEdit, handleDelete, handlePageClick, isLoading }: QuestionTableProps) => {
  const { subjects, difficultyLevels, questionTypes } = useAppStore();
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Dễ": return "bg-green-100 text-green-800";
      case "Trung bình": return "bg-yellow-100 text-yellow-800";
      case "Khó": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetail = (question: QuestionItem) => {
    setSelectedQuestion(question);
    setOpenDetail(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách câu hỏi</CardTitle>
        <CardDescription>Tổng cộng {questions.length} câu hỏi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn học</SelectItem>
              {
                subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {
                difficultyLevels.map((difficultyLevel) => (
                  <SelectItem key={difficultyLevel.id} value={difficultyLevel.id}>{difficultyLevel.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {
                questionTypes.map((questionType) => (
                  <SelectItem key={questionType.id} value={questionType.id}>{questionType.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Môn học</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-10 h-10 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={question.content}>
                      {parse(question.content)}
                    </div>
                  </TableCell>
                  <TableCell>{question.subject.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.question_type.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(question.difficulty_level.name)}>
                      {question.difficulty_level.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.created_by.full_name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(question)}>
                          <Eye className="mr-2 h-4 w-4 text-primary" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {
                          question.is_public === false && (
                            <DropdownMenuItem onClick={() => handleEdit?.(question)}>
                              <Edit className="mr-2 h-4 w-4 text-primary" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          )
                        }
                        {
                          question.is_public === false && (
                            <DropdownMenuItem onClick={() => handleDelete?.(question.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                              Xóa
                            </DropdownMenuItem>
                          )
                        }
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {questions.length === 0 && !isLoading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">Không tìm thấy câu hỏi nào</TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </CardContent>

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <QuestionDetail question={selectedQuestion} />
      </Dialog>
      <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />
    </Card>
  )
}

export default QuestionTable
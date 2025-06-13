import type { Question } from "@/types/questionType"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Edit, MoreHorizontal, Search, Trash2 } from "lucide-react"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import Paginate from "../common/Pagination"

interface QuestionTableProps {
  questions: Question[],
  searchTerm: string,
  setSearchTerm: (term: string) => void,
  subjectFilter: string,
  setSubjectFilter: (subject: string) => void,
  typeFilter: string,
  setTypeFilter: (type: string) => void,
  difficultyFilter: string,
  setDifficultyFilter: (difficulty: string) => void,
  page: number,
  setPage: (page: number) => void,
  totalPages: number,
  handleEdit: (question: Question) => void,
  handleDelete: (questionId: string) => void,
  handlePageClick: (page: number) => void,
}

const QuestionTable = ({ questions, searchTerm, setSearchTerm, subjectFilter, setSubjectFilter, typeFilter, setTypeFilter, difficultyFilter, setDifficultyFilter, page, setPage, totalPages, handleEdit, handleDelete, handlePageClick }: QuestionTableProps) => {

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "all" || question.subject === subjectFilter;
    const matchesType = typeFilter === "all" || question.type === typeFilter;
    const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesType && matchesDifficulty;
  })


  const getTypeText = (type: string) => {
    switch (type) {
      case "single": return "Trắc nghiệm 1 đáp án";
      case "multiple": return "Trắc nghiệm nhiều đáp án";
      case "boolean": return "Đúng/Sai";
      case "matching": return "Nối câu";
      case "drag-drop": return "Kéo thả";
      default: return type;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Dễ";
      case "medium": return "Trung bình";
      case "hard": return "Khó";
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
              <SelectItem value="Lập trình Web">Lập trình Web</SelectItem>
              <SelectItem value="Cơ sở dữ liệu">Cơ sở dữ liệu</SelectItem>
              <SelectItem value="Mạng máy tính">Mạng máy tính</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="easy">Dễ</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="hard">Khó</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="single">Trắc nghiệm 1 đáp án</SelectItem>
              <SelectItem value="multiple">Trắc nghiệm nhiều đáp án</SelectItem>
              <SelectItem value="boolean">Đúng/Sai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Môn học</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={question.content}>
                    {question.content}
                  </div>
                </TableCell>
                <TableCell>{question.subject}</TableCell>
                <TableCell>{question.topic}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getTypeText(question.type)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {getDifficultyText(question.difficulty)}
                  </Badge>
                </TableCell>
                <TableCell>{question.points}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(question)}>
                        <Edit className="mr-2 h-4 w-4 text-primary" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(question.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {filteredQuestions.length === 0 && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">Không tìm thấy câu hỏi nào</TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </CardContent>
      <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />
    </Card>
  )
}

export default QuestionTable
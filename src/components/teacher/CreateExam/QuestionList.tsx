import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiCall } from '@/hooks/useApiCall';
import { apiGetDifficultyLevels, apiGetQuestionBank, apiGetQuestionPrivate, apiGetQuestionTypes } from '@/services/teacher/question';
import type { DifficultyLevel } from '@/types/difficultyLevelType';
import type { QuestionItem, QuestionListResponse, QuestionTypeResponse } from '@/types/questionType';
import { Filter, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import parse from 'html-react-parser';
import QuestionFormDialog from '../QuestionFormDialog';
import Pagination from '@/components/common/Pagination';
import { setQuestionsToCache } from '@/utils/questionCache';
import { useDebounce } from '@/hooks/useDebounce';

interface QuestionBankProps {
  selectedQuestions: QuestionItem[];
  addQuestionToExam: (question: QuestionItem) => void;
  selectedSubjectId: string;
}

const QuestionList = ({ selectedQuestions, addQuestionToExam, selectedSubjectId }: QuestionBankProps) => {
  const [availableQuestions, setAvailableQuestions] = useState<QuestionListResponse | null>(null);
  const [privateQuestions, setPrivateQuestions] = useState<QuestionListResponse | null>(null);
  const [isLoadingAvailableQuestions, setIsLoadingAvailableQuestions] = useState(false);
  const [isLoadingPrivateQuestions, setIsLoadingPrivateQuestions] = useState(false);

  const [activeTab, setActiveTab] = useState('question_bank');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageBank, setPageBank] = useState(1);
  const [pagePrivate, setPagePrivate] = useState(1);

  const { data: questionTypes, isLoading: isLoadingQuestionTypes, refetch: refetchQuestionTypes } = useApiCall<QuestionTypeResponse>(() => apiGetQuestionTypes());
  const { data: difficultyLevels, isLoading: isLoadingDifficultyLevels, refetch: refetchDifficultyLevels } = useApiCall<{ data: DifficultyLevel[] }>(() => apiGetDifficultyLevels());

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDebounceSearch = useDebounce(searchTerm, 500);

  const handleGetQuestionsBank = async () => {
    setIsLoadingAvailableQuestions(true);
    try {
      const response = await apiGetQuestionBank(pageBank, searchTerm, selectedSubjectId, typeFilter, difficultyFilter);
      if (response.status === 200) {
        setAvailableQuestions(response.data);
        setQuestionsToCache(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAvailableQuestions(false);
    }
  };

  const handleGetQuestionsPrivate = async () => {
    setIsLoadingPrivateQuestions(true);
    try {
      const response = await apiGetQuestionPrivate(pagePrivate, searchTerm, selectedSubjectId, typeFilter, difficultyFilter, 10);
      if (response.status === 200) {
        setPrivateQuestions(response.data);
        setQuestionsToCache(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingPrivateQuestions(false);
    }
  };

  useEffect(() => {
    setActiveFiltersCount((searchTerm ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (difficultyFilter !== 'all' ? 1 : 0));
  }, [searchTerm, typeFilter, difficultyFilter]);

  useEffect(() => {
    if (activeTab === 'question_bank') {
      handleGetQuestionsBank();
    } else if (activeTab === 'question_private') {
      handleGetQuestionsPrivate();
    }
  }, [activeTab, handleDebounceSearch, typeFilter, difficultyFilter, pageBank, pagePrivate]);

  useEffect(() => {
    refetchQuestionTypes();
    refetchDifficultyLevels();
  }, []);

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDifficultyFilter('all');
    setShowFilters(false);
  };

  const handlePageClickBank = (page: number) => setPageBank(page);
  const handlePageClickPrivate = (page: number) => setPagePrivate(page);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Danh sách câu hỏi</CardTitle>
            <CardDescription>Tìm kiếm và chọn câu hỏi từ danh sách</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            <QuestionFormDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} refetchQuestionsPrivate={handleGetQuestionsPrivate} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar and Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Tìm kiếm theo tên, chủ đề, môn học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            {searchTerm && (
              <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" onClick={() => setSearchTerm('')}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Bộ lọc nâng cao</Label>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                    Xóa tất cả
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Loại câu hỏi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {questionTypes?.data.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả độ khó</SelectItem>
                    {difficultyLevels?.data.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Filter Summary */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs" onClick={() => setSearchTerm('')}>
                  Tìm: "{searchTerm}"
                  <X className="h-4 w-4 ml-1 cursor-pointer" />
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs" onClick={() => setTypeFilter('all')}>
                  {questionTypes?.data.find((t) => t.id === typeFilter)?.name}
                  <X className="h-3 w-3 ml-1 cursor-pointer" />
                </Badge>
              )}
              {difficultyFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs" onClick={() => setDifficultyFilter('all')}>
                  {difficultyLevels?.data.find((d) => d.id === difficultyFilter)?.name}
                  <X className="h-3 w-3 ml-1 cursor-pointer" />
                </Badge>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="question_bank" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="question_bank">Ngân hàng câu hỏi</TabsTrigger>
            <TabsTrigger value="question_private">Câu hỏi của bạn</TabsTrigger>
          </TabsList>
          <TabsContent value="question_bank">
            {isLoadingAvailableQuestions ? (
              <div className="flex items-center justify-center h-52">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableQuestions?.data
                    .filter((question) => question.content.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((question) => (
                      <div key={question.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{parse(question.content)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {question.question_type?.name}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyColor(question.difficulty_level?.name)}`}>{question.difficulty_level?.name || ''}</Badge>
                            </div>
                          </div>
                          <Button className="cursor-pointer" size="sm" onClick={() => addQuestionToExam(question)} disabled={selectedQuestions.some((q) => q.id === question.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {availableQuestions?.data.length === 0 && (
                    <div className="flex items-center justify-center h-52">
                      <p className="text-sm text-gray-500">Không có câu hỏi nào</p>
                    </div>
                  )}
                </div>
                <Pagination page={pageBank} totalPages={availableQuestions?.metadata.last_page || 1} onPageChange={handlePageClickBank} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="question_private">
            {isLoadingPrivateQuestions ? (
              <div className="flex items-center justify-center h-52">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {privateQuestions?.data
                    .filter((question) => question.content.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((question) => (
                      <div key={question.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{parse(question.content)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {question.question_type.name}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyColor(question.difficulty_level.name)}`}>{question.difficulty_level.name}</Badge>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => addQuestionToExam(question)} disabled={selectedQuestions.some((q) => q.id === question.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {privateQuestions?.data.length === 0 && (
                    <div className="flex items-center justify-center h-52">
                      <p className="text-sm text-gray-500">Không có câu hỏi nào</p>
                    </div>
                  )}
                </div>
                <Pagination page={pagePrivate} totalPages={privateQuestions?.metadata.last_page || 1} onPageChange={handlePageClickPrivate} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuestionList;

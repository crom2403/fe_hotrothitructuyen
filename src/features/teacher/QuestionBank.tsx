import QuestionTable from '@/components/teacher/QuestionTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { apiGetQuestionBank, apiGetQuestionPrivate } from '@/services/teacher/question';
import type { QuestionListResponse, QuestionItem } from '@/types/questionType';
import { Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useApiCall } from '@/hooks/useApiCall';
import QuestionFormDialog from '@/components/teacher/QuestionFormDialog';

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState('private_question');
  const [searchTermBank, setSearchTermBank] = useState('');
  const [searchTermPrivate, setSearchTermPrivate] = useState('');
  const [subjectFilterBank, setSubjectFilterBank] = useState<string>('all');
  const [subjectFilterPrivate, setSubjectFilterPrivate] = useState<string>('all');
  const [difficultyFilterBank, setDifficultyFilterBank] = useState<string>('all');
  const [difficultyFilterPrivate, setDifficultyFilterPrivate] = useState<string>('all');
  const [typeFilterBank, setTypeFilterBank] = useState<string>('all');
  const [typeFilterPrivate, setTypeFilterPrivate] = useState<string>('all');
  const [pageBank, setPageBank] = useState(1);
  const [pagePrivate, setPagePrivate] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const getQuestionsBank = useCallback(
    () => apiGetQuestionBank(pageBank, searchTermBank, subjectFilterBank, typeFilterBank, difficultyFilterBank),
    [searchTermBank, pageBank, subjectFilterBank, typeFilterBank, difficultyFilterBank],
  );

  const getQuestionsPrivate = useCallback(
    () => apiGetQuestionPrivate(pagePrivate, searchTermPrivate, subjectFilterPrivate, typeFilterPrivate, difficultyFilterPrivate),
    [pagePrivate, subjectFilterPrivate, typeFilterPrivate, difficultyFilterPrivate, searchTermPrivate],
  );

  const { data: questionsBank, isLoading: isLoadingBank, refetch: refetchQuestionsBank } = useApiCall<QuestionListResponse>(getQuestionsBank);
  const { data: questionsPrivate, isLoading: isLoadingPrivate, refetch: refetchQuestionsPrivate } = useApiCall<QuestionListResponse>(getQuestionsPrivate);

  useEffect(() => {
    if (activeTab === 'private_question') {
      refetchQuestionsPrivate();
    } else if (activeTab === 'question_bank') {
      refetchQuestionsBank();
    }
  }, [activeTab, refetchQuestionsPrivate, refetchQuestionsBank]);

  const handleEdit = (question: QuestionItem) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
  };

  // const handleDelete = (questionId: string) => {
  //   // TODO: Implement delete logic
  // };

  const handlePageClickBank = (page: number) => setPageBank(page);
  const handlePageClickPrivate = (page: number) => setPagePrivate(page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý các câu hỏi của bạn</h1>
          <p className="text-gray-500">Quản lý và tạo các câu hỏi cho bài thi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <QuestionFormDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            editingQuestion={editingQuestion}
            setEditingQuestion={setEditingQuestion}
            refetchQuestionsPrivate={refetchQuestionsPrivate}
          />
        </div>
      </div>

      <Tabs defaultValue="private_question" onValueChange={setActiveTab}>
        <TabsList className="w-full space-x-4">
          <TabsTrigger value="private_question">Câu hỏi riêng</TabsTrigger>
          <TabsTrigger value="question_bank">Ngân hàng câu hỏi</TabsTrigger>
        </TabsList>

        <TabsContent value="private_question">
          <QuestionTable
            questions={questionsPrivate?.data || []}
            searchTerm={searchTermPrivate}
            setSearchTerm={setSearchTermPrivate}
            subjectFilter={subjectFilterPrivate}
            setSubjectFilter={setSubjectFilterPrivate}
            typeFilter={typeFilterPrivate}
            setTypeFilter={setTypeFilterPrivate}
            difficultyFilter={difficultyFilterPrivate}
            setDifficultyFilter={setDifficultyFilterPrivate}
            page={pagePrivate}
            totalPages={questionsPrivate?.metadata.last_page || 1}
            handleEdit={handleEdit}
            // handleDelete={handleDelete}
            handlePageClick={handlePageClickPrivate}
            isLoading={isLoadingPrivate}
          />
        </TabsContent>

        <TabsContent value="question_bank">
          <QuestionTable
            questions={questionsBank?.data || []}
            searchTerm={searchTermBank}
            setSearchTerm={setSearchTermBank}
            subjectFilter={subjectFilterBank}
            setSubjectFilter={setSubjectFilterBank}
            typeFilter={typeFilterBank}
            setTypeFilter={setTypeFilterBank}
            difficultyFilter={difficultyFilterBank}
            setDifficultyFilter={setDifficultyFilterBank}
            page={pageBank}
            totalPages={questionsBank?.metadata.last_page || 1}
            handleEdit={handleEdit}
            // handleDelete={handleDelete}
            handlePageClick={handlePageClickBank}
            isLoading={isLoadingBank}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionBank;

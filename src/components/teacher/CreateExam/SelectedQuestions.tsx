import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card";
import type { QuestionItem } from "@/types/questionType";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import parse from "html-react-parser";

interface SelectedQuestionsProps {
  selectedQuestions: QuestionItem[];
  setSelectedQuestions: (questions: QuestionItem[]) => void;
  removeQuestionFromExam: (questionId: string) => void;
}


const SelectedQuestions = ({ selectedQuestions, setSelectedQuestions, removeQuestionFromExam }: SelectedQuestionsProps) => {

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedQuestions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedQuestions(items);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Câu hỏi đã chọn ({selectedQuestions.length})</CardTitle>
        <CardDescription>Kéo thả để sắp xếp thứ tự</CardDescription>
      </CardHeader>
      <CardContent>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 max-h-96 overflow-y-auto"
            >
              {selectedQuestions.map((question, index) => (
                <Draggable key={question.id} draggableId={question.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-4 w-4 text-gray-400 mt-1" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{parse(question.content)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {question.question_type.name}
                            </Badge>
                            <span className="text-xs text-gray-500">{question.difficulty_level.name}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-500 hover:text-white"
                          onClick={() => removeQuestionFromExam(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  )
}

export default SelectedQuestions
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Answer, Question } from '@/services/student/interfaces/exam.interface';

// Component cho câu hỏi Multiple Select
function MultipleSelectQuestion({ question, selectedAnswers, onAnswerChange }: { question: Question; selectedAnswers: string[]; onAnswerChange: (answers: string[]) => void }) {
  const handleCheckboxChange = (checked: boolean, value: string) => {
    if (checked) {
      onAnswerChange([...selectedAnswers, value]);
    } else {
      onAnswerChange(selectedAnswers.filter((a) => a !== value));
    }
  };

  return (
    <div className="space-y-3">
      {question.answers.map((answer: Answer) => (
        <div key={answer.id} className="flex items-center space-x-2">
          <Checkbox
            id={`${question.id}-${answer.id}`}
            checked={selectedAnswers.includes(answer.content.value || answer.content.text || '')}
            onCheckedChange={(checked: boolean) => handleCheckboxChange(checked, answer.content.value || answer.content.text || '')}
          />
          <Label htmlFor={`${question.id}-${answer.id}`} className="cursor-pointer">
            {answer.content.text || 'Không có nội dung'}
          </Label>
        </div>
      ))}
    </div>
  );
}

export default MultipleSelectQuestion;

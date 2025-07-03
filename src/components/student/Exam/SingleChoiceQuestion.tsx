import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Answer, Question } from '@/services/student/interfaces/exam.interface';

// Component cho câu hỏi Single Choice
function SingleChoiceQuestion({ question, selectedAnswer, onAnswerChange }: { question: Question; selectedAnswer: string; onAnswerChange: (value: string) => void }) {
  return (
    <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange}>
      {question.answers.map((answer: Answer) => (
        <div key={answer.id} className="flex items-center space-x-2">
          <RadioGroupItem value={answer.content.value || answer.content.text || ''} id={`${question.id}-${answer.id}`} />
          <Label htmlFor={`${question.id}-${answer.id}`} className="cursor-pointer">
            {answer.content.text || 'Không có nội dung'}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export default SingleChoiceQuestion;

import type { Question } from '@/services/student/interfaces/exam.interface';
import { GripVertical } from 'lucide-react';
import { useState } from 'react';

// Component cho câu hỏi Drag and Drop
function DragDropQuestion({ question, answers, onAnswerChange }: { question: Question; answers: Record<string, string>; onAnswerChange: (answers: Record<string, string>) => void }) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (draggedItem) {
      onAnswerChange({
        ...answers,
        [draggedItem]: zoneId,
      });
      setDraggedItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium">Kéo các item vào zone phù hợp:</h4>
      <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        {question.answers
          .filter((answer) => !answers[answer.id])
          .map((answer) => (
            <div
              key={answer.id}
              draggable
              onDragStart={(e) => handleDragStart(e, answer.id)}
              className="px-3 py-2 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 transition-colors"
            >
              <GripVertical className="h-4 w-4 inline mr-2" />
              <span>{answer.content.text || 'Không có nội dung'}</span>
            </div>
          ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {question.answers.map((zone) => (
          <div key={zone.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, zone.id)} className="min-h-24 p-4 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50">
            <h5 className="font-medium mb-2">{zone.content.text || 'Không có nội dung'}</h5>
            <div className="space-y-2">
              {Object.entries(answers)
                .filter(([_, zoneId]) => zoneId === zone.id)
                .map(([itemId]) => {
                  const item = question.answers.find((a) => a.id === itemId);
                  return item ? (
                    <div key={itemId} className="px-2 py-1 bg-green-100 border border-green-300 rounded text-sm">
                      {item.content.text}
                    </div>
                  ) : null;
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DragDropQuestion;

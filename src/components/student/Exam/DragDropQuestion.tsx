import { GripVertical } from 'lucide-react';
import { useState } from 'react';

export interface QuesionDrapDrop {
  id: string;
  content: string;
  question_type: { code: string };
  answer_config: {
    zones: { text: string; value: string }[];
    correct?: { id: string; zone: string; value: string }[];
  };
  answers: { content: { text: string; value: string }; order_index: number }[];
}

function DragDropQuestion({ question, answers, onAnswerChange }: { question: QuesionDrapDrop; answers: Record<string, string[]>; onAnswerChange: (answers: Record<string, string[]>) => void }) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, value: string) => {
    setDraggedItem(value);
    e.dataTransfer.effectAllowed = 'move';
    console.log('Dragging item:', value);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, zoneValue: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    console.log('Dropped item:', draggedItem, 'into zone:', zoneValue);

    const selectedAnswer = question.answers.find((answer) => answer.content.value === draggedItem);
    if (!selectedAnswer) {
      console.error('Selected answer not found for value:', draggedItem);
      return;
    }

    // Tạo bản sao của answers
    const newAnswers = { ...answers };

    // Nếu thả vào vùng kéo thả ban đầu (zoneValue = ''), xóa item khỏi zone hiện tại
    if (zoneValue === '') {
      // Tìm và xóa draggedItem khỏi tất cả các zone
      Object.keys(newAnswers).forEach((zone) => {
        newAnswers[zone] = newAnswers[zone].filter((value) => value !== draggedItem);
        if (newAnswers[zone].length === 0) {
          delete newAnswers[zone];
        }
      });
    } else {
      // Xóa draggedItem khỏi zone cũ (nếu có)
      Object.keys(newAnswers).forEach((zone) => {
        newAnswers[zone] = newAnswers[zone].filter((value) => value !== draggedItem);
        if (newAnswers[zone].length === 0) {
          delete newAnswers[zone];
        }
      });

      // Thêm draggedItem vào zone mới
      if (!newAnswers[zoneValue]) {
        newAnswers[zoneValue] = [];
      }
      if (!newAnswers[zoneValue].includes(draggedItem)) {
        newAnswers[zoneValue].push(draggedItem);
      }
    }

    console.log('Updated answers:', JSON.stringify(newAnswers));
    onAnswerChange(newAnswers);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium">Kéo các item vào zone phù hợp:</h4>
      <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, '')}>
        {question.answers
          .filter((answer) => !Object.values(answers).flat().includes(answer.content.value))
          .map((answer) => (
            <div
              key={answer.content.value}
              draggable
              onDragStart={(e) => handleDragStart(e, answer.content.value)}
              className="px-3 py-2 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 transition-colors"
            >
              <GripVertical className="h-4 w-4 inline mr-2" />
              <span>{answer.content.text || 'Không có nội dung'}</span>
            </div>
          ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {question.answer_config.zones.map((zone) => (
          <div key={zone.value} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, zone.value)} className="min-h-24 p-4 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50">
            <h5 className="font-medium mb-2">{zone.text || 'Không có nội dung'}</h5>
            <div className="space-y-2">
              {(answers[zone.value] || []).map((value: string) => {
                const item = question.answers.find((a) => a.content.value === value);
                return item ? (
                  <div
                    key={item.content.value}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.content.value)}
                    className="px-2 py-1 bg-green-100 border border-green-300 rounded text-sm cursor-move hover:bg-green-200 transition-colors"
                  >
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

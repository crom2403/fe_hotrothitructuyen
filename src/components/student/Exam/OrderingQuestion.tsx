import { GripVertical } from 'lucide-react';
import { closestCenter, DndContext, KeyboardSensor, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';
import { useSensor, useSensors } from '@dnd-kit/core';
import { PointerSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import type { Question } from '@/services/student/interfaces/exam.interface';

// Component cho SortableItem
function SortableItem({ id, content, index }: { id: string; content: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 bg-white border rounded-lg shadow-sm cursor-move hover:bg-gray-50">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <span>
          {index + 1}. {content}
        </span>
      </div>
    </div>
  );
}

// Component cho câu hỏi Ordering
function OrderingQuestion({ question, answers, onAnswerChange }: { question: Question; answers: Record<string, number>; onAnswerChange: (answers: Record<string, number>) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [orderingItems, setOrderingItems] = useState<Array<{ id: string; content: string; value: string }>>(
    question.answers
      .map((answer) => ({
        id: answer.id,
        content: answer.content.text || 'Không có nội dung',
        value: answer.content.value || answer.id,
        order: answers[answer.content.value || answer.id] || answer.order_index,
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ id, content, value }) => ({ id, content, value })),
  );

  useEffect(() => {
    // Khi câu hỏi thay đổi, cập nhật lại orderingItems với thứ tự từ answers
    const sortedItems = question.answers
      .map((answer) => ({
        id: answer.id,
        content: answer.content.text || 'Không có nội dung',
        value: answer.content.value || answer.id,
        order: answers[answer.content.value || answer.id] || answer.order_index,
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ id, content, value }) => ({ id, content, value }));

    setOrderingItems(sortedItems);
  }, [question.id, answers]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setOrderingItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Cập nhật answers với thứ tự mới, sử dụng answer.content.value làm key
        const orderMap = newItems.reduce((acc, item, index) => {
          acc[item.value] = index + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log('Updated ordering answers:', orderMap);
        onAnswerChange(orderMap);
        return newItems;
      });
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Kéo thả để sắp xếp theo thứ tự đúng:</h4>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderingItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {orderingItems.map((item, index) => (
              <SortableItem key={item.id} id={item.id} content={item.content} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default OrderingQuestion;

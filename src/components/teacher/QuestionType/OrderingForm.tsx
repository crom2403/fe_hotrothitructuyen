import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { QuestionFormData } from '@/types/questionFormTypes';
import type { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';

interface OrderingFormProps {
  form: UseFormReturn<QuestionFormData>;
  addOption: () => void;
  removeOption: (index: number) => void;
}

const MAX_ITEMS = 7;

const SortableItem = ({ id, index, field, remove }: any) => {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 border rounded bg-white hover:bg-gray-50">
      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" {...attributes} {...listeners} />
      <span className="text-xs text-gray-500">{index + 1}</span>
      <Input className="flex-1" value={field.value} onChange={field.onChange} placeholder={`Mục ${index + 1}`} />
      {index >= 2 && (
        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const OrderingForm = ({ form, addOption, removeOption }: OrderingFormProps) => {
  const { fields, move } = useFieldArray({
    control: form.control,
    name: 'answers',
  });

  const sensors = useSensors(useSensor(PointerSensor));

  // Hàm cập nhật answers và answer_config
  const updateAnswersAndConfig = (updatedFields: typeof fields) => {
    const updatedAnswers = updatedFields.map((item: any, idx) => ({
      ...item,
      content: {
        text: item.content.text,
        value: String.fromCharCode(65 + idx), // Tạo value: A, B, C, ...
      },
      order_index: idx + 1,
    }));

    form.setValue('answers', updatedAnswers);
    form.setValue('answer_config', {
      kind: 'ordering',
      items_count: updatedAnswers.length,
      correct: updatedAnswers.map((item, idx) => ({
        id: item.id,
        value: item.content.value,
        order: idx + 1,
      })),
    });

    console.log('Updated ordering form:', {
      answers: updatedAnswers,
      answer_config: form.getValues('answer_config'),
    });
  };

  // Cập nhật answers và answer_config khi fields thay đổi (thêm/xóa)
  useEffect(() => {
    updateAnswersAndConfig(fields);
  }, [fields.length]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);

      // Cập nhật answers và answer_config
      updateAnswersAndConfig(form.getValues('answers'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Các mục cần sắp xếp</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            addOption();
          }}
          disabled={fields.length >= MAX_ITEMS}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm mục
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`answers.${index}.content.text`}
                render={({ field: itemField }) => (
                  <FormItem>
                    <SortableItem id={field.id} index={index} field={itemField} remove={removeOption} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <FormField
        control={form.control}
        name="answers"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="answer_config.correct"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default OrderingForm;

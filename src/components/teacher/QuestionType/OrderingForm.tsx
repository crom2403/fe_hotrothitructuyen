import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useWatch } from "react-hook-form";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { QuestionFormData } from "@/types/questionType";
import type { UseFormReturn } from "react-hook-form";

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
      <Input className="flex-1" {...field} placeholder={`Mục ${index + 1}`} />
      <Button variant="ghost" size="icon" onClick={() => remove(index)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function OrderingForm({ form }: { form: UseFormReturn<QuestionFormData> }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "orderingItems",
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
      // Cập nhật order cho tất cả items
      const updatedItems = fields.map((item, idx) => ({
        ...item,
        order: idx,
      }));
      form.setValue("orderingItems", updatedItems);
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
          onClick={() => append({ id: crypto.randomUUID(), content: "", order: fields.length })}
          disabled={fields.length >= 7}
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
                name={`orderingItems.${index}.content`} // Sửa cú pháp name
                render={({ field: itemField }) => (
                  <FormItem>
                    <SortableItem id={field.id} index={index} field={itemField} remove={remove} />
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
        name="orderingItems"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
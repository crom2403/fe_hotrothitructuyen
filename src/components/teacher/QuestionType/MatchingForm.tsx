import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { QuestionFormData } from "@/types/questionType";
import { useEffect } from "react";

interface MatchingFormProps {
  form: UseFormReturn<QuestionFormData>;
}

const MAX_PAIRS = 7;

export function MatchingForm({ form }: MatchingFormProps) {
  const leftColumn = useWatch({ control: form.control, name: "leftColumn" }) || [];
  const rightColumn = useWatch({ control: form.control, name: "rightColumn" }) || [];

  useEffect(() => {
    if (leftColumn.length === 0 && rightColumn.length === 0) {
      form.setValue("leftColumn", [""]);
      form.setValue("rightColumn", [""]);
    }
  }, []);

  const addPair = () => {
    form.setValue("leftColumn", [...leftColumn, ""]);
    form.setValue("rightColumn", [...rightColumn, ""]);
  };

  const removePair = (index: number) => {
    const newLeft = [...leftColumn];
    const newRight = [...rightColumn];
    newLeft.splice(index, 1);
    newRight.splice(index, 1);
    form.setValue("leftColumn", newLeft);
    form.setValue("rightColumn", newRight);
  };

  const updateLeft = (index: number, value: string) => {
    const updated = [...leftColumn];
    updated[index] = value;
    form.setValue("leftColumn", updated);
  };

  const updateRight = (index: number, value: string) => {
    const updated = [...rightColumn];
    updated[index] = value;
    form.setValue("rightColumn", updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Các cặp cần nối</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPair}
          disabled={leftColumn.length >= MAX_PAIRS}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm cặp
        </Button>
      </div>

      {leftColumn.map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <FormControl>
            <Input
              value={leftColumn[index]}
              onChange={(e) => updateLeft(index, e.target.value)}
              placeholder={`Cột A - ${index + 1}`}
            />
          </FormControl>

          <ArrowRight className="text-gray-400" />

          <FormControl>
            <Input
              value={rightColumn[index]}
              onChange={(e) => updateRight(index, e.target.value)}
              placeholder={`Cột B - ${index + 1}`}
            />
          </FormControl>

          {leftColumn.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removePair(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <FormField
        control={form.control}
        name="leftColumn"
        render={() => <FormItem><FormMessage /></FormItem>}
      />
      <FormField
        control={form.control}
        name="rightColumn"
        render={() => <FormItem><FormMessage /></FormItem>}
      />
    </div>
  );
}

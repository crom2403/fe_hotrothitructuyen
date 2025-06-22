import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuestionFormData } from "@/types/questionType";
import { Plus, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";


interface SingleChoiceFormProps {
  form: UseFormReturn<QuestionFormData>;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, value: string) => void;
  toggleCorrectAnswer: (index: number) => void;
}

export function SingleChoiceForm({
  form,
  addOption,
  removeOption,
  updateOption,
  toggleCorrectAnswer,
}: SingleChoiceFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Phương án trả lời</FormLabel>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm phương án
        </Button>
      </div>

      <FormField
        control={form.control}
        name="options"
        render={({ field }) => (
          <FormItem>
            <div className="space-y-3">
              {field.value.map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <FormField
                    control={form.control}
                    name="correctAnswers"
                    render={({ field: correctField }) => (
                      <FormControl>
                        <RadioGroup
                          value={correctField.value[0]?.toString() || ""}
                          onValueChange={(value) => toggleCorrectAnswer(Number.parseInt(value))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} className="border-gray-700" />
                          </div>
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                  <FormControl>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Phương án ${index + 1}`}
                      className="flex-1"
                    />
                  </FormControl>
                  {field.value.length > 2 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="correctAnswers"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
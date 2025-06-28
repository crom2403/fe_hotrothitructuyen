import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuestionFormData } from "@/types/questionType";
import { Plus, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

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
  // Theo dõi correctAnswers để đồng bộ radio button
  const correctAnswers = useWatch({
    control: form.control,
    name: "correctAnswers",
    defaultValue: [],
  });

  // Theo dõi options để giới hạn số lượng
  const options = useWatch({
    control: form.control,
    name: "options",
    defaultValue: [],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Phương án trả lời</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          disabled={options.length >= 4}
        >
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
                    render={() => (
                      <FormControl>
                        <RadioGroup
                          value={correctAnswers[0]?.toString() || ""} // Controlled component
                          onValueChange={(value) => {
                            const newIndex = Number.parseInt(value);
                            if (!isNaN(newIndex)) {
                              form.setValue("correctAnswers", [newIndex]); // Cập nhật trực tiếp qua form
                              toggleCorrectAnswer(newIndex); // Gọi hàm toggle để đồng bộ
                            }
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${index}`}
                              className="border-gray-700"
                            />
                            <label htmlFor={`option-${index}`}></label>
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
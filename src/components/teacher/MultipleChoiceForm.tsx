import type { QuestionFormData } from "@/features/teacher/QuestionBank";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

interface MultipleChoiceFormProps {
  form: UseFormReturn<QuestionFormData>;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, value: string) => void;
  toggleCorrectAnswer: (index: number) => void;
}

const MultipleChoiceForm = ({ form, addOption, removeOption, updateOption, toggleCorrectAnswer }: MultipleChoiceFormProps) => {
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
              {
                field.value.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FormField 
                      control={form.control}
                      name="correctAnswers"
                      render={({ field: correctField }) => (
                        <FormControl>
                          <Checkbox 
                            checked={correctField.value.includes(index)}
                            onCheckedChange={() => toggleCorrectAnswer(index)}
                            className="border-gray-700"
                          />
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
                ))
              }
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
  )
}

export default MultipleChoiceForm
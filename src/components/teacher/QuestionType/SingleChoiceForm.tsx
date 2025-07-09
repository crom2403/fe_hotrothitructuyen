import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuestionFormData, AnswerItem } from "@/types/questionFormTypes";
import { Plus, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

export interface SingleChoiceFormProps {
  form: UseFormReturn<QuestionFormData>;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, text: string, value?: string) => void;
  toggleCorrectAnswer: (index: number) => void;
}

const SingleChoiceForm = ({
  form,
  addOption,
  removeOption,
  updateOption,
  toggleCorrectAnswer,
}: SingleChoiceFormProps) => {
  const answers = useWatch({
    control: form.control,
    name: "answers",
    defaultValue: [],
  });

  const correctAnswer = useWatch({
    control: form.control,
    name: "answer_config.correct",
    defaultValue: "",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Phương án trả lời</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            addOption();
          }}
          disabled={answers.length >= 4}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm phương án
        </Button>
      </div>

      <FormField
        control={form.control}
        name="answers"
        render={({ field }) => (
          <FormItem>
            <div className="space-y-3">
              {field.value.map((answer: AnswerItem, index: number) => (
                <div key={answer.id} className="flex items-center gap-3">
                  <FormControl>
                    <RadioGroup
                      value={correctAnswer as string}
                      onValueChange={() => toggleCorrectAnswer(index)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={("value" in answer.content && answer.content.value) || String.fromCharCode(65 + index)}
                          id={`answer-${answer.id}`}
                          className="border-gray-700"
                        />
                        <label htmlFor={`answer-${answer.id}`}>
                          {("value" in answer.content && answer.content.value) || String.fromCharCode(65 + index)}
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormControl>
                    <Input
                      value={("text" in answer.content && answer.content.text) || ""}
                      onChange={(e) => updateOption(index, e.target.value, String.fromCharCode(65 + index))}
                      placeholder={`Phương án ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                  </FormControl>
                  {field.value.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        removeOption(index);
                      }}
                    >
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
        name="answer_config.correct"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default SingleChoiceForm;
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { QuestionFormData, AnswerItem } from "@/types/questionFormTypes";

interface MatchingFormProps {
  form: UseFormReturn<QuestionFormData>;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateMatchContent: (index: number, left: string, right: string) => void;
}

const MAX_PAIRS = 7;

const MatchingForm = ({ form, addOption, removeOption, updateMatchContent }: MatchingFormProps) => {
  const answers = useWatch({
    control: form.control,
    name: "answers",
    defaultValue: [],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Các cặp cần nối</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            addOption();
          }}
          disabled={answers.length >= MAX_PAIRS}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm cặp
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
                    <Input
                      value={"left" in answer.content ? answer.content.left : ""}
                      onChange={(e) => updateMatchContent(index, e.target.value, "right" in answer.content ? answer.content.right : "")}
                      placeholder={`Cột A - ${index + 1}`}
                      className="flex-1"
                    />
                  </FormControl>
                  <ArrowRight className="text-gray-400" />
                  <FormControl>
                    <Input
                      value={"right" in answer.content ? answer.content.right : ""}
                      onChange={(e) => updateMatchContent(index, "left" in answer.content ? answer.content.left : "", e.target.value)}
                      placeholder={`Cột B - ${index + 1}`}
                      className="flex-1"
                    />
                  </FormControl>
                  {field.value.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
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
        name="answer_config.pairs"
        render={() => <FormItem><FormMessage /></FormItem>}
      />
      <FormField
        control={form.control}
        name="answer_config.correct"
        render={() => <FormItem><FormMessage /></FormItem>}
      />
    </div>
  );
};

export default MatchingForm;
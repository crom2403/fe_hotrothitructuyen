import { useEffect, useState } from "react";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useFormContext, useWatch } from "react-hook-form";
import type { QuestionFormData, AnswerItem } from "@/types/questionFormTypes";
import { toast } from "sonner";

const MAX_ZONES = 10;
const MIN_ANSWERS = 2;
const MAX_ANSWERS = 20;

interface DragDropFormProps {
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, text: string, value?: string) => void;
}

const DragDropForm = ({ addOption, removeOption, updateOption }: DragDropFormProps) => {
  const { control, setValue, formState: { errors } } = useFormContext<QuestionFormData>();
  const answers = useWatch({ control, name: "answers" }) || [];
  const zones = useWatch({ control, name: "answer_config.zones" }) || [];
  const correctMap = useWatch({ control, name: "answer_config.correct" }) || [];
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [newAnswerText, setNewAnswerText] = useState<string>("");

  useEffect(() => {
    if (zones.length === 0) {
      setValue("answer_config.zones", ["Vùng 1"]);
      setValue("answer_config.correct", []);
    }

  }, [zones, answers, correctMap, setValue]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    if (!draggedId) return;
    const answer = answers.find((a: AnswerItem) => a.id === draggedId);
    if (!answer) return;

    const updatedCorrect = correctMap.filter((c) => c.id !== draggedId);
    updatedCorrect.push({
      id: draggedId,
      zone,
      value: "value" in answer.content ? answer.content.value || answer.content.text :  "text" in answer.content && answer.content.text ? answer.content.text : "",
    });
    setValue("answer_config.correct", updatedCorrect);
    setDraggedId(null);
  };

  const handleAddZone = () => {
    if (zones.length >= MAX_ZONES) {
      toast.error(`Tối đa ${MAX_ZONES} vùng!`);
      return;
    }
    const newZone = `Vùng ${zones.length + 1}`;
    const newZones = [...zones, newZone];
    setValue("answer_config.zones", newZones);
  };

  const handleRemoveZone = (index: number) => {
    if (zones.length <= 1) {
      toast.error("Phải có ít nhất 1 vùng!");
      return;
    }
    const zoneToRemove = zones[index];
    const newZones = zones.filter((_, i) => i !== index);
    const newCorrect = correctMap.filter((c) => c.zone !== zoneToRemove);
    setValue("answer_config.zones", newZones);
    setValue("answer_config.correct", newCorrect);
  };

  const handleZoneNameChange = (index: number, value: string) => {
    const newZones = [...zones];
    const oldName = newZones[index];
    newZones[index] = value || `Vùng ${index + 1}`;
    setValue("answer_config.zones", newZones);
    const newCorrect = correctMap.map((c) => (c.zone === oldName ? { ...c, zone: newZones[index] } : c));
    setValue("answer_config.correct", newCorrect);
  };

  const handleRemoveAnswerFromZone = (answerId: string, zone: string) => {
    const newCorrect = correctMap.filter((c) => c.id !== answerId);
    setValue("answer_config.correct", newCorrect);
  };

  const handleAddAnswer = () => {
    if (!newAnswerText.trim()) {
      toast.error("Vui lòng nhập nội dung lựa chọn!");
      return;
    }
    if (answers.length >= MAX_ANSWERS) {
      toast.error(`Tối đa ${MAX_ANSWERS} lựa chọn!`);
      return;
    }
    addOption();
    updateOption(answers.length, newAnswerText.trim());
    setNewAnswerText("");
  };

  const availableAnswers = answers.filter((a) => !correctMap.find((c) => c.id === a.id));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FormLabel>Nhập danh sách lựa chọn (kéo vào vùng phù hợp)</FormLabel>
        <FormField
          control={control}
          name="answers"
          render={() => (
            <FormItem>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Nhập nội dung lựa chọn"
                  value={newAnswerText}
                  onChange={(e) => setNewAnswerText(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddAnswer}
                  disabled={!newAnswerText.trim() || answers.length >= MAX_ANSWERS}
                >
                  <Plus className="h-4 w-4 mr-2" /> Thêm lựa chọn
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 border p-4 rounded-lg border-dashed border-gray-300">
                {answers.length > 0 ? (
                  answers.map((a: AnswerItem, index: number) => (
                    <div
                      key={a.id}
                      draggable={!correctMap.find((c) => c.id === a.id)}
                      onDragStart={(e) => !correctMap.find((c) => c.id === a.id) && handleDragStart(e, a.id)}
                      className={`px-3 py-2 rounded border flex items-center gap-2 ${correctMap.find((c) => c.id === a.id)
                          ? "bg-gray-200 border-gray-300 cursor-not-allowed"
                          : "cursor-move bg-blue-100 border-blue-300 hover:bg-blue-200"
                        }`}
                    >
                      <GripVertical
                        className={`h-4 w-4 ${correctMap.find((c) => c.id === a.id) ? "text-gray-400" : "text-blue-500"
                          }`}
                      />
                      <Input
                        value={"text" in a.content ? a.content.text : ""}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Mục ${index + 1}`}
                        className="flex-1 border-none bg-transparent"
                        disabled={correctMap.find((c) => c.id === a.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        disabled={answers.length <= MIN_ANSWERS}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Chưa có lựa chọn nào</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Danh sách vùng (zone)</FormLabel>
          <Button onClick={handleAddZone} type="button" size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Thêm vùng
          </Button>
        </div>
        <FormField
          control={control}
          name="answer_config.zones"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-dashed border-gray-400 rounded bg-gray-50 min-h-24"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, zone)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        placeholder={`Tên vùng ${index + 1}`}
                        value={zone}
                        onChange={(e) => handleZoneNameChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveZone(index)}
                        disabled={zones.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {correctMap
                        .filter((c) => c.zone === zone)
                        .map((c) => {
                          const answer = answers.find((a) => a.id === c.id);
                          return (
                            <div
                              key={c.id}
                              className="bg-green-100 border border-green-300 px-2 py-1 rounded text-sm flex items-center justify-between"
                            >
                              <span>{"text" in answer?.content ? answer.content.text : ""}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAnswerFromZone(c.id, zone)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="answer_config.correct"
          render={() => <FormItem><FormMessage /></FormItem>}
        />
      </div>
    </div>
  );
};

export default DragDropForm;
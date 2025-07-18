import type { QuestionItem } from "@/types/questionType";

interface DragDropDetailProps {
  question: QuestionItem | null;
}

const DragDropDetail = ({ question }: DragDropDetailProps) => {
  const zones = question?.answer_config?.zones || [];
  const correctPairs = question?.answer_config?.correct || [];
  const answers = question?.answers || [];

  const answerMap: Record<string, string> = {};
  answers.forEach((answer) => {
    answerMap[answer.content.value] = answer.content.text;
  });

  const zoneItems: Record<string, string[]> = {};
  zones.forEach((zone) => {
    zoneItems[zone.value] = correctPairs
      .filter((pair) => pair.zone === zone.value)
      .map((pair) => answerMap[pair.value] || 'N/A');
  });

  return (
    <div className="space-y-4">
      <p className="font-semibold">Vùng thả và các lựa chọn đúng:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {
          zones.map((zone) => (
            <div key={zone.value} className="space-y-2 rounded-lg p-1 border-2 border-gray-300 border-dashed">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 pl-2">
                {zone.text}
              </h5>
              <div className="p-3 rounded-b-lg bg-white space-y-2">
                {
                  zoneItems[zone.value]?.length > 0 ? (
                    zoneItems[zone.value].map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-green-50 border border-green-200 rounded-md flex justify-between items-center"
                      >
                        <span className="font-medium">{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic">Chưa có lựa chọn</div>
                  )
                }
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default DragDropDetail
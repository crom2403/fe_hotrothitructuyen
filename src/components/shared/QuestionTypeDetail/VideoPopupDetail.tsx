import { useRef } from "react";
import type { QuestionItem } from "@/types/questionType";
import { Badge } from "@/components/ui/badge";

interface VideoPopupDetailProps {
  question: QuestionItem | null;
}

const VideoPopupDetail = ({ question }: VideoPopupDetailProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const popupTimes = question?.answer_config?.popup_times || [];
  const answers = question?.answers || [];
  const videoUrl = question?.answer_config.url || '';

  // const answerMap: Record<string, string> = {};
  // answers.forEach((answer) => {
  //   answerMap[answer.content.value] = answer.content.text;
  // });

  return (
    <div className="space-y-4">
      <p className="font-semibold">Video và câu hỏi:</p>
      <div className="relative">
        {videoUrl && (
          <video
            ref={videoRef}
            controls
            className="w-full h-auto rounded-lg border border-gray-200"
          >
            <source src={videoUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video này.
          </video>
        )}
        {
          popupTimes.map((popup, index) => (
            <div
              key={popup.id}
              className="mt-2 p-4 border border-gray-300 rounded-lg bg-white shadow-sm"
            >
              <p className="font-medium text-gray-700">
                Câu hỏi {index + 1} (tại {popup.time}s): {popup.question}
              </p>
              <div className="mt-2 space-y-2">
                {
                  popup.options.map((option) => (
                    <div
                      key={option.value}
                      className={`p-2 rounded-md border flex justify-between items-center ${option.value === popup.correct
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                        }`}
                    >
                      <span className="font-medium">
                        {option.text}
                      </span>
                      {
                        option.value === popup.correct && (
                          <Badge className="bg-green-600 text-white">
                            Đúng
                          </Badge>
                        )
                      }
                    </div>
                  ))
                }
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default VideoPopupDetail
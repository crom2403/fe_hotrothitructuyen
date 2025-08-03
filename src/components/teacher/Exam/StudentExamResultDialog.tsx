import Loading from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import type { StudentExamResult } from "@/types/ExamStudyGroupType";

interface StudentExamResultDialogProps {
  studentExamResult: StudentExamResult | undefined;
  isLoading: boolean;
  isTeacher?: boolean;
}

const StudentExamResultDialog = ({ studentExamResult, isLoading, isTeacher = false }: StudentExamResultDialogProps) => {

  if (!studentExamResult) {
    return <div className="text-center py-4 text-muted-foreground"></div>;
  }

  const getAnswerColor = (isCorrect: boolean, isStudentAnswer: boolean) => {
    if (isTeacher) {
      if (isStudentAnswer) {
        return isCorrect ? "bg-green-50 border border-green-500" : "bg-red-100 border border-red-500";
      }
      return isCorrect ? "bg-green-50 border border-green-500" : "bg-transparent border border-gray-200";
    } else {
      if (isStudentAnswer) {
        return isCorrect ? "bg-yellow-50 border border-yellow-500" : "bg-yellow-50 border border-yellow-500";
      }
      return "bg-transparent border border-gray-200";
    }
  };

  return (
    <DialogContent className="min-w-[60vw] max-w-[1200px] max-h-[90vh] overflow-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">Chi tiết bài thi</DialogTitle>
      </DialogHeader>

      {isLoading ?
        (<div className="flex justify-center items-center h-full">
          <Loading />
        </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-primary">
                {studentExamResult.exam_name} - {studentExamResult.subject_name} ({studentExamResult.test_type})
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <p>Thí sinh: <span className="font-medium">{studentExamResult.student_name}</span></p>
                <p>Thời gian nộp: {new Date(studentExamResult.submitted_at).toLocaleString("vi-VN")}</p>
                <p>Số lần chuyển tab: {studentExamResult.tab_switch_count}</p>
                <p>
                  Số câu đúng: {studentExamResult.questions.filter((q) => q.is_correct).length} / {studentExamResult.total_questions}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {studentExamResult.questions.map((q) => (
              <Card key={q.question_id} className="border rounded-lg shadow-sm mb-4">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground">Câu hỏi {q.order_index}</p>
                    <Badge className={q.is_correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {q.is_correct ? "Đúng" : "Sai"}
                    </Badge>
                  </div>
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />

                  {q.question_type === "single_choice" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Các đáp án:</p>
                      <div className="pl-4 space-y-2">
                        {q.answers.map((answer) => {
                          const isStudentAnswer = answer.content.value === q.answer_data;
                          const isCorrectAnswer = answer.content.value === q.answer_config.correct;
                          return (
                            <div
                              key={answer.id}
                              className={`flex items-center space-x-2 p-2 rounded-lg ${getAnswerColor(isCorrectAnswer, isStudentAnswer)}`}
                            >
                              <span>{answer.content.value}. {answer.content.text}</span>
                              {isStudentAnswer && <span className="text-sm text-muted-foreground">(Bạn chọn)</span>}
                              {isTeacher && isCorrectAnswer && <span className="text-sm text-muted-foreground">(Đáp án đúng)</span>}
                              {!isTeacher && q.is_correct && isStudentAnswer && <span className="text-sm text-muted-foreground">(Đáp án đúng)</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {q.question_type === "multiple_select" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Các đáp án:</p>
                      <div className="pl-4 space-y-2">
                        {q.answers.map((answer) => {
                          const isStudentAnswer = q.answer_data.includes(answer.content.value);
                          const isCorrectAnswer = q.answer_config.correct.includes(answer.content.value);
                          return (
                            <div
                              key={answer.id}
                              className={`flex items-center space-x-2 p-2 rounded-lg ${getAnswerColor(isCorrectAnswer, isStudentAnswer)}`}
                            >
                              <span>{answer.content.text}</span>
                              {isStudentAnswer && <span className="text-sm text-muted-foreground">(Bạn chọn)</span>}
                              {isTeacher && isCorrectAnswer && <span className="text-sm text-muted-foreground">(Đáp án đúng)</span>}
                              {!isTeacher && q.is_correct && isStudentAnswer && <span className="text-sm text-muted-foreground">(Đáp án đúng)</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {q.question_type === "matching" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Câu trả lời của bạn:</p>
                      <div className="pl-4 space-y-2">
                        {Array.isArray(q.answer_data) ? (
                          q.answer_data.map((pair: any, idx: number) => {
                            const correctPair = q.answer_config.correct.find(
                              (c: any) => c.left === pair.left && c.right === pair.right
                            );
                            const isCorrect = !!correctPair;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center space-x-2 p-2 rounded-lg ${isTeacher ? (isCorrect ? "bg-green-50" : "bg-red-100") : "bg-transparent border border-gray-200"}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{pair.left}</span>
                                  <span>→</span>
                                  <span>{pair.right}</span>
                                  {isTeacher && (
                                    <>
                                      {isCorrect ? (
                                        <span className="text-green-600">✔</span>
                                      ) : (
                                        <span className="text-red-600">✖</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-red-500">Dữ liệu câu trả lời không hợp lệ</div>
                        )}
                      </div>
                      {isTeacher && (
                        <>
                          <p className="font-semibold text-sm mt-2">Đáp án đúng:</p>
                          <div className="pl-4 space-y-2">
                            {q.answer_config.correct.map((pair: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg"
                              >
                                <span>{pair.left}</span>
                                <span>→</span>
                                <span>{pair.right}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {q.question_type === "ordering" && (
                    <div className="space-y-4">
                      {q.is_correct ? (
                        <>
                          <p className="font-semibold text-sm mt-2">Đáp án đúng:</p>
                          <ol className="pl-4 list-decimal space-y-2">
                            {q.answer_config.correct
                              .sort((a: any, b: any) => a.order - b.order)
                              .map((item: any, idx: number) => {
                                const answer = q.answers.find((a: any) => a.content.value === item.value);
                                return (
                                  <li key={idx} className="p-2 bg-green-50 rounded">
                                    {answer?.content.text}
                                  </li>
                                );
                              })}
                          </ol>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-sm">Câu trả lời của bạn:</p>
                          <div className="pl-4 space-y-2">
                            {Object.entries(q.answer_data)
                              .sort((a: any, b: any) => a[1] - b[1])
                              .map(([value, order], idx) => {
                                const answer = q.answers.find((a: any) => a.content.value === value);
                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg flex items-center border ${isTeacher ? (order + 1 === q.answer_config.correct.find((c: any) => c.value === value)?.order ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200") : ""}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium text-gray-600 min-w-[24px]">{order}.</span>
                                      <span>{answer?.content.text}</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                          {isTeacher && (
                            <>
                              <p className="font-semibold text-sm mt-4">Đáp án đúng:</p>
                              <div className="pl-4 space-y-2">
                                {q.answer_config.correct
                                  .sort((a: any, b: any) => a.order - b.order)
                                  .map((item: any, idx: number) => {
                                    const answer = q.answers.find((a: any) => a.content.value === item.value);
                                    return (
                                      <div key={idx} className="p-2 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                                        <span className="font-medium text-gray-600 min-w-[24px]">{item.order}.</span>
                                        <span>{answer?.content.text}</span>
                                      </div>
                                    );
                                  })}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {q.question_type === "video_popup" && (
                    <div className="space-y-2">
                      <video
                        controls
                        className="w-full h-64 mb-2"
                        src={q.answer_config.url}
                      />
                      <p className="font-semibold text-sm">Câu hỏi:</p>
                      <div className="pl-4">
                        {q.answer_config.popup_times.map((popup: any) => (
                          <div key={popup.id} className="mb-2">
                            <p>{popup.question}</p>
                            <p className="font-semibold text-sm mt-1 mb-2">Các đáp án:</p>
                            <div className="pl-4 space-y-2">
                              {popup.options.map((option: any) => {
                                const isStudentAnswer = q.answer_data[popup.id] === option.value;
                                const isCorrectAnswer = popup.correct === option.value;
                                return (
                                  <div
                                    key={option.value}
                                    className={`flex items-center space-x-2 p-2 rounded-lg ${getAnswerColor(isCorrectAnswer, isStudentAnswer)}`}
                                  >
                                    <span>{option.value}. {option.text}</span>
                                    {isStudentAnswer && <span className="text-sm text-muted-foreground">(Bạn chọn)</span>}
                                    {isTeacher && isCorrectAnswer && <span className="text-sm text-muted-foreground">(Đáp án đúng)</span>}
                                    {!isTeacher && q.is_correct && isStudentAnswer && <span className="text-sm text-muted-foreground">(Đáp án đúng)</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.question_type === "drag_drop" && (
                    <div className="space-y-4">
                      <p className="font-semibold text-sm">Câu trả lời của bạn:</p>
                      <div className="grid gap-4">
                        {Object.entries(q.answer_data).map(([zone, values]: [string, any]) => {
                          const zoneText = q.answer_config.zones.find((z: any) => z.value === zone)?.text;
                          const answers = Array.isArray(values)
                            ? values.map((v) => q.answers.find((a: any) => a.content.value === v)?.content.text).filter(Boolean)
                            : [q.answers.find((a: any) => a.content.value === values)?.content.text].filter(Boolean);

                          return (
                            <div key={zone} className="border rounded-lg p-4 bg-gray-50">
                              <div className="font-medium text-primary mb-2">{zoneText}</div>
                              <div className="flex flex-wrap gap-2">
                                {answers.map((answer, idx) => (
                                  <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                                    {answer}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {isTeacher && (
                        <>
                          <p className="font-semibold text-sm mt-4">Đáp án đúng:</p>
                          <div className="grid gap-4">
                            {q.answer_config.zones.map((zone: any) => {
                              const correctAnswers = q.answer_config.correct
                                .filter((item: any) => item.zone === zone.value)
                                .map((item: any) => q.answers.find((a: any) => a.content.value === item.value)?.content.text)
                                .filter(Boolean);

                              return (
                                <div key={zone.value} className="border rounded-lg p-4 bg-green-50 border-green-200">
                                  <div className="font-medium text-primary mb-2">{zone.text}</div>
                                  <div className="flex flex-wrap gap-2">
                                    {correctAnswers.map((answer, idx) => (
                                      <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-green-300 shadow-sm">
                                        {answer}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}
    </DialogContent>
  );
};

export default StudentExamResultDialog;
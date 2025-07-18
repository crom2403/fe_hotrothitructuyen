import { useEffect, useRef, useState, useLayoutEffect } from "react";
import Xarrow from "react-xarrows";
import type { QuestionItem } from "@/types/questionType";

interface MatchingDetailProps {
  question: QuestionItem | null;
  key: any; 
}

const MatchingDetail = ({ question, key }: MatchingDetailProps) => {
  const leftRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const correctPairs = question?.answer_config.correct || [];
  const answers = question?.answers || [];

  const connections: Record<string, string> = {};
  correctPairs.forEach((pair) => {
    const leftAnswer = answers.find((a) => a.content.left === pair.left);
    const rightAnswer = answers.find((a) => a.content.right === pair.right);
    if (leftAnswer && rightAnswer) {
      connections[leftAnswer.id] = rightAnswer.id;
    }
  });

  // Sử dụng useLayoutEffect để đồng bộ hóa DOM trước khi render
  useLayoutEffect(() => {
    leftRefs.current.clear();
    rightRefs.current.clear();
    if (question) {
      let allRefsFound = true;
      answers.forEach((answer) => {
        const leftEl = document.getElementById(`left-${answer.id}`);
        const rightEl = document.getElementById(`right-${answer.id}`);
        if (leftEl) leftRefs.current.set(answer.id, leftEl as HTMLDivElement);
        if (rightEl) rightRefs.current.set(answer.id, rightEl as HTMLDivElement);
        if (!leftEl || !rightEl) {
          allRefsFound = false;
          console.log(`Missing element for answer ${answer.id}: left=${!!leftEl}, right=${!!rightEl}`);
        }
      });
      console.log("All refs found:", allRefsFound);
      setIsReady(allRefsFound);
    }
  }, [answers, key]); 

  // Theo dõi thay đổi kích thước container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setForceUpdate((prev) => prev + 1);
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [key]);

  // Áp dụng userSelect
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.userSelect = "none";
      container.style.webkitUserSelect = "none";
    }
  }, [key]);

  return (
    <div key={key} ref={containerRef} className="space-y-4">
      <p className="font-semibold">Kết nối các cặp đúng:</p>
      <div className="relative flex justify-between gap-4">
        <div className="w-[33%] space-y-3">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột A</h5>
          {answers.map((answer, index) => (
            <div
              key={answer.id}
              id={`left-${answer.id}`}
              className={`p-3 border rounded-lg flex items-center justify-between gap-2 ${
                connections[answer.id] ? "bg-green-50 border-green-200" : "bg-white border-gray-300"
              }`}
            >
              <span className="font-medium">{answer.content.left}</span>
            </div>
          ))}
        </div>

        <div className="w-[45%] space-y-3">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột B</h5>
          {answers.map((answer, index) => (
            <div
              key={answer.id}
              id={`right-${answer.id}`}
              className={`p-3 border rounded-lg flex items-center justify-between gap-2 ${
                connections[answer.id] ? "bg-green-50 border-green-200" : "bg-white border-gray-300"
              }`}
            >
              <span className="font-medium">{answer.content.right}</span>
            </div>
          ))}
        </div>

        {isReady &&
          Object.entries(connections).map(([leftId, rightId]) => {
            const leftEl = leftRefs.current.get(leftId);
            const rightEl = rightRefs.current.get(rightId);
            return leftEl && rightEl ? (
              <Xarrow
                key={`${leftId}-${rightId}-${forceUpdate}`}
                start={`left-${leftId}`}
                end={`right-${rightId}`}
                color="green"
                strokeWidth={2}
                headSize={6}
                curveness={0.5}
                path="smooth"
                showHead
                startAnchor="right"
                endAnchor="left"
                zIndex={1}
              />
            ) : null;
          })}
      </div>
    </div>
  );
};

export default MatchingDetail;
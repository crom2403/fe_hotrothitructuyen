import { useEffect, useState } from 'react';

import { FlipReveal, FlipRevealItem } from '@/components/ui/flip-reveal';
import type { Student } from '@/components/teacher/Exam/ExamRoomTeacher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const MatrixStudent = ({ students, keyFilter }: { students: Student[]; keyFilter: string }) => {
  const [key, setKey] = useState(keyFilter);
  const [listStudent, setListStudent] = useState<Student[]>(students);

  useEffect(() => {
    setKey(keyFilter);
    setListStudent(students);
  }, [keyFilter, students]);

  return (
    <div className="flex min-h-120 flex-col items-center gap-8">
      <FlipReveal className="grid grid-cols-6 gap-3 sm:gap-4" keys={[key]} showClass="flex" hideClass="hidden">
        {listStudent.map((student) => (
          <FlipRevealItem flipKey={student.studentId}>
            <div className="flex items-center justify-center w-[100px] h-[100px] border rounded-md shadow">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex flex-col items-center justify-center">
                    <div className="size-12">
                      <Avatar className="shadow-lg">
                        <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">{student?.name?.charAt(0) || ''}</AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-xs">{student.name}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="w-full h-full">
                    <p>{student.name}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </FlipRevealItem>
        ))}
      </FlipReveal>
    </div>
  );
};

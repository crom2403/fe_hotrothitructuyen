import { apiGetExamDetail } from "@/services/teacher/exam"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const ExamResultDetail = () => {
  const { exam_id, study_group_id } = useParams()
  const [exam_detail, setExamDetail] = useState<any>([])

  useEffect(() => {
    console.log(exam_id, '-' ,study_group_id)
    handleGetExamDetail()
  },[])

  const handleGetExamDetail = async () => {
    try {
      const response = await apiGetExamDetail(exam_id, study_group_id)
      setExamDetail(response.data)
      console.log(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>ExamResultDetail</div>
  )
}

export default ExamResultDetail
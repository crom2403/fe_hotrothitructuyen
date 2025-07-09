import apiRoutes from "../apiRoutes";
import instance from "../instance";


export const apiGetQuestionTypes = async () => instance.get(apiRoutes.teacher.question + "/type")

export const apiGetDifficultyLevels = async () => instance.get(apiRoutes.difficultyLevel)

export const apiCreateQuestion = async (data: object) => instance.post(apiRoutes.teacher.question + "/create", data)

export const apiGetQuestionBank = async (
  page: number, 
  q?: string,
  subject_id?: string, 
  question_type_id?: string, 
  difficulty_level_id?: string,
  size?: number
) => {
    let query = apiRoutes.teacher.question + `/list?page=${page}&is_public=1&review_status=approved`;
    if (q) {
      query += `&q=${q}`;
    }
    if (subject_id && subject_id !== "all") {
      query += `&subject_id=${subject_id}`;
    }
    if (question_type_id && question_type_id !== "all") {
      query += `&question_type_id=${question_type_id}`;
    }
    if (difficulty_level_id && difficulty_level_id !== "all") {
      query += `&difficulty_level_id=${difficulty_level_id}`;
    }
    if (size) {
      query += `&size=${size}`;
    }
    return instance.get(query);
}

export const apiGetQuestionPrivate = async (
  page: number, 
  q?: string,
  subject_id?: string, 
  question_type_id?: string, 
  difficulty_level_id?: string,
  size?: number
) => {
  let query = apiRoutes.teacher.question + `/list?page=${page}&is_public=0`;
  if (q) {
    query += `&q=${q}`;
  }
  if (subject_id && subject_id !== "all") {
    query += `&subject_id=${subject_id}`;
  }
  if (question_type_id && question_type_id !== "all") {
    query += `&question_type_id=${question_type_id}`;
  }
  if (difficulty_level_id && difficulty_level_id !== "all") {
    query += `&difficulty_level_id=${difficulty_level_id}`;
  }
  if (size) {
    query += `&size=${size}`;
  }
  return instance.get(query);
}

export const apiGetQuestionById = async (id: string) => instance.get(apiRoutes.teacher.question + `/${id}`)
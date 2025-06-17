const path = {
  SERVER_URL: "https://successful-laura-tsondev-c5a7fe4d.koyeb.app",
  PUBLIC: "/",
  HOME: "",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  PROFILE: "/profile",
  ACCESS_DENIED: "/access-denied",
  OTP_CONFIRMATION: "/otp-confirmation",
  ADMIN: {
    OVERVIEW: "/admin/overview",
    STUDY_GROUP: "/admin/study_group",
    QUESTION: "/admin/question",
    USER: "/admin/user",
    SUBJECT: "/admin/subject", // Môn học
    YEAR_SEMESTER: "/admin/year_semester", // Học kỳ
    ASSIGNMENT: "/admin/assignment", // Phân công
    EXAM: "/admin/exam", // Đề kiểm tra
    NOTIFICATION: "/admin/notification", // Thông báo
    PERMISSTION: "/admin/permission", // Phân quyền
  },
  TEACHER: {
    OVERVIEW: "/teacher/overview",
    STUDY_GROUP: "/teacher/study_group",
    QUESTION: "/teacher/question",
    QUESTION_BANK: "/teacher/question_bank",
    USER: "/teacher/user",
    MODULE: "/teacher/module",
    MODULE_DETAIL: "/teacher/module/detail",
    SUBJECT: "/teacher/subject",
    ASSIGNMENT: "/teacher/assignment",
    EXAM: "/teacher/exam",
    NOTIFICATION: "/teacher/notification",
  },
  STUDENT: {
    OVERVIEW: "/student/overview",
    STUDY_GROUP: "/student/study_group",
    EXAM: "/student/exam",
    NOTIFICATION: "/student/notification",
  },
}

export default path

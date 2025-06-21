import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import path from "../utils/path";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import Loading from "../../public/loading.gif"
import OTPConfirmation from "@/components/forgotPassword/OTPConfirmation";

// Lazy load components
const Login = lazy(() => import("@/components/login/login"));
const ForgotPassword = lazy(() => import("@/components/forgotPassword/ForgotPassword"));
const NotFoundPage = lazy(() => import("@/components/notFound/NotFoundPage"));
const TeacherOverview = lazy(() => import("@/features/teacher/Overview"));
const Profile = lazy(() => import("@/components/profile/Profile"));
const QuestionBank = lazy(() => import("@/features/teacher/QuestionBank"));
const AdminOverview = lazy(() => import("@/features/admin/Overview"));
const UserManagement = lazy(() => import("@/features/admin/UserManagement"));
const StudentOverview = lazy(() => import("@/features/student/Overview"));
const SubjectManagement = lazy(() => import("@/features/admin/SubjectManagement"));
const YearSemesterManagement = lazy(() => import("@/features/admin/YearSemesterManagement"));
const AccessDeniedPage = lazy(() => import("@/components/accessDenied/AccessDeniedPage"));
const AdminStudyGroupManagement = lazy(() => import("@/features/admin/StudyGroupManagement"));

const AppRoutes = () => {
  return (
    <Suspense fallback={
      <div className="w-full bg-white h-screen flex items-center justify-center">
        <img
          src={Loading}
          alt="loading..."
          className="w-32 md:w-52"
        />
      </div>
    }>
      <Routes>
        {/* Public routes */}
        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={path.ACCESS_DENIED} element={<AccessDeniedPage />} />
        <Route path={path.OTP_CONFIRMATION} element={<OTPConfirmation />} />
        {/* Protected routes under MainLayout */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["teacher", "admin", "student"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Teacher routes */}
          <Route
            path={path.TEACHER.OVERVIEW}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.TEACHER.QUESTION_BANK}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <QuestionBank />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path={path.ADMIN.OVERVIEW}
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.USER}
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.SUBJECT}
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SubjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.YEAR_SEMESTER}
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <YearSemesterManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path={path.ADMIN.STUDY_GROUP}
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminStudyGroupManagement />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path={path.STUDENT.OVERVIEW}
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentOverview />
              </ProtectedRoute>
            }
          />

          {/* Common routes */}
          <Route
            path={path.PROFILE}
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin", "student"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Access Denied route */}
        <Route path={path.ACCESS_DENIED} element={<AccessDeniedPage />} />

        {/* Not found route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import path from '../utils/path';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '../../public/loading1.gif';
import OTPConfirmation from '@/components/forgotPassword/OTPConfirmation';
import PermissionRole from '@/features/admin/PermissionRole';
import PermissionUser from '@/features/admin/PermissionUser';
import AssignSubject from '@/features/admin/AssignSubject';
import LoadingBar from '@/components/common/LoadingBar';

// Lazy load components
const Login = lazy(() => import('@/components/login/login'));
const ForgotPassword = lazy(() => import('@/components/forgotPassword/ForgotPassword'));
const NotFoundPage = lazy(() => import('@/components/notFound/NotFoundPage'));
const TeacherOverview = lazy(() => import('@/features/teacher/Overview'));
const Profile = lazy(() => import('@/components/profile/Profile'));
const QuestionBank = lazy(() => import('@/features/teacher/QuestionBank'));
const AdminOverview = lazy(() => import('@/features/admin/Overview'));
const UserManagement = lazy(() => import('@/features/admin/UserManagement'));
const StudentOverview = lazy(() => import('@/features/student/Overview'));
const SubjectManagement = lazy(() => import('@/features/admin/SubjectManagement'));
const YearSemesterManagement = lazy(() => import('@/features/admin/YearSemesterManagement'));
const AccessDeniedPage = lazy(() => import('@/components/accessDenied/AccessDeniedPage'));
const AdminStudyGroupManagement = lazy(() => import('@/features/admin/StudyGroupManagement'));
const QuestionManagement = lazy(() => import('@/features/admin/QuestionManagement'));
const CreateExam = lazy(() => import('@/features/teacher/CreateExam'));
const TeacherStudyGroup = lazy(() => import('@/features/teacher/StudyGroup'));
const ExamList = lazy(() => import('@/components/student/ExamList'));
const ExamResults = lazy(() => import('@/components/student/ExamResults'));
const StudentGroup = lazy(() => import('@/components/student/StudentGroup'));
const CreateStudentSocket = lazy(() => import('@/components/student/CreateStudentSocket'));
const IEduLandingPage = lazy(() => import('@/components/landing/IEduLandingPage'));
const ExamRoomStudent = lazy(() => import('@/components/student/ExamRoomStudent'));
const ExamRoomTeacher = lazy(() => import('@/components/teacher/Exam/ExamRoomTeacher'));
const ExamResultManagement = lazy(() => import('@/features/teacher/ExamResultManagement'));
const ExamResultDetail = lazy(() => import('@/components/teacher/Exam/ExamResultDetail'));
const AdminExamManagement = lazy(() => import('@/features/admin/ExamManagement'));
const ExamDetail = lazy(() => import('@/components/shared/ExamDetail'));  
const ReviewQuestion = lazy(() => import('@/features/teacher/ReviewQuestion')); 

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[#f5f7f9] h-screen flex items-center justify-center">
          <img src={Loading} alt="loading..." className="" />
        </div>
      }
    >
      <LoadingBar />
      <Routes>
        {/* Public routes */}
        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={path.ACCESS_DENIED} element={<AccessDeniedPage />} />
        <Route path={path.OTP_CONFIRMATION} element={<OTPConfirmation />} />
        <Route path={path.PUBLIC} element={<IEduLandingPage />} />
        <Route path={path.STUDENT.CREATE_STUDENT_SOCKET} element={<CreateStudentSocket />} />
        <Route path={path.TEACHER.EXAM_ROOM_TEACHER} element={<ExamRoomTeacher />} />

        <Route
          path={path.STUDENT.EXAM_ROOM_STUDENT}
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExamRoomStudent />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path={path.STUDENT.EXAM_TAKING}
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExamTaking />
            </ProtectedRoute>
          }
        /> */}
        {/* Protected routes under MainLayout */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin', 'student']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Teacher routes */}
          <Route
            path={path.TEACHER.OVERVIEW}
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.TEACHER.QUESTION_BANK}
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <QuestionBank />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.TEACHER.EXAM}
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.TEACHER.STUDY_GROUP}
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherStudyGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.TEACHER.EXAM_RESULT}
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ExamResultManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.TEACHER.EXAM_RESULT_DETAIL}
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ExamResultDetail/>
              </ProtectedRoute>
            }
          />
          <Route
            path={path.TEACHER.APPROVE_QUESTION}
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ReviewQuestion/>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path={path.ADMIN.OVERVIEW}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.USER}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.ASSIGN_TEACHER}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AssignSubject />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.SUBJECT}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SubjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.YEAR_SEMESTER}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <YearSemesterManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.STUDY_GROUP}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStudyGroupManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.QUESTION}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <QuestionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.PERMISSTION_ROLE}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PermissionRole />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.PERMISSTION_USER}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PermissionUser />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.ADMIN.EXAM}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminExamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.EXAM_DETAIL}
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <ExamDetail />
              </ProtectedRoute>
            }
          />
          {/* Student routes */}
          <Route
            path={path.STUDENT.OVERVIEW}
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.STUDENT.STUDY_GROUP}
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path={path.STUDENT.EXAM_LIST}
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamList />
              </ProtectedRoute>
            }
          />

          <Route
            path={path.STUDENT.EXAM_RESULTS}
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamResults />
              </ProtectedRoute>
            }
          />

          {/* Common routes */}
          <Route
            path={path.PROFILE}
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin', 'student']}>
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

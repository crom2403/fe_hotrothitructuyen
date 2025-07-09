import useAuthStore from "@/stores/authStore";
import path from "@/utils/path";
import { Navigate, Outlet } from "react-router-dom"

type Role = "teacher" | "admin" | "student" | null;

interface ProtectedRouteProps {
  allowedRoles: Role[]
  children?: React.ReactNode
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { currentUser } = useAuthStore()

  if (!currentUser) {
    return <Navigate to={path.LOGIN} replace />
  }

  if (!allowedRoles.includes(currentUser.role_code as Role)) {
    return <Navigate to={path.ACCESS_DENIED} replace />;
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute
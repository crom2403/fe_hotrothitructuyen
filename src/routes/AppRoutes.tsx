import Login from "@/components/login/Login"
import path from "../utils/path"
import { Routes, Route } from "react-router-dom"
import ForgotPassword from "@/components/forgotPassword/ForgotPassword"
import MainLayout from "@/components/layout/MainLayout"
import Overview from "@/features/teacher/Overview"
import Profile from "@/components/profile/Profile"


const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path={path.LOGIN} element={<Login/>}/>
        <Route path={path.FORGOT_PASSWORD} element={<ForgotPassword/>}/>
        <Route path={path.PUBLIC} element={<MainLayout/>}>
          <Route path={path.TEACHER.OVERVIEW} element={<Overview/>}/>
          <Route path={path.PROFILE} element={<Profile/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default AppRoutes
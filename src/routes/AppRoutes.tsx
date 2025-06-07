import Login from "@/components/login/login"
import path from "../utils/path"
import { Routes, Route } from "react-router-dom"
import ForgotPassword from "@/components/forgotPassword/forgot_password"


const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path={path.LOGIN} element={<Login/>}/>
        <Route path={path.FORGOT_PASSWORD} element={<ForgotPassword/>}/>
      </Routes>
    </>
  )
}

export default AppRoutes
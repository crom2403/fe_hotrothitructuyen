import Login from "@/components/login/login"
import path from "../utils/path"
import { Routes, Route } from "react-router-dom"


const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path={path.LOGIN} element={<Login/>}/>
      </Routes>
    </>
  )
}

export default AppRoutes
import DenyImage from "../../../public/images/svg/deny.svg"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
const AccessDeniedPage = () => {
  const navigate = useNavigate()
  const handleGoBack = () => {
    navigate(-1)
  }
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen py-8 ">
      <img src={DenyImage} alt="deny" className="w-1/2 h-1/2" />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-medium text-center text-red-500">
          Truy cập bị từ chối
        </h1>
        <p className="text-xl text-center ">
          Bạn đang cố truy cập vào trang mà bạn không có quyền truy cập.
        </p>
      </div>
      <Button variant="default" className="mt-4"
        onClick={handleGoBack}
      >
        Quay lại trang trước
      </Button>
    </div>
  )
}

export default AccessDeniedPage
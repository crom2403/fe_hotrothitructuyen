import { useNavigate } from "react-router-dom";
import emoji from "../../../public/images/svg/sad-face.svg"
import { Button } from "../ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate()
  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white">
        <div className="flex flex-col items-center">
          <img src={emoji} alt="404" className="w-36 h-36 animate-bounce" />
          <h1 className="font-bold text-3xl text-blue-600 lg:text-6xl">404</h1>
          <h6 className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl">
            <span className="text-red-500">Oops!</span> Không tìm thấy trang
          </h6>
          <p className="mb-4 text-center text-gray-500 md:text-lg">
            Trang bạn đang tìm kiếm không tồn tại.
          </p>
          <Button
            onClick={handleGoBack}
            className="px-5 py-2 rounded-md text-blue-100 bg-blue-600 hover:bg-blue-700"
          >
            Về trang trước
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage
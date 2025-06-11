import DenyImage from "../../../public/images/svg/deny.svg"
const AccessDeniedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen gap-12 py-8 ">
      <DenyImage />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-medium text-center">
          Truy cập bị từ chối
        </h1>
        <p className="text-xl text-center ">
          Bạn đang cố truy cập vào trang mà bạn không có quyền truy cập.
        </p>
      </div>
    </div>
  )
}

export default AccessDeniedPage
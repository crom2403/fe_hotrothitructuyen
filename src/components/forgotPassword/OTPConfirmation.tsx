import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import Logo from "../../../public/images/svg/logo.svg"
import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { apiResetPassword } from "@/services/auth"
import { toast } from "sonner"
import path from "@/utils/path"
import type { AxiosError } from "axios"

const otpConfirmationSchema = z.object({
  code: z.string().min(6, { message: "Mã OTP phải gồm đúng 6 chữ số" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  new_password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    ),
})

const OTPConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email || "";
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof otpConfirmationSchema>>({
    resolver: zodResolver(otpConfirmationSchema),
    defaultValues: {
      code: "",
      email: email,
      new_password: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof otpConfirmationSchema>) => {
    console.log(data)
    setIsLoading(true)
    try {
      const response = await apiResetPassword({ email: data.email, new_password: data.new_password, code: data.code })
      if (response.status === 201) {
        toast.success("Mật khẩu đã được đặt lại thành công")
        navigate(path.LOGIN)
      } else {
        toast.error(response.data.message || "Đặt lại mật khẩu thất bại")
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

    return (
      <div className="flex flex-col items-center justify-center h-screen gap-5">
        <div className='flex flex-col items-center justify-center gap-2'>
          <img src={Logo} alt="Logo STU" className='w-25 h-25' />
          <p className='text-2xl font-bold mt-4'>Đặt lại mật khẩu với mã OTP đã gửi</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field}
                      className="cursor-not-allowed bg-gray-100 w-[400px] h-[40px] rounded-md"
                      disabled
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã OTP</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} className="w-[40px] h-[40px]" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-4 relative'>
                      <Input
                        type={showPassword ? "text" : "password"}
                        className='w-[400px] h-[40px] rounded-md'
                        placeholder='Mật khẩu mới'
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3 focus:ring-0 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đặt lại mật khẩu"}
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  export default OTPConfirmation
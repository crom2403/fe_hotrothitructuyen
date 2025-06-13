import Logo from '../../../public/images/svg/logo.svg';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import path from '@/utils/path';
import { useState } from 'react';
import { apiGetCurrentUser, apiLogin } from '@/services/auth';
import useAuthStore from '@/stores/authStore';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

const loginSchema = z.object({
  code: z.string()
    .min(1, {
      message: 'Mã sinh viên không được để trống',
    }),
  password: z.string().min(6, {
    message: 'Mật khẩu phải có ít nhất 6 ký tự',
  }),
});

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, getCurrentUser, currentUser } = useAuthStore()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      code: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    try {
      const response = await apiLogin(data);
      if (response.status === 200) {
        const { access_token, refresh_token } = response.data.data;
        login(access_token, refresh_token);
        const res = await apiGetCurrentUser();
        if (res.status === 200) {
          const { data } = res;
          getCurrentUser(data);
          if (currentUser?.role_code === "student") {
            navigate(path.STUDENT.OVERVIEW)
          } else if (currentUser?.role_code === "teacher") {
            navigate(path.TEACHER.OVERVIEW)
          } else if (currentUser?.role_code === "admin") {
            navigate(path.ADMIN.OVERVIEW)
          }
          toast.success("Đăng nhập thành công")
        } else {
          toast.error(res.data.message || "Lấy thông tin người dùng thất bại")
        }
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
    <div className='flex w-full h-screen'>
      <div className='w-full h-full flex items-center justify-center'>
        <div className='justify-center items-center flex'>
          <div className='w-[400px] flex flex-col justify-center gap-4'>
            <div className='flex flex-col items-center mb-4'>
              <div className='flex font-bold text-4xl'>
                <img src={Logo} alt="Logo STU" className='w-25 h-25' />
              </div>
              <p className='uppercase text-2xl font-semibold text-black/70'>Đăng nhập</p>
            </div>
            <Form {...form}>
              <form
                className='flex flex-col gap-4 items-center'
                onSubmit={form.handleSubmit(onSubmit)}
                action='POST'
              >
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex items-center gap-4'>
                          <Input
                            className='bg-gray-100 w-[400px]'
                            placeholder='Mã sinh viên'
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex items-center gap-4 relative'>
                          <Input
                            type={showPassword ? "text" : "password"}
                            className='bg-gray-100 w-[400px]'
                            placeholder='Mật khẩu'
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
                <Button
                  type='submit'
                  className='w-full bg-blue-800 hover:bg-blue-700 text-white px-6'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
                <div className='mt-4 flex justify-between items-center w-full'>
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember">Ghi nhớ đăng nhập</Label>
                  </div>
                  <Button type='button' className='bg-gray-200 hover:bg-gray-300 text-black px-4 ml-4'
                    onClick={() => navigate(path.FORGOT_PASSWORD)}
                  >
                    <TriangleAlert />
                    Quên mật khẩu?
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
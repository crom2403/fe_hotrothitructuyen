import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { ChevronLeft } from 'lucide-react'
import Logo from '../../../public/images/svg/logo.svg'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import path from '@/utils/path'

const forgotPasswordSchema = z.object({
  email: z.string().email({message: "Email không hợp lệ"}),
})

const ForgotPassword = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    console.log(data)
  }

  return (
    <div className='flex flex-col w-full h-screen items-center justify-center gap-7'>
      <div className='flex flex-col items-center justify-center gap-2'>
        <img src={Logo} alt="Logo STU" className='w-25 h-25' />
        <p className='text-2xl font-bold mt-4'>Quên mật khẩu?</p>
        <p className='text-sm text-gray-500'>Nhập email đã được liên kết với tài khoản để lấy lại mật khẩu</p>
      </div>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5' action='POST'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm text-gray-500'>Email</FormLabel>
                  <FormControl>
                    <div>
                      <Input type='email' placeholder='Nhập email' {...field}
                        className='w-[400px] h-[40px] border-2 border-gray-300 rounded-md'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-[400px] h-[40px] bg-primary text-white rounded-md hover:opacity-90'>Gửi</Button>
          </form>
        </Form>
      </div>
      <div className='flex items-center justify-center gap-2 hover:cursor-pointer hover:underline hover:text-blue-500' 
        onClick={() => navigate(path.LOGIN)}
      >
        <ChevronLeft size={20} />
        <p className='text-sm'>Trở về trang đăng nhập</p>
      </div>
    </div>
  )
}

export default ForgotPassword
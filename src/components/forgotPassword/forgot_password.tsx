import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { ChevronLeft, Key } from 'lucide-react'
import Logo from '../../../public/images/png/logo.png'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import path from '@/utils/path'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
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
        {/* <div className='bg-blue-200 w-15 h-15 rounded-full flex items-center justify-center shadow-blue-300 shadow-lg'>
          <Key className='w-7 h-7'/>
        </div> */}
        <img src={Logo} alt="Logo STU" className='w-20' />
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
                </FormItem>
              )}
            />
            <Button type='submit' className='w-[400px] h-[40px] bg-blue-500 text-white rounded-md hover:bg-blue-600'>Gửi</Button>
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
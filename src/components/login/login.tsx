// import STU from '../../assets/images/stu.png';
import LogoSTU from '../../assets/images/Logo_STU.png';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { TriangleAlert } from 'lucide-react';

const loginSchema = z.object({
  student_code: z.string()
    .min(1, {
      message: 'Mã sinh viên không được để trống',
    })
    .regex(/^dh/i, {
      message: 'Mã sinh viên không hợp lệ',
    }),
  password: z.string().min(6, {
    message: 'Mật khẩu phải có ít nhất 6 ký tự',
  }),
});

const Login = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      student_code: '',
      password: '',
    },
  })

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    console.log('Submitted data:', data);
    // Handle login logic here, e.g., API call
  }

  return (
    <div className='flex w-full h-screen'>
      {/* <div className='flex-[60%] bg-gray-100 flex justify-center items-center'>
        <img src={STU} alt='Khuôn viên STU'/>
      </div> */}
      <div className='w-full h-full flex items-center justify-center'>
        <div className='justify-center items-center flex'>
          <div className='w-[400px] flex flex-col justify-center gap-4'>
            <div className='flex flex-col items-center mb-8'>
              <div className='flex font-bold text-4xl'>
                <img src={LogoSTU} alt="Logo STU" className='w-20' />
                <div className='text-[#0d4c89] flex flex-col justify-end'>
                  <p>Test</p>
                </div>
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
                  name='student_code'
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
                        <div className='flex items-center gap-4'>
                          <Input
                            type='password'
                            className='bg-gray-100 w-[400px]'
                            placeholder='Mật khẩu'
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full bg-blue-800 hover:bg-blue-700 text-white px-6'
                >
                  Đăng nhập
                </Button>
                <div className='mt-4 flex justify-between items-center w-full'>
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember">Ghi nhớ đăng nhập</Label>
                  </div>
                  <Button type='button' className='bg-gray-200 hover:bg-gray-300 text-black px-4 ml-4'>
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
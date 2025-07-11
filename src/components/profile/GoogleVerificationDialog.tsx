import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { apiGoogleConfirm } from '@/services/auth';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

const googleVerificationSchema = z.object({
  code: z.string().min(6, { message: 'Mã OTP phải gồm đúng 6 chữ số' }),
  email: z.string().email(),
});

interface GoogleVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerificationSuccess: () => void;
}

const GoogleVerificationDialog = ({ open, onOpenChange, email, onVerificationSuccess }: GoogleVerificationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof googleVerificationSchema>>({
    resolver: zodResolver(googleVerificationSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  });

  useEffect(() => {
    if (email && open) {
      form.reset({
        email,
        code: '',
      });
    }
  }, [email, open, form]);

  const onSubmit = async (data: z.infer<typeof googleVerificationSchema>) => {
    setIsLoading(true);
    try {
      const response = await apiGoogleConfirm(data);
      if (response.status === 201) {
        toast.success('Xác thực Google thành công');
        onVerificationSuccess();
        onOpenChange(false);
      } else {
        toast.error('Xác thực thất bại');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xác thực tài khoản Google</DialogTitle>
          <DialogDescription>Nhập mã OTP đã gửi tới email của bạn để xác minh</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
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
                          <InputOTPSlot key={i} index={i} className="w-10 h-10" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 cursor-pointer w-full" disabled={isLoading}>
              {isLoading ? 'Đang xác thực...' : 'Xác thực Google'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleVerificationDialog;

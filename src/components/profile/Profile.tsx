import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Camera, Eye, EyeOff, Loader2, Mail } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { useState } from "react"
import useAuthStore from "@/stores/authStore"

const profileSchema = z.object({
  name: z.string(),
  code: z.string(),
  phone: z.string().min(10, { message: "Số điện thoại không hợp lệ" }).optional(),
  email: z.string().email({ message: "Email không hợp lệ" }).optional(),
  date_of_birth: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
  newPassword: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    ),
  confirmPassword: z.string().min(1, { message: "Vui lòng nhập lại mật khẩu" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Mật khẩu không khớp",
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  console.log(currentUser)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.full_name || "",
      code: currentUser?.code || "",
      phone: currentUser?.phone || "",
      email: currentUser?.email || "",
      date_of_birth: currentUser?.date_of_birth || "",
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  return (
    <div className="max-w-4xl mx-auto p-5 space-y-6">
      <div className="flex gap-4 items-center">
        <Avatar className="w-20 h-20 bg-primary">
          <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
          <AvatarFallback className="text-lg">{currentUser?.full_name}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{currentUser?.full_name}</h1>
          <p className="text-gray-600">{currentUser?.role_code}</p>
          <p className="text-sm text-gray-500">{currentUser?.email}</p>
        </div>
        {/* <Button variant={"outline"} className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Thay đổi ảnh
        </Button> */}
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin liên lạc của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form className="space-y-4" action="POST">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <div>
                              <Input {...field} placeholder="Nhập họ và tên" className="w-full" disabled />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã số</FormLabel>
                          <FormControl>
                            <div>
                              <Input {...field} placeholder="Nhập mã số" className="w-full" disabled />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <div>
                                <Input {...field} placeholder="Nhập số điện thoại"
                                  className="w-full"
                                  disabled={true}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày sinh</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nhập ngày sinh" className="w-full" disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-4">
                      {
                        currentUser?.email ? (
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Email liên lạc</FormLabel>
                                <FormControl>
                                  <div>
                                    <Input {...field} placeholder="Nhập email" className="w-full" disabled />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="flex gap-4 items-end">
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email liên lạc</FormLabel>
                                  <FormControl>
                                    <div className="flex-1 min-w-[640px]">
                                      <Input {...field} placeholder="Nhập email" className="w-full" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex items-end justify-end">
                              <Button variant={"outline"} className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Liên kết Google
                              </Button>
                            </div>
                          </div>
                        )
                      }

                    </div>
                  </div>

                  {/* <Button type="submit" className="bg-black" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      "Cập nhật thông tin"
                    )}
                  </Button> */}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Đổi mật khẩu</CardTitle>
              <CardDescription>Thay đổi mật khẩu để bảo mật tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form className="space-y-4" action="POST">
                  <div className="space-y-3">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu hiện tại</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="Nhập mật khẩu hiện tại" className="w-full"
                                type={showPassword.current ? "text" : "password"}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                className="absolute right-0 top-0 h-full px-3 focus:ring-0 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                              >
                                {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu mới</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="Nhập mật khẩu mới" className="w-full"
                                type={showPassword.new ? "text" : "password"}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                className="absolute right-0 top-0 h-full px-3 focus:ring-0 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                              >
                                {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="Nhập lại mật khẩu mới" className="w-full"
                                type={showPassword.confirm ? "text" : "password"}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                className="absolute right-0 top-0 h-full px-3 focus:ring-0 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                              >
                                {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="bg-black" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang thay đổi...
                      </>
                    ) : (
                      "Đổi mật khẩu"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile
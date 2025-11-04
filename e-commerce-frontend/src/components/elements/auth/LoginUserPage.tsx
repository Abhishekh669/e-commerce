"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/lib/store/user-store'
import { loginUser } from '@/lib/actions/auth/login'
import { useQueryClient } from '@tanstack/react-query'
// 👇 Validation schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginUserPage() {
    const {user} = useUserStore()
    const queryClient = useQueryClient();
    if(user){
        return redirect("/")
    }
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const callback = searchParams.get("callback") || "/"

    const onSubmit = async (data: LoginFormData) => {
        setIsLoggingIn(true)

        try {
          const res = await loginUser(data)
          if(res.success && res.message){
            toast.success(res.message)
            queryClient.invalidateQueries({queryKey : ["verify-user-token"]})
            router.push("/products")
          }else if(!res.success && res.error){
            toast.error(res.error as string)
          }else{
            toast.error("Something went wrong")
          }
           
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoggingIn(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <Card className="w-full max-w-md shadow-lg rounded-lg overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className={`border ${errors.email ? 'border-red-600' : 'border-gray-300'} rounded-md`}
                                disabled={isLoggingIn}
                            />
                            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="******"
                                {...register("password")}
                                className={`border ${errors.password ? 'border-red-600' : 'border-gray-300'} rounded-md`}
                                disabled={isLoggingIn}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-2 top-[26px] text-gray-500 hover:text-gray-700 transition duration-200"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 transition duration-200"
                        >
                            {isLoggingIn ? "Logging In..." : "Login"}
                        </Button>

                        {/* 👉 Register redirect */}
                        <p className="text-center text-sm mt-2">
                            Don&apos;t have an account?{" "}
                            <Link
                                href={`/register?callback=${callback}`}
                                className="text-yellow-600 hover:underline"
                            >
                                Register
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

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
import { RegisterUser } from '@/lib/actions/auth/register-user'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/lib/store/user-store'

export const formSchema = z
    .object({
        username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username can be at max 30 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters').max(30, 'Password must be of max 30 character'),
        confirmPassword: z.string(),
        role: z.enum(['customer', 'seller'], 'Please select a valid role'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

export type RegisterFormData = z.infer<typeof formSchema>

function RegisterUserPage() {
    const user = useUserStore().user;
    if(user){
        return redirect("/")
    }
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(formSchema),
    })
    const searchParams = useSearchParams();
    const callBackUrl = searchParams.get("callback")
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    console.log("this is callback url : ",callBackUrl)

    const router = useRouter();
    const onSubmit = async (data: RegisterFormData) => {
        setIsCreating(true)
        try {
            const parsed = formSchema.safeParse(data)
            if (!parsed.success) {
                throw new Error("data validation failed")
            }

            if (data.confirmPassword !== data.password) {
                throw new Error("password not matched")
            }

            const res = await RegisterUser(data)
            if (res.success && res.message) {
                toast.success(res.message || "check your email for further process")
            } else if (!res.success && res.error) {
                toast.error(res.error as string || "failed to create user")
            } else {
                toast.error("something went wrong")
            }
        } catch (error) {
            toast.error("something went wrong")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <Card className="w-full max-w-md shadow-lg rounded-lg overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Username */}
                        <div>
                            <Label className='my-1' htmlFor="username">Username</Label>
                            <Input disabled={isCreating} placeholder='John Riman' id="username" {...register('username')} className={`border ${errors.username ? 'border-red-600' : 'border-gray-300'} rounded-md`} />
                            {errors.username && (
                                <p className="text-sm text-red-600">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <Label className='my-1' htmlFor="email">Email</Label>
                            <Input placeholder='example@gmail.com' id="email" type="email" disabled={isCreating} {...register('email')} className={`border ${errors.email ? 'border-red-600' : 'border-gray-300'} rounded-md`} />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Label className='my-1' htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                placeholder='******'
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`border ${errors.password ? 'border-red-600' : 'border-gray-300'} rounded-md`}
                                disabled={isCreating}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-[26px] text-gray-500 hover:text-gray-700 transition duration-200"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <Label className='my-1' htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                placeholder='******'
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                className={`border ${errors.confirmPassword ? 'border-red-600' : 'border-gray-300'} rounded-md`}
                                disabled={isCreating}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-2 top-[26px] text-gray-500 hover:text-gray-700 transition duration-200"
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <Label className='my-1' htmlFor="role">Role</Label>
                            <select
                                id="role"
                                {...register('role')}
                                className={`w-full p-2 border ${errors.role ? 'border-red-600' : 'border-gray-300'} rounded-md`}
                                disabled={isCreating}
                            >
                                <option value="">Select Role</option>
                                <option value="customer">Customer</option>
                                <option value="seller">Seller</option>
                            </select>
                            {errors.role && (
                                <p className="text-sm text-red-600">{errors.role.message}</p>
                            )}
                        </div>

                        <Button type="submit" disabled={isCreating} className="w-full bg-yellow-500 hover:bg-yellow-600 transition duration-200">
                            {
                                isCreating ? "Creating" : "Create Account"
                            }
                        </Button>
                         <p className="text-center text-sm mt-2">
                            Already  have an account?{" "}
                            <Link
                                href={`/login?callback=${callBackUrl}`}
                                className="text-yellow-600 hover:underline"
                            >
                                login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default RegisterUserPage

"use client";
import React, { useEffect, useState } from "react";
import { Search, ShoppingCart, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useRedirectPath } from "@/lib/utils/redirect-path";
import { useUserStore } from "@/lib/store/user-store";
import { SignOutUser } from "@/lib/actions/auth/sign-out";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function Header() {
    const [mounted, setMounted] = useState(false);
    const user = useUserStore().user;
    let redirectUrl = useRedirectPath();
    const queryClient = useQueryClient();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Get first character of userName for avatar
    const avatarChar = user?.userName?.charAt(0).toUpperCase() || "";
    const handleSignOut = async () => {

        const res = await SignOutUser();
        if(res.success){
            toast.success("logout successfully")
        }else{
            toast.error("failed to logout")
            return;
        }
        queryClient.invalidateQueries({ queryKey: ["verify-user-token"] })
        router.refresh()
        



    }

    return (
        <header className="w-full bg-gray-900 text-white px-4 py-3 lg:px-14 flex items-center justify-between gap-4 shadow-md">
            {/* Logo - Left Side */}
            <Link href={"/"}>
                <div className="text-xl font-bold tracking-wide hover:text-yellow-400 cursor-pointer flex-shrink-0">
                    E-Co<span className="text-yellow-400">M</span>
                </div>
            </Link>

            

            {/* Right Side: Login & Cart */}
            <div className="flex items-center space-x-6 flex-shrink-0">
                {/* User Avatar or Login */}
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="w-8 h-8 cursor-pointer border-2 border-white">
                                <AvatarFallback className="bg-yellow-400 text-black font-semibold">
                                    {avatarChar}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-1.5 text-sm font-medium">
                                {user.userName}
                            </div>
                            <div className="px-2 py-1.5 text-xs text-gray-500">
                                {user.role}
                            </div>
                            <DropdownMenuItem asChild>
                                <Link href="/u/profile">Profile</Link>
                            </DropdownMenuItem>
                            {user.role === "seller" && (
                                <DropdownMenuItem asChild>
                                    <Link href="/products/new">Add Product</Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href="/orders">My Orders</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <button className="w-full" onClick={handleSignOut}>
                                    Sign Out
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link href={`/login?callback=${encodeURIComponent(redirectUrl)}`}>
                        <div className="flex items-center space-x-2 cursor-pointer hover:text-yellow-400 transition-colors">
                            <UserIcon size={20} />
                            <span className="hidden sm:inline">Sign In</span>
                        </div>
                    </Link>
                )}

                
            </div>
        </header>
    );
}

export default Header;
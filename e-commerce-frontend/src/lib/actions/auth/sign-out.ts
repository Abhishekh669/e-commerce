'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url";
import { get_cookies } from "@/lib/utils/get-cookies";
import axios from "axios";
import { cookies } from "next/headers"


export const SignOutUser = async () => {
    try {
        const user_token = await get_cookies('user_token')
        if (!user_token) {
            return { success: false }
        }
        const url = await getBackEndUrl();

        const res = await axios.get(`${url}/api/v1/user-service/delete-user-session`, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const data = res.data
        console.log("this ishte data in signout: ",data)
        if (!data.success) {
            return { success: false }
        }
        const cookieStore = await cookies();
        cookieStore.delete("user_token")
        return { success: true }
    } catch (error) {
        console.log("this shte success reate : ",error)
        return {
            success: false
        }
    }
}
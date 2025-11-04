'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"
import { cookies } from "next/headers"

type loginUserType = {
    email : string
    password : string
}
export async function loginUser(data : loginUserType) {
    try {
        const url = await getBackEndUrl();
        const res = await axios.post(`${url}/api/v1/user-service/login`,data)
        const value = res.data;
        const token = value.token;
        if(!value.success || !token ){
            throw new Error(value.error)
        }     
        
        const cookieStore = await cookies();
        cookieStore.set("user_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/"
        })
        return {
            success : value.success,
            message : value.message
        };
    } catch (error) {
        error=getErrorMessage(error)
        return {
            success : false,
            error
        }
        
    }
}
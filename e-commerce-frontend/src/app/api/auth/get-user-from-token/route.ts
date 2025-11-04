'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url";
import { get_cookies } from "@/lib/utils/get-cookies";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import axios from "axios";
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("user not authorized")
        }
        const url = await getBackEndUrl()
        const res = await axios.get(`${url}/api/v1/user-service/verify-user-token`,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data;
        
        if(!data.success){
            throw new Error(data.error)
        }
        return NextResponse.json({data},{status : 200})
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({ error, success: false}, { status: 400 })
    }
}
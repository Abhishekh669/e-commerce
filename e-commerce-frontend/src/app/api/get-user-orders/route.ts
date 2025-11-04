'use server'

import { getUser } from "@/lib/actions/user/get-user"
import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { get_cookies } from "@/lib/utils/get-cookies"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"
import { NextResponse } from "next/server"


export async function GET(request: Request) {
    try {

        const user_token = await get_cookies('user_token')  
        if(!user_token){
            return NextResponse.json({
                error: 'Authentication required',
                success: false,
            }, { status: 401 })
        }
        const user = await getUser()
        if(!user || !user.success){
            return NextResponse.json({
                error: 'User not found',
                success: false,
            }, { status: 404 })
        }
        const backendUrl = await getBackEndUrl()
        const response = await axios.get(`${backendUrl}/api/v1/orders/user`, {
            headers: {
                'Cookie': `user_token=${user_token};`,
            },
            withCredentials: true
        })

        const data  = response.data;
        if(!data.success){
            return NextResponse.json({
                error: data.error,
                success: false,
            }, { status: 400 })
        }
        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({
            error,
            success: false,
        }, { status: 500 })
    }
}
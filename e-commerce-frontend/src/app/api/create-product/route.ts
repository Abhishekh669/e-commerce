'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { get_cookies } from "@/lib/utils/get-cookies"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const user_token = await get_cookies("user_token")
        if (!user_token) {
            return NextResponse.json({
                error: 'Authentication required - please login',
                success: false,
            }, { status: 401 })
        }

        const backendUrl = await getBackEndUrl()
        
        console.log('Creating product with data:', body)
        console.log('Backend URL:', `${backendUrl}/api/v1/product-service/create-product`)

        const response = await axios.post(`${backendUrl}/api/v1/product-service/create-product`, body, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`,
                'Content-Type': 'application/json'
            },
        })

        return NextResponse.json(response.data, { status: 200 })

    } catch (error: any) {
        const errorMessage = getErrorMessage(error)
        console.error("Error creating product:", errorMessage)

        return NextResponse.json({
            error: errorMessage,
            success: false,
        }, { status: error.response?.status || 500 })
    }
}

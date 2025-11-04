'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { get_cookies } from "@/lib/utils/get-cookies"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { productId: string } }) {
    try {
        const body = await request.json()
        const { productId } = params

        const user_token = await get_cookies("user_token")
        if (!user_token) {
            return NextResponse.json({
                error: 'Authentication required - please login',
                success: false,
            }, { status: 401 })
        }

        const backendUrl = await getBackEndUrl()
        
        console.log('Updating product with data:', body)
        console.log('Backend URL:', `${backendUrl}/api/v1/product-service/update-product/${productId}`)
        console.log('User token exists:', !!user_token)
        console.log('User token value:', user_token?.substring(0, 20) + '...')

        const response = await axios.put(`${backendUrl}/api/v1/product-service/update-product/${productId}`, body, {
            withCredentials: true,
            headers: {
                Cookie: `user_token=${user_token}`,
                'Content-Type': 'application/json'
            },
        })

        return NextResponse.json(response.data, { status: 200 })

    } catch (error: any) {
        const errorMessage = getErrorMessage(error)
        console.error("Error updating product:", errorMessage)
        console.error("Full error:", error.response?.data || error.message)

        return NextResponse.json({
            error: errorMessage,
            success: false,
        }, { status: error.response?.status || 500 })
    }
}

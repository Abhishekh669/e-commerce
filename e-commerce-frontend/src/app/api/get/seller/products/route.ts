'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"
import { NextResponse } from "next/server"


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        
        // Only handle pagination parameters for backend
        const page = searchParams.get("page") || "1"
        const limit = searchParams.get("limit") || "10"

        // Get cookies for authentication
        const cookieHeader = request.headers.get('cookie')
        if (!cookieHeader) {
            return NextResponse.json({
                error: 'Authentication required',
                success: false,
            }, { status: 401 })
        }

        const backendUrl = await getBackEndUrl()
        const response = await axios.get(`${backendUrl}/api/v1/product-service/get-seller-products?page=${page}&limit=${limit}`, {
            headers: {
                'Cookie': cookieHeader,
            },
            withCredentials: true
        })
        
        // Return the backend response directly since it already has the correct structure
        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({
            error,
            success: false,
        }, { status: 500 })
    }
}
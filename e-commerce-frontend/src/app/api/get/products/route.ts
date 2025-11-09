'use server'

import axios from "axios"
import { NextResponse } from "next/server"
import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { getErrorMessage } from "@/lib/utils/get-error-message"


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const limit = searchParams.get('limit') || '4'
        const offset = searchParams.get('offset') || '0'

        const backendUrl = await getBackEndUrl()
        const queryParams = new URLSearchParams()
        if (search) queryParams.append('search', search)
        queryParams.append('limit', limit)
        queryParams.append('offset', offset)

        const response = await axios.get(`${backendUrl}/api/v1/product-service/get-all-products?${queryParams.toString()}`)
        const data = response.data
        if(!data.success){
            return NextResponse.json({ error: data.error, success: false }, { status: 400 })
        }
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({ error, success: false }, { status: 500 })
    }
}
'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import axios from "axios";
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;
        if (!token) {
            return NextResponse.json({ error: "token is required", success: false }, { status: 400 });
        }

        const url = await getBackEndUrl()
        const res = await axios.get(`${url}/api/v1/user-service/verify-user?token=${token}`)
        const data = res.data;
        const userToken = data.token
        if(!data.success || !userToken){
            throw new Error(data.error)
        }

        const response = NextResponse.json({data},{status : 200})
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        response.cookies.set("user_token", data.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires,
            path: '/',
        });
        return response
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({ error, success: false}, { status: 400 })
    }
}
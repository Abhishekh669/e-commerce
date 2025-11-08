'use server'

import { getUser } from "@/lib/actions/user/get-user";
import { getBackEndUrl } from "@/lib/utils/get-backend-url";
import { get_cookies } from "@/lib/utils/get-cookies";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { productId: string } }) {
    try {
        const productId = params.productId;
        const currentUser = await getUser();
        if(!currentUser?.user) {
            return NextResponse.json({
                error: "User not found",
                success: false
            }, {
                status: 401
            })
        }
        const user_token = await get_cookies("user_token");
        if(!user_token) {
            return NextResponse.json({
                error: "User token not found",
                success: false
            }, {
                status: 401
            })
        }
        const backendUrl = await getBackEndUrl();
        const response = await axios.get(`${backendUrl}/api/v1/product-service/get-product-by-id/${productId}`, {
            headers: {
                Cookie: `user_token=${user_token}`
            }
        })
        const data = response.data;
        if(!data.success) {
                return NextResponse.json({
                error: data.error,
                success: false
            }, {
                status: 400
            })
        }
        console.log("thisis hte reviews : ",data)
        return NextResponse.json({
            product: data.product,
            reviews : data.reviews,
            success: true
        }, {
            status: 200
        })
    } catch (error) {
        error = getErrorMessage(error)
        return NextResponse.json({
            error: error,
            success: false
        }, {
            status: 500
        })
        
    }
    
}
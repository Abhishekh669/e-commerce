'use server'

import { get_cookies } from "@/lib/utils/get-cookies"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import { getUser } from "../../user/get-user"
import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import axios from "axios"

export async function cancelOrder(orderId: string) {
    try {
        const user_token = await get_cookies("user_token")
        if (!user_token) {
            throw new Error("Authentication required")
        }
        const currentUser = await getUser()
        if (!currentUser.success) {
            throw new Error("User not found")
        }

        const backendUrl = await getBackEndUrl()
        const response = await axios.put(`${backendUrl}/api/v1/orders/user/${orderId}/cancel`, {}, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${user_token}`,
            },
        })
        const data = response.data

        if (!data.success) {
            throw new Error(data.error)
        }

        return {
            success: true,
            message: "Order cancelled successfully"
        }
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error,
            success: false
        }
    }
}
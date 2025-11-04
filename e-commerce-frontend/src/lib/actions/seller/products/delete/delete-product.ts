'use server'

import { getUser } from "@/lib/actions/user/get-user"
import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { get_cookies } from "@/lib/utils/get-cookies"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"

export const deleteProduct = async (productId: string) => {
    try {
        const user = await getUser();
        if(!user?.user) throw new Error("User not found");
        const user_token = await get_cookies("user_token");
        if(!user_token) throw new Error("User token not found");
        const backendUrl = await getBackEndUrl();
        const response = await axios.delete(`${backendUrl}/api/v1/product-service/delete-product/${productId}`, {
            headers: {
                Cookie: `user_token=${user_token}`,
            },
        })
        const data = response.data;
        if(!data.success) throw new Error(data.error);
        return {
            success : true,
            message : data.message
        }
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error,
            success : false
        }
    }
}           
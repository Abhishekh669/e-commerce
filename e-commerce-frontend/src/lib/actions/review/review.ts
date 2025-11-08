'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url";
import { get_cookies } from "@/lib/utils/get-cookies";
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios";

export type ProductReviewFromClient = {
    productId : string,
    userId :  string,
    userName : string,
    rating  : number,
    comment : string,
}

export const createComment = async(data : ProductReviewFromClient) =>{
    try {
const user_token = await get_cookies("user_token");
    if(!user_token) {
      throw new Error("User token not found");
    }
    const backendUrl = await getBackEndUrl();
    const resposne = await axios.post(`${backendUrl}/api/v1/comment-service/create-comment`,data,{
        withCredentials : true,
        headers : {
            Cookie : `user_token=${user_token}`,
        }
    })

    const value = resposne.data;
    if(!value.success){
        throw new Error(value.error || "failed to create comment")
    }
    return {
        success : value.success,
        message : value?.message || "successfully created comment"
    }
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error, success : false,
        }
        
    }
}
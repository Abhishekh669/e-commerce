'use server'
import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { get_cookies } from "@/lib/utils/get-cookies"
import axios from "axios"
import { getErrorMessage } from "@/lib/utils/get-error-message"
export const getUser = async () =>{
    try {
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("user not authorized")
        }
        const url = await getBackEndUrl()
        const res = await axios.get(`${url}/api/v1/user-service/user-token-verification`,{
            withCredentials : true,
            headers : {
                Cookie : `user_token=${user_token}`
            }
        })
        const data = res.data;
        console.log("this is the data in get user  : ", data)
        if(!data.success || !data.user){
            throw new Error(data.error)
        }
        return {
            success : true,
            message : "user authorized",
            user : data.user
        }
    } catch (error) {
        error = getErrorMessage(error)
        console.log("this is the error in get user : ", error)
        return {
            success : false,
            error : "user not authorized"
        }
        
    }
}
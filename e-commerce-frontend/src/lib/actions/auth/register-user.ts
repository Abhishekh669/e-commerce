'use server'

import { formSchema, RegisterFormData } from "@/components/elements/auth/RegisterUserPage"
import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"


export const RegisterUser = async (data: RegisterFormData) => {
    try {

       

        const url = await getBackEndUrl();
        const { confirmPassword, ...otherData } = data;
        const res = await axios.post(`${url}/api/v1/user-service/create-user`, otherData)

        const value = res.data

        if (!value.success) {
            throw new Error(value.error || "failed to create user")
        }
        return {
            message  :value.message,
            success : value.success,
        }

    } catch (error) {
        error = getErrorMessage(error)
        console.log("Error in creating user : ",error)
        return {
            error,
            success: false,
        }

    }
}
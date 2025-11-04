import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const verfiyUserToken = async () => {
    try {
        const res = await axios.get(`/api/auth/get-user-from-token`)
        const data = res.data.data;
        return data;
    } catch (error) {
        error = getErrorMessage(error)
        return {
            error,
            success: false,
        }
    }
}

export const useVerifyUserToken = () => {
    return useQuery({
        queryKey: ["verify-user-token"],
        queryFn: () => verfiyUserToken(),
        refetchOnWindowFocus : false,
        // staleTime : 30 * 60 * 1000,
    })
}
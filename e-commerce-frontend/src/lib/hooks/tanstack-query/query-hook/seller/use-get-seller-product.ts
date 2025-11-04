import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getSellerProducts = async (page: number, limit: number) => {
    try {
        const res = await axios.get(`/api/get/seller/products?page=${page}&limit=${limit}`)
        const data = res.data
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch products')
        }
        
        return data
    } catch (error) {
        const errorMessage = getErrorMessage(error);     
        throw new Error(errorMessage);
    }
};

export const useGetSellerProducts = (page: number, limit: number) => {
    return useQuery({
        queryKey: ["get-seller-products", page, limit],
        queryFn: () => getSellerProducts(page, limit),
        refetchOnWindowFocus : false,
        // staleTime : 30 * 60 * 1000,
    })
}
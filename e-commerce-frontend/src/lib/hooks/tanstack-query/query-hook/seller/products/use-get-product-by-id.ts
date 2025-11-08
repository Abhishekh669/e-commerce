import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getProductById = async (productId: string) => {
    try {
        const res = await axios.get(`/api/get/seller/products/${productId}`)
        const data = res.data
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch product')
        }

        
        return {...data.product, reviews : data.reviews}
    } catch (error) {
        const errorMessage = getErrorMessage(error);     
        throw new Error(errorMessage);
    }
};

export const useGetProductById = (productId: string) => {
    return useQuery({
        queryKey: ["get-product-by-id", productId],
        queryFn: () => getProductById(productId),
        refetchOnWindowFocus: false,
        enabled: !!productId, // Only fetch when productId exists
    })
}
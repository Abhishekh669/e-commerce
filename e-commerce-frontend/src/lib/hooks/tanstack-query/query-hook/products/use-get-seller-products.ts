import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useQuery } from "@tanstack/react-query";
import { get_cookies } from "@/lib/utils/get-cookies";
import { getBackEndUrl } from "@/lib/utils/get-backend-url";

// Types for seller product data
interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  sellerId: string
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  success: boolean
  data: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }
  error?: string
}

export const getSellerProducts = async () => {
    try {
        const user_token = await get_cookies('user_token')
        if (!user_token) {
            throw new Error('Authentication required')
        }

        const backendUrl = await getBackEndUrl()
        const response = await fetch(`${backendUrl}/api/v1/orders/seller/products`, {
            method: 'GET',
            headers: {
                'Cookie': `user_token=${user_token};`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ProductsResponse = await response.json()
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch seller products')
        }
        
        return data.data
    } catch (error) {
        const errorMessage = getErrorMessage(error);     
        throw new Error(errorMessage);
    }
};

export const useGetSellerProducts = () => {
    return useQuery({
        queryKey: ["get-seller-products"],
        queryFn: () => getSellerProducts(),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

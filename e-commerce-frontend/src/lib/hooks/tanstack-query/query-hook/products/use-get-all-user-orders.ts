import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useQuery } from "@tanstack/react-query";
import { get_cookies } from "@/lib/utils/get-cookies";
import { getBackEndUrl } from "@/lib/utils/get-backend-url";
import axios from "axios";

// Types for order data
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

interface ProductWithQuantity extends Product {
  quantity: number
}

interface OrderWithProductDetails {
  id: string
  userId: string
  amount: number
  products: ProductWithQuantity[]
  transactionId: string
  status: string
  createdAt: string
  updatedAt: string
}

interface OrdersResponse {
  success: boolean
  data: {
    orders: OrderWithProductDetails[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }
  error?: string
}

export const getAllUserOrders = async () => {
    try {
       const res = await axios.get('/api/get-user-orders')
        return res.data
    } catch (error) {
        const errorMessage = getErrorMessage(error);     
        throw new Error(errorMessage);
    }
};

export const useGetAllUserOrders = () => {
    return useQuery({
        queryKey: ["get-all-user-orders"],
        queryFn: () => getAllUserOrders(),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}   
import { useQuery } from '@tanstack/react-query'
import { get_cookies } from '@/lib/utils/get-cookies'
import { getBackEndUrl } from '@/lib/utils/get-backend-url'

// Types for order data
interface ProductWithQuantity {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  discount: number
  sellerId: string
  category: any
  images: string[]
  stock: number
  createdAt: string
  updatedAt: string
  boughtQuantity: number
}

interface Order {
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
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }
}

const getSellerOrders = async (): Promise<OrdersResponse> => {
  const user_token = await get_cookies('user_token')
  if (!user_token) {
    throw new Error('Authentication required')
  }

  const backendUrl = await getBackEndUrl()
  const response = await fetch(`${backendUrl}/api/v1/orders/seller/details`, {
    headers: {
      'Authorization': `Bearer ${user_token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

export const useGetSellerOrders = () => {
  return useQuery({
    queryKey: ['get-seller-orders'],
    queryFn: getSellerOrders,
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

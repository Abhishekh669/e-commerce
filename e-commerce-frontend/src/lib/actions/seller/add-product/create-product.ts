'use server'

import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"
import { cookies } from "next/headers"
import { getUser } from "../../user/get-user"
import { get_cookies } from "@/lib/utils/get-cookies"

export type CreateProductRequest = {
  name: string
  description: string
  price: number
  quantity: number
  discount: number
  sellerId: string
  category: Record<string, string>
  images: string[]
  stock: number
}

export type CreateProductResponse = {
  success: boolean
  message?: string
  error?: string
  product?: {
    id: string
    name: string
    description: string
    price: number
    quantity: number
    discount: number
    sellerId: string
    category: Record<string, string>
    images: string[]
    stock: number
    createdAt: string
    updatedAt: string
  }
}

export async function createProduct(data: CreateProductRequest) {
  try {
    const user = await getUser();
    console.log("Product data to create:", data)
    
    if (!user?.user) {
      throw new Error("User not found - please login");
    }

    const user_token = await get_cookies("user_token");
    if(!user_token) {
      throw new Error("User token not found");
    }
    
    // Prepare the backend data format
    const backendData = {
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      discount: data.discount,
      sellerId: data.sellerId,
      category: data.category,
      images: data.images,
      stock: data.stock,
    }

    const backendUrl = await getBackEndUrl();

    // Use the frontend API route which handles authentication
    const response = await axios.post(`${backendUrl}/api/v1/product-service/create-product`, backendData, {
      withCredentials: true,
      headers: {
        Cookie: `user_token=${user_token}`,
      }
    })

    const value = response.data;
    if(!value.success) {
      throw new Error(value.error || "Failed to create product");
    }
    return value;
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    console.error("Error creating product:", errorMessage)
    return {
      success: false,
      error: errorMessage
    }
  }
}

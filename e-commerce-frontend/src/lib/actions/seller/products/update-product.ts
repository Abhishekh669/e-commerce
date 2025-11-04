'use server'

import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"

export type UpdateProductRequest = {
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

export type UpdateProductResponse = {
  success: boolean
  message?: string
  error?: string
}

export async function updateProduct(productId: string, data: UpdateProductRequest): Promise<UpdateProductResponse> {
  try {
    console.log("Updating product:", productId, data)

    // Use the frontend API route which handles authentication
    const response = await axios.put(`/api/update-product/${productId}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const value = response.data;
    if (!value.success) {
      throw new Error(value.error || "Failed to update product");
    }
    return value;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error)
    console.error("Error updating product:", errorMessage)
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

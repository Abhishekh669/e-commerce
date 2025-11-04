'use server'

import { getErrorMessage } from "@/lib/utils/get-error-message"
import axios from "axios"

export type DeleteProductResponse = {
  success: boolean
  message?: string
  error?: string
}

export async function deleteProduct(productId: string): Promise<DeleteProductResponse> {
  try {
    console.log("Deleting product:", productId)

    // Use the frontend API route which handles authentication
    const response = await axios.delete(`/api/delete-product/${productId}`)
    
    const value = response.data;
    if (!value.success) {
      throw new Error(value.error || "Failed to delete product");
    }
    return value;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error)
    console.error("Error deleting product:", errorMessage)
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

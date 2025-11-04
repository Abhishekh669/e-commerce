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

export const updateProduct = async (productId: string, product: UpdateProductRequest) => {
    try {
        console.log("Updating product via frontend API:", productId, product)
        
        // Use the frontend API route which handles authentication
        const response = await axios.put(`/api/update-product/${productId}`, product, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        const data = response.data;
        if(!data.success) throw new Error(data.error);
        return {
            success : true,
            message : data.message
        }
    } catch (error) {
        const errorMessage = getErrorMessage(error)
        console.error("Update product error:", errorMessage)
        return {
            error: errorMessage, 
            success : false
        }
    }
}
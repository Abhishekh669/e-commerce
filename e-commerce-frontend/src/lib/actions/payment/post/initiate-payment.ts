'use server'

import { get_cookies } from "@/lib/utils/get-cookies";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getBackEndUrl } from "@/lib/utils/get-backend-url";

// Types for eSewa payment response
interface PaymentResponse {
  success: boolean;
  url?: string;
  error?: string;
  message?: string;
}

interface PaymentStatusResponse {
  success: boolean;
  data?: {
    product_code: string;
    transaction_uuid: string;
    total_amount: number;
    status: string;
    ref_id?: string;
  };
  error?: string;
}

interface OrderResponse {
  success: boolean;
  order?: {
    id: string;
    userId: string;
    amount: number;
    products: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    transactionId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

// Types for cart items with seller information
interface CartItemWithSeller {
  id: string
  sellerId: string
  quantity: number
  price: number
  name: string
}

export const intiatePaymentAction = async (cartItems: CartItemWithSeller[]): Promise<PaymentResponse> => {
  const user_token = await get_cookies('user_token')
  if (!user_token) {
    return {
      success: false,
      error: "User not authenticated"
    };
  }

  try {
    // Get the backend URL
    const backendUrl = await getBackEndUrl();
    console.log("Attempting to call backend at:", backendUrl);
    
    // Construct the full URL
    const fullUrl = `${backendUrl}/api/v1/payment-service/initiate-payment`;
    console.log("Full URL:", fullUrl);
    
    // Call backend directly from server action (more efficient)
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `user_token=${user_token};`
      },
      body: JSON.stringify({ cartItems })
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Error response data:", errorData);
      return {
        success: false,
        error: errorData.error || `Payment initiation failed: ${response.status}`
      };
    }

    const data = await response.json();
    console.log("Payment initiation response:", data);
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || "Payment initiation failed"
      };
    }

    // Return the payment URL for eSewa redirect
    return {
      success: true,
      url: data.url
    };

  } catch (error) {
    console.error("Detailed error in payment initiation:", error);
    const errorMessage = getErrorMessage(error);
    console.log("Payment initiation error:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Check payment status using eSewa's status check API
export const checkPaymentStatus = async (
  transactionUUID: string, 
  productCode: string, 
  totalAmount: number
): Promise<PaymentStatusResponse> => {
  const user_token = await get_cookies('user_token')
  if (!user_token) {
    return {
      success: false,
      error: "User not authenticated"
    };
  }

  try {
    // Get the backend URL
    const backendUrl = await getBackEndUrl();
    
    // Call backend directly for status check
    const response = await fetch(`${backendUrl}/api/v1/payment-service/check-status?transaction_uuid=${transactionUUID}&product_code=${productCode}&total_amount=${totalAmount}`, {
      method: 'GET',
      headers: {
        'Cookie': `user_token=${user_token};`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `Status check failed: ${response.status}`
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to check payment status"
      };
    }

    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.log("Payment status check error:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Clear cart from frontend state
export const clearCartState = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Clear session storage
      sessionStorage.removeItem('pendingOrderItems');
      
      // Clear localStorage if used for cart persistence
      localStorage.removeItem('cart');
      
      // Dispatch custom event to notify other components that cart is cleared
      window.dispatchEvent(new CustomEvent('cartCleared'));
      
      console.log('Cart state cleared successfully');
    }
  } catch (error) {
    console.warn('Failed to clear cart state:', error);
  }
}

// Process successful payment and create order
export const processSuccessfulPayment = async (
  transactionUUID: string
): Promise<OrderResponse> => {
  const user_token = await get_cookies('user_token')
  if (!user_token) {
    return {
      success: false,
      error: "User not authenticated"
    };
  }

  try {
    // Get the backend URL
    const backendUrl = await getBackEndUrl();
    
    // Call backend to process successful payment and create order
    const response = await fetch(`${backendUrl}/api/v1/payment-service/process-successful-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `user_token=${user_token};`
      },
      body: JSON.stringify({ transaction_uuid: transactionUUID })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `Order creation failed: ${response.status}`
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to create order"
      };
    }

    // Clear cart state after successful order creation
    await clearCartState();

    return {
      success: true,
      order: data.order
    };

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.log("Order creation error:", errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Legacy function for backward compatibility
interface verifyPamentStatusType {
  appointmentId: string,
  transaction_code: string,
  signature: string,
}

export const verifyPayment = async (values: verifyPamentStatusType) => {
  const user_token = await get_cookies('user_token')
  if (!user_token) {
    return {
      error: "user not authenticated",
      success: false
    }
  }
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/payment/employee/verify/payment-status/esewa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `user_token=${user_token};`
      },
      body: JSON.stringify(values)
    })

    const data = await response.json();
    if (!data.success) return {
      error: data.error,
      success: false,
    }

    console.log("this is  the payment verification data : ", data)

    return data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.log("this is the error in payment verification : ", errorMessage)
    return {
      error: errorMessage, success: false,
    }
  }
}
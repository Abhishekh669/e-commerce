import { NextRequest, NextResponse } from 'next/server'
import { get_cookies } from '@/lib/utils/get-cookies'
import { getUser } from '@/lib/actions/user/get-user'
import { getBackEndUrl } from '@/lib/utils/get-backend-url'

export async function POST(request: NextRequest) {
  try {
    // Get user token from cookies
    const userToken = await get_cookies('user_token')
    if (!userToken) {
      return NextResponse.json(
        { error: 'User not authenticated', success: false },
        { status: 401 }
      )
    }

    // Verify user
    const currentUser = await getUser()
    if (!currentUser.success) {
      return NextResponse.json(
        { error: 'User not authenticated', success: false },
        { status: 401 }
      )
    }

    // Get request body
    const { productIds } = await request.json()
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs are required', success: false },
        { status: 400 }
      )
    }

    // Call backend to initiate payment
    const backendUrl = await getBackEndUrl()
    const response = await fetch(`${backendUrl}/api/v1/payment-service/initiate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `user_token=${userToken};`
      },
      body: JSON.stringify({ productIds })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Payment initiation failed', success: false },
        { status: response.status }
      )
    }

    const paymentData = await response.json()
    
    if (!paymentData.success || !paymentData.url) {
      return NextResponse.json(
        { error: 'Invalid payment response from backend', success: false },
        { status: 400 }
      )
    }

    // Return the payment URL for frontend to redirect
    return NextResponse.json({
      success: true,
      url: paymentData.url,
      message: 'Payment initiated successfully'
    })

  } catch (error) {
    console.error('eSewa payment initiation error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

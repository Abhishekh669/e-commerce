import { NextRequest, NextResponse } from 'next/server'
import { get_cookies } from '@/lib/utils/get-cookies'
import { getUser } from '@/lib/actions/user/get-user'
import { getBackEndUrl } from '@/lib/utils/get-backend-url'

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const transactionUUID = searchParams.get('transaction_uuid')
    const productCode = searchParams.get('product_code')
    const totalAmount = searchParams.get('total_amount')

    if (!transactionUUID || !productCode || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required parameters', success: false },
        { status: 400 }
      )
    }

    // Call backend to check payment status
    const backendUrl = await getBackEndUrl()
    const response = await fetch(`${backendUrl}/api/v1/payment-service/check-status?transaction_uuid=${transactionUUID}&product_code=${productCode}&total_amount=${totalAmount}`, {
      method: 'GET',
      headers: {
        'Cookie': `user_token=${userToken};`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Payment status check failed', success: false },
        { status: response.status }
      )
    }

    const statusData = await response.json()
    
    return NextResponse.json({
      success: true,
      data: statusData.data
    })

  } catch (error) {
    console.error('Payment status check error:', error)
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

'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home, Package, Receipt, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { checkPaymentStatus, processSuccessfulPayment } from '@/lib/actions/payment/post/initiate-payment'

interface PaymentSuccessData {
  transaction_code?: string
  status?: string
  total_amount?: number
  transaction_uuid?: string
  product_code?: string
  signed_field_names?: string
  signature?: string
}

interface OrderData {
  id: string
  userId: string
  amount: number
  products: Array<{
    productId: string
    quantity: number
    price: number
  }>
  transactionId: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [cartCleared, setCartCleared] = useState(false)

  useEffect(() => {
    // Get payment data from URL parameters (eSewa sends this as base64 encoded)
    const encodedData = searchParams.get('data')
    if (encodedData) {
      try {
        // Decode base64 data from eSewa
        const decodedData = atob(encodedData)
        const parsedData = JSON.parse(decodedData)
        setPaymentData(parsedData)
        console.log('Payment success data:', parsedData)
        
        // If payment is successful, automatically create order
        if (parsedData.status === 'COMPLETE') {
          handleCreateOrder(parsedData.transaction_uuid)
        }
      } catch (error) {
        console.error('Error parsing payment data:', error)
        toast.error('Error processing payment data')
      }
    }
    setLoading(false)
  }, [searchParams])

  useEffect(() => {
    // Listen for cart cleared event
    const handleCartCleared = () => {
      setCartCleared(true)
    }

    window.addEventListener('cartCleared', handleCartCleared)
    
    return () => {
      window.removeEventListener('cartCleared', handleCartCleared)
    }
  }, [])

  const handleCreateOrder = async (transactionUUID: string) => {
    if (!transactionUUID) {
      toast.error('Transaction UUID not found')
      return
    }

    setCreatingOrder(true)
    try {
      const response = await processSuccessfulPayment(transactionUUID)
      
      if (response.success && response.order) {
        setOrderData(response.order)
        toast.success('Order created successfully!')
      } else {
        toast.error(response.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      toast.error('Error creating order')
    } finally {
      setCreatingOrder(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!paymentData?.transaction_uuid || !paymentData?.product_code || !paymentData?.total_amount) {
      toast.error('Payment data incomplete for verification')
      return
    }

    setVerifying(true)
    try {
      const response = await checkPaymentStatus(
        paymentData.transaction_uuid,
        paymentData.product_code,
        paymentData.total_amount
      )

      if (response.success && response.data) {
        if (response.data.status === 'COMPLETE') {
          toast.success('Payment verified successfully!')
          // Create order if not already created
          if (!orderData) {
            handleCreateOrder(paymentData.transaction_uuid)
          }
        } else {
          toast.error(`Payment status: ${response.data.status}`)
        }
      } else {
        toast.error(response.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Error verifying payment')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentData ? (
              <>
                {paymentData.transaction_code && (
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction Code:</span>
                    <span className="font-mono text-sm">{paymentData.transaction_code}</span>
                  </div>
                )}
                {paymentData.transaction_uuid && (
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction ID:</span>
                    <span className="font-mono text-sm">{paymentData.transaction_uuid}</span>
                  </div>
                )}
                {paymentData.total_amount && (
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-mono text-sm">Rs. {paymentData.total_amount}</span>
                  </div>
                )}
                {paymentData.status && (
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-600 font-medium">{paymentData.status}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Payment details not available
              </p>
            )}

            {/* Verify Payment Button */}
            {paymentData && (
              <Button
                onClick={handleVerifyPayment}
                disabled={verifying}
                className="w-full mt-4"
                variant="outline"
              >
                {verifying ? 'Verifying...' : 'Verify Payment Status'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Order ID:</span>
                  <p className="font-mono text-xs mt-1">{orderData.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Amount:</span>
                  <p className="font-mono text-sm mt-1">Rs. {orderData.amount}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <p className="text-blue-600 font-medium">{orderData.status}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Products:</span>
                  <p className="text-sm mt-1">{orderData.products.length} items</p>
                </div>
              </div>

              {/* Product List */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Ordered Products:</h4>
                <div className="space-y-2">
                  {orderData.products.map((product, index) => (
                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>Product ID: {product.productId}</span>
                      <span>Qty: {product.quantity}</span>
                      <span>Rs. {product.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Creation Status */}
        {creatingOrder && (
          <Card className="mb-6">
            <CardContent className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Creating your order...</p>
            </CardContent>
          </Card>
        )}

        {/* Cart Cleared Message */}
        {orderData && cartCleared && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Your cart has been cleared!</p>
              <p className="text-green-600 text-sm">All items have been moved to your order.</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/products" className="flex-1">
            <Button className="w-full" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>You will receive an email confirmation shortly.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  )
}

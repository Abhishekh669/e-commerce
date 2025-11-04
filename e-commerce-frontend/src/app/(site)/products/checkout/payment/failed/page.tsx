'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, Package, RefreshCw, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface PaymentFailureData {
  transaction_uuid?: string
  product_code?: string
  total_amount?: number
  error_message?: string
  status?: string
}

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentFailureData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get payment data from URL parameters
    const transactionUuid = searchParams.get('transaction_uuid')
    const productCode = searchParams.get('product_code')
    const totalAmount = searchParams.get('total_amount')
    const errorMessage = searchParams.get('error_message')
    const status = searchParams.get('status')

    if (transactionUuid || productCode || totalAmount) {
      setPaymentData({
        transaction_uuid: transactionUuid || undefined,
        product_code: productCode || undefined,
        total_amount: totalAmount ? parseFloat(totalAmount) : undefined,
        error_message: errorMessage || undefined,
        status: status || undefined
      })
    }
    setLoading(false)
  }, [searchParams])

  const handleRetryPayment = () => {
    // Redirect back to checkout to retry payment
    window.location.href = '/products/checkout'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600">
            We're sorry, but your payment could not be processed. Please try again or contact support.
          </p>
        </div>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentData ? (
              <>
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
                    <span className="text-red-600 font-medium">{paymentData.status}</span>
                  </div>
                )}
                {paymentData.error_message && (
                  <div className="flex justify-between">
                    <span className="font-medium">Error:</span>
                    <span className="text-red-600 text-sm max-w-xs text-right">
                      {paymentData.error_message}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Payment details not available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Common Failure Reasons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Common Reasons for Payment Failure</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Insufficient funds in your eSewa account</li>
              <li>• Incorrect eSewa credentials</li>
              <li>• Network connectivity issues</li>
              <li>• Transaction timeout</li>
              <li>• Invalid transaction details</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={handleRetryPayment}
            className="flex-1"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/products" className="flex-1">
            <Button className="w-full" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/">
            <Button variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>If you continue to experience issues, please contact our support team.</p>
          <p className="mt-2">
            <strong>Support Email:</strong> support@yourstore.com<br />
            <strong>Support Phone:</strong> +977-1-1234567
          </p>
        </div>
      </div>
    </div>
  )
}

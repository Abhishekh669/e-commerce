'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { checkPaymentStatus } from '@/lib/actions/payment/post/initiate-payment'
import { toast } from 'react-hot-toast'

interface PaymentStatusProps {
  transactionUUID: string
  productCode: string
  totalAmount: number
  initialStatus?: string
  showVerifyButton?: boolean
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETE':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-600" />
    case 'CANCELED':
    case 'FAILED':
      return <XCircle className="h-5 w-5 text-red-600" />
    case 'AMBIGUOUS':
      return <AlertCircle className="h-5 w-5 text-orange-600" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETE':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CANCELED':
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    case 'AMBIGUOUS':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function PaymentStatus({
  transactionUUID,
  productCode,
  totalAmount,
  initialStatus = 'PENDING',
  showVerifyButton = true
}: PaymentStatusProps) {
  const [status, setStatus] = useState(initialStatus)
  const [refId, setRefId] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  const handleVerifyStatus = async () => {
    setVerifying(true)
    try {
      const response = await checkPaymentStatus(transactionUUID, productCode, totalAmount)
      
      if (response.success && response.data) {
        setStatus(response.data.status)
        setRefId(response.data.ref_id || null)
        toast.success('Payment status updated')
      } else {
        toast.error(response.error || 'Failed to verify payment status')
      }
    } catch (error) {
      console.error('Status verification error:', error)
      toast.error('Error verifying payment status')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(status)}
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Transaction ID:</span>
            <p className="font-mono text-xs mt-1">{transactionUUID}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Amount:</span>
            <p className="font-mono text-sm mt-1">Rs. {totalAmount}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span>
            <Badge className={`mt-1 ${getStatusColor(status)}`}>
              {status}
            </Badge>
          </div>
          {refId && (
            <div>
              <span className="font-medium text-gray-600">Reference ID:</span>
              <p className="font-mono text-xs mt-1">{refId}</p>
            </div>
          )}
        </div>

        {showVerifyButton && (
          <Button
            onClick={handleVerifyStatus}
            disabled={verifying}
            variant="outline"
            className="w-full"
          >
            {verifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verify Status
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-gray-500">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useUserStore } from '@/lib/store/user-store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Star,
  X,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { get_cookies } from '@/lib/utils/get-cookies'
import { getBackEndUrl } from '@/lib/utils/get-backend-url'
import { useGetSellerOrders } from '@/lib/hooks/tanstack-query/query-hook/products/use-get-seller-orders'
import { useGetSellerProducts } from '@/lib/hooks/tanstack-query/query-hook/products/use-get-seller-products'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types for seller data
interface ProductWithQuantity {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  discount: number
  sellerId: string
  category: any
  images: string[]
  stock: number
  createdAt: string
  updatedAt: string
  boughtQuantity: number
}

interface Order {
  id: string
  userId: string
  amount: number
  products: ProductWithQuantity[]
  transactionId: string
  status: string
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  sellerId: string
  createdAt: string
  updatedAt: string
}

interface OrdersResponse {
  success: boolean
  data: {
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }
  error?: string
}

interface ProductsResponse {
  success: boolean
  data: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }
  error?: string
}

// Badge component for order status
const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock }
      case 'processing':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: RefreshCw }
      case 'shipped':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck }
      case 'delivered':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package }
    }
  }

  const config = getStatusConfig(status)
  const IconComponent = config.icon

  return (
    <Badge className={cn("flex items-center gap-1 border", config.color, className)}>
      <IconComponent className="h-3 w-3" />
      {status}
    </Badge>
  )
}

function SellerDashboard() {
  const { user } = useUserStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showStockModal, setShowStockModal] = useState(false)

  // React Query hooks
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError, 
    refetch: refetchOrders 
  } = useGetSellerOrders()

  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError, 
    refetch: refetchProducts 
  } = useGetSellerProducts()

  // Extract data
  const orders = ordersData?.data?.orders || []
  const products = productsData?.products || []

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const user_token = await get_cookies('user_token')
      if (!user_token) {
        throw new Error('Authentication required')
      }

      const backendUrl = await getBackEndUrl()
      const response = await fetch(`${backendUrl}/api/v1/orders/seller/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `user_token=${user_token};`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update order status')
      }

      return data
    },
    onSuccess: () => {
      toast.success('Order status updated successfully')
      queryClient.invalidateQueries({ queryKey: ['get-seller-orders'] })
      handleCloseOrderDetails()
    },
    onError: (error: Error) => {
      console.error('Error updating order status:', error)
      toast.error(error.message || 'Failed to update order status')
    }
  })

  // Update product stock mutation
  const updateProductStockMutation = useMutation({
    mutationFn: async ({ productId, stock }: { productId: string; stock: number }) => {
      const user_token = await get_cookies('user_token')
      if (!user_token) {
        throw new Error('Authentication required')
      }

      const backendUrl = await getBackEndUrl()
      const response = await fetch(`${backendUrl}/api/v1/orders/seller/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `user_token=${user_token};`
        },
        body: JSON.stringify({ stock })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update product stock')
      }

      return data
    },
    onSuccess: () => {
      toast.success('Product stock updated successfully')
      queryClient.invalidateQueries({ queryKey: ['get-seller-products'] })
      setShowStockModal(false)
      setEditingProduct(null)
    },
    onError: (error: Error) => {
      console.error('Error updating product stock:', error)
      toast.error(error.message || 'Failed to update product stock')
    }
  })



  const handleOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus })
  }

  const handleUpdateStock = async (productId: string, newStock: number) => {
    updateProductStockMutation.mutate({ productId, stock: newStock })
  }

  const openStockModal = (product: Product) => {
    setEditingProduct(product)
    setShowStockModal(true)
  }

  // Handle error states
  if (ordersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="h-24 w-24 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Error Loading Orders</h2>
          <p className="text-gray-500 mb-6">{ordersError.message}</p>
          <Button onClick={() => refetchOrders()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="h-24 w-24 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Error Loading Products</h2>
          <p className="text-gray-500 mb-6">{productsError.message}</p>
          <Button onClick={() => refetchProducts()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600">Manage your products and orders</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="flex-1"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('orders')}
              className="flex-1"
            >
              Orders
            </Button>
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('products')}
              className="flex-1"
            >
              Products
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{ordersData?.data?.pagination.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{productsData?.pagination.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold">
                      {orders.filter((o: Order) => o.status === 'created').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold">
                      Rs. {orders.reduce((sum: number, o: Order) => sum + o.amount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => refetchOrders()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders found</h2>
                  <p className="text-gray-500">Orders will appear here when customers make purchases.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">#{order.transactionId}</h3>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Customer ID: {order.userId.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">Rs. {order.amount}</p>
                          <p className="text-sm text-gray-500">{order.products.length} items</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Products</h2>
              <Button onClick={() => refetchProducts()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {productsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">No products found</h2>
                  <p className="text-gray-500">Add some products to start selling.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={128}
                              height={128}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-green-600">Rs. {product.price}</p>
                          <Badge variant="outline">Stock: {product.stock}</Badge>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStockModal(product)}
                          className="w-full"
                        >
                          Update Stock
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Order #{selectedOrder.transactionId}</h2>
                  <p className="text-gray-600">Order Details</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseOrderDetails}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Order Status</h3>
                    <StatusBadge status={selectedOrder.status} className="text-base" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name || 'Product'}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name || `Product ${product.id}`}</h4>
                          <p className="text-sm text-gray-500">Qty: {product.boughtQuantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Rs. {product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-green-600">Rs. {selectedOrder.amount}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Update Order Status</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['created', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Update Modal */}
        {showStockModal && editingProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Update Stock</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowStockModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={editingProduct.name}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input
                    id="currentStock"
                    value={editingProduct.stock}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="newStock">New Stock</Label>
                  <Input
                    id="newStock"
                    type="number"
                    min="0"
                    defaultValue={editingProduct.stock}
                    className="mt-1"
                    onChange={(e) => {
                      const newStock = parseInt(e.target.value) || 0
                      setEditingProduct({ ...editingProduct, stock: newStock })
                    }}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleUpdateStock(editingProduct.id, editingProduct.stock)}
                    className="flex-1"
                  >
                    Update Stock
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowStockModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerDashboard

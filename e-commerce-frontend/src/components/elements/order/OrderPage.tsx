"use client"
import React, { useState } from "react"
import { useUserStore } from "@/lib/store/user-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Search,
  Eye,
  RefreshCw,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Tag,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { useGetAllUserOrders } from "@/lib/hooks/tanstack-query/query-hook/products/use-get-all-user-orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { get_cookies } from "@/lib/utils/get-cookies"
import { getBackEndUrl } from "@/lib/utils/get-backend-url"
import { cancelOrder } from "@/lib/actions/order/delete/cancel-order"

// Types for order data
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

// Badge component for order status
const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
        return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock }
      case "processing":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: RefreshCw }
      case "shipped":
        return { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck }
      case "delivered":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle }
      case "cancelled":
        return { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle }
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Package }
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

const CategoryDisplay = ({ category }: { category: any }) => {
  if (!category) return null

  if (Array.isArray(category)) {
    return (
      <div className="flex flex-wrap gap-1">
        {category.map((cat: any, index: number) => (
          <Badge key={index} variant="secondary" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {cat.Key}: {cat.Value}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <Badge variant="secondary" className="text-xs">
      <Tag className="h-3 w-3 mr-1" />
      {category}
    </Badge>
  )
}

function OrderPage() {
  const { user } = useUserStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  // Fetch orders using React Query
  const { data: ordersData, isLoading, error, refetch } = useGetAllUserOrders()
  console.log("this is order data ; ", ordersData)

  // Cancel order mutation
  const cancelOrderMutation = async (orderId: string) => {
    try {
      const response = await cancelOrder(orderId)
      if (response.success) {
        toast.success(response.message || "Order cancelled successfully")
        queryClient.invalidateQueries({ queryKey: ["get-all-user-orders"] })
      } else {
        toast.error(response.error as string || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Failed to cancel order")
    }
  }

  // Extract orders from query data
  const orders = ordersData?.data || []

  // Filter orders based on search and status
  const filteredOrders = React.useMemo(() => {
    let filtered = orders

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order: Order) => order.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order: Order) =>
          order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.products.some(
            (item: ProductWithQuantity) =>
              item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (Array.isArray(item.category) &&
                item.category.some((cat: any) => cat.Value?.toLowerCase().includes(searchTerm.toLowerCase()))),
          ),
      )
    }

    return filtered
  }, [orders, searchTerm, statusFilter])

  // Group orders by date
  const groupedOrders = React.useMemo(() => {
    const groups: { [key: string]: Order[] } = {}

    filteredOrders.forEach((order: Order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(order)
    })

    // Sort dates in descending order (newest first)
    return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
  }, [filteredOrders])

  const handleOrderDetails = (order: Order) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(order.id)) {
        newSet.delete(order.id)
      } else {
        newSet.add(order.id)
      }
      return newSet
    })
  }

  const isOrderExpanded = (orderId: string) => {
    return expandedOrders.has(orderId)
  }


  const handleReorder = (order: Order) => {
    // Here you would typically add items back to cart
    toast.success("Items added to cart for reorder")
    router.push("/cart/checkout")
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="h-24 w-24 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Error Loading Orders</h2>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <Button onClick={() => refetch()}>
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/products">
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                  <p className="text-gray-600 mt-1">Track and manage your orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                      Search Orders
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        type="text"
                        placeholder="Search by order number, product name, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="w-full lg:w-64">
                    <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                      Filter by Status
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-11">
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
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredOrders.length}</span> of{" "}
                    <span className="font-semibold">{orders.length}</span> orders
                  </div>
                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-8">
            {groupedOrders.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders found</h2>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all"
                      ? "No orders match your current filters. Try adjusting your search criteria."
                      : "You haven't placed any orders yet. Start shopping to see your orders here."}
                  </p>
                  {searchTerm || statusFilter !== "all" ? (
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Link href="/products">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Package className="h-5 w-5 mr-2" />
                        Start Shopping
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              groupedOrders.map(([date, dateOrders]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200"></div>
                    <div className="bg-white px-6 py-3 rounded-full shadow-sm border">
                      <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        {date}
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200"></div>
                  </div>

                  {/* Orders for this date */}
                  <div className="space-y-4">
                    {dateOrders.map((order: Order) => (
                      <Card
                        key={order.id}
                        className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold text-gray-900">{order.transactionId}</h3>
                                <StatusBadge status={order.status} />
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {new Date(order.createdAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Transaction ID
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-green-600">${order.amount.toFixed(2)}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {order.products.length} {order.products.length === 1 ? "item" : "items"}
                              </p>
                            </div>
                          </div>

                          <div className="mb-6">
                            <div className="flex items-center gap-4">
                              {order.products.slice(0, 4).map((item: ProductWithQuantity, index: number) => (
                                <div key={item.id} className="relative group">
                                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <Image
                                      src={item.images[0] || "/api/placeholder/60/60"}
                                      alt={item.name || "Product Image"}
                                      width={64}
                                      height={64}
                                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                  {index === 3 && order.products.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                      <span className="text-white text-sm font-semibold">
                                        +{order.products.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {order.products.length > 4 && (
                                <div className="text-sm text-gray-500 ml-2">
                                  and {order.products.length - 4} more items
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOrderDetails(order)}
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {isOrderExpanded(order.id) ? "Hide Details" : "View Details"}
                              </Button>
                              {order.status === "delivered" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReorder(order)}
                                  className="hover:bg-green-50 hover:border-green-300"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reorder
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {order.status === "created" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelOrderMutation(order.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                                >
                                  Cancel Order
                                </Button>
                              )}
                              {order.transactionId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-blue-50 hover:border-blue-300 bg-transparent"
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  Track
                                </Button>
                              )}
                            </div>
                          </div>

                          {isOrderExpanded(order.id) && (
                            <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 rounded-b-lg">
                              <div className="space-y-6">
                                {/* Order Status */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold mb-3 text-gray-900">Order Status</h3>
                                    <StatusBadge status={order.status} className="text-base px-4 py-2" />
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                                    <p className="font-semibold text-gray-900">
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h3 className="font-semibold mb-4 text-gray-900">Order Items</h3>
                                  <div className="space-y-4">
                                    {order.products.map((item: ProductWithQuantity) => (
                                      <div
                                        key={item.id}
                                        className="flex items-start gap-4 p-4 bg-white border rounded-xl shadow-sm"
                                      >
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                          <Image
                                            src={item.images[0] || "/api/placeholder/80/80"}
                                            alt={item.name || "Product Image"}
                                            width={80}
                                            height={80}
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                                          <div className="space-y-2">
                                            <div>
                                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Categories
                                              </span>
                                              <div className="mt-1">
                                                <CategoryDisplay category={item.category} />
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                              <span className="text-gray-500">
                                                Stock: <span className="font-medium text-gray-700">{item.stock}</span>
                                              </span>
                                              <span className="text-gray-500">
                                                Quantity:{" "}
                                                <span className="font-medium text-gray-700">{item.boughtQuantity}</span>
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <p className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
                                          {item.discount > 0 && (
                                            <div className="mt-1">
                                              <Badge variant="destructive" className="text-xs">
                                                {item.discount}% OFF
                                              </Badge>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-white border rounded-xl p-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Order Total</span>
                                    <span className="text-3xl font-bold text-green-600">
                                      ${order.amount.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderPage

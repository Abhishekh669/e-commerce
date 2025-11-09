"use client"

import { useGetAllUserOrders } from "@/lib/hooks/tanstack-query/query-hook/products/use-get-all-user-orders"
import { useVerifyUserToken } from "@/lib/hooks/tanstack-query/query-hook/user/useGetUserFromToken"
import Header from "./landing-page/Header"

interface ProductWithQuantity {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  discount: number
  sellerId: string
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

interface OrdersResponse {
  data: Order[]
}

interface User {
  createdAt: string
  email: string
  id: string
  isVerified: boolean
  role: string
  updatedAt: string
  userName: string
}

function UserProfilePage() {
  const { data: userData, isLoading: userLoading, error: userError } = useVerifyUserToken()
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useGetAllUserOrders()
  
  console.log("this is user data: ", userData)
  console.log("this is orders data: ", ordersData)

  const user = userData?.user as User
  const orders = (ordersData as OrdersResponse)?.data || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return (amount / 100).toFixed(2)
  }

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4 lg:mb-0"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          
          {/* User Info Skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-12">
            <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Section Skeleton */}
          <div>
            <div className="h-7 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If user is not available, show a different UI
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              👤
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-gray-600 mb-6">Please log in to view your profile information.</p>
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={() => (window.location.href = "/auth/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
        <Header />
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* User Information Section */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 lg:mb-0">My Profile</h1>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.userName ? user?.userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.userName || "User"}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Username</label>
              <p className="text-gray-900 font-medium">{user.userName || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</label>
              <p className="text-gray-900 font-medium">{user.email || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role</label>
              <p className="text-gray-900 font-medium capitalize">{user.role || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</label>
              <p className="text-gray-900 font-medium">
                {user.isVerified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Verification
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Member Since
              </label>
              <p className="text-gray-900 font-medium">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Last Updated
              </label>
              <p className="text-gray-900 font-medium">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

        {ordersLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="animate-pulse">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : ordersError ? (
          <div className="bg-white rounded-xl p-8 text-center border border-red-200">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-red-600 mb-4">Error loading orders. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => (window.location.href = "/products")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 font-mono">{order.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            order.status.toLowerCase() === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status.toLowerCase() === "shipping"
                                ? "bg-blue-100 text-blue-800"
                                : order.status.toLowerCase() === "paid and processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status.toLowerCase() === "created"
                                    ? "bg-gray-100 text-gray-800"
                                    : order.status.toLowerCase() === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {order.products.length} item{order.products.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-900">${formatCurrency(order.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default UserProfilePage
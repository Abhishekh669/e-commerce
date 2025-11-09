"use client"
import { useCartStore } from "@/lib/store/cart-store"
import { useUserStore } from "@/lib/store/user-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Package,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  Heart,
  Truck,
  Lock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { intiatePaymentAction } from "@/lib/actions/payment/post/initiate-payment"

// Badge component
const Badge = ({ children, className, variant, ...props }: any) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variant === "secondary" && "bg-blue-100 text-blue-700",
      variant === "outline" && "border border-gray-300 text-gray-700 bg-white",
      className,
    )}
    {...props}
  >
    {children}
  </span>
)

function CartCheckOutPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { user } = useUserStore()
  const router = useRouter()

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const shipping = totalItems > 0 ? (subtotal > 50 ? 0 : 5.99) : 0
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      toast.success("Item removed from cart")
    } else {
      const item = items.find((item) => item.id === itemId)
      if (item && item.cartItemId) {
        updateQuantity(item.cartItemId, newQuantity)
        toast.success("Quantity updated")
      } else {
        toast.error("Item not found in cart")
      }
    }
  }

  const handleRemoveItem = (itemId: string) => {
    const item = items.find((item) => item.id === itemId)
    if (item && item.cartItemId) {
      removeItem(item.cartItemId)
      toast.success("Item removed from cart")
    } else {
      toast.error("Item not found in cart")
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      const callbackUrl = encodeURIComponent("/products/checkout")
      router.push(`/login?callback=${callbackUrl}`)
      toast.error("Please login to purchase")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    try {
      toast.loading("Initiating payment...", { id: "payment" })

      const cartItems = items.map((item) => ({
        id: item.id,
        sellerId: item.sellerId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }))

      const response = await intiatePaymentAction(cartItems)

      if (response.success && response.url) {
        toast.success("Redirecting to eSewa payment...", { id: "payment" })
        sessionStorage.setItem("pendingOrderItems", JSON.stringify(items))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cartCleared"))
        }
        window.location.href = response.url
      } else {
        toast.error(response.error || "Payment initiation failed", { id: "payment" })
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("An unexpected error occurred", { id: "payment" })
    }
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Link href="/products">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-500 text-sm">Your cart is empty</p>
              </div>
            </div>

            {/* Empty State */}
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12 md:py-16">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-gray-100 p-4">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
                <Link href="/products">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Package className="h-5 w-5 mr-2" />
                    Start Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/products">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 text-sm">
                {totalItems} {totalItems === 1 ? "item" : "items"} in cart
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b bg-gray-50 px-4 md:px-6 py-4">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-gray-900">
                    <ShoppingCart className="h-5 w-5" />
                    Cart Items ({totalItems})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                          {/* Product Image */}
                          <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 96px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base md:text-lg text-gray-900 line-clamp-2">
                              {item.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                              {item.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                              {item.brand && (
                                <Badge variant="outline" className="text-xs">
                                  {item.brand}
                                </Badge>
                              )}
                            </div>
                            <p className="text-green-600 font-bold text-lg">${item.price.toFixed(2)}</p>
                          </div>

                          {/* Quantity & Actions */}
                          <div className="flex flex-col sm:flex-col-reverse items-stretch sm:items-center justify-between gap-3 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-full sm:w-auto sm:justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="h-8 w-8 hover:bg-gray-200"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = Number.parseInt(e.target.value) || 1
                                  handleQuantityChange(item.id, newQuantity)
                                }}
                                className="w-12 text-center border-0 bg-transparent p-0 focus:ring-0"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="h-8 w-8 hover:bg-gray-200"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <p className="font-semibold text-base md:text-lg text-gray-900 text-right sm:text-center">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clear Cart */}
                  {items.length > 0 && (
                    <div className="p-4 md:p-6 border-t bg-gray-50">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Items
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm sticky top-4">
                <CardHeader className="border-b bg-gray-50 px-4 md:px-6 py-4">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-gray-900">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-6">
                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                        <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Shipping</span>
                        </div>
                        <span className="text-gray-900 font-medium">
                          {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-base md:text-lg font-bold">
                          <span>Total</span>
                          <span className="text-green-600">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                      <h4 className="font-semibold text-blue-900 text-sm">Why shop with us?</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">✓</span> Free shipping on orders over $50
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">✓</span> 30-day return policy
                        </li>
                        <li className="flex items-center gap-2">
                          <Lock className="h-3 w-3 text-blue-600" /> Secure checkout
                        </li>
                      </ul>
                    </div>

                    {/* Login Warning */}
                    {!user && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-800 text-sm">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">Login required to checkout</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={handlePurchase}
                        disabled={items.length === 0}
                        size="lg"
                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {user ? "Proceed to Payment" : "Login to Purchase"}
                      </Button>

                      {user && (
                        <Button
                          variant="outline"
                          className="w-full h-11 bg-transparent"
                          onClick={() => toast.success("Items saved for later!")}
                        >
                          <Heart className="h-5 w-5 mr-2" />
                          Save for Later
                        </Button>
                      )}

                      <Link href="/products" className="block">
                        <Button variant="outline" className="w-full h-11 bg-transparent">
                          <Package className="h-5 w-5 mr-2" />
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartCheckOutPage

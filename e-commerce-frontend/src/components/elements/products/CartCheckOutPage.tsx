"use client"
import React, { useState } from 'react'
import { useCartStore } from '@/lib/store/cart-store'
import { useUserStore } from '@/lib/store/user-store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Heart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { intiatePaymentAction } from '@/lib/actions/payment/post/initiate-payment'

// Badge component - using inline styles for now
const Badge = ({ children, className, variant, ...props }: any) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variant === "secondary" && "bg-gray-100 text-gray-800",
      variant === "outline" && "border border-gray-300 text-gray-700 bg-white",
      className
    )}
    {...props}
  >
    {children}
  </span>
)

function CartCheckOutPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  console.log("this ishte items : ",items)
  const { user } = useUserStore()
  const router = useRouter()


  // Calculate totals
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const shipping = totalItems > 0 ? 5.99 : 0 // Fixed shipping cost
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      toast.success('Item removed from cart')
    } else {
      // Find the item by product ID and update its quantity
      const item = items.find(item => item.id === itemId)
      if (item && item.cartItemId) {
        updateQuantity(item.cartItemId, newQuantity)
        toast.success('Quantity updated')
      } else {
        toast.error('Item not found in cart')
      }
    }
  }

  // Handle item removal
  const handleRemoveItem = (itemId: string) => {
    // Find the item by product ID and remove it using cartItemId
    const item = items.find(item => item.id === itemId)
    if (item && item.cartItemId) {
      removeItem(item.cartItemId)
      toast.success('Item removed from cart')
    } else {
      toast.error('Item not found in cart')
    }
  }

  // Handle purchase
  const handlePurchase = async () => {
    if (!user) {
      // Redirect to login with callback URL
      const callbackUrl = encodeURIComponent('/products/checkout')
      router.push(`/login?callback=${callbackUrl}`)
      toast.error('Please login to purchase')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      // Show loading state
      toast.loading('Initiating payment...', { id: 'payment' });
      
      // Convert cart items to the format expected by the payment action
      const cartItems = items.map(item => ({
        id: item.id,
        sellerId: item.sellerId,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }))
      
      const response = await intiatePaymentAction(cartItems)
      
      if (response.success && response.url) {
        toast.success('Redirecting to eSewa payment...', { id: 'payment' });
        
        // Store cart items in session storage for order creation
        sessionStorage.setItem('pendingOrderItems', JSON.stringify(items));
        
        // Clear the current cart state since items are now in session storage
        // This prevents duplicate items if user navigates back
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartCleared'));
        }
        
        // Redirect to eSewa payment page
        window.location.href = response.url;
      } else {
        toast.error(response.error || 'Payment initiation failed', { id: 'payment' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An unexpected error occurred', { id: 'payment' });
    }
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          </div>

          {/* Empty Cart Message */}
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Link href="/products">
                <Button size="lg">
                  <Package className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-gray-600">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart Items ({totalItems})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
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
                        <p className="text-green-600 font-semibold mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1
                            handleQuantityChange(item.id, newQuantity)
                          }}
                          className="w-16 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Benefits */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Purchase Benefits:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Free shipping on orders over $50</li>
                      <li>• 30-day return policy</li>
                      <li>• Secure payment processing</li>
                      <li>• Order tracking & updates</li>
                    </ul>
                  </div>

                  {/* Authentication Warning */}
                  {!user && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Login required to purchase</span>
                      </div>
                    </div>
                  )}

                  {/* Purchase Options */}
                  <div className="space-y-3">
                    {/* Buy Now Button */}
                    <Button
                      onClick={handlePurchase}
                      disabled={items.length === 0}
                      className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {user ? 'Buy Now' : 'Login to Purchase'}
                    </Button>

                    {/* Save for Later */}
                    {user && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          toast.success('Items saved for later!')
                        }}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Save for Later
                      </Button>
                    )}

                    {/* Continue Shopping */}
                    <Link href="/products">
                      <Button variant="outline" className="w-full">
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
  )
}

export default CartCheckOutPage

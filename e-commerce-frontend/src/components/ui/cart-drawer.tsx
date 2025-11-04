import React from 'react'
import { X, Plus, Minus, Trash2, ShoppingCart, Package, ArrowRight } from 'lucide-react'
import { Button } from './button'
import { useCartStore, CartItem } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/user-store'
import toast from 'react-hot-toast'

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { items, getTotalItems, getTotalPrice, updateQuantity, removeItem, clearCart } = useCartStore()
    const { user } = useUserStore()
    const router = useRouter()
    
    // Get computed values
    const totalItems = getTotalItems()
    const totalPrice = getTotalPrice()

    const handleQuantityChange = (item: CartItem, change: number) => {
        const newQuantity = item.quantity + change
        if (newQuantity > 0) {
            updateQuantity(item.cartItemId!, newQuantity)
        }
    }

    const handleCheckout = () => {
        if (!user) {
            // Redirect to login with callback URL
            const callbackUrl = encodeURIComponent('/products/checkout')
            router.push(`/login?callback=${callbackUrl}`)
            toast.error('Please login to checkout')
            onClose() // Close the drawer
            return
        }

        // Close drawer and redirect to checkout
        onClose()
        router.push('/products/checkout')
    }

    const handleContinueShopping = () => {
        onClose()
        router.push('/products')
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop with proper z-index */}
            <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />
            
            {/* Drawer with higher z-index */}
            <div className={cn(
                "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                    <div>
                        <h2 className="text-lg font-semibold">Shopping Cart</h2>
                        {totalItems > 0 && (
                            <p className="text-sm text-gray-500">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'} • ${totalPrice}
                            </p>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 bg-white">
                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <ShoppingCart className="h-16 w-16 mx-auto" />
                            </div>
                            <p className="text-gray-500">Your cart is empty</p>
                            <p className="text-sm text-gray-400 mb-4">Add some products to get started</p>
                            <Button 
                                variant="outline" 
                                onClick={handleContinueShopping}
                                className="mx-auto"
                            >
                                <Package className="h-4 w-4 mr-2" />
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.filter(item => item.cartItemId).map((item) => (
                                <div key={item.cartItemId!} className="flex gap-3 p-3 border rounded-lg bg-white">
                                    {/* Product Image */}
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h3>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">
                                                ${item.discount 
                                                    ? Math.round(item.price * (1 - item.discount / 100))
                                                    : item.price
                                                }
                                            </p>
                                            {item.discount && (
                                                <p className="text-xs text-gray-400 line-through">
                                                    ${item.price}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleQuantityChange(item, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-sm font-medium min-w-[2rem] text-center">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleQuantityChange(item, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:text-red-700"
                                            onClick={() => removeItem(item.cartItemId!)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t p-4 space-y-4 bg-white">
                        {/* Cart Summary */}
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Items:</span>
                                <span>{totalItems}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${totalPrice}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base text-gray-900">
                                <span>Total:</span>
                                <span>${totalPrice}</span>
                            </div>
                        </div>

                        {/* Authentication Warning */}
                        {!user && (
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                Please log in to proceed to checkout
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button 
                                className="w-full" 
                                size="lg"
                                onClick={handleCheckout}
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={handleContinueShopping}
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Continue Shopping
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" 
                                    onClick={clearCart}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

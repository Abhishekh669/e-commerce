import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    cartItemId?: string // Optional for input, will be set by store
    name: string
    price: number
    quantity: number
    image?: string
    category?: string
    brand?: string
    discount?: number
    rating ?: number;
    sellerId: string // Add seller ID to track which seller the product belongs to
}

interface CartStore {
    items: CartItem[]
    totalItems: number
    totalPrice: number
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    getItemQuantity: (productId: string, sellerId?: string) => number
    getTotalPrice: () => number
    getTotalItems: () => number
    getItemsBySeller: () => { [sellerId: string]: CartItem[] }
    getTotalPriceBySeller: (sellerId: string) => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            totalItems: 0,
            totalPrice: 0,

            addItem: (item: CartItem) => {
                set((state) => {
                    try {
                        // Create a unique identifier for the cart item including seller ID
                        const cartItemId = `${item.id}-${item.sellerId}-${item.category || 'no-category'}-${item.brand || 'no-brand'}`
                        
                        // Check if item with same properties and seller already exists
                        const existingItem = state.items.find(i => i.cartItemId === cartItemId)
                        
                        if (existingItem) {
                            // Update quantity if item already exists
                            const updatedItems = state.items.map(i =>
                                i.cartItemId === cartItemId
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            )
                            
                            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
                            const totalPrice = updatedItems.reduce((sum, item) => {
                                const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
                                return sum + (finalPrice * item.quantity)
                            }, 0)
                            

                            
                            return {
                                items: updatedItems,
                                totalItems,
                                totalPrice: Math.round(totalPrice)
                            }
                        } else {
                            // Add new item with unique cart ID
                            const newItem = { ...item, cartItemId }
                            const newItems = [...state.items, newItem]
                            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
                            const totalPrice = newItems.reduce((sum, item) => {
                                const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
                                return sum + (finalPrice * item.quantity)
                            }, 0)
                            

                            
                            return {
                                items: newItems,
                                totalItems,
                                totalPrice: Math.round(totalPrice)
                            }
                        }
                    } catch (error) {
                        console.error('Error adding item to cart:', error)
                        return state
                    }
                })
            },

            removeItem: (id: string) => {
                set((state) => {
                    const updatedItems = state.items.filter(i => i.cartItemId !== id)
                    const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
                    const totalPrice = updatedItems.reduce((sum, item) => {
                        const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
                        return sum + (finalPrice * item.quantity)
                    }, 0)
                    

                    
                    return {
                        items: updatedItems,
                        totalItems,
                        totalPrice: Math.round(totalPrice)
                    }
                })
            },

            updateQuantity: (id: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(id)
                    return
                }
                
                set((state) => {
                    const updatedItems = state.items.map(i =>
                        i.cartItemId === id ? { ...i, quantity } : i
                    )
                    const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
                    const totalPrice = updatedItems.reduce((sum, item) => {
                        const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
                        return sum + (finalPrice * item.quantity)
                    }, 0)
                    

                    
                    return {
                        items: updatedItems,
                        totalItems,
                        totalPrice: Math.round(totalPrice)
                    }
                })
            },

            clearCart: () => {
                set({
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                })
            },

            getItemQuantity: (productId: string, sellerId?: string) => {
                const state = get()
                try {
                    // Find items that match the product ID and seller ID
                    const matchingItems = state.items.filter(item => {
                        if (!item.cartItemId || typeof item.cartItemId !== 'string') {
                            return false
                        }
                        
                        if (sellerId) {
                            // If seller ID is provided, match both product ID and seller ID
                            return item.cartItemId.startsWith(`${productId}-${sellerId}-`)
                        } else {
                            // If no seller ID provided, match just the product ID
                            return item.cartItemId.startsWith(productId + '-')
                        }
                    })
                    
                    return matchingItems.reduce((total, item) => total + item.quantity, 0)
                } catch (error) {
                    console.error('Error getting item quantity:', error)
                    return 0
                }
            },

            // New function to get items grouped by seller
            getItemsBySeller: () => {
                const state = get()
                const sellerGroups: { [sellerId: string]: CartItem[] } = {}
                
                state.items.forEach(item => {
                    if (!sellerGroups[item.sellerId]) {
                        sellerGroups[item.sellerId] = []
                    }
                    sellerGroups[item.sellerId].push(item)
                })
                
                return sellerGroups
            },

            // New function to get total price by seller
            getTotalPriceBySeller: (sellerId: string) => {
                const state = get()
                const sellerItems = state.items.filter(item => item.sellerId === sellerId)
                const totalPrice = sellerItems.reduce((sum, item) => {
                    const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
                    return sum + (finalPrice * item.quantity)
                }, 0)
                return Math.round(totalPrice)
            },

            getTotalPrice: () => {
                const state = get()
                const totalPrice = state.items.reduce((sum, item) => {
                    const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
                    return sum + (finalPrice * item.quantity)
                }, 0)
                return Math.round(totalPrice)
            },

            getTotalItems: () => {
                const state = get()
                return state.items.reduce((sum, item) => sum + item.quantity, 0)
            }
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items })
        }
    )
)

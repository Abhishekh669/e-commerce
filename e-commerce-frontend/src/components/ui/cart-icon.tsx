import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from './button'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils'

interface CartIconProps {
    className?: string
    onClick?: () => void
    showCount?: boolean
}

export const CartIcon: React.FC<CartIconProps> = ({ 
    className, 
    onClick, 
    showCount = true 
}) => {
    const { totalItems } = useCartStore()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={cn("relative", className)}
        >
            <ShoppingCart className="h-5 w-5" />
            {showCount && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </Button>
    )
}

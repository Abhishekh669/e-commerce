"use client"
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Package, Eye, Edit, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  discount: number
  sellerId: string
  category: Record<string, string> | any
  images: string[]
  stock: number
  createdAt: string
  updatedAt: string
}

interface ProductCardProps {
  product: Product
  onView: (productId: string) => void
  onEdit: (productId: string) => void
  onDelete: (productId: string) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onEdit, onDelete }) => {
  const renderCategoryBadges = () => {
    if (!product.category || typeof product.category !== 'object') return null
    
    if (Array.isArray(product.category)) {
      return product.category.slice(0, 1).map((item: any, index: number) => (
        <span key={index} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
          {item.Value || item.value || String(item)}
        </span>
      ))
    } else {
      return Object.entries(product.category).slice(0, 1).map(([key, value]) => (
        <span key={key} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
          {String(value)}
        </span>
      ))
    }
  }

  // Calculate original price if there's a discount
  const originalPrice = product.discount > 0 ? product.price / (1 - product.discount / 100) : product.price
  const discountedPrice = product.discount > 0 ? product.price : null

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 bg-white rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
              -{product.discount}%
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
              Low Stock
            </div>
          )}
        </div>
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-white font-bold text-sm mb-1">Out of Stock</div>
              <div className="text-white text-xs opacity-90">Currently Unavailable</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight min-h-[2.5rem]" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.name}
        </h3>

        {/* Category badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {renderCategoryBadges()}
        </div>

        {/* Price */}
        <div className="mb-3">
          {product.discount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Stock Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-gray-600">
            Stock: <span className={
              product.stock === 0 ? 'text-red-600 font-bold' :
              product.stock <= 5 ? 'text-orange-600 font-semibold' : 
              'text-green-600 font-medium'
            }>{product.stock}</span>
          </div>
          <div className="text-xs text-gray-500">
            Qty: {product.quantity}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 font-medium shadow-sm" 
            onClick={(e) => {
              e.stopPropagation()
              onView(product.id)
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-2.5 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(product.id)
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(product.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

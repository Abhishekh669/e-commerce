"use client"
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  rating : number;
  createdAt: string
  updatedAt: string
}

interface ProductListItemProps {
  product: Product
  onView: (productId: string) => void
  onEdit: (productId: string) => void
  onDelete: (productId: string) => void
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, onView, onEdit, onDelete }) => {
  const renderCategoryBadges = () => {
    if (!product.category || typeof product.category !== 'object') return null
    
    if (Array.isArray(product.category)) {
      return product.category.slice(0, 3).map((item: any, index: number) => (
        <span key={index} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
          {item.Value || item.value || String(item)}
        </span>
      ))
    } else {
      return Object.entries(product.category).slice(0, 3).map(([key, value]) => (
        <span key={key} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
          {String(value)}
        </span>
      ))
    }
  }

  // Calculate original price if there's a discount
  const originalPrice = product.discount > 0 ? product.price / (1 - product.discount / 100) : product.price

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 bg-white rounded-xl">
      <CardContent className="p-5">
        <div className="flex gap-5">
          {/* Product Image */}
          <div className="w-24 h-24 relative rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-xs font-bold">Out of Stock</span>
              </div>
            )}
            {product.discount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                -{product.discount}%
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.name}
                </h3>

                <div>
                  Rating : {product.rating || 0}
                </div>
                
                {/* Category badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {renderCategoryBadges()}
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                {product.discount > 0 ? (
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{product.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  <span>Stock: <span className={
                    product.stock === 0 ? 'text-red-600 font-bold' :
                    product.stock <= 5 ? 'text-orange-600 font-semibold' : 
                    'text-green-600 font-medium'
                  }>{product.stock}</span></span>
                </div>
                <div className="font-medium">Qty: {product.quantity}</div>
                <div className="text-gray-500">Created: {new Date(product.createdAt).toLocaleDateString()}</div>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full text-xs">
                    Low Stock!
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 font-medium shadow-sm px-4"
                  onClick={() => onView(product.id)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors px-4"
                  onClick={() => onEdit(product.id)}
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors px-4"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

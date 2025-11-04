"use client"
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGetProductById } from '@/lib/hooks/tanstack-query/query-hook/seller/products/use-get-product-by-id'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
// Badge component - using inline styles for now
const Badge = ({ children, className, variant, ...props }: any) => (
  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
    variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
  } ${className}`} {...props}>
    {children}
  </span>
)
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Calendar, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { deleteProduct } from '@/lib/actions/seller/products/delete/delete-product'
import toast from 'react-hot-toast'

function ProductIdPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.productId as string

  const { data: product, isLoading, isError, error } = useGetProductById(productId)

  // Early return if no productId
  if (!productId) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Invalid product ID
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleDeleteProduct = async () => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?\n\nThis action cannot be undone.`)) {
      try {
        const result = await deleteProduct(productId)
        
        if (result.success) {
          toast.success(result.message || 'Product deleted successfully')
          router.push('/seller/products')
        } else {
          toast.error(String(result.error || 'Failed to delete product'))
        }
      } catch (error: any) {
        toast.error(`Failed to delete product: ${error.message}`)
      }
    }
  }

  const renderCategoryBadges = () => {
    if (!product?.category || typeof product.category !== 'object') return null
    
    if (Array.isArray(product.category)) {
      return product.category.map((item: any, index: number) => (
        <Badge key={index} variant="secondary" className="mr-2 mb-2">
          {item.Value || item.value || String(item)}
        </Badge>
      ))
    } else {
      return Object.entries(product.category).map(([key, value]) => (
        <Badge key={key} variant="secondary" className="mr-2 mb-2">
          <span className="font-medium">{key}:</span> {String(value)}
        </Badge>
      ))
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Error loading product: {error?.toString() || 'Product not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/seller/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">Product Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/seller/products/${productId}/edit-product`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteProduct}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Images */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="aspect-square relative rounded overflow-hidden bg-gray-50">
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-2xl font-bold text-green-600">${product.price}</p>
                  {product.discount > 0 && (
                    <p className="text-sm text-red-600">
                      {product.discount}% discount
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock</p>
                  <p className={`text-2xl font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock}
                  </p>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap">
                {renderCategoryBadges()}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductIdPage

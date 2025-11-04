"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGetProductById } from '@/lib/hooks/tanstack-query/query-hook/seller/products/use-get-product-by-id'
import { updateProduct } from '@/lib/actions/seller/products/put/update-product'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Textarea component - using inline styles for now
const Textarea = ({ className, ...props }: any) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
)
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function EditProductPage() {
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    discount: 0,
    stock: 0,
  })
  const [categoryPairs, setCategoryPairs] = useState<{key: string, value: string}[]>([{ key: '', value: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        quantity: product.quantity || 0,
        discount: product.discount || 0,
        stock: product.stock || 0,
      })

      // Handle categories
      if (product.category && typeof product.category === 'object') {
        if (Array.isArray(product.category)) {
          const pairs = product.category.map((item: any) => ({
            key: item.Key || item.key || '',
            value: item.Value || item.value || String(item)
          }))
          setCategoryPairs(pairs.length > 0 ? pairs : [{ key: '', value: '' }])
        } else {
          const pairs = Object.entries(product.category).map(([key, value]) => ({
            key,
            value: String(value)
          }))
          setCategoryPairs(pairs.length > 0 ? pairs : [{ key: '', value: '' }])
        }
      }
    }
  }, [product])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCategoryPair = () => {
    setCategoryPairs(prev => [...prev, { key: '', value: '' }])
  }

  const removeCategoryPair = (index: number) => {
    if (categoryPairs.length > 1) {
      setCategoryPairs(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateCategoryPair = (index: number, field: 'key' | 'value', value: string) => {
    setCategoryPairs(prev => 
      prev.map((pair, i) => 
        i === index ? { ...pair, [field]: value } : pair
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Product name is required')
        return
      }
      if (!formData.description.trim()) {
        toast.error('Product description is required')
        return
      }
      if (formData.price <= 0) {
        toast.error('Price must be greater than 0')
        return
      }

      // Build category object
      const categoryObj: Record<string, string> = {}
      categoryPairs.forEach(pair => {
        if (pair.key.trim() && pair.value.trim()) {
          categoryObj[pair.key.trim()] = pair.value.trim()
        }
      })

      if (Object.keys(categoryObj).length === 0) {
        toast.error('At least one category attribute is required')
        return
      }

      const updateData = {
        ...formData,
        sellerId: product?.sellerId || '',
        category: categoryObj,
        images: product?.images || [],
      }

      const result = await updateProduct(productId, updateData)

      if (result.success) {
        toast.success(result.message || 'Product updated successfully')
        router.push(`/seller/products/${productId}`)
      } else {
        toast.error(String(result.error || 'Failed to update product'))
      }
    } catch (error: any) {
      toast.error(`Failed to update product: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/seller/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Error loading product: {error?.message || 'Product not found or you may not have permission to edit this product'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!product && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/seller/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Product not found
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/seller/products/${productId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                disabled={isSubmitting}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement> ) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <Label>Category Attributes *</Label>
              <div className="space-y-3">
                {categoryPairs.map((pair, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Attribute name (e.g., Brand, Size, Color)"
                      value={pair.key}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCategoryPair(index, 'key', e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Attribute value (e.g., Nike, Large, Red)"
                      value={pair.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement> ) => updateCategoryPair(index, 'value', e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    {categoryPairs.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategoryPair(index)}
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCategoryPair}
                disabled={isSubmitting}
              >
                Add Category Attribute
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Updating...' : 'Update Product'}
              </Button>
              <Link href={`/seller/products/${productId}`}>
                <Button variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditProductPage

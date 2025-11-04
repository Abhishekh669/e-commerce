"use client"
import { useUserStore } from '@/lib/store/user-store'
import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Upload, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUploadThing } from '@/lib/utils/uploadthing-client'
import { removeMultipleImages } from '@/lib/actions/uploadthing/delete-images'
import { createProduct, type CreateProductRequest } from '@/lib/actions/seller/add-product/create-product'

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  price: z.number().min(1, 'Price must be at least 1').max(1000000, 'Price must be less than 1,000,000'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10000, 'Quantity must be less than 10,000'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  category: z.record(z.string(), z.string()).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'At least one category attribute is required' }
  ),
  stock: z.number().min(0, 'Stock cannot be negative').max(10000, 'Stock must be less than 10,000'),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
})

type ProductFormData = z.infer<typeof productSchema>

// Categories are now user-defined key-value pairs

function AddProductPage() {
  const { user } = useUserStore()
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [categoryPairs, setCategoryPairs] = useState<{key: string, value: string}[]>([{ key: '', value: '' }])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { startUpload } = useUploadThing("imageUploader")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', price: 0, quantity: 1,
      discount: 0, category: {}, stock: 0, images: [],
    }
  })

  // Handle file preview generation
  useEffect(() => {
    const newPreviewUrls: string[] = []
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviewUrls.push(reader.result as string)
        if (newPreviewUrls.length === files.length) {
          setPreviewUrls(newPreviewUrls)
        }
      }
      reader.readAsDataURL(file)
    })

    if (files.length === 0) {
      setPreviewUrls([])
    }
  }, [files])

  // Sync uploaded image URLs with form validation
  useEffect(() => {
    setValue('images', uploadedImageUrls)
  }, [uploadedImageUrls, setValue])

  // Sync category pairs with form data
  useEffect(() => {
    const categoryObj: Record<string, string> = {}
    categoryPairs.forEach(pair => {
      if (pair.key.trim() && pair.value.trim()) {
        categoryObj[pair.key.trim()] = pair.value.trim()
      }
    })
    setValue('category', categoryObj)
  }, [categoryPairs, setValue])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files
    if (!newFiles) return

    const fileArray = Array.from(newFiles)

    if (files.length + fileArray.length > 5) {
      toast.error("You can only upload up to 5 images")
      return
    }

    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`)
        return
      }
    }

    // Add files to preview immediately
    setFiles((prev) => [...prev, ...fileArray])
    
    // Upload files immediately
    setIsUploading(true)
    try {
      const uploadResults = await startUpload(fileArray)
      if (uploadResults) {
        const newImageUrls = uploadResults.map((result) => result.ufsUrl)
        setUploadedImageUrls((prev) => [...prev, ...newImageUrls])
        toast.success(`${fileArray.length} image(s) uploaded successfully!`)
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload images. Please try again.")
      // Remove files from preview if upload failed
      setFiles((prev) => prev.slice(0, -fileArray.length))
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = async (index: number) => {
    // Get the uploaded image URL to delete
    const imageUrlToDelete = uploadedImageUrls[index]
    
    if (imageUrlToDelete) {
      try {
        await removeMultipleImages([imageUrlToDelete])
        toast.success("Image deleted successfully")
      } catch (error) {
        console.error("Error deleting image:", error)
        toast.error("Failed to delete image from server")
      }
    }

    // Remove from local state
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Category management functions
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

  const onSubmit = async (data: ProductFormData) => {
    if (uploadedImageUrls.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Images are already uploaded, just use the URLs
      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        discount: data.discount,
        sellerId: user?.id || '',
        category: data.category,
        images: uploadedImageUrls,
        stock: data.stock
      }

      console.log('Product data to submit:', productData)
      
      // Call the actual create product API
      const response = await createProduct(productData)
      
      if (response.success) {
        toast.success(response.message || 'Product added successfully!')
        reset()
        setFiles([])
        setPreviewUrls([])
        setUploadedImageUrls([])
        setCategoryPairs([{ key: '', value: '' }])
        setValue('images', [])
      } else {
        // Show specific error message from the backend
        const errorMessage = response.error || 'Failed to create product'
        toast.error(errorMessage)
        console.error('Product creation failed:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      // More detailed error handling
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to add product. Please try again.'
      toast.error(errorMessage)
      console.error('Error adding product:', {
        error: error,
        response: error?.response?.data,
        message: error?.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>Please log in to add products.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Fill in the details below to add a new product to your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...register('name')} placeholder="Enter product name" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Category Attributes *</Label>
                <div className="space-y-3">
                  {categoryPairs.map((pair, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Attribute name (e.g., Brand, Size, Color)"
                        value={pair.key}
                        onChange={(e) => updateCategoryPair(index, 'key', e.target.value)}
                        disabled={isSubmitting || isUploading}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Attribute value (e.g., Nike, Large, Red)"
                        value={pair.value}
                        onChange={(e) => updateCategoryPair(index, 'value', e.target.value)}
                        disabled={isSubmitting || isUploading}
                        className="flex-1"
                      />
                      {categoryPairs.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCategoryPair(index)}
                          disabled={isSubmitting || isUploading}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCategoryPair}
                    disabled={isSubmitting || isUploading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category Attribute
                  </Button>
                </div>
                {errors.category?.message && <p className="text-sm text-red-500">{String(errors.category.message)}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            {/* Pricing and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" {...register('price', { valueAsNumber: true })} placeholder="0" min="0" />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" type="number" {...register('discount', { valueAsNumber: true })} placeholder="0" min="0" max="100" />
                {errors.discount && <p className="text-sm text-red-500">{errors.discount.message}</p>}
              </div>
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} placeholder="1" min="1" />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...register('stock', { valueAsNumber: true })} placeholder="0" min="0" />
                {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Product Images * (Max 5 images)
                <span className="text-sm text-gray-500 ml-2">({files.length}/5 images selected)</span>
              </Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple={true}
                      accept="image/*"
                      id="productImages"
                      className="hidden"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      disabled={files.length >= 5 || isSubmitting || isUploading}
                    />
                    <label
                      htmlFor="productImages"
                      className={`flex flex-col items-center justify-center ${
                        files.length >= 5 || isUploading
                          ? "opacity-50 cursor-not-allowed" 
                          : "cursor-pointer hover:bg-gray-100 rounded-lg p-4 transition-colors"
                      }`}
                    >
                      <Upload className="h-10 w-10 text-gray-600 mb-2" />
                      <span className="text-sm text-gray-600 font-medium">
                        {isUploading 
                          ? "Uploading images..." 
                          : files.length >= 5 
                            ? "Maximum 5 images reached" 
                            : "Drag & drop images or click to browse"
                        }
                      </span>
                      <span className="text-xs text-gray-500 mt-1">Max file size: 5MB each</span>
                    </label>
                  </div>
                </div>

                {previewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={isSubmitting}
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Upload clear photos of your product from different angles
                  </p>
                </div>
              </div>
              
              {errors.images && (
                <p className="text-sm text-red-500">{errors.images.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={async () => { 
                // Delete all uploaded images
                if (uploadedImageUrls.length > 0) {
                  try {
                    await removeMultipleImages(uploadedImageUrls)
                    toast.success("All images deleted successfully")
                  } catch (error) {
                    console.error("Error deleting images:", error)
                  }
                }
                
                reset(); 
                setFiles([]);
                setPreviewUrls([]);
                setUploadedImageUrls([]);
                setCategoryPairs([{ key: '', value: '' }]);
                setValue('images', []);
              }} disabled={isSubmitting || isUploading}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting 
                  ? 'Adding Product...' 
                  : isUploading 
                    ? 'Uploading Images...'
                    : 'Add Product'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddProductPage

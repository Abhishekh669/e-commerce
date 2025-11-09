"use client"
import { useState } from "react"
import { useProductId } from "@/lib/hooks/params/use-product-id"
import { useGetProductById } from "@/lib/hooks/tanstack-query/query-hook/seller/products/use-get-product-by-id"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, ShoppingCart, Star, ArrowLeft, Package, DollarSign, Tag, Minus, Plus, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/lib/store/cart-store"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { useUserStore } from "@/lib/store/user-store"
import { CartDrawer } from "@/components/ui/cart-drawer"
import { createComment, type ProductReviewFromClient } from "@/lib/actions/review/review"
import { getErrorMessage } from "@/lib/utils/get-error-message"

function ProductByIdPage() {
  const productId = useProductId()
  const router = useRouter()
  const { data: product, isLoading, isError, error, refetch } = useGetProductById(productId)

  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const { addItem, getItemQuantity, items } = useCartStore()
  const { user } = useUserStore()
  const [rating, setRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    if (!user) {
      const callbackUrl = encodeURIComponent(`/products/${productId}`)
      router.push(`/login?callback=${callbackUrl}`)
      toast.error("Please log in to post a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating before submitting")
      return
    }

    setSubmitting(true)
    try {
      const dataToSend: ProductReviewFromClient = {
        productId,
        userId: user.id,
        userName: user.userName,
        rating,
        comment: userComment,
      }

      const res = await createComment(dataToSend)
      if (res?.success && res?.message) {
        toast.success(res?.message || "successfully created comment")
        refetch()
      } else {
        throw new Error(getErrorMessage(error) || "failed to create comment")
      }
    } catch (error) {
      error = getErrorMessage(error)
      toast.error((error as string) || "failed to create comment")
    } finally {
      setSubmitting(false)
      setRating(0)
      setUserComment("")
    }
  }

  const getCategoryString = (category: any): string => {
    if (!category) return ""
    if (typeof category === "string") return category
    if (Array.isArray(category)) {
      return category
        .map((item) => {
          if (item?.Key) return item.Key
          if (item?.key) return item.key
          return String(item)
        })
        .filter(Boolean)
        .join(", ")
    }
    if (typeof category === "object") {
      return category?.Key || category?.key || ""
    }
    return ""
  }

  const getBrandString = (brand: any): string => {
    if (!brand) return ""
    if (typeof brand === "string") return brand
    if (Array.isArray(brand)) {
      return brand
        .map((item) => {
          if (item?.Key) return item.Key
          if (item?.key) return item.key
          return String(item)
        })
        .filter(Boolean)
        .join(", ")
    }
    if (typeof brand === "object") {
      return brand?.Key || brand?.key || ""
    }
    return ""
  }

  const handleAddToCart = () => {
    if (!product) return

    if (!user) {
      const callbackUrl = encodeURIComponent(`/products/${productId}`)
      router.push(`/login?callback=${callbackUrl}`)
      toast.error("Please log in to add items to cart")
      return
    }

    const existingQuantity = getItemQuantity(product.id)
    const categoryStr = getCategoryString(product.category)
    const brandStr = getBrandString(product.brand)

    if (existingQuantity > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: existingQuantity + quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        category: categoryStr,
        brand: brandStr,
        discount: product.discount,
        sellerId: product.sellerId,
        rating: product.rating,
      })
      toast.success(`Quantity updated! Total: ${existingQuantity + quantity}`)
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        category: categoryStr,
        brand: brandStr,
        discount: product.discount,
        sellerId: product.sellerId,
        rating: product.rating,
      })
      toast.success(`${quantity} ${quantity === 1 ? "item" : "items"} added to cart!`)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity)
    }
  }

  const toggleLike = () => {
    if (!user) {
      const callbackUrl = encodeURIComponent(`/products/${productId}`)
      router.push(`/login?callback=${callbackUrl}`)
      toast.error("Please log in to add items to favorites")
      return
    }

    setIsLiked(!isLiked)
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites")
  }

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index)
    setImageLoading(true)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const getTotalCartItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const formatReviewDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>Error loading product: {error?.toString() || "Product not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const cartQuantity = getItemQuantity(product.id)
  const discountedPrice =
    product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price

  const hasImages = product.images && product.images.length > 0
  const currentImage = hasImages ? product.images[selectedImageIndex] : null

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-4 w-full">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
              <p className="text-sm text-gray-600">Product Details</p>
            </div>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleLike}
              className={cn("h-10 w-10", isLiked && "text-red-500 border-red-500")}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </Button>

            <div className="relative">
              <Button variant="outline" size="icon" onClick={() => setIsCartOpen(true)} className="h-10 w-10">
                <ShoppingBag className="h-5 w-5" />
              </Button>

              {getTotalCartItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getTotalCartItems()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
              {currentImage ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <Image
                    src={currentImage || "/placeholder.svg"}
                    alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      imageLoading ? "opacity-0" : "opacity-100",
                    )}
                    onLoad={handleImageLoad}
                    priority={selectedImageIndex === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {product.discount > 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                  -{product.discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hasImages && product.images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={cn(
                      "aspect-square relative rounded overflow-hidden bg-gray-50 border-2 transition-all duration-200 hover:border-blue-300",
                      selectedImageIndex === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200",
                    )}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 18vw, 12vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div className="space-y-4">
            {/* Pricing & Stock Card */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Pricing & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">${discountedPrice}</p>
                    {product.discount > 0 && <p className="text-sm text-gray-500 line-through">${product.price}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Stock</p>
                    <p
                      className={cn(
                        "text-2xl sm:text-3xl font-bold",
                        product.stock <= 5 ? "text-red-600" : "text-green-600",
                      )}
                    >
                      {product.stock}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < (product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{product.rating || 4.0} rating</span>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quantity</Label>
                  {getItemQuantity(product.id) > 0 && (
                    <div className="text-xs text-blue-600 font-semibold bg-blue-50 p-2 rounded">
                      {getItemQuantity(product.id)} in cart
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="h-9 w-9"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="h-9 w-9"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full h-11 text-base font-semibold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>

                {!user && (
                  <div className="text-center text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                      Log in
                    </Link>{" "}
                    to add items
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{product.description}</p>
              </CardContent>
            </Card>

            {/* Categories Card */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categories & Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {getCategoryString(product.category) && (
                  <div>
                    <p className="text-gray-600 font-medium">Category</p>
                    <p className="text-gray-800">{getCategoryString(product.category)}</p>
                  </div>
                )}
                {getBrandString(product.brand) && (
                  <div>
                    <p className="text-gray-600 font-medium">Brand</p>
                    <p className="text-gray-800">{getBrandString(product.brand)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 space-y-6">
          {/* Leave a Review Card */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Leave a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Your Rating</Label>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} onClick={() => setRating(i + 1)} className="focus:outline-none">
                          <Star
                            className={cn(
                              "h-8 w-8 transition-all duration-150 cursor-pointer",
                              i < rating
                                ? "text-yellow-400 fill-yellow-400 scale-110"
                                : "text-gray-300 hover:text-yellow-300 hover:scale-105",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
                      Your Comment
                    </Label>
                    <textarea
                      id="comment"
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      placeholder="Share your thoughts about this product..."
                    />
                  </div>

                  <Button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full h-10 font-medium">
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                      Log in
                    </Link>{" "}
                    to leave a review
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Reviews */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Customer Reviews
                {product.reviews && product.reviews.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">({product.reviews.length})</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-5">
                  {product.reviews.map((review: any, index: number) => (
                    <div
                      key={review.id || index}
                      className={cn("pb-5", index !== product.reviews.length - 1 && "border-b border-gray-200")}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.userName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3.5 w-3.5",
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default ProductByIdPage

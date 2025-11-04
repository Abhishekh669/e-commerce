"use client"
import React, { useState } from 'react'
import { useProductId } from '@/lib/hooks/params/use-product-id'
import { useGetProductById } from '@/lib/hooks/tanstack-query/query-hook/seller/products/use-get-product-by-id';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, ShoppingCart, Star, ArrowLeft, Package, DollarSign, Calendar, Tag, Minus, Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart-store'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useUserStore } from '@/lib/store/user-store'
import { CartIcon } from '@/components/ui/cart-icon'
import { CartDrawer } from '@/components/ui/cart-drawer'

// Badge component for categories
const Badge = ({ children, className, variant, ...props }: any) => (
  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
    variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
  } ${className}`} {...props}>
    {children}
  </span>
)

function ProductByIdPage() {
  const productId = useProductId();
  const router = useRouter();
  const { data: product, isLoading, isError, error } = useGetProductById(productId);
  
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { addItem, getItemQuantity, items } = useCartStore();
  const { user } = useUserStore();

  // Helper function to get category string
  const getCategoryString = (category: any): string => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (Array.isArray(category)) {
      return category.map(item => {
        if (item && typeof item === 'object') {
          // Handle both lowercase and uppercase Key/Value properties
          if (item.Key && item.Value) {
            return `${item.Key}: ${item.Value}`;
          } else if (item.key && item.value) {
            return `${item.key}: ${item.value}`;
          } else if (item.Key) {
            return item.Key;
          } else if (item.key) {
            return item.key;
          } else if (item.Value) {
            return item.Value;
          } else if (item.value) {
            return item.value;
          }
        }
        return String(item);
      }).filter(Boolean).join(', ');
    }
    if (typeof category === 'object') {
      const categoryObj = category as { Key?: string; Value?: string; key?: string; value?: string; [key: string]: any };
      // Handle both lowercase and uppercase Key/Value properties
      if (categoryObj.Key && categoryObj.Value) {
        return `${categoryObj.Key}: ${categoryObj.Value}`;
      } else if (categoryObj.key && categoryObj.value) {
        return `${categoryObj.key}: ${categoryObj.value}`;
      } else if (categoryObj.Key) {
        return categoryObj.Key;
      } else if (categoryObj.key) {
        return categoryObj.key;
      } else if (categoryObj.Value) {
        return categoryObj.Value;
      } else if (categoryObj.value) {
        return categoryObj.value;
      } else {
        // Handle case where object has other properties
        const entries = Object.entries(categoryObj);
        if (entries.length > 0) {
          return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
        }
      }
      return JSON.stringify(categoryObj);
    }
    return '';
  };

  // Helper function to get brand string
  const getBrandString = (brand: any): string => {
    if (!brand) return '';
    if (typeof brand === 'string') return brand;
    if (Array.isArray(brand)) {
      return brand.map(item => {
        if (item && typeof item === 'object') {
          // Handle both lowercase and uppercase Key/Value properties
          if (item.Key && item.Value) {
            return `${item.Key}: ${item.Value}`;
          } else if (item.key && item.value) {
            return `${item.key}: ${item.value}`;
          } else if (item.Key) {
            return item.Key;
          } else if (item.key) {
            return item.key;
          } else if (item.Value) {
            return item.Value;
          } else if (item.value) {
            return item.value;
          }
        }
        return String(item);
      }).filter(Boolean).join(', ');
    }
    if (typeof brand === 'object') {
      const brandObj = brand as { Key?: string; Value?: string; key?: string; value?: string; [key: string]: any };
      // Handle both lowercase and uppercase Key/Value properties
      if (brandObj.Key && brandObj.Value) {
        return `${brandObj.Key}: ${brandObj.Value}`;
      } else if (brandObj.key && brandObj.value) {
        return `${brandObj.key}: ${brandObj.value}`;
      } else if (brandObj.Key) {
        return brandObj.Key;
      } else if (brandObj.key) {
        return brandObj.key;
      } else if (brandObj.Value) {
        return brandObj.Value;
      } else if (brandObj.value) {
        return brandObj.value;
      }
      return JSON.stringify(brandObj);
    }
    return '';
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if user is logged in
    if (!user) {
      // Redirect to login with callback to this product page
      const callbackUrl = encodeURIComponent(`/products/${productId}`);
      router.push(`/login?callback=${callbackUrl}`);
      toast.error('Please log in to add items to cart');
      return;
    }
    
    // Check if product is already in cart
    const existingQuantity = getItemQuantity(product.id);
    
    const categoryStr = getCategoryString(product.category);
    const brandStr = getBrandString(product.brand);
    
    if (existingQuantity > 0) {
      // Update existing item quantity instead of adding new one
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: existingQuantity + quantity, // Add new quantity to existing
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        category: categoryStr,
        brand: brandStr,
        discount: product.discount
      });
      toast.success(`Quantity updated! Total: ${existingQuantity + quantity}`);
    } else {
      // Add new item to cart
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        category: categoryStr,
        brand: brandStr,
        discount: product.discount
      });
      toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const toggleLike = () => {
    if (!user) {
      const callbackUrl = encodeURIComponent(`/products/${productId}`);
      router.push(`/login?callback=${callbackUrl}`);
      toast.error('Please log in to add items to favorites');
      return;
    }
    
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    setImageLoading(true);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Get total cart items count
  const getTotalCartItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const renderCategoryBadges = () => {
    if (!product?.category) return null;
    
    // Debug logging to see the actual category structure
    console.log('Category data:', product.category);
    console.log('Category type:', typeof product.category);
    console.log('Category is array:', Array.isArray(product.category));
    
    if (Array.isArray(product.category)) {
      return product.category.map((item: any, index: number) => {
        if (item && typeof item === 'object') {
          // Handle both lowercase and uppercase Key/Value properties
          if (item.Key && item.Value) {
            return (
              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                {item.Key}: {item.Value}
              </Badge>
            );
          } else if (item.key && item.value) {
            return (
              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                {item.key}: {item.value}
              </Badge>
            );
          } else if (item.Key) {
            return (
              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                {item.Key}
              </Badge>
            );
          } else if (item.key) {
            return (
              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                {item.key}
              </Badge>
            );
          } else if (item.Value) {
            return (
              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                {item.Value}
              </Badge>
            );
          } else if (item.value) {
            return (
              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                {item.value}
              </Badge>
            );
          }
        }
        // Fallback for any other format
        return (
          <Badge key={index} variant="secondary" className="mr-2 mb-2">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </Badge>
        );
      });
    } else if (typeof product.category === 'object' && product.category !== null) {
      const categoryObj = product.category as { Key?: string; Value?: string; key?: string; value?: string; [key: string]: any };
      // Handle both lowercase and uppercase Key/Value properties
      if (categoryObj.Key && categoryObj.Value) {
        return (
          <Badge variant="secondary" className="mr-2 mb-2">
            {categoryObj.Key}: {categoryObj.Value}
          </Badge>
        );
      } else if (categoryObj.key && categoryObj.value) {
        return (
          <Badge variant="secondary" className="mr-2 mb-2">
            {categoryObj.key}: {categoryObj.value}
          </Badge>
        );
      } else if (categoryObj.Key) {
        return (
          <Badge variant="secondary" className="mr-2 mb-2">
            {categoryObj.Key}
          </Badge>
        );
      } else if (categoryObj.key) {
        return (
          <Badge variant="secondary" className="mr-2 mb-2">
            {categoryObj.key}
          </Badge>
        );
      } else if (categoryObj.Value) {
        return (
          <Badge variant="secondary" className="mr-2 mb-2">
            {categoryObj.Value}
          </Badge>
        );
      } else if (categoryObj.value) {
        return (
          <Badge variant="secondary" className="mr-2 mb-2">
            {categoryObj.value}
          </Badge>
        );
      } else {
        // Handle case where object has other properties
        const entries = Object.entries(categoryObj);
        if (entries.length > 0) {
          return entries.map(([key, value], index) => (
            <Badge key={index} variant="secondary" className="mr-2 mb-2">
              {key}: {String(value)}
            </Badge>
          ));
        }
      }
    } else if (typeof product.category === 'string') {
      return (
        <Badge variant="secondary" className="mr-2 mb-2">
          {product.category}
        </Badge>
      );
    }
    
    // Final fallback - show the raw value for debugging
    return (
      <Badge variant="secondary" className="mr-2 mb-2">
        {typeof product.category === 'object' ? JSON.stringify(product.category) : String(product.category)}
      </Badge>
    );
  };

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
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Error loading product: {error?.toString() || 'Product not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const cartQuantity = getItemQuantity(product.id);
  const discountedPrice = product.discount > 0 
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images[selectedImageIndex] : null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/products">
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
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleLike}
            className={cn(
              "h-10 w-10",
              isLiked && "text-red-500 border-red-500"
            )}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </Button>
          
          {/* Cart Icon */}
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsCartOpen(true)}
              className="h-10 w-10"
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
            
            {/* Cart Badge */}
            {getTotalCartItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {getTotalCartItems()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-50">
                {currentImage ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                    <Image
                      src={currentImage}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      fill
                      className={cn(
                        "object-cover transition-opacity duration-300",
                        imageLoading ? "opacity-0" : "opacity-100"
                      )}
                      onLoad={handleImageLoad}
                      priority={selectedImageIndex === 0}
                    />
                  </>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {hasImages && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={cn(
                        "aspect-square relative rounded overflow-hidden bg-gray-50 border-2 transition-all duration-200",
                        selectedImageIndex === index 
                          ? "border-blue-500 ring-2 ring-blue-200" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 20vw, 15vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          {/* Basic Info & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-3xl font-bold text-green-600">${discountedPrice}</p>
                    {product.discount > 0 && (
                      <p className="text-sm text-red-600 line-through">
                        ${product.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stock</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      product.stock <= 5 ? 'text-red-600' : 'text-green-600'
                    )}>
                      {product.stock}
                    </p>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < (product.rating || 4) 
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.rating || 4.0})
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  
                  {/* Show current cart quantity if product exists in cart */}
                  {getItemQuantity(product.id) > 0 && (
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      Current in cart: {getItemQuantity(product.id)} {getItemQuantity(product.id) === 1 ? 'item' : 'items'}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full h-12 text-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 
                   getItemQuantity(product.id) > 0 ? 'Update Cart Quantity' : 'Add to Cart'}
                </Button>

                {/* Cart Quantity Indicator */}
                {getItemQuantity(product.id) > 0 && (
                  <div className="text-center text-sm text-blue-600 font-medium">
                    Already {getItemQuantity(product.id)} {getItemQuantity(product.id) === 1 ? 'item' : 'items'} in cart
                  </div>
                )}

                {/* Login Prompt for Unauthenticated Users */}
                {!user && (
                  <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p>Please <Link href="/login" className="text-blue-600 hover:underline">log in</Link> to add items to cart</p>
                  </div>
                )}
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
              
              {/* Debug info - remove this after fixing */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <p className="font-semibold mb-2">Debug Info:</p>
                  <p>Raw category: {JSON.stringify(product.category)}</p>
                  <p>Category type: {typeof product.category}</p>
                  <p>Is array: {Array.isArray(product.category).toString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart Summary */}
          {getTotalCartItems() > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Cart Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold">{getTotalCartItems()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-semibold text-green-600">
                      ${items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsCartOpen(true)}
                      className="flex-1"
                      variant="outline"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Cart
                    </Button>
                    <Button 
                      onClick={() => router.push('/products/checkout')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    > 
                      Checkout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Product Information
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-mono text-xs">{product.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}

export default ProductByIdPage

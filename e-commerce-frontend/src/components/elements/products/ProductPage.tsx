"use client"

import React, { useState, useMemo } from "react"
import { useGetAllProducts, type Product } from "@/lib/hooks/tanstack-query/query-hook/products/use-get-all-product"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Filter, ShoppingCart, Star, Eye, ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/store/cart-store"
import { CartDrawer } from "@/components/ui/cart-drawer"
import { useRouter } from "next/navigation"

export type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "rating" | "popularity"

export type ClientFilters = {
  search?: string | null
  category?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  brand?: string | null
  sortBy?: SortOption | null
}

const ProductPage = () => {
  const router = useRouter()

  const [filters, setFilters] = useState<ClientFilters>({
    search: "",
    category: "",
    brand: "",
    minPrice: null,
    maxPrice: null,
    sortBy: "newest",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const limit = 12

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetAllProducts(
    3,
    filters.search || undefined,
  )

  const { addItem, getItemQuantity, items } = useCartStore()

  // Helper functions for category and brand
  const getCategoryString = (category: any): string => {
    if (!category) return ""
    if (typeof category === "string") return category
    if (Array.isArray(category)) {
      return category
        .map((item) => {
          if (item && typeof item === "object" && item.key && item.value) {
            return `${item.key}: ${item.value}`
          }
          return ""
        })
        .filter(Boolean)
        .join(", ")
    }
    if (typeof category === "object") {
      const categoryObj = category as { key?: string; value?: string; [key: string]: any }
      if (categoryObj.key !== undefined && categoryObj.value !== undefined) {
        return categoryObj.value || categoryObj.key || ""
      }
      if (categoryObj.key !== undefined) {
        return categoryObj.key
      }
      if (categoryObj.value !== undefined) {
        return categoryObj.value
      }
      return JSON.stringify(categoryObj)
    }
    return ""
  }

  const getCategoryValues = (category: any): string[] => {
    if (!category) return []
    if (typeof category === "string") return [category]
    if (Array.isArray(category)) {
      return category
        .filter((item) => item && typeof item === "object" && item.value)
        .map((item) => item.value)
        .filter(Boolean)
    }
    if (typeof category === "object") {
      const categoryObj = category as { key?: string; value?: string; [key: string]: any }
      if (categoryObj.value) return [categoryObj.value]
      if (categoryObj.key) return [categoryObj.key]
    }
    return []
  }

  const productMatchesSearch = (product: Product, searchTerm: string): boolean => {
    if (!searchTerm || !product) return true

    const searchLower = searchTerm.toLowerCase()

    if (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.description && product.description.toLowerCase().includes(searchLower))
    ) {
      return true
    }

    const categoryValues = getCategoryValues(product.category)
    if (categoryValues.some((value) => value.toLowerCase().includes(searchLower))) {
      return true
    }

    if (product.brand) {
      const brandValues = getCategoryValues(product.brand)
      if (brandValues.some((value) => value.toLowerCase().includes(searchLower))) {
        return true
      }
    }

    return false
  }

  const getBrandString = (product: Product): string => {
    if (!product.brand) return ""
    if (typeof product.brand === "string") return product.brand
    if (Array.isArray(product.brand)) {
      return product.brand
        .map((item) => {
          if (item && typeof item === "object" && item.key && item.value) {
            return `${item.key}: ${item.value}`
          }
          return ""
        })
        .filter(Boolean)
        .join(", ")
    }
    if (typeof product.brand === "object") {
      const brandObj = product.brand as { key?: string; value?: string; [key: string]: any }
      if (brandObj.key !== undefined && brandObj.value !== undefined) {
        return brandObj.value || brandObj.key || ""
      }
      if (brandObj.key !== undefined) {
        return brandObj.key
      }
      if (brandObj.value !== undefined) {
        return brandObj.value
      }
      return JSON.stringify(brandObj)
    }
    return ""
  }

  const sortProducts = (products: Product[], sortBy: SortOption): Product[] => {
    const sorted = [...products]

    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case "popularity":
        return sorted.sort((a, b) => b.stock - a.stock)
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }

  const processedData = useMemo(() => {
    if (!data?.pages) return { products: [], total: 0, totalPages: 1 }

    const allProducts = data.pages.flatMap((page) => page.data?.products || [])

    let filteredProducts = allProducts.filter((product) => {
      if (!product) return false

      if (filters.search && filters.search !== "") {
        if (!productMatchesSearch(product, filters.search)) {
          return false
        }
      }

      if (filters.category && filters.category !== "") {
        if (!product.category) return false
        const categoryStr = getCategoryString(product.category)
        if (!categoryStr.toLowerCase().includes(filters.category.toLowerCase())) {
          return false
        }
      }

      if (filters.brand && filters.brand !== "") {
        if (!product.brand) return false
        const brandStr = getBrandString(product)
        if (!brandStr.toLowerCase().includes(filters.brand.toLowerCase())) {
          return false
        }
      }

      if (filters.minPrice !== null && filters.minPrice !== undefined) {
        if (product.price < filters.minPrice) return false
      }
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        if (product.price > filters.maxPrice) return false
      }

      return true
    })

    if (filters.sortBy) {
      filteredProducts = sortProducts(filteredProducts, filters.sortBy)
    }

    const totalProducts = filteredProducts.length
    const totalPages = Math.max(1, Math.ceil(totalProducts / limit))

    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
    if (currentPage !== validCurrentPage) {
      setCurrentPage(validCurrentPage)
    }

    const startIndex = (validCurrentPage - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      total: totalProducts,
      totalPages,
      hasMore: validCurrentPage < totalPages,
    }
  }, [data?.pages, filters, currentPage, limit])

  const handleLoadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage()
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    const totalLoadedProducts = data?.pages?.flatMap((page) => page.data?.products || []).length || 0
    const neededProducts = newPage * limit

    if (hasNextPage && !isFetchingNextPage && totalLoadedProducts < neededProducts) {
      handleLoadMore()
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const generatePageNumbers = () => {
    const totalPages = processedData.totalPages
    const current = currentPage
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }

    let prev = 0
    for (const i of range) {
      if (i - prev > 1) {
        rangeWithDots.push("...")
      }
      rangeWithDots.push(i)
      prev = i
    }

    return rangeWithDots
  }

  const getUniqueCategories = () => {
    if (!data?.pages) return []
    const allProducts = data.pages.flatMap((page) => page.data?.products || [])
    const categories = new Set<string>()

    allProducts.forEach((product) => {
      if (product && product.category) {
        if (Array.isArray(product.category)) {
          product.category.forEach((item) => {
            if (item && typeof item === "object" && item.key && item.value) {
              categories.add(`${item.key}: ${item.value}`)
            }
          })
        } else if (typeof product.category === "object") {
          const cat = product.category as { key?: string; value?: string; [key: string]: any }
          if (cat.key && cat.value) {
            categories.add(`${cat.key}: ${cat.value}`)
          }
        } else if (typeof product.category === "string") {
          categories.add(product.category)
        }
      }
    })

    return Array.from(categories).filter((cat) => cat.trim() !== "")
  }

  const getUniqueBrands = () => {
    if (!data?.pages) return []
    const allProducts = data.pages.flatMap((page) => page.data?.products || [])
    const brands = new Set<string>()

    allProducts.forEach((product) => {
      if (product && product.brand) {
        if (Array.isArray(product.brand)) {
          product.brand.forEach((item) => {
            if (item && typeof item === "object" && item.key && item.value) {
              brands.add(`${item.key}: ${item.value}`)
            }
          })
        } else if (typeof product.brand === "object") {
          const brand = product.brand as { key?: string; value?: string; [key: string]: any }
          if (brand.key && brand.value) {
            brands.add(`${brand.key}: ${brand.value}`)
          }
        } else if (typeof product.brand === "string") {
          brands.add(product.brand)
        }
      }
    })

    return Array.from(brands).filter((brand) => brand.trim() !== "")
  }

  const getPriceRange = () => {
    if (!data?.pages) return { min: 0, max: 0 }
    const allProducts = data.pages.flatMap((page) => page.data?.products || [])
    const prices = allProducts.filter((p) => p && typeof p.price === "number").map((p) => p.price)

    if (prices.length === 0) return { min: 0, max: 0 }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }

  const categories = getUniqueCategories()
  const brands = getUniqueBrands()
  const priceRange = getPriceRange()

  const handleFilterChange = (key: keyof ClientFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      brand: "",
      minPrice: null,
      maxPrice: null,
      sortBy: "newest",
    })
    setCurrentPage(1)
  }

  const handleAddToCart = (product: Product) => {
    const categoryStr = getCategoryString(product.category)
    const brandStr = getBrandString(product)

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      category: categoryStr,
      brand: brandStr,
      discount: product.discount,
      rating: product.rating,
      sellerId: product.sellerId,
    })
  }

  const handleViewProduct = (product: Product) => {
    router.push(`/products/${product.id}`)
  }

  const currentProducts = processedData.products
  const totalProducts = processedData.total
  const totalPages = processedData.totalPages

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading products: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Filter Toggle for Mobile */}
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="sm:hidden">
                {showFilters ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
              </Button>

              {/* Cart Button */}
              <div className="relative">
                <Button variant="outline" size="icon" onClick={() => setIsCartOpen(true)} className="h-10 w-10">
                  <ShoppingCart className="h-5 w-5" />
                </Button>

                {(() => {
                  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
                  return (
                    totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {totalItems}
                      </span>
                    )
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={cn("w-full lg:w-64 flex-shrink-0", showFilters ? "block" : "hidden lg:block")}>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Sort Filter */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Sort By</Label>
                  <Select
                    value={filters.sortBy || "newest"}
                    onValueChange={(value) => handleFilterChange("sortBy", value)}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                      Category
                    </Label>
                    <Select
                      value={filters.category || "all"}
                      onValueChange={(value) => handleFilterChange("category", value)}
                    >
                      <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Brand</Label>
                    <Select
                      value={filters.brand || "all"}
                      onValueChange={(value) => handleFilterChange("brand", value)}
                    >
                      <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range Filter */}
                {priceRange.max > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                      Price Range
                    </Label>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Min: ${filters.minPrice || 0}
                        </Label>
                        <Input
                          type="range"
                          min={priceRange.min}
                          max={priceRange.max}
                          value={filters.minPrice || priceRange.min}
                          onChange={(e) => handleFilterChange("minPrice", Number.parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Max: ${filters.maxPrice || priceRange.max}
                        </Label>
                        <Input
                          type="range"
                          min={priceRange.min}
                          max={priceRange.max}
                          value={filters.maxPrice || priceRange.max}
                          onChange={(e) => handleFilterChange("maxPrice", Number.parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                {(filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
                  <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={`skeleton-${i}`} className="animate-pulse">
                    <CardHeader className="p-0">
                      <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded mb-3 w-24"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded mb-2 w-20"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-5 rounded w-16"></div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 gap-2">
                      <div className="bg-gray-200 dark:bg-gray-700 h-9 rounded flex-1"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-9 w-10 rounded"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice
                      ? "No products match your current filters. Try adjusting your search criteria."
                      : "There are currently no products available."}
                  </p>
                  {(filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
                    <Button onClick={clearFilters} className="w-full">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {currentProducts.map((product: Product) => (
                    <Card
                      key={product.id}
                      className="group hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    >
                      {/* Image Container */}
                      <CardHeader className="p-0 relative overflow-hidden bg-gray-100 dark:bg-gray-700 h-48">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}

                        {/* Like Button */}
                        <button
                          onClick={() => toggleLike(product.id)}
                          className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow z-10"
                        >
                          <Heart
                            className={cn(
                              "h-5 w-5",
                              likedProducts.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-400",
                            )}
                          />
                        </button>

                        {/* Discount Badge */}
                        {product.discount && product.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            -{product.discount}%
                          </div>
                        )}
                      </CardHeader>

                      {/* Content */}
                      <CardContent className="flex-1 p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 text-sm">
                          {product.name}
                        </h3>

                        {product.category && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                            {getCategoryString(product.category)}
                          </p>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3.5 w-3.5",
                                  i < Math.floor(product.rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            ({product.rating?.toFixed(1) || "0"})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.discount && product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <p
                          className={cn(
                            "text-xs mt-2 font-medium",
                            product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                          )}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </p>
                      </CardContent>

                      {/* Footer with Actions */}
                      <CardFooter className="p-4 pt-0 gap-2 border-t border-gray-100 dark:border-gray-700">
                        <Button
                          size="sm"
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProduct(product)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-4 py-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalProducts)} of{" "}
                      {totalProducts} products
                    </div>

                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page Number Buttons */}
                      {generatePageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === "..." ? (
                            <span className="px-2 text-sm text-gray-500">...</span>
                          ) : (
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page as number)}
                              className={cn(
                                "h-9 w-9 p-0 text-sm",
                                currentPage === page &&
                                  "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
                              )}
                            >
                              {page}
                            </Button>
                          )}
                        </React.Fragment>
                      ))}

                      {/* Next Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                )}

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isFetchingNextPage}
                      variant="outline"
                      className="min-w-32 bg-transparent"
                    >
                      {isFetchingNextPage ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-yellow-500 rounded-full animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        "Load More Products"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default ProductPage

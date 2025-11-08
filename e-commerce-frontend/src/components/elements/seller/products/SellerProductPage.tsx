"use client"
import { useGetSellerProducts } from '@/lib/hooks/tanstack-query/query-hook/seller/use-get-seller-product'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { deleteProduct } from '@/lib/actions/seller/products/delete/delete-product'
import { ProductCard } from './ProductCard'
import { ProductListItem } from './ProductListItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Badge component - using inline styles for now
const Badge = ({ children, className, variant, ...props }: any) => (
  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
    variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
  } ${className}`} {...props}>
    {children}
  </span>
)
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Plus,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import Link from 'next/link'

// Define product type based on backend model
interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  discount: number
  sellerId: string
  category: Record<string, string>
  images: string[]
  stock: number
  rating : number;
  createdAt: string
  updatedAt: string
}

function SellerProductPage() {
  const router = useRouter()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt' | 'stock'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch data
  const { data, isLoading, isError, error } = useGetSellerProducts(currentPage, itemsPerPage)

  // Handler functions
  const handleEditProduct = (productId: string) => {
    router.push(`/seller/products/${productId}/edit-product`)
  }

  const handleDeleteProduct = async (productId: string) => {
    const product = filteredAndSortedProducts.find(p => p.id === productId)
    const productName = product?.name || 'this product'
    
    if (window.confirm(`Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone and will permanently remove the product from your inventory.`)) {
      try {
        const result = await deleteProduct(productId)
        
        if (result.success) {
          toast.success(result.message || `Product "${productName}" deleted successfully`)
          // Refetch data by updating the page
          window.location.reload()
        } else {
          toast.error(String(result.error || 'Failed to delete product'))
        }
      } catch (error: any) {
        toast.error(`Failed to delete product: ${error.message}`)
        console.error('Delete error:', error)
      }
    }
  }

  // Process and filter data on frontend
  const filteredAndSortedProducts = useMemo(() => {
    if (!data?.products || !Array.isArray(data.products)) return []

    let products = [...data.products]

    // Search filter
    if (searchTerm) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (filterCategory) {
      products = products.filter(product => {
        if (typeof product.category === 'object' && product.category !== null) {
          if (Array.isArray(product.category)) {
            // Handle array format [{Key, Value}]
            return product.category.some((item: any) => {
              const value = item.Value || item.value || String(item)
              return String(value).toLowerCase().includes(filterCategory.toLowerCase())
            })
          } else {
            // Handle object format {key: value}
            return Object.values(product.category).some((value: any) => 
              String(value).toLowerCase().includes(filterCategory.toLowerCase())
            )
          }
        }
        return false
      })
    }

    // Price range filter
    if (minPrice !== undefined) {
      products = products.filter(product => product.price >= minPrice)
    }
    if (maxPrice !== undefined) {
      products = products.filter(product => product.price <= maxPrice)
    }

    // Sort products
    products.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'stock':
          aValue = a.stock
          bValue = b.stock
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return products
  }, [data?.products, searchTerm, filterCategory, minPrice, maxPrice, sortBy, sortOrder])

  // Get unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    if (!data?.products) return []
    const categories = new Set<string>()
    data.products.forEach((product: any) => {
      if (typeof product.category === 'object' && product.category !== null) {
        if (Array.isArray(product.category)) {
          // Handle array format [{Key, Value}]
          product.category.forEach((item: any) => {
            const value = item.Value || item.value || String(item)
            categories.add(String(value))
          })
        } else {
          // Handle object format {key: value}
          Object.values(product.category).forEach((value: any) => categories.add(String(value)))
        }
      }
    })
    return Array.from(categories)
  }, [data?.products])

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setFilterCategory('')
    setMinPrice(undefined)
    setMaxPrice(undefined)
  }

  // Handle pagination
  const totalPages = data?.total ? Math.ceil(data.total / itemsPerPage) : 1
  const hasNextPage = data?.hasMore || false
  const hasPrevPage = currentPage > 1

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your products...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert className="max-w-md mx-auto mt-8">
        <AlertDescription>
          Error loading products: {error?.toString() || 'Something went wrong'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-4">
    <div>
          <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-600">
            {data?.total || 0} products
          </p>
        </div>
        <Link href="/seller/add-product">
          <Button className="flex items-center gap-2 h-9 px-3">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Compact Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={filterCategory || "ALL_CATEGORIES"} onValueChange={(value) => setFilterCategory(value === "ALL_CATEGORIES" ? "" : value)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_CATEGORIES">All categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="flex gap-3 mb-3">
            <Input
              type="number"
              placeholder="Min price"
              value={minPrice || ''}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
              className="w-24 h-9"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={maxPrice || ''}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              className="w-24 h-9"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-8 w-8 p-0"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
              </Button>
              
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none h-8 w-8 p-0"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none h-8 w-8 p-0"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {filteredAndSortedProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm || filterCategory || minPrice || maxPrice 
                ? "Try adjusting your filters or search terms"
                : "You haven't added any products yet"
              }
            </p>
            <Link href="/seller/add-product">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedProducts.length} of {data?.total || 0} products
            </p>
          </div>

          {/* Products Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={(productId) => router.push(`/seller/products/${productId}`)}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4 mb-8">
              {filteredAndSortedProducts.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onView={(productId) => router.push(`/seller/products/${productId}`)}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <div>Page {currentPage} of {totalPages}</div>
              <div className="text-xs text-gray-500 mt-1">
                Showing {Math.min(itemsPerPage, filteredAndSortedProducts.length)} of {data?.total || 0} total products
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={!hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number
                  if (totalPages <= 5) {
                    page = i + 1
                  } else {
                    // Show pages around current page
                    const startPage = Math.max(1, currentPage - 2)
                    const endPage = Math.min(totalPages, startPage + 4)
                    page = startPage + i
                    if (page > endPage) return null
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                }).filter(Boolean)}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SellerProductPage

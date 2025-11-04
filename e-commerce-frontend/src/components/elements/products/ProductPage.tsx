'use client'

import React, { useState, useMemo } from 'react'
import { useGetAllProducts, Product, AllProductsResponse } from '@/lib/hooks/tanstack-query/query-hook/products/use-get-all-product'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, Search, Filter, ShoppingCart, Star, Eye } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart-store'
import { CartIcon } from '@/components/ui/cart-icon'
import { CartDrawer } from '@/components/ui/cart-drawer'
import { useRouter } from 'next/navigation'

// Define types locally since they're not exported from the hook
export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'popularity';

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
        search: '',
        category: '',
        brand: '',
        minPrice: null,
        maxPrice: null,
        sortBy: 'newest'
    })
    
    const [showFilters, setShowFilters] = useState(false)
    const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(0)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const limit = 12

    // Use the simplified hook - only search goes to backend
    const { 
        data, 
        isLoading, 
        error, 
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllProducts(1000, filters.search || undefined) // Fetch more products for client-side filtering

    const { addItem, getItemQuantity, items } = useCartStore()

    // Helper functions for category and brand
    const getCategoryString = (category: any): string => {
        if (!category) return '';
        if (typeof category === 'string') return category;
        if (Array.isArray(category)) {
            // Handle array of {key: "topic", value: "computer"} objects
            return category.map(item => {
                if (item && typeof item === 'object' && item.key && item.value) {
                    return `${item.key}: ${item.value}`;
                }
                return '';
            }).filter(Boolean).join(', ');
        }
        if (typeof category === 'object') {
            const categoryObj = category as { key?: string; value?: string; [key: string]: any };
            // Handle the {key: "", value: ""} format
            if (categoryObj.key !== undefined && categoryObj.value !== undefined) {
                // If both key and value exist, prefer value for display
                return categoryObj.value || categoryObj.key || '';
            }
            // Fallback to key if only key exists
            if (categoryObj.key !== undefined) {
                return categoryObj.key;
            }
            // Fallback to value if only value exists
            if (categoryObj.value !== undefined) {
                return categoryObj.value;
            }
            // Last fallback to string representation
            return JSON.stringify(categoryObj);
        }
        return '';
    };

    // Function to get category values for search (only the values, not keys)
    const getCategoryValues = (category: any): string[] => {
        if (!category) return [];
        if (typeof category === 'string') return [category];
        if (Array.isArray(category)) {
            // Extract only the values from array of {key: "topic", value: "computer"} objects
            return category
                .filter(item => item && typeof item === 'object' && item.value)
                .map(item => item.value)
                .filter(Boolean);
        }
        if (typeof category === 'object') {
            const categoryObj = category as { key?: string; value?: string; [key: string]: any };
            if (categoryObj.value) return [categoryObj.value];
            if (categoryObj.key) return [categoryObj.key];
        }
        return [];
    };

    // Function to check if product matches search term (including category values)
    const productMatchesSearch = (product: Product, searchTerm: string): boolean => {
        if (!searchTerm || !product) return true;
        
        const searchLower = searchTerm.toLowerCase();
        
        // Check product name and description (with null safety)
        if ((product.name && product.name.toLowerCase().includes(searchLower)) || 
            (product.description && product.description.toLowerCase().includes(searchLower))) {
            return true;
        }
        
        // Check category values
        const categoryValues = getCategoryValues(product.category);
        if (categoryValues.some(value => value.toLowerCase().includes(searchLower))) {
            return true;
        }
        
        // Check brand values
        if (product.brand) {
            const brandValues = getCategoryValues(product.brand);
            if (brandValues.some(value => value.toLowerCase().includes(searchLower))) {
                return true;
            }
        }
        
        return false;
    };

    const getBrandString = (product: Product): string => {
        if (!product.brand) return '';
        if (typeof product.brand === 'string') return product.brand;
        if (Array.isArray(product.brand)) {
            // Handle array of {key: "topic", value: "computer"} objects
            return product.brand.map(item => {
                if (item && typeof item === 'object' && item.key && item.value) {
                    return `${item.key}: ${item.value}`;
                }
                return '';
            }).filter(Boolean).join(', ');
        }
        if (typeof product.brand === 'object') {
            const brandObj = product.brand as { key?: string; value?: string; [key: string]: any };
            // Handle the {key: "", value: ""} format
            if (brandObj.key !== undefined && brandObj.value !== undefined) {
                // If both key and value exist, prefer value for display
                return brandObj.value || brandObj.key || '';
            }
            // Fallback to key if only key exists
            if (brandObj.key !== undefined) {
                return brandObj.key;
            }
            // Fallback to value if only value exists
            if (brandObj.value !== undefined) {
                return brandObj.value;
            }
            // Last fallback to string representation
            return JSON.stringify(brandObj);
        }
        return '';
    };

    // Client-side sorting function
    const sortProducts = (products: Product[], sortBy: SortOption): Product[] => {
        const sorted = [...products];

        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'rating':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'popularity':
                // Sort by stock (higher stock = more popular)
                return sorted.sort((a, b) => b.stock - a.stock);
            default:
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    };

    // Client-side filtering and processing
    const processedData = useMemo(() => {
        if (!data?.pages) return { products: [], total: 0, hasMore: false };

        // Flatten all products from all pages
        const allProducts = data.pages.flatMap(page => page.data.products);
        
        // Apply client-side filters (including search for better UX)
        let filteredProducts = allProducts.filter(product => {
            // Skip null or undefined products
            if (!product) return false;
            
            // Search filter (check if product matches search term)
            if (filters.search && filters.search !== '') {
                if (!productMatchesSearch(product, filters.search)) {
                    return false;
                }
            }

            // Category filter
            if (filters.category && filters.category !== '') {
                if (!product.category) return false; // Skip products without category
                const categoryStr = getCategoryString(product.category);
                if (!categoryStr.toLowerCase().includes(filters.category.toLowerCase())) {
                    return false;
                }
            }

            // Brand filter (if brand exists in product)
            if (filters.brand && filters.brand !== '') {
                if (!product.brand) return false; // Skip products without brand
                const brandStr = getBrandString(product);
                if (!brandStr.toLowerCase().includes(filters.brand.toLowerCase())) {
                    return false;
                }
            }

            // Price range filter
            if (filters.minPrice !== null && filters.minPrice !== undefined) {
                if (product.price < filters.minPrice) return false;
            }
            if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
                if (product.price > filters.maxPrice) return false;
            }

            return true;
        });

        // Apply sorting
        if (filters.sortBy) {
            filteredProducts = sortProducts(filteredProducts, filters.sortBy);
        }

        // Pagination
        const totalPages = Math.ceil(filteredProducts.length / limit);
        const startIndex = currentPage * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        return {
            products: paginatedProducts,
            total: filteredProducts.length,
            hasMore: endIndex < filteredProducts.length,
            totalPages
        };
    }, [data?.pages, filters, currentPage, limit]);

    // Get unique categories and brands for filters
    const getUniqueCategories = () => {
        if (!data?.pages) return [];
        const allProducts = data.pages.flatMap(page => page.data.products);
        // Filter out products with null categories and get unique categories
        const categories = new Set<string>();
        
        allProducts.forEach(product => {
            if (product && product.category) {
                if (Array.isArray(product.category)) {
                    // Handle array of {key: "topic", value: "computer"} objects
                    product.category.forEach(item => {
                        if (item && typeof item === 'object' && item.key && item.value) {
                            categories.add(`${item.key}: ${item.value}`);
                        }
                    });
                } else if (typeof product.category === 'object') {
                    // Handle single {key: "topic", value: "computer"} object
                    const cat = product.category as { key?: string; value?: string; [key: string]: any };
                    if (cat.key && cat.value) {
                        categories.add(`${cat.key}: ${cat.value}`);
                    }
                } else if (typeof product.category === 'string') {
                    // Handle string category
                    categories.add(product.category);
                }
            }
        });
        
        return Array.from(categories).filter(cat => cat.trim() !== '');
    };

    const getUniqueBrands = () => {
        if (!data?.pages) return [];
        const allProducts = data.pages.flatMap(page => page.data.products);
        // Filter out products with null brands and get unique brands
        const brands = new Set<string>();
        
        allProducts.forEach(product => {
            if (product && product.brand) {
                if (Array.isArray(product.brand)) {
                    // Handle array of {key: "topic", value: "computer"} objects
                    product.brand.forEach(item => {
                        if (item && typeof item === 'object' && item.key && item.value) {
                            brands.add(`${item.key}: ${item.value}`);
                        }
                    });
                } else if (typeof product.brand === 'object') {
                    // Handle single {key: "topic", value: "computer"} object
                    const brand = product.brand as { key?: string; value?: string; [key: string]: any };
                    if (brand.key && brand.value) {
                        brands.add(`${brand.key}: ${brand.value}`);
                    }
                } else if (typeof product.brand === 'string') {
                    // Handle string brand
                    brands.add(product.brand);
                }
            }
        });
        
        return Array.from(brands).filter(brand => brand.trim() !== '');
    };

    const getPriceRange = () => {
        if (!data?.pages) return { min: 0, max: 0 };
        const allProducts = data.pages.flatMap(page => page.data.products);
        // Filter out null products and get valid prices
        const prices = allProducts
            .filter(p => p && typeof p.price === 'number')
            .map(p => p.price);
        
        if (prices.length === 0) return { min: 0, max: 0 };
        
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    };

    const categories = getUniqueCategories();
    const brands = getUniqueBrands();
    const priceRange = getPriceRange();

    const handleFilterChange = (key: keyof ClientFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(0) // Reset to first page when filters change
    }

    const toggleLike = (productId: string) => {
        setLikedProducts(prev => {
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
            search: '',
            category: '',
            brand: '',
            minPrice: null,
            maxPrice: null,
            sortBy: 'newest'
        })
        setCurrentPage(0)
    }

    const handleAddToCart = (product: Product) => {
        const categoryStr = getCategoryString(product.category);
        const brandStr = getBrandString(product);
        
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images && product.images.length > 0 ? product.images[0] : undefined,
            category: categoryStr,
            brand: brandStr,
            discount: product.discount
        })
    }

    const handleViewProduct = (product: Product) => {
        // Navigate to product detail page in same tab
        router.push(`/products/${product.id}`)
    }

    const currentProducts = processedData.products;
    const totalProducts = processedData.total;
    const hasMore = processedData.hasMore;
    const totalPages = processedData.totalPages;

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Error loading products: {error.message}</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <div className="flex items-center gap-4">
                        {/* Cart Icon with Badge */}
                        <div className="relative">
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setIsCartOpen(true)}
                                className="h-10 w-10"
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                            
                            {/* Cart Badge */}
                            {(() => {
                                const totalItems = items.reduce((total, item) => total + item.quantity, 0);
                                return totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {totalItems}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                
                {/* Search Bar - Only search at top */}
                <div className="mb-4">
                    <div className="flex max-w-md">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full bg-white text-black placeholder:text-gray-500 rounded-r-none border-gray-300 ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button className="bg-yellow-500 hover:bg-yellow-600 rounded-l-none">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Cart Summary - Show when items exist */}
                {(() => {
                    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
                    const totalValue = items.reduce((total, item) => total + (item.price * item.quantity), 0);
                    
                    return totalItems > 0 && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">
                                            {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Total: ${totalValue.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        onClick={() => setIsCartOpen(true)}
                                        size="sm"
                                        variant="outline"
                                        className="border-green-600 text-green-600 hover:bg-green-50"
                                    >
                                        View Cart
                                    </Button>
                                    <Button 
                                        onClick={() => router.push('/products/checkout')}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Filter Toggle for Mobile */}
                <div className="flex items-center gap-4 mb-4 lg:hidden">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                    >
                        <Filter className="h-4 w-4" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                        {/* Show active filter count */}
                        {(() => {
                            const activeFilterCount = [
                                filters.category,
                                filters.brand,
                                filters.minPrice,
                                filters.maxPrice
                            ].filter(Boolean).length;
                            return activeFilterCount > 0 ? (
                                <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
                                    {activeFilterCount}
                                </span>
                            ) : null;
                        })()}
                    </Button>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                        {totalProducts} products found
                    </div>
                    
                    {/* Active Filters Display */}
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.search && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                                Search: "{filters.search}"
                                <button 
                                    onClick={() => handleFilterChange('search', '')}
                                    className="ml-1 text-yellow-600 hover:text-yellow-700"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.category && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                                Category: {filters.category}
                                <button 
                                    onClick={() => handleFilterChange('category', '')}
                                    className="ml-1 text-yellow-600 hover:text-yellow-700"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.brand && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                                Brand: {filters.brand}
                                <button 
                                    onClick={() => handleFilterChange('brand', '')}
                                    className="ml-1 text-yellow-600 hover:text-yellow-700"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {(filters.minPrice || filters.maxPrice) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                                Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                                <button 
                                    onClick={() => {
                                        handleFilterChange('minPrice', null)
                                        handleFilterChange('maxPrice', null)
                                    }}
                                    className="ml-1 text-yellow-600 hover:text-yellow-700"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Filters Sidebar - Always visible on desktop, collapsible on mobile */}
                <div className={cn(
                    "lg:w-64 lg:block",
                    showFilters ? "block" : "hidden"
                )}>
                    <div className="space-y-6 bg-white p-4 rounded-lg border h-fit lg:sticky lg:top-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Filters</h3>
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>

                        {/* Sort Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Sort by</Label>
                            <Select value={filters.sortBy || 'newest'} onValueChange={(value) => handleFilterChange('sortBy', value as SortOption)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="rating">Rating</SelectItem>
                                    <SelectItem value="popularity">Popularity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Category</Label>
                            <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Brand Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Brand</Label>
                            <Select value={filters.brand || 'all'} onValueChange={(value) => handleFilterChange('brand', value === 'all' ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Brands" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {brands.map(brand => (
                                        <SelectItem key={brand} value={brand}>
                                            {brand}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Price Range</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                                        className="flex-1"
                                    />
                                </div>
                                <div className="text-xs text-gray-500">
                                    Range: ${priceRange.min} - ${priceRange.max}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Card key={`skeleton-${i}`} className="animate-pulse">
                                    <CardHeader className="p-0">
                                        <div className="bg-gray-200 h-32 rounded-t-lg"></div>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <div className="bg-gray-200 h-3 rounded mb-1"></div>
                                        <div className="bg-gray-200 h-2 rounded mb-2 w-16"></div>
                                        <div className="bg-gray-200 h-2.5 rounded mb-2 w-20"></div>
                                        <div className="bg-gray-200 h-4 rounded w-12"></div>
                                    </CardContent>
                                    <CardFooter className="p-3 pt-0 space-y-1">
                                        <div className="bg-gray-200 h-7 rounded w-full"></div>
                                        <div className="bg-gray-200 h-7 rounded w-full"></div>
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
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-4">
                                    {filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice 
                                        ? "No products match your current filters. Try adjusting your search criteria."
                                        : "There are currently no products available."
                                    }
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
                                {currentProducts.map((product: Product) => {
                                    return (
                                    <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
                                    <CardHeader className="p-0 relative">
                                        <div className="relative h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                                            {product.images && product.images.length > 0 ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "absolute top-1 right-1 h-6 w-6 rounded-full bg-white/80 hover:bg-white",
                                                    likedProducts.has(product.id) && "text-red-500"
                                                )}
                                                onClick={() => toggleLike(product.id)}
                                            >
                                                <Heart 
                                                    className={cn(
                                                        "h-3 w-3",
                                                        likedProducts.has(product.id) && "fill-current"
                                                    )} 
                                                />
                                            </Button>
                                            {product.discount > 0 && (
                                                <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                                                    -{product.discount}%
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Category and Brand */}
                                        <div className="flex items-center gap-1 mb-1 text-xs">
                                            {(() => {
                                                const categoryStr = getCategoryString(product.category);
                                                return categoryStr && (
                                                    <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                                        {categoryStr}
                                                    </span>
                                                );
                                            })()}
                                            {(() => {
                                                const brandStr = getBrandString(product);
                                                return brandStr && (
                                                    <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs">
                                                        {brandStr}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={`star-${product.id}-${i}`}
                                                    className={cn(
                                                        "h-2.5 w-2.5",
                                                        i < (product.rating || 4) 
                                                            ? "text-yellow-400 fill-current" 
                                                            : "text-gray-300"
                                                    )}
                                                />
                                            ))}
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({product.rating || 4.0})
                                            </span>
                                        </div>

                                        {/* Price and Stock */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="font-bold text-base">
                                                    ${product.discount 
                                                        ? Math.round(product.price * (1 - product.discount / 100))
                                                        : product.price
                                                    }
                                                </span>
                                                {product.discount > 0 && (
                                                    <span className="text-xs text-gray-500 line-through ml-1">
                                                        ${product.price}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Stock: {product.stock}
                                            </div>
                                        </div>

                                        {/* Quantity in Cart Indicator */}
                                        {(() => {
                                            const cartQuantity = getItemQuantity(product.id);
                                            return cartQuantity > 0 && (
                                                <div className="text-xs text-green-600 mb-1 font-medium">
                                                    {cartQuantity} in cart
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                    <CardFooter className="p-3 pt-0 space-y-1 flex flex-col">
                                        <Button 
                                            size="sm"
                                            className="w-full flex items-center gap-1 text-xs"
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            <ShoppingCart className="h-3 w-3" />
                                            Add to Cart
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="w-full flex items-center gap-1 text-xs"
                                            onClick={() => handleViewProduct(product)}
                                        >
                                            <Eye className="h-3 w-3" />
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                                );
                            })}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={currentPage === 0}
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage + 1} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={!hasMore}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                    Showing {currentProducts.length} of {totalProducts} products
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </div>
    )
}

export default ProductPage

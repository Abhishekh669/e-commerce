"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Star } from "lucide-react"
import Image from "next/image"

const products = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        price: "$129.99",
        rating: 4.8,
        reviews: 324,
        image: "/wireless-headphones.jpg",
    },
    {
        id: 2,
        name: "Elegant Watch Collection",
        price: "$89.99",
        rating: 4.6,
        reviews: 218,
        image: "/elegant-watch.jpg",
    },
    {
        id: 3,
        name: "Designer Sunglasses",
        price: "$149.99",
        rating: 4.9,
        reviews: 456,
        image: "/designer-sunglasses.jpg",
    },
    {
        id: 4,
        name: "Luxury Backpack",
        price: "$199.99",
        rating: 4.7,
        reviews: 189,
        image: "/luxury-backpack.jpg",
    },
]

export default function FeaturedProducts() {
    return (
        <section className="w-full bg-gray-900 py-16 lg:py-24 px-4 lg:px-14">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-balance">
                        Featured <span className="text-yellow-400">Products</span>
                    </h2>
                    <p className="text-gray-300 text-lg">Handpicked items just for you</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                        >
                            <div className="relative overflow-hidden h-64 bg-gray-700">
                                <Image
                                    fill
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                                    Sale
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <h3 className="text-white font-semibold text-lg line-clamp-2">{product.name}</h3>

                                <div className="flex items-center gap-1">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-400 text-sm">({product.reviews})</span>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-2xl font-bold text-yellow-400">{product.price}</span>
                                    <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold">
                                        <ShoppingCart size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-6 text-base">
                        View All Products
                    </Button>
                </div>
            </div>
        </section>
    )
}

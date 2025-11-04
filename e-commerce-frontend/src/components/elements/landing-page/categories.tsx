"use client"

import { ShoppingBag, Zap, Heart, Truck } from "lucide-react"

const categories = [
  {
    icon: ShoppingBag,
    title: "Wide Selection",
    description: "Browse thousands of products across multiple categories",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Quick shipping to get your items when you need them",
  },
  {
    icon: Heart,
    title: "Quality Assured",
    description: "Every product is carefully selected for quality",
  },
  {
    icon: Truck,
    title: "Easy Returns",
    description: "Hassle-free returns within 30 days",
  },
]

export default function Categories() {
  return (
    <section className="w-full bg-white py-16 lg:py-24 px-4 lg:px-14">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">
            Why Shop With <span className="text-yellow-400">E-CoM</span>
          </h2>
          <p className="text-gray-600 text-lg">Experience the best in online shopping</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-400 rounded-full">
                    <Icon size={28} className="text-gray-900" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

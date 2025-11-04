"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="w-full bg-gray-900 text-white py-20 lg:py-32 px-4 lg:px-14">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-balance">
              Discover Premium <span className="text-yellow-400">Products</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Shop the finest selection of curated items. From everyday essentials to exclusive finds, we bring quality
              and style to your doorstep.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-6 text-base flex items-center gap-2">
              Shop Now
              <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-6 text-base bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative h-96 lg:h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-lg"></div>
          <Image
            width={500}
            height={500}
            src="/premium-products-showcase.jpg"
            alt="Premium products showcase"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </section>
  )
}

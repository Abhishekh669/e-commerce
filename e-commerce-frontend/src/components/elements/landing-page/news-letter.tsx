"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export default function Newsletter() {
  return (
    <section className="w-full bg-white py-16 lg:py-24 px-4 lg:px-14">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-400 rounded-full">
              <Mail size={32} className="text-gray-900" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
            Stay Updated with Exclusive Offers
          </h2>
          <p className="text-gray-600 text-lg">Subscribe to our newsletter and get 10% off your first purchase</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 py-3 px-4"
          />
          <Button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3">Subscribe</Button>
        </div>

        <p className="text-sm text-gray-500">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  )
}

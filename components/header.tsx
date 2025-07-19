import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-lg shadow-orange-100/50">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo Section */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-full">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Tastes Like Home
              </span>
              <span className="text-xs text-gray-500 font-medium hidden sm:block">
                Authentic Indian Home Cooking
              </span>
            </div>
          </Link>

          {/* Enhanced CTA Button */}
          <Button 
            asChild 
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <a href="https://forms.gle/72wNQtKa6P4JGyQS9" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4" />
              <span>Become a Chef</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

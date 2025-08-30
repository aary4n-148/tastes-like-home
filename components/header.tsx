import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-background/95 backdrop-blur-lg border-b border-border sticky top-0 z-50 shadow-lg shadow-primary/10">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo Section */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-primary to-secondary p-2 rounded-full">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-black text-gray-900 leading-tight">
                Tastes Like
                <span className="text-primary ml-2">Home</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium hidden sm:block">
                Authentic Indian Home Cooking
              </span>
            </div>
          </Link>

          {/* Enhanced CTA Button */}
          <Button 
            asChild 
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/apply" className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4" />
              <span>Become a Chef</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

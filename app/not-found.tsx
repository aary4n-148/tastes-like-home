import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Chef Not Found</h2>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find the chef you're looking for.</p>
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}

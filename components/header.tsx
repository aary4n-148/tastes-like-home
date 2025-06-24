import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-orange-600">
          Tastes Like Home
        </Link>

        <Button asChild variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
          <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer">
            Become a Chef
          </a>
        </Button>
      </div>
    </header>
  )
}

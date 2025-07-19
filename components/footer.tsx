import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-orange-100 py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600 mb-2">Directory only — arrange and pay chefs directly</p>
        <div className="flex justify-center items-center gap-4 text-sm">
          <Link 
            href="/terms" 
            className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  )
}

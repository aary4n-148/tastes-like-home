import { chefs } from "@/lib/data"
import ChefCard from "@/components/chef-card"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Cleaned Up Hero Section */}
        <div className="text-center mb-16 relative">
          {/* Background decorative element */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent leading-tight">
              Tastes Like Home
            </h1>
            
            <p className="text-xl md:text-3xl text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed">
              Discover authentic Indian home-cooked meals from 
              <span className="text-orange-600 font-semibold"> verified chefs</span> in London
            </p>
          </div>
        </div>

        {/* Chef Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {chefs.map((chef) => (
            <ChefCard key={chef.id} chef={chef} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
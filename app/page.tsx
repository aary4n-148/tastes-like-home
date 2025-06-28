import { chefs } from "@/lib/data"
import ChefCard from "@/components/chef-card"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Tastes Like Home</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">Find an Indian home-chef in London</p>
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

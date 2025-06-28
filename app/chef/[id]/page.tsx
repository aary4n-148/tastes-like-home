import { chefs } from "@/lib/data"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageCircle, Shield } from "lucide-react"

interface ChefPageProps {
  params: Promise<{ id: string }>
}

export default async function ChefPage({ params }: ChefPageProps) {
  const { id } = await params
  const chef = chefs.find((c) => c.id === id)

  if (!chef) {
    notFound()
  }

  const whatsappUrl = `https://wa.me/${chef.phone.replace(/\D/g, "")}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all chefs
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Chef Photo */}
            <div className="md:w-1/2">
              <Image
                src={chef.photo || "/placeholder.svg"}
                alt={chef.name}
                width={600}
                height={600}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>

            {/* Chef Details */}
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{chef.name}</h1>
                {chef.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Cuisines */}
              <div className="flex flex-wrap gap-2 mb-6">
                {chef.cuisines.map((cuisine) => (
                  <Badge key={cuisine} variant="outline" className="border-orange-200 text-orange-700">
                    {cuisine}
                  </Badge>
                ))}
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600 leading-relaxed">
                  Passionate home chef specializing in authentic {chef.cuisines.join(", ")} cuisine. I bring traditional
                  family recipes and fresh ingredients to create memorable dining experiences in the comfort of your
                  home. Each dish is prepared with love and attention to detail, just like it would be in an Indian
                  household.
                </p>
              </div>

              {/* Pricing */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Starting Price</h2>
                <p className="text-3xl font-bold text-orange-600">£{chef.hourlyRate}</p>
                <p className="text-sm text-gray-500">per hour</p>
              </div>

              {/* Contact Button */}
              <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

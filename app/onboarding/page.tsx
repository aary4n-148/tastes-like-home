import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, ArrowLeft, Clock, DollarSign, Camera, Shield, MessageCircle } from "lucide-react"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-full">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div className="text-lg font-bold">
              <div>Tastes Like</div>
              <div className="text-primary">Home</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-12">
          
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Tastes Like Home</h1>
            <p className="text-xl text-gray-600 font-medium">We help local families find you.</p>
            <p className="text-lg text-gray-500 mt-2">This is a quick guide. Easy to read. Easy to use.</p>
          </div>

          <hr className="border-gray-200" />

          {/* How it works */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              How it works
            </h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <ol className="space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  People see your profile.
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  They message you.
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  You agree day, time, and price.
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                  You cook in their home. You leave the kitchen clean.
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                  They pay you as agreed. They leave a review.
                </li>
              </ol>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Tips to get more clients */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              Tips to get more clients
            </h2>
            <div className="bg-green-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  <div><strong>Reply fast.</strong> Aim to answer in under 1 hour.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  <div><strong>Be clear.</strong> Say what you cook and what you do not cook.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  <div><strong>Offer a first-time deal.</strong></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  <div><strong>Make a simple weekly plan.</strong> Example: "3 hours = 2 curries + 1 sabzi + roti."</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  <div><strong>Ask for reviews.</strong> After each job say, "Could you please leave a short review?"</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">•</span>
                  <div><strong>Share your link.</strong> Put your profile link on WhatsApp status and Instagram bio.</div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Price and ingredients */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              How to talk about price and ingredients
            </h2>
            <div className="bg-yellow-50 rounded-lg p-6 space-y-4">
              <div className="text-lg">
                <p className="mb-3"><strong>Your time:</strong> £12–£20 per hour is normal here.</p>
                <p className="mb-3"><strong>Who buys food?</strong> Choose one:</p>
                <ul className="ml-6 space-y-2">
                  <li>• <em>Client buys.</em> You send a shopping list.</li>
                  <li>• <em>You buy.</em> Add money for ingredients. Share the receipt photo.</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="font-semibold mb-2">Example message:</p>
                <p className="italic text-gray-700">
                  "My rate is £13/hour. I work 3 hours. You buy ingredients. I will send a list today."
                </p>
              </div>
              
              <p className="text-lg"><strong>Travel:</strong> If far, add a small travel fee. Say it before the job.</p>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Make your profile strong */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make your profile strong</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 text-xl">•</span>
                  <div><strong>Short bio.</strong> 2–3 lines. What you cook best. How long you have been cooking. Any food safety training.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 text-xl">•</span>
                  <div><strong>Menu ideas.</strong> Show 5–10 simple meal sets (veg and non-veg).</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 text-xl">•</span>
                  <div><strong>Good photos.</strong> See tips below.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 text-xl">•</span>
                  <div><strong>Add languages.</strong> Example: English, Hindi, Punjabi, Gujarati.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 text-xl">•</span>
                  <div><strong>Set hours.</strong> Days and times you can work.</div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Stay safe */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              Stay safe
            </h2>
            <div className="bg-red-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <div><strong>First chat on WhatsApp.</strong> Keep messages polite and clear.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <div><strong>At the home:</strong> Work in the kitchen only. Do not bring guests.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <div><strong>Tell a friend.</strong> Share job address and time with a family member.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <div><strong>Trust your feel.</strong> If it feels wrong, say no.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <div><strong>Payments:</strong> Agree how to pay <em>before</em> you go (cash, bank transfer).</div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Take good photos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              Take good photos (easy tips)
            </h2>
            <div className="bg-purple-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl">•</span>
                  <div><strong>Use daylight.</strong> Near a window.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl">•</span>
                  <div><strong>Plain plate.</strong> White plate, clean table.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl">•</span>
                  <div><strong>One dish per photo.</strong> Keep it simple.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl">•</span>
                  <div><strong>Hold the phone steady.</strong> Tap to focus. Wipe the lens.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl">•</span>
                  <div><strong>Show 3–5 dishes.</strong> Best sellers first.</div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Add a short video */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add a short video (build trust)</h2>
            <div className="bg-indigo-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 text-xl">•</span>
                  <div><strong>30–45 seconds.</strong> Smile. Speak slowly.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 text-xl">•</span>
                  <div><strong>Say your name and area.</strong> "Hi, I'm Asha. I cook home-style North Indian food in Southall."</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 text-xl">•</span>
                  <div><strong>Show 1–2 dishes.</strong> Quick pan shot.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 text-xl">•</span>
                  <div><strong>End with invite.</strong> "Book me for weekly meal prep."</div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* In-home basics */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">In-home basics (be a pro)</h2>
            <div className="bg-teal-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 text-xl">•</span>
                  <div><strong>Be on time.</strong> Message if you are running late.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 text-xl">•</span>
                  <div><strong>Clean as you go.</strong> Leave the kitchen tidy.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 text-xl">•</span>
                  <div><strong>Food safety.</strong> Wash hands. Use clean boards. Cook meat well.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 text-xl">•</span>
                  <div><strong>Allergies.</strong> Ask before you start.</div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Messages you can copy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages you can copy</h2>
            <div className="space-y-6">
              
              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                <p className="font-semibold mb-3 text-blue-800">First reply:</p>
                <p className="italic text-gray-700 bg-white p-4 rounded border">
                  "Thanks for your message! I can come on [day] at [time]. My rate is £[x]/hour. You buy ingredients; I'll send a list. I will cook [dishes] in [hours]. Does this work?"
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                <p className="font-semibold mb-3 text-green-800">After the job:</p>
                <p className="italic text-gray-700 bg-white p-4 rounded border">
                  "Thank you! If you liked the food, could you please leave a short review on my profile? It helps me find more families."
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Simple weekly plans */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Simple weekly plans (examples)</h2>
            <div className="bg-orange-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 text-xl">•</span>
                  <div><strong>Veg plan (3 hours):</strong> Chana masala, aloo gobi, dal tadka, 10 rotis.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 text-xl">•</span>
                  <div><strong>Non-veg plan (3 hours):</strong> Chicken curry, jeera rice, dal, salad.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 text-xl">•</span>
                  <div><strong>Family plan (4 hours):</strong> Paneer curry, chicken curry, mixed veg, sambar, rice, 15 rotis.</div>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cancellations</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 text-xl">•</span>
                  <div><strong>Client cancel:</strong> If under 24 hours, ask for 1 hour pay.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 text-xl">•</span>
                  <div><strong>You cancel:</strong> Tell them fast. Offer a new time.</div>
                </li>
              </ul>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-lg text-gray-600 mb-6">Ready to start cooking for families?</p>
            <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-full text-lg font-semibold">
              <Link href="/apply">Apply to be a Chef</Link>
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tastes Like Home – Terms of Use</h1>
          <p className="text-sm text-gray-600 mb-8"><strong>Last Updated:</strong> 19 July 2025</p>
          
          <div className="prose prose-lg max-w-none">
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold mb-2">PLEASE READ THESE TERMS CAREFULLY. By using our website, you agree to be legally bound by them.</p>
              <p className="text-red-700">
                <strong>In simple terms:</strong> We are an introductory platform, not a caterer. We connect you with independent chefs. We are not involved in the cooking, payment, or any part of the service itself. You are responsible for vetting your chosen chef and you engage their services entirely at your own risk.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Our Agreement With You</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Welcome to Tastes Like Home. These Terms of Use ("Terms") are a legally binding agreement between you ("you," "the Customer") and Tastes Like Home Ltd ("we," "us," "our," "the Company"). They govern your access to and use of our website and all associated services (collectively, "the Platform").
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy, which is incorporated by reference into this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Our Role: An Introductory Venue</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Tastes Like Home Platform is solely an online venue that connects people seeking home-cooked meals with independent, third-party home-chefs ("Chefs").
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Our role is strictly limited to:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Providing a directory of Chef profiles.</li>
                <li>Facilitating the initial introduction between a Customer and a Chef.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>You explicitly acknowledge that we do not perform any of the following actions:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Employ, supervise, or endorse any Chef.</li>
                <li>Cook, prepare, handle, package, or deliver any food.</li>
                <li>Process bookings, handle payments, or act as an agent for either party.</li>
                <li>Conduct background checks, verify credentials, or inspect any Chef's premises.</li>
                <li>Guarantee the quality, safety, or legality of the services provided by Chefs.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mb-4">
                Any agreement to provide cooking services is made exclusively between the Customer and the Chef. The Company is not and will not be a party to that agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Chef Obligations and Customer Responsibilities</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>A. Chef Obligations:</strong> We require every Chef who lists on our Platform to agree that they will, at all times:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Operate as a self-employed, independent contractor.</li>
                <li>Comply with all applicable UK laws and regulations, including the Food Safety Act 1990 and associated Food Hygiene Regulations.</li>
                <li>Be appropriately registered with their local council as a food business.</li>
                <li>Hold valid public liability insurance suitable for their business activities.</li>
                <li>Adhere to all regulations concerning food allergen information and labelling.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>B. Your Responsibility to Verify:</strong> You accept that we do not independently verify the above information. The responsibility for due diligence rests entirely with you, the Customer. Before engaging a Chef, you must independently:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li><strong>Verify Credentials:</strong> Ask for and check proof of the Chef's food hygiene registration, certifications, and public liability insurance.</li>
                <li><strong>Assess Suitability:</strong> Satisfy yourself as to the Chef's skills, experience, and hygiene standards.</li>
                <li><strong>Agree on Terms:</strong> Directly negotiate and agree all terms with the Chef, including menus, pricing, dietary needs, scheduling, and payment methods.</li>
                <li><strong>Communicate Allergies:</strong> Clearly and explicitly inform the Chef in writing of any and all food allergies or dietary restrictions.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your engagement of any Chef is a private contract between you and them. You proceed at your own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Assumption of Risk and Release of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You understand and accept that engaging an independent Chef to cook in a private home carries inherent risks. These risks include, but are not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Food-borne illness, allergic reactions, and other health issues.</li>
                <li>Poor quality food or unsatisfactory service.</li>
                <li>Damage to property, theft, or loss.</li>
                <li>Personal injury to any person present.</li>
                <li>A Chef's failure to provide the agreed-upon services.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mb-4">
                By using our Platform, you voluntarily and knowingly assume all such risks and agree to release, waive, and discharge Tastes Like Home Ltd and its directors, officers, and employees from any and all claims, demands, damages, or causes of action arising from or related to your interaction with or engagement of any Chef found through the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Independent Contractor Status</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                It is expressly understood that all Chefs are independent contractors and not employees, partners, agents, or joint venturers of Tastes Like Home Ltd. We do not exercise any control over the manner, methods, or timing of their work. No clause in this agreement is intended to create an employment relationship.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4 font-semibold">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY'S LIABILITY TO YOU FOR ANY AND ALL CLAIMS, LOSSES, OR DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE PLATFORM SHALL BE STRICTLY LIMITED TO A MAXIMUM AGGREGATE AMOUNT OF ONE HUNDRED POUNDS STERLING (£100).
              </p>
              <p className="text-gray-600 leading-relaxed mb-4 font-semibold">
                WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, LOSS OF PROFITS, LOSS OF DATA, PERSONAL INJURY, OR PROPERTY DAMAGE RELATED TO OR ARISING FROM YOUR USE OF THE PLATFORM OR YOUR ENGAGEMENT OF A CHEF.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                This limitation of liability does not apply to liability arising from our own negligence resulting in death or personal injury, or for our fraud or fraudulent misrepresentation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Indemnity</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree to defend, indemnify, and hold harmless Tastes Like Home Ltd, its affiliates, and their respective directors, officers, and employees from and against any and all claims, actions, liabilities, damages, losses, and expenses (including reasonable legal fees) that arise from or are connected to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Your use of the Platform and your engagement of a Chef.</li>
                <li>Your breach of any of these Terms.</li>
                <li>Any dispute or issue arising between you and a Chef.</li>
                <li>Your violation of any law or the rights of a third party.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Platform Availability Disclaimer</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Platform is provided on an "as is" and "as available" basis. We do not warrant that the Platform will be uninterrupted, error-free, secure, or that any information provided on it (including Chef profiles) is accurate, complete, or current.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All content, logos, graphics, and software on the Platform are the property of Tastes Like Home Ltd or its licensors and are protected by UK and international intellectual property laws. You may not copy, reproduce, or distribute any part of the Platform without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We reserve the right, in our sole discretion, to suspend or terminate your access to the Platform at any time and for any reason, without notice or liability, including for any breach of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law and Jurisdiction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                These Terms and any dispute or claim arising out of them shall be governed by and construed in accordance with the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction to settle any such dispute or claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. General Provisions</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and us regarding the use of the Platform.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Modifications:</strong> We may update these Terms from time to time by posting a new version on our website with an updated "Last Updated" date. Your continued use of the Platform after such a change constitutes your acceptance of the new Terms.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Severability:</strong> If any provision of these Terms is deemed invalid or unenforceable, that provision will be severed, and the remaining provisions will remain in full force and effect.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Contact:</strong> For any questions regarding these Terms, please contact us at aaryan-swarup@hotmail.co.uk.
              </p>
            </section>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important Legal Notice:</strong> This document is a legal agreement. While it aims to be clear, it has significant legal consequences. We are not a law firm and do not provide legal advice. You should consult with a qualified solicitor to ensure you fully understand your rights and obligations and to confirm that these terms are appropriate for your specific circumstances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
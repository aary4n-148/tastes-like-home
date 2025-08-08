import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Mail, ArrowRight } from 'lucide-react'

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          
          {/* Confirmation Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for applying to become a chef with Tastes Like Home. 
            Your application has been received and is now being reviewed by our team.
          </p>
          
          {/* Next Steps Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-blue-900 mb-3 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-2" />
              What happens next?
            </h2>
            
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>You'll receive a confirmation email shortly</span>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>We'll review your application within <strong>48 hours</strong></span>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>You'll be notified by email with our decision</span>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="text-sm text-gray-500 mb-6">
            <p>
              If you have any questions in the meantime, please don't hesitate to contact us.
            </p>
          </div>
          
          {/* Action Button */}
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
              Return to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Please check your email (including spam folder) for our confirmation message.
          </p>
        </div>
      </div>
    </div>
  )
}

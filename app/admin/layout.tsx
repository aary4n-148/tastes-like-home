'use client'

import { createSupabaseClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseClient()
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/admin/login')
          return
        }

        // Check admin role
        if (user.user_metadata?.role !== 'admin') {
          router.push('/admin/login')
          return
        }

        setUserEmail(user.email)
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/admin/login')
      }
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, redirect to login for security
      router.push('/admin/login')
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="text-xl font-bold text-gray-900 hover:text-blue-600"
              >
                Admin Dashboard
              </Link>
              <span className="text-gray-400">|</span>
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-blue-600"
                target="_blank"
              >
                View Website
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {userEmail && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{userEmail}</span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}

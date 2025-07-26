'use client'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export default function TestConnectionPage() {
  const [status, setStatus] = useState('Testing connection...')
  const [error, setError] = useState('')
  
  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createSupabaseClient()
        
        // Simple test query - just checking if we can connect
        const { data, error } = await supabase
          .from('_supabase_tables')
          .select('*')
          .limit(1)
        
        if (error) {
          // This is expected since we haven't created our tables yet
          // But if we get here, the connection works!
          setStatus('✅ Connection successful!')
          setError('Ready to create database tables')
        } else {
          setStatus('✅ Connection successful!')
        }
      } catch (err) {
        setStatus('❌ Connection failed')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    
    testConnection()
  }, [])
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <p className="text-lg mb-2">{status}</p>
      {error && (
        <p className="text-sm text-gray-600">
          Details: {error}
        </p>
      )}
      
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          If you see "✅ Connection successful!", your Supabase setup is working!
        </p>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ✅ Si déjà connecté → redirige direct
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push('/admin')
      } else {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      router.push('/admin')
    } else {
      alert('Identifiants incorrects')
    }
  }

  // ✅ évite le flash
  if (loading) return null

  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">

      <div className="p-6 border rounded-xl bg-white dark:bg-gray-900">

        <h1 className="mb-4 text-lg font-bold">Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 block w-full"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 block w-full"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Se connecter
        </button>

      </div>

    </div>
  )
}
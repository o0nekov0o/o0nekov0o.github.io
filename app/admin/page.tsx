'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [skills, setSkills] = useState<any[]>([])
  const [category, setCategory] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  const router = useRouter()

  // ✅ INIT THEME
  useEffect(() => {
    const saved = localStorage.getItem('theme')

    if (saved) {
      setDark(saved === 'dark')
    } else {
      setDark(true)
    }

    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', dark)
  }, [dark, mounted])

  // ✅ CHECK AUTH (ANTI FLASH)
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push('/admin/login')
      } else {
        setLoading(false)
        fetchSkills()
      }
    }

    checkUser()
  }, [])

  // ✅ FETCH SKILLS
  const fetchSkills = async () => {
    const { data } = await supabase.from('skills').select('*')
    if (data) setSkills(data)
  }

  // ✅ ADD
  const addSkill = async () => {
    if (!category || !name) return

    await supabase.from('skills').insert([
      { category, name }
    ])

    setCategory('')
    setName('')
    fetchSkills()
  }

  // ✅ DELETE
  const deleteSkill = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id)
    fetchSkills()
  }

  // ✅ LOGOUT
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // ✅ bloc hydration + auth
  if (!mounted || loading) return null

  return (
    <div className="min-h-screen p-10 bg-white dark:bg-black text-black dark:text-white">

      {/* HEADER */}
      <div className="flex justify-between mb-8">

        <h1 className="text-xl font-bold">Admin Skills</h1>

        <div className="flex gap-3">
          <button onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </div>

      </div>

      {/* FORM */}
      <div className="mb-8 flex gap-2">

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Skill"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />

        <button
          onClick={addSkill}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Ajouter
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-2">

        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex justify-between border p-3 rounded"
          >
            <span>
              <strong>{skill.category}</strong> — {skill.name}
            </span>

            <button onClick={() => deleteSkill(skill.id)}>
              ❌
            </button>
          </div>
        ))}

      </div>

    </div>
  )
}
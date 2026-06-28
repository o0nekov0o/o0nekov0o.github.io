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
    setDark(saved ? saved === 'dark' : true)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', dark)
  }, [dark, mounted])

  // ✅ AUTH
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

  // ✅ FETCH (tri par order)
  const fetchSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('*')
      .order('order', { ascending: true })

    if (data) setSkills(data)
  }

  // ✅ ADD (avec order auto)
  const addSkill = async () => {
    if (!category || !name) return

    const nextOrder = skills.length
      ? Math.max(...skills.map(s => s.order || 0)) + 1
      : 1

    await supabase.from('skills').insert([
      { category, name, order: nextOrder }
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

  // ✅ MOVE (UP / DOWN)
  const moveSkill = async (index: number, direction: number) => {
    const newSkills = [...skills]
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= skills.length) return

    const current = newSkills[index]
    const target = newSkills[targetIndex]

    // swap order
    const temp = current.order
    current.order = target.order
    target.order = temp

    setSkills([...newSkills].sort((a, b) => a.order - b.order))

    // update DB
    await Promise.all([
      supabase.from('skills').update({ order: current.order }).eq('id', current.id),
      supabase.from('skills').update({ order: target.order }).eq('id', target.id)
    ])
  }

  // ✅ LOGOUT
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (!mounted || loading) return null

  return (
    <div className="min-h-screen p-10 bg-white dark:bg-black text-black dark:text-white">

      {/* HEADER */}
      <div className="flex justify-between mb-8 items-center">
        <h1 className="text-xl font-bold">Admin Skills</h1>

        <div className="flex gap-4 items-center">
          <button onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>

          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="mb-10 flex gap-3 flex-wrap">

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border dark:border-gray-800 p-2 rounded bg-white dark:bg-gray-900"
        />

        <input
          placeholder="Skill"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border dark:border-gray-800 p-2 rounded bg-white dark:bg-gray-900"
        />

        <button
          onClick={addSkill}
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          Ajouter
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-3">

        {skills.map((skill, i) => (
          <div
            key={skill.id}
            className="flex justify-between items-center border dark:border-gray-800 p-4 rounded-lg bg-white dark:bg-gray-900/60 backdrop-blur"
          >

            {/* INFO */}
            <div>
              <p className="font-semibold">
                {skill.category}
              </p>
              <p className="text-sm text-gray-500">
                {skill.name}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">

              {/* MOVE */}
              <button
                onClick={() => moveSkill(i, -1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded"
              >
                ↑
              </button>

              <button
                onClick={() => moveSkill(i, 1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded"
              >
                ↓
              </button>

              {/* DELETE */}
              <button
                onClick={() => deleteSkill(skill.id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                ❌
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

// ✅ DND KIT
import {
  DndContext,
  closestCenter
} from '@dnd-kit/core'

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

// ✅ ITEM DRAG
function SortableItem({ skill, deleteSkill }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: skill.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex justify-between items-center border dark:border-gray-800 p-4 rounded-lg bg-white dark:bg-gray-900/60 backdrop-blur"
    >
      {/* DRAG HANDLE */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab font-semibold"
      >
        {skill.category} — {skill.name}
      </div>

      {/* DELETE */}
      <button
        onClick={() => deleteSkill(skill.id)}
        className="px-2 py-1 bg-red-500 text-white rounded"
      >
        ❌
      </button>
    </div>
  )
}

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

  // ✅ FETCH AVEC TRI
  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('order', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    if (data) setSkills(data)
  }

  // ✅ ADD SKILL
  const addSkill = async () => {
    if (!category || !name) return

    const nextOrder =
      skills.length > 0
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

  // ✅ DRAG & DROP FIX FINAL
  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = skills.findIndex(s => s.id === active.id)
    const newIndex = skills.findIndex(s => s.id === over.id)

    const newSkills = arrayMove(skills, oldIndex, newIndex)

    // ✅ recalcul COMPLET de l'ordre
    const updatedSkills = newSkills.map((skill, index) => ({
      ...skill,
      order: index + 1
    }))

    // ✅ update UI
    setSkills(updatedSkills)

    // ✅ update DB (critique)
    await Promise.all(
      updatedSkills.map(skill =>
        supabase
          .from('skills')
          .update({ order: skill.order })
          .eq('id', skill.id)
      )
    )
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

      {/* LIST DRAG */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={skills.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {skills.map(skill => (
              <SortableItem
                key={skill.id}
                skill={skill}
                deleteSkill={deleteSkill}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

    </div>
  )
}
``
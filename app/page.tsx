'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [skills, setSkills] = useState<any[]>([])
  const [repos, setRepos] = useState<any[]>([])

  // ✅ INIT THEME (dark par défaut)
  useEffect(() => {
    const saved = localStorage.getItem('theme')

    if (saved) {
      setDark(saved === 'dark')
    } else {
      setDark(true)
    }

    setMounted(true)
  }, [])

  // ✅ APPLY THEME
  useEffect(() => {
    if (!mounted) return

    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark, mounted])

  // ✅ FETCH SKILLS (Supabase)
  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase.from('skills').select('*')

      if (error) {
        console.error('Supabase error:', error)
        return
      }

      if (data) setSkills(data)
    }

    fetchSkills()
  }, [])

  // ✅ FETCH GITHUB REPOS
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch(
          'https://api.github.com/users/o0nekov0o/repos',
          {
            headers: {
              Accept: 'application/vnd.github+json',
            },
          }
        )

        const data = await res.json()

        if (Array.isArray(data)) {
          setRepos(data)
        } else {
          console.error('GitHub API error:', data)
          setRepos([])
        }
      } catch (error) {
        console.error('GitHub fetch error:', error)
        setRepos([])
      }
    }

    fetchRepos()
  }, [])

  // ✅ GROUP SKILLS
  const groupedSkills = skills.reduce((acc: any, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill.name)
    return acc
  }, {})

  // ✅ SORT REPOS BY CREATION DATE (DESC)
  const sortedRepos = [...repos].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )

  // ✅ FORMAT DATE
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-gray-100 transition">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white dark:bg-black dark:border-gray-800">
        <h1 className="font-bold">Kevin B</h1>

        <button
          onClick={() => setDark(!dark)}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* HERO */}
      <section className="text-center py-24 px-6">
        <motion.h1 className="text-5xl font-bold mb-6">
          Développeur Python & Fullstack
        </motion.h1>

        <p className="max-w-xl mx-auto mb-8 text-gray-600 dark:text-gray-400">
          Profil hybride combinant développement applicatif et expertise systèmes.
        </p>

        <a
          href="#projects"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Voir mes projets
        </a>
      </section>

      {/* SEPARATOR */}
      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-10" />

      {/* SKILLS */}
      <section className="py-20 px-6">
        <h2 className="text-2xl font-semibold text-center mb-12">
          Compétences
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {Object.entries(groupedSkills).length > 0 ? (
            Object.entries(groupedSkills).map(([category, items]) => (
              <div
                key={category}
                className="p-6 border rounded-xl bg-white dark:bg-gray-900"
              >
                <h3 className="font-semibold mb-2">{category}</h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(items as string[]).join(', ')}
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">
              Aucune compétence pour le moment
            </p>
          )}

        </div>
      </section>

      {/* SEPARATOR */}
      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-10" />

      {/* PROJECTS */}
      <section
        id="projects"
        className="py-20 px-6 bg-white dark:bg-black"
      >
        <h2 className="text-2xl font-semibold text-center mb-12">
          Projets
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {Array.isArray(sortedRepos) && sortedRepos.length > 0 ? (
            sortedRepos.map((repo) => (
              <motion.div
                key={repo.id}
                whileHover={{ y: -5 }}
                className="p-6 border rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold mb-1">
                  {repo.name}
                </h3>

                {/* ✅ DATE */}
                <p className="text-xs text-gray-400 mb-2">
                  Créé en {formatDate(repo.created_at)}
                </p>

                <p className="text-sm text-gray-500 mb-4">
                  {repo.description || 'Aucune description'}
                </p>

                <a
                  href={repo.html_url}
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  Voir le code
                </a>
              </motion.div>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500">
              Aucun projet trouvé
            </p>
          )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-400 py-6">
        © 2026 Kevin B • 91_kevb_1[at]protonmail.com
      </footer>

    </div>
  )
}
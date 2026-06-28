'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const [skills, setSkills] = useState<any[]>([])
  const [repos, setRepos] = useState<any[]>([])

  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const reposPerPage = 10

  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  // ✅ INIT THEME
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    setDark(saved ? saved === 'dark' : true)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark, mounted])

  // ✅ LOADING
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // ✅ CURSOR
  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  // ✅ FETCH SKILLS
  useEffect(() => {
    const fetchSkills = async () => {
      const { data } = await supabase.from('skills').select('*')
      if (data) setSkills(data)
    }
    fetchSkills()
  }, [])

  // ✅ FETCH GITHUB
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch(
          'https://api.github.com/users/o0nekov0o/repos'
        )
        const data = await res.json()
        if (Array.isArray(data)) setRepos(data)
      } catch {
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

  // ✅ SORT REPOS
  const sortedRepos = [...repos].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )

  // ✅ FILTER
  const filteredRepos = sortedRepos.filter((repo) => {
    if (filter === 'all') return true
    return repo.language === filter
  })

  // ✅ PAGINATION
  const indexOfLast = currentPage * reposPerPage
  const indexOfFirst = indexOfLast - reposPerPage
  const currentRepos = filteredRepos.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredRepos.length / reposPerPage)

  // ✅ SCROLL TOP ON PAGE CHANGE
  useEffect(() => {
    const section = document.getElementById('projects')  
if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
  }, [currentPage])

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    })

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Chargement...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-[#111827] dark:via-[#030712] dark:to-black text-gray-900 dark:text-gray-100">

      {/* CURSOR */}
      <motion.div
        className="fixed w-6 h-6 bg-blue-500/40 rounded-full pointer-events-none z-50"
        animate={{ x: mouse.x - 12, y: mouse.y - 12 }}
        transition={{ type: 'spring', stiffness: 300 }}
      />

      {/* SPOTLIGHT */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `radial-gradient(600px at ${mouse.x}px ${mouse.y}px, rgba(59,130,246,0.15), transparent)`
        }}
      />

      {/* NAVBAR */}
      <div className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-black/60 border-b dark:border-gray-800">
        <div className="flex justify-between px-6 py-4">
          <h1 className="font-bold">Kevin B</h1>
          <button onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="text-center py-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6"
        >
          Développeur Python & Fullstack
        </motion.h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Profil hybride combinant développement applicatif et expérience en environnement systèmes et exploitation.
        </p>

        <a
          href="#projects"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:scale-105 transition"
        >
          Voir mes projets ↓
        </a>
      </section>

      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-10" />

      {/* SKILLS */}
      <section className="py-20">
        <h2 className="text-center text-2xl mb-12">Compétences</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Object.entries(groupedSkills).map(([cat, items]) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-6 border dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/60 backdrop-blur hover:shadow-lg transition"
            >
              <h3>{cat}</h3>
              <p>{(items as string[]).join(', ')}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl mb-6">À propos</h2>

        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
{`Ce portfolio présente une sélection de projets significatifs issus de ma formation développeur Python, complétée par des réalisations personnelles en développement fullstack moderne (Next.js, Supabase).

Les projets les plus courts ou orientés soft skills n’ont pas été inclus afin de mettre en avant des réalisations techniques plus complètes.

Le diplôme Développeur Python a été validé à l’issue du projet final.`}
        </p>
      </section>

      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-10" />

      {/* PROJECTS */}
      <section id="projects" className="py-20">
        <h2 className="text-center text-2xl mb-8">Projets</h2>

        {/* FILTER */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {['all', 'Python', 'TypeScript', 'JavaScript'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* PROJECT LIST */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {currentRepos.map((repo) => (
            <motion.div
              key={repo.id}
              whileHover={{ y: -8, scale: 1.03 }}
              className="p-6 border dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/60 backdrop-blur hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold">{repo.name}</h3>

              <p className="text-xs text-gray-400">
                {formatDate(repo.created_at)}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                {repo.description}
              </p>

              <a
                href={repo.html_url}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                Voir →
              </a>
            </motion.div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-10 gap-4 items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
          >
            ←
          </button>

          <span className="text-sm text-gray-500">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
          >
            →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm py-6 text-gray-400">
        © 2026 Kevin B • 91_kevb_1[at]protonmail.com
      </footer>
    </div>
  )
}
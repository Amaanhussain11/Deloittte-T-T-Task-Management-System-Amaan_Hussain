import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-surface-1 border-r border-border flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="2" rx="1" fill="white"/>
              <rect x="1" y="6" width="8" height="2" rx="1" fill="white" opacity="0.7"/>
              <rect x="1" y="10" width="10" height="2" rx="1" fill="white" opacity="0.45"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-100">TeamFlow</span>
        </div>

        <div>
          <blockquote className="text-2xl font-light text-slate-300 leading-relaxed mb-6">
            "Clarity of ownership.<br/>Velocity of execution."
          </blockquote>
          <div className="flex flex-col gap-3">
            {['Track tasks across your team', 'Filter by status and assignee', 'Admin controls built in'].map(t => (
              <div key={t} className="flex items-center gap-3 text-sm text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs font-mono text-slate-700">TEAMFLOW © 2026</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-100 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2 py-2.5" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-slate-600 text-center mt-6">
            No account?{' '}
            <Link to="/register" className="text-accent hover:text-blue-400 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

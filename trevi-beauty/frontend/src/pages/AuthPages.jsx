import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.username || 'beautiful'}!`)
      navigate(user.is_admin ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Image side */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200"
          alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <Sparkles className="w-12 h-12 text-blush-300 mx-auto mb-4" />
            <h2 className="font-display text-5xl font-bold mb-4">Welcome Back</h2>
            <p className="font-accent text-xl italic text-white/70">Beauty awaits you</p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FFF2DB]">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-10">
            <Sparkles className="w-5 h-5 text-blush-500" />
            <span className="font-display text-3xl font-bold text-gradient-rose">Trevi Beauty</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-rose-900 text-center mb-2">Sign In</h1>
          <p className="text-center text-rose-500 text-sm mb-8">Don't have an account? <Link to="/register" className="text-blush-600 font-medium hover:underline">Create one</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-rose-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors bg-[#FBE4C4]/50/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rose-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors bg-[#FBE4C4]/50/30" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full gradient-rose text-white py-4 rounded-2xl font-semibold mt-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 p-4 bg-[#FBE4C4]/50 rounded-2xl text-xs text-rose-500">
            <strong>Demo accounts:</strong><br />
            Admin: admin@trevibeauty.com / admin123<br />
            User: user@trevibeauty.com / user123
          </div>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [form, setForm]       = useState({ email: '', username: '', full_name: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate     = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FFF2DB] py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <Sparkles className="w-5 h-5 text-blush-500" />
          <span className="font-display text-3xl font-bold text-gradient-rose">Trevi Beauty</span>
        </Link>
        <h1 className="font-display text-3xl font-bold text-rose-900 text-center mb-2">Create Account</h1>
        <p className="text-center text-rose-500 text-sm mb-8">Already have one? <Link to="/login" className="text-blush-600 font-medium hover:underline">Sign in</Link></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'full_name', label: 'Full Name', type: 'text' },
            { key: 'username',  label: 'Username',  type: 'text' },
            { key: 'email',     label: 'Email',     type: 'email' },
            { key: 'password',  label: 'Password',  type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-rose-700 mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors bg-[#FBE4C4]/50/30" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full gradient-rose text-white py-4 rounded-2xl font-semibold mt-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

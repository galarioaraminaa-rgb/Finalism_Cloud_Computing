import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Search, User, Menu, X, Heart, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Skincare', to: '/shop?category=skincare' },
    { label: 'Makeup', to: '/shop?category=lipstick' },
    { label: 'Fragrance', to: '/shop?category=fragrance' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blush-500" />
            <span className="font-display text-2xl font-bold text-gradient-rose">Trevi Beauty</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className="font-body text-sm font-medium text-rose-900/70 hover:text-blush-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)}
              className="p-2 text-rose-900/70 hover:text-blush-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="relative group">
                <button className="p-2 text-rose-900/70 hover:text-blush-600 transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 border-b border-rose-100">
                    <p className="text-xs text-rose-400">Signed in as</p>
                    <p className="text-sm font-medium text-rose-900 truncate">{user.email}</p>
                  </div>
                  <Link to="/account" className="block px-4 py-2 text-sm text-rose-800 hover:bg-blush-50 transition-colors">My Account</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-rose-800 hover:bg-blush-50 transition-colors">My Orders</Link>
                  {user.is_admin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-blush-600 hover:bg-blush-50 transition-colors">Admin Dashboard</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-rose-800 hover:bg-blush-50 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-2 text-rose-900/70 hover:text-blush-600 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 text-rose-900/70 hover:text-blush-600 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-rose text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-rose-900/70">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}>
          <form onSubmit={handleSearch} onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl glass rounded-2xl shadow-2xl p-4 flex gap-3">
            <Search className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for lipsticks, serums, palettes..."
              className="flex-1 bg-transparent text-rose-900 placeholder-rose-300 outline-none text-lg font-body" />
            <button type="button" onClick={() => setSearchOpen(false)} className="text-rose-400 hover:text-rose-600">
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="font-display text-2xl font-bold text-gradient-rose">Trevi Beauty</span>
            <button onClick={() => setMobileOpen(false)}><X className="w-6 h-6 text-rose-800" /></button>
          </div>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
              className="py-4 border-b border-rose-50 font-display text-xl text-rose-900">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

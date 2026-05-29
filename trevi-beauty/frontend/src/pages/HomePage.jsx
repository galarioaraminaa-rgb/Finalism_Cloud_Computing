import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Star, Shield, Truck } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

const HERO_BG = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&q=80'
const HERO_2   = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'

const CATEGORIES = [
  { name: 'Lipstick', slug: 'lipstick', img: 'https://images.unsplash.com/photo-1586495777744-4e6232bf3736?w=400', color: 'from-rose-100 to-blush-100' },
  { name: 'Foundation', slug: 'foundation', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', color: 'from-champagne-100 to-amber-100' },
  { name: 'Eyeshadow', slug: 'eyeshadow', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400', color: 'from-purple-100 to-pink-100' },
  { name: 'Skincare', slug: 'skincare', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', color: 'from-green-100 to-teal-100' },
  { name: 'Fragrance', slug: 'fragrance', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400', color: 'from-yellow-100 to-amber-100' },
  { name: 'Brushes', slug: 'brushes-tools', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400', color: 'from-slate-100 to-gray-100' },
]

const PERKS = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders over ₱1,500' },
  { icon: Shield, label: 'Authentic Products', sub: '100% genuine beauty' },
  { icon: Star, label: 'Top Rated', sub: 'Loved by 10k+ customers' },
  { icon: Sparkles, label: 'Beauty Experts', sub: 'Curated by professionals' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/products/featured').then(r => setFeatured(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Hero" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3e220d]/90 via-rose-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
          <div className="max-w-xl">
            <p className="font-accent text-lg italic text-blush-300 mb-3 animate-fade-in">
              ✦ New Season Collection
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
              Beauty<br />
              <span className="italic font-normal text-blush-300">Reimagined</span>
            </h1>
            <p className="font-body text-lg text-white/70 mb-10 leading-relaxed animate-slide-up">
              Discover our curated collection of premium makeup and skincare. 
              From bold lips to flawless skin — your beauty story starts here.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up">
              <Link to="/shop" className="gradient-rose text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-blush-600/30">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?featured=true" className="glass text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-colors">
                Featured Products
              </Link>
            </div>
          </div>
        </div>

        {/* Floating card */}
        <div className="absolute right-8 bottom-16 hidden lg:block animate-float">
          <div className="glass rounded-3xl p-5 shadow-2xl w-64">
            <img src={HERO_2} alt="" className="w-full h-32 object-cover rounded-2xl mb-3" />
            <p className="font-display text-sm font-semibold text-rose-900">Bestseller</p>
            <p className="font-accent text-xs italic text-rose-600">Glow Serum Vitamin C</p>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-champagne-400 text-champagne-400" />)}
            </div>
          </div>
        </div>
      </section>

      {/* Perks bar */}
      <section className="bg-[#FBE4C4] border-b border-[#FAE3D9] py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {PERKS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-rose rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-rose-900">{label}</p>
                <p className="font-body text-xs text-rose-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="font-accent text-base italic text-blush-500 mb-2">Browse By Category</p>
          <h2 className="font-display text-4xl font-bold text-rose-900">Find Your Look</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/shop?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-3xl aspect-square card-hover">
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80`} />
              <img src={cat.img} alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-end p-4">
                <p className="font-display text-sm font-bold text-rose-900">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-accent text-base italic text-blush-500 mb-2">Handpicked for You</p>
            <h2 className="font-display text-4xl font-bold text-rose-900">Featured Products</h2>
          </div>
          <Link to="/shop?featured=true" className="flex items-center gap-2 text-blush-600 font-medium text-sm hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-rose-50 rounded-3xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="mx-4 md:mx-8 mb-20 rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3e220d] to-[#b8863b]" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 md:py-24 text-white text-center">
          <p className="font-accent text-xl italic text-blush-300 mb-3">Limited Time Offer</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">Free Shipping<br />This Weekend</h2>
          <p className="text-white/70 mb-8">On all orders. No minimum purchase required.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-rose-900 px-8 py-4 rounded-full font-semibold hover:bg-blush-50 transition-colors">
            Shop the Sale <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

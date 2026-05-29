import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest' },
  { value: 'price-asc',       label: 'Price: Low to High' },
  { value: 'price-desc',      label: 'Price: High to Low' },
  { value: 'rating_avg-desc', label: 'Top Rated' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const page     = parseInt(searchParams.get('page') || '1')
  const search   = searchParams.get('search') || ''
  const catSlug  = searchParams.get('category') || ''
  const featured = searchParams.get('featured') || ''
  const sort     = searchParams.get('sort') || 'created_at-desc'
  const [sortField, sortOrder] = sort.split('-')

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const catId = categories.find(c => c.slug === catSlug)?.id

    const params = {
      page, limit: 20,
      sort: sortField, order: sortOrder,
      ...(search && { search }),
      ...(catId  && { category_id: catId }),
      ...(featured === 'true' && { featured: true }),
    }
    api.get('/products', { params }).then(r => {
      setProducts(r.data.products || [])
      setTotal(r.data.total || 0)
      setPages(r.data.pages || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [searchParams, categories])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-rose-900">
              {search ? `"${search}"` : catSlug ? categories.find(c => c.slug === catSlug)?.name : 'All Products'}
            </h1>
            <p className="text-rose-500 text-sm mt-1">{total} products</p>
          </div>
          <div className="flex gap-3">
            <select value={sort} onChange={e => setParam('sort', e.target.value)}
              className="glass rounded-xl px-4 py-2 text-sm text-rose-900 outline-none cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="glass rounded-xl px-4 py-2 text-sm text-rose-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <div className={`${filtersOpen ? 'block' : 'hidden'} md:block w-56 flex-shrink-0`}>
            <div className="sticky top-28 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-display font-semibold text-rose-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <button onClick={() => setParam('category', '')}
                    className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!catSlug ? 'bg-blush-100 text-blush-700 font-medium' : 'text-rose-700 hover:bg-[#FFF2DB]'}`}>
                    All
                  </button>
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setParam('category', c.slug)}
                      className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${catSlug === c.slug ? 'bg-blush-100 text-blush-700 font-medium' : 'text-rose-700 hover:bg-[#FFF2DB]'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-[#FFF2DB] rounded-3xl aspect-square animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-2xl text-rose-300">No products found</p>
                <button onClick={() => setSearchParams({})} className="mt-4 text-blush-600 text-sm underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {[...Array(pages)].map((_, i) => (
                      <button key={i} onClick={() => setParam('page', String(i + 1))}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${page === i + 1 ? 'gradient-rose text-white' : 'bg-[#FFF2DB] text-rose-700 hover:bg-blush-50 shadow-sm'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

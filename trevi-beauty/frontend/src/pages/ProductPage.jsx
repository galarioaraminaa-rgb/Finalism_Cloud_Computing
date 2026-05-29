import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Star, ChevronLeft, Package, Shield, Truck } from 'lucide-react'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct]   = useState(null)
  const [reviews, setReviews]   = useState([])
  const [related, setRelated]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${slug}`).then(async r => {
      setProduct(r.data)
      // Fetch reviews and related
      const [rev, rel] = await Promise.all([
        api.get(`/reviews/product/${r.data.id}`).catch(() => ({ data: [] })),
        api.get(`/products?category_id=${r.data.category_id}&limit=4`).catch(() => ({ data: { products: [] } })),
      ])
      setReviews(rev.data)
      setRelated((rel.data.products || []).filter(p => p.id !== r.data.id).slice(0, 4))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!product) return (
    <div className="min-h-screen pt-32 text-center">
      <p className="font-display text-2xl text-rose-300">Product not found</p>
    </div>
  )

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back */}
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-blush-600 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>

        {/* Product */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-square bg-blush-50">
            <img src={product.image_url || ''} alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800' }} />
            {discount && (
              <div className="absolute top-5 left-5 gradient-rose text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                Save {discount}%
              </div>
            )}
          </div>

          {/* Info */}
          <div className="py-4">
            {product.brand && (
              <p className="font-accent text-lg italic text-blush-500 mb-2">{product.brand}</p>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-rose-900 mb-4">
              {product.name}
            </h1>

            {product.rating_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating_avg) ? 'fill-champagne-400 text-champagne-400' : 'text-rose-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-rose-600 font-medium">{product.rating_avg?.toFixed(1)}</span>
                <span className="text-sm text-rose-400">({product.rating_count} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold text-rose-900">
                ₱{Number(product.price).toLocaleString()}
              </span>
              {product.compare_price && (
                <span className="text-lg text-rose-400 line-through">
                  ₱{Number(product.compare_price).toLocaleString()}
                </span>
              )}
            </div>

            {product.description && (
              <p className="font-body text-rose-600 leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-rose-700">Quantity</span>
              <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-6 h-6 flex items-center justify-center text-rose-700 hover:text-blush-600 font-bold">−</button>
                <span className="w-6 text-center font-medium text-rose-900">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-6 h-6 flex items-center justify-center text-rose-700 hover:text-blush-600 font-bold">+</button>
              </div>
              <span className="text-xs text-rose-400">{product.stock} in stock</span>
            </div>

            <button onClick={() => addToCart(product.id, quantity)}
              disabled={product.stock === 0}
              className="w-full gradient-rose text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-blush-500/25 disabled:opacity-50 disabled:cursor-not-allowed mb-4">
              <ShoppingBag className="w-5 h-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, text: 'Free delivery over ₱1,500' },
                { icon: Shield, text: '100% authentic products' },
                { icon: Package, text: 'Easy 30-day returns' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 p-3 bg-[#FFF2DB] rounded-2xl text-center">
                  <Icon className="w-4 h-4 text-blush-500" />
                  <p className="text-xs text-rose-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mb-20">
            <h2 className="font-display text-2xl font-bold text-rose-900 mb-6">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.slice(0, 6).map(r => (
                <div key={r.id} className="bg-[#FFF2DB] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-rose-900 text-sm">{r.user?.username}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'fill-champagne-400 text-champagne-400' : 'text-rose-200'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-rose-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.title && <p className="font-medium text-rose-800 text-sm mb-1">{r.title}</p>}
                  {r.body && <p className="text-rose-600 text-sm leading-relaxed">{r.body}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-rose-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

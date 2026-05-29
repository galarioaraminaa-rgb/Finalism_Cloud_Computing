import { Link } from 'react-router-dom'
import { ShoppingBag, Star, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  return (
    <div className="group relative bg-[#FFF2DB] rounded-3xl overflow-hidden card-hover shadow-sm">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-square bg-blush-50">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400' }}
        />
        {discount && (
          <div className="absolute top-3 left-3 gradient-rose text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            -{discount}%
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); addToCart(product.id) }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 gradient-rose text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg whitespace-nowrap">
          <ShoppingBag className="w-4 h-4" />
          Add to Bag
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <p className="text-xs font-accent text-blush-500 uppercase tracking-widest mb-1">{product.brand}</p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-sm font-medium text-rose-900 line-clamp-2 hover:text-blush-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-champagne-400 text-champagne-400" />
            <span className="text-xs text-rose-600">{product.rating_avg?.toFixed(1)}</span>
            <span className="text-xs text-rose-400">({product.rating_count})</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-rose-900">₱{Number(product.price).toLocaleString()}</span>
          {product.compare_price && (
            <span className="text-xs text-rose-400 line-through">₱{Number(product.compare_price).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  )
}

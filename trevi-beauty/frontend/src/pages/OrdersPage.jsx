import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import api from '../utils/api'

const STATUS_COLORS = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!orders.length) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
      <ShoppingBag className="w-16 h-16 text-rose-200" />
      <h2 className="font-display text-2xl text-rose-300">No orders yet</h2>
      <Link to="/shop" className="gradient-rose text-white px-8 py-3 rounded-full font-medium">
        Start Shopping
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl font-bold text-rose-900 mb-8">My Orders</h1>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-[#FFF2DB] rounded-3xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-display font-semibold text-rose-900">{order.order_number}</p>
                  <p className="text-xs text-rose-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-rose-100 text-rose-700'}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold text-rose-900">
                    ₱{Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {order.items?.slice(0, 4).map(item => (
                  <div key={item.id} className="flex-shrink-0 flex items-center gap-2 bg-[#FFF2DB] rounded-2xl p-2 pr-4">
                    <img
                      src={item.product?.image_url || ''}
                      alt={item.product?.name}
                      className="w-10 h-10 object-cover rounded-xl bg-blush-100"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=100' }}
                    />
                    <div>
                      <p className="text-xs font-medium text-rose-900 truncate max-w-[120px]">{item.product?.name}</p>
                      <p className="text-xs text-rose-400">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-[#FFF2DB] rounded-2xl text-xs text-rose-500 font-medium">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-rose-50 flex items-center justify-between text-sm">
                <span className="text-rose-500">
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.payment_method?.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-blush-600 font-medium">
                  View details <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

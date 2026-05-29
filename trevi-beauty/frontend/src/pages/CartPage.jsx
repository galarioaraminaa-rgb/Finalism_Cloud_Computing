// CartPage.jsx
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export function CartPage() {
  const { cart, updateItem, removeItem } = useCart()
  const { user } = useAuth()

  const total = cart.items.reduce((s, i) => s + Number(i.product?.price || 0) * i.quantity, 0)
  const shipping = total > 1500 ? 0 : 99

  if (!cart.items.length) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
      <ShoppingBag className="w-16 h-16 text-rose-200" />
      <h2 className="font-display text-2xl text-rose-300">Your bag is empty</h2>
      <Link to="/shop" className="gradient-rose text-white px-8 py-3 rounded-full font-medium">Start Shopping</Link>
    </div>
  )

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl font-bold text-rose-900 mb-8">Your Bag</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="bg-[#FFF2DB] rounded-2xl p-4 flex gap-4 shadow-sm">
                <img src={item.product?.image_url || ''} alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-xl bg-blush-50"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blush-500 font-accent italic">{item.product?.brand}</p>
                  <p className="font-display font-medium text-rose-900 text-sm mt-0.5 truncate">{item.product?.name}</p>
                  <p className="font-semibold text-rose-900 mt-1">₱{Number(item.product?.price || 0).toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5">
                      <button onClick={() => updateItem(item.id, item.quantity - 1)} className="text-rose-600 hover:text-blush-600"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium text-rose-900 w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} className="text-rose-600 hover:text-blush-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-rose-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-[#FFF2DB] rounded-3xl p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-rose-900 mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between text-rose-700"><span>Subtotal</span><span>₱{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-rose-700"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₱${shipping}`}</span></div>
                <div className="border-t pt-3 flex justify-between font-bold text-rose-900 text-base">
                  <span>Total</span><span>₱{(total + shipping).toLocaleString()}</span>
                </div>
              </div>
              {user ? (
                <Link to="/checkout" className="block w-full gradient-rose text-white py-4 rounded-2xl font-semibold text-center flex items-center justify-center gap-2">
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link to="/login" className="block w-full gradient-rose text-white py-4 rounded-2xl font-semibold text-center">
                  Login to Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

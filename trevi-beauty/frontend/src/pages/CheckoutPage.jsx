import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState({
    shipping_address: user?.address || '',
    payment_method: 'cod',
    notes: '',
  })

  const total = cart.items.reduce((s, i) => s + Number(i.product?.price || 0) * i.quantity, 0)
  const shipping = total > 1500 ? 0 : 99

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.shipping_address.trim()) { toast.error('Please enter your address'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/orders', form)
      await fetchCart()
      setSuccess(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 gradient-rose rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blush-400/30">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h1 className="font-display text-4xl font-bold text-rose-900 mb-3">Order Placed!</h1>
      <p className="font-accent text-xl italic text-blush-500 mb-2">Thank you for shopping with us</p>
      <p className="text-rose-500 mb-1">Order Number: <span className="font-semibold text-rose-800">{success.order_number}</span></p>
      <p className="text-rose-500 mb-10">Total: <span className="font-semibold text-rose-800">₱{Number(success.total_amount).toLocaleString()}</span></p>
      <div className="flex gap-4">
        <Link to="/orders" className="gradient-rose text-white px-8 py-3 rounded-full font-medium">View Orders</Link>
        <Link to="/shop" className="glass text-rose-900 px-8 py-3 rounded-full font-medium border border-rose-200">Continue Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-blush-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="font-display text-4xl font-bold text-rose-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div className="bg-[#FFF2DB] rounded-3xl p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-rose-900 mb-5">Shipping Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-rose-700 mb-1.5">Full Name</label>
                  <input type="text" value={user?.full_name || user?.username || ''} disabled
                    className="w-full border border-rose-100 rounded-2xl px-4 py-3 text-rose-600 bg-[#FFF2DB]/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rose-700 mb-1.5">Delivery Address *</label>
                  <textarea value={form.shipping_address} onChange={e => setForm({ ...form, shipping_address: e.target.value })}
                    rows={3} required placeholder="Street, Barangay, City, Province, ZIP"
                    className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors resize-none bg-[#FFF2DB]/30 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rose-700 mb-1.5">Order Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={2} placeholder="Any special instructions..."
                    className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors resize-none bg-[#FFF2DB]/30 text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-[#FFF2DB] rounded-3xl p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-rose-900 mb-5">Payment Method</h2>
              {['cod', 'gcash', 'bank_transfer'].map(method => (
                <label key={method} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer mb-3 border-2 transition-colors ${form.payment_method === method ? 'border-blush-400 bg-blush-50' : 'border-rose-100 hover:border-rose-200'}`}>
                  <input type="radio" name="payment" value={method} checked={form.payment_method === method}
                    onChange={() => setForm({ ...form, payment_method: method })} className="accent-blush-500" />
                  <span className="text-sm font-medium text-rose-900 capitalize">
                    {method === 'cod' ? '💵 Cash on Delivery' : method === 'gcash' ? '📱 GCash' : '🏦 Bank Transfer'}
                  </span>
                </label>
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full gradient-rose text-white py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blush-500/25">
              {loading ? 'Processing...' : `Place Order — ₱${(total + shipping).toLocaleString()}`}
            </button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#FFF2DB] rounded-3xl p-6 shadow-sm sticky top-28">
              <h2 className="font-display text-xl font-bold text-rose-900 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product?.image_url || ''} alt="" className="w-12 h-12 object-cover rounded-xl bg-blush-50 flex-shrink-0"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=100' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-rose-900 truncate">{item.product?.name}</p>
                      <p className="text-xs text-rose-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-rose-900 flex-shrink-0">
                      ₱{(Number(item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-rose-600"><span>Subtotal</span><span>₱{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-rose-600"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₱${shipping}`}</span></div>
                <div className="flex justify-between font-bold text-rose-900 text-base pt-2 border-t">
                  <span>Total</span><span>₱{(total + shipping).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

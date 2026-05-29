import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  TrendingUp, Star, Sparkles, LogOut, ChevronRight, AlertCircle,
  Plus, Edit, Check, X, RefreshCw, DollarSign, ArrowUpRight
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, logout }) {
  const links = [
    { id: 'overview',  label: 'Overview',   icon: LayoutDashboard },
    { id: 'sales',     label: 'Sales',      icon: TrendingUp },
    { id: 'products',  label: 'Products',   icon: Package },
    { id: 'orders',    label: 'Orders',     icon: ShoppingCart },
    { id: 'customers', label: 'Customers',  icon: Users },
    { id: 'reporting', label: 'Reporting',  icon: BarChart3 },
  ]
  return (
    <aside className="w-56 bg-[#3e220d] text-white flex flex-col min-h-screen fixed top-0 left-0 z-40">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blush-400" />
          <span className="font-display text-xl font-bold">Trevi Beauty</span>
        </div>
        <p className="text-xs text-white/40 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active === id ? 'bg-blush-600 text-white' : 'text-white/60 hover:bg-[#FFF2DB]/10 hover:text-white'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-[#FFF2DB]/10 transition-colors mb-1">
          <Sparkles className="w-4 h-4" /> Visit Store
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-[#FFF2DB]/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = 'blush' }) {
  const colors = {
    blush:    'from-blush-500 to-rose-500',
    purple:   'from-purple-500 to-pink-500',
    amber:    'from-amber-400 to-orange-500',
    teal:     'from-teal-400 to-cyan-500',
  }
  return (
    <div className="bg-[#FFF2DB] rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-rose-300" />
      </div>
      <p className="text-2xl font-display font-bold text-rose-900">{value}</p>
      <p className="text-sm font-medium text-rose-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-rose-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Mini Bar Chart ─────────────────────────────────────────────────────────────
function MiniBarChart({ data, valueKey = 'revenue', labelKey = 'day' }) {
  if (!data?.length) return <p className="text-rose-300 text-sm text-center py-8">No data yet</p>
  const max = Math.max(...data.map(d => d[valueKey] || 0))
  return (
    <div className="flex items-end gap-1 h-32">
      {data.slice(-20).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div
            className="w-full bg-gradient-to-t from-blush-500 to-rose-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ height: `${Math.max(4, (d[valueKey] / max) * 100)}%` }}
          />
          <div className="absolute bottom-full mb-1 bg-rose-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {d[labelKey]}: ₱{Number(d[valueKey]).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Overview Tab ───────────────────────────────────────────────────────────────
function OverviewTab() {
  const [summary, setSummary] = useState(null)
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [catData, setCatData] = useState([])

  useEffect(() => {
    api.get('/analytics/summary').then(r => setSummary(r.data)).catch(() => {})
    api.get('/analytics/sales-by-day?days=30').then(r => setSalesData(r.data)).catch(() => {})
    api.get('/analytics/top-products?limit=5').then(r => setTopProducts(r.data)).catch(() => {})
    api.get('/analytics/sales-by-category').then(r => setCatData(r.data)).catch(() => {})
  }, [])

  if (!summary) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" /></div>

  const totalCatRevenue = catData.reduce((s, c) => s + c.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₱${Number(summary.total_revenue).toLocaleString()}`} icon={DollarSign} color="blush" sub="All time" />
        <StatCard label="Total Orders" value={summary.total_orders.toLocaleString()} icon={ShoppingCart} color="purple" sub={`${summary.pending_orders} pending`} />
        <StatCard label="Products" value={summary.total_products.toLocaleString()} icon={Package} color="amber" sub="Active listings" />
        <StatCard label="Customers" value={summary.total_users.toLocaleString()} icon={Users} color="teal" sub="Registered users" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#FFF2DB] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-rose-900">Revenue — Last 30 Days</h3>
          <span className="text-xs text-rose-400">Daily</span>
        </div>
        <MiniBarChart data={salesData} valueKey="revenue" labelKey="day" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-[#FFF2DB] rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-semibold text-rose-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-rose-300">{i + 1}</span>
                <img src={p.image_url || ''} alt="" className="w-9 h-9 object-cover rounded-xl bg-blush-50"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=60' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rose-900 truncate">{p.name}</p>
                  <p className="text-xs text-rose-400">{p.units_sold} sold</p>
                </div>
                <p className="text-sm font-semibold text-rose-900">₱{Number(p.revenue).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#FFF2DB] rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-semibold text-rose-900 mb-4">Sales by Category</h3>
          <div className="space-y-3">
            {catData.slice(0, 6).map(c => {
              const pct = totalCatRevenue > 0 ? (c.revenue / totalCatRevenue) * 100 : 0
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-rose-700 truncate">{c.category}</span>
                    <span className="font-medium text-rose-900 ml-2">₱{Number(c.revenue).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#FFF2DB] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blush-400 to-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sales Tab ──────────────────────────────────────────────────────────────────
function SalesTab() {
  const [salesData, setSalesData] = useState([])
  const [days, setDays] = useState(30)

  useEffect(() => {
    api.get(`/analytics/sales-by-day?days=${days}`).then(r => setSalesData(r.data)).catch(() => {})
  }, [days])

  const totalRev = salesData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0)
  const avgOrder = totalOrders > 0 ? totalRev / totalOrders : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-rose-900">Sales Analytics</h2>
        <select value={days} onChange={e => setDays(Number(e.target.value))}
          className="border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-900 outline-none">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={`₱${Number(totalRev).toLocaleString()}`} icon={DollarSign} color="blush" />
        <StatCard label="Total Orders" value={totalOrders.toLocaleString()} icon={ShoppingCart} color="purple" />
        <StatCard label="Avg Order Value" value={`₱${Math.round(avgOrder).toLocaleString()}`} icon={TrendingUp} color="amber" />
      </div>

      <div className="bg-[#FFF2DB] rounded-2xl p-6 shadow-sm">
        <h3 className="font-display font-semibold text-rose-900 mb-4">Daily Revenue</h3>
        <MiniBarChart data={salesData} valueKey="revenue" labelKey="day" />
      </div>

      <div className="bg-[#FFF2DB] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF2DB] text-rose-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-right px-4 py-3 font-medium">Orders</th>
              <th className="text-right px-4 py-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {[...salesData].reverse().map((row, i) => (
              <tr key={i} className="border-t border-rose-50 hover:bg-blush-50/30 transition-colors">
                <td className="px-4 py-3 text-rose-800">{row.day}</td>
                <td className="px-4 py-3 text-right text-rose-700">{row.orders}</td>
                <td className="px-4 py-3 text-right font-medium text-rose-900">₱{Number(row.revenue).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Products Tab ───────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', compare_price: '',
    stock: '', category_id: '', brand: '', image_url: '', is_featured: false, sku: ''
  })
  const [saving, setSaving] = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    api.get(`/products?page=${page}&limit=10`).then(r => {
      setProducts(r.data.products || [])
      setTotal(r.data.total || 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchProducts() }, [page])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/products', {
        ...form,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock),
        category_id: parseInt(form.category_id),
      })
      toast.success('Product created!')
      setShowForm(false)
      setForm({ name: '', slug: '', description: '', price: '', compare_price: '', stock: '', category_id: '', brand: '', image_url: '', is_featured: false, sku: '' })
      fetchProducts()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (product) => {
    try {
      await api.put(`/products/${product.id}`, { is_active: !product.is_active })
      toast.success(product.is_active ? 'Product deactivated' : 'Product activated')
      fetchProducts()
    } catch {
      toast.error('Failed to update product')
    }
  }

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-rose-900">Products ({total})</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="gradient-rose text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#FFF2DB] rounded-2xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-rose-900 mb-4">New Product</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Product Name', required: true, span: 2 },
              { key: 'brand', label: 'Brand' },
              { key: 'sku', label: 'SKU' },
              { key: 'price', label: 'Price (₱)', type: 'number', required: true },
              { key: 'compare_price', label: 'Compare Price (₱)', type: 'number' },
              { key: 'stock', label: 'Stock', type: 'number', required: true },
              { key: 'image_url', label: 'Image URL', span: 2 },
            ].map(f => (
              <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-rose-700 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={e => {
                    const val = e.target.value
                    setForm(prev => ({
                      ...prev,
                      [f.key]: val,
                      ...(f.key === 'name' ? { slug: autoSlug(val) } : {})
                    }))
                  }}
                  required={f.required}
                  className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-900 outline-none focus:border-blush-400"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-rose-700 mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-900 outline-none focus:border-blush-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-rose-700 mb-1">Category</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-900 outline-none focus:border-blush-400">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" id="featured" checked={form.is_featured}
                onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                className="accent-blush-500 w-4 h-4" />
              <label htmlFor="featured" className="text-sm text-rose-700">Featured Product</label>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-rose-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm text-rose-900 outline-none focus:border-blush-400 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving}
              className="gradient-rose text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-rose-200 text-rose-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#FFF2DB]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-[#FFF2DB] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#FFF2DB] text-rose-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Brand</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Stock</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-rose-50 hover:bg-blush-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url || ''} alt="" className="w-10 h-10 object-cover rounded-xl bg-blush-50 flex-shrink-0"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=60' }} />
                      <div>
                        <p className="font-medium text-rose-900 truncate max-w-[160px]">{p.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-champagne-400 text-champagne-400" />
                          <span className="text-xs text-rose-400">{p.rating_avg?.toFixed(1)}</span>
                          {p.is_featured && <span className="text-xs bg-blush-100 text-blush-600 px-1.5 rounded-full">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-rose-600 hidden md:table-cell">{p.brand || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-rose-900">₱{Number(p.price).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right hidden md:table-cell ${p.stock < 10 ? 'text-red-500 font-medium' : 'text-rose-700'}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(p)}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-600'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-rose-50">
          <p className="text-xs text-rose-400">{total} total products</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-xs border border-rose-200 rounded-lg disabled:opacity-40 hover:bg-[#FFF2DB]">Prev</button>
            <button disabled={products.length < 10} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-xs border border-rose-200 rounded-lg disabled:opacity-40 hover:bg-[#FFF2DB]">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────
const STATUS_OPTS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders/all').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      toast.success('Order status updated')
      fetchOrders()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-rose-900">Orders ({orders.length})</h2>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-rose-600 hover:text-blush-600 border border-rose-200 px-3 py-2 rounded-xl">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-[#FFF2DB] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#FFF2DB] text-rose-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t border-rose-50 hover:bg-blush-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-rose-900">{order.order_number}</p>
                    <p className="text-xs text-rose-400">{order.items?.length} items · {order.payment_method}</p>
                  </td>
                  <td className="px-4 py-3 text-rose-600 hidden lg:table-cell">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-900">
                    ₱{Number(order.total_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id || order.status === 'cancelled' || order.status === 'delivered'}
                      className="text-xs border border-rose-200 rounded-lg px-2 py-1 outline-none disabled:opacity-40">
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Customers Tab ──────────────────────────────────────────────────────────────
function CustomersTab() {
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/analytics/customer-stats').then(r => setCustomers(r.data)).catch(() => {})
    api.get('/users').then(r => setUsers(r.data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-rose-900">Customers</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} color="teal" />
        <StatCard label="Active Customers" value={customers.filter(c => c.order_count > 0).length} icon={ShoppingCart} color="blush" />
      </div>

      <div className="bg-[#FFF2DB] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-rose-50">
          <h3 className="font-display font-semibold text-rose-900 text-sm">Top Customers by Revenue</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#FFF2DB] text-rose-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-right px-4 py-3 font-medium">Orders</th>
              <th className="text-right px-4 py-3 font-medium">Lifetime Value</th>
            </tr>
          </thead>
          <tbody>
            {customers.slice(0, 15).map(c => (
              <tr key={c.id} className="border-t border-rose-50 hover:bg-blush-50/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-rose-900">{c.username}</p>
                  <p className="text-xs text-rose-400">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-right text-rose-700">{c.order_count}</td>
                <td className="px-4 py-3 text-right font-semibold text-rose-900">
                  ₱{Number(c.lifetime_value).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Reporting Tab (ETL data) ───────────────────────────────────────────────────
function ReportingTab() {
  const [salesOverview, setSalesOverview] = useState([])
  const [productPerf, setProductPerf] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/reporting/sales-overview').catch(() => ({ data: [] })),
      api.get('/analytics/reporting/product-performance').catch(() => ({ data: [] })),
    ]).then(([s, p]) => {
      setSalesOverview(s.data)
      setProductPerf(p.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" /></div>

  const noData = salesOverview.length === 0 && productPerf.length === 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-rose-900">ETL Reporting Database</h2>
        <span className="text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded-full">Populated by cron ETL</span>
      </div>

      {noData ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">No reporting data yet</p>
            <p className="text-sm text-amber-600 mt-1">
              The reporting database is populated by the ETL cron job. Run <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">python3 etl.py</code> manually to seed it, or wait for the hourly cron to execute.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Sales from Reporting DB */}
          {salesOverview.length > 0 && (
            <div className="bg-[#FFF2DB] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-rose-50">
                <h3 className="font-display font-semibold text-rose-900 text-sm">Daily Sales (Reporting DB)</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#FFF2DB] text-rose-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Orders</th>
                    <th className="text-right px-4 py-3 font-medium">Revenue</th>
                    <th className="text-right px-4 py-3 font-medium">Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOverview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-rose-50 hover:bg-blush-50/30 transition-colors">
                      <td className="px-4 py-3 text-rose-800">{row.date}</td>
                      <td className="px-4 py-3 text-right text-rose-700">{row.orders}</td>
                      <td className="px-4 py-3 text-right font-medium text-rose-900">₱{Number(row.revenue).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-rose-600">₱{Number(row.avg_order).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Product Performance from Reporting DB */}
          {productPerf.length > 0 && (
            <div className="bg-[#FFF2DB] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-rose-50">
                <h3 className="font-display font-semibold text-rose-900 text-sm">Product Performance (Reporting DB)</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#FFF2DB] text-rose-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Product</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                    <th className="text-right px-4 py-3 font-medium">Units Sold</th>
                    <th className="text-right px-4 py-3 font-medium">Revenue</th>
                    <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerf.map((p, i) => (
                    <tr key={i} className="border-t border-rose-50 hover:bg-blush-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-rose-900 truncate max-w-[150px]">{p.product_name}</p>
                        <p className="text-xs text-rose-400">{p.brand}</p>
                      </td>
                      <td className="px-4 py-3 text-rose-600 hidden md:table-cell">{p.category}</td>
                      <td className="px-4 py-3 text-right text-rose-700">{p.units_sold}</td>
                      <td className="px-4 py-3 text-right font-medium text-rose-900">₱{Number(p.total_revenue).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-rose-600 hidden md:table-cell">
                        <span className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 fill-champagne-400 text-champagne-400" />
                          {p.avg_rating?.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main Admin Component ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [active, setActive] = useState('overview')
  const { logout } = useAuth()

  const tabs = {
    overview:  <OverviewTab />,
    sales:     <SalesTab />,
    products:  <ProductsTab />,
    orders:    <OrdersTab />,
    customers: <CustomersTab />,
    reporting: <ReportingTab />,
  }

  return (
    <div className="flex min-h-screen bg-[#FFF2DB]/50">
      <Sidebar active={active} setActive={setActive} logout={logout} />
      <main className="ml-56 flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {tabs[active]}
        </div>
      </main>
    </div>
  )
}

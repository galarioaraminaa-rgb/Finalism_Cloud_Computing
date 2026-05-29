import { useState } from 'react'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/users/me', form)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl font-bold text-rose-900 mb-8">My Account</h1>

        {/* Profile card */}
        <div className="bg-[#FFF2DB] rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 gradient-rose rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-rose-900 text-lg">{user?.full_name || user?.username}</p>
              <p className="text-sm text-rose-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
              {user?.is_admin && (
                <span className="text-xs bg-blush-100 text-blush-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                  Admin
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-rose-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors bg-[#FFF2DB]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rose-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors bg-[#FFF2DB]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rose-700 mb-1.5">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Default Address</span>
              </label>
              <textarea
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="Street, Barangay, City, Province, ZIP"
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-rose-900 outline-none focus:border-blush-400 transition-colors bg-[#FFF2DB]/30 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="gradient-rose text-white px-8 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account info */}
        <div className="bg-[#FFF2DB] rounded-3xl p-6 text-sm text-rose-600">
          <p className="font-medium text-rose-800 mb-2">Account Details</p>
          <p>Username: <span className="font-medium text-rose-900">@{user?.username}</span></p>
          <p className="mt-1">Member since: <span className="font-medium text-rose-900">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long' }) : '—'}
          </span></p>
        </div>
      </div>
    </div>
  )
}

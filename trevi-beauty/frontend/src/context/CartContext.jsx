import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart]   = useState({ items: [], total: 0 })
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  const fetchCart = async () => {
    if (!user) return
    try {
      const { data } = await api.get('/cart')
      setCart(data)
      setCount(data.items.reduce((s, i) => s + i.quantity, 0))
    } catch {}
  }

  useEffect(() => { fetchCart() }, [user])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login first'); return }
    try {
      await api.post('/cart/items', { product_id: productId, quantity })
      await fetchCart()
      toast.success('Added to cart!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add')
    }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      await api.put(`/cart/items/${itemId}?quantity=${quantity}`)
      await fetchCart()
    } catch {}
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`)
      await fetchCart()
      toast.success('Removed from cart')
    } catch {}
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      setCart({ items: [], total: 0 })
      setCount(0)
    } catch {}
  }

  return (
    <CartContext.Provider value={{ cart, count, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

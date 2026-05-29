import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('glamora_user')
    const token  = localStorage.getItem('glamora_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const form = new FormData()
    form.append('username', email)
    form.append('password', password)
    const { data } = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    localStorage.setItem('glamora_token', data.access_token)
    localStorage.setItem('glamora_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    setUser(data.user)
    return data.user
  }

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    return data
  }

  const logout = () => {
    localStorage.removeItem('glamora_token')
    localStorage.removeItem('glamora_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

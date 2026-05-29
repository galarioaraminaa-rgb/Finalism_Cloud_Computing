import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

const token = localStorage.getItem('glamora_token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default api

import axios from 'axios'
import { API_URL } from './config'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error

    if (response && response.status === 401 && !config.url?.includes('/login')) {
      localStorage.removeItem('token')
      sessionStorage.setItem('auth_expired', '1')
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    return Promise.reject(error)
  }
)

export default api

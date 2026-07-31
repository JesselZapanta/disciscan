import api from './api'

export function login(email, password) {
  return api.post('/login', { email, password })
}

export function logout() {
  return api.post('/logout')
}

export function getMe() {
  return api.get('/me')
}

export function updateProfile(data) {
  return api.post('/profile', data)
}

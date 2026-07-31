import api from '../api'

export async function listUsers(params = {}) {
  const res = await api.get('/admin/users', { params })
  return res.data
}

export async function createUser(payload) {
  const res = await api.post('/admin/users', payload)
  return res.data
}

export async function updateUser(id, payload) {
  const res = await api.post(`/admin/users/${id}`, payload)
  return res.data
}

export async function deleteUser(id) {
  const res = await api.delete(`/admin/users/${id}`)
  return res.data
}

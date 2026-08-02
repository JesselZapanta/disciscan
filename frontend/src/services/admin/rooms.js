import api from '../api'

export async function listRooms(params = {}) {
  const res = await api.get('/admin/rooms', { params })
  return res.data
}

export async function createRoom(payload) {
  const res = await api.post('/admin/rooms', payload)
  return res.data
}

export async function updateRoom(id, payload) {
  const res = await api.post(`/admin/rooms/${id}`, payload)
  return res.data
}

export async function deleteRoom(id) {
  const res = await api.delete(`/admin/rooms/${id}`)
  return res.data
}
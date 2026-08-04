import api from '../api'

export async function listRooms(params = {}) {
  const res = await api.get('/guard/rooms', { params })
  return res.data
}
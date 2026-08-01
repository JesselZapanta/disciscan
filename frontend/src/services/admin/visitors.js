import api from '../api'

export async function listVisitors(params = {}) {
  const res = await api.get('/admin/visitor-registrations', { params })
  return res.data
}

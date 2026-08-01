import api from './api'

export async function registerVisitor(payload) {
  const res = await api.post('/visitor-registrations', payload)
  return res.data.data
}

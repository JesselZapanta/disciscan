import api from '../api'

export async function listCompliances(params = {}) {
  const res = await api.get('/guard/compliances', { params })
  return res.data
}

export async function getCompliance(id) {
  const res = await api.get(`/guard/compliances/${id}`)
  return res.data.data
}

export async function createCompliance(payload) {
  const res = await api.post('/guard/compliances', payload)
  return res.data
}

export async function updateCompliance(id, payload) {
  const res = await api.post(`/guard/compliances/${id}`, payload)
  return res.data
}

export async function deleteCompliance(id) {
  const res = await api.delete(`/guard/compliances/${id}`)
  return res.data
}
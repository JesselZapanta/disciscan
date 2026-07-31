import api from '../api'

export async function listViolationTypes(params = {}) {
  const res = await api.get('/admin/violation-types', { params })
  return res.data
}

export async function createViolationType(payload) {
  const res = await api.post('/admin/violation-types', payload)
  return res.data
}

export async function updateViolationType(id, payload) {
  const res = await api.post(`/admin/violation-types/${id}`, payload)
  return res.data
}

export async function deleteViolationType(id) {
  const res = await api.delete(`/admin/violation-types/${id}`)
  return res.data
}

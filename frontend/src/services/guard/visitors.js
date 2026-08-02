import api from '../api'

export async function listVisitors(params = {}) {
  const res = await api.get('/guard/visitors', { params })
  return res.data
}

export async function lookupVisitor(recordNo) {
  const res = await api.get(`/guard/visitors/lookup/${encodeURIComponent(recordNo)}`)
  return res.data.data
}

export async function checkInVisitor(id) {
  const res = await api.post(`/guard/visitors/${id}/check-in`)
  return res.data.data
}

export async function checkOutVisitor(id) {
  const res = await api.post(`/guard/visitors/${id}/check-out`)
  return res.data.data
}

export async function updateVisitor(id, payload) {
  const res = await api.put(`/guard/visitors/${id}`, payload)
  return res.data.data
}

import api from '../api'

export async function listIssues(params = {}) {
  const res = await api.get('/admin/issues', { params })
  return res.data
}

export async function createIssue(payload) {
  const res = await api.post('/admin/issues', payload)
  return res.data
}

export async function updateIssue(id, payload) {
  const res = await api.post(`/admin/issues/${id}`, payload)
  return res.data
}

export async function deleteIssue(id) {
  const res = await api.delete(`/admin/issues/${id}`)
  return res.data
}
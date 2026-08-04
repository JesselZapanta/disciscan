import api from '../api'

export async function listIssues(params = {}) {
  const res = await api.get('/guard/issues', { params })
  return res.data
}
import api from '../api'

export async function getReport(type, params = {}) {
  const res = await api.get(`/admin/reports/${type}`, { params })
  return res.data
}

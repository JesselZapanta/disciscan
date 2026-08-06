import api from '../api'

export async function getDashboard(days = 15) {
  const res = await api.get('/admin/dashboard', { params: { days } })
  return res.data
}

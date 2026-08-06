import api from '../api'

export async function getDashboard(days = 15) {
  const res = await api.get('/guard/dashboard', { params: { days } })
  return res.data
}

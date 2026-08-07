import api from '../api'

export async function listAcademicYears() {
  const res = await api.get('/guard/academic-years')
  return res.data
}

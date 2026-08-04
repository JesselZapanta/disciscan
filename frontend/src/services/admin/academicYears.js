import api from '../api'

export async function listAcademicYears(params = {}) {
  const res = await api.get('/admin/academic-years', { params })
  return res.data
}

export async function createAcademicYear(payload) {
  const res = await api.post('/admin/academic-years', payload)
  return res.data
}

export async function updateAcademicYear(id, payload) {
  const res = await api.post(`/admin/academic-years/${id}`, payload)
  return res.data
}

export async function deleteAcademicYear(id) {
  const res = await api.delete(`/admin/academic-years/${id}`)
  return res.data
}

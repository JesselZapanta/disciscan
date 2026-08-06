import api from '../api'

export async function listStudentViolations(params = {}) {
  const res = await api.get('/admin/student-violations', { params })
  return res.data
}

export async function getStudentViolations(id, params = {}) {
  const res = await api.get(`/admin/student-violations/${id}`, { params })
  return res.data
}

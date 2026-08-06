import api from '../api'

export async function listStudentLogs(params = {}) {
  const res = await api.get('/admin/student-logs', { params })
  return res.data
}

export async function getStudentLogs(id, params = {}) {
  const res = await api.get(`/admin/student-logs/${id}`, { params })
  return res.data
}

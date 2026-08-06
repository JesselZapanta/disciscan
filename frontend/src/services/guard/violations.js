import api from '../api'

export async function listViolationTypes() {
  const res = await api.get('/guard/violation-types')
  return res.data.data
}

export async function createStudentViolation(studentId, payload) {
  const res = await api.post(`/guard/students/${studentId}/violations`, payload)
  return res.data.data
}

import api from '../api'

export async function listStudentViolations(params = {}) {
  const res = await api.get('/admin/student-violations', { params })
  return res.data
}

export async function getStudentViolations(id, params = {}) {
  const res = await api.get(`/admin/student-violations/${id}`, { params })
  return res.data
}

export async function resolveViolation(id) {
  const res = await api.post(`/admin/student-violations/${id}/resolve`)
  return res.data
}

export async function resolveAllViolations(studentId) {
  const res = await api.post(`/admin/student-violations/${studentId}/resolve-all`)
  return res.data
}

export async function unresolveAllViolations(studentId, violationIds) {
  const res = await api.post(`/admin/student-violations/${studentId}/unresolve-all`, {
    violation_ids: violationIds,
  })
  return res.data
}

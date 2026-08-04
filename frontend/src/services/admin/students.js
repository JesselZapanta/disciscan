import api from '../api'

export async function listStudents(params = {}) {
  const res = await api.get('/admin/students', { params })
  return res.data
}

export async function createStudent(payload) {
  const res = await api.post('/admin/students', payload)
  return res.data
}

export async function updateStudent(id, payload) {
  const res = await api.post(`/admin/students/${id}`, payload)
  return res.data
}

export async function deleteStudent(id) {
  const res = await api.delete(`/admin/students/${id}`)
  return res.data
}

export async function importStudents(file) {
  const payload = new FormData()
  payload.append('file', file)
  const res = await api.post('/admin/students/import', payload)
  return res.data
}

export async function downloadStudentTemplate() {
  const res = await api.get('/admin/students/import-template', { responseType: 'blob' })
  return res.data
}

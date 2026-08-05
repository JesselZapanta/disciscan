import api from '../api'

export async function lookupStudent(idNumber) {
  const res = await api.get(`/guard/students/lookup/${encodeURIComponent(idNumber)}`)
  return res.data.data
}

export async function checkInStudent(id) {
  const res = await api.post(`/guard/students/${id}/check-in`)
  return res.data.data
}

export async function checkOutStudent(id) {
  const res = await api.post(`/guard/students/${id}/check-out`)
  return res.data.data
}

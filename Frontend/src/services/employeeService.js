import api from './api'

export async function getEmployees(search, page = 1) {
  const resp = await api.get('/employees', { params: { search, page, limit: 10 } })
  return resp.data
}

export async function getEmployee(id) {
  const resp = await api.get(`/employees/${id}`)
  return resp.data
}

export async function createEmployee(payload) {
  const resp = await api.post('/employees', payload)
  return resp.data
}

export async function updateEmployee(id, payload) {
  const resp = await api.put(`/employees/${id}`, payload)
  return resp.data
}

export async function deleteEmployee(id) {
  const resp = await api.delete(`/employees/${id}`)
  return resp.data
}

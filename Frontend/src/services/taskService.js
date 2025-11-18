import api from './api'

export async function getTasks(status, assignee, page = 1) {
  const resp = await api.get('/tasks', { params: { status, assignee, page, limit: 10 } })
  return resp.data
}

export async function getTask(id) {
  const resp = await api.get(`/tasks/${id}`)
  return resp.data
}

export async function createTask(payload) {
  const resp = await api.post('/tasks', payload)
  return resp.data
}

export async function updateTask(id, payload) {
  const resp = await api.put(`/tasks/${id}`, payload)
  return resp.data
}

export async function deleteTask(id) {
  const resp = await api.delete(`/tasks/${id}`)
  return resp.data
}

export async function addComment(id, text) {
  const resp = await api.post(`/tasks/${id}/comment`, { text })
  return resp.data
}

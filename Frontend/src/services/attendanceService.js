import api from './api'

export async function getMyAttendance() {
  const resp = await api.get('/attendance/me')
  return resp.data
}

export async function punch(type) {
  const resp = await api.post('/attendance/punch', { type })
  return resp.data
}

export async function requestLeave(payload){
  const resp = await api.post('/attendance/leave', payload)
  return resp.data
}

export async function setStatus(payload) {
  const resp = await api.post('/attendance/status', payload)
  return resp.data
}

export default { getMyAttendance, punch, requestLeave, setStatus }

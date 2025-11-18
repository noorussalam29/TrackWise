import api from './api'

export async function createDailyReport(payload) {
  const resp = await api.post('/reports/daily', payload)
  return resp.data
}

export async function getReports(userId, from, to) {
  const resp = await api.get(`/reports/${userId}`, { params: { from, to } })
  return resp.data
}

export async function getAdminOverview() {
  const resp = await api.get('/admin/overview')
  return resp.data
}

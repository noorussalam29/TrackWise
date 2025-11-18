// small helpers to format durations (seconds or decimal hours) into human readable hr/min
export function decimalHoursToHrsMins(decimal) {
  if (decimal === undefined || decimal === null || Number.isNaN(decimal)) return '0h 00m'
  const totalMinutes = Math.round(Number(decimal) * 60)
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${hrs}h ${String(mins).padStart(2, '0')}m`
}

export function msToHrsMins(ms) {
  if (!ms && ms !== 0) return '0h 00m'
  const totalMinutes = Math.round(ms / 60000)
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${hrs}h ${String(mins).padStart(2, '0')}m`
}

export default { decimalHoursToHrsMins, msToHrsMins }

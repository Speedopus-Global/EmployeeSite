const toMilliseconds = (value) => {
  const milliseconds = new Date(value).getTime()
  return Number.isFinite(milliseconds) ? milliseconds : null
}

const toSeconds = (milliseconds) => Math.max(0, Math.round(milliseconds / 1000))

export function getAttendanceDurations(record, now = Date.now()) {
  if (!record?.loginTime) {
    return {
      workSeconds: Math.max(0, Math.round(record?.workingSeconds ?? (record?.workingHours || 0) * 3600)),
      breakSeconds: Math.max(0, Math.round(record?.totalBreakSeconds ?? (record?.totalBreakHours || 0) * 3600)),
    }
  }

  const loginTime = toMilliseconds(record.loginTime)
  const endTime = record.logoutTime ? toMilliseconds(record.logoutTime) : now

  if (loginTime === null || endTime === null) {
    return {
      workSeconds: Math.max(0, Math.round(record.workingSeconds ?? (record.workingHours || 0) * 3600)),
      breakSeconds: Math.max(0, Math.round(record.totalBreakSeconds ?? (record.totalBreakHours || 0) * 3600)),
    }
  }

  let breakMilliseconds = 0

  for (const breakPeriod of record.breaks || []) {
    const startTime = toMilliseconds(breakPeriod.startTime)
    const breakEndTime = breakPeriod.endTime
      ? toMilliseconds(breakPeriod.endTime)
      : record.isPaused && !record.logoutTime
        ? now
        : startTime

    if (startTime !== null && breakEndTime !== null) {
      breakMilliseconds += Math.max(0, breakEndTime - startTime)
    }
  }

  const totalElapsedMilliseconds = Math.max(0, endTime - loginTime)
  const breakSeconds = toSeconds(breakMilliseconds)

  return {
    workSeconds: Math.max(0, toSeconds(totalElapsedMilliseconds) - breakSeconds),
    breakSeconds,
  }
}

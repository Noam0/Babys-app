import { differenceInDays, differenceInHours, format, subHours } from 'date-fns'

export const calculateAge = (birthDatetime) => {
  const now = new Date()
  const birth = new Date(birthDatetime)
  const days = differenceInDays(now, birth)
  const hours = differenceInHours(now, birth) % 24

  return { days, hours }
}

export const formatAgeString = (birthDatetime) => {
  const { days, hours } = calculateAge(birthDatetime)
  return `בן ${days} ימים ו-${hours} שעות`
}

export const formatBirthString = (birthDatetime) => {
  const birth = new Date(birthDatetime)
  return `נולד ב-${format(birth, 'dd.MM.yyyy')} בשעה ${format(birth, 'HH:mm')}`
}

// Value format expected by <input type="datetime-local">
export const toDatetimeLocalValue = (date) => format(new Date(date), "yyyy-MM-dd'T'HH:mm")

export const formatEventTime = (date) => {
  return format(new Date(date), 'HH:mm')
}

export const formatFullDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
}

export const isWithinLast24Hours = (date) => {
  const now = new Date()
  const twentyFourHoursAgo = subHours(now, 24)
  const eventDate = new Date(date)
  return eventDate >= twentyFourHoursAgo && eventDate <= now
}

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export const toLocalDateKey = (date) => format(new Date(date), 'yyyy-MM-dd')

export const formatDayHeading = (date) => {
  const day = new Date(date)
  const today = new Date()
  const yesterday = subHours(today, 24)
  const datePart = format(day, 'dd.MM.yyyy')
  const weekday = HEBREW_DAYS[day.getDay()]

  if (toLocalDateKey(day) === toLocalDateKey(today)) {
    return `היום, יום ${weekday} ${datePart}`
  }
  if (toLocalDateKey(day) === toLocalDateKey(yesterday)) {
    return `אתמול, יום ${weekday} ${datePart}`
  }
  return `יום ${weekday}, ${datePart}`
}

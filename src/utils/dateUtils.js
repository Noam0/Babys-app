import { formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes, format, subHours } from 'date-fns'

// Gafen's birthdate
export const BIRTHDATE = new Date('2026-09-09T13:35:00')

export const calculateAge = () => {
  const now = new Date()
  const days = differenceInDays(now, BIRTHDATE)
  const hours = differenceInHours(now, BIRTHDATE) % 24
  
  return { days, hours }
}

export const formatAgeString = () => {
  const { days, hours } = calculateAge()
  return `בן ${days} ימים ו-${hours} שעות`
}

export const formatEventTime = (date) => {
  // Format as HH:MM (24-hour format)
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

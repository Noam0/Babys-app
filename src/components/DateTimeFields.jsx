import { toDateInputValue, toTimeInputValue } from '../utils/dateUtils'

const fieldClass =
  'w-full min-w-0 max-w-full px-3 py-2 border-2 border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-primary-500'

export const DateField = ({ value, onChange, className = '' }) => (
  <div className={`min-w-0 overflow-hidden ${className}`}>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir="ltr"
      className={fieldClass}
    />
  </div>
)

export const TimeField = ({ value, onChange, className = '' }) => (
  <div className={`min-w-0 overflow-hidden ${className}`}>
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir="ltr"
      className={fieldClass}
    />
  </div>
)

export const DateTimeFields = ({ value, onChange, label = 'תאריך ושעה' }) => {
  const dateValue = value ? toDateInputValue(value) : ''
  const timeValue = value ? toTimeInputValue(value) : ''

  const emit = (nextDate, nextTime) => {
    if (!nextDate) return
    onChange(new Date(`${nextDate}T${nextTime || '00:00'}`))
  }

  return (
    <div className="min-w-0 w-full">
      {label && <p className="text-xs font-medium opacity-80 mb-1">{label}</p>}
      <div className="grid grid-cols-2 gap-2 min-w-0">
        <DateField value={dateValue} onChange={(next) => emit(next, timeValue)} />
        <TimeField value={timeValue} onChange={(next) => emit(dateValue, next)} />
      </div>
    </div>
  )
}

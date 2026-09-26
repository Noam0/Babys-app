const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

const currentYear = new Date().getFullYear()
const YEARS = range(currentYear - 3, currentYear + 1)
const DAYS = range(1, 31)
const HOURS = range(0, 23)
const MINUTES = range(0, 59)

const pad = (value) => String(value).padStart(2, '0')

const selectClass =
  'w-full min-w-0 max-w-full px-2 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 text-sm focus:outline-none focus:border-primary-500'

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={selectClass}
  >
    {children}
  </select>
)

const clampDay = (year, month, day) =>
  Math.min(day, new Date(year, month + 1, 0).getDate())

const toDateString = (year, month, day) =>
  `${year}-${pad(month + 1)}-${pad(clampDay(year, month, day))}`

export const DateField = ({ value, onChange, className = '' }) => {
  const parsed = value ? new Date(`${value}T00:00`) : new Date()
  const year = parsed.getFullYear()
  const month = parsed.getMonth()
  const day = parsed.getDate()

  const emit = (nextYear, nextMonth, nextDay) => {
    onChange(toDateString(nextYear, nextMonth, nextDay))
  }

  return (
    <div className={`grid grid-cols-3 gap-2 min-w-0 ${className}`}>
      <Select value={day} onChange={(next) => emit(year, month, Number(next))}>
        {DAYS.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </Select>
      <Select value={month} onChange={(next) => emit(year, Number(next), day)}>
        {MONTHS.map((label, index) => (
          <option key={label} value={index}>{label}</option>
        ))}
      </Select>
      <Select value={year} onChange={(next) => emit(Number(next), month, day)}>
        {YEARS.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </Select>
    </div>
  )
}

export const DateTimeFields = ({ value, onChange, label = 'תאריך ושעה' }) => {
  const parsed = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date()
  const year = parsed.getFullYear()
  const month = parsed.getMonth()
  const day = parsed.getDate()
  const hour = parsed.getHours()
  const minute = parsed.getMinutes()

  const emit = (next) => {
    const safeDay = clampDay(next.year, next.month, next.day)
    onChange(new Date(next.year, next.month, safeDay, next.hour, next.minute))
  }

  const parts = { year, month, day, hour, minute }

  return (
    <div className="min-w-0 w-full overflow-hidden">
      {label && <p className="text-xs font-medium opacity-80 mb-1">{label}</p>}
      <div className="grid grid-cols-3 gap-2 min-w-0 mb-2">
        <Select value={day} onChange={(next) => emit({ ...parts, day: Number(next) })}>
          {DAYS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
        <Select value={month} onChange={(next) => emit({ ...parts, month: Number(next) })}>
          {MONTHS.map((label, index) => (
            <option key={label} value={index}>{label}</option>
          ))}
        </Select>
        <Select value={year} onChange={(next) => emit({ ...parts, year: Number(next) })}>
          {YEARS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2 min-w-0">
        <Select value={hour} onChange={(next) => emit({ ...parts, hour: Number(next) })}>
          {HOURS.map((item) => (
            <option key={item} value={item}>{pad(item)}</option>
          ))}
        </Select>
        <Select value={minute} onChange={(next) => emit({ ...parts, minute: Number(next) })}>
          {MINUTES.map((item) => (
            <option key={item} value={item}>{pad(item)}</option>
          ))}
        </Select>
      </div>
    </div>
  )
}

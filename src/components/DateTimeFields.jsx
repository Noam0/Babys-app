import { useState } from 'react'
import { Clock } from 'lucide-react'
import { formatFullDate } from '../utils/dateUtils'

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

const currentYear = new Date().getFullYear()
const YEARS = range(currentYear - 3, currentYear + 1)
const DAYS = range(1, 31)
const HOURS = range(0, 23)
const MINUTES = range(0, 59)

const pad = (value) => String(value).padStart(2, '0')

const selectClass =
  'w-full min-w-0 max-w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:border-primary-500'

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
    <div className={`grid grid-cols-3 gap-1.5 min-w-0 ${className}`}>
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
      <div className="grid grid-cols-3 gap-1.5 min-w-0 mb-1.5">
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
      <div className="grid grid-cols-2 gap-1.5 min-w-0">
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

// A single button showing the current date/time; tapping it opens a small
// popup with the DateTimeFields grid, instead of showing all 5 selects inline.
export const DateTimeButton = ({ value, onChange, label = 'תאריך ושעה' }) => {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)

  const openPicker = () => {
    setDraft(value)
    setOpen(true)
  }

  const confirm = () => {
    onChange(draft)
    setOpen(false)
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={openPicker}
        className="w-full min-w-0 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        <Clock size={14} />
        <span className="truncate">{formatFullDate(value)}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-4"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-gray-800 mb-3 text-sm">{label}</h4>
            <DateTimeFields value={draft} onChange={setDraft} label="" />
            <div className="flex gap-2 mt-3">
              <button
                onClick={confirm}
                className="flex-1 py-2 rounded-lg font-bold text-sm bg-primary-500 text-white active:scale-95 transition-all"
              >
                אישור
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg font-bold text-sm bg-gray-100 text-gray-700 active:scale-95 transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

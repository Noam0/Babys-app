import { useState } from 'react'
import { Filter } from 'lucide-react'
import EventItem from './EventItem'
import WeightTimeline from './WeightTimeline'
import { DateField } from './DateTimeFields'
import { formatDayHeading, toLocalDateKey } from '../utils/dateUtils'
import { EVENT_TYPE_LABELS } from '../utils/eventOptions'

const EVENT_TYPES = [
  { value: 'all', label: 'הכל' },
  ...Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))
]

const DAY_FILTERS = [
  { value: 'all', label: 'כל הימים' },
  { value: 'today', label: 'היום' },
  { value: 'yesterday', label: 'אתמול' },
  { value: 'last7', label: '7 ימים' }
]

const isSameDay = (date, offsetDays = 0) => {
  const target = new Date()
  target.setDate(target.getDate() + offsetDays)
  return toLocalDateKey(date) === toLocalDateKey(target)
}

const matchesDayFilter = (event, dayFilter, customDate) => {
  if (dayFilter === 'custom' && customDate) {
    return toLocalDateKey(event.timestamp) === customDate
  }
  if (dayFilter === 'today') return isSameDay(event.timestamp)
  if (dayFilter === 'yesterday') return isSameDay(event.timestamp, -1)
  if (dayFilter === 'last7') {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6)
    return new Date(event.timestamp) >= start
  }
  return true
}

const groupEventsByDay = (events) => {
  const groups = []
  events.forEach((event) => {
    const key = toLocalDateKey(event.timestamp)
    const last = groups[groups.length - 1]
    if (last?.key === key) {
      last.events.push(event)
    } else {
      groups.push({ key, heading: formatDayHeading(event.timestamp), events: [event] })
    }
  })
  return groups
}

const HistoryView = ({ events, latestWeightId, onUpdate, onDelete }) => {
  const [filterType, setFilterType] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')
  const [customDate, setCustomDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredEvents = events.filter((event) => {
    const typeMatch = filterType === 'all' || event.event_type === filterType
    return typeMatch && matchesDayFilter(event, dayFilter, customDate)
  })

  const groups = groupEventsByDay(filteredEvents)
  const chipClass = (active) =>
    `px-4 py-2 rounded-full font-medium transition-all text-sm ${
      active ? 'bg-primary-500 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">היסטוריה מלאה</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-xl font-medium text-sm hover:bg-primary-200 transition-colors touch-manipulation"
        >
          <Filter size={16} />
          <span>סינון</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4 space-y-4 overflow-hidden min-w-0">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">סנן לפי סוג:</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={chipClass(filterType === type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">סנן לפי יום:</p>
            <div className="flex flex-wrap gap-2">
              {DAY_FILTERS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => {
                    setDayFilter(day.value)
                    setCustomDate('')
                  }}
                  className={chipClass(dayFilter === day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <label className="block mt-3 text-sm text-gray-600 min-w-0">
              או בחרו תאריך מדויק
              <DateField
                className="mt-2"
                value={customDate}
                onChange={(value) => {
                  setCustomDate(value)
                  setDayFilter(value ? 'custom' : 'all')
                }}
              />
            </label>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 mb-3">
        סך הכל: {filteredEvents.length} אירועים
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-gray-400 text-lg">אין אירועים להצגה</p>
        </div>
      ) : filterType === 'weight' ? (
        <WeightTimeline
          events={filteredEvents}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="sticky top-0 z-10 bg-gradient-to-b from-blue-50 to-blue-50/80 backdrop-blur-sm text-xs font-bold text-primary-700 px-1 py-1.5 mb-1.5">
                {group.heading}
              </h3>
              <div className="space-y-2">
                {group.events.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    latestWeightId={latestWeightId}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    showFullDate
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryView

import { useState } from 'react'
import { Filter } from 'lucide-react'
import EventItem from './EventItem'

const HistoryView = ({ events, onUpdate, onDelete }) => {
  const [filterType, setFilterType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const eventTypes = [
    { value: 'all', label: 'הכל' },
    { value: 'breastfeed', label: 'הנקה' },
    { value: 'diaper', label: 'החתלה' },
    { value: 'sleep', label: 'שינה' },
    { value: 'tummy', label: 'זמן בטן' },
    { value: 'medication', label: 'תרופות' },
    { value: 'other', label: 'אחר' }
  ]

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.event_type === filterType)

  return (
    <div className="mb-6">
      {/* Header with Filter Toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">היסטוריה מלאה</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-medium hover:bg-primary-200 transition-colors touch-manipulation"
        >
          <Filter size={18} />
          <span>סינון</span>
        </button>
      </div>

      {/* Filter Chips */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <p className="text-sm font-medium text-gray-600 mb-3">סנן לפי סוג:</p>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm
                  ${filterType === type.value
                    ? 'bg-primary-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events Count */}
      <div className="text-sm text-gray-500 mb-3">
        סך הכל: {filteredEvents.length} אירועים
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-gray-400 text-lg">אין אירועים להצגה</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onUpdate={onUpdate}
              onDelete={onDelete}
              showFullDate
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryView

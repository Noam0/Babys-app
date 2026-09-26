import { useState } from 'react'
import { Edit2, Trash2, Check, X } from 'lucide-react'
import { formatEventTime, formatFullDate, toDatetimeLocalValue } from '../utils/dateUtils'
import { ACTION_OPTIONS, EVENT_TYPE_LABELS, getEventDetailsText, getOptionMeta } from '../utils/eventOptions'

const EventItem = ({ event, onUpdate, onDelete, showFullDate = false }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(event.details?.custom || '')
  const [editOption, setEditOption] = useState(event.details?.option || '')
  const [editTime, setEditTime] = useState(toDatetimeLocalValue(event.timestamp))

  const startEditing = () => {
    setEditValue(event.details?.custom || '')
    setEditOption(event.details?.option || '')
    setEditTime(toDatetimeLocalValue(event.timestamp))
    setIsEditing(true)
  }

  const handleSave = () => {
    const nextTimestamp = new Date(editTime)
    if (Number.isNaN(nextTimestamp.getTime())) return

    const updates = { timestamp: nextTimestamp.toISOString() }
    const options = ACTION_OPTIONS[event.event_type]

    if (event.event_type === 'other') {
      updates.details = { custom: editValue.trim() || event.details?.custom || '' }
    } else if (options && editOption) {
      updates.details = { ...event.details, option: editOption }
    }

    onUpdate(event.id, updates)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
      onDelete(event.id)
    }
  }

  const option = getOptionMeta(event.event_type, event.details?.option)
  const OptionIcon = option?.icon
  const editOptions = ACTION_OPTIONS[event.event_type]

  return (
    <div className={`${EVENT_COLORS[event.event_type]} border-r-4 rounded-2xl shadow-md p-4 transition-all hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{EVENT_TYPE_LABELS[event.event_type]}</h3>
          {!isEditing && (
            <p className="text-sm mt-1 opacity-90 flex items-center gap-2">
              {OptionIcon && <OptionIcon size={16} />}
              <span>{getEventDetailsText(event)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 mr-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors touch-manipulation"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors touch-manipulation"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="p-2 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all touch-manipulation"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all touch-manipulation"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 mt-2">
          {event.event_type === 'other' && (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-800"
              autoFocus
            />
          )}
          {editOptions && (
            <div className="flex flex-wrap gap-2">
              {editOptions.map((opt) => {
                const Icon = opt.icon
                const selected = editOption === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEditOption(opt.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                      selected ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
          <label className="block text-xs font-medium opacity-80">
            תאריך ושעה
            <input
              type="datetime-local"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full mt-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-800"
            />
          </label>
        </div>
      ) : (
        <p className="text-xs opacity-75">
          {showFullDate ? formatFullDate(event.timestamp) : `שעה ${formatEventTime(event.timestamp)}`}
        </p>
      )}
    </div>
  )
}

const EVENT_COLORS = {
  breastfeed: 'bg-breastfeed-light border-breastfeed text-breastfeed-dark',
  diaper: 'bg-diaper-light border-diaper text-diaper-dark',
  sleep: 'bg-sleep-light border-sleep text-sleep-dark',
  tummy: 'bg-tummy-light border-tummy text-tummy-dark',
  medication: 'bg-medication-light border-medication text-medication-dark',
  other: 'bg-other-light border-other text-other-dark'
}

export default EventItem

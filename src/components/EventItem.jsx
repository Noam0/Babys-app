import { useState } from 'react'
import { Edit2, Trash2, Check, X, Baby } from 'lucide-react'
import { formatEventTime, formatFullDate } from '../utils/dateUtils'
import { ACTION_OPTIONS, EVENT_TYPE_LABELS, getEventDetailsText, getOptionMeta } from '../utils/eventOptions'
import ConfirmDialog from './ConfirmDialog'
import { DateTimeFields } from './DateTimeFields'

const EventItem = ({ event, onUpdate, onDelete, showFullDate = false }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editValue, setEditValue] = useState(event.details?.custom || '')
  const [editKg, setEditKg] = useState(event.details?.kg != null ? String(event.details.kg) : '')
  const [editOption, setEditOption] = useState(event.details?.option || '')
  const [editTime, setEditTime] = useState(new Date(event.timestamp))

  const startEditing = () => {
    setEditValue(event.details?.custom || '')
    setEditKg(event.details?.kg != null ? String(event.details.kg) : '')
    setEditOption(event.details?.option || '')
    setEditTime(new Date(event.timestamp))
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editTime || Number.isNaN(editTime.getTime())) return

    const updates = { timestamp: editTime.toISOString() }
    const options = ACTION_OPTIONS[event.event_type]

    if (event.event_type === 'other') {
      updates.details = { custom: editValue.trim() || event.details?.custom || '' }
    } else if (event.event_type === 'weight') {
      const kg = parseFloat(editKg)
      if (!Number.isNaN(kg) && kg > 0) updates.details = { kg }
    } else if (options && editOption) {
      updates.details = { ...event.details, option: editOption }
    }

    onUpdate(event.id, updates)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(event.id)
    setConfirmDelete(false)
  }

  const option = getOptionMeta(event.event_type, event.details?.option)
  const OptionIcon = event.event_type === 'weight' ? Baby : option?.icon
  const editOptions = ACTION_OPTIONS[event.event_type]

  return (
    <div className={`${EVENT_COLORS[event.event_type] || EVENT_COLORS.other} border-r-4 rounded-2xl shadow-md p-4 transition-all hover:shadow-lg overflow-hidden min-w-0`}>
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
                onClick={() => setConfirmDelete(true)}
                className="p-2 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all touch-manipulation"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 mt-2 min-w-0 overflow-hidden">
          {event.event_type === 'other' && (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-w-0 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-800"
              autoFocus
            />
          )}
          {event.event_type === 'weight' && (
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={editKg}
              onChange={(e) => setEditKg(e.target.value)}
              className="w-full min-w-0 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-800"
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
          <DateTimeFields value={editTime} onChange={setEditTime} />
        </div>
      ) : (
        <p className="text-xs opacity-75">
          {showFullDate ? formatFullDate(event.timestamp) : `שעה ${formatEventTime(event.timestamp)}`}
        </p>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="מחיקת אירוע"
          message="למחוק את האירוע? הפעולה הזאת לא ניתנת לביטול."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
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
  other: 'bg-other-light border-other text-other-dark',
  weight: 'bg-primary-50 border-primary-400 text-primary-800'
}

export default EventItem

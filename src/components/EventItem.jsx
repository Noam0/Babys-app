import { useState } from 'react'
import { Edit2, Trash2, Check, X, Baby } from 'lucide-react'
import { formatEventTime, formatFullDate } from '../utils/dateUtils'
import { ACTION_OPTIONS, EVENT_TYPE_LABELS, getEventDetailsText, getOptionMeta } from '../utils/eventOptions'
import ConfirmDialog from './ConfirmDialog'
import { DateTimeButton } from './DateTimeFields'

const EventItem = ({ event, latestWeightId, onUpdate, onDelete, showFullDate = false }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editValue, setEditValue] = useState(event.details?.custom || '')
  const [editKg, setEditKg] = useState(event.details?.kg != null ? String(event.details.kg) : '')
  const [editOption, setEditOption] = useState(event.details?.option || '')
  const [editNote, setEditNote] = useState(event.details?.note || '')
  const [editTime, setEditTime] = useState(new Date(event.timestamp))

  const startEditing = () => {
    setEditValue(event.details?.custom || '')
    setEditKg(event.details?.kg != null ? String(event.details.kg) : '')
    setEditOption(event.details?.option || '')
    setEditNote(event.details?.note || '')
    setEditTime(new Date(event.timestamp))
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editTime || Number.isNaN(editTime.getTime())) return

    const updates = { timestamp: editTime.toISOString() }
    const options = ACTION_OPTIONS[event.event_type]
    const trimmedNote = editNote.trim()

    if (event.event_type === 'other') {
      updates.details = { custom: editValue.trim() || event.details?.custom || '' }
    } else if (event.event_type === 'weight') {
      const kg = parseFloat(editKg)
      if (!Number.isNaN(kg) && kg > 0) updates.details = { kg }
    } else {
      updates.details = { ...event.details }
      if (options && editOption) {
        updates.details.option = editOption
      }
      if (trimmedNote) {
        updates.details.note = trimmedNote
      } else {
        delete updates.details.note
      }
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
  const isLatestWeight = event.event_type === 'weight' && event.id === latestWeightId
  const colorClass = isLatestWeight
    ? 'bg-primary-500 border-primary-600 text-white'
    : (EVENT_COLORS[event.event_type] || EVENT_COLORS.other)

  const primaryText = getEventDetailsText(event)
  const showNoteLine = event.details?.note && event.details.note !== primaryText
  const showNoteField = event.event_type !== 'other' && event.event_type !== 'weight'

  return (
    <div className={`${colorClass} border-r-4 rounded-xl shadow-sm p-3 transition-all hover:shadow-md overflow-hidden min-w-0`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base leading-tight">{EVENT_TYPE_LABELS[event.event_type]}</h3>
          {!isEditing && (
            <>
              <p className="text-sm mt-0.5 opacity-90 flex items-center gap-1.5">
                {OptionIcon && <OptionIcon size={14} />}
                <span>{primaryText}</span>
              </p>
              {showNoteLine && (
                <p className="text-xs mt-0.5 opacity-70 italic truncate">{event.details.note}</p>
              )}
            </>
          )}
        </div>
        <div className="flex gap-1.5 mr-2 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors touch-manipulation"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors touch-manipulation"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="p-1.5 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all touch-manipulation"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all touch-manipulation"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2 mt-1.5 min-w-0 overflow-hidden">
          {event.event_type === 'other' && (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="תיאור האירוע"
              className="w-full min-w-0 px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 bg-white text-gray-800"
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
              className="w-full min-w-0 px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 bg-white text-gray-800"
              autoFocus
            />
          )}
          {editOptions && (
            <div className="flex flex-wrap gap-1.5">
              {editOptions.map((opt) => {
                const Icon = opt.icon
                const selected = editOption === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEditOption(opt.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                      selected ? 'bg-primary-500 text-white' : 'bg-white text-gray-700'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
          {showNoteField && (
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="הערה (אופציונלי)"
              className="w-full min-w-0 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 bg-white text-gray-800"
            />
          )}
          <DateTimeButton value={editTime} onChange={setEditTime} label="תאריך ושעת האירוע" />
        </div>
      ) : (
        <p className="text-xs opacity-75 mt-0.5">
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

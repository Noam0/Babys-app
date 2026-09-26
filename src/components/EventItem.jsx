import { useState } from 'react'
import { Edit2, Trash2, Check, X } from 'lucide-react'
import { formatEventTime, formatFullDate } from '../utils/dateUtils'

const EventItem = ({ event, onUpdate, onDelete, showFullDate = false }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(getEventDetailsText(event))

  const eventTypeLabels = {
    breastfeed: 'הנקה',
    diaper: 'החתלה',
    sleep: 'שינה',
    tummy: 'זמן בטן',
    medication: 'תרופות',
    other: 'אחר'
  }

  const eventColors = {
    breastfeed: 'bg-breastfeed-light border-breastfeed text-breastfeed-dark',
    diaper: 'bg-diaper-light border-diaper text-diaper-dark',
    sleep: 'bg-sleep-light border-sleep text-sleep-dark',
    tummy: 'bg-tummy-light border-tummy text-tummy-dark',
    medication: 'bg-medication-light border-medication text-medication-dark',
    other: 'bg-other-light border-other text-other-dark'
  }

  const handleSave = () => {
    const newDetails = event.event_type === 'other' 
      ? { custom: editValue }
      : { ...event.details, note: editValue }
    
    onUpdate(event.id, { details: newDetails })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
      onDelete(event.id)
    }
  }

  return (
    <div className={`${eventColors[event.event_type]} border-r-4 rounded-2xl shadow-md p-4 transition-all hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{eventTypeLabels[event.event_type]}</h3>
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full mt-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              autoFocus
            />
          ) : (
            <p className="text-sm mt-1 opacity-90">{getEventDetailsText(event)}</p>
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
                onClick={() => {
                  setIsEditing(false)
                  setEditValue(getEventDetailsText(event))
                }}
                className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors touch-manipulation"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
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
      <p className="text-xs opacity-75">
        {showFullDate ? formatFullDate(event.timestamp) : `שעה ${formatEventTime(event.timestamp)}`}
      </p>
    </div>
  )
}

function getEventDetailsText(event) {
  const details = event.details || {}
  
  const optionLabels = {
    // Breastfeed
    right: 'ימין',
    left: 'שמאל',
    both: 'שני הצדדים',
    // Diaper
    pee: 'פיפי',
    poop: 'קקי',
    // Sleep
    fell_asleep: 'נרדם',
    woke_up: 'התעורר',
    // Medication
    clexane_michal: 'קלקסן (מיכל)',
    vitamin_d_gefen: 'ויטמין די (גפן)'
  }

  // Special handling for tummy time with duration
  if (event.event_type === 'tummy' && details.duration) {
    const minutes = Math.floor(details.duration / 60)
    const seconds = details.duration % 60
    if (minutes > 0) {
      return `משך ${minutes} דקות ו-${seconds} שניות`
    }
    return `משך ${seconds} שניות`
  }

  if (details.custom) {
    return details.custom
  }
  
  if (details.option) {
    return optionLabels[details.option] || details.option
  }
  
  if (details.action) {
    return optionLabels[details.action] || details.action
  }

  if (details.note) {
    return details.note
  }

  return 'ללא פרטים'
}

export default EventItem

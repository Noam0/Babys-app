import { useState, useEffect } from 'react'
import { Baby, Package, Moon, Activity, Pill, Plus, Square } from 'lucide-react'
import ActionModal from './ActionModal'
import { ACTION_OPTIONS } from '../utils/eventOptions'

const TUMMY_START_KEY = 'gefenTummyStart'

const secondsSince = (isoTime) => Math.floor((Date.now() - new Date(isoTime)) / 1000)

const QuickActions = ({ onAddEvent }) => {
  const [activeModal, setActiveModal] = useState(null)
  const [tummyStartTime, setTummyStartTime] = useState(() => localStorage.getItem(TUMMY_START_KEY))
  const [tummyTimeSeconds, setTummyTimeSeconds] = useState(() =>
    tummyStartTime ? secondsSince(tummyStartTime) : 0
  )
  const tummyTimeRunning = Boolean(tummyStartTime)

  const actions = [
    {
      id: 'breastfeed',
      icon: Baby,
      label: 'הנקה',
      color: 'breastfeed',
      options: ACTION_OPTIONS.breastfeed
    },
    {
      id: 'diaper',
      icon: Package,
      label: 'החתלה',
      color: 'diaper',
      options: ACTION_OPTIONS.diaper
    },
    {
      id: 'sleep',
      icon: Moon,
      label: 'שינה',
      color: 'sleep',
      options: ACTION_OPTIONS.sleep
    },
    {
      id: 'tummy',
      icon: Activity,
      label: 'זמן בטן',
      color: 'tummy'
    },
    {
      id: 'medication',
      icon: Pill,
      label: 'תרופות',
      color: 'medication',
      options: ACTION_OPTIONS.medication
    },
    {
      id: 'other',
      icon: Plus,
      label: 'אחר',
      color: 'other',
      customInput: true
    }
  ]

  useEffect(() => {
    if (!tummyStartTime) return
    const interval = setInterval(() => {
      setTummyTimeSeconds(secondsSince(tummyStartTime))
    }, 1000)
    return () => clearInterval(interval)
  }, [tummyStartTime])

  const handleActionClick = async (action) => {
    if (action.id === 'tummy') {
      if (tummyTimeRunning) {
        const startTime = tummyStartTime
        localStorage.removeItem(TUMMY_START_KEY)
        setTummyStartTime(null)
        setTummyTimeSeconds(0)
        await onAddEvent('tummy', { duration: secondsSince(startTime) }, startTime)
      } else {
        const startTime = new Date().toISOString()
        localStorage.setItem(TUMMY_START_KEY, startTime)
        setTummyStartTime(startTime)
        setTummyTimeSeconds(0)
      }
    } else if (action.directAction) {
      // Other direct actions
      await onAddEvent(action.id, { action: 'started' })
    } else {
      // Open modal for sub-options
      setActiveModal(action.id)
    }
  }

  const formatTimerDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleModalSubmit = async (eventType, details) => {
    await onAddEvent(eventType, details)
    setActiveModal(null)
  }

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">פעולות מהירות</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {actions.map((action) => {
            const Icon = action.icon
            const bgColors = getColorClasses(action.color)
            const isTummyTime = action.id === 'tummy'
            const isTummyRunning = isTummyTime && tummyTimeRunning
            
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`${bgColors} 
                  hover:shadow-lg active:scale-95 transition-all duration-200 
                  rounded-xl p-4 flex flex-col items-center justify-center gap-2 
                  font-semibold shadow-md touch-manipulation
                  min-h-[88px] ${isTummyRunning ? 'ring-4 ring-white ring-offset-2' : ''}`}
              >
                {isTummyRunning ? (
                  <>
                    <Square size={24} strokeWidth={2} className="text-white drop-shadow-md" />
                    <span className="text-xl font-bold text-white drop-shadow-md">
                      {formatTimerDisplay(tummyTimeSeconds)}
                    </span>
                    <span className="text-[11px] text-white drop-shadow-md">לחץ לסיום</span>
                  </>
                ) : (
                  <>
                    <Icon size={26} strokeWidth={2} className="text-white drop-shadow-md" />
                    <span className="text-sm text-white drop-shadow-md">{action.label}</span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <ActionModal
          action={actions.find(a => a.id === activeModal)}
          onClose={() => setActiveModal(null)}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  )
}

// Helper function to get color classes
const getColorClasses = (color) => {
  const colorMap = {
    breastfeed: 'bg-gradient-to-br from-pink-200 to-pink-400',
    diaper: 'bg-gradient-to-br from-amber-200 to-amber-400',
    sleep: 'bg-gradient-to-br from-purple-300 to-purple-500',
    tummy: 'bg-gradient-to-br from-emerald-200 to-emerald-400',
    medication: 'bg-gradient-to-br from-red-200 to-red-400',
    other: 'bg-gradient-to-br from-indigo-300 to-indigo-500'
  }
  return colorMap[color] || colorMap.other
}

export default QuickActions

import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Droplets,
  Circle,
  Layers,
  Moon,
  Sun,
  Syringe
} from 'lucide-react'

export const EVENT_TYPE_LABELS = {
  breastfeed: 'הנקה',
  diaper: 'החתלה',
  sleep: 'שינה',
  tummy: 'זמן בטן',
  medication: 'תרופות',
  other: 'אחר',
  weight: 'משקל'
}

export const ACTION_OPTIONS = {
  breastfeed: [
    { label: 'ימין', value: 'right', icon: ArrowRight },
    { label: 'שמאל', value: 'left', icon: ArrowLeft },
    { label: 'שני הצדדים', value: 'both', icon: ArrowLeftRight }
  ],
  diaper: [
    { label: 'פיפי', value: 'pee', icon: Droplets },
    { label: 'קקי', value: 'poop', icon: Circle },
    { label: 'גם וגם', value: 'both', icon: Layers }
  ],
  sleep: [
    { label: 'נרדם', value: 'fell_asleep', icon: Moon },
    { label: 'התעורר', value: 'woke_up', icon: Sun }
  ],
  medication: [
    { label: 'קלקסן (מיכל)', value: 'clexane_michal', icon: Syringe },
    { label: 'ויטמין די (גפן)', value: 'vitamin_d_gefen', icon: Sun }
  ]
}

export const getOptionMeta = (eventType, value) =>
  ACTION_OPTIONS[eventType]?.find(option => option.value === value) || null

export const formatTummyDuration = (duration) => {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  if (minutes > 0) {
    return `משך ${minutes} דקות ו-${seconds} שניות`
  }
  return `משך ${seconds} שניות`
}

export const getEventDetailsText = (event) => {
  const details = event.details || {}

  if (event.event_type === 'weight' && details.kg != null) {
    return `${Number(details.kg).toFixed(2)} ק"ג`
  }

  if (event.event_type === 'tummy' && details.duration != null) {
    return formatTummyDuration(details.duration)
  }

  if (details.custom) return details.custom

  const option = getOptionMeta(event.event_type, details.option)
  if (option) return option.label

  if (details.note) return details.note

  return 'ללא פרטים'
}

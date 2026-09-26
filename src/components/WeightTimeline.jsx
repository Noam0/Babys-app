import { useState } from 'react'
import { Baby, Edit2, Trash2, Check, X } from 'lucide-react'
import { formatEventTime, formatShortDate } from '../utils/dateUtils'
import { DateTimeFields } from './DateTimeFields'
import ConfirmDialog from './ConfirmDialog'

const iconSize = (kg, min, max) => {
  if (max === min) return 28
  return 20 + ((kg - min) / (max - min)) * 22
}

const WeightTimeline = ({ events, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null)
  const [editKg, setEditKg] = useState('')
  const [editTime, setEditTime] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const points = [...events]
    .map((event) => ({ ...event, kg: Number(event.details?.kg) }))
    .filter((event) => !Number.isNaN(event.kg))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  if (points.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-gray-400 text-lg">אין עדכוני משקל עדיין</p>
      </div>
    )
  }

  const weights = points.map((point) => point.kg)
  const min = Math.min(...weights)
  const max = Math.max(...weights)

  const startEdit = (point) => {
    setEditingId(point.id)
    setEditKg(String(point.kg))
    setEditTime(new Date(point.timestamp))
  }

  const saveEdit = (point) => {
    const kg = parseFloat(editKg)
    if (Number.isNaN(kg) || kg <= 0 || !editTime) return
    onUpdate(point.id, { details: { kg }, timestamp: editTime.toISOString() })
    setEditingId(null)
  }

  return (
    <div className="bg-white rounded-3xl shadow-md p-5 overflow-hidden">
      <p className="text-sm text-gray-500 mb-5 text-center">הציר עולה מלמטה למעלה לפי תאריך העדכון</p>
      <div className="relative">
        <div className="absolute top-3 bottom-3 right-[27px] w-0.5 bg-gradient-to-t from-primary-100 via-primary-300 to-primary-500" />
        <div className="flex flex-col-reverse gap-6">
          {points.map((point, index) => {
            const size = iconSize(point.kg, min, max)
            const isLatest = index === points.length - 1
            const isEditing = editingId === point.id
            return (
              <div key={point.id} className="relative min-w-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`relative z-10 shrink-0 rounded-full flex items-center justify-center shadow-md ${
                      isLatest ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600'
                    }`}
                    style={{ width: size + 14, height: size + 14 }}
                  >
                    <Baby size={size} />
                  </div>
                  <div className="flex-1 min-w-0 bg-primary-50 rounded-2xl px-3 py-2 overflow-hidden">
                    <p className="font-bold text-primary-800">{point.kg.toFixed(2)} ק"ג</p>
                    <p className="text-xs text-gray-500">
                      {formatShortDate(point.timestamp)} · {formatEventTime(point.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(point)} className="p-2 bg-green-500 text-white rounded-lg">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-gray-300 text-gray-700 rounded-lg">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(point)} className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(point)} className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-2 mr-14 min-w-0 overflow-hidden space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={editKg}
                      onChange={(e) => setEditKg(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 border-2 border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-primary-500"
                    />
                    <DateTimeFields value={editTime} onChange={setEditTime} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="מחיקת משקל"
          message="למחוק את עדכון המשקל? הפעולה הזאת לא ניתנת לביטול."
          onConfirm={() => {
            onDelete(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default WeightTimeline

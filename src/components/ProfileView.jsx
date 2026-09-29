import { useState } from 'react'
import { Plus, Edit2, Trash2, Check, X, Calendar, LogOut } from 'lucide-react'
import BabyAvatar from './BabyAvatar'
import ConfirmDialog from './ConfirmDialog'
import { formatBirthString } from '../utils/dateUtils'
import { DateField, DateTimeButton } from './DateTimeFields'

const EMPTY_FORM = { title: '', date: '', details: '' }

const ID_TITLE = 'תעודת זהות'

const CATEGORIES = [
  { label: 'תורים קרובים', icon: '📅' },
  { label: 'פנקס חיסונים', icon: '💉' },
  { label: 'אלרגיות', icon: '⚠️' },
  { label: 'תרופות קבועות', icon: '💊' },
  { label: 'רופא ילדים', icon: '👨‍⚕️' },
  { label: 'אחר', icon: '📝' }
]

const formatDate = (dateString) =>
  dateString ? new Date(dateString).toLocaleDateString('he-IL') : ''

const ProfileView = ({ family, photo, onUpdateFamily, items, onAdd, onUpdate, onDelete, userEmail, onSignOut }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [isEditingBaby, setIsEditingBaby] = useState(false)
  const [babyForm, setBabyForm] = useState({ name: '', birth: '' })
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isEditingId, setIsEditingId] = useState(false)
  const [idDraft, setIdDraft] = useState('')

  const startBabyEdit = () => {
    setBabyForm({ name: family.baby_name, birth: new Date(family.birth_datetime) })
    setIsEditingBaby(true)
  }

  const handleBabySave = async () => {
    if (!babyForm.name.trim() || !babyForm.birth) return
    await onUpdateFamily({
      baby_name: babyForm.name.trim(),
      birth_datetime: babyForm.birth.toISOString()
    })
    setIsEditingBaby(false)
  }

  const idItem = items.find((item) => item.title === ID_TITLE)
  const otherItems = items.filter((item) => item.title !== ID_TITLE)

  const startIdEdit = () => {
    setIdDraft(idItem?.details || '')
    setIsEditingId(true)
  }

  const saveIdDocument = async () => {
    const details = idDraft.trim()
    if (idItem) {
      await onUpdate(idItem.id, { title: ID_TITLE, date: idItem.date, details })
    } else if (details) {
      await onAdd({ title: ID_TITLE, date: null, details })
    }
    setIsEditingId(false)
  }

  const isValid = formData.title.trim() && formData.details.trim()

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!isValid) return
    const values = {
      title: formData.title.trim(),
      date: formData.date || null,
      details: formData.details.trim()
    }
    if (values.title === ID_TITLE) {
      if (idItem && idItem.id !== editingId) {
        await onUpdate(idItem.id, values)
        if (editingId) await onDelete(editingId)
      } else if (editingId) {
        await onUpdate(editingId, values)
      } else {
        await onAdd(values)
      }
    } else if (editingId) {
      await onUpdate(editingId, values)
    } else {
      await onAdd(values)
    }
    resetForm()
  }

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      date: item.date || '',
      details: item.details
    })
    setEditingId(item.id)
    setIsAdding(true)
  }

  const handleDelete = (id) => {
    setItemToDelete(id)
  }

  return (
    <div className="pb-6">
      {/* Header with Photo */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-3 mt-3">
        <div className="flex items-center gap-3">
          <BabyAvatar photo={photo} name={family.baby_name} className="w-16 h-16 text-2xl" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{family.baby_name}</h1>
            <p className="text-sm text-gray-500">{formatBirthString(family.birth_datetime)}</p>
          </div>
          {!isEditingBaby && (
            <button
              onClick={startBabyEdit}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {isEditingBaby && (
          <div className="mt-4 space-y-3 min-w-0 overflow-hidden">
            <input
              type="text"
              value={babyForm.name}
              onChange={(e) => setBabyForm({ ...babyForm, name: e.target.value })}
              placeholder="שם התינוק"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
            />
            <DateTimeButton
              label="תאריך ושעת לידה"
              value={babyForm.birth}
              onChange={(birth) => setBabyForm({ ...babyForm, birth })}
            />
            <div className="flex gap-2">
              <button
                onClick={handleBabySave}
                className="flex-1 py-2 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 active:scale-95 transition-all"
              >
                שמור
              </button>
              <button
                onClick={() => setIsEditingBaby(false)}
                className="flex-1 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ID document */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-base font-bold text-gray-800">תעודת זהות</h2>
          {!isEditingId && (
            <button
              onClick={startIdEdit}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
        {isEditingId ? (
          <div className="space-y-2">
            <textarea
              value={idDraft}
              onChange={(e) => setIdDraft(e.target.value)}
              placeholder="טקסט חופשי: מספר זהות, שם מלא, פרטים נוספים..."
              rows={4}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 resize-none text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={saveIdDocument}
                className="flex-1 py-2 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 active:scale-95 transition-all"
              >
                שמור
              </button>
              <button
                onClick={() => setIsEditingId(false)}
                className="flex-1 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm whitespace-pre-wrap ${idItem?.details?.trim() ? 'text-gray-700' : 'text-gray-400'}`}>
            {idItem?.details?.trim() || 'לא הוזן'}
          </p>
        )}
      </div>

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>הוסף פריט חדש</span>
        </button>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            {editingId ? 'ערוך פריט' : 'פריט חדש'}
          </h3>

          {/* Quick Category Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קטגוריה מהירה (לחץ לבחירה)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setFormData({ ...formData, title: cat.label })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.title === cat.label
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כותרת *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="לדוגמה: אלרגיה לחלבון, תור לרופא..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Date (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תאריך (אופציונאלי)
            </label>
            <DateField
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
            />
          </div>

          {/* Details */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פירוט *
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="הזן פרטים מלאים כאן..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check size={20} />
              <span>{editingId ? 'עדכן' : 'שמור'}</span>
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-3 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <X size={20} />
              <span>ביטול</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Items List */}
      <div className="space-y-3">
        {otherItems.length === 0 ? null : (
          otherItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {item.title}
                  </h3>
                  {item.date && (
                    <div className="flex items-center gap-1 text-sm text-primary-600 mb-2">
                      <Calendar size={14} />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  )}
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {item.details}
                  </p>
                </div>
                <div className="flex gap-2 mr-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Account */}
      {onSignOut && (
        <div className="mt-8 text-center">
          {userEmail && <p className="text-xs text-gray-400 mb-2" dir="ltr">{userEmail}</p>}
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <LogOut size={16} />
            <span>התנתקות</span>
          </button>
        </div>
      )}

      {itemToDelete && (
        <ConfirmDialog
          title="מחיקת פריט"
          message="למחוק את הפריט מהפרופיל? הפעולה הזאת לא ניתנת לביטול."
          onConfirm={() => {
            onDelete(itemToDelete)
            setItemToDelete(null)
          }}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  )
}

export default ProfileView

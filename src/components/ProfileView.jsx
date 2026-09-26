import { useState } from 'react'
import { Plus, Edit2, Trash2, Check, X, Calendar, LogOut, Copy } from 'lucide-react'
import BabyAvatar from './BabyAvatar'
import ConfirmDialog from './ConfirmDialog'
import { formatBirthString } from '../utils/dateUtils'
import { DateField, DateTimeFields } from './DateTimeFields'

const EMPTY_FORM = { title: '', date: '', details: '' }

const CATEGORIES = [
  { label: 'תעודת זהות', icon: '🆔' },
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
  const [codeCopied, setCodeCopied] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

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

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(family.invite_code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      // Clipboard is unavailable outside HTTPS; the code stays visible for manual copying
    }
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
    if (editingId) {
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
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-4 mt-4">
        <div className="flex items-center gap-4">
          <BabyAvatar photo={photo} name={family.baby_name} className="w-20 h-20 text-3xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">פרופיל - {family.baby_name}</h1>
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
            <DateTimeFields
              label=""
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

      {/* Invite Code */}
      <div className="bg-white rounded-3xl shadow-lg p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">קוד הצטרפות למשפחה</p>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-center text-2xl font-mono font-bold tracking-widest text-primary-700 bg-primary-50 rounded-xl py-2" dir="ltr">
            {family.invite_code}
          </span>
          <button
            onClick={copyInviteCode}
            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:scale-95 transition-all"
          >
            {codeCopied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          שלחו את הקוד להורה השני: נרשמים לאפליקציה, בוחרים "הצטרפות" ומזינים את הקוד.
        </p>
      </div>

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={24} />
          <span>הוסף פריט חדש</span>
        </button>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
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
              placeholder="לדוגמה: תעודת זהות, אלרגיה לחלבון..."
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
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-gray-400 text-lg">אין פריטים בפרופיל</p>
            <p className="text-gray-300 text-sm mt-2">
              לחץ על "הוסף פריט חדש" להתחיל
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-all"
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

import { useState, useEffect } from 'react'
import { Edit2, Check, Camera } from 'lucide-react'
import { formatAgeString, formatBirthString } from '../utils/dateUtils'
import BabyAvatar from './BabyAvatar'

const Header = ({ babyName, birthDatetime, weight, photo, onSaveWeight, onSavePhotoUrl, onSavePhotoFile }) => {
  const [age, setAge] = useState(() => formatAgeString(birthDatetime))
  const [isEditingWeight, setIsEditingWeight] = useState(false)
  const [tempWeight, setTempWeight] = useState('')
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setAge(formatAgeString(birthDatetime))
    const interval = setInterval(() => {
      setAge(formatAgeString(birthDatetime))
    }, 60000)

    return () => clearInterval(interval)
  }, [birthDatetime])

  const startWeightEdit = () => {
    setTempWeight(weight != null ? String(weight) : '')
    setIsEditingWeight(true)
  }

  const handleWeightSave = async () => {
    const kg = parseFloat(tempWeight)
    if (!Number.isNaN(kg) && kg > 0) {
      await onSaveWeight(kg)
    }
    setIsEditingWeight(false)
  }

  const closePhotoModal = () => {
    setIsEditingPhoto(false)
    setPhotoUrl('')
  }

  const handlePhotoSave = async () => {
    if (photoUrl.trim()) {
      await onSavePhotoUrl(photoUrl.trim())
      closePhotoModal()
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await onSavePhotoFile(file)
    setUploading(false)
    closePhotoModal()
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 mt-4">
      {/* Baby Photo */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <BabyAvatar photo={photo} name={babyName} className="w-28 h-28 text-5xl" />
          <button
            onClick={() => setIsEditingPhoto(true)}
            className="absolute bottom-0 left-0 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 active:scale-95 transition-all"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      {/* Photo Edit Modal */}
      {isEditingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">הוסף תמונה</h3>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                העלה תמונה מהמכשיר
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
              />
              {uploading && <p className="text-sm text-primary-600 mt-2">מעלה תמונה...</p>}
            </div>

            {/* Or URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                או הדבק קישור לתמונה
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePhotoSave}
                disabled={!photoUrl.trim()}
                className={`flex-1 py-3 rounded-xl font-bold transition-all
                  ${photoUrl.trim()
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                שמור קישור
              </button>
              <button
                onClick={closePhotoModal}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        {babyName}
      </h1>

      {/* Age Display */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500 mb-1">גיל</p>
        <p className="text-lg font-semibold text-primary-600">{age}</p>
      </div>

      {/* Weight Display */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">משקל נוכחי</p>
          {isEditingWeight ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={tempWeight}
                inputMode="decimal"
                onChange={(e) => setTempWeight(e.target.value)}
                className="w-24 px-3 py-1 border-2 border-primary-300 rounded-lg text-xl font-bold text-primary-700 focus:outline-none focus:border-primary-500"
                autoFocus
              />
              <span className="text-xl font-bold text-primary-700">ק"ג</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-primary-700">
              {weight != null ? `${Number(weight).toFixed(2)} ק"ג` : 'לא הוזן'}
            </p>
          )}
        </div>
        <button
          onClick={() => isEditingWeight ? handleWeightSave() : startWeightEdit()}
          className="bg-primary-500 text-white p-3 rounded-full shadow-md hover:bg-primary-600 active:scale-95 transition-all touch-manipulation"
        >
          {isEditingWeight ? <Check size={20} /> : <Edit2 size={20} />}
        </button>
      </div>

      {/* Birthdate Info */}
      <div className="text-center mt-4 text-xs text-gray-500">
        {formatBirthString(birthDatetime)}
      </div>
    </div>
  )
}

export default Header
